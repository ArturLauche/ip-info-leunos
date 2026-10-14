package com.leunos.ipinfo.diagnostics.model

/** Why a value is missing. Shown instead of inventing a value. */
enum class UnavailableReason {
    NOT_REPORTED,
    NEEDS_LOCATION_PERMISSION,
    NEEDS_PRECISE_LOCATION,
    NEEDS_LOCATION_SERVICES,
    NEEDS_NEWER_ANDROID,
    NOT_CONNECTED,
}

enum class FieldKey {
    CONNECTION_TYPE, INTERNET_ACCESS, VALIDATED, METERED, VPN, DATA_SAVER, CAPTIVE_PORTAL, ROAMING, SUSPENDED,
    LOCAL_IPV4, LOCAL_IPV6, INTERFACE, GATEWAY, ROUTES,
    DNS_SERVERS, PRIVATE_DNS, SEARCH_DOMAINS,
    MTU, HTTP_PROXY, NAT64, DOWNSTREAM_ESTIMATE, UPSTREAM_ESTIMATE,
    WIFI_SSID, WIFI_BSSID, WIFI_SIGNAL, WIFI_LINK_SPEED, WIFI_TX_SPEED, WIFI_RX_SPEED, WIFI_MAX_TX, WIFI_MAX_RX,
    WIFI_FREQUENCY, WIFI_BAND, WIFI_CHANNEL, WIFI_STANDARD, WIFI_SECURITY,
    OTHER_NETWORK,
}

enum class SectionId { OVERVIEW, ADDRESSES, DNS, LINK, WIFI, OTHER_NETWORKS, HISTORY }

/** Language-neutral values; the presentation layer turns them into localized text. */
sealed interface Value {
    data class Text(val text: String) : Value
    data class Flag(val value: Boolean) : Value
    data class OfTransports(val transports: List<Transport>) : Value
    data class Address(val address: String, val prefixLength: Int?, val scope: AddressScope) : Value
    data class Dbm(val dbm: Int) : Value
    data class Mbps(val mbps: Int) : Value
    data class Kbps(val kbps: Int) : Value
    data class Mhz(val mhz: Int) : Value
    data class Number(val number: Int) : Value
    data class Band(val band: WifiBand) : Value
    data class Standard(val standard: WifiStandard) : Value
    data class Security(val security: WifiSecurity) : Value
    data class Unavailable(val reason: UnavailableReason) : Value
}

enum class NoticeKind {
    LOCAL_VS_PUBLIC,
    WIFI_PERMISSION_NEEDED,
    WIFI_PERMISSION_DENIED_PERMANENTLY,
    WIFI_APPROXIMATE_ONLY,
    WIFI_LOCATION_SERVICES_OFF,
    VPN_UNDERLYING_UNKNOWN,
    VPN_WIFI_NOTE,
    NO_NETWORK,
    WIFI_PRIVACY,
}

sealed interface DiagnosticsItem {
    val id: String

    data class Field(
        val key: FieldKey,
        val values: List<Value>,
        override val id: String = key.name,
        /** Plain text placed on the clipboard; null when copying makes no sense. */
        val copyText: String? = null,
        /** Marks values that identify a network (SSID/BSSID/addresses): copied as sensitive on Android 13+. */
        val sensitive: Boolean = false,
    ) : DiagnosticsItem

    data class Notice(val kind: NoticeKind, override val id: String = kind.name) : DiagnosticsItem

    data class History(val events: List<ConnectionEvent>, override val id: String = "history") : DiagnosticsItem
}

/** Coarse, non-identifying record of a connectivity change (no SSID, no addresses). Kept in memory only. */
data class ConnectionEvent(val timeMillis: Long, val transports: List<Transport>, val validated: Boolean, val metered: Boolean, val connected: Boolean)

data class DiagnosticsSection(val id: SectionId, val items: List<DiagnosticsItem>)

data class DiagnosticsModel(val sections: List<DiagnosticsSection>, val hasNetwork: Boolean) {
    fun field(key: FieldKey): DiagnosticsItem.Field? =
        sections.flatMap { it.items }.filterIsInstance<DiagnosticsItem.Field>().firstOrNull { it.key == key }

    fun hasNotice(kind: NoticeKind): Boolean =
        sections.flatMap { it.items }.any { it is DiagnosticsItem.Notice && it.kind == kind }
}

/**
 * Turns a [NetworkSnapshot] and the current permission state into sections of language-neutral
 * fields. Honest about limits: a missing value becomes [Value.Unavailable] with the reason.
 */
object DiagnosticsModelBuilder {

