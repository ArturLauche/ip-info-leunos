package com.leunos.ipinfo.updates

import com.leunos.ipinfo.updates.http.HttpRequest
import com.leunos.ipinfo.updates.http.HttpResponse
import com.leunos.ipinfo.updates.http.HttpTransport
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

/** Builders for release metadata and GitHub API payloads used across the updater tests. */
object Fixtures {
    const val CERT_A = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    const val CERT_B = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    const val APK_SHA = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"

    val appId: String get() = ReleaseContract.applicationId

    fun version(text: String): AppVersion = AppVersion.parseOrNull(text) ?: error("bad version $text")

    fun metadataMap(
        version: String = "1.1.0",
        size: Long = 4096,
        sha: String = APK_SHA,
        cert: String = CERT_A,
    ): MutableMap<String, Any?> {
        val v = version(version)
        return linkedMapOf(
            "schemaVersion" to 1,
            "applicationId" to appId,
            "tag" to ReleaseContract.tagFor(v),
            "versionName" to version,
            "versionCode" to v.versionCode,
            "minSdk" to 29,
            "publishedAt" to "2026-10-13T12:00:00Z",
            "releaseNotesUrl" to ReleaseContract.releasePageUrl(v),
            "apk" to linkedMapOf<String, Any?>(
                "fileName" to ReleaseContract.apkAssetName(v),
                "downloadUrl" to ReleaseContract.apkDownloadUrl(v),
                "sizeBytes" to size,
                "sha256" to sha,
            ),
            "signing" to linkedMapOf<String, Any?>("certificateSha256" to cert),
        )
    }

    fun json(map: Map<String, Any?>): String = JSONObject(map).toString()

    fun metadataJson(version: String = "1.1.0", size: Long = 4096, sha: String = APK_SHA, cert: String = CERT_A): String =
        json(metadataMap(version, size, sha, cert))

    /** Returns [map] with the value at [path] replaced (or removed when [value] is [Remove]). */
    @Suppress("UNCHECKED_CAST")
    fun mutate(map: Map<String, Any?>, path: List<String>, value: Any?): Map<String, Any?> {
        val copy = LinkedHashMap(map)
        if (path.size == 1) {
            if (value === Remove) copy.remove(path[0]) else copy[path[0]] = value
        } else {
            copy[path[0]] = mutate(copy[path[0]] as Map<String, Any?>, path.drop(1), value)
        }
        return copy
    }

    object Remove

    fun asset(name: String, size: Long = 4096, state: String? = "uploaded", url: String? = null, digest: String? = null): Map<String, Any?> =
        linkedMapOf(
            "name" to name,
            "size" to size,
            "state" to state,
            "browser_download_url" to (url ?: "https://github.com/ArturLauche/ip-info-leunos/releases/download/x/$name"),
            "digest" to digest,
        )

    fun assetsFor(version: String, apkSize: Long = 4096, apkDigest: String? = null): List<Map<String, Any?>> {
        val v = version(version)
        return listOf(
            asset(ReleaseContract.apkAssetName(v), apkSize, url = ReleaseContract.apkDownloadUrl(v), digest = apkDigest),
            asset(ReleaseContract.checksumAssetName(v), 90),
            asset(ReleaseContract.METADATA_ASSET_NAME, 800, url = ReleaseContract.metadataDownloadUrl(v)),
        )
    }

    fun releaseMap(
        tag: String,
        draft: Boolean = false,
        prerelease: Boolean = false,
        publishedAt: String? = "2026-10-13T12:00:00Z",
        assets: List<Map<String, Any?>>? = null,
        body: String? = "Release notes",
    ): Map<String, Any?> {
        val parsed = ReleaseContract.parseTag(tag)
        return linkedMapOf(
            "tag_name" to tag,
            "name" to tag,
            "draft" to draft,
            "prerelease" to prerelease,
            "published_at" to publishedAt,
            "html_url" to "https://github.com/ArturLauche/ip-info-leunos/releases/tag/$tag",
            "body" to body,
            "assets" to (assets ?: parsed?.let { assetsFor(it.toString()) } ?: emptyList()),
        )
    }

    fun releasesJson(vararg releases: Map<String, Any?>): String =
        JSONArray(releases.map { JSONObject(it) }).toString()

    fun release(tag: String, vararg modifiers: Pair<String, Any?>): GitHubRelease {
        val map = LinkedHashMap(releaseMap(tag))
        modifiers.forEach { (key, value) -> map[key] = value }
        return GitHubReleasesParser.parse(releasesJson(map)).releases.single()
    }
}

class FakeTransport(private val handler: (HttpRequest) -> HttpResponse) : HttpTransport {
    val requests = mutableListOf<HttpRequest>()

    override fun execute(request: HttpRequest): HttpResponse {
        requests += request
        return handler(request)
    }

    companion object {
        fun response(status: Int, body: String = "", headers: Map<String, String> = emptyMap(), url: String = "https://api.github.com/") =
            HttpResponse(status, headers, body.byteInputStream(), url)

        fun failing(message: String = "offline") = FakeTransport { throw IOException(message) }
    }
}

class MemoryReleasesCache(var entry: CachedReleases? = null) : ReleasesCache {
    override fun load(): CachedReleases? = entry
    override fun save(entry: CachedReleases) {
        this.entry = entry
    }
}

class FixedClock(var now: Long = 1_800_000_000_000L) : Clock {
    override fun nowMillis(): Long = now
}
