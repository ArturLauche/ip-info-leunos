package com.leunos.ipinfo.updates.http

import java.io.ByteArrayOutputStream
import java.io.Closeable
import java.io.IOException
import java.io.InputStream
import java.net.URI
import java.net.URISyntaxException
import java.util.Locale

/** Minimal blocking HTTP GET abstraction so the updater can be tested without a network. */
interface HttpTransport {
    @Throws(IOException::class)
    fun execute(request: HttpRequest): HttpResponse
}

class HttpRequest(val url: String, val headers: Map<String, String> = emptyMap())

class HttpResponse(
    val status: Int,
    headers: Map<String, String>,
    val body: InputStream?,
    val finalUrl: String,
    private val onClose: () -> Unit = {},
) : Closeable {
    private val headersByLowerName = headers.mapKeys { it.key.lowercase(Locale.ROOT) }

    fun header(name: String): String? = headersByLowerName[name.lowercase(Locale.ROOT)]

    /** Reads the full body as UTF-8 and fails once it grows beyond [maxBytes]. */
    @Throws(IOException::class)
    fun readText(maxBytes: Int): String {
        val stream = body ?: return ""
        val out = ByteArrayOutputStream()
        val buffer = ByteArray(8 * 1024)
        while (true) {
            val read = stream.read(buffer)
            if (read < 0) break
            if (out.size() + read > maxBytes) throw IOException("response is larger than $maxBytes bytes")
            out.write(buffer, 0, read)
        }
        return out.toString(Charsets.UTF_8.name())
    }

    override fun close() {
        try {
            body?.close()
        } catch (_: IOException) {
            // Closing is best effort.
        }
        onClose()
    }
}

class UrlNotAllowedException(message: String) : IOException(message)

/**
 * Decides which URLs the updater may contact. Every hop of every redirect is checked, so a
 * compromised or misconfigured redirect can never lead the updater to an arbitrary host.
 */
class UrlPolicy private constructor(
    private val hosts: Set<String>,
    private val hostSuffixes: Set<String>,
    private val loopbackHttpForTests: Boolean,
) {
    @Throws(UrlNotAllowedException::class)
    fun requireAllowed(raw: String): URI {
        val uri = try {
            URI(raw)
        } catch (e: URISyntaxException) {
            throw UrlNotAllowedException("malformed URL")
        }
        val scheme = uri.scheme?.lowercase(Locale.ROOT)
        val host = uri.host?.lowercase(Locale.ROOT) ?: throw UrlNotAllowedException("URL has no host")
        if (uri.rawUserInfo != null) throw UrlNotAllowedException("credentials in URLs are not allowed")

        if (loopbackHttpForTests) {
            if (scheme != "http" || host != "127.0.0.1") throw UrlNotAllowedException("only loopback http is allowed in tests")
            return uri
        }

        if (scheme != "https") throw UrlNotAllowedException("only https is allowed")
        if (uri.port != -1 && uri.port != 443) throw UrlNotAllowedException("non-default port")
        val allowed = host in hosts || hostSuffixes.any { host.endsWith(".$it") }
        if (!allowed) throw UrlNotAllowedException("host $host is not allowed")
        return uri
    }

    companion object {
        /** GitHub's API, github.com and the CDN hosts release assets are redirected to. */
        val GITHUB = UrlPolicy(setOf("api.github.com", "github.com"), setOf("githubusercontent.com"), false)

        /** Plain-HTTP loopback policy for local test servers. Never used by production code. */
        fun loopbackForTests() = UrlPolicy(emptySet(), emptySet(), true)
    }
}
