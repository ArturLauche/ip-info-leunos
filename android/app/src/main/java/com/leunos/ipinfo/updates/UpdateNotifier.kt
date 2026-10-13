package com.leunos.ipinfo.updates

import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.leunos.ipinfo.R
import com.leunos.ipinfo.settings.AppPreferences
import com.leunos.ipinfo.settings.SettingsActivity

/**
 * Update notifications. They carry only a version number and never network diagnostics. Posting
 * requires the user's notification permission on Android 13+; without it the in-app status still works.
 */
class UpdateNotifier(
    private val context: Context,
    private val store: UpdateStateStore,
    private val preferences: AppPreferences,
) {
    fun createChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            context.getString(R.string.notification_channel_updates),
            NotificationManager.IMPORTANCE_LOW,
        ).apply { description = context.getString(R.string.notification_channel_updates_description) }
        context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    fun canNotify(): Boolean = preferences.updateNotifications && NotificationManagerCompat.from(context).areNotificationsEnabled()

    fun notifyUpdateAvailable(candidate: UpdateCandidate, waitingForUnmetered: Boolean) {
        val code = candidate.metadata.versionCode.toLong()
        if (store.notifiedAvailableVersionCode == code || !canNotify()) return
        store.notifiedAvailableVersionCode = code
        val text = if (waitingForUnmetered) {
            context.getString(R.string.notification_update_available_wifi, candidate.metadata.versionName)
        } else {
            context.getString(R.string.notification_update_available, candidate.metadata.versionName)
        }
        post(NOTIFICATION_AVAILABLE, context.getString(R.string.notification_update_available_title), text, openSettings())
    }

    fun notifyReadyToInstall(candidate: UpdateCandidate) {
        val code = candidate.metadata.versionCode.toLong()
        if (store.notifiedReadyVersionCode == code || !canNotify()) return
        store.notifiedReadyVersionCode = code
        post(
            NOTIFICATION_READY,
            context.getString(R.string.notification_update_ready_title),
            context.getString(R.string.notification_update_ready, candidate.metadata.versionName),
            openSettings(),
        )
    }

    /** Android needs the user to confirm the installation; tapping continues the system flow. */
    fun notifyConfirmationNeeded(confirmation: Intent) {
        if (!canNotify()) return
        val intent = PendingIntent.getActivity(
            context,
            NOTIFICATION_CONFIRM,
            confirmation,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        post(
            NOTIFICATION_CONFIRM,
            context.getString(R.string.notification_update_confirm_title),
            context.getString(R.string.notification_update_confirm),
            intent,
        )
    }

    fun cancelAll() {
        NotificationManagerCompat.from(context).apply {
            cancel(NOTIFICATION_AVAILABLE)
            cancel(NOTIFICATION_READY)
            cancel(NOTIFICATION_CONFIRM)
        }
    }

    private fun openSettings(): PendingIntent {
        val intent = Intent(context, SettingsActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        return PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }

    // Callers check canNotify(), which covers the POST_NOTIFICATIONS runtime permission.
    @SuppressLint("MissingPermission")
    private fun post(id: Int, title: String, text: String, contentIntent: PendingIntent) {
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_update)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setContentIntent(contentIntent)
            .setAutoCancel(true)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
        NotificationManagerCompat.from(context).notify(id, notification)
    }

    private companion object {
        const val CHANNEL_ID = "updates"
        const val NOTIFICATION_AVAILABLE = 1001
        const val NOTIFICATION_READY = 1002
        const val NOTIFICATION_CONFIRM = 1003
    }
}
