package com.leunos.ipinfo.diagnostics

import com.leunos.ipinfo.diagnostics.model.AddressInfo
import com.leunos.ipinfo.diagnostics.model.AddressScope
import com.leunos.ipinfo.diagnostics.model.CapabilitySnapshot
import com.leunos.ipinfo.diagnostics.model.ConnectionEvent
import com.leunos.ipinfo.diagnostics.model.DiagnosticsItem
import com.leunos.ipinfo.diagnostics.model.DiagnosticsModel
import com.leunos.ipinfo.diagnostics.model.DiagnosticsModelBuilder
import com.leunos.ipinfo.diagnostics.model.FieldKey
import com.leunos.ipinfo.diagnostics.model.IpFamily
import com.leunos.ipinfo.diagnostics.model.LinkSnapshot
import com.leunos.ipinfo.diagnostics.model.LocationAccess
import com.leunos.ipinfo.diagnostics.model.LocationPermissionState
import com.leunos.ipinfo.diagnostics.model.NetworkEntry
import com.leunos.ipinfo.diagnostics.model.NetworkSnapshot
import com.leunos.ipinfo.diagnostics.model.NoticeKind
import com.leunos.ipinfo.diagnostics.model.RouteSnapshot
import com.leunos.ipinfo.diagnostics.model.SectionId
import com.leunos.ipinfo.diagnostics.model.Transport
import com.leunos.ipinfo.diagnostics.model.UnavailableReason
import com.leunos.ipinfo.diagnostics.model.Value
import com.leunos.ipinfo.diagnostics.model.WifiBand
import com.leunos.ipinfo.diagnostics.model.WifiSecurity
import com.leunos.ipinfo.diagnostics.model.WifiSnapshot
import com.leunos.ipinfo.diagnostics.model.WifiStandard
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class DiagnosticsModelBuilderTest {

    private val granted = LocationAccess(LocationPermissionState.PRECISE_GRANTED, locationServicesEnabled = true)

    private fun caps(metered: Boolean = false, validated: Boolean = true, internet: Boolean = true) = CapabilitySnapshot(
        hasInternet = internet, validated = validated, metered = metered, notVpn = true, notRoaming = true, notSuspended = true,
        captivePortal = false, downstreamKbps = 150_000, upstreamKbps = 50_000,
    )

    private val link = LinkSnapshot(
        interfaceName = "wlan0",
        addresses = listOf(
            AddressInfo("192.168.1.23", 24, IpFamily.IPV4, AddressScope.PRIVATE),
            AddressInfo("fe80::1", 64, IpFamily.IPV6, AddressScope.LINK_LOCAL),
            AddressInfo("2001:4860::5", 64, IpFamily.IPV6, AddressScope.GLOBAL),
        ),
        dnsServers = listOf("192.168.1.1", "9.9.9.9"),
        privateDnsActive = true,
        privateDnsServerName = "dns.example",
        searchDomains = "lan",
        mtu = 1500,
        routes = listOf(
            RouteSnapshot("192.168.1.0/24", null, "wlan0", false),
            RouteSnapshot("0.0.0.0/0", "192.168.1.1", "wlan0", true),
        ),
        httpProxy = null,
        nat64Prefix = null,
    )

    private val wifi = WifiSnapshot(
        ssid = "HomeNet", bssid = "a4:2b:b0:11:22:33", rssiDbm = -52, linkSpeedMbps = 866, txLinkSpeedMbps = 780, rxLinkSpeedMbps = 866,
        maxTxLinkSpeedMbps = 1200, maxRxLinkSpeedMbps = 1200, frequencyMhz = 5180, standard = WifiStandard.WIFI_5, security = WifiSecurity.WPA3_PERSONAL,
    )

    private fun wifiEntry(isDefault: Boolean = true, info: WifiSnapshot? = wifi) =
        NetworkEntry(1, isDefault, setOf(Transport.WIFI), caps(), link, info)

    private fun snapshot(vararg entries: NetworkEntry, dataSaver: Boolean? = false) = NetworkSnapshot(1_000, entries.toList(), dataSaver)

    private fun DiagnosticsModel.fld(key: FieldKey, id: String? = null): DiagnosticsItem.Field =
        sections.flatMap { it.items }.filterIsInstance<DiagnosticsItem.Field>().first { it.key == key && (id == null || it.id == id) }

    private fun DiagnosticsModel.value(key: FieldKey) = fld(key).values.single()

    @Test
    fun noNetworkProducesAnHonestEmptyModel() {
        val model = DiagnosticsModelBuilder.build(null, granted, 34)
        assertFalse(model.hasNetwork)
        assertTrue(model.hasNotice(NoticeKind.NO_NETWORK))
        assertEquals(Value.Unavailable(UnavailableReason.NOT_CONNECTED), model.value(FieldKey.CONNECTION_TYPE))
        assertFalse(DiagnosticsModelBuilder.build(NetworkSnapshot(1, emptyList(), null), granted, 34).hasNetwork)
    }

    @Test
    fun overviewReportsTransportInternetValidationAndMeteredStateFromAndroid() {
        val model = DiagnosticsModelBuilder.build(snapshot(wifiEntry()), granted, 34)
        assertEquals(Value.OfTransports(listOf(Transport.WIFI)), model.value(FieldKey.CONNECTION_TYPE))
        assertEquals(Value.Flag(true), model.value(FieldKey.INTERNET_ACCESS))
        assertEquals(Value.Flag(true), model.value(FieldKey.VALIDATED))
        assertEquals(Value.Flag(false), model.value(FieldKey.VPN))
        assertEquals(Value.Flag(false), model.fld(FieldKey.METERED, id = "METERED").values.single())
    }

    @Test
    fun meteredAndUnvalidatedStatesAreSurfaced() {
        val entry = NetworkEntry(2, true, setOf(Transport.CELLULAR), caps(metered = true, validated = false), link, null)
        val model = DiagnosticsModelBuilder.build(snapshot(entry), granted, 34)
        assertEquals(Value.Flag(true), model.fld(FieldKey.METERED, id = "METERED").values.single())
        assertEquals(Value.Flag(false), model.value(FieldKey.VALIDATED))
        assertNull("no Wi-Fi section on cellular", model.sections.firstOrNull { it.id == SectionId.WIFI })
    }

    @Test
    fun localAddressesAreClassifiedAndNeverCalledPublic() {
        val model = DiagnosticsModelBuilder.build(snapshot(wifiEntry()), granted, 34)
        val ipv4 = model.fld(FieldKey.LOCAL_IPV4)
        assertEquals(listOf(Value.Address("192.168.1.23", 24, AddressScope.PRIVATE)), ipv4.values)
        val ipv6 = model.fld(FieldKey.LOCAL_IPV6)
        assertEquals(AddressScope.LINK_LOCAL, (ipv6.values[0] as Value.Address).scope)
        assertEquals(AddressScope.GLOBAL, (ipv6.values[1] as Value.Address).scope)
        assertTrue("explains local vs public", model.hasNotice(NoticeKind.LOCAL_VS_PUBLIC))
        assertEquals("192.168.1.23", ipv4.copyText)
        assertTrue(ipv4.sensitive)
    }

    @Test
    fun gatewayDnsAndInterfaceComeFromLinkProperties() {
        val model = DiagnosticsModelBuilder.build(snapshot(wifiEntry()), granted, 34)
        assertEquals(listOf(Value.Text("192.168.1.1")), model.fld(FieldKey.GATEWAY).values)
        assertEquals(listOf(Value.Text("192.168.1.1"), Value.Text("9.9.9.9")), model.fld(FieldKey.DNS_SERVERS).values)
        assertEquals(Value.Text("wlan0"), model.value(FieldKey.INTERFACE))
        assertEquals(Value.Text("dns.example"), model.value(FieldKey.PRIVATE_DNS))
        assertEquals(Value.Number(1500), model.value(FieldKey.MTU))
    }

    @Test
    fun missingLinkDataBecomesUnavailableNotInvented() {
        val bare = link.copy(addresses = emptyList(), dnsServers = emptyList(), routes = emptyList(), interfaceName = null, privateDnsActive = null, mtu = null)
        val model = DiagnosticsModelBuilder.build(snapshot(NetworkEntry(1, true, setOf(Transport.ETHERNET), caps(), bare, null)), granted, 34)
        assertEquals(Value.Unavailable(UnavailableReason.NOT_REPORTED), model.value(FieldKey.LOCAL_IPV4))
        assertEquals(Value.Unavailable(UnavailableReason.NOT_REPORTED), model.value(FieldKey.GATEWAY))
        assertEquals(Value.Unavailable(UnavailableReason.NOT_REPORTED), model.value(FieldKey.DNS_SERVERS))
        assertEquals(Value.Unavailable(UnavailableReason.NEEDS_NEWER_ANDROID), model.value(FieldKey.PRIVATE_DNS))
        assertNull(model.fld(FieldKey.GATEWAY).copyText)
    }

    @Test
    fun wifiDetailsAreShownWithPermissionAndLocationServices() {
        val model = DiagnosticsModelBuilder.build(snapshot(wifiEntry()), granted, 34)
        assertEquals(Value.Text("HomeNet"), model.value(FieldKey.WIFI_SSID))
        assertEquals(Value.Text("a4:2b:b0:11:22:33"), model.value(FieldKey.WIFI_BSSID))
        assertEquals(Value.Dbm(-52), model.value(FieldKey.WIFI_SIGNAL))
        assertEquals(Value.Mbps(866), model.value(FieldKey.WIFI_LINK_SPEED))
        assertEquals(Value.Mbps(780), model.value(FieldKey.WIFI_TX_SPEED))
        assertEquals(Value.Mhz(5180), model.value(FieldKey.WIFI_FREQUENCY))
        assertEquals(Value.Band(WifiBand.GHZ_5), model.value(FieldKey.WIFI_BAND))
        assertEquals(Value.Number(36), model.value(FieldKey.WIFI_CHANNEL))
        assertEquals(Value.Standard(WifiStandard.WIFI_5), model.value(FieldKey.WIFI_STANDARD))
        assertEquals(Value.Security(WifiSecurity.WPA3_PERSONAL), model.value(FieldKey.WIFI_SECURITY))
        assertEquals("HomeNet", model.fld(FieldKey.WIFI_SSID).copyText)
        assertFalse(model.hasNotice(NoticeKind.WIFI_PERMISSION_NEEDED))
        assertTrue(model.hasNotice(NoticeKind.WIFI_PRIVACY))
    }

    @Test
    fun deniedPermissionHidesIdentityButKeepsEverythingElse() {
        val denied = LocationAccess(LocationPermissionState.DENIED, locationServicesEnabled = true)
        val model = DiagnosticsModelBuilder.build(snapshot(wifiEntry(info = wifi.copy(ssid = null, bssid = null))), denied, 34)
        assertEquals(Value.Unavailable(UnavailableReason.NEEDS_LOCATION_PERMISSION), model.value(FieldKey.WIFI_SSID))
        assertEquals(Value.Unavailable(UnavailableReason.NEEDS_LOCATION_PERMISSION), model.value(FieldKey.WIFI_BSSID))
        assertNull("nothing to copy when hidden", model.fld(FieldKey.WIFI_SSID).copyText)
        assertTrue(model.hasNotice(NoticeKind.WIFI_PERMISSION_NEEDED))
        assertEquals(Value.Dbm(-52), model.value(FieldKey.WIFI_SIGNAL))
        assertNotNull(model.fld(FieldKey.LOCAL_IPV4))
    }

    @Test
    fun neverAskedAndPermanentlyDeniedAreDistinguished() {
        val notAsked = DiagnosticsModelBuilder.build(snapshot(wifiEntry()), LocationAccess(LocationPermissionState.NOT_ASKED, true), 34)
        assertTrue(notAsked.hasNotice(NoticeKind.WIFI_PERMISSION_NEEDED))
        val permanent = DiagnosticsModelBuilder.build(snapshot(wifiEntry()), LocationAccess(LocationPermissionState.DENIED_PERMANENTLY, true), 34)
        assertTrue(permanent.hasNotice(NoticeKind.WIFI_PERMISSION_DENIED_PERMANENTLY))
        assertFalse(permanent.hasNotice(NoticeKind.WIFI_PERMISSION_NEEDED))
    }

    @Test
    fun approximateLocationIsNotEnoughForTheWifiName() {
        val approximate = LocationAccess(LocationPermissionState.APPROXIMATE_ONLY, true)
        val model = DiagnosticsModelBuilder.build(snapshot(wifiEntry()), approximate, 34)
        assertEquals(Value.Unavailable(UnavailableReason.NEEDS_PRECISE_LOCATION), model.value(FieldKey.WIFI_SSID))
        assertTrue(model.hasNotice(NoticeKind.WIFI_APPROXIMATE_ONLY))
    }

    @Test
    fun locationServicesOffHidesTheNameEvenWithPermission() {
        val off = LocationAccess(LocationPermissionState.PRECISE_GRANTED, locationServicesEnabled = false)
        val model = DiagnosticsModelBuilder.build(snapshot(wifiEntry()), off, 34)
        assertEquals(Value.Unavailable(UnavailableReason.NEEDS_LOCATION_SERVICES), model.value(FieldKey.WIFI_SSID))
        assertTrue(model.hasNotice(NoticeKind.WIFI_LOCATION_SERVICES_OFF))
        assertFalse(off.canReadWifiIdentity)
        assertTrue(granted.canReadWifiIdentity)
    }

    @Test
    fun fieldsNewerThanTheAndroidVersionAreMarkedAsSuch() {
        val old = wifi.copy(maxTxLinkSpeedMbps = null, maxRxLinkSpeedMbps = null, standard = null, security = null)
        val api29 = DiagnosticsModelBuilder.build(snapshot(wifiEntry(info = old)), granted, 29)
        assertEquals(Value.Unavailable(UnavailableReason.NEEDS_NEWER_ANDROID), api29.value(FieldKey.WIFI_STANDARD))
        assertEquals(Value.Unavailable(UnavailableReason.NEEDS_NEWER_ANDROID), api29.value(FieldKey.WIFI_MAX_TX))
        assertEquals(Value.Unavailable(UnavailableReason.NEEDS_NEWER_ANDROID), api29.value(FieldKey.WIFI_SECURITY))

        val api34 = DiagnosticsModelBuilder.build(snapshot(wifiEntry(info = old)), granted, 34)
        assertEquals("a capable Android simply did not report it", Value.Unavailable(UnavailableReason.NOT_REPORTED), api34.value(FieldKey.WIFI_STANDARD))
    }

    @Test
    fun vpnOverWifiIsReportedFromInheritedTransports() {
        val vpn = NetworkEntry(5, true, setOf(Transport.VPN, Transport.WIFI), caps(), link.copy(interfaceName = "tun0"), null)
        val model = DiagnosticsModelBuilder.build(snapshot(vpn, wifiEntry(isDefault = false)), granted, 34)
        assertEquals(Value.Flag(true), model.value(FieldKey.VPN))
        assertEquals(listOf(Value.OfTransports(listOf(Transport.WIFI))), model.fld(FieldKey.OTHER_NETWORK, id = "VPN_UNDERLYING").values)
        assertFalse(model.hasNotice(NoticeKind.VPN_UNDERLYING_UNKNOWN))
        // The real Wi-Fi link is still described, and the VPN is not mistaken for it.
        assertEquals(Value.Text("HomeNet"), model.value(FieldKey.WIFI_SSID))
    }

    @Test
    fun vpnWithoutDeclaredUnderlyingNetworkDoesNotClaimCertainty() {
        val vpn = NetworkEntry(5, true, setOf(Transport.VPN), caps(), link.copy(interfaceName = "tun0"), null)
        val model = DiagnosticsModelBuilder.build(snapshot(vpn, wifiEntry(isDefault = false)), granted, 34)
        assertTrue(model.hasNotice(NoticeKind.VPN_UNDERLYING_UNKNOWN))
        assertTrue(model.hasNotice(NoticeKind.VPN_WIFI_NOTE))
    }

    @Test
    fun secondaryNetworksAreListedAndHistoryIsIncluded() {
        val cellular = NetworkEntry(9, false, setOf(Transport.CELLULAR), caps(metered = true), null, null)
        val history = listOf(ConnectionEvent(1, listOf(Transport.WIFI), validated = true, metered = false, connected = true))
        val model = DiagnosticsModelBuilder.build(snapshot(wifiEntry(), cellular), granted, 34, history)
        assertEquals(1, model.sections.first { it.id == SectionId.OTHER_NETWORKS }.items.size)
        assertEquals(history, (model.sections.first { it.id == SectionId.HISTORY }.items.single() as DiagnosticsItem.History).events)
    }

    @Test
    fun textValuesOnlyContainWhatAndroidReported() {
        val model = DiagnosticsModelBuilder.build(snapshot(wifiEntry()), granted, 34)
        val texts = model.sections.flatMap { it.items }.filterIsInstance<DiagnosticsItem.Field>()
            .flatMap { it.values }.filterIsInstance<Value.Text>().map { it.text }
        assertTrue(texts.all { it in setOf("HomeNet", "a4:2b:b0:11:22:33", "192.168.1.1", "9.9.9.9", "wlan0", "dns.example", "lan") })
    }
}
