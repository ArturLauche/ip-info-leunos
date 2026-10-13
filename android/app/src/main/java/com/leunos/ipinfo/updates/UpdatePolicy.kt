package com.leunos.ipinfo.updates

import java.util.concurrent.TimeUnit

/** Whether a network allows downloading without surprising the user's data plan. */
data class NetworkTraits(val connected: Boolean, val metered: Boolean)

/** User-controlled update preferences relevant to policy decisions. */
data class UpdatePreferences(
    val autoCheck: Boolean = true,
    val autoDownload: Boolean = true,
    /** Opt-in: allow automatic downloads on metered networks too (default: unmetered only). */
    val allowMeteredAutoDownload: Boolean = false,
)

enum class AutoDownloadDecision {
    /** Download now. */
    START,

    /** Wait for an unmetered network; Android's JobScheduler constraint does the waiting. */
    WAIT_FOR_UNMETERED,

    /** Automatic downloads are off. */
    DISABLED,
}

object UpdatePolicy {
    val CHECK_COOLDOWN_MS: Long = TimeUnit.HOURS.toMillis(6)
    const val PERIODIC_INTERVAL_HOURS = 24L
    const val PERIODIC_FLEX_HOURS = 6L

    /** Launch-time check: only when enabled, outside the cooldown, and not while rate-limited. */
    fun shouldCheckOnLaunch(preferences: UpdatePreferences, state: UpdateState, now: Long): Boolean {
        if (!preferences.autoCheck) return false
        if (now < state.rateLimitedUntil) return false
        val last = state.lastCheckAttemptAt ?: return true
        return now - last >= CHECK_COOLDOWN_MS || now < last
    }

    fun autoDownload(preferences: UpdatePreferences, network: NetworkTraits): AutoDownloadDecision = when {
        !preferences.autoCheck || !preferences.autoDownload -> AutoDownloadDecision.DISABLED
        preferences.allowMeteredAutoDownload -> AutoDownloadDecision.START
        network.connected && !network.metered -> AutoDownloadDecision.START
        else -> AutoDownloadDecision.WAIT_FOR_UNMETERED
    }

    /**
     * A user-initiated download is always allowed once a network exists; the UI states that it may use
     * metered data, so the explicit tap is the consent.
     */
    fun manualDownloadAllowed(network: NetworkTraits): Boolean = network.connected
}
