package com.leunos.ipinfo.updates

import com.leunos.ipinfo.updates.FakeTransport.Companion.response
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException

/** End-to-end discovery scenarios with a scripted GitHub. */
class UpdateCheckerTest {
    private val installed = InstalledApp(Fixtures.appId, AppVersion(1, 0, 0).versionCode.toLong(), "1.0.0")

    private class Scripted(
        val releasesJson: String,
        val metadata: Map<String, String> = emptyMap(),
        val metadataStatus: Int = 200,
        val releasesResponse: () -> com.leunos.ipinfo.updates.http.HttpResponse = { response(200, releasesJson) },
    )

    private fun checker(script: Scripted, sdk: Int = 34, pins: Set<String> = emptySet()): Pair<UpdateChecker, FakeTransport> {
        val transport = FakeTransport { request ->
            when {
                request.url == ReleaseContract.RELEASES_API_URL -> script.releasesResponse()
                request.url.endsWith("/android-update.json") -> {
                    val body = script.metadata[request.url.substringAfter("/download/").substringBefore('/')]
                    if (script.metadataStatus != 200 || body == null) response(script.metadataStatus.takeIf { it != 200 } ?: 404) else response(200, body)
                }
                else -> response(404)
            }
        }
        val validator = CandidateValidator(installed, sdk, pins)
        return UpdateChecker(GitHubReleaseService(transport, MemoryReleasesCache(), FixedClock()), transport, validator, installed) to transport
    }

    private fun releases(vararg versions: String) = Fixtures.releasesJson(*versions.map { Fixtures.releaseMap("android-v$it") }.toTypedArray())
    private fun metadataFor(vararg versions: String) = versions.associate { "android-v$it" to Fixtures.metadataJson(it) }

    @Test
    fun noUpdateAvailableWhenInstalledVersionIsNewest() {
        val (checker, transport) = checker(Scripted(releases("1.0.0"), metadataFor("1.0.0")))
        assertEquals(CheckOutcome.UpToDate(AppVersion(1, 0, 0)), checker.check())
        assertTrue("no metadata download needed", transport.requests.none { it.url.endsWith("android-update.json") })
    }

    @Test
    fun emptyReleaseListMeansUpToDate() {
        val (checker, _) = checker(Scripted("[]"))
        assertEquals(CheckOutcome.UpToDate(null), checker.check())
    }

    @Test
    fun newerStableReleaseIsOffered() {
        val (checker, _) = checker(Scripted(releases("1.0.0", "1.1.0", "1.0.5"), metadataFor("1.0.0", "1.1.0", "1.0.5")))
        val outcome = checker.check() as CheckOutcome.Available
        assertEquals("1.1.0", outcome.candidate.metadata.versionName)
        assertEquals("Release notes", outcome.candidate.releaseNotes)
    }

    @Test
    fun newerPrereleaseAndDraftAreIgnored() {
        val json = Fixtures.releasesJson(
            Fixtures.releaseMap("android-v2.0.0", prerelease = true),
            Fixtures.releaseMap("android-v1.9.0", draft = true),
            Fixtures.releaseMap("android-v1.0.0"),
        )
        val (checker, transport) = checker(Scripted(json, metadataFor("2.0.0", "1.9.0", "1.0.0")))
        assertEquals(CheckOutcome.UpToDate(AppVersion(1, 0, 0)), checker.check())
        assertTrue(transport.requests.none { it.url.contains("2.0.0") || it.url.contains("1.9.0") })
    }

    @Test
    fun websiteReleasesAreNeverConsidered() {
        val json = Fixtures.releasesJson(
            Fixtures.releaseMap("v9.9.9", assets = emptyList()),
            Fixtures.releaseMap("android-v1.0.0"),
        )
        val (checker, _) = checker(Scripted(json))
        assertEquals(CheckOutcome.UpToDate(AppVersion(1, 0, 0)), checker.check())
    }

    @Test
    fun malformedMetadataFailsTheCheckWithoutOfferingAnything() {
        val (checker, _) = checker(Scripted(releases("1.1.0"), mapOf("android-v1.1.0" to "{ not json")))
        val outcome = checker.check() as CheckOutcome.Failed
        assertTrue((outcome.error as UpdateError.InvalidMetadata).reason == InvalidReason.MALFORMED_METADATA)
        assertEquals(false, outcome.error.retryable)
    }

    @Test
    fun fallsBackToTheNextValidReleaseWhenTheNewestIsBroken() {
        val broken = Fixtures.json(Fixtures.mutate(Fixtures.metadataMap("1.2.0"), listOf("apk", "sha256"), "nothex"))
        val (checker, _) = checker(Scripted(releases("1.2.0", "1.1.0"), mapOf("android-v1.2.0" to broken, "android-v1.1.0" to Fixtures.metadataJson("1.1.0"))))
        val outcome = checker.check() as CheckOutcome.Available
        assertEquals("1.1.0", outcome.candidate.metadata.versionName)
    }

