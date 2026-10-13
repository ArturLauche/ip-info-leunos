package com.leunos.ipinfo.updates.http

import java.io.IOException
import java.net.HttpURLConnection
import java.util.Locale

/**
 * Production transport on top of [HttpURLConnection] (the platform TLS stack: certificate and
 * hostname verification stay enabled, nothing is overridden). Redirects are followed manually so
 * every hop is validated against the [UrlPolicy]; no credentials are ever sent.
 */
class UrlConnectionTransport(
    private val policy: UrlPolicy,
    private val userAgent: String,
    private val connectTimeoutMs: Int = 15_000,
    private val readTimeoutMs: Int = 30_000,
    private val maxRedirects: Int = 5,
) : HttpTransport {

    @Throws(IOException::class)
    override fun execute(request: HttpRequest): HttpResponse {
        var uri = policy.requireAllowed(request.url)
        var hops = 0
        while (true) {
            val connection = uri.toURL().openConnection() as HttpURLConnection
            try {
                connection.instanceFollowRedirects = false
                connection.connectTimeout = connectTimeoutMs
                connection.readTimeout = readTimeoutMs
                connection.requestMethod = "GET"
                connection.useCaches = false
                connection.setRequestProperty("User-Agent", userAgent)
                // Byte ranges and Content-Length must refer to the stored bytes, so no transfer compression.
                connection.setRequestProperty("Accept-Encoding", "identity")
                request.headers.forEach { (name, value) -> connection.setRequestProperty(name, value) }

                val status = connection.responseCode
                if (status in REDIRECT_CODES) {
                    val location = connection.getHeaderField("Location") ?: throw IOException("redirect without Location header")
                    if (++hops > maxRedirects) throw IOException("too many redirects")
                    uri = policy.requireAllowed(uri.resolve(location).toString())
                    connection.disconnect()
                    continue
                }

                val stream = if (status in 200..299) connection.inputStream else connection.errorStream
                val headers = HashMap<String, String>()
                for ((name, values) in connection.headerFields) {
                    if (name != null && values.isNotEmpty()) headers[name.lowercase(Locale.ROOT)] = values.first()
                }
                return HttpResponse(status, headers, stream, uri.toString()) { connection.disconnect() }
            } catch (e: IOException) {
                connection.disconnect()
                throw e
            }
        }
    }

    private companion object {
        val REDIRECT_CODES = setOf(301, 302, 303, 307, 308)
    }
}
