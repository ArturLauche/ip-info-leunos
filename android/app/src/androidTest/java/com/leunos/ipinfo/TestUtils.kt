package com.leunos.ipinfo

import android.app.Activity
import android.content.Context
import android.os.SystemClock
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import androidx.test.core.app.ActivityScenario
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.UiDevice

/** Small helpers shared by the instrumentation tests. */
object TestUtils {
    val context: Context get() = InstrumentationRegistry.getInstrumentation().targetContext
    val device: UiDevice get() = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())

    fun shell(command: String): String = device.executeShellCommand(command)

    /** Polls [condition] until it holds or [timeoutMs] elapses. Returns whether it held. */
    fun waitFor(timeoutMs: Long = 15_000, intervalMs: Long = 200, condition: () -> Boolean): Boolean {
        val deadline = SystemClock.elapsedRealtime() + timeoutMs
        while (SystemClock.elapsedRealtime() < deadline) {
            if (runCatching(condition).getOrDefault(false)) return true
            SystemClock.sleep(intervalMs)
        }
        return runCatching(condition).getOrDefault(false)
    }

    fun <A : Activity, T> ActivityScenario<A>.read(block: (A) -> T): T {
        var result: Any? = null
        onActivity { result = block(it) }
        @Suppress("UNCHECKED_CAST")
        return result as T
    }

    fun ActivityScenario<MainActivity>.webView(): WebView? =
        read { activity -> activity.findViewById<ViewGroup>(R.id.web_container).getChildAt(0) as? WebView }

    fun ActivityScenario<MainActivity>.offlinePanelShown(): Boolean =
        read { activity -> activity.findViewById<View>(R.id.offline_panel).visibility == View.VISIBLE }
}
