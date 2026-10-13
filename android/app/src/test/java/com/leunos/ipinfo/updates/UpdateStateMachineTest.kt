package com.leunos.ipinfo.updates

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class UpdateStateMachineTest {

    private fun candidate(version: String = "1.1.0"): UpdateCandidate {
        val metadata = UpdateMetadataParser.parse(Fixtures.metadataJson(version))
        return UpdateCandidate(metadata, Fixtures.metadataJson(version), "notes", "https://example/r", "2026-10-13T12:00:00Z")
    }

    private val available = UpdateStateMachine.checkSucceeded(UpdateState(), CheckOutcome.Available(candidate()), 100)

    @Test
    fun freshCandidateBecomesAvailable() {
        assertEquals(UpdatePhase.AVAILABLE, available.phase)
        assertEquals(100L, available.lastCheckSuccessAt)
        assertNull(available.lastCheckError)
    }

    @Test
    fun happyPathProgressesThroughDownloadVerifyAndInstall() {
        var s = UpdateStateMachine.downloadStarted(available)
        assertEquals(UpdatePhase.DOWNLOADING, s.phase)
        s = UpdateStateMachine.downloadVerified(s)
        assertEquals(UpdatePhase.READY_TO_INSTALL, s.phase)
        s = UpdateStateMachine.installStarted(s, 42)
        assertEquals(UpdatePhase.INSTALLING, s.phase)
        assertEquals(42, s.installSessionId)
        s = UpdateStateMachine.reconcile(s, AppVersion(1, 1, 0).versionCode.toLong())
        assertEquals(UpdatePhase.IDLE, s.phase)
        assertNull(s.candidate)
        assertEquals(UpdateState.NO_SESSION, s.installSessionId)
    }

    @Test
    fun failedDownloadsCanBeRetriedAndCancelledOnes_returnToAvailable() {
        val failed = UpdateStateMachine.downloadFailed(UpdateStateMachine.downloadStarted(available), UpdateFailure.DOWNLOAD_INTERRUPTED)
        assertEquals(UpdatePhase.FAILED, failed.phase)
        assertEquals(UpdateFailure.DOWNLOAD_INTERRUPTED, failed.failure)
        assertEquals(UpdatePhase.AVAILABLE, UpdateStateMachine.resetForRedownload(failed).phase)
        assertNull(UpdateStateMachine.resetForRedownload(failed).failure)

        val cancelled = UpdateStateMachine.downloadCancelled(UpdateStateMachine.downloadStarted(available))
        assertEquals(UpdatePhase.AVAILABLE, cancelled.phase)
    }

    @Test
    fun aTransientDownloadFailureGetsAFreshAutomaticAttemptOnTheNextCheck() {
        for (failure in listOf(UpdateFailure.DOWNLOAD_INTERRUPTED, UpdateFailure.DOWNLOAD_SERVER)) {
            val failed = UpdateStateMachine.downloadFailed(UpdateStateMachine.downloadStarted(available), failure)
            val again = UpdateStateMachine.checkSucceeded(failed, CheckOutcome.Available(candidate()), 500)
            assertEquals(failure.name, UpdatePhase.AVAILABLE, again.phase)
            assertNull(failure.name, again.failure)
        }
    }

    @Test
    fun failuresThatNeedTheUserStayVisibleInsteadOfBeingRetriedByEveryCheck() {
        val permanent = listOf(
            UpdateFailure.CHECKSUM_MISMATCH,
            UpdateFailure.VERIFICATION_FAILED,
            UpdateFailure.INSUFFICIENT_STORAGE,
            UpdateFailure.DOWNLOAD_NOT_FOUND,
            UpdateFailure.DOWNLOAD_REJECTED,
            UpdateFailure.INSTALL_FAILED,
        )
        for (failure in permanent) {
            val failed = UpdateStateMachine.downloadFailed(UpdateStateMachine.downloadStarted(available), failure)
            val again = UpdateStateMachine.checkSucceeded(failed, CheckOutcome.Available(candidate()), 500)
            assertEquals(failure.name, UpdatePhase.FAILED, again.phase)
            assertEquals(failure, again.failure)
        }
    }

    @Test
    fun skippingAQueuedAutomaticDownloadClearsOnlyAStaleDownloadingPhase() {
        val downloading = UpdateStateMachine.downloadStarted(available)
        val cleared = UpdateStateMachine.staleDownloadCleared(downloading)
        assertEquals(UpdatePhase.AVAILABLE, cleared.phase)
        assertEquals(downloading.candidate, cleared.candidate)

        val ready = UpdateStateMachine.downloadVerified(downloading)
        val untouched = listOf(
            available,
            ready,
            UpdateStateMachine.installStarted(ready, 3),
            UpdateStateMachine.downloadFailed(downloading, UpdateFailure.CHECKSUM_MISMATCH),
        )
        for (state in untouched) assertEquals(state.phase.name, state, UpdateStateMachine.staleDownloadCleared(state))
    }

    @Test
    fun cancelledInstallKeepsTheVerifiedApkReady() {
        val installing = UpdateStateMachine.installStarted(UpdateStateMachine.downloadVerified(available), 7)
        val aborted = UpdateStateMachine.installAborted(installing)
        assertEquals(UpdatePhase.READY_TO_INSTALL, aborted.phase)
        assertEquals(UpdateState.NO_SESSION, aborted.installSessionId)
        assertEquals(available.candidate, aborted.candidate)
    }

    @Test
    fun failedInstallCanRetryWithoutRedownloading() {
        val failed = UpdateStateMachine.installFailed(UpdateStateMachine.installStarted(UpdateStateMachine.downloadVerified(available), 7), UpdateFailure.INSTALL_BLOCKED)
        assertEquals(UpdatePhase.FAILED, failed.phase)
        assertEquals(UpdatePhase.READY_TO_INSTALL, UpdateStateMachine.retryInstall(failed).phase)
    }

    @Test
    fun rediscoveringTheSameReleaseKeepsDownloadProgress() {
        val ready = UpdateStateMachine.downloadVerified(UpdateStateMachine.downloadStarted(available))
        val again = UpdateStateMachine.checkSucceeded(ready, CheckOutcome.Available(candidate()), 200)
        assertEquals(UpdatePhase.READY_TO_INSTALL, again.phase)
        assertEquals(200L, again.lastCheckSuccessAt)
    }

    @Test
    fun aNewerReleaseSupersedesAnOlderCandidate() {
        val ready = UpdateStateMachine.downloadVerified(UpdateStateMachine.downloadStarted(available))
        val newer = UpdateStateMachine.checkSucceeded(ready, CheckOutcome.Available(candidate("1.2.0")), 300)
        assertEquals(UpdatePhase.AVAILABLE, newer.phase)
        assertEquals("1.2.0", newer.candidate?.metadata?.versionName)
    }

    @Test
    fun anInstallInProgressIsNotDisturbedByChecks() {
        val installing = UpdateStateMachine.installStarted(UpdateStateMachine.downloadVerified(available), 3)
        val afterUpToDate = UpdateStateMachine.checkSucceeded(installing, CheckOutcome.UpToDate(AppVersion(1, 1, 0)), 400)
        assertEquals(UpdatePhase.INSTALLING, afterUpToDate.phase)
        assertEquals(3, afterUpToDate.installSessionId)
    }

    @Test
    fun upToDateClearsTheCandidate() {
        val cleared = UpdateStateMachine.checkSucceeded(available, CheckOutcome.UpToDate(AppVersion(1, 1, 0)), 500)
        assertEquals(UpdatePhase.IDLE, cleared.phase)
        assertNull(cleared.candidate)
    }

    @Test
    fun unsupportedDevicesAreRecorded() {
        val state = UpdateStateMachine.checkSucceeded(UpdateState(), CheckOutcome.UnsupportedDevice(AppVersion(2, 0, 0), 33), 600)
        assertEquals(CheckError.UNSUPPORTED_DEVICE, state.lastCheckError)
        assertEquals("2.0.0", state.unsupportedVersion)
        assertEquals(UpdatePhase.IDLE, state.phase)
    }

    @Test
    fun failedChecksRecordTheErrorAndKeepEverythingElse() {
        val ready = UpdateStateMachine.downloadVerified(UpdateStateMachine.downloadStarted(available))
        val failed = UpdateStateMachine.checkFailed(ready, UpdateError.Network(), 700)
        assertEquals(CheckError.NETWORK, failed.lastCheckError)
        assertEquals(UpdatePhase.READY_TO_INSTALL, failed.phase)
        assertEquals(100L, failed.lastCheckSuccessAt)

        val limited = UpdateStateMachine.checkFailed(UpdateState(), UpdateError.RateLimited(9_999), 800)
        assertEquals(CheckError.RATE_LIMITED, limited.lastCheckError)
        assertEquals(9_999L, limited.rateLimitedUntil)
    }

    @Test
    fun aSuccessfulCheckClearsPreviousCheckErrors() {
        val failed = UpdateStateMachine.checkFailed(UpdateState(), UpdateError.Server(500), 1)
        val ok = UpdateStateMachine.checkSucceeded(failed, CheckOutcome.UpToDate(null), 2)
        assertNull(ok.lastCheckError)
        assertEquals(0L, ok.rateLimitedUntil)
    }

    @Test
    fun reconcileKeepsCandidatesNewerThanTheInstalledVersion() {
        val kept = UpdateStateMachine.reconcile(available, AppVersion(1, 0, 0).versionCode.toLong())
        assertEquals(available, kept)
        assertTrue(UpdateStateMachine.reconcile(available, AppVersion(1, 2, 0).versionCode.toLong()).candidate == null)
    }
}
