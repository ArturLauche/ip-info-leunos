package com.leunos.ipinfo.updates

import android.content.pm.PackageInstaller

enum class UpdatePhase { IDLE, AVAILABLE, DOWNLOADING, READY_TO_INSTALL, INSTALLING, FAILED }

/** Failures of the download / verify / install pipeline that the UI explains and lets the user retry. */
enum class UpdateFailure {
    DOWNLOAD_INTERRUPTED,
    DOWNLOAD_SERVER,
    DOWNLOAD_REJECTED,
    DOWNLOAD_NOT_FOUND,
    INSUFFICIENT_STORAGE,
    CHECKSUM_MISMATCH,
    VERIFICATION_FAILED,
    INSTALL_BLOCKED,
    INSTALL_CONFLICT,
    INSTALL_INCOMPATIBLE,
    INSTALL_STORAGE,
    INSTALL_INVALID,
    INSTALL_FAILED,
}

/** Failures that a later attempt can resolve without any change on the user's side. */
val UpdateFailure.isTransient: Boolean
    get() = this == UpdateFailure.DOWNLOAD_INTERRUPTED || this == UpdateFailure.DOWNLOAD_SERVER

/** How a failed download response is explained to the user and whether the download worker retries it. */
data class DownloadFailureClass(val failure: UpdateFailure, val retryable: Boolean)

/**
 * Statuses that mean "try again later" rather than "this will not work": timeouts, throttling (GitHub also answers
 * secondary rate limits with 403) and server errors. The metadata check and the APK download share this rule.
 */
fun isTransientHttpStatus(status: Int): Boolean = status == 403 || status == 408 || status == 429 || status in 500..599

/** Transient statuses may pass; a missing file or any other refusal will not. */
fun classifyDownloadStatus(status: Int): DownloadFailureClass = when {
    status == 404 -> DownloadFailureClass(UpdateFailure.DOWNLOAD_NOT_FOUND, retryable = false)
    isTransientHttpStatus(status) -> DownloadFailureClass(UpdateFailure.DOWNLOAD_SERVER, retryable = true)
    else -> DownloadFailureClass(UpdateFailure.DOWNLOAD_REJECTED, retryable = false)
}

/** Why the last update check did not produce a result. */
enum class CheckError { NETWORK, RATE_LIMITED, SERVER, INVALID_RELEASE, UNSUPPORTED_DEVICE }

data class UpdateState(
    val phase: UpdatePhase = UpdatePhase.IDLE,
    val candidate: UpdateCandidate? = null,
    val failure: UpdateFailure? = null,
    val failureDetail: String? = null,
    val lastCheckSuccessAt: Long? = null,
    val lastCheckAttemptAt: Long? = null,
    val lastCheckError: CheckError? = null,
    val rateLimitedUntil: Long = 0,
    val installSessionId: Int = NO_SESSION,
    /** Newest version that needs a newer Android than this device runs. */
    val unsupportedVersion: String? = null,
) {
    companion object {
        const val NO_SESSION = -1
    }
}

/** Live byte counters of a running download; not persisted. */
data class DownloadProgress(val downloadedBytes: Long = 0, val totalBytes: Long = 0) {
    val fraction: Float get() = if (totalBytes <= 0) 0f else (downloadedBytes.toFloat() / totalBytes).coerceIn(0f, 1f)
}

/** Pure state transitions of the update flow. Persistence and side effects live elsewhere. */
object UpdateStateMachine {

    fun checkStarted(state: UpdateState, now: Long): UpdateState = state.copy(lastCheckAttemptAt = now)

    fun checkSucceeded(state: UpdateState, outcome: CheckOutcome, now: Long): UpdateState {
        val base = state.copy(
            lastCheckAttemptAt = now,
            lastCheckSuccessAt = now,
            lastCheckError = null,
            rateLimitedUntil = 0,
            unsupportedVersion = null,
        )
        return when (outcome) {
            is CheckOutcome.Available -> applyCandidate(base, outcome.candidate)
            is CheckOutcome.UpToDate -> clearCandidate(base)
            is CheckOutcome.UnsupportedDevice ->
                clearCandidate(base).copy(lastCheckError = CheckError.UNSUPPORTED_DEVICE, unsupportedVersion = outcome.version.toString())
            is CheckOutcome.Failed -> checkFailed(state, outcome.error, now)
        }
    }

    fun checkFailed(state: UpdateState, error: UpdateError, now: Long): UpdateState = state.copy(
        lastCheckAttemptAt = now,
        lastCheckError = when (error) {
            is UpdateError.Network -> CheckError.NETWORK
            is UpdateError.RateLimited -> CheckError.RATE_LIMITED
            is UpdateError.Server -> CheckError.SERVER
            is UpdateError.InvalidRelease, is UpdateError.InvalidMetadata -> CheckError.INVALID_RELEASE
        },
        rateLimitedUntil = (error as? UpdateError.RateLimited)?.retryAtMillis ?: state.rateLimitedUntil,
    )

