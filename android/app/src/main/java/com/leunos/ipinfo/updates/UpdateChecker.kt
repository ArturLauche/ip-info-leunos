package com.leunos.ipinfo.updates

import com.leunos.ipinfo.updates.http.HttpRequest
import com.leunos.ipinfo.updates.http.HttpTransport
import java.io.IOException

/** What the running app looks like, as far as the updater is concerned. */
data class InstalledApp(val packageName: String, val versionCode: Long, val versionName: String?)

/** A release that passed every metadata check and is ready to be downloaded. */
data class UpdateCandidate(
    val metadata: UpdateMetadata,
    val rawMetadata: String,
    val releaseNotes: String?,
    val releaseUrl: String,
    val publishedAt: String?,
)

enum class InvalidReason {
    MALFORMED_METADATA,
    WRONG_APPLICATION_ID,
    TAG_MISMATCH,
    ASSET_MISSING,
    URL_MISMATCH,
    SIZE_MISMATCH,
    DIGEST_MISMATCH,
    CERTIFICATE_NOT_PINNED,
}

sealed interface Validation {
    data class Valid(val candidate: UpdateCandidate) : Validation
    data class NotNewer(val version: AppVersion) : Validation
    data class RequiresNewerAndroid(val version: AppVersion, val minSdk: Int) : Validation
    data class Invalid(val reason: InvalidReason, val detail: String) : Validation
}

/**
 * Cross-checks `android-update.json` against the GitHub release it came from and against the
 * installed app. Anything inconsistent is rejected, so metadata can never steer the updater to an
 * arbitrary download URL, package or version.
 */
class CandidateValidator(
    private val installed: InstalledApp,
    private val deviceSdkInt: Int,
    private val pinnedCertificates: Set<String>,
) {
    fun validate(release: GitHubRelease, metadataText: String): Validation {
        val metadata = try {
            UpdateMetadataParser.parse(metadataText)
        } catch (e: MetadataException) {
            return Validation.Invalid(InvalidReason.MALFORMED_METADATA, e.message.orEmpty())
        }
        val version = metadata.version

        if (metadata.applicationId != installed.packageName) {
            return Validation.Invalid(InvalidReason.WRONG_APPLICATION_ID, "metadata is for ${metadata.applicationId}")
        }
        if (metadata.tag != release.tagName) {
            return Validation.Invalid(InvalidReason.TAG_MISMATCH, "metadata tag ${metadata.tag} != release tag ${release.tagName}")
        }

        // Never trust URLs from metadata: they must equal the ones the contract derives from the version.
        if (metadata.apkFileName != ReleaseContract.apkAssetName(version) ||
            metadata.apkDownloadUrl != ReleaseContract.apkDownloadUrl(version) ||
            metadata.releaseNotesUrl != ReleaseContract.releasePageUrl(version)
        ) {
            return Validation.Invalid(InvalidReason.URL_MISMATCH, "metadata URLs do not match the release contract")
        }

        val apkAsset = release.asset(metadata.apkFileName)
            ?: return Validation.Invalid(InvalidReason.ASSET_MISSING, "release has no ${metadata.apkFileName}")
        if (apkAsset.downloadUrl != metadata.apkDownloadUrl) {
            return Validation.Invalid(InvalidReason.URL_MISMATCH, "asset URL differs from metadata")
        }
        if (apkAsset.size != metadata.apkSizeBytes) {
            return Validation.Invalid(InvalidReason.SIZE_MISMATCH, "asset size ${apkAsset.size} != ${metadata.apkSizeBytes}")
        }
        apkAsset.digest?.let { digest ->
            if (digest.startsWith("sha256:") && digest.removePrefix("sha256:") != metadata.apkSha256) {
                return Validation.Invalid(InvalidReason.DIGEST_MISMATCH, "GitHub digest differs from metadata")
            }
        }

        if (pinnedCertificates.isNotEmpty() && metadata.signingCertSha256 !in pinnedCertificates) {
            return Validation.Invalid(InvalidReason.CERTIFICATE_NOT_PINNED, "signing certificate is not a pinned identity")
        }

        if (metadata.versionCode.toLong() <= installed.versionCode) return Validation.NotNewer(version)
        if (metadata.minSdk > deviceSdkInt) return Validation.RequiresNewerAndroid(version, metadata.minSdk)

        return Validation.Valid(
            UpdateCandidate(
                metadata = metadata,
                rawMetadata = metadataText,
                releaseNotes = release.body,
                releaseUrl = ReleaseContract.releasePageUrl(version),
                publishedAt = release.publishedAt,
            ),
        )
    }
}

