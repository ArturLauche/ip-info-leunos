package com.leunos.ipinfo.settings

import com.leunos.ipinfo.updates.CheckError
import com.leunos.ipinfo.updates.CheckOutcome
import com.leunos.ipinfo.updates.Fixtures
import com.leunos.ipinfo.updates.NetworkTraits
import com.leunos.ipinfo.updates.UpdateCandidate
import com.leunos.ipinfo.updates.UpdateFailure
import com.leunos.ipinfo.updates.UpdateMetadataParser
import com.leunos.ipinfo.updates.UpdatePhase
import com.leunos.ipinfo.updates.UpdateState
import com.leunos.ipinfo.updates.UpdateStateMachine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class UpdatePresentationTest {
    private val unmetered = NetworkTraits(connected = true, metered = false)
    private val metered = NetworkTraits(connected = true, metered = true)
    private val offline = NetworkTraits(connected = false, metered = true)

    private val candidate = UpdateCandidate(UpdateMetadataParser.parse(Fixtures.metadataJson("1.1.0")), Fixtures.metadataJson("1.1.0"), null, "", null)
    private val available = UpdateStateMachine.checkSucceeded(UpdateState(), CheckOutcome.Available(candidate), 10)

    private fun ui(
        state: UpdateState,
        network: NetworkTraits = unmetered,
        checking: Boolean = false,
        enabled: Boolean = true,
        canInstall: Boolean = true,
    ) = UpdatePresentation.from(state, checking, enabled, canInstall, network)

    @Test
    fun debugBuildsOnlyExplainThatUpdatesAreDisabled() {
        val ui = ui(available, enabled = false)
        assertEquals(UpdateStatus.DEBUG_BUILD, ui.status)
        assertFalse(ui.showCheck || ui.showDownload || ui.showInstall || ui.showRetry || ui.showCancel)
    }

    @Test
    fun neverCheckedOffersACheck() {
        val ui = ui(UpdateState())
        assertEquals(UpdateStatus.NEVER_CHECKED, ui.status)
        assertTrue(ui.showCheck)
    }

    @Test
    fun upToDateAfterASuccessfulCheck() {
        val ui = ui(UpdateState(lastCheckSuccessAt = 5))
        assertEquals(UpdateStatus.UP_TO_DATE, ui.status)
        assertTrue(ui.showCheck)
    }

    @Test
    fun checkingDisablesFurtherActions() {
        val ui = ui(UpdateState(), checking = true)
        assertEquals(UpdateStatus.CHECKING, ui.status)
        assertFalse(ui.showCheck)
    }

    @Test
    fun availableOnUnmeteredOffersDownloadWithoutAWarning() {
        val ui = ui(available, network = unmetered)
        assertEquals(UpdateStatus.AVAILABLE, ui.status)
        assertTrue(ui.showDownload)
        assertFalse(ui.showMeteredNote)
    }

    @Test
    fun availableOnMeteredOffersExplicitDownloadAndStatesTheDataUse() {
        val ui = ui(available, network = metered)
        assertTrue(ui.showDownload)
        assertTrue(ui.showMeteredNote)
    }

    @Test
    fun offlineHidesTheDownloadButton() {
        assertFalse(ui(available, network = offline).showDownload)
    }

    @Test
    fun downloadingShowsProgressAndCancel() {
        val ui = ui(UpdateStateMachine.downloadStarted(available))
        assertEquals(UpdateStatus.DOWNLOADING, ui.status)
        assertTrue(ui.showProgress && ui.showCancel)
        assertFalse(ui.showCheck || ui.showDownload)
    }

    @Test
    fun readyToInstallOffersInstallAndFlagsMissingInstallPermission() {
        val ready = UpdateStateMachine.downloadVerified(UpdateStateMachine.downloadStarted(available))
        val allowed = ui(ready, canInstall = true)
        assertEquals(UpdateStatus.READY_TO_INSTALL, allowed.status)
        assertTrue(allowed.showInstall)
        assertFalse(allowed.installNeedsPermission)
        assertTrue(ui(ready, canInstall = false).installNeedsPermission)
    }

    @Test
    fun failedDownloadsOfferRetry() {
        val failed = UpdateStateMachine.downloadFailed(UpdateStateMachine.downloadStarted(available), UpdateFailure.DOWNLOAD_INTERRUPTED)
        val ui = ui(failed)
        assertEquals(UpdateStatus.DOWNLOAD_FAILED, ui.status)
        assertTrue(ui.showRetry)
    }

    @Test
    fun failedInstallsAreReportedAsInstallFailures() {
        val failed = UpdateStateMachine.installFailed(UpdateStateMachine.downloadVerified(available), UpdateFailure.INSTALL_BLOCKED)
        assertEquals(UpdateStatus.INSTALL_FAILED, ui(failed).status)
        assertTrue(UpdatePresentation.isInstallFailure(UpdateFailure.INSTALL_CONFLICT))
        assertFalse(UpdatePresentation.isInstallFailure(UpdateFailure.CHECKSUM_MISMATCH))
    }

    @Test
    fun installingHidesEveryAction() {
        val installing = UpdateStateMachine.installStarted(UpdateStateMachine.downloadVerified(available), 1)
        val ui = ui(installing)
        assertEquals(UpdateStatus.INSTALLING, ui.status)
        assertFalse(ui.showInstall || ui.showCheck || ui.showRetry)
    }

    @Test
    fun failedChecksAndUnsupportedDevicesAreExplained() {
        assertEquals(UpdateStatus.CHECK_FAILED, ui(UpdateState(lastCheckError = CheckError.NETWORK)).status)
        assertEquals(UpdateStatus.UNSUPPORTED_DEVICE, ui(UpdateState(lastCheckError = CheckError.UNSUPPORTED_DEVICE, unsupportedVersion = "2.0.0")).status)
        assertEquals(UpdatePhase.IDLE, UpdateState().phase)
    }
}
