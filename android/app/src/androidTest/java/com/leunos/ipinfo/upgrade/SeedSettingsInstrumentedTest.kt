package com.leunos.ipinfo.upgrade

import android.content.Context
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.leunos.ipinfo.settings.AppPreferences
import com.leunos.ipinfo.updates.UpdateStateStore
import org.junit.Test
import org.junit.runner.RunWith

/** Marker values written before an upgrade and checked afterwards by [VerifySettingsInstrumentedTest]. */
internal object UpgradeMarkers {
    const val BACKGROUND = 0xFF123456.toInt()
    const val RATE_LIMIT_UNTIL = 1_900_000_000_000L
}

/**
 * Step 1 of the emulator upgrade test (android/scripts/emulator-upgrade-test.sh): runs against the old
 * build and stores settings that must survive an in-place update to a newer build.
 */
@RunWith(AndroidJUnit4::class)
class SeedSettingsInstrumentedTest {
    @Test
    fun seed() {
        val context: Context = InstrumentationRegistry.getInstrumentation().targetContext
        val prefs = AppPreferences(context.getSharedPreferences(AppPreferences.FILE_NAME, Context.MODE_PRIVATE))
        prefs.autoUpdateChecks = false
        prefs.autoDownload = false
        prefs.allowMeteredAutoDownload = true
        prefs.updateNotifications = false
        prefs.lastWebBackground = UpgradeMarkers.BACKGROUND
        val store = UpdateStateStore(context.getSharedPreferences(UpdateStateStore.FILE_NAME, Context.MODE_PRIVATE))
        store.update { it.copy(rateLimitedUntil = UpgradeMarkers.RATE_LIMIT_UNTIL) }
    }
}