    fun build(
        snapshot: NetworkSnapshot?,
        access: LocationAccess,
        sdkInt: Int,
        history: List<ConnectionEvent> = emptyList(),
    ): DiagnosticsModel {
        if (snapshot == null || snapshot.networks.isEmpty()) {
            val sections = buildList {
                add(
                    DiagnosticsSection(
                        SectionId.OVERVIEW,
                        listOf(
                            DiagnosticsItem.Field(FieldKey.CONNECTION_TYPE, listOf(Value.Unavailable(UnavailableReason.NOT_CONNECTED))),
                            DiagnosticsItem.Notice(NoticeKind.NO_NETWORK),
                        ),
                    ),
                )
                if (history.isNotEmpty()) add(DiagnosticsSection(SectionId.HISTORY, listOf(DiagnosticsItem.History(history))))
            }
            return DiagnosticsModel(sections, hasNetwork = false)
        }

        val default = snapshot.defaultNetwork
        val sections = ArrayList<DiagnosticsSection>()
        sections += overview(snapshot, default)
        default?.link?.let { link ->
            sections += addresses(link)
            sections += dns(link)
            sections += linkDetails(link, default.capabilities)
        }
        wifiSection(snapshot, access, sdkInt)?.let { sections += it }
        otherNetworks(snapshot)?.let { sections += it }
        if (history.isNotEmpty()) sections += DiagnosticsSection(SectionId.HISTORY, listOf(DiagnosticsItem.History(history)))
        return DiagnosticsModel(sections, hasNetwork = true)
    }

    private fun overview(snapshot: NetworkSnapshot, default: NetworkEntry?): DiagnosticsSection {
        val items = ArrayList<DiagnosticsItem>()
        if (default == null) {
            items += DiagnosticsItem.Field(FieldKey.CONNECTION_TYPE, listOf(Value.Unavailable(UnavailableReason.NOT_CONNECTED)))
            items += DiagnosticsItem.Notice(NoticeKind.NO_NETWORK)
            return DiagnosticsSection(SectionId.OVERVIEW, items)
        }
        val caps = default.capabilities
        val vpn = Transport.VPN in default.transports

        items += DiagnosticsItem.Field(FieldKey.CONNECTION_TYPE, listOf(Value.OfTransports(default.transports.sortedBy { it.ordinal })))
        items += DiagnosticsItem.Field(FieldKey.INTERNET_ACCESS, listOf(Value.Flag(caps.hasInternet)))
        items += DiagnosticsItem.Field(FieldKey.VALIDATED, listOf(Value.Flag(caps.validated)))
        items += DiagnosticsItem.Field(FieldKey.METERED, listOf(Value.Flag(caps.metered)))
        items += DiagnosticsItem.Field(FieldKey.VPN, listOf(Value.Flag(vpn)))
        if (caps.captivePortal) items += DiagnosticsItem.Field(FieldKey.CAPTIVE_PORTAL, listOf(Value.Flag(true)))
        items += DiagnosticsItem.Field(FieldKey.ROAMING, listOf(Value.Flag(!caps.notRoaming)))
        items += DiagnosticsItem.Field(
            FieldKey.DATA_SAVER,
            listOf(snapshot.dataSaverEnabled?.let { Value.Flag(it) } ?: Value.Unavailable(UnavailableReason.NOT_REPORTED)),
        )

        if (vpn) {
            // Android merges the transports of a VPN's declared underlying networks into the VPN's own
            // capabilities. If there are none, the VPN app did not declare any: the base network is unknown.
            val inherited = default.transports.filter { it != Transport.VPN }.sortedBy { it.ordinal }
            if (inherited.isEmpty()) {
                items += DiagnosticsItem.Notice(NoticeKind.VPN_UNDERLYING_UNKNOWN)
                if (snapshot.networks.any { Transport.WIFI in it.transports && Transport.VPN !in it.transports }) {
                    items += DiagnosticsItem.Notice(NoticeKind.VPN_WIFI_NOTE)
                }
            } else {
                items += DiagnosticsItem.Field(FieldKey.OTHER_NETWORK, listOf(Value.OfTransports(inherited)), id = "VPN_UNDERLYING")
            }
        }
        return DiagnosticsSection(SectionId.OVERVIEW, items)
    }

    private fun addresses(link: LinkSnapshot): DiagnosticsSection {
        val v4 = link.addresses.filter { it.family == IpFamily.IPV4 }
        val v6 = link.addresses.filter { it.family == IpFamily.IPV6 }
        val items = ArrayList<DiagnosticsItem>()
        items += addressField(FieldKey.LOCAL_IPV4, v4)
        items += addressField(FieldKey.LOCAL_IPV6, v6)
        items += DiagnosticsItem.Field(
            FieldKey.INTERFACE,
            listOf(link.interfaceName?.let { Value.Text(it) } ?: Value.Unavailable(UnavailableReason.NOT_REPORTED)),
            copyText = link.interfaceName,
        )
        val gateways = link.defaultGateways
        items += DiagnosticsItem.Field(
            FieldKey.GATEWAY,
            if (gateways.isEmpty()) listOf(Value.Unavailable(UnavailableReason.NOT_REPORTED)) else gateways.map { Value.Text(it) },
            copyText = gateways.joinToString("\n").ifEmpty { null },
            sensitive = true,
        )
        items += DiagnosticsItem.Notice(NoticeKind.LOCAL_VS_PUBLIC)
        return DiagnosticsSection(SectionId.ADDRESSES, items)
    }

