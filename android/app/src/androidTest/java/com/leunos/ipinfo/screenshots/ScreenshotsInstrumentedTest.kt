package com.leunos.ipinfo.screenshots

import android.app.Activity
import android.os.SystemClock
import android.util.Log
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import androidx.test.platform.app.InstrumentationRegistry
import com.leunos.ipinfo.MainActivity
import com.leunos.ipinfo.TestUtils
import com.leunos.ipinfo.diagnostics.NetworkDiagnosticsActivity
import com.leunos.ipinfo.settings.AboutActivity
import com.leunos.ipinfo.settings.SettingsActivity
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

/**
 * Captures the main screens in light and dark mode for reviewers. It only runs when started with
 * `-e captureScreenshots true` (android/scripts/capture-screenshots.sh) and writes into the test package's own
 * external files directory, which the test process may write on every API level.
 * Capturing is best effort and never fails the suite.
 */
@RunWith(AndroidJUnit4::class)
@LargeTest
class ScreenshotsInstrumentedTest {

    @Test
    fun captureMainScreens() {
        if (InstrumentationRegistry.getArguments().getString("captureScreenshots") != "true") return
        val dir = outputDir()
        try {
            for (night in listOf(false, true)) {
                TestUtils.shell("cmd uimode night ${if (night) "yes" else "no"}")
                val suffix = if (night) "dark" else "light"
                capture(MainActivity::class.java, "main-$suffix", dir, settleMs = 20_000)
                capture(NetworkDiagnosticsActivity::class.java, "diagnostics-$suffix", dir, settleMs = 6_000)
                capture(SettingsActivity::class.java, "settings-$suffix", dir, settleMs = 3_000)
                capture(AboutActivity::class.java, "about-$suffix", dir, settleMs = 3_000)
            }
        } finally {
            TestUtils.shell("cmd uimode night no")
        }
    }

    private fun outputDir(): File {
        val dir = File(InstrumentationRegistry.getInstrumentation().context.getExternalFilesDir(null), "screenshots")
        dir.deleteRecursively()
        dir.mkdirs()
        return dir
    }

    private fun <A : Activity> capture(activity: Class<A>, name: String, dir: File, settleMs: Long) {
        ActivityScenario.launch(activity).use {
            SystemClock.sleep(settleMs)
            val saved = runCatching { TestUtils.device.takeScreenshot(File(dir, "$name.png")) }.getOrDefault(false)
            if (!saved) Log.w("Screenshots", "could not capture $name")
        }
    }
}
