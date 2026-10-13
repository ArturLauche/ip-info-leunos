package com.leunos.ipinfo.settings

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.webkit.CookieManager
import android.webkit.WebStorage
import android.widget.CompoundButton
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.core.net.toUri
import androidx.core.view.isVisible
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.leunos.ipinfo.BuildConfig
import com.leunos.ipinfo.IpInfoApplication
import com.leunos.ipinfo.R
import com.leunos.ipinfo.databinding.ActivitySettingsBinding
import com.leunos.ipinfo.diagnostics.DiagnosticsPermissions
import com.leunos.ipinfo.diagnostics.model.LocationPermissionState
import com.leunos.ipinfo.navigation.AppNavigator
import com.leunos.ipinfo.navigation.BaseNativeActivity
import com.leunos.ipinfo.updates.CheckError
import com.leunos.ipinfo.updates.DownloadProgress
import com.leunos.ipinfo.updates.PackageInstallerController
import com.leunos.ipinfo.updates.ReleaseContract
import com.leunos.ipinfo.updates.UpdateFailure
import com.leunos.ipinfo.updates.UpdateRepository
import com.leunos.ipinfo.updates.UpdateState
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import java.text.DateFormat
import java.util.Date

/** Settings, update management, permission explanations and privacy information. */
class SettingsActivity : BaseNativeActivity() {
    private lateinit var binding: ActivitySettingsBinding
    private val graph get() = (application as IpInfoApplication).graph
    private val updates get() = graph.updates
    private val preferences get() = graph.preferences

    private val notificationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted -> onNotificationPermissionResult(granted) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setUpToolbar(binding.toolbar)
        applyEdgeToEdgeInsets(binding.root, binding.appBar, binding.scroll)