    private fun addressField(key: FieldKey, addresses: List<AddressInfo>): DiagnosticsItem.Field =
        DiagnosticsItem.Field(
            key,
            if (addresses.isEmpty()) {
                listOf(Value.Unavailable(UnavailableReason.NOT_REPORTED))
            } else {
                addresses.map { Value.Address(it.address, it.prefixLength, it.scope) }
            },
            copyText = addresses.joinToString("\n") { it.address }.ifEmpty { null },
            sensitive = true,
        )

    private fun dns(link: LinkSnapshot): DiagnosticsSection {
        val items = ArrayList<DiagnosticsItem>()
        items += DiagnosticsItem.Field(
            FieldKey.DNS_SERVERS,
            if (link.dnsServers.isEmpty()) listOf(Value.Unavailable(UnavailableReason.NOT_REPORTED)) else link.dnsServers.map { Value.Text(it) },
            copyText = link.dnsServers.joinToString("\n").ifEmpty { null },
            sensitive = true,
        )
        items += DiagnosticsItem.Field(
            FieldKey.PRIVATE_DNS,
            listOf(
                when {
                    link.privateDnsActive == null -> Value.Unavailable(UnavailableReason.NEEDS_NEWER_ANDROID)
                    link.privateDnsActive && link.privateDnsServerName != null -> Value.Text(link.privateDnsServerName)
                    else -> Value.Flag(link.privateDnsActive)
                },
            ),
            copyText = link.privateDnsServerName,
        )
        link.searchDomains?.takeIf { it.isNotBlank() }?.let {
            items += DiagnosticsItem.Field(FieldKey.SEARCH_DOMAINS, listOf(Value.Text(it)), copyText = it)
        }
        return DiagnosticsSection(SectionId.DNS, items)
    }

    private fun linkDetails(link: LinkSnapshot, caps: CapabilitySnapshot): DiagnosticsSection {
        val items = ArrayList<DiagnosticsItem>()
        items += DiagnosticsItem.Field(
            FieldKey.MTU,
            listOf(link.mtu?.let { Value.Number(it) } ?: Value.Unavailable(UnavailableReason.NOT_REPORTED)),
            copyText = link.mtu?.toString(),
        )
        link.httpProxy?.let { items += DiagnosticsItem.Field(FieldKey.HTTP_PROXY, listOf(Value.Text(it)), copyText = it) }
        link.nat64Prefix?.let { items += DiagnosticsItem.Field(FieldKey.NAT64, listOf(Value.Text(it)), copyText = it) }
        items += DiagnosticsItem.Field(
            FieldKey.DOWNSTREAM_ESTIMATE,
            listOf(caps.downstreamKbps?.let { Value.Kbps(it) } ?: Value.Unavailable(UnavailableReason.NOT_REPORTED)),
        )
        items += DiagnosticsItem.Field(
            FieldKey.UPSTREAM_ESTIMATE,
            listOf(caps.upstreamKbps?.let { Value.Kbps(it) } ?: Value.Unavailable(UnavailableReason.NOT_REPORTED)),
        )
        return DiagnosticsSection(SectionId.LINK, items)
    }

