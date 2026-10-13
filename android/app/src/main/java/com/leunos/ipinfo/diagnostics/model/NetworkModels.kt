package com.leunos.ipinfo.diagnostics.model

/** Transport types Android can report for a network. */
enum class Transport { WIFI, CELLULAR, ETHERNET, VPN, BLUETOOTH, WIFI_AWARE, LOWPAN, USB, THREAD, SATELLITE }

enum class IpFamily { IPV4, IPV6 }

/**
 * What an address means. Only [GLOBAL] addresses are routable on the public internet, and even then
 * the address a server sees may differ (NAT, IPv6 privacy extensions): the website's server-side
 * check remains the authority on the public IP.
 */
enum class AddressScope { LOOPBACK, LINK_LOCAL, PRIVATE, SHARED_CGNAT, UNIQUE_LOCAL, GLOBAL, MULTICAST, UNSPECIFIED, RESERVED }

data class AddressInfo(
    val address: String,
    val prefixLength: Int,
    val family: IpFamily,
    val scope: AddressScope,
)

data class RouteSnapshot(
    val destination: String,
    val gateway: String?,
    val interfaceName: String?,
    val isDefault: Boolean,
)

data class LinkSnapshot(
    val interfaceName: String?,
    val addresses: List<AddressInfo>,
    val dnsServers: List<String>,
    /** Null when the Android version does not report it. */
    val privateDnsActive: Boolean?,
    val privateDnsServerName: String?,
    val searchDomains: String?,
    val mtu: Int?,
    val routes: List<RouteSnapshot>,
    val httpProxy: String?,
    val nat64Prefix: String?,
) {
    val defaultGateways: List<String>
        get() = routes.filter { it.isDefault && it.gateway != null }.mapNotNull { it.gateway }.distinct()
}

data class CapabilitySnapshot(
    val hasInternet: Boolean,
    val validated: Boolean,
    val metered: Boolean,
    val notVpn: Boolean,
    val notRoaming: Boolean,
    val notSuspended: Boolean,
    val captivePortal: Boolean,
    val downstreamKbps: Int?,
    val upstreamKbps: Int?,
)

enum class WifiStandard { LEGACY, WIFI_4, WIFI_5, WIFI_6, WIFI_7, WIGIG }

enum class WifiBand { GHZ_2_4, GHZ_5, GHZ_6, GHZ_60 }

enum class WifiSecurity { OPEN, WEP, WPA_PSK, WPA_ENTERPRISE, WPA3_PERSONAL, WPA3_ENTERPRISE, OWE, OTHER }

/**
 * Details of the connected Wi-Fi network as Android reports them. Null fields are not reported by this
 * device or Android version, or are hidden because of missing permission; they are never invented.
 */
data class WifiSnapshot(
    val ssid: String?,
    val bssid: String?,
    val rssiDbm: Int?,
    val linkSpeedMbps: Int?,
    val txLinkSpeedMbps: Int?,
    val rxLinkSpeedMbps: Int?,
    val maxTxLinkSpeedMbps: Int?,
    val maxRxLinkSpeedMbps: Int?,
    val frequencyMhz: Int?,
    val standard: WifiStandard?,
    val security: WifiSecurity?,
) {
    val band: WifiBand? get() = frequencyMhz?.let(WifiBands::bandOf)
    val channel: Int? get() = frequencyMhz?.let(WifiBands::channelOf)
}

object WifiBands {
    fun bandOf(mhz: Int): WifiBand? = when (mhz) {
        in 2400..2500 -> WifiBand.GHZ_2_4
        in 4900..5895 -> WifiBand.GHZ_5
        in 5925..7125 -> WifiBand.GHZ_6
        in 57_000..71_000 -> WifiBand.GHZ_60
        else -> null
    }

    /** Channel number derived from the centre frequency (IEEE 802.11 numbering). */
    fun channelOf(mhz: Int): Int? = when (bandOf(mhz)) {
        WifiBand.GHZ_2_4 -> if (mhz == 2484) 14 else (mhz - 2407) / 5
        WifiBand.GHZ_5 -> (mhz - 5000) / 5
        WifiBand.GHZ_6 -> if (mhz == 5935) 2 else (mhz - 5950) / 5
        else -> null
    }
}

data class NetworkEntry(
    val id: Long,
    val isDefault: Boolean,
    val transports: Set<Transport>,
    val capabilities: CapabilitySnapshot,
    val link: LinkSnapshot?,
    val wifi: WifiSnapshot?,
)

data class NetworkSnapshot(
    val capturedAtMillis: Long,
    val networks: List<NetworkEntry>,
    /** Whether Android's Data Saver restricts background data (null if unknown). */
    val dataSaverEnabled: Boolean?,
) {
    val defaultNetwork: NetworkEntry? get() = networks.firstOrNull { it.isDefault }
    /** The real Wi-Fi network: a VPN running over Wi-Fi inherits the transport but is not the Wi-Fi link itself. */
    val wifiNetwork: NetworkEntry?
        get() = networks.firstOrNull { Transport.WIFI in it.transports && Transport.VPN !in it.transports && it.wifi != null }
            ?: networks.firstOrNull { Transport.WIFI in it.transports && Transport.VPN !in it.transports }
}

/** State of the permissions and system settings Wi-Fi name access depends on. */
enum class LocationPermissionState { PRECISE_GRANTED, APPROXIMATE_ONLY, NOT_ASKED, DENIED, DENIED_PERMANENTLY }

data class LocationAccess(
    val permission: LocationPermissionState,
    val locationServicesEnabled: Boolean,
) {
    val canReadWifiIdentity: Boolean
        get() = permission == LocationPermissionState.PRECISE_GRANTED && locationServicesEnabled
}
