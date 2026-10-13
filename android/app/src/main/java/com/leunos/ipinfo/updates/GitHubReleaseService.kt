package com.leunos.ipinfo.updates

import com.leunos.ipinfo.updates.http.HttpRequest
import com.leunos.ipinfo.updates.http.HttpTransport
import com.leunos.ipinfo.updates.http.UrlNotAllowedException
import java.io.File
import java.io.IOException

data class CachedReleases(val etag: String, val body: String, val fetchedAtMillis: Long)

interface ReleasesCache {
    fun load(): CachedReleases?
    fun save(entry: CachedReleases)
}

/** Stores the last releases response with its ETag so unchanged answers cost a free 304. */
class FileReleasesCache(private val file: File) : ReleasesCache {
    override fun load(): CachedReleases? = runCatching {
        if (!file.isFile || file.length() > MAX_CACHE_BYTES) return null
        val json = org.json.JSONObject(file.readText())
        val fields = Fields(json, "")
        CachedReleases(fields.string("etag"), fields.string("body"), fields.long("fetchedAt"))
    }.getOrNull()

    override fun save(entry: CachedReleases) {
        runCatching {
            file.parentFile?.mkdirs()
            val temp = File(file.parentFile, file.name + ".tmp")
            temp.writeText(
                org.json.JSONObject()
                    .put("etag", entry.etag)
                    .put("body", entry.body)
                    .put("fetchedAt", entry.fetchedAtMillis)
                    .toString(),
            )
            if (!temp.renameTo(file)) {
                file.delete()
                temp.renameTo(file)
            }
        }
    }

    private companion object {
        const val MAX_CACHE_BYTES = 2L * 1024 * 1024
    }
}

enum class UnavailableKind { NETWORK, SERVER, NOT_FOUND, FORBIDDEN, UNEXPECTED }

sealed interface ReleasesResult {
    data class Body(val json: String, val fromCache: Boolean) : ReleasesResult
    data class RateLimited(val retryAtMillis: Long) : ReleasesResult
    data class Unavailable(val kind: UnavailableKind, val status: Int? = null) : ReleasesResult
}

/**
 * Talks to the public GitHub Releases API without authentication. Uses conditional requests
 * (ETag / If-None-Match: 304 answers do not count against the unauthenticated rate limit) and
 * translates rate limiting into an explicit retry time.
 */
class GitHubReleaseService(
    private val transport: HttpTransport,
    private val cache: ReleasesCache,
    private val clock: Clock = Clock.SYSTEM,
    private val url: String = ReleaseContract.RELEASES_API_URL,
) {
    fun fetch(): ReleasesResult {
        val cached = cache.load()
        val headers = linkedMapOf(
            "Accept" to "application/vnd.github+json",
            "X-GitHub-Api-Version" to "2022-11-28",
        )
        if (cached != null && cached.etag.isNotBlank()) headers["If-None-Match"] = cached.etag

        val response = try {
            transport.execute(HttpRequest(url, headers))
        } catch (e: UrlNotAllowedException) {
            return ReleasesResult.Unavailable(UnavailableKind.UNEXPECTED)
        } catch (e: IOException) {
            return ReleasesResult.Unavailable(UnavailableKind.NETWORK)
        }

        response.use { r ->
            return when {
                r.status == 200 -> {
                    val body = try {
                        r.readText(MAX_RESPONSE_BYTES)
                    } catch (e: IOException) {
                        return ReleasesResult.Unavailable(UnavailableKind.NETWORK)
                    }
                    r.header("etag")?.takeIf { it.isNotBlank() }?.let { cache.save(CachedReleases(it, body, clock.nowMillis())) }
                    ReleasesResult.Body(body, fromCache = false)
                }
                r.status == 304 && cached != null -> ReleasesResult.Body(cached.body, fromCache = true)
                r.status == 429 || r.status == 403 -> rateLimitOrForbidden(r.status, r::header)
                r.status == 404 -> ReleasesResult.Unavailable(UnavailableKind.NOT_FOUND, r.status)
                r.status in 500..599 -> ReleasesResult.Unavailable(UnavailableKind.SERVER, r.status)
                else -> ReleasesResult.Unavailable(UnavailableKind.UNEXPECTED, r.status)
            }
        }
    }

    private fun rateLimitOrForbidden(status: Int, header: (String) -> String?): ReleasesResult {
        val remaining = header("x-ratelimit-remaining")?.trim()
        val retryAfterSeconds = header("retry-after")?.trim()?.toLongOrNull()
        val resetEpochSeconds = header("x-ratelimit-reset")?.trim()?.toLongOrNull()
        val limited = status == 429 || remaining == "0" || retryAfterSeconds != null
        if (!limited) return ReleasesResult.Unavailable(UnavailableKind.FORBIDDEN, status)

        val now = clock.nowMillis()
        val proposed = when {
            retryAfterSeconds != null -> now + retryAfterSeconds * 1_000
            resetEpochSeconds != null -> resetEpochSeconds * 1_000
            else -> now + DEFAULT_BACKOFF_MS
        }
        return ReleasesResult.RateLimited(proposed.coerceIn(now + MIN_BACKOFF_MS, now + MAX_BACKOFF_MS))
    }

    private companion object {
        const val MAX_RESPONSE_BYTES = 2 * 1024 * 1024
        const val MIN_BACKOFF_MS = 60_000L
        const val DEFAULT_BACKOFF_MS = 15 * 60_000L
        const val MAX_BACKOFF_MS = 24 * 60 * 60_000L
    }
}