sealed interface UpdateError {
    data class Network(val detail: String? = null) : UpdateError
    data class RateLimited(val retryAtMillis: Long) : UpdateError
    data class Server(val status: Int?) : UpdateError
    data class InvalidRelease(val detail: String) : UpdateError
    data class InvalidMetadata(val reason: InvalidReason, val detail: String) : UpdateError

    /** Worth retrying later (transient). Invalid data is not. */
    val retryable: Boolean get() = this is Network || this is Server
}

sealed interface CheckOutcome {
    data class UpToDate(val newestStable: AppVersion?) : CheckOutcome
    data class Available(val candidate: UpdateCandidate) : CheckOutcome

    /** A newer release exists but needs a newer Android version than this device runs. */
    data class UnsupportedDevice(val version: AppVersion, val minSdk: Int) : CheckOutcome
    data class Failed(val error: UpdateError) : CheckOutcome
}

/** Discovers the newest valid, stable Android release that is newer than the installed app. */
class UpdateChecker(
    private val releases: GitHubReleaseService,
    private val transport: HttpTransport,
    private val validator: CandidateValidator,
    private val installed: InstalledApp,
) {
    fun check(): CheckOutcome {
        val json = when (val result = releases.fetch()) {
            is ReleasesResult.Body -> result.json
            is ReleasesResult.RateLimited -> return CheckOutcome.Failed(UpdateError.RateLimited(result.retryAtMillis))
            is ReleasesResult.Unavailable -> return CheckOutcome.Failed(
                when (result.kind) {
                    UnavailableKind.NETWORK -> UpdateError.Network()
                    UnavailableKind.SERVER -> UpdateError.Server(result.status)
                    else -> UpdateError.InvalidRelease("GitHub answered ${result.status ?: result.kind}")
                },
            )
        }

        val parsed = try {
            GitHubReleasesParser.parse(json)
        } catch (e: MetadataException) {
            return CheckOutcome.Failed(UpdateError.InvalidRelease(e.message.orEmpty()))
        }

        val stable = ReleaseSelector.stableReleases(parsed.releases)
        val newest = stable.firstOrNull() ?: return CheckOutcome.UpToDate(null)

        var invalid: UpdateError.InvalidMetadata? = null
        var unsupported: CheckOutcome.UnsupportedDevice? = null
        for (entry in stable) {
            if (entry.version.versionCode.toLong() <= installed.versionCode) break

            val text = try {
                fetchMetadata(entry)
            } catch (e: IOException) {
                return CheckOutcome.Failed(UpdateError.Network(e.message))
            }
            if (text == null) {
                if (invalid == null) {
                    invalid = UpdateError.InvalidMetadata(InvalidReason.ASSET_MISSING, "metadata asset unavailable for ${entry.version}")
                }
                continue
            }

            when (val validation = validator.validate(entry.release, text)) {
                is Validation.Valid -> return CheckOutcome.Available(validation.candidate)
                is Validation.NotNewer -> break
                is Validation.RequiresNewerAndroid ->
                    if (unsupported == null) unsupported = CheckOutcome.UnsupportedDevice(validation.version, validation.minSdk)
                is Validation.Invalid -> if (invalid == null) invalid = UpdateError.InvalidMetadata(validation.reason, validation.detail)
            }
        }

        invalid?.let { return CheckOutcome.Failed(it) }
        unsupported?.let { return it }
        return CheckOutcome.UpToDate(newest.version)
    }

    /** Returns the metadata text, or null when the asset is missing (404). */
    @Throws(IOException::class)
    private fun fetchMetadata(entry: StableRelease): String? {
        val url = ReleaseContract.metadataDownloadUrl(entry.version)
        transport.execute(HttpRequest(url, mapOf("Accept" to "application/octet-stream"))).use { response ->
            return when {
                response.status == 200 -> response.readText(UpdateMetadataParser.MAX_BYTES)
                response.status == 404 -> null
                response.status in 500..599 -> throw IOException("HTTP ${response.status} while fetching metadata")
                else -> null
            }
        }
    }
}
