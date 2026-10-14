package com.leunos.ipinfo.web

import java.net.URI
import java.net.URISyntaxException
import java.util.Locale

/**
 * Decides what the WebView may do with a URL. Only the production website origin
 * (https, exactly [HOST], default port, no credentials) is loaded inside the app. Everything else is
 * handed to Android's browser handling or blocked. Hosts are compared exactly, never by substring.
 */
object TrustedOrigin {
    const val HOST = "ip-info.leunos.com"
    const val HOME_URL = "https://$HOST/"

    private const val MAX_URL_LENGTH = 8_192

    enum class ExternalKind { WEB, MAIL }

    enum class BlockReason { MALFORMED, UNSUPPORTED_SCHEME, CREDENTIALS_IN_URL, MISSING_HOST }

    sealed interface Decision {
        data object LoadInApp : Decision

        /** Plain-HTTP link to the trusted host: loaded over HTTPS instead. */
        data class UpgradeToHttps(val url: String) : Decision
        data class OpenExternally(val url: String, val kind: ExternalKind) : Decision
        data class Block(val reason: BlockReason) : Decision
    }

    fun decide(url: String?): Decision {
        val raw = url?.trim().orEmpty()
        // Chromium hands over canonical URLs; control characters and backslashes never occur in them.
        if (raw.isEmpty() || raw.length > MAX_URL_LENGTH || raw.any { it.isISOControl() || it == '\\' }) {
            return Decision.Block(BlockReason.MALFORMED)
        }
        // Decide on the scheme first so even unparsable intent:/javascript: style URLs get the right reason.
        val scheme = raw.substringBefore(':', missingDelimiterValue = "").lowercase(Locale.ROOT)
        if (scheme != "https" && scheme != "http" && scheme != "mailto") return Decision.Block(BlockReason.UNSUPPORTED_SCHEME)

        val uri = try {
            URI(raw)
        } catch (e: URISyntaxException) {
            return Decision.Block(BlockReason.MALFORMED)
        }

        return when (uri.scheme?.lowercase(Locale.ROOT)) {
            "https", "http" -> decideWeb(uri, raw)
            "mailto" -> if (uri.isOpaque) Decision.OpenExternally(raw, ExternalKind.MAIL) else Decision.Block(BlockReason.MALFORMED)
            else -> Decision.Block(BlockReason.UNSUPPORTED_SCHEME)
        }
    }

    fun isTrusted(url: String?): Boolean = decide(url) == Decision.LoadInApp

    /** The full URL for a site-relative path such as `/privacy-policy`; null if the path is unusable. */
    fun urlForPath(path: String): String? {
        if (!path.startsWith("/") || path.startsWith("//")) return null
        val url = "https://$HOST$path"
        return if (isTrusted(url)) url else null
    }

    private fun decideWeb(uri: URI, raw: String): Decision {
        if (uri.rawUserInfo != null) return Decision.Block(BlockReason.CREDENTIALS_IN_URL)
        val host = uri.host?.lowercase(Locale.ROOT)?.takeIf { it.isNotEmpty() } ?: return Decision.Block(BlockReason.MISSING_HOST)
        val https = uri.scheme.equals("https", ignoreCase = true)
        val port = uri.port
        if (host == HOST) {
            if (https && (port == -1 || port == 443)) return Decision.LoadInApp
            if (!https && (port == -1 || port == 80)) {
                val path = uri.rawPath.orEmpty().ifEmpty { "/" }
                val query = uri.rawQuery?.let { "?$it" }.orEmpty()
                val fragment = uri.rawFragment?.let { "#$it" }.orEmpty()
                return Decision.UpgradeToHttps("https://$HOST$path$query$fragment")
            }
        }
        return Decision.OpenExternally(raw, ExternalKind.WEB)
    }
}
