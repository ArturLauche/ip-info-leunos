package com.leunos.ipinfo.updates

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class AppVersionTest {

    @Test
    fun parsesStrictSemanticVersions() {
        assertEquals(AppVersion(1, 0, 0), AppVersion.parseOrNull("1.0.0"))
        assertEquals(AppVersion(0, 0, 1), AppVersion.parseOrNull("0.0.1"))
        assertEquals(AppVersion(2099, 999, 999), AppVersion.parseOrNull("2099.999.999"))
        assertEquals(AppVersion(12, 34, 56), AppVersion.parseOrNull("12.34.56"))
    }

    @Test
    fun rejectsEverythingThatIsNotPlainMajorMinorPatch() {
        listOf(
            "", "1", "1.0", "1.0.0.0", "01.0.0", "1.00.0", "1.0.00", "1.0.0-rc1", "1.0.0-beta", "1.0.0+5",
            "v1.0.0", " 1.0.0", "1.0.0 ", "-1.0.0", "1.-1.0", "1.0.-1", "2100.0.0", "1.1000.0", "1.0.1000", "0.0.0",
            "99999999999.0.0", "\uFF11.0.0", "1.0.0\n", "1,0,0", "1..0",
        ).forEach { assertNull("'$it' must be rejected", AppVersion.parseOrNull(it)) }
    }

    @Test
    fun versionCodeFollowsTheDocumentedMapping() {
        assertEquals(1_000_000, AppVersion(1, 0, 0).versionCode)
        assertEquals(1_001_000, AppVersion(1, 1, 0).versionCode)
        assertEquals(1_000_001, AppVersion(1, 0, 1).versionCode)
        assertEquals(2_099_999_999, AppVersion(2099, 999, 999).versionCode)
        assertEquals(1, AppVersion(0, 0, 1).versionCode)
    }

    @Test
    fun allVersionCodesStayWithinAndroidsLimit() {
        assertTrue(AppVersion(2099, 999, 999).versionCode < 2_100_000_000)
    }

    @Test
    fun versionCodesIncreaseStrictlyWithSemanticOrder() {
        val versions = buildList {
            for (major in listOf(0, 1, 2, 10, 2099)) for (minor in listOf(0, 1, 2, 10, 999)) for (patch in listOf(0, 1, 2, 10, 999)) {
                if (major + minor + patch > 0) add(AppVersion(major, minor, patch))
            }
        }
        val semanticOrder = versions.sortedWith(compareBy({ it.major }, { it.minor }, { it.patch }))
        semanticOrder.zipWithNext().forEach { (a, b) -> assertTrue("$a < $b", a.versionCode < b.versionCode) }
        assertEquals(semanticOrder, versions.sorted())
    }

    @Test
    fun comparisonIsNumericNotLexicographic() {
        assertTrue(AppVersion(1, 2, 3) < AppVersion(1, 10, 0))
        assertTrue(AppVersion(1, 9, 9) < AppVersion(2, 0, 0))
        assertTrue(AppVersion(1, 0, 9) < AppVersion(1, 0, 10))
    }

    @Test
    fun inverseMappingRoundTrips() {
        listOf(AppVersion(1, 0, 0), AppVersion(3, 14, 15), AppVersion(2099, 999, 999)).forEach {
            assertEquals(it, AppVersion.fromVersionCode(it.versionCode.toLong()))
        }
        assertNull(AppVersion.fromVersionCode(0))
        assertNull(AppVersion.fromVersionCode(2_100_000_000L))
    }

    @Test
    fun constructorRejectsOutOfRangeParts() {
        assertThrows(IllegalArgumentException::class.java) { AppVersion(2100, 0, 0) }
        assertThrows(IllegalArgumentException::class.java) { AppVersion(1, 1000, 0) }
        assertThrows(IllegalArgumentException::class.java) { AppVersion(1, 0, 1000) }
        assertThrows(IllegalArgumentException::class.java) { AppVersion(0, 0, 0) }
    }
}
