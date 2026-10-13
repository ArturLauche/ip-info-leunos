package com.leunos.ipinfo.diagnostics

import android.annotation.SuppressLint
import android.content.Context
import android.net.ConnectivityManager
import android.net.LinkProperties
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.os.Build
import androidx.annotation.RequiresApi
import com.leunos.ipinfo.diagnostics.model.NetworkEntry
import com.leunos.ipinfo.diagnostics.model.NetworkSnapshot
import com.leunos.ipinfo.diagnostics.model.Transport
import com.leunos.ipinfo.updates.Clock
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.conflate
import kotlinx.coroutines.launch
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Event driven source of [NetworkSnapshot]s. It registers ConnectivityManager callbacks only while a
 * collector is active (unregistering when collection stops) and reads only the currently connected
 * networks: no Wi-Fi scanning, no nearby access points, nothing leaves the device.
 */
class NetworkSnapshotSource(context: Context, private val clock: Clock = Clock.SYSTEM) {
    private val appContext = context.applicationContext
    private val connectivityManager = appContext.getSystemService(ConnectivityManager::class.java)
    private val wifiManager = appContext.getSystemService(WifiManager::class.java)

    private class Raw(var capabilities: NetworkCapabilities? = null, var link: LinkProperties? = null)

    @SuppressLint("MissingPermission")
    fun snapshots(): Flow<NetworkSnapshot> = callbackFlow {
        val lock = Any()
        val networks = LinkedHashMap<Long, Raw>()
        var defaultHandle: Long? = null
        val emitted = AtomicBoolean(false)

        fun publish() {
            val snapshot = synchronized(lock) { build(networks, defaultHandle) }
            emitted.set(true)
            trySend(snapshot)
        }

        fun newEvents(isDefault: Boolean) = object : NetworkEvents {
            override fun onAvailable(network: Network) {
                synchronized(lock) {
                    networks.getOrPut(network.networkHandle) { Raw() }
                    if (isDefault) defaultHandle = network.networkHandle
                }
            }

            override fun onCapabilities(network: Network, capabilities: NetworkCapabilities) {
                synchronized(lock) {
                    networks.getOrPut(network.networkHandle) { Raw() }.capabilities = capabilities
                    if (isDefault) defaultHandle = network.networkHandle
                }
                publish()
            }

            override fun onLink(network: Network, properties: LinkProperties) {
                synchronized(lock) {
                    networks.getOrPut(network.networkHandle) { Raw() }.link = properties
                    if (isDefault) defaultHandle = network.networkHandle
                }
                publish()
            }

            override fun onLost(network: Network) {
                synchronized(lock) {
                    if (isDefault) {
                        if (defaultHandle == network.networkHandle) defaultHandle = null
                    } else {
                        networks.remove(network.networkHandle)
                    }
                }
                publish()
            }
        }

        val defaultCallback = newCallback(newEvents(isDefault = true))
        val allCallback = newCallback(newEvents(isDefault = false))
        val everyInternetNetwork = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .removeCapability(NetworkCapabilities.NET_CAPABILITY_NOT_VPN)
            .build()

        connectivityManager.registerDefaultNetworkCallback(defaultCallback)
        connectivityManager.registerNetworkCallback(everyInternetNetwork, allCallback)

        // With no network at all Android never calls back, so say so after a short grace period.
        launch {
            delay(INITIAL_GRACE_MS)
            if (!emitted.get()) publish()
        }

        awaitClose {
            runCatching { connectivityManager.unregisterNetworkCallback(defaultCallback) }
            runCatching { connectivityManager.unregisterNetworkCallback(allCallback) }
        }
    }.conflate()

    /**
     * Android 12+ delivers location-sensitive data (the Wi-Fi name) only to callbacks that ask for it,
     * and only the platform constructor with flags can; older versions use the plain callback.
     */
    private fun newCallback(events: NetworkEvents): ConnectivityManager.NetworkCallback =
        if (Build.VERSION.SDK_INT >= 31) LocationAwareCallback(events) else PlainCallback(events)

    private fun build(networks: Map<Long, Raw>, defaultHandle: Long?): NetworkSnapshot {
        val entries = networks.mapNotNull { (id, raw) ->
            val caps = raw.capabilities ?: return@mapNotNull null
            val transports = AndroidNetworkMapper.transports(caps)
            NetworkEntry(
                id = id,
                isDefault = id == defaultHandle,
                transports = transports,
                capabilities = AndroidNetworkMapper.capabilities(caps),
                link = raw.link?.let(AndroidNetworkMapper::link),
                wifi = if (Transport.WIFI in transports && Transport.VPN !in transports) wifiInfo(caps)?.let(AndroidNetworkMapper::wifi) else null,
            )
        }
        val dataSaver = runCatching {
            connectivityManager.restrictBackgroundStatus != ConnectivityManager.RESTRICT_BACKGROUND_STATUS_DISABLED
        }.getOrNull()
        return NetworkSnapshot(clock.nowMillis(), entries, dataSaver)
    }

    /** Android 12+ delivers [WifiInfo] with the network; older versions only expose it through [WifiManager]. */
    @Suppress("DEPRECATION")
    private fun wifiInfo(caps: NetworkCapabilities): WifiInfo? {
        (caps.transportInfo as? WifiInfo)?.let { return it }
        return if (Build.VERSION.SDK_INT < 31) runCatching { wifiManager?.connectionInfo }.getOrNull() else null
    }

    private companion object {
        const val INITIAL_GRACE_MS = 600L
    }
}

internal interface NetworkEvents {
    fun onAvailable(network: Network)
    fun onCapabilities(network: Network, capabilities: NetworkCapabilities)
    fun onLink(network: Network, properties: LinkProperties)
    fun onLost(network: Network)
}

private class PlainCallback(private val events: NetworkEvents) : ConnectivityManager.NetworkCallback() {
    override fun onAvailable(network: Network) = events.onAvailable(network)
    override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) =
        events.onCapabilities(network, networkCapabilities)

    override fun onLinkPropertiesChanged(network: Network, linkProperties: LinkProperties) = events.onLink(network, linkProperties)
    override fun onLost(network: Network) = events.onLost(network)
}

@RequiresApi(31)
private class LocationAwareCallback(private val events: NetworkEvents) :
    ConnectivityManager.NetworkCallback(FLAG_INCLUDE_LOCATION_INFO) {
    override fun onAvailable(network: Network) = events.onAvailable(network)
    override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) =
        events.onCapabilities(network, networkCapabilities)

    override fun onLinkPropertiesChanged(network: Network, linkProperties: LinkProperties) = events.onLink(network, linkProperties)
    override fun onLost(network: Network) = events.onLost(network)
}
