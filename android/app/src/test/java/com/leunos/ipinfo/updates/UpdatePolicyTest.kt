package com.leunos.ipinfo.updates

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class UpdatePolicyTest {
    private val unmetered = NetworkTraits(connected = true, metered = false)
    private val metered = NetworkTraits(connected = true, metered = true)
    private val offline = NetworkTraits(connected = false, metered = true)
    private val defaults = UpdatePreferences()

    @Test
    fun defaultsAreAutomaticChecksAndUnmeteredOnlyDownloads() {
        assertTrue(defaults.autoCheck)
        assertTrue(defaults.autoDownload)
        assertFalse(defaults.allowMeteredAutoDownload)
    }

    @Test
    fun downloadsStartAutomaticallyOnlyOnUnmeteredNetworks() {
        assertEquals(AutoDownloadDecision.START, UpdatePolicy.autoDownload(defaults, unmetered))
    }

    @Test
    fun meteredNetworksWaitForAnUnmeteredOne() {
        assertEquals(AutoDownloadDecision.WAIT_FOR_UNMETERED, UpdatePolicy.autoDownload(defaults, metered))
        assertEquals(AutoDownloadDecision.WAIT_FOR_UNMETERED, UpdatePolicy.autoDownload(defaults, offline))
    }

    @Test
    fun automaticDownloadsNeedBothAutomaticSwitches() {
        assertTrue(UpdatePolicy.automaticDownloadAllowed(defaults))
        assertFalse(UpdatePolicy.automaticDownloadAllowed(defaults.copy(autoDownload = false)))
        assertFalse(UpdatePolicy.automaticDownloadAllowed(defaults.copy(autoCheck = false)))
    }

    @Test
    fun optedInUsersStartWithoutANetworkBecauseTheQueuedRequestWaitsForOne() {
        // START means "enqueue": UpdateScheduler gives the request a CONNECTED constraint, so it waits for any network.
        // Reporting WAIT_FOR_UNMETERED here would wrongly tell the user the app is waiting for Wi-Fi.
        assertEquals(AutoDownloadDecision.START, UpdatePolicy.autoDownload(defaults.copy(allowMeteredAutoDownload = true), offline))
    }

    @Test
    fun usersCanOptInToMeteredAutomaticDownloads() {
        val optIn = defaults.copy(allowMeteredAutoDownload = true)
        assertEquals(AutoDownloadDecision.START, UpdatePolicy.autoDownload(optIn, metered))
    }

    @Test
    fun disabledAutomationNeverDownloads() {
        assertEquals(AutoDownloadDecision.DISABLED, UpdatePolicy.autoDownload(defaults.copy(autoDownload = false), unmetered))
        assertEquals(AutoDownloadDecision.DISABLED, UpdatePolicy.autoDownload(defaults.copy(autoCheck = false), unmetered))
        assertEquals(AutoDownloadDecision.DISABLED, UpdatePolicy.autoDownload(defaults.copy(autoCheck = false, allowMeteredAutoDownload = true), metered))
    }

    @Test
    fun manualDownloadsAreAllowedOnMeteredNetworksButNeedAConnection() {
        assertTrue(UpdatePolicy.manualDownloadAllowed(metered))
        assertTrue(UpdatePolicy.manualDownloadAllowed(unmetered))
        assertFalse(UpdatePolicy.manualDownloadAllowed(offline))
    }

    @Test
    fun launchChecksRespectTheCooldown() {
        val now = 10_000_000_000L
        assertTrue(UpdatePolicy.shouldCheckOnLaunch(defaults, UpdateState(), now))
        assertFalse(UpdatePolicy.shouldCheckOnLaunch(defaults, UpdateState(lastCheckAttemptAt = now - 1_000), now))
        assertTrue(UpdatePolicy.shouldCheckOnLaunch(defaults, UpdateState(lastCheckAttemptAt = now - UpdatePolicy.CHECK_COOLDOWN_MS), now))
        assertTrue("clock moved backwards", UpdatePolicy.shouldCheckOnLaunch(defaults, UpdateState(lastCheckAttemptAt = now + 5_000), now))
    }

    @Test
    fun launchChecksStayOffWhenDisabledOrRateLimited() {
        val now = 10_000_000_000L
        assertFalse(UpdatePolicy.shouldCheckOnLaunch(defaults.copy(autoCheck = false), UpdateState(), now))
        assertFalse(UpdatePolicy.shouldCheckOnLaunch(defaults, UpdateState(rateLimitedUntil = now + 60_000), now))
        assertTrue(UpdatePolicy.shouldCheckOnLaunch(defaults, UpdateState(rateLimitedUntil = now - 1), now))
    }

    @Test
    fun periodicChecksRunAboutOnceADay() {
        assertEquals(24L, UpdatePolicy.PERIODIC_INTERVAL_HOURS)
    }
}