    private fun wifiSection(snapshot: NetworkSnapshot, access: LocationAccess, sdkInt: Int): DiagnosticsSection? {
        val entry = snapshot.wifiNetwork ?: return null
        val wifi = entry.wifi
        val items = ArrayList<DiagnosticsItem>()

        val identityGap: UnavailableReason? = when {
            access.permission == LocationPermissionState.APPROXIMATE_ONLY -> UnavailableReason.NEEDS_PRECISE_LOCATION
            access.permission != LocationPermissionState.PRECISE_GRANTED -> UnavailableReason.NEEDS_LOCATION_PERMISSION
            !access.locationServicesEnabled -> UnavailableReason.NEEDS_LOCATION_SERVICES
            else -> null
        }

        items += DiagnosticsItem.Field(
            FieldKey.WIFI_SSID,
            listOf(identityValue(wifi?.ssid, identityGap)),
            copyText = wifi?.ssid.takeIf { identityGap == null },
            sensitive = true,
        )
        items += DiagnosticsItem.Field(
            FieldKey.WIFI_BSSID,
            listOf(identityValue(wifi?.bssid, identityGap)),
            copyText = wifi?.bssid.takeIf { identityGap == null },
            sensitive = true,
        )
        items += DiagnosticsItem.Field(FieldKey.WIFI_SIGNAL, listOf(wifi?.rssiDbm?.let { Value.Dbm(it) } ?: notReported()))
        items += DiagnosticsItem.Field(FieldKey.WIFI_LINK_SPEED, listOf(wifi?.linkSpeedMbps?.let { Value.Mbps(it) } ?: notReported()))
        items += DiagnosticsItem.Field(FieldKey.WIFI_TX_SPEED, listOf(wifi?.txLinkSpeedMbps?.let { Value.Mbps(it) } ?: notReported()))
        items += DiagnosticsItem.Field(FieldKey.WIFI_RX_SPEED, listOf(wifi?.rxLinkSpeedMbps?.let { Value.Mbps(it) } ?: notReported()))
        items += DiagnosticsItem.Field(
            FieldKey.WIFI_MAX_TX,
            listOf(wifi?.maxTxLinkSpeedMbps?.let { Value.Mbps(it) } ?: versionGated(sdkInt, 30)),
        )
        items += DiagnosticsItem.Field(
            FieldKey.WIFI_MAX_RX,
            listOf(wifi?.maxRxLinkSpeedMbps?.let { Value.Mbps(it) } ?: versionGated(sdkInt, 30)),
        )
        items += DiagnosticsItem.Field(FieldKey.WIFI_FREQUENCY, listOf(wifi?.frequencyMhz?.let { Value.Mhz(it) } ?: notReported()))
        items += DiagnosticsItem.Field(FieldKey.WIFI_BAND, listOf(wifi?.band?.let { Value.Band(it) } ?: notReported()))
        items += DiagnosticsItem.Field(FieldKey.WIFI_CHANNEL, listOf(wifi?.channel?.let { Value.Number(it) } ?: notReported()))
        items += DiagnosticsItem.Field(
            FieldKey.WIFI_STANDARD,
            listOf(wifi?.standard?.let { Value.Standard(it) } ?: versionGated(sdkInt, 30)),
        )
        items += DiagnosticsItem.Field(
            FieldKey.WIFI_SECURITY,
            listOf(wifi?.security?.let { Value.Security(it) } ?: versionGated(sdkInt, 31)),
        )
        items += DiagnosticsItem.Field(FieldKey.METERED, listOf(Value.Flag(entry.capabilities.metered)), id = "WIFI_METERED")

        when (identityGap) {
            UnavailableReason.NEEDS_PRECISE_LOCATION -> items += DiagnosticsItem.Notice(NoticeKind.WIFI_APPROXIMATE_ONLY)
            UnavailableReason.NEEDS_LOCATION_PERMISSION ->
                items += DiagnosticsItem.Notice(
                    if (access.permission == LocationPermissionState.DENIED_PERMANENTLY) {
                        NoticeKind.WIFI_PERMISSION_DENIED_PERMANENTLY
                    } else {
                        NoticeKind.WIFI_PERMISSION_NEEDED
                    },
                )
            UnavailableReason.NEEDS_LOCATION_SERVICES -> items += DiagnosticsItem.Notice(NoticeKind.WIFI_LOCATION_SERVICES_OFF)
            else -> Unit
        }
        items += DiagnosticsItem.Notice(NoticeKind.WIFI_PRIVACY)
        return DiagnosticsSection(SectionId.WIFI, items)
    }

    private fun identityValue(value: String?, gap: UnavailableReason?): Value = when {
        gap != null -> Value.Unavailable(gap)
        value != null -> Value.Text(value)
        else -> Value.Unavailable(UnavailableReason.NOT_REPORTED)
    }

    private fun notReported(): Value = Value.Unavailable(UnavailableReason.NOT_REPORTED)

    private fun versionGated(sdkInt: Int, requires: Int): Value =
        Value.Unavailable(if (sdkInt < requires) UnavailableReason.NEEDS_NEWER_ANDROID else UnavailableReason.NOT_REPORTED)

    private fun otherNetworks(snapshot: NetworkSnapshot): DiagnosticsSection? {
        val others = snapshot.networks.filter { !it.isDefault && (Transport.WIFI !in it.transports || Transport.VPN in it.transports) }
        if (others.isEmpty()) return null
        val items = others.map { entry ->
            DiagnosticsItem.Field(
                FieldKey.OTHER_NETWORK,
                listOf(Value.OfTransports(entry.transports.sortedBy { it.ordinal }), Value.Flag(entry.capabilities.validated)),
                id = "OTHER_${entry.id}",
            )
        }
        return DiagnosticsSection(SectionId.OTHER_NETWORKS, items)
    }
}
