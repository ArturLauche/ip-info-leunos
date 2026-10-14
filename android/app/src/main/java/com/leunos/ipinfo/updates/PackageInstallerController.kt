package com.leunos.ipinfo.updates

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import android.content.pm.PackageManager
import android.os.Build
import com.leunos.ipinfo.util.Hex
import com.leunos.ipinfo.util.Sha256
import java.io.File
import java.io.IOException

/**
 * Installs a verified APK through the platform [PackageInstaller]. Android keeps full control: it
 * verifies the package, enforces signature continuity and decides whether a confirmation is needed.
 */
class PackageInstallerController(private val context: Context) {

    sealed interface StartResult {
        data class Committed(val sessionId: Int) : StartResult
        data object NeedsInstallPermission : StartResult
        data class Failed(val failure: UpdateFailure, val detail: String?) : StartResult
    }

    /** True when the user allowed this app to install packages ("Install unknown apps"). */
    fun canRequestInstalls(): Boolean = context.packageManager.canRequestPackageInstalls()

    /**
     * Streams [apk] into a new install session while hashing it, so the installed bytes are provably
     * the verified bytes, then commits. [unattended] installs never show UI on their own: if Android
     * wants a confirmation, the session is handed back (see [InstallResultReceiver]).
     */
    fun install(apk: File, metadata: UpdateMetadata, unattended: Boolean): StartResult {
        if (!canRequestInstalls()) return StartResult.NeedsInstallPermission

        val installer = context.packageManager.packageInstaller
        val params = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL).apply {
            setAppPackageName(context.packageName)
            setSize(apk.length())
            setInstallReason(PackageManager.INSTALL_REASON_USER)
            if (Build.VERSION.SDK_INT >= 31) setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED)
            if (Build.VERSION.SDK_INT >= 34) setPackageSource(PackageInstaller.PACKAGE_SOURCE_DOWNLOADED_FILE)
        }

        val sessionId = try {
            installer.createSession(params)
        } catch (e: IOException) {
            return StartResult.Failed(UpdateFailure.INSTALL_STORAGE, e.message)
        } catch (e: SecurityException) {
            return StartResult.Failed(UpdateFailure.INSTALL_BLOCKED, e.message)
        }

        val session = try {
            installer.openSession(sessionId)
        } catch (e: IOException) {
            return StartResult.Failed(UpdateFailure.INSTALL_FAILED, e.message)
        }

        return try {
            session.use { open ->
                val digest = Sha256.newDigest()
                apk.inputStream().use { input ->
                    open.openWrite(SESSION_ENTRY_NAME, 0, apk.length()).use { out ->
                        val buffer = ByteArray(64 * 1024)
                        while (true) {
                            val read = input.read(buffer)
                            if (read < 0) break
                            out.write(buffer, 0, read)
                            digest.update(buffer, 0, read)
                        }
                        open.fsync(out)
                    }
                }
                if (Hex.encode(digest.digest()) != metadata.apkSha256) {
                    open.abandon()
                    return StartResult.Failed(UpdateFailure.CHECKSUM_MISMATCH, "APK changed after verification")
                }
                open.commit(resultIntentSender(sessionId, unattended))
            }
            StartResult.Committed(sessionId)
        } catch (e: IOException) {
            abandon(sessionId)
            StartResult.Failed(UpdateFailure.INSTALL_STORAGE, e.message)
        } catch (e: SecurityException) {
            abandon(sessionId)
            StartResult.Failed(UpdateFailure.INSTALL_BLOCKED, e.message)
        }
    }

    fun abandon(sessionId: Int) {
        runCatching { context.packageManager.packageInstaller.abandonSession(sessionId) }
    }

    fun hasSession(sessionId: Int): Boolean =
        sessionId >= 0 && runCatching { context.packageManager.packageInstaller.getSessionInfo(sessionId) != null }.getOrDefault(false)

    private fun resultIntentSender(sessionId: Int, unattended: Boolean): android.content.IntentSender {
        // Explicit component: required for mutable PendingIntents on current Android versions.
        val intent = Intent(context, InstallResultReceiver::class.java)
            .setAction(InstallResultReceiver.ACTION_INSTALL_RESULT)
            .putExtra(InstallResultReceiver.EXTRA_UNATTENDED, unattended)
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or if (Build.VERSION.SDK_INT >= 31) PendingIntent.FLAG_MUTABLE else 0
        return PendingIntent.getBroadcast(context, sessionId, intent, flags).intentSender
    }

    private companion object {
        const val SESSION_ENTRY_NAME = "base.apk"
    }
}
