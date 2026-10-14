package com.leunos.ipinfo.settings

import android.content.SharedPreferences
import androidx.core.content.edit
import com.leunos.ipinfo.updates.UpdatePreferences

/** User-facing settings, stored locally in app-private preferences. Contains no network diagnostics. */
class AppPreferences(private val prefs: SharedPreferences) {

    var autoUpdateChecks: Boolean
        get() = prefs.getBoolean(KEY_AUTO_CHECKS, true)
        set(value) = prefs.edit { putBoolean(KEY_AUTO_CHECKS, value) }

    var autoDownload: Boolean
        get() = prefs.getBoolean(KEY_AUTO_DOWNLOAD, true)
        set(value) = prefs.edit { putBoolean(KEY_AUTO_DOWNLOAD, value) }

    /** Opt-in. Default false: automatic downloads only happen on unmetered networks. */
    var allowMeteredAutoDownload: Boolean
        get() = prefs.getBoolean(KEY_ALLOW_METERED, false)
        set(value) = prefs.edit { putBoolean(KEY_ALLOW_METERED, value) }

    var updateNotifications: Boolean
        get() = prefs.getBoolean(KEY_NOTIFICATIONS, true)
        set(value) = prefs.edit { putBoolean(KEY_NOTIFICATIONS, value) }

    /** ARGB colour of the website's background when last seen, used to avoid a flash on the next launch. */
    var lastWebBackground: Int
        get() = prefs.getInt(KEY_WEB_BACKGROUND, 0)
        set(value) = prefs.edit { putInt(KEY_WEB_BACKGROUND, value) }

    /** True once the location permission dialog was shown, to tell "never asked" from "don't ask again". */
    var locationPermissionRequested: Boolean
        get() = prefs.getBoolean(KEY_LOCATION_REQUESTED, false)
        set(value) = prefs.edit { putBoolean(KEY_LOCATION_REQUESTED, value) }

    var notificationPermissionRequested: Boolean
        get() = prefs.getBoolean(KEY_NOTIFICATION_REQUESTED, false)
        set(value) = prefs.edit { putBoolean(KEY_NOTIFICATION_REQUESTED, value) }

    fun updatePreferences(): UpdatePreferences = UpdatePreferences(
        autoCheck = autoUpdateChecks,
        autoDownload = autoDownload,
        allowMeteredAutoDownload = allowMeteredAutoDownload,
    )

    fun registerListener(listener: SharedPreferences.OnSharedPreferenceChangeListener) =
        prefs.registerOnSharedPreferenceChangeListener(listener)

    fun unregisterListener(listener: SharedPreferences.OnSharedPreferenceChangeListener) =
        prefs.unregisterOnSharedPreferenceChangeListener(listener)

    companion object {
        const val FILE_NAME = "settings"
        const val KEY_AUTO_CHECKS = "auto_update_checks"
        const val KEY_AUTO_DOWNLOAD = "auto_download"
        const val KEY_ALLOW_METERED = "allow_metered_auto_download"
        const val KEY_NOTIFICATIONS = "update_notifications"
        const val KEY_WEB_BACKGROUND = "web_background"
        const val KEY_LOCATION_REQUESTED = "location_permission_requested"
        const val KEY_NOTIFICATION_REQUESTED = "notification_permission_requested"
    }
}
