package com.leunos.ipinfo.updates

import com.leunos.ipinfo.updates.FakeTransport.Companion.response
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class GitHubReleaseServiceTest {
    private val clock = FixedClock()

    private fun service(transport: FakeTransport, cache: ReleasesCache = MemoryReleasesCache()) =
        GitHubReleaseService(transport, cache, clock)

    @Test
    fun cachesTheEtagAndRevalidatesWithConditionalRequests() {
        val cache = MemoryReleasesCache()
        val transport = FakeTransport { request ->
            if (request.headers["If-None-Match"] == "\"abc\"") response(304) else response(200, "[]", mapOf("ETag" to "\"abc\""))
        }
        val service = service(transport, cache)

        val first = service.fetch() as ReleasesResult.Body
        assertEquals("[]", first.json)
        assertEquals(false, first.fromCache)
        assertEquals("\"abc\"", cache.entry?.etag)
        assertNull(transport.requests[0].headers["If-None-Match"])

        val second = service.fetch() as ReleasesResult.Body
        assertEquals(true, second.fromCache)
        assertEquals("[]", second.json)
        assertEquals("\"abc\"", transport.requests[1].headers["If-None-Match"])
    }

    @Test
    fun sendsPublicApiHeadersWithoutCredentials() {
        val transport = FakeTransport { response(200, "[]") }
        service(transport).fetch()
        val headers = transport.requests.single().headers
        assertEquals("application/vnd.github+json", headers["Accept"])
        assertEquals("2022-11-28", headers["X-GitHub-Api-Version"])
        assertTrue(headers.keys.none { it.equals("Authorization", ignoreCase = true) })
        assertEquals(ReleaseContract.RELEASES_API_URL, transport.requests.single().url)
    }

    @Test
    fun rateLimitUsesTheResetTimeAndIsBounded() {
        val resetInTenMinutes = (clock.now / 1000) + 600
        val transport = FakeTransport { response(403, "{}", mapOf("x-ratelimit-remaining" to "0", "x-ratelimit-reset" to resetInTenMinutes.toString())) }
        val result = service(transport).fetch() as ReleasesResult.RateLimited
        assertEquals(resetInTenMinutes * 1000, result.retryAtMillis)

        val farFuture = FakeTransport { response(403, "{}", mapOf("x-ratelimit-remaining" to "0", "x-ratelimit-reset" to ((clock.now / 1000) + 10 * 86_400).toString())) }
        val capped = service(farFuture).fetch() as ReleasesResult.RateLimited
        assertEquals(clock.now + 24 * 60 * 60_000, capped.retryAtMillis)

        val past = FakeTransport { response(403, "{}", mapOf("x-ratelimit-remaining" to "0", "x-ratelimit-reset" to "1")) }
        val floored = service(past).fetch() as ReleasesResult.RateLimited
        assertEquals(clock.now + 60_000, floored.retryAtMillis)
    }

    @Test
    fun secondaryRateLimitHonoursRetryAfter() {
        val transport = FakeTransport { response(429, "{}", mapOf("Retry-After" to "120")) }
        val result = service(transport).fetch() as ReleasesResult.RateLimited
        assertEquals(clock.now + 120_000, result.retryAtMillis)
    }

    @Test
    fun forbiddenWithoutRateLimitHeadersIsNotRateLimiting() {
        val result = service(FakeTransport { response(403, "{}") }).fetch()
        assertEquals(ReleasesResult.Unavailable(UnavailableKind.FORBIDDEN, 403), result)
    }

    @Test
    fun serverErrorsNetworkFailuresAndMissingRepositoriesAreDistinguished() {
        assertEquals(ReleasesResult.Unavailable(UnavailableKind.SERVER, 503), service(FakeTransport { response(503) }).fetch())
        assertEquals(ReleasesResult.Unavailable(UnavailableKind.NOT_FOUND, 404), service(FakeTransport { response(404) }).fetch())
        assertEquals(ReleasesResult.Unavailable(UnavailableKind.UNEXPECTED, 418), service(FakeTransport { response(418) }).fetch())
        assertEquals(ReleasesResult.Unavailable(UnavailableKind.NETWORK), service(FakeTransport.failing()).fetch())
    }

    @Test
    fun aNotModifiedAnswerWithoutACacheIsNotTrusted() {
        val result = service(FakeTransport { response(304) }).fetch()
        assertTrue(result is ReleasesResult.Unavailable)
    }
}
