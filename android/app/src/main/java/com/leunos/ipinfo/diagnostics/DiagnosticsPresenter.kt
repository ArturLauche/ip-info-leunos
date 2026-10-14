package com.leunos.ipinfo.diagnostics

import android.content.Context
import android.text.format.DateFormat
import androidx.annotation.StringRes
import com.leunos.ipinfo.R
import com.leunos.ipinfo.diagnostics.model.AddressScope
import com.leunos.ipinfo.diagnostics.model.ConnectionEvent
import com.leunos.ipinfo.diagnostics.model.DiagnosticsItem
import com.leunos.ipinfo.diagnostics.model.DiagnosticsModel
import com.leunos.ipinfo.diagnostics.model.FieldKey
import com.leunos.ipinfo.diagnostics.model.NoticeKind
import com.leunos.ipinfo.diagnostics.model.SectionId
import com.leunos.ipinfo.diagnostics.model.Transport
import com.leunos.ipinfo.diagnostics.model.UnavailableReason
import com.leunos.ipinfo.diagnostics.model.Value
import com.leunos.ipinfo.diagnostics.model.WifiBand
import com.leunos.ipinfo.diagnostics.model.WifiSecurity
import com.leunos.ipinfo.diagnostics.model.WifiStandard
import java.text.NumberFormat
import java.util.Date

enum class NoticeAction { REQUEST_LOCATION_PERMISSION, OPEN_APP_SETTINGS, OPEN_LOCATION_SETTINGS, OPEN_PUBLIC_IP_CHECK }

sealed interface DiagnosticsRow {
    val id: String

    data class Header(override val id: String, val title: String) : DiagnosticsRow

    data class Field(
        override val id: String,
        val label: String,
        val value: String,
        val unavailable: Boolean,
        val copyText: String?,
        val sensitive: Boolean,
    ) : DiagnosticsRow

    data class Notice(override val id: String, val text: String, val actionLabel: String?, val action: NoticeAction?) : DiagnosticsRow
}

/** Turns the language-neutral [DiagnosticsModel] into localized rows for the list. */
class DiagnosticsPresenter(private val context: Context) {
    private val numbers = NumberFormat.getIntegerInstance()

    fun rows(model: DiagnosticsModel): List<DiagnosticsRow> {
        val rows = ArrayList<DiagnosticsRow>()
        for (section in model.sections) {
            rows += DiagnosticsRow.Header("section-${section.id.name}", context.getString(sectionTitle(section.id)))
            for (item in section.items) {
                when (item) {
                    is DiagnosticsItem.Field -> rows += field(item)
                    is DiagnosticsItem.Notice -> rows += notice(item)
                    is DiagnosticsItem.History -> rows += history(item)
                }
            }
        }
        return rows
    }

    private fun field(item: DiagnosticsItem.Field): DiagnosticsRow.Field {
        val unavailable = item.values.all { it is Value.Unavailable }
        return DiagnosticsRow.Field(
            id = item.id,
            label = context.getString(label(item)),
            value = item.values.joinToString("\n") { format(it) },
            unavailable = unavailable,
            copyText = item.copyText,
            sensitive = item.sensitive,
        )
    }

    private fun notice(item: DiagnosticsItem.Notice): DiagnosticsRow.Notice {
        val (text, actionLabel, action) = when (item.kind) {
            NoticeKind.LOCAL_VS_PUBLIC ->
                Triple(R.string.diag_notice_local_vs_public, R.string.diag_action_public_ip, NoticeAction.OPEN_PUBLIC_IP_CHECK)
            NoticeKind.WIFI_PERMISSION_NEEDED ->
                Triple(R.string.diag_notice_wifi_permission, R.string.diag_action_allow_wifi_name, NoticeAction.REQUEST_LOCATION_PERMISSION)
            NoticeKind.WIFI_PERMISSION_DENIED_PERMANENTLY ->
                Triple(R.string.diag_notice_wifi_permission_denied, R.string.action_open_app_settings, NoticeAction.OPEN_APP_SETTINGS)
            NoticeKind.WIFI_APPROXIMATE_ONLY ->
                Triple(R.string.diag_notice_wifi_approximate, R.string.diag_action_allow_wifi_name, NoticeAction.REQUEST_LOCATION_PERMISSION)
            NoticeKind.WIFI_LOCATION_SERVICES_OFF ->
                Triple(R.string.diag_notice_wifi_location_off, R.string.diag_action_open_location_settings, NoticeAction.OPEN_LOCATION_SETTINGS)
            NoticeKind.VPN_UNDERLYING_UNKNOWN -> Triple(R.string.diag_notice_vpn_unknown, null, null)
            NoticeKind.VPN_WIFI_NOTE -> Triple(R.string.diag_notice_vpn_wifi, null, null)
            NoticeKind.NO_NETWORK -> Triple(R.string.diag_notice_no_network, null, null)
            NoticeKind.WIFI_PRIVACY -> Triple(R.string.diag_notice_privacy, null, null)
        }
        return DiagnosticsRow.Notice(item.id, context.getString(text), actionLabel?.let { context.getString(it) }, action)
    }

