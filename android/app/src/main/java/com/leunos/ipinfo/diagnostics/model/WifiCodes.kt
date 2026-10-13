package com.leunos.ipinfo.diagnostics.model

/** Translates the raw numbers and strings of Android's Wi-Fi APIs, treating "unknown" markers as absent. */
object WifiCodes {
    const val UNKNOWN_SSID = "<unknown ssid>"
    const val PLACEHOLDER_BSSID = "02:00:00:00:00:00"

    /** `WifiInfo.getSSID()` returns the name in quotes, or a placeholder when it is hidden from the app. */
    fun ssid(raw: String?): String? {
        if (raw.isNullOrEmpty() || raw == UNKNOWN_SSID) return null
        val unquoted = if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')) raw.substring(1, raw.length - 1) else raw
        return unquoted.ifEmpty { null }
    }

    fun bssid(raw: String?): String? = raw?.takeIf { it.isNotBlank() && !it.equals(PLACEHOLDER_BSSID, ignoreCase = true) }

    /** `WifiInfo.INVALID_RSSI` is -127. */
    fun rssi(raw: Int): Int? = raw.takeIf { it in -126..0 }

    fun speed(raw: Int): Int? = raw.takeIf { it > 0 }

    fun frequency(raw: Int): Int? = raw.takeIf { it > 0 }

    /** `ScanResult.WIFI_STANDARD_*` values. */
    fun standard(code: Int): WifiStandard? = when (code) {
        1 -> WifiStandard.LEGACY
        4 -> WifiStandard.WIFI_4
        5 -> WifiStandard.WIFI_5
        6 -> WifiStandard.WIFI_6
        7 -> WifiStandard.WIGIG
        8 -> WifiStandard.WIFI_7
        else -> null
    }

    /** `WifiInfo.SECURITY_TYPE_*` values (Android 12+). */
    fun security(code: Int): WifiSecurity? = when (code) {
        -1 -> null
        0 -> WifiSecurity.OPEN
        1 -> WifiSecurity.WEP
        2 -> WifiSecurity.WPA_PSK
        3 -> WifiSecurity.WPA_ENTERPRISE
        4 -> WifiSecurity.WPA3_PERSONAL
        5 -> WifiSecurity.OWE
        8, 9 -> WifiSecurity.WPA3_ENTERPRISE
        else -> WifiSecurity.OTHER
    }
}
