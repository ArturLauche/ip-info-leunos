package com.leunos.ipinfo

import android.annotation.SuppressLint
import android.content.Intent
import android.content.res.ColorStateList
import android.content.res.Configuration
import android.net.ConnectivityManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.graphics.drawable.toDrawable
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.isVisible
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.google.android.material.snackbar.Snackbar
import com.leunos.ipinfo.databinding.ActivityMainBinding
import com.leunos.ipinfo.navigation.AppNavigator
import com.leunos.ipinfo.updates.UpdatePhase
import com.leunos.ipinfo.updates.UpdateRepository
import com.leunos.ipinfo.util.NetworkReturnWatcher
import com.leunos.ipinfo.web.ChromePalette
import com.leunos.ipinfo.web.LoadError
import com.leunos.ipinfo.web.ShellChromeClient
import com.leunos.ipinfo.web.ShellWebViewClient
import com.leunos.ipinfo.web.ThemeSampler
import com.leunos.ipinfo.web.TrustedOrigin
import com.leunos.ipinfo.web.WebViewConfigurator
import kotlinx.coroutines.launch

/**
 * Hosts the production website in a hardened WebView and offers a small native menu for the native
 * screens. The activity handles configuration changes itself, so rotation, dark mode and font scale
 * changes never reload the page.
 */
class MainActivity : AppCompatActivity(), ShellWebViewClient.Host {

    private lateinit var binding: ActivityMainBinding
    private var webView: WebView? = null
    private val graph get() = (application as IpInfoApplication).graph
    private val handler = Handler(Looper.getMainLooper())

    private var splashReady = false
    private var loadError: LoadError? = null
    private var lastTrustedUrl: String = TrustedOrigin.HOME_URL
    private var palette = ChromePalette.forBackground(ChromePalette.DEFAULT_BACKGROUND)
    private var imeVisible = false
    private var hiddenByScroll = false
    private var bannerShownForVersionCode = 0

    private lateinit var networkReturnWatcher: NetworkReturnWatcher

    private val backCallback = object : OnBackPressedCallback(false) {
        override fun handleOnBackPressed() {
            webView?.goBack()
        }
    }
    private val sampleTheme = Runnable { sampleThemeNow() }

    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(android.graphics.Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(android.graphics.Color.TRANSPARENT),
        )
        window.isNavigationBarContrastEnforced = false

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        splash.setKeepOnScreenCondition { !splashReady }
        handler.postDelayed({ splashReady = true }, SPLASH_MAX_MS)

        networkReturnWatcher = NetworkReturnWatcher(getSystemService(ConnectivityManager::class.java)) { retry() }

        val remembered = graph.preferences.lastWebBackground
        applyPalette(ChromePalette.forBackground(if (remembered != 0) remembered else ChromePalette.DEFAULT_BACKGROUND))

