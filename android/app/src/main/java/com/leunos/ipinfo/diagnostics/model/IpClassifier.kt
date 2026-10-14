package com.leunos.ipinfo.diagnostics.model

/** Classifies raw IP address bytes by scope. Pure Kotlin so it is unit-testable. */
object IpClassifier {

    fun classify(bytes: ByteArray): AddressScope = when (bytes.size) {
        4 -> classifyV4(bytes)
        16 -> classifyV6(bytes)
        else -> AddressScope.RESERVED
    }

    fun familyOf(bytes: ByteArray): IpFamily = if (bytes.size == 4) IpFamily.IPV4 else IpFamily.IPV6

    private fun b(bytes: ByteArray, index: Int) = bytes[index].toInt() and 0xFF

    private fun classifyV4(a: ByteArray): AddressScope {
        val b0 = b(a, 0)
        val b1 = b(a, 1)
        val b2 = b(a, 2)
        return when {
            b0 == 0 -> AddressScope.UNSPECIFIED
            b0 == 127 -> AddressScope.LOOPBACK
            b0 == 10 -> AddressScope.PRIVATE
            b0 == 172 && b1 in 16..31 -> AddressScope.PRIVATE
            b0 == 192 && b1 == 168 -> AddressScope.PRIVATE
            b0 == 100 && b1 in 64..127 -> AddressScope.SHARED_CGNAT
            b0 == 169 && b1 == 254 -> AddressScope.LINK_LOCAL
            b0 in 224..239 -> AddressScope.MULTICAST
            b0 == 192 && b1 == 0 && (b2 == 0 || b2 == 2) -> AddressScope.RESERVED
            b0 == 198 && (b1 == 18 || b1 == 19) -> AddressScope.RESERVED
            b0 == 198 && b1 == 51 && b2 == 100 -> AddressScope.RESERVED
            b0 == 203 && b1 == 0 && b2 == 113 -> AddressScope.RESERVED
            b0 >= 240 -> AddressScope.RESERVED
            else -> AddressScope.GLOBAL
        }
    }

    private fun classifyV6(a: ByteArray): AddressScope {
        val allZeroPrefix = (0 until 15).all { a[it].toInt() == 0 }
        if (allZeroPrefix && a[15].toInt() == 0) return AddressScope.UNSPECIFIED
        if (allZeroPrefix && a[15].toInt() == 1) return AddressScope.LOOPBACK

        // IPv4-mapped (::ffff:a.b.c.d): classify the embedded IPv4 address.
        val mapped = (0 until 10).all { a[it].toInt() == 0 } && b(a, 10) == 0xFF && b(a, 11) == 0xFF
        if (mapped) return classifyV4(a.copyOfRange(12, 16))

        val b0 = b(a, 0)
        val b1 = b(a, 1)
        return when {
            b0 == 0xFF -> AddressScope.MULTICAST
            b0 == 0xFE && (b1 and 0xC0) == 0x80 -> AddressScope.LINK_LOCAL
            b0 == 0xFE && (b1 and 0xC0) == 0xC0 -> AddressScope.PRIVATE // deprecated site-local fec0::/10
            (b0 and 0xFE) == 0xFC -> AddressScope.UNIQUE_LOCAL
            b0 == 0x20 && b1 == 0x01 && b(a, 2) == 0x0D && b(a, 3) == 0xB8 -> AddressScope.RESERVED // documentation 2001:db8::/32
            (b0 and 0xE0) == 0x20 -> AddressScope.GLOBAL // 2000::/3
            else -> AddressScope.RESERVED
        }
    }
}
