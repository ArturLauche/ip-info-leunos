package com.leunos.ipinfo.diagnostics

import com.leunos.ipinfo.diagnostics.model.AddressScope
import com.leunos.ipinfo.diagnostics.model.IpClassifier
import com.leunos.ipinfo.diagnostics.model.IpFamily
import org.junit.Assert.assertEquals
import org.junit.Test
import java.net.InetAddress

class IpClassifierTest {
    private fun scope(address: String) = IpClassifier.classify(InetAddress.getByName(address).address)

    @Test
    fun ipv4PrivateRangesArePrivateNotPublic() {
        listOf("10.0.0.1", "10.255.255.255", "172.16.0.1", "172.31.255.254", "192.168.0.10", "192.168.255.255")
            .forEach { assertEquals(it, AddressScope.PRIVATE, scope(it)) }
    }

    @Test
    fun ipv4RangesJustOutsidePrivateAreGlobal() {
        listOf("172.15.255.255", "172.32.0.1", "192.167.1.1", "192.169.1.1", "11.0.0.1", "9.255.255.255")
            .forEach { assertEquals(it, AddressScope.GLOBAL, scope(it)) }
    }

    @Test
    fun carrierGradeNatIsSharedAddressSpaceNotPrivateAndNotPublic() {
        listOf("100.64.0.1", "100.100.100.100", "100.127.255.254").forEach { assertEquals(it, AddressScope.SHARED_CGNAT, scope(it)) }
        assertEquals(AddressScope.GLOBAL, scope("100.63.255.255"))
        assertEquals(AddressScope.GLOBAL, scope("100.128.0.1"))
    }

    @Test
    fun specialIpv4Ranges() {
        assertEquals(AddressScope.LOOPBACK, scope("127.0.0.1"))
        assertEquals(AddressScope.LINK_LOCAL, scope("169.254.10.20"))
        assertEquals(AddressScope.MULTICAST, scope("224.0.0.1"))
        assertEquals(AddressScope.MULTICAST, scope("239.255.255.250"))
        assertEquals(AddressScope.UNSPECIFIED, scope("0.0.0.0"))
        assertEquals(AddressScope.RESERVED, scope("192.0.0.4"))
        assertEquals(AddressScope.RESERVED, scope("192.0.2.5"))
        assertEquals(AddressScope.RESERVED, scope("198.51.100.7"))
        assertEquals(AddressScope.RESERVED, scope("203.0.113.9"))
        assertEquals(AddressScope.RESERVED, scope("198.18.0.1"))
        assertEquals(AddressScope.RESERVED, scope("240.0.0.1"))
        assertEquals(AddressScope.RESERVED, scope("255.255.255.255"))
    }

    @Test
    fun publicIpv4IsGlobal() {
        listOf("8.8.8.8", "1.1.1.1", "93.184.216.34").forEach { assertEquals(it, AddressScope.GLOBAL, scope(it)) }
    }

    @Test
    fun ipv6Scopes() {
        assertEquals(AddressScope.LOOPBACK, scope("::1"))
        assertEquals(AddressScope.UNSPECIFIED, scope("::"))
        assertEquals(AddressScope.LINK_LOCAL, scope("fe80::1234:5678"))
        assertEquals(AddressScope.LINK_LOCAL, scope("febf::1"))
        assertEquals(AddressScope.UNIQUE_LOCAL, scope("fd00::1"))
        assertEquals(AddressScope.UNIQUE_LOCAL, scope("fc00::1"))
        assertEquals(AddressScope.MULTICAST, scope("ff02::1"))
        assertEquals(AddressScope.GLOBAL, scope("2001:4860:4860::8888"))
        assertEquals(AddressScope.GLOBAL, scope("2a00:1450:4001:81a::200e"))
        assertEquals(AddressScope.RESERVED, scope("2001:db8::1"))
    }

    @Test
    fun ipv4MappedIpv6UsesTheEmbeddedAddress() {
        assertEquals(AddressScope.PRIVATE, IpClassifier.classify(ByteArray(10) + byteArrayOf(-1, -1, 192.toByte(), 168.toByte(), 1, 5)))
        assertEquals(AddressScope.GLOBAL, IpClassifier.classify(ByteArray(10) + byteArrayOf(-1, -1, 8, 8, 8, 8)))
    }

    @Test
    fun malformedLengthsAreReservedAndFamilyIsDetected() {
        assertEquals(AddressScope.RESERVED, IpClassifier.classify(ByteArray(5)))
        assertEquals(IpFamily.IPV4, IpClassifier.familyOf(ByteArray(4)))
        assertEquals(IpFamily.IPV6, IpClassifier.familyOf(ByteArray(16)))
    }
}
