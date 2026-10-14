package com.leunos.ipinfo.updates

import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.time.Instant

data class GitHubAsset(
    val name: String,
    val size: Long,
    val state: String?,
    val downloadUrl: String,
    /** GitHub-computed digest such as `sha256:<hex>`; absent on older releases. */
    val digest: String?,
)

data class GitHubRelease(
    val tagName: String,
    val name: String?,
    val draft: Boolean,
    val prerelease: Boolean,
    val publishedAt: String?,
    val htmlUrl: String,
    val body: String?,
    val assets: List<GitHubAsset>,
) {
    fun asset(name: String): GitHubAsset? = assets.firstOrNull { it.name == name }
}

data class ParsedReleases(val releases: List<GitHubRelease>, val skipped: Int)

/** Tolerant parser for the GitHub Releases API: malformed entries are skipped, never trusted. */
object GitHubReleasesParser {
    const val MAX_NOTES_CHARS = 4_000

    fun parse(json: String): ParsedReleases {
        val array = try {
            JSONArray(json)
        } catch (e: JSONException) {
            throw MetadataException("releases response is not a JSON array")
        }
        val releases = ArrayList<GitHubRelease>(array.length())
        var skipped = 0
        for (index in 0 until array.length()) {
            val item = array.opt(index) as? JSONObject
            val release = item?.let { runCatching { parseRelease(it) }.getOrNull() }
            if (release == null) skipped++ else releases += release
        }
        return ParsedReleases(releases, skipped)
    }

    private fun parseRelease(json: JSONObject): GitHubRelease {
        val fields = Fields(json, "")
        val assetsJson = json.opt("assets") as? org.json.JSONArray ?: throw MetadataException("assets missing")
        val assets = ArrayList<GitHubAsset>(assetsJson.length())
        for (i in 0 until assetsJson.length()) {
            val asset = assetsJson.opt(i) as? JSONObject ?: continue
            val a = Fields(asset, "")
            val name = runCatching { a.string("name") }.getOrNull() ?: continue
            val size = runCatching { a.long("size") }.getOrNull() ?: continue
            val url = runCatching { a.string("browser_download_url") }.getOrNull() ?: continue
            assets += GitHubAsset(
                name = name,
                size = size,
                state = runCatching { a.optionalString("state") }.getOrNull(),
                downloadUrl = url,
                digest = runCatching { a.optionalString("digest") }.getOrNull(),
            )
        }
        return GitHubRelease(
            tagName = fields.string("tag_name"),
            name = runCatching { fields.optionalString("name") }.getOrNull(),
            draft = fields.boolean("draft"),
            prerelease = fields.boolean("prerelease"),
            publishedAt = runCatching { fields.optionalString("published_at") }.getOrNull(),
            htmlUrl = fields.string("html_url"),
            body = runCatching { fields.optionalString("body") }.getOrNull()?.let(::sanitizeNotes),
            assets = assets,
        )
    }

    /** Release notes are untrusted text: strip control characters and bound the length. */
    internal fun sanitizeNotes(raw: String): String {
        val cleaned = raw.filter { it == '\n' || it == '\t' || it >= ' ' }.trim()
        return if (cleaned.length <= MAX_NOTES_CHARS) cleaned else cleaned.take(MAX_NOTES_CHARS).trimEnd() + "…"
    }
}

data class StableRelease(val version: AppVersion, val release: GitHubRelease)

object ReleaseSelector {
    /**
     * Published, stable Android releases only, newest first. Website releases, drafts, pre-releases,
     * releases without a publication date and releases missing the metadata or APK asset are ignored,
     * so a partially uploaded release is never advertised.
     */
    fun stableReleases(releases: List<GitHubRelease>): List<StableRelease> =
        releases.mapNotNull { release ->
            val version = ReleaseContract.parseTag(release.tagName) ?: return@mapNotNull null
            if (release.draft || release.prerelease) return@mapNotNull null
            val published = release.publishedAt ?: return@mapNotNull null
            if (runCatching { Instant.parse(published) }.isFailure) return@mapNotNull null
            val metadataAsset = release.asset(ReleaseContract.METADATA_ASSET_NAME) ?: return@mapNotNull null
            val apkAsset = release.asset(ReleaseContract.apkAssetName(version)) ?: return@mapNotNull null
            if (!metadataAsset.isUploaded() || !apkAsset.isUploaded()) return@mapNotNull null
            StableRelease(version, release)
        }.sortedByDescending { it.version }

    private fun GitHubAsset.isUploaded(): Boolean = state == null || state == "uploaded"
}
