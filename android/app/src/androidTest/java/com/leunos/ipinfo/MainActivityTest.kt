package com.leunos.ipinfo

import android.webkit.WebSettings
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.MediumTest
import com.leunos.ipinfo.TestUtils.read
import com.leunos.ipinfo.TestUtils.webView
import com.leunos.ipinfo.navigation.AppNavigator
import com.leunos.ipinfo.web.TrustedOrigin
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
@MediumTest
class MainActivityTest {

    @Test
    fun startsAndHostsAHardenedWebView() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            val settings = scenario.read { activity ->
                (activity.findViewById<android.view.ViewGroup>(R.id.web_container).getChildAt(0) as android.webkit.WebView).settings
            }
            assertTrue("the website needs JavaScript", settings.javaScriptEnabled)
            assertTrue("theme and language live in localStorage", settings.domStorageEnabled)
            assertFalse(settings.allowFileAccess)
            assertFalse(settings.allowContentAccess)
            assertFalse(settings.javaScriptCanOpenWindowsAutomatically)
            assertFalse(settings.supportMultipleWindows())
            assertEquals(WebSettings.MIXED_CONTENT_NEVER_ALLOW, settings.mixedContentMode)
            assertTrue(settings.safeBrowsingEnabled)
            assertFalse(settings.builtInZoomControls)
        }
    }

    @Test
    fun theUserAgentIsNotDisguised() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            val userAgent = scenario.webView()!!.settings.userAgentString
            assertTrue("WebView must identify itself honestly, was: $userAgent", userAgent.contains("wv"))
        }
    }

    @Test
    fun loadsTheProductionWebsiteOrShowsTheOfflineScreen() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            val settled = TestUtils.waitFor(60_000) {
                val web = scenario.webView()
                val trusted = TrustedOrigin.isTrusted(web?.url)
                trusted || scenario.read { it.findViewById<android.view.View>(R.id.offline_panel).visibility == android.view.View.VISIBLE }
            }
            assertTrue("neither the website nor the native error screen appeared", settled)
        }
    }

    @Test
    fun rotationKeepsTheSameActivityAndWebView() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            val activityBefore = scenario.read { it }
            val webBefore = scenario.webView()
            TestUtils.device.setOrientationLeft()
            try {
                TestUtils.waitFor(5_000) { false } // let the configuration change settle
                val activityAfter = scenario.read { it }
                assertSame("the activity must handle rotation itself", activityBefore, activityAfter)
                assertSame("the WebView must not be recreated (no reload)", webBefore, scenario.webView())
            } finally {
                TestUtils.device.setOrientationNatural()
                TestUtils.device.unfreezeRotation()
            }
        }
    }

    @Test
    fun returningFromANativeScreenDoesNotReloadTheWebView() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            val webBefore = scenario.webView()
            assertNotNull(webBefore)
            scenario.onActivity { AppNavigator.settings(it) }
            assertTrue("settings screen should appear", TestUtils.device.wait(androidx.test.uiautomator.Until.hasObject(androidx.test.uiautomator.By.text(TestUtils.context.getString(R.string.settings_title))), 15_000))
            TestUtils.device.pressBack()
            assertTrue(
                "main screen should be resumed again",
                TestUtils.waitFor(15_000) { scenario.state == androidx.lifecycle.Lifecycle.State.RESUMED },
            )
            assertSame(webBefore, scenario.webView())
        }
    }

    @Test
    fun menuButtonOpensTheQuickMenu() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            scenario.onActivity { it.findViewById<android.view.View>(R.id.menu_button).performClick() }
            val shown = TestUtils.device.wait(
                androidx.test.uiautomator.Until.hasObject(androidx.test.uiautomator.By.text(TestUtils.context.getString(R.string.menu_diagnostics))),
                10_000,
            )
            assertTrue("quick menu should list Network Diagnostics", shown)
        }
    }
}
