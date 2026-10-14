package com.leunos.ipinfo.updates

import androidx.work.NetworkType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class UpdateSchedulerTest {

    @Test
    fun automaticDownloadsRequireAnUnmeteredNetworkByDefault() {
        val constraints = UpdateScheduler.downloadConstraints(userInitiated = false, preferences = UpdatePreferences())
        assertEquals(NetworkType.UNMETERED, constraints.requiredNetworkType)
        assertTrue(constraints.requiresStorageNotLow())
    }

    @Test
    fun manualDownloadsRunOnAnyConnectedNetwork() {
        val constraints = UpdateScheduler.downloadConstraints(userInitiated = true, preferences = UpdatePreferences())
        assertEquals(NetworkType.CONNECTED, constraints.requiredNetworkType)
        assertFalse(constraints.requiresStorageNotLow())
    }

    @Test
    fun meteredOptInRelaxesAutomaticDownloads() {
        val constraints = UpdateScheduler.downloadConstraints(userInitiated = false, preferences = UpdatePreferences(allowMeteredAutoDownload = true))
        assertEquals(NetworkType.CONNECTED, constraints.requiredNetworkType)
    }

    @Test
    fun periodicChecksNeedANetworkAndAHealthyBattery() {
        val constraints = UpdateScheduler.periodicConstraints()
        assertEquals(NetworkType.CONNECTED, constraints.requiredNetworkType)
        assertTrue(constraints.requiresBatteryNotLow())
    }

    @Test
    fun uniqueWorkNamesAreStable() {
        assertEquals("update-check-periodic", UpdateScheduler.UNIQUE_CHECK)
        assertEquals("update-download", UpdateScheduler.UNIQUE_DOWNLOAD)
    }
}
