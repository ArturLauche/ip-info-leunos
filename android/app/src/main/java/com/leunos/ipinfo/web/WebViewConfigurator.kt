package com.leunos.ipinfo.web

import android.annotation.SuppressLint
import android.graphics.Color
import android.webkit.CookieManager
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature

/**
 * Hardened WebView configuration. Only what the IP Info website needs is enabled: JavaScript and DOM
 * storage. There is no JavaScript bridge, no file or content access, no mixed content, no geolocation
 * and no popup windows. Certificate errors are never ignored (see [ShellWebViewClient]).
 */
object WebViewConfigurator {

    @SuppressLint("SetJavaScriptEnabled")
    fun apply(webView: WebView, debuggable: Boolean) {
        val settings = webView.settings
        settings.javaScriptEnabled = true // the Next.js application is a JavaScript app
        settings.domStorageEnabled = true // theme and language preferences live in localStorage
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        @Suppress("DEPRECATION")
        settings.allowFileAccessFromFileURLs = false
        @Suppress("DEPRECATION")
        settings.allowUniversalAccessFromFileURLs = false
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        settings.javaScriptCanOpenWindowsAutomatically = false
        settings.setSupportMultipleWindows(false)
        settings.mediaPlaybackRequiresUserGesture = true
        settings.setGeolocationEnabled(false)
        settings.safeBrowsingEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        // The site follows prefers-color-scheme itself; WebView must not darken it a second time.
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(settings, false)
        }

        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, false)
        }
        WebView.setWebContentsDebuggingEnabled(debuggable)
        // Let the activity background show through while pages load, avoiding a white flash in dark mode.
        webView.setBackgroundColor(Color.TRANSPARENT)
    }
}
