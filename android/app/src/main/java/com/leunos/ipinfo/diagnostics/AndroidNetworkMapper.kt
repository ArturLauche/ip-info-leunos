package com.leunos.ipinfo.diagnostics

import android.net.LinkProperties
import android.net.NetworkCapabilities
import android.net.wifi.WifiInfo
import android.os.Build
import com.leunos.ipinfo.diagnostics.model.AddressInfo
import com.leunos.ipinfo.diagnostics.model.CapabilitySnapshot
import com.leunos.ipinfo.diagnostics.model.IpClassifier
import com.leunos.ipinfo.diagnostics.model.LinkSnapshot
import com.leunos.ipinfo.diagnostics.model.RouteSnapshot
import com.leunos.ipinfo.diagnostics.model.Transport
import com.leunos.ipinfo.diagnostics.model.WifiCodes
import com.leunos.ipinfo.diagnostics.model.WifiSnapshot
import java.net.InetAddress

/**
 * Converts Android network objects into the plain snapshot types used by the diagnostics screen.
 * Every API newer than Android 10 is guarded by the version that introduced it.
 */
internal object AndroidNetworkMapper {

    fun transports(caps: NetworkCapabilities): Set<Transport> = buildSet {
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) add(Transport.WIFI)
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) add(Transport.CELLULAR)
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) add(Transport.ETHERNET)
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN)) add(Transport.VPN)
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_BLUETOOTH)) add(Transport.BLUETOOTH)
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI_AWARE)) add(Transport.WIFI_AWARE)
        if (caps.hasTransport(NetworkCapabilities.TRANSPORT_LOWPAN)) add(Transport.LOWPAN)
        if (Build.VERSION.SDK_INT >= 31 && caps.hasTransport(NetworkCapabilities.TRANSPORT_USB)) add(Transport.USB)
        if (Build.VERSION.SDK_INT >= 35 && caps.hasTransport(NetworkCapabilities.TRANSPORT_THREAD)) add(Transport.THREAD)
        if (Build.VERSION.SDK_INT >= 35 && caps.hasTransport(NetworkCapabilities.TRANSPORT_SATELLITE)) add(Transport.SATELLITE)
    }

    fun capabilities(caps: NetworkCapabilities): CapabilitySnapshot {
        val notMetered = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED) ||
            (Build.VERSION.SDK_INT >= 30 && caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_TEMPORARILY_NOT_METERED))
        return CapabilitySnapshot(
            hasInternet = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET),
            validated = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED),
            metered = !notMetered,
            notVpn = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_VPN),
            notRoaming = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_ROAMING),
            notSuspended = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_SUSPENDED),
            captivePortal = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_CAPTIVE_PORTAL),
            downstreamKbps = caps.linkDownstreamBandwidthKbps.takeIf { it > 0 },
            upstreamKbps = caps.linkUpstreamBandwidthKbps.takeIf { it > 0 },
        )
    }

    fun link(properties: LinkProperties): LinkSnapshot {
        val addresses = properties.linkAddresses.map { linkAddress ->
            val bytes = linkAddress.address.address
            AddressInfo(
                address = textOf(linkAddress.address),
                prefixLength = linkAddress.prefixLength,
                family = IpClassifier.familyOf(bytes),
                scope = IpClassifier.classify(bytes),
            )
        }
        val routes = properties.routes.map { route ->
            RouteSnapshot(
                destination = route.destination.toString(),
                gateway = route.gateway?.takeIf { route.hasGateway() }?.let(::textOf),
                interfaceName = route.`interface`,
                isDefault = route.isDefaultRoute,
            )
        }
        return LinkSnapshot(
            interfaceName = properties.interfaceName,
            addresses = addresses,
            dnsServers = properties.dnsServers.map(::textOf),
            privateDnsActive = properties.isPrivateDnsActive,
            privateDnsServerName = properties.privateDnsServerName,
            searchDomains = properties.domains,
            mtu = properties.mtu.takeIf { it > 0 },
            routes = routes,
            httpProxy = properties.httpProxy?.let { "${it.host}:${it.port}" },
            nat64Prefix = if (Build.VERSION.SDK_INT >= 30) properties.nat64Prefix?.toString() else null,
        )
    }

    fun wifi(info: WifiInfo): WifiSnapshot = WifiSnapshot(
        ssid = WifiCodes.ssid(info.ssid),
        bssid = WifiCodes.bssid(info.bssid),
        rssiDbm = WifiCodes.rssi(info.rssi),
        linkSpeedMbps = WifiCodes.speed(info.linkSpeed),
        txLinkSpeedMbps = WifiCodes.speed(info.txLinkSpeedMbps),
        rxLinkSpeedMbps = WifiCodes.speed(info.rxLinkSpeedMbps),
        maxTxLinkSpeedMbps = if (Build.VERSION.SDK_INT >= 30) WifiCodes.speed(info.maxSupportedTxLinkSpeedMbps) else null,
        maxRxLinkSpeedMbps = if (Build.VERSION.SDK_INT >= 30) WifiCodes.speed(info.maxSupportedRxLinkSpeedMbps) else null,
        frequencyMhz = WifiCodes.frequency(info.frequency),
        standard = if (Build.VERSION.SDK_INT >= 30) WifiCodes.standard(info.wifiStandard) else null,
        security = if (Build.VERSION.SDK_INT >= 31) WifiCodes.security(info.currentSecurityType) else null,
    )

    /** Numeric host address without an IPv6 zone suffix such as `%wlan0`. */
    private fun textOf(address: InetAddress): String = address.hostAddress.orEmpty().substringBefore('%')
}
