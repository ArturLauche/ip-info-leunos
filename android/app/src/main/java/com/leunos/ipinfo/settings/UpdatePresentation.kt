package com.leunos.ipinfo.settings

import com.leunos.ipinfo.updates.CheckError
import com.leunos.ipinfo.updates.DownloadProgress
import com.leunos.ipinfo.updates.NetworkTraits
import com.leunos.ipinfo.updates.UpdateFailure
import com.leunos.ipinfo.updates.UpdatePhase
import com.leunos.ipinfo.updates.UpdateState

enum class UpdateStatus {
    DEBUG_BUILD,
    CHECKING,
    NEVER_CHECKED,
    UP_TO_DATE,
    UNSUPPORTED_DEVICE,
    AVAILABLE,
    DOWNLOADING,
    READY_TO_INSTALL,
    INSTALLING,
    DOWNLOAD_FAILED,
    INSTALL_FAILED,
    CHECK_FAILED,
}

/** What the update section shows and which actions it offers; derived purely from state. */
data class UpdateUi(
    val status: UpdateStatus,
    val showCheck: Boolean,
    val showDownload: Boolean,
    val showCancel: Boolean,
    val showRetry: Boolean,
    val showInstall: Boolean,
    val showProgress: Boolean,
    /** Tell the user that tapping Download may use metered data. */
    val showMeteredNote: Boolean,
    /** Installing requires the user to allow installs from this app first. */
    val installNeedsPermission: Boolean,
)

object UpdatePresentation {
    private val INSTALL_FAILURES = setOf(
        UpdateFailure.INSTALL_BLOCKED,
        UpdateFailure.INSTALL_CONFLICT,
        UpdateFailure.INSTALL_INCOMPATIBLE,
        UpdateFailure.INSTALL_STORAGE,
        UpdateFailure.INSTALL_INVALID,
        UpdateFailure.INSTALL_FAILED,
    )

    fun isInstallFailure(failure: UpdateFailure?): Boolean = failure != null && failure in INSTALL_FAILURES

    fun from(
        state: UpdateState,
        checking: Boolean,
        updaterEnabled: Boolean,
        canInstallPackages: Boolean,
        network: NetworkTraits,
        @Suppress("UNUSED_PARAMETER") progress: DownloadProgress = DownloadProgress(),
    ): UpdateUi {
        if (!updaterEnabled) return ui(UpdateStatus.DEBUG_BUILD)

        val busy = state.phase == UpdatePhase.DOWNLOADING || state.phase == UpdatePhase.INSTALLING
        val canCheck = !checking && !busy

        return when {
            state.phase == UpdatePhase.DOWNLOADING -> ui(UpdateStatus.DOWNLOADING, cancel = true, progress = true)
            state.phase == UpdatePhase.INSTALLING -> ui(UpdateStatus.INSTALLING, progress = true)
            state.phase == UpdatePhase.READY_TO_INSTALL ->
                ui(UpdateStatus.READY_TO_INSTALL, check = canCheck, install = true, installNeedsPermission = !canInstallPackages)
            state.phase == UpdatePhase.FAILED && isInstallFailure(state.failure) ->
                ui(UpdateStatus.INSTALL_FAILED, check = canCheck, retry = true)
            state.phase == UpdatePhase.FAILED -> ui(UpdateStatus.DOWNLOAD_FAILED, check = canCheck, retry = true)
            state.phase == UpdatePhase.AVAILABLE ->
                ui(UpdateStatus.AVAILABLE, check = canCheck, download = network.connected, meteredNote = network.connected && network.metered)
            checking -> ui(UpdateStatus.CHECKING)
            state.lastCheckError == CheckError.UNSUPPORTED_DEVICE -> ui(UpdateStatus.UNSUPPORTED_DEVICE, check = canCheck)
            state.lastCheckError != null -> ui(UpdateStatus.CHECK_FAILED, check = canCheck)
            state.lastCheckSuccessAt == null -> ui(UpdateStatus.NEVER_CHECKED, check = canCheck)
            else -> ui(UpdateStatus.UP_TO_DATE, check = canCheck)
        }
    }

    private fun ui(
        status: UpdateStatus,
        check: Boolean = false,
        download: Boolean = false,
        cancel: Boolean = false,
        retry: Boolean = false,
        install: Boolean = false,
        progress: Boolean = false,
        meteredNote: Boolean = false,
        installNeedsPermission: Boolean = false,
    ) = UpdateUi(status, check, download, cancel, retry, install, progress, meteredNote, installNeedsPermission)
}
