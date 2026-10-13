package com.leunos.ipinfo.upgrade

import android.content.Context
import android.content.pm.PackageManager
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.leunos.ipinfo.settings.AppPreferences
import com.leunos.ipinfo.updates.UpdateStateStore
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Step 2 of the emulator upgrade test: after `adb install -r` of the newer build, the package identity and
 * the user's settings must be unchanged. Pass `-e expectedVersionCode <n>` to assert the new version.
 */
@RunWith(AndroidJUnit4::class)
class VerifySettingsInstrumentedTest {
    @Test
    fun verify() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context: Context = instrumentation.targetContext
        val expected = InstrumentationRegistry.getArguments().getString("expectedVersionCode")?.toLong()

        @Suppress("DEPRECATION")
        val info = context.packageManager.getPackageInfo(context.packageName, PackageManager.GET_SIGNING_CERTIFICATES)
        if (expected != null) assertEquals("the new build must be the installed one", expected, info.longVersionCode)

        val prefs = AppPreferences(context.getSharedPreferences(AppPreferences.FILE_NAME, Context.MODE_PRIVATE))
        assertFalse(prefs.autoUpdateChecks)
        assertFalse(prefs.autoDownload)
        assertTrue(prefs.allowMeteredAutoDownload)
        assertFalse(prefs.updateNotifications)
        assertEquals(UpgradeMarkers.BACKGROUND, prefs.lastWebBackground)
        val store = UpdateStateStore(context.getSharedPreferences(UpdateStateStore.FILE_NAME, Context.MODE_PRIVATE))
        assertEquals(UpgradeMarkers.RATE_LIMIT_UNTIL, store.current.rateLimitedUntil)
    }
}