        applyInsets()
        onBackPressedDispatcher.addCallback(this, backCallback)
        setUpControls()
        createWebView(savedInstanceState?.getBundle(KEY_WEB_STATE), initialUrl(intent))
        observeUpdates()
    }

    // ------------------------------------------------------------------ setup

    private fun applyInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            imeVisible = insets.isVisible(WindowInsetsCompat.Type.ime())
            view.setPadding(bars.left, bars.top, bars.right, maxOf(bars.bottom, ime.bottom))
            updateMenuButton()
            WindowInsetsCompat.CONSUMED
        }
    }

    private fun setUpControls() {
        binding.menuButton.setOnClickListener { QuickMenuSheet().show(supportFragmentManager, QuickMenuSheet.TAG) }
        with(binding.offlinePanel) {
            retryButton.setOnClickListener { retry() }
            diagnosticsButton.setOnClickListener { AppNavigator.diagnostics(this@MainActivity) }
            settingsButton.setOnClickListener { AppNavigator.settings(this@MainActivity) }
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun createWebView(state: Bundle?, url: String) {
        val view = try {
            WebView(this)
        } catch (e: RuntimeException) {
            // No usable WebView provider (for example while it is being updated).
            showWebViewUnavailable()
            return
        }
        WebViewConfigurator.apply(view, BuildConfig.DEBUG)
        view.webViewClient = ShellWebViewClient(this)
        view.webChromeClient = ShellChromeClient(::onProgress)
        view.setOnScrollChangeListener { _, _, scrollY, _, oldScrollY ->
            val delta = scrollY - oldScrollY
            if (scrollY <= TOP_ZONE_PX || delta < -SCROLL_THRESHOLD_PX) {
                hiddenByScroll = false
            } else if (delta > SCROLL_THRESHOLD_PX) {
                hiddenByScroll = true
            }
            updateMenuButton()
        }
        // Observe only: the website may switch theme on a tap, so look again shortly after touches end.
        view.setOnTouchListener { _, event ->
            if (event.actionMasked == MotionEvent.ACTION_UP) scheduleThemeSample(THEME_SAMPLE_AFTER_TOUCH_MS)
            false
        }
        view.layoutParams = FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        binding.webContainer.addView(view)
        webView = view

        val restored = state != null && view.restoreState(state) != null
        if (!restored) view.loadUrl(url)
        backCallback.isEnabled = view.canGoBack()
    }

    private fun initialUrl(intent: Intent?): String {
        intent?.getStringExtra(EXTRA_OPEN_PATH)?.let { path -> TrustedOrigin.urlForPath(path)?.let { return it } }
        val data = intent?.dataString
        return when (val decision = TrustedOrigin.decide(data)) {
            TrustedOrigin.Decision.LoadInApp -> data.orEmpty()
            is TrustedOrigin.Decision.UpgradeToHttps -> decision.url
            else -> TrustedOrigin.HOME_URL
        }
    }

    private fun observeUpdates() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                graph.updates.checkForUpdates(UpdateRepository.CheckTrigger.LAUNCH)
                graph.updates.state.collect { state ->
                    val candidate = state.candidate ?: return@collect
                    val code = candidate.metadata.versionCode
                    val ready = state.phase == UpdatePhase.READY_TO_INSTALL
                    if (ready && bannerShownForVersionCode != code) {
                        bannerShownForVersionCode = code
                        Snackbar.make(binding.root, getString(R.string.update_ready_banner, candidate.metadata.versionName), Snackbar.LENGTH_LONG)
                            .setAction(R.string.update_banner_action) { AppNavigator.settings(this@MainActivity) }
                            .setAnchorView(binding.menuButton.takeIf { it.isVisible })
                            .show()
                    }
                }
            }
        }
    }

    // ------------------------------------------------------------------ lifecycle

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val wanted = initialUrl(intent)
        val explicit = intent.getStringExtra(EXTRA_OPEN_PATH) != null || intent.dataString != null
        if (explicit) webView?.loadUrl(wanted)
    }

    override fun onStart() {
        super.onStart()
        if (binding.offlinePanel.root.isVisible) networkReturnWatcher.start()
    }

    override fun onResume() {
        super.onResume()
        webView?.onResume()
        scheduleThemeSample(THEME_SAMPLE_AFTER_TOUCH_MS)
    }

    override fun onPause() {
        webView?.onPause()
        super.onPause()
    }

    override fun onStop() {
        networkReturnWatcher.stop()
        super.onStop()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView?.let { view ->
            val state = Bundle()
            view.saveState(state)
            outState.putBundle(KEY_WEB_STATE, state)
        }
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        // Dark mode may flip prefers-color-scheme on the page: look again once it has re-rendered.
        scheduleThemeSample(THEME_SAMPLE_AFTER_CONFIG_MS)
        binding.root.post { layoutOfflineContent() }
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        networkReturnWatcher.stop()
        webView?.let { view ->
            binding.webContainer.removeView(view)
            view.destroy()
        }
        webView = null
        super.onDestroy()
    }

    // ------------------------------------------------------------------ ShellWebViewClient.Host

    override fun onNavigationStarted(url: String?) {
        if (TrustedOrigin.isTrusted(url)) lastTrustedUrl = url.orEmpty()
        loadError = null
        binding.progress.show()
        backCallback.isEnabled = webView?.canGoBack() == true
    }

    override fun onPageVisible() {
        splashReady = true
        if (loadError == null) hideLoadError()
        scheduleThemeSample(THEME_SAMPLE_AFTER_LOAD_MS)
    }

    override fun onPageFinished(url: String?) {
        binding.progress.hide()
        backCallback.isEnabled = webView?.canGoBack() == true
        scheduleThemeSample(THEME_SAMPLE_AFTER_LOAD_MS)
    }

    override fun onHistoryChanged() {
        backCallback.isEnabled = webView?.canGoBack() == true
        scheduleThemeSample(THEME_SAMPLE_AFTER_TOUCH_MS)
    }

    override fun onMainFrameError(error: LoadError) = showLoadError(error)

    override fun onExternalUrl(url: String, kind: TrustedOrigin.ExternalKind) {
        if (!AppNavigator.openExternal(this, url, kind)) {
            Snackbar.make(binding.root, R.string.external_link_failed, Snackbar.LENGTH_SHORT).show()
        }
    }

    override fun onBlockedUrl() {
        Snackbar.make(binding.root, R.string.blocked_link, Snackbar.LENGTH_SHORT).show()
    }

    override fun onWebProcessGone(view: WebView, didCrash: Boolean): Boolean {
        if (view !== webView) return true
        binding.webContainer.removeView(view)
        view.destroy()
        webView = null
        Snackbar.make(binding.root, R.string.renderer_crashed, Snackbar.LENGTH_LONG).show()
        createWebView(null, lastTrustedUrl)
        return true
    }

    private fun onProgress(percent: Int) {
        if (percent in 1..99) {
            binding.progress.show()
            binding.progress.setProgressCompat(percent, true)
        } else {
            binding.progress.hide()
        }
    }

    // ------------------------------------------------------------------ offline / error panel

    private fun showLoadError(error: LoadError) {
        loadError = error
        val connected = graph.networkStatus.isValidated()
        val (title, message) = when {
            error == LoadError.SECURE_CONNECTION -> R.string.offline_title_secure to R.string.offline_message_secure
            error == LoadError.SERVER -> R.string.offline_title_server to R.string.offline_message_server
            !connected -> R.string.offline_title_no_network to R.string.offline_message_no_network
            else -> R.string.offline_title_unreachable to R.string.offline_message_unreachable
        }
        with(binding.offlinePanel) {
            titleView.setText(title)
            messageView.setText(message)
            root.isVisible = true
        }
        webView?.visibility = View.INVISIBLE
        binding.progress.hide()
        layoutOfflineContent()
        splashReady = true
        updateMenuButton()
        networkReturnWatcher.start()
    }

    private fun hideLoadError() {
        if (!binding.offlinePanel.root.isVisible) return
        binding.offlinePanel.root.isVisible = false
        webView?.visibility = View.VISIBLE
        networkReturnWatcher.stop()
        updateMenuButton()
    }

    private fun showWebViewUnavailable() {
        with(binding.offlinePanel) {
            titleView.setText(R.string.webview_unavailable_title)
            messageView.setText(R.string.webview_unavailable_message)
            retryButton.isVisible = false
            root.isVisible = true
        }
        splashReady = true
        layoutOfflineContent()
        updateMenuButton()
    }

    private fun retry() {
        val view = webView ?: return
        loadError = null
        binding.progress.show()
        view.loadUrl(lastTrustedUrl)
    }

    /** Keeps the message readable on tablets: content is at most 480dp wide and centred. */
    private fun layoutOfflineContent() {
        val content = binding.offlinePanel.content
        val maxWidth = (OFFLINE_MAX_WIDTH_DP * resources.displayMetrics.density).toInt()
        val available = binding.root.width - binding.root.paddingLeft - binding.root.paddingRight
        val params = content.layoutParams as FrameLayout.LayoutParams
        params.width = if (available > 0) minOf(available, maxWidth) else ViewGroup.LayoutParams.MATCH_PARENT
        params.gravity = android.view.Gravity.CENTER_HORIZONTAL
        content.layoutParams = params
    }

    // ------------------------------------------------------------------ chrome colours

    private fun scheduleThemeSample(delayMs: Long) {
        handler.removeCallbacks(sampleTheme)
        handler.postDelayed(sampleTheme, delayMs)
    }

    private fun sampleThemeNow() {
        val view = webView ?: return
        if (loadError != null || !TrustedOrigin.isTrusted(view.url)) return
        view.evaluateJavascript(ThemeSampler.SCRIPT) { result ->
            ThemeSampler.parse(result)?.let { color ->
                if (color != palette.background) {
                    graph.preferences.lastWebBackground = color
                    applyPalette(ChromePalette.forBackground(color))
                }
            }
        }
    }

    private fun applyPalette(p: ChromePalette) {
        palette = p
        binding.root.setBackgroundColor(p.background)
        window.setBackgroundDrawable(p.background.toDrawable())
        WindowCompat.getInsetsController(window, binding.root).apply {
            isAppearanceLightStatusBars = p.isLight
            isAppearanceLightNavigationBars = p.isLight
        }
        binding.progress.setIndicatorColor(p.primary)
        binding.progress.trackColor = p.border
        binding.menuButton.backgroundTintList = ColorStateList.valueOf(p.primary)
        binding.menuButton.imageTintList = ColorStateList.valueOf(p.onPrimary)
        with(binding.offlinePanel) {
            root.setBackgroundColor(p.background)
            icon.imageTintList = ColorStateList.valueOf(p.muted)
            titleView.setTextColor(p.foreground)
            messageView.setTextColor(p.muted)
            noteView.setTextColor(p.muted)
            retryButton.backgroundTintList = ColorStateList.valueOf(p.primary)
            retryButton.setTextColor(p.onPrimary)
            diagnosticsButton.strokeColor = ColorStateList.valueOf(p.border)
            diagnosticsButton.setTextColor(p.foreground)
            settingsButton.setTextColor(p.muted)
        }
    }

    private fun updateMenuButton() {
        val show = !imeVisible && !hiddenByScroll && !binding.offlinePanel.root.isVisible
        if (show) binding.menuButton.show() else binding.menuButton.hide()
    }

    /** Called by the quick menu. */
    fun reloadPage() {
        webView?.let {
            loadError = null
            it.reload()
        }
    }

    fun goHome() {
        webView?.loadUrl(TrustedOrigin.HOME_URL)
    }

    companion object {
        const val EXTRA_OPEN_PATH = "com.leunos.ipinfo.extra.OPEN_PATH"
        private const val KEY_WEB_STATE = "web_state"
        private const val SPLASH_MAX_MS = 1_000L
        private const val OFFLINE_MAX_WIDTH_DP = 480
        private const val SCROLL_THRESHOLD_PX = 12
        private const val TOP_ZONE_PX = 8
        private const val THEME_SAMPLE_AFTER_TOUCH_MS = 350L
        private const val THEME_SAMPLE_AFTER_LOAD_MS = 250L
        private const val THEME_SAMPLE_AFTER_CONFIG_MS = 700L
    }
}