    @Test
    fun githubUnavailableIsARetryableNetworkFailure() {
        val transport = FakeTransport.failing()
        val checker = UpdateChecker(GitHubReleaseService(transport, MemoryReleasesCache(), FixedClock()), transport, CandidateValidator(installed, 34, emptySet()), installed)
        val error = (checker.check() as CheckOutcome.Failed).error
        assertTrue(error is UpdateError.Network)
        assertTrue(error.retryable)
    }

    @Test
    fun serverErrorsAreRetryable() {
        val (checker, _) = checker(Scripted("", releasesResponse = { response(502) }))
        val error = (checker.check() as CheckOutcome.Failed).error
        assertEquals(UpdateError.Server(502), error)
        assertTrue(error.retryable)
    }

    @Test
    fun rateLimitingSurfacesTheRetryTime() {
        val reset = (FixedClock().now / 1000) + 900
        val (checker, _) = checker(
            Scripted("", releasesResponse = { response(403, "{}", mapOf("x-ratelimit-remaining" to "0", "x-ratelimit-reset" to reset.toString())) }),
        )
        val error = (checker.check() as CheckOutcome.Failed).error as UpdateError.RateLimited
        assertEquals(reset * 1000, error.retryAtMillis)
    }

    @Test
    fun garbageReleaseResponsesAreInvalidNotCrashes() {
        val (checker, _) = checker(Scripted("{\"message\":\"nope\"}"))
        assertTrue((checker.check() as CheckOutcome.Failed).error is UpdateError.InvalidRelease)
    }

    @Test
    fun metadataServerErrorsAreRetryableNetworkFailures() {
        val (checker, _) = checker(Scripted(releases("1.1.0"), metadataFor("1.1.0"), metadataStatus = 503))
        assertTrue(((checker.check() as CheckOutcome.Failed).error).retryable)
    }

    @Test
    fun throttledMetadataRequestsAreRetryableAndNotReportedAsAMissingAsset() {
        for (status in listOf(403, 408, 429)) {
            val (checker, _) = checker(Scripted(releases("1.1.0"), metadataFor("1.1.0"), metadataStatus = status))
            val error = (checker.check() as CheckOutcome.Failed).error
            assertTrue("HTTP $status", error is UpdateError.Network && error.retryable)
        }
    }

    @Test
    fun metadataAndApkDownloadsTreatTheSameStatusesAsTransient() {
        for (status in 400..599) {
            if (status == 404) continue
            val (checker, _) = checker(Scripted(releases("1.1.0"), metadataFor("1.1.0"), metadataStatus = status))
            val error = (checker.check() as CheckOutcome.Failed).error
            assertEquals("HTTP $status", isTransientHttpStatus(status), error is UpdateError.Network)
            assertEquals("HTTP $status", classifyDownloadStatus(status).retryable, error is UpdateError.Network)
            if (error is UpdateError.InvalidMetadata) assertEquals("HTTP $status", InvalidReason.ASSET_MISSING, error.reason)
        }
    }

    @Test
    fun aMissingMetadataAssetIsInvalidMetadataNotANetworkFailure() {
        val (checker, _) = checker(Scripted(releases("1.1.0"), emptyMap()))
        val error = (checker.check() as CheckOutcome.Failed).error as UpdateError.InvalidMetadata
        assertEquals(InvalidReason.ASSET_MISSING, error.reason)
    }

    @Test
    fun devicesBelowTheMinimumSdkGetAnExplicitOutcome() {
        val (checker, _) = checker(Scripted(releases("1.1.0"), metadataFor("1.1.0")), sdk = 28)
        assertEquals(CheckOutcome.UnsupportedDevice(AppVersion(1, 1, 0), 29), checker.check())
    }

    @Test
    fun releaseSignedForAnotherPinnedIdentityIsRejected() {
        val (checker, _) = checker(Scripted(releases("1.1.0"), metadataFor("1.1.0")), pins = setOf(Fixtures.CERT_B))
        val error = (checker.check() as CheckOutcome.Failed).error as UpdateError.InvalidMetadata
        assertEquals(InvalidReason.CERTIFICATE_NOT_PINNED, error.reason)
    }

    @Test
    fun ioFailuresWhileReadingMetadataAreNetworkFailures() {
        val transport = FakeTransport { request ->
            if (request.url == ReleaseContract.RELEASES_API_URL) response(200, releases("1.1.0")) else throw IOException("reset")
        }
        val checker = UpdateChecker(GitHubReleaseService(transport, MemoryReleasesCache(), FixedClock()), transport, CandidateValidator(installed, 34, emptySet()), installed)
        assertTrue(((checker.check() as CheckOutcome.Failed).error) is UpdateError.Network)
    }
}
