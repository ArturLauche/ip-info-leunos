package com.leunos.ipinfo.updates

import android.content.Context
import android.content.Intent
import android.os.Build
import com.leunos.ipinfo.BuildConfig
import com.leunos.ipinfo.settings.AppPreferences
import com.leunos.ipinfo.updates.http.HttpTransport
import com.leunos.ipinfo.util.ForegroundTracker
import com.leunos.ipinfo.util.NetworkStatusProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withContext

/**
 * Single entry point for everything update related. UI and WorkManager workers call into this class;
 * it coordinates discovery, download, verification and installation and keeps [UpdateState] current.
 */
class UpdateRepository(
    private val context: Context,
    private val store: UpdateStateStore,
    private val preferences: AppPreferences,
    private val transport: HttpTransport,
    private val releasesCache: ReleasesCache,
    private val storage: UpdateStorage,
    private val installer: PackageInstallerController,
    private val scheduler: UpdateScheduler,
    private val notifier: UpdateNotifier,
    private val foreground: ForegroundTracker,
    private val network: NetworkStatusProvider,
    private val clock: Clock = Clock.SYSTEM,
) {
    enum class CheckTrigger { LAUNCH, BACKGROUND, MANUAL }

    sealed interface DownloadRun {
        data object Verified : DownloadRun
        data object NothingToDo : DownloadRun
        data object AlreadyRunning : DownloadRun
        data object Cancelled : DownloadRun
        data class Failed(val retryable: Boolean) : DownloadRun
    }

    val state: StateFlow<UpdateState> get() = store.state

    private val progressFlow = MutableStateFlow(DownloadProgress())
    val progress: StateFlow<DownloadProgress> = progressFlow.asStateFlow()

    private val checkingFlow = MutableStateFlow(false)
    val checking: StateFlow<Boolean> = checkingFlow.asStateFlow()

    private val checkLock = Mutex()
    private val downloadLock = Mutex()

    private val downloader = ApkDownloader(transport, storage)
    private val pinned: Set<String> =
        BuildConfig.PINNED_SIGNING_CERT_SHA256.split(',').map { it.trim() }.filter { it.isNotEmpty() }.toSet()

    val updaterEnabled: Boolean get() = BuildConfig.UPDATER_ENABLED

    fun canInstallPackages(): Boolean = installer.canRequestInstalls()

    // ------------------------------------------------------------------ discovery

    /** Returns null when the check was skipped (disabled, cooldown, already running, rate limited in background). */
    suspend fun checkForUpdates(trigger: CheckTrigger): CheckOutcome? {
        if (!BuildConfig.UPDATER_ENABLED) return null
        if (!checkLock.tryLock()) return null
        try {
            checkingFlow.value = true
            return withContext(Dispatchers.IO) { runCheck(trigger) }
        } finally {
            checkingFlow.value = false
            checkLock.unlock()
        }
    }

    private fun runCheck(trigger: CheckTrigger): CheckOutcome? {
        val now = clock.nowMillis()
        val before = store.current
        val prefs = preferences.updatePreferences()
        when (trigger) {
            CheckTrigger.LAUNCH -> if (!UpdatePolicy.shouldCheckOnLaunch(prefs, before, now)) return null
            CheckTrigger.BACKGROUND -> if (!prefs.autoCheck || now < before.rateLimitedUntil) return null
            CheckTrigger.MANUAL -> if (now < before.rateLimitedUntil) {
                return CheckOutcome.Failed(UpdateError.RateLimited(before.rateLimitedUntil))
            }
        }

        store.update { UpdateStateMachine.checkStarted(it, now) }
        val installedApp = PackageIdentity.installedApp(context)
        val checker = UpdateChecker(
            releases = GitHubReleaseService(transport, releasesCache, clock),
            transport = transport,
            validator = CandidateValidator(installedApp, Build.VERSION.SDK_INT, pinned),
            installed = installedApp,
        )
        val outcome = checker.check()
        val after = store.update { UpdateStateMachine.checkSucceeded(it, outcome, clock.nowMillis()) }
        syncStorage(before, after)

        if (outcome is CheckOutcome.Available && after.phase == UpdatePhase.AVAILABLE) onNewCandidate(outcome.candidate)
        return outcome
    }

    private fun syncStorage(before: UpdateState, after: UpdateState) {
        val previous = before.candidate?.metadata?.version
        val current = after.candidate?.metadata?.version
        if (previous != current) storage.cleanupExcept(current)
    }

    private fun onNewCandidate(candidate: UpdateCandidate) {
        val prefs = preferences.updatePreferences()
        val decision = UpdatePolicy.autoDownload(prefs, network.current())
        val notify = !foreground.isForeground
        when (decision) {
            AutoDownloadDecision.DISABLED -> if (notify) notifier.notifyUpdateAvailable(candidate, waitingForUnmetered = false)
            AutoDownloadDecision.START, AutoDownloadDecision.WAIT_FOR_UNMETERED -> {
                scheduler.enqueueDownload(userInitiated = false, preferences = prefs)
                if (decision == AutoDownloadDecision.WAIT_FOR_UNMETERED && notify) {
                    notifier.notifyUpdateAvailable(candidate, waitingForUnmetered = true)
                }
            }
        }
    }

    // ------------------------------------------------------------------ download

    /** The user tapped Download (possibly on a metered network, which the UI states explicitly). */
    fun requestDownload() {
        val state = store.current
        val candidate = state.candidate ?: return
        if (state.phase == UpdatePhase.DOWNLOADING || state.phase == UpdatePhase.INSTALLING || state.phase == UpdatePhase.READY_TO_INSTALL) return
        store.update { UpdateStateMachine.downloadStarted(it) }
        progressFlow.value = DownloadProgress(0, candidate.metadata.apkSizeBytes)
        scheduler.enqueueDownload(userInitiated = true, preferences = preferences.updatePreferences())
    }

    /** Retry after a failure: re-install if the verified APK is still there, otherwise download again. */
    fun retry() {
        val state = store.current
        val candidate = state.candidate ?: return
        val installFailure = UpdateFailure.entries.filter { it.name.startsWith("INSTALL_") }
        if (state.failure in installFailure && storage.apkFile(candidate.metadata.version).isFile) {
            store.update { UpdateStateMachine.retryInstall(it) }
        } else {
            store.update { UpdateStateMachine.resetForRedownload(it) }
            requestDownload()
        }
    }

    fun cancelDownload() {
        scheduler.cancelDownload()
        store.update { if (it.phase == UpdatePhase.DOWNLOADING) UpdateStateMachine.downloadCancelled(it) else it }
        progressFlow.value = DownloadProgress()
    }

    /** Runs inside the download worker. Safe to call repeatedly; a second concurrent call is a no-op. */
    suspend fun runDownload(userInitiated: Boolean): DownloadRun {
        if (!downloadLock.tryLock()) return DownloadRun.AlreadyRunning
        try {
            val candidate = store.current.candidate ?: return DownloadRun.NothingToDo
            if (store.current.phase == UpdatePhase.READY_TO_INSTALL && storage.apkFile(candidate.metadata.version).isFile) {
                return DownloadRun.Verified
            }
            if (store.current.phase == UpdatePhase.INSTALLING) return DownloadRun.NothingToDo

            store.update { UpdateStateMachine.downloadStarted(it) }
            progressFlow.value = DownloadProgress(0, candidate.metadata.apkSizeBytes)
            val job = currentCoroutineContext()[Job]

            val result = withContext(Dispatchers.IO) {
                downloader.download(
                    candidate,
                    isCancelled = { job?.isActive == false },
                    onProgress = { done, total -> progressFlow.value = DownloadProgress(done, total) },
                )
            }
            return handleDownloadResult(candidate, result, userInitiated)
        } finally {
            downloadLock.unlock()
        }
    }

    private suspend fun handleDownloadResult(candidate: UpdateCandidate, result: DownloadResult, userInitiated: Boolean): DownloadRun {
        fun fail(failure: UpdateFailure, detail: String?, retryable: Boolean): DownloadRun {
            store.update { UpdateStateMachine.downloadFailed(it, failure, detail) }
            return DownloadRun.Failed(retryable)
        }
        return when (result) {
            is DownloadResult.Completed -> verifyAndFinish(candidate, result, userInitiated)
            is DownloadResult.InsufficientStorage -> fail(UpdateFailure.INSUFFICIENT_STORAGE, null, retryable = false)
            is DownloadResult.Interrupted -> fail(UpdateFailure.DOWNLOAD_INTERRUPTED, null, retryable = true)
            is DownloadResult.HttpError -> when {
                result.status == 404 -> fail(UpdateFailure.DOWNLOAD_NOT_FOUND, null, retryable = false)
                result.status in 500..599 || result.status == 429 -> fail(UpdateFailure.DOWNLOAD_SERVER, result.status.toString(), retryable = true)
                else -> fail(UpdateFailure.DOWNLOAD_SERVER, result.status.toString(), retryable = false)
            }
            is DownloadResult.ChecksumMismatch -> fail(UpdateFailure.CHECKSUM_MISMATCH, null, retryable = false)
            is DownloadResult.UnexpectedContent -> fail(UpdateFailure.VERIFICATION_FAILED, result.detail, retryable = false)
            DownloadResult.Cancelled -> {
                store.update { UpdateStateMachine.downloadCancelled(it) }
                progressFlow.value = DownloadProgress()
                DownloadRun.Cancelled
            }
        }
    }

    private suspend fun verifyAndFinish(candidate: UpdateCandidate, result: DownloadResult.Completed, userInitiated: Boolean): DownloadRun {
        val verification = withContext(Dispatchers.IO) { newVerifier().verify(result.file, candidate.metadata) }
        if (verification is Verification.Failed) {
            result.file.delete()
            store.update { UpdateStateMachine.downloadFailed(it, UpdateFailure.VERIFICATION_FAILED, verification.failure.name) }
            return DownloadRun.Failed(retryable = false)
        }
        store.update { UpdateStateMachine.downloadVerified(it) }
        progressFlow.value = DownloadProgress()

        if (!userInitiated && UpdatePolicy.automaticDownloadAllowed(preferences.updatePreferences()) && canInstallUnattended()) {
            val started = installNow(unattended = true)
            if (started is PackageInstallerController.StartResult.Committed) return DownloadRun.Verified
        }
        if (!foreground.isForeground) notifier.notifyReadyToInstall(candidate)
        return DownloadRun.Verified
    }

    // ------------------------------------------------------------------ installation

    /** Android 12+ may skip the confirmation for self-updates, but only while nobody is using the app. */
    private fun canInstallUnattended(): Boolean =
        Build.VERSION.SDK_INT >= 31 && installer.canRequestInstalls() && !foreground.isForeground

    /** Starts installing the verified APK. The user decides when; the UI warns that the app restarts. */
    suspend fun install(): PackageInstallerController.StartResult =
        withContext(Dispatchers.IO) { installNow(unattended = false) }

    private fun installNow(unattended: Boolean): PackageInstallerController.StartResult {
        val state = store.current
        val candidate = state.candidate
        if (candidate == null || state.phase != UpdatePhase.READY_TO_INSTALL) {
            return PackageInstallerController.StartResult.Failed(UpdateFailure.INSTALL_FAILED, "no verified update is ready")
        }
        if (!installer.canRequestInstalls()) return PackageInstallerController.StartResult.NeedsInstallPermission

        val file = storage.apkFile(candidate.metadata.version)
        // Re-verify immediately before installing: the file may be old, e.g. after a failed install.
        val verification = newVerifier().verify(file, candidate.metadata)
        if (verification is Verification.Failed) {
            file.delete()
            store.update { UpdateStateMachine.downloadFailed(it, UpdateFailure.VERIFICATION_FAILED, verification.failure.name) }
            return PackageInstallerController.StartResult.Failed(UpdateFailure.VERIFICATION_FAILED, verification.failure.name)
        }

        val result = installer.install(file, candidate.metadata, unattended)
        when (result) {
            is PackageInstallerController.StartResult.Committed ->
                store.update { UpdateStateMachine.installStarted(it, result.sessionId) }
            is PackageInstallerController.StartResult.Failed ->
                store.update { UpdateStateMachine.installFailed(it, result.failure, result.detail) }
            PackageInstallerController.StartResult.NeedsInstallPermission -> Unit
        }
        return result
    }

    /** Called by [InstallResultReceiver]. Must be quick: it runs on the main thread. */
    fun onInstallResult(sessionId: Int, status: Int, message: String?, confirmation: Intent?, unattended: Boolean) {
        when (val event = InstallStatusMapper.map(status, message)) {
            InstallEvent.PendingUserAction -> handlePendingUserAction(sessionId, confirmation, unattended)
            InstallEvent.Success -> store.update { UpdateStateMachine.reconcile(it, PackageIdentity.installedApp(context).versionCode) }
            InstallEvent.Aborted -> store.update { UpdateStateMachine.installAborted(it) }
            is InstallEvent.Failed -> {
                if (event.failure == UpdateFailure.INSTALL_INVALID || event.failure == UpdateFailure.INSTALL_CONFLICT) {
                    store.current.candidate?.let { storage.apkFile(it.metadata.version).delete() }
                }
                store.update { UpdateStateMachine.installFailed(it, event.failure, event.message) }
            }
        }
    }

    private fun handlePendingUserAction(sessionId: Int, confirmation: Intent?, unattended: Boolean) {
        if (confirmation == null) {
            installer.abandon(sessionId)
            store.update { UpdateStateMachine.installFailed(it, UpdateFailure.INSTALL_FAILED, "missing confirmation") }
            return
        }
        val safe = sanitize(confirmation)
        when {
            unattended -> {
                // Android wants a confirmation, so this was not eligible for a silent update. Never pop up
                // system UI unprompted: hand it back and let the user choose when.
                installer.abandon(sessionId)
                store.update { UpdateStateMachine.installAborted(it) }
                store.current.candidate?.let { notifier.notifyReadyToInstall(it) }
            }
            foreground.isForeground -> runCatching { context.startActivity(safe) }.onFailure {
                installer.abandon(sessionId)
                store.update { s -> UpdateStateMachine.installFailed(s, UpdateFailure.INSTALL_FAILED, "could not open the system installer") }
            }
            else -> notifier.notifyConfirmationNeeded(safe)
        }
    }

    /** The confirmation intent comes from the system installer; never forward URI grants or loop back into this app. */
    private fun sanitize(original: Intent): Intent = Intent(original).apply {
        val grantMask = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION or
            Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION or Intent.FLAG_GRANT_PREFIX_URI_PERMISSION
        flags = (flags and grantMask.inv()) or Intent.FLAG_ACTIVITY_NEW_TASK
        if (component?.packageName == context.packageName) component = null
    }

    // ------------------------------------------------------------------ lifecycle

    /** Start-up reconciliation: forget installed versions, resume or reset interrupted work. */
    fun reconcile() {
        if (!BuildConfig.UPDATER_ENABLED) return
        val installedCode = PackageIdentity.installedApp(context).versionCode
        val after = store.update { UpdateStateMachine.reconcile(it, installedCode) }
        if (after.candidate == null) storage.deleteAll()

        if (after.phase == UpdatePhase.INSTALLING && !installer.hasSession(after.installSessionId)) {
            store.update { UpdateStateMachine.installAborted(it) }
        }
        if (store.current.phase == UpdatePhase.DOWNLOADING && !scheduler.isDownloadActive()) {
            store.update { UpdateStateMachine.downloadCancelled(it) }
        }
        if (store.current.phase == UpdatePhase.READY_TO_INSTALL) {
            val candidate = store.current.candidate
            if (candidate != null && !storage.apkFile(candidate.metadata.version).isFile) {
                store.update { UpdateStateMachine.downloadCancelled(it) }
            }
        }
    }

    /** The updated app starts here after Android replaced it. */
    fun onPackageReplaced() {
        reconcile()
        notifier.cancelAll()
    }

    private fun newVerifier(): ApkVerifier = ApkVerifier(
        inspector = PackageManagerApkInspector(context),
        installed = PackageIdentity.installedIdentity(context),
        deviceSdkInt = Build.VERSION.SDK_INT,
        pinnedCertificates = pinned,
    )
}
