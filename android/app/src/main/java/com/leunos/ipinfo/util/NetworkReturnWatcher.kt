package com.leunos.ipinfo.util

import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.os.Handler
import android.os.Looper

/**
 * Event-driven notification that connectivity came back (a validated network). Registered only while
 * the offline screen is showing; no polling.
 */
class NetworkReturnWatcher(private val connectivityManager: ConnectivityManager, private val onReturned: () -> Unit) {
    private val handler = Handler(Looper.getMainLooper())
    private var callback: ConnectivityManager.NetworkCallback? = null

    fun start() {
        if (callback != null) return
        val newCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) {
                if (capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)) {
                    handler.removeCallbacksAndMessages(null)
                    handler.postDelayed(onReturned, SETTLE_MS)
                }
            }
        }
        callback = newCallback
        runCatching { connectivityManager.registerDefaultNetworkCallback(newCallback) }
    }

    fun stop() {
        handler.removeCallbacksAndMessages(null)
        callback?.let { runCatching { connectivityManager.unregisterNetworkCallback(it) } }
        callback = null
    }

    private companion object {
        const val SETTLE_MS = 800L
    }
}