    private fun applyCandidate(state: UpdateState, candidate: UpdateCandidate): UpdateState {
        val current = state.candidate
        val sameRelease = current != null && current.metadata.versionCode == candidate.metadata.versionCode
        if (state.phase == UpdatePhase.INSTALLING && sameRelease) return state.copy(candidate = candidate)
        // A download that failed for a transient reason gets a fresh automatic attempt on the next successful check.
        val retryable = state.phase == UpdatePhase.FAILED && state.failure?.isTransient == true
        if (sameRelease && state.phase != UpdatePhase.IDLE && !retryable) return state.copy(candidate = candidate)
        return state.copy(
            phase = UpdatePhase.AVAILABLE,
            candidate = candidate,
            failure = null,
            failureDetail = null,
            installSessionId = UpdateState.NO_SESSION,
        )
    }

    private fun clearCandidate(state: UpdateState): UpdateState =
        if (state.phase == UpdatePhase.INSTALLING) state else state.copy(
            phase = UpdatePhase.IDLE,
            candidate = null,
            failure = null,
            failureDetail = null,
            installSessionId = UpdateState.NO_SESSION,
        )

    fun downloadStarted(state: UpdateState): UpdateState =
        if (state.candidate == null) state else state.copy(phase = UpdatePhase.DOWNLOADING, failure = null, failureDetail = null)

    fun downloadVerified(state: UpdateState): UpdateState =
        if (state.candidate == null) state else state.copy(phase = UpdatePhase.READY_TO_INSTALL, failure = null, failureDetail = null)

    fun downloadFailed(state: UpdateState, failure: UpdateFailure, detail: String? = null): UpdateState =
        state.copy(phase = UpdatePhase.FAILED, failure = failure, failureDetail = detail)

    /**
     * A queued automatic download that will not run (the user switched automatic downloads off): the release stays
     * available for a manual download, and a DOWNLOADING phase left behind by a killed attempt is cleared.
     */
    fun staleDownloadCleared(state: UpdateState): UpdateState =
        if (state.phase == UpdatePhase.DOWNLOADING) downloadCancelled(state) else state

    /** The user cancelled or the download was paused: the release is still available. */
    fun downloadCancelled(state: UpdateState): UpdateState =
        if (state.candidate == null) state.copy(phase = UpdatePhase.IDLE) else state.copy(phase = UpdatePhase.AVAILABLE)

    fun installStarted(state: UpdateState, sessionId: Int): UpdateState =
        state.copy(phase = UpdatePhase.INSTALLING, installSessionId = sessionId, failure = null, failureDetail = null)

    /** Install cancelled by the user or handed back to the user: the verified APK is still ready. */
    fun installAborted(state: UpdateState): UpdateState =
        state.copy(phase = UpdatePhase.READY_TO_INSTALL, installSessionId = UpdateState.NO_SESSION)

    /** The user retries after a failed install while the verified APK is still stored. */
    fun retryInstall(state: UpdateState): UpdateState =
        if (state.candidate == null) state else state.copy(phase = UpdatePhase.READY_TO_INSTALL, failure = null, failureDetail = null)

    /** The user retries after a failed download or verification: start again from the available release. */
    fun resetForRedownload(state: UpdateState): UpdateState =
        if (state.candidate == null) state else state.copy(phase = UpdatePhase.AVAILABLE, failure = null, failureDetail = null)

    fun installFailed(state: UpdateState, failure: UpdateFailure, detail: String? = null): UpdateState =
        state.copy(phase = UpdatePhase.FAILED, failure = failure, failureDetail = detail, installSessionId = UpdateState.NO_SESSION)

    /** Called at start-up and after a package replacement: drops state about versions that are now installed. */
    fun reconcile(state: UpdateState, installedVersionCode: Long): UpdateState {
        val candidate = state.candidate ?: return state
        return if (candidate.metadata.versionCode.toLong() <= installedVersionCode) {
            state.copy(
                phase = UpdatePhase.IDLE,
                candidate = null,
                failure = null,
                failureDetail = null,
                installSessionId = UpdateState.NO_SESSION,
            )
        } else {
            state
        }
    }
}

sealed interface InstallEvent {
    data object Success : InstallEvent
    data object PendingUserAction : InstallEvent

    /** The user declined the system confirmation. */
    data object Aborted : InstallEvent
    data class Failed(val failure: UpdateFailure, val message: String?) : InstallEvent
}

object InstallStatusMapper {
    fun map(status: Int, message: String?): InstallEvent = when (status) {
        PackageInstaller.STATUS_SUCCESS -> InstallEvent.Success
        PackageInstaller.STATUS_PENDING_USER_ACTION -> InstallEvent.PendingUserAction
        PackageInstaller.STATUS_FAILURE_ABORTED -> InstallEvent.Aborted
        PackageInstaller.STATUS_FAILURE_BLOCKED -> InstallEvent.Failed(UpdateFailure.INSTALL_BLOCKED, message)
        PackageInstaller.STATUS_FAILURE_CONFLICT -> InstallEvent.Failed(UpdateFailure.INSTALL_CONFLICT, message)
        PackageInstaller.STATUS_FAILURE_INCOMPATIBLE -> InstallEvent.Failed(UpdateFailure.INSTALL_INCOMPATIBLE, message)
        PackageInstaller.STATUS_FAILURE_STORAGE -> InstallEvent.Failed(UpdateFailure.INSTALL_STORAGE, message)
        PackageInstaller.STATUS_FAILURE_INVALID -> InstallEvent.Failed(UpdateFailure.INSTALL_INVALID, message)
        else -> InstallEvent.Failed(UpdateFailure.INSTALL_FAILED, message)
    }
}