    private fun history(item: DiagnosticsItem.History): DiagnosticsRow.Field {
        val timeFormat = DateFormat.getTimeFormat(context)
        val lines = item.events.asReversed().joinToString("\n") { event -> "${timeFormat.format(Date(event.timeMillis))}  ${describe(event)}" }
        return DiagnosticsRow.Field(
            id = item.id,
            label = context.getString(R.string.diag_field_history),
            value = lines,
            unavailable = false,
            copyText = null,
            sensitive = false,
        )
    }

    private fun describe(event: ConnectionEvent): String {
        if (!event.connected) return context.getString(R.string.diag_event_disconnected)
        val transports = event.transports.joinToString(" + ") { context.getString(transportName(it)) }
        val validated = context.getString(if (event.validated) R.string.diag_event_validated else R.string.diag_event_not_validated)
        val metered = context.getString(if (event.metered) R.string.diag_event_metered else R.string.diag_event_unmetered)
        return "$transports · $validated · $metered"
    }

    fun format(value: Value): String = when (value) {
        is Value.Text -> value.text
        is Value.Flag -> context.getString(if (value.value) R.string.value_yes else R.string.value_no)
        is Value.OfTransports -> value.transports.joinToString(" + ") { context.getString(transportName(it)) }
        is Value.Address -> buildString {
            append(value.address)
            value.prefixLength?.let { append('/').append(it) }
            append("  ·  ").append(context.getString(scopeName(value.scope)))
        }
        is Value.Dbm -> context.getString(R.string.value_dbm, value.dbm)
        is Value.Mbps -> context.getString(R.string.value_mbps, numbers.format(value.mbps))
        is Value.Kbps -> context.getString(R.string.value_mbps_estimate, numbers.format(value.kbps / 1000))
        is Value.Mhz -> context.getString(R.string.value_mhz, numbers.format(value.mhz))
        is Value.Number -> numbers.format(value.number)
        is Value.Band -> context.getString(bandName(value.band))
        is Value.Standard -> context.getString(standardName(value.standard))
        is Value.Security -> context.getString(securityName(value.security))
        is Value.Unavailable -> context.getString(unavailableName(value.reason))
    }

    @StringRes
    private fun sectionTitle(id: SectionId) = when (id) {
        SectionId.OVERVIEW -> R.string.diag_section_overview
        SectionId.ADDRESSES -> R.string.diag_section_addresses
        SectionId.DNS -> R.string.diag_section_dns
        SectionId.LINK -> R.string.diag_section_link
        SectionId.WIFI -> R.string.diag_section_wifi
        SectionId.OTHER_NETWORKS -> R.string.diag_section_other_networks
        SectionId.HISTORY -> R.string.diag_section_history
    }

    @StringRes
    private fun label(item: DiagnosticsItem.Field): Int = when {
        item.id == "VPN_UNDERLYING" -> R.string.diag_field_vpn_underlying
        item.id == "WIFI_METERED" -> R.string.diag_field_metered
        else -> when (item.key) {
            FieldKey.CONNECTION_TYPE -> R.string.diag_field_connection_type
            FieldKey.INTERNET_ACCESS -> R.string.diag_field_internet_access
            FieldKey.VALIDATED -> R.string.diag_field_validated
            FieldKey.METERED -> R.string.diag_field_metered
            FieldKey.VPN -> R.string.diag_field_vpn
            FieldKey.DATA_SAVER -> R.string.diag_field_data_saver
            FieldKey.CAPTIVE_PORTAL -> R.string.diag_field_captive_portal
            FieldKey.ROAMING -> R.string.diag_field_roaming
            FieldKey.SUSPENDED -> R.string.diag_field_suspended
            FieldKey.LOCAL_IPV4 -> R.string.diag_field_ipv4
            FieldKey.LOCAL_IPV6 -> R.string.diag_field_ipv6
            FieldKey.INTERFACE -> R.string.diag_field_interface
            FieldKey.GATEWAY -> R.string.diag_field_gateway
            FieldKey.ROUTES -> R.string.diag_field_routes
            FieldKey.DNS_SERVERS -> R.string.diag_field_dns_servers
            FieldKey.PRIVATE_DNS -> R.string.diag_field_private_dns
            FieldKey.SEARCH_DOMAINS -> R.string.diag_field_search_domains
            FieldKey.MTU -> R.string.diag_field_mtu
            FieldKey.HTTP_PROXY -> R.string.diag_field_http_proxy
            FieldKey.NAT64 -> R.string.diag_field_nat64
            FieldKey.DOWNSTREAM_ESTIMATE -> R.string.diag_field_downstream
            FieldKey.UPSTREAM_ESTIMATE -> R.string.diag_field_upstream
            FieldKey.WIFI_SSID -> R.string.diag_field_wifi_ssid
            FieldKey.WIFI_BSSID -> R.string.diag_field_wifi_bssid
            FieldKey.WIFI_SIGNAL -> R.string.diag_field_wifi_signal
            FieldKey.WIFI_LINK_SPEED -> R.string.diag_field_wifi_link_speed
            FieldKey.WIFI_TX_SPEED -> R.string.diag_field_wifi_tx
            FieldKey.WIFI_RX_SPEED -> R.string.diag_field_wifi_rx
            FieldKey.WIFI_MAX_TX -> R.string.diag_field_wifi_max_tx
            FieldKey.WIFI_MAX_RX -> R.string.diag_field_wifi_max_rx
            FieldKey.WIFI_FREQUENCY -> R.string.diag_field_wifi_frequency
            FieldKey.WIFI_BAND -> R.string.diag_field_wifi_band
            FieldKey.WIFI_CHANNEL -> R.string.diag_field_wifi_channel
            FieldKey.WIFI_STANDARD -> R.string.diag_field_wifi_standard
            FieldKey.WIFI_SECURITY -> R.string.diag_field_wifi_security
            FieldKey.OTHER_NETWORK -> R.string.diag_field_network
        }
    }

