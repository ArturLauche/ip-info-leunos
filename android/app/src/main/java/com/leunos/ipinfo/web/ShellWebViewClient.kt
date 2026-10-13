package com.leunos.ipinfo.web

import android.graphics.Bitmap
import android.net.http.SslError
import android.webkit.RenderProcessGoneDetail
import android.webkit.SslErrorHandler
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient

enum class LoadError { UNREACHABLE, SERVER, SECURE_CONNECTION, OTHER }

/**
 * Navigation policy and page-lifecycle callbacks. Main-frame navigations are checked against
 * [TrustedOrigin] on every hop (including server redirects); anything else leaves the app via Android's
 * browser handling or is blocked.
 */
// onRenderProcessGone is implemented below; the androidx.webkit lint check does not recognise the override.
@Suppress("MissingOnRenderProcessGone")
class ShellWebViewClient(private val host: Host) : WebViewClient() {

    interface Host {
        fun onNavigationStarted(url: String?)
        fun onPageVisible()
        fun onPageFinished(url: String?)
        fun onHistoryChanged()
        fun onMainFrameError(error: LoadError)
        fun onExternalUrl(url: String, kind: TrustedOrigin.ExternalKind)
        fun onBlockedUrl()
        fun onWebProcessGone(view: WebView, didCrash: Boolean): Boolean
    }

    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
        handle(view, request.url.toString(), request.isForMainFrame)

    private fun handle(view: WebView, url: String, mainFrame: Boolean): Boolean {
        when (val decision = TrustedOrigin.decide(url)) {
            TrustedOrigin.Decision.LoadInApp -> return false
            is TrustedOrigin.Decision.UpgradeToHttps -> if (mainFrame) view.loadUrl(decision.url)
            is TrustedOrigin.Decision.OpenExternally -> if (mainFrame) host.onExternalUrl(decision.url, decision.kind)
            is TrustedOrigin.Decision.Block -> host.onBlockedUrl()
        }
        return true // cancel the in-app navigation
    }

    override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) = host.onNavigationStarted(url)

    override fun onPageCommitVisible(view: WebView, url: String?) = host.onPageVisible()

    override fun onPageFinished(view: WebView, url: String?) = host.onPageFinished(url)

    override fun doUpdateVisitedHistory(view: WebView, url: String?, isReload: Boolean) = host.onHistoryChanged()

    override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
        if (!request.isForMainFrame) return
        host.onMainFrameError(
            when (error.errorCode) {
                ERROR_HOST_LOOKUP, ERROR_CONNECT, ERROR_TIMEOUT, ERROR_IO -> LoadError.UNREACHABLE
                ERROR_FAILED_SSL_HANDSHAKE -> LoadError.SECURE_CONNECTION
                else -> LoadError.OTHER
            },
        )
    }

    override fun onReceivedHttpError(view: WebView, request: WebResourceRequest, errorResponse: WebResourceResponse) {
        // Gateway errors come from the proxy in front of the site, not from the application.
        if (request.isForMainFrame && errorResponse.statusCode in GATEWAY_ERRORS) host.onMainFrameError(LoadError.SERVER)
    }

    /** Certificate problems are never bypassed: the load is cancelled and the user is told. */
    override fun onReceivedSslError(view: WebView, handler: SslErrorHandler, error: SslError) {
        handler.cancel()
        if (error.url == view.url || error.url == view.originalUrl) host.onMainFrameError(LoadError.SECURE_CONNECTION)
    }

    // Returning true keeps the app alive when the renderer crashes or is killed; the host rebuilds the WebView.
    override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
        return host.onWebProcessGone(view, detail.didCrash())
    }

    private companion object {
        val GATEWAY_ERRORS = setOf(502, 503, 504)
    }
}