        bindStaticTexts()
        bindSwitches()
        bindButtons()

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                combine(updates.state, updates.progress, updates.checking) { state, progress, checking -> Triple(state, progress, checking) }
                    .collect { (state, progress, checking) -> renderUpdates(state, progress, checking) }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        renderPermissions()
        // The install permission is granted in system settings; reflect a change when returning.
        renderUpdates(updates.state.value, updates.progress.value, updates.checking.value)
    }

    // ------------------------------------------------------------------ static content and switches

    private fun bindStaticTexts() {
        binding.installedVersion.text = getString(R.string.settings_installed_version, BuildConfig.VERSION_NAME, BuildConfig.VERSION_CODE)
        binding.channelNote.isVisible = !BuildConfig.UPDATER_ENABLED
        binding.privacySummary.text = getString(R.string.privacy_summary)
    }

    private fun bindSwitches() {
        bind(binding.switchAutoCheck, preferences::autoUpdateChecks) { enabled ->
            preferences.autoUpdateChecks = enabled
            graph.scheduler.syncPeriodicCheck(enabled)
            renderSwitchDependencies()
        }
        bind(binding.switchAutoDownload, preferences::autoDownload) { enabled ->
            preferences.autoDownload = enabled
            renderSwitchDependencies()
        }
        bind(binding.switchMetered, preferences::allowMeteredAutoDownload, onChange = { enabled ->
            if (enabled) {
                confirmMeteredDownloads()
            } else {
                preferences.allowMeteredAutoDownload = false
            }
        })
        bind(binding.switchNotifications, preferences::updateNotifications) { enabled ->
            if (enabled) requestNotificationAccess() else preferences.updateNotifications = false
        }
        renderSwitchDependencies()
    }

    private fun bind(switch: CompoundButton, current: () -> Boolean, onChange: (Boolean) -> Unit) {
        switch.setOnCheckedChangeListener(null)
        switch.isChecked = current()
        switch.setOnCheckedChangeListener { _, checked -> onChange(checked) }
    }

    private fun renderSwitchDependencies() {
        val checks = preferences.autoUpdateChecks
        binding.switchAutoDownload.isEnabled = checks
        binding.switchMetered.isEnabled = checks && preferences.autoDownload
    }

    private fun confirmMeteredDownloads() {
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.metered_confirm_title)
            .setMessage(R.string.metered_confirm_message)
            .setPositiveButton(R.string.action_allow) { _, _ -> preferences.allowMeteredAutoDownload = true }
            .setNegativeButton(R.string.action_cancel) { _, _ -> bindSwitches() }
            .setOnCancelListener { bindSwitches() }
            .show()
    }

    // ------------------------------------------------------------------ buttons

    private fun bindButtons() {
        binding.checkButton.setOnClickListener { checkNow() }
        binding.downloadButton.setOnClickListener { confirmDownload() }
        binding.cancelButton.setOnClickListener { updates.cancelDownload() }
        binding.retryButton.setOnClickListener { updates.retry() }
        binding.installButton.setOnClickListener { install() }
        binding.releasesButton.setOnClickListener { openUrl(ReleaseContract.RELEASES_PAGE_URL) }
        binding.notesButton.setOnClickListener {
            updates.state.value.candidate?.releaseUrl?.takeIf { it.isNotEmpty() }?.let(::openUrl)
        }
        binding.installPermissionButton.setOnClickListener { openInstallSettings() }
        binding.notificationPermissionButton.setOnClickListener {
            openSystemScreen(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, packageName))
        }
        binding.locationPermissionButton.setOnClickListener {
            openSystemScreen(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", packageName, null)))
        }
        binding.privacyButton.setOnClickListener { AppNavigator.website(this, "/privacy-policy") }
        binding.clearDataButton.setOnClickListener { confirmClearWebData() }
        binding.aboutButton.setOnClickListener { AppNavigator.about(this) }
        binding.sourceButton.setOnClickListener { openUrl(ReleaseContract.REPOSITORY_URL) }
    }

    private fun checkNow() {
        lifecycleScope.launch {
            val outcome = updates.checkForUpdates(UpdateRepository.CheckTrigger.MANUAL)
            if (outcome == null) Snackbar.make(binding.root, R.string.update_check_skipped, Snackbar.LENGTH_SHORT).show()
        }
    }

    private fun confirmDownload() {
        val state = updates.state.value
        val size = state.candidate?.metadata?.apkSizeBytes ?: return
        val metered = graph.networkStatus.current().metered
        val sizeText = android.text.format.Formatter.formatShortFileSize(this, size)
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.download_confirm_title)
            .setMessage(
                if (metered) getString(R.string.download_confirm_metered, sizeText) else getString(R.string.download_confirm_unmetered, sizeText),
            )
            .setPositiveButton(R.string.update_download) { _, _ -> updates.requestDownload() }
            .setNegativeButton(R.string.action_cancel, null)
            .show()
    }

    private fun install() {
        if (!updates.canInstallPackages()) {
            explainInstallPermission()
            return
        }
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.install_confirm_title)
            .setMessage(R.string.install_confirm_message)
            .setPositiveButton(R.string.update_install) { _, _ -> startInstall() }
            .setNegativeButton(R.string.action_cancel, null)
            .show()
    }

    private fun startInstall() {
        lifecycleScope.launch {
            when (val result = updates.install()) {
                PackageInstallerController.StartResult.NeedsInstallPermission -> explainInstallPermission()
                is PackageInstallerController.StartResult.Failed ->
                    Snackbar.make(binding.root, failureText(result.failure), Snackbar.LENGTH_LONG).show()
                is PackageInstallerController.StartResult.Committed -> Unit
            }
        }
    }

    /** Explain first, then send the user to the official "Install unknown apps" screen for this app. */
    private fun explainInstallPermission() {
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.install_permission_title)
            .setMessage(R.string.install_permission_message)
            .setPositiveButton(R.string.action_open_settings) { _, _ -> openInstallSettings() }
            .setNegativeButton(R.string.action_not_now, null)
            .show()
    }

    private fun openInstallSettings() {
        openSystemScreen(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, "package:$packageName".toUri()))
    }

    /** Some devices (TVs, stripped-down builds) lack the system screen behind these buttons. */
    private fun openSystemScreen(intent: Intent) {
        try {
            startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Snackbar.make(binding.root, R.string.settings_screen_unavailable, Snackbar.LENGTH_SHORT).show()
        }
    }

    private fun openUrl(url: String) {
        if (!AppNavigator.openInBrowser(this, url)) Snackbar.make(binding.root, R.string.external_link_failed, Snackbar.LENGTH_SHORT).show()
    }

    private fun confirmClearWebData() {
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.clear_data_title)
            .setMessage(R.string.clear_data_message)
            .setPositiveButton(R.string.clear_data_confirm) { _, _ ->
                WebStorage.getInstance().deleteAllData()
                CookieManager.getInstance().removeAllCookies(null)
                CookieManager.getInstance().flush()
                Snackbar.make(binding.root, R.string.clear_data_done, Snackbar.LENGTH_LONG).show()
            }
            .setNegativeButton(R.string.action_cancel, null)
            .show()
    }

    // ------------------------------------------------------------------ notifications permission

    private fun requestNotificationAccess() {
        if (Build.VERSION.SDK_INT < 33 || notificationsGranted()) {
            preferences.updateNotifications = true
            renderPermissions()
            return
        }
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.notification_permission_title)
            .setMessage(R.string.notification_permission_message)
            .setPositiveButton(R.string.action_continue) { _, _ ->
                preferences.notificationPermissionRequested = true
                notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
            .setNegativeButton(R.string.action_not_now) { _, _ -> declineNotifications() }
            .setOnCancelListener { declineNotifications() }
            .show()
    }

    private fun onNotificationPermissionResult(granted: Boolean) {
        if (granted) {
            preferences.updateNotifications = true
        } else {
            declineNotifications()
            Snackbar.make(binding.root, R.string.notification_permission_declined, Snackbar.LENGTH_LONG).show()
        }
        renderPermissions()
    }

    private fun declineNotifications() {
        preferences.updateNotifications = false
        bind(binding.switchNotifications, preferences::updateNotifications) { enabled ->
            if (enabled) requestNotificationAccess() else preferences.updateNotifications = false
        }
    }

    private fun notificationsGranted(): Boolean =
        Build.VERSION.SDK_INT < 33 || ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED

    // ------------------------------------------------------------------ rendering

    private fun renderPermissions() {
        binding.installPermissionStatus.setText(
            if (updates.canInstallPackages()) R.string.permission_allowed else R.string.permission_not_allowed,
        )
        binding.notificationPermissionStatus.setText(
            if (NotificationManagerCompat.from(this).areNotificationsEnabled()) R.string.permission_allowed else R.string.permission_not_allowed,
        )
        val access = DiagnosticsPermissions.access(this, this, preferences.locationPermissionRequested)
        binding.locationPermissionStatus.setText(
            when {
                access.permission == LocationPermissionState.PRECISE_GRANTED -> R.string.permission_allowed
                access.permission == LocationPermissionState.APPROXIMATE_ONLY -> R.string.permission_approximate_only
                else -> R.string.permission_not_allowed
            },
        )
    }

    private fun renderUpdates(state: UpdateState, progress: DownloadProgress, checking: Boolean) {
        val network = graph.networkStatus.current()
        val ui = UpdatePresentation.from(state, checking, updates.updaterEnabled, updates.canInstallPackages(), network, progress)
        val latest = state.candidate?.metadata?.versionName

        binding.latestVersion.text = when {
            !updates.updaterEnabled -> getString(R.string.value_not_available)
            latest != null -> latest
            state.lastCheckSuccessAt != null && state.lastCheckError == null -> getString(R.string.settings_latest_current)
            else -> getString(R.string.value_not_available)
        }
        binding.lastCheck.text = state.lastCheckSuccessAt?.let {
            getString(R.string.settings_last_check, DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(it)))
        } ?: getString(R.string.settings_last_check_never)

        binding.statusText.text = statusText(ui.status, state, progress)

        binding.progress.isVisible = ui.showProgress
        if (ui.showProgress) {
            val indeterminate = progress.totalBytes <= 0 || ui.status != UpdateStatus.DOWNLOADING
            binding.progress.isIndeterminate = indeterminate
            if (!indeterminate) binding.progress.setProgressCompat((progress.fraction * 100).toInt(), true)
        }

        binding.checkButton.isVisible = ui.showCheck
        binding.downloadButton.isVisible = ui.showDownload
        binding.cancelButton.isVisible = ui.showCancel
        binding.retryButton.isVisible = ui.showRetry
        binding.installButton.isVisible = ui.showInstall
        binding.meteredNote.isVisible = ui.showMeteredNote
        binding.restartNote.isVisible = ui.showInstall
        binding.installPermissionNote.isVisible = ui.installNeedsPermission
        binding.checkButton.isEnabled = !checking

        val notes = state.candidate?.releaseNotes
        binding.notesGroup.isVisible = state.candidate != null && updates.updaterEnabled
        binding.notesText.text = notes?.takeIf { it.isNotBlank() } ?: getString(R.string.update_no_notes)
        binding.releasesButton.isVisible = updates.updaterEnabled
    }

    private fun statusText(status: UpdateStatus, state: UpdateState, progress: DownloadProgress): String {
        val version = state.candidate?.metadata?.versionName.orEmpty()
        return when (status) {
            UpdateStatus.DEBUG_BUILD -> getString(R.string.update_status_debug)
            UpdateStatus.CHECKING -> getString(R.string.update_status_checking)
            UpdateStatus.NEVER_CHECKED -> getString(R.string.update_status_never)
            UpdateStatus.UP_TO_DATE -> getString(R.string.update_status_up_to_date)
            UpdateStatus.UNSUPPORTED_DEVICE -> getString(R.string.update_status_unsupported, state.unsupportedVersion.orEmpty())
            UpdateStatus.AVAILABLE -> getString(R.string.update_status_available, version)
            UpdateStatus.DOWNLOADING -> getString(R.string.update_status_downloading, version, (progress.fraction * 100).toInt())
            UpdateStatus.READY_TO_INSTALL -> getString(R.string.update_status_ready, version)
            UpdateStatus.INSTALLING -> getString(R.string.update_status_installing, version)
            UpdateStatus.DOWNLOAD_FAILED, UpdateStatus.INSTALL_FAILED -> state.failure?.let(::failureText) ?: getString(R.string.failure_generic)
            UpdateStatus.CHECK_FAILED -> checkErrorText(state)
        }
    }

    private fun failureText(failure: UpdateFailure): String = getString(
        when (failure) {
            UpdateFailure.DOWNLOAD_INTERRUPTED -> R.string.failure_download_interrupted
            UpdateFailure.DOWNLOAD_SERVER -> R.string.failure_download_server
            UpdateFailure.DOWNLOAD_REJECTED -> R.string.failure_download_rejected
            UpdateFailure.DOWNLOAD_NOT_FOUND -> R.string.failure_download_not_found
            UpdateFailure.INSUFFICIENT_STORAGE -> R.string.failure_storage
            UpdateFailure.CHECKSUM_MISMATCH -> R.string.failure_checksum
            UpdateFailure.VERIFICATION_FAILED -> R.string.failure_verification
            UpdateFailure.INSTALL_BLOCKED -> R.string.failure_install_blocked
            UpdateFailure.INSTALL_CONFLICT -> R.string.failure_install_conflict
            UpdateFailure.INSTALL_INCOMPATIBLE -> R.string.failure_install_incompatible
            UpdateFailure.INSTALL_STORAGE -> R.string.failure_install_storage
            UpdateFailure.INSTALL_INVALID -> R.string.failure_install_invalid
            UpdateFailure.INSTALL_FAILED -> R.string.failure_generic
        },
    )

    private fun checkErrorText(state: UpdateState): String = when (state.lastCheckError) {
        CheckError.NETWORK -> getString(R.string.check_error_network)
        CheckError.RATE_LIMITED -> getString(
            R.string.check_error_rate_limited,
            DateFormat.getTimeInstance(DateFormat.SHORT).format(Date(state.rateLimitedUntil)),
        )
        CheckError.SERVER -> getString(R.string.check_error_server)
        CheckError.INVALID_RELEASE -> getString(R.string.check_error_invalid)
        CheckError.UNSUPPORTED_DEVICE -> getString(R.string.update_status_unsupported, state.unsupportedVersion.orEmpty())
        null -> getString(R.string.update_status_never)
    }
}
