package com.leunos.ipinfo.util

import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import com.leunos.ipinfo.updates.NetworkTraits

/** Point-in-time view of the default network, as reported by Android (never guessed from the transport). */
class NetworkStatusProvider(private val connectivityManager: ConnectivityManager) {

    fun current(): NetworkTraits {
        val network = connectivityManager.activeNetwork ?: return NetworkTraits(connected = false, metered = true)
        val capabilities = connectivityManager.getNetworkCapabilities(network)
            ?: return NetworkTraits(connected = false, metered = true)
        val connected = capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        // isActiveNetworkMetered also honours "temporarily not metered" networks (API 30+).
        val metered = connectivityManager.isActiveNetworkMetered
        return NetworkTraits(connected = connected, metered = metered)
    }

    /** True when Android believes the default network can actually reach the internet. */
    fun isValidated(): Boolean {
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
            capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }
}
