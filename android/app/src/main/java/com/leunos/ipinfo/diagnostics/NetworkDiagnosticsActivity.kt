package com.leunos.ipinfo.diagnostics

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.Menu
import android.view.MenuItem
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.view.isVisible
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.leunos.ipinfo.IpInfoApplication
import com.leunos.ipinfo.R
import com.leunos.ipinfo.databinding.ActivityDiagnosticsBinding
import com.leunos.ipinfo.navigation.AppNavigator
import com.leunos.ipinfo.navigation.BaseNativeActivity
import com.leunos.ipinfo.util.ClipboardHelper
import kotlinx.coroutines.launch

/**
 * Native network diagnostics. Everything shown comes from Android's connectivity APIs on this device
 * and never leaves it. Reachable without the backend, so it stays useful when the website is not.
 */
class NetworkDiagnosticsActivity : BaseNativeActivity() {
    private lateinit var binding: ActivityDiagnosticsBinding
    private val viewModel: DiagnosticsViewModel by viewModels()
    private val presenter by lazy { DiagnosticsPresenter(this) }
    private val preferences get() = (application as IpInfoApplication).graph.preferences

    private val adapter = DiagnosticsAdapter(::copy, ::onNoticeAction)

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { refreshAccess() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDiagnosticsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setUpToolbar(binding.toolbar)
        applyEdgeToEdgeInsets(binding.root, binding.appBar, binding.list)

        binding.list.layoutManager = LinearLayoutManager(this)
        binding.list.adapter = adapter
        binding.list.itemAnimator = null

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.model.collect { model ->
                    binding.loading.isVisible = model == null
                    if (model != null) adapter.submitList(presenter.rows(model))
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        refreshAccess()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_diagnostics, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean = when (item.itemId) {
        R.id.action_refresh -> {
            viewModel.refresh()
            refreshAccess()
            true
        }
        else -> super.onOptionsItemSelected(item)
    }

    private fun refreshAccess() {
        viewModel.updateAccess(DiagnosticsPermissions.access(this, this, preferences.locationPermissionRequested))
    }

    private fun copy(row: DiagnosticsRow.Field) {
        val text = row.copyText ?: return
        val needsConfirmation = ClipboardHelper.copy(this, row.label, text, row.sensitive)
        if (needsConfirmation) Snackbar.make(binding.root, R.string.copied_to_clipboard, Snackbar.LENGTH_SHORT).show()
    }

    private fun onNoticeAction(action: NoticeAction) {
        when (action) {
            NoticeAction.REQUEST_LOCATION_PERMISSION -> explainThenRequestLocation()
            NoticeAction.OPEN_APP_SETTINGS ->
                startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", packageName, null)))
            NoticeAction.OPEN_LOCATION_SETTINGS -> startActivity(Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS))
            NoticeAction.OPEN_PUBLIC_IP_CHECK -> AppNavigator.website(this)
        }
    }

    /** Short explanation first; the system dialog only appears after the user agrees. */
    private fun explainThenRequestLocation() {
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.diag_permission_title)
            .setMessage(R.string.diag_permission_message)
            .setPositiveButton(R.string.action_continue) { _, _ ->
                preferences.locationPermissionRequested = true
                permissionLauncher.launch(DiagnosticsPermissions.RUNTIME_PERMISSIONS)
            }
            .setNegativeButton(R.string.action_not_now, null)
            .show()
    }
}