    @StringRes
    private fun transportName(t: Transport) = when (t) {
        Transport.WIFI -> R.string.transport_wifi
        Transport.CELLULAR -> R.string.transport_cellular
        Transport.ETHERNET -> R.string.transport_ethernet
        Transport.VPN -> R.string.transport_vpn
        Transport.BLUETOOTH -> R.string.transport_bluetooth
        Transport.WIFI_AWARE -> R.string.transport_wifi_aware
        Transport.LOWPAN -> R.string.transport_lowpan
        Transport.USB -> R.string.transport_usb
        Transport.THREAD -> R.string.transport_thread
        Transport.SATELLITE -> R.string.transport_satellite
    }

    @StringRes
    private fun scopeName(scope: AddressScope) = when (scope) {
        AddressScope.LOOPBACK -> R.string.scope_loopback
        AddressScope.LINK_LOCAL -> R.string.scope_link_local
        AddressScope.PRIVATE -> R.string.scope_private
        AddressScope.SHARED_CGNAT -> R.string.scope_cgnat
        AddressScope.UNIQUE_LOCAL -> R.string.scope_unique_local
        AddressScope.GLOBAL -> R.string.scope_global
        AddressScope.MULTICAST -> R.string.scope_multicast
        AddressScope.UNSPECIFIED -> R.string.scope_unspecified
        AddressScope.RESERVED -> R.string.scope_reserved
    }

    @StringRes
    private fun bandName(band: WifiBand) = when (band) {
        WifiBand.GHZ_2_4 -> R.string.band_2_4
        WifiBand.GHZ_5 -> R.string.band_5
        WifiBand.GHZ_6 -> R.string.band_6
        WifiBand.GHZ_60 -> R.string.band_60
    }

    @StringRes
    private fun standardName(standard: WifiStandard) = when (standard) {
        WifiStandard.LEGACY -> R.string.standard_legacy
        WifiStandard.WIFI_4 -> R.string.standard_wifi4
        WifiStandard.WIFI_5 -> R.string.standard_wifi5
        WifiStandard.WIFI_6 -> R.string.standard_wifi6
        WifiStandard.WIFI_7 -> R.string.standard_wifi7
        WifiStandard.WIGIG -> R.string.standard_wigig
    }

    @StringRes
    private fun securityName(security: WifiSecurity) = when (security) {
        WifiSecurity.OPEN -> R.string.security_open
        WifiSecurity.WEP -> R.string.security_wep
        WifiSecurity.WPA_PSK -> R.string.security_wpa_psk
        WifiSecurity.WPA_ENTERPRISE -> R.string.security_wpa_enterprise
        WifiSecurity.WPA3_PERSONAL -> R.string.security_wpa3
        WifiSecurity.WPA3_ENTERPRISE -> R.string.security_wpa3_enterprise
        WifiSecurity.OWE -> R.string.security_owe
        WifiSecurity.OTHER -> R.string.security_other
    }

    @StringRes
    private fun unavailableName(reason: UnavailableReason) = when (reason) {
        UnavailableReason.NOT_REPORTED -> R.string.unavailable_not_reported
        UnavailableReason.NEEDS_LOCATION_PERMISSION -> R.string.unavailable_needs_permission
        UnavailableReason.NEEDS_PRECISE_LOCATION -> R.string.unavailable_needs_precise
        UnavailableReason.NEEDS_LOCATION_SERVICES -> R.string.unavailable_needs_location_services
        UnavailableReason.NEEDS_NEWER_ANDROID -> R.string.unavailable_needs_newer_android
        UnavailableReason.NOT_CONNECTED -> R.string.unavailable_not_connected
    }
}
