package com.leunos.ipinfo.updates

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import androidx.core.content.IntentCompat
import com.leunos.ipinfo.IpInfoApplication

/** Receives the result of an install session started by [PackageInstallerController]. Not exported. */
class InstallResultReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_INSTALL_RESULT) return
        val status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE)
        val message = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE)
        val sessionId = intent.getIntExtra(PackageInstaller.EXTRA_SESSION_ID, UpdateState.NO_SESSION)
        val unattended = intent.getBooleanExtra(EXTRA_UNATTENDED, false)
        val confirmation = if (status == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            IntentCompat.getParcelableExtra(intent, Intent.EXTRA_INTENT, Intent::class.java)
        } else {
            null
        }
        val graph = (context.applicationContext as IpInfoApplication).graph
        graph.updates.onInstallResult(sessionId, status, message, confirmation, unattended)
    }

    companion object {
        const val ACTION_INSTALL_RESULT = "com.leunos.ipinfo.action.INSTALL_RESULT"
        const val EXTRA_UNATTENDED = "unattended"
    }
}

/** After the app was replaced by an update: drop update state about versions that are now installed. */
class PackageReplacedReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_MY_PACKAGE_REPLACED) return
        val graph = (context.applicationContext as IpInfoApplication).graph
        val pending = goAsync()
        Thread {
            try {
                graph.updates.onPackageReplaced()
            } finally {
                pending.finish()
            }
        }.start()
    }
}
