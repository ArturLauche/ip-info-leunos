package com.leunos.ipinfo.diagnostics

import com.leunos.ipinfo.diagnostics.model.WifiBand
import com.leunos.ipinfo.diagnostics.model.WifiBands
import com.leunos.ipinfo.diagnostics.model.WifiCodes
import com.leunos.ipinfo.diagnostics.model.WifiSecurity
import com.leunos.ipinfo.diagnostics.model.WifiStandard
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class WifiCodesTest {
    @Test
    fun ssidIsUnquotedAndPlaceholdersAreTreatedAsHidden() {
        assertEquals("Home Wi-Fi", WifiCodes.ssid("\"Home Wi-Fi\""))
        assertEquals("0102ABCD", WifiCodes.ssid("0102ABCD"))
        assertNull(WifiCodes.ssid("<unknown ssid>"))
        assertNull(WifiCodes.ssid(null))
        assertNull(WifiCodes.ssid(""))
        assertNull(WifiCodes.ssid("\"\""))
    }

    @Test
    fun bssidPlaceholderIsNotAnAddress() {
        assertNull(WifiCodes.bssid("02:00:00:00:00:00"))
        assertNull(WifiCodes.bssid(null))
        assertEquals("a4:2b:b0:11:22:33", WifiCodes.bssid("a4:2b:b0:11:22:33"))
    }

    @Test
    fun unknownNumbersAreAbsentNotInvented() {
        assertNull(WifiCodes.rssi(-127))
        assertNull(WifiCodes.rssi(5))
        assertEquals(-54, WifiCodes.rssi(-54))
        assertNull(WifiCodes.speed(-1))
        assertNull(WifiCodes.speed(0))
        assertEquals(866, WifiCodes.speed(866))
        assertNull(WifiCodes.frequency(-1))
        assertEquals(5180, WifiCodes.frequency(5180))
    }

    @Test
    fun wifiStandardsMapFromScanResultCodes() {
        assertEquals(WifiStandard.LEGACY, WifiCodes.standard(1))
        assertEquals(WifiStandard.WIFI_4, WifiCodes.standard(4))
        assertEquals(WifiStandard.WIFI_5, WifiCodes.standard(5))
        assertEquals(WifiStandard.WIFI_6, WifiCodes.standard(6))
        assertEquals(WifiStandard.WIGIG, WifiCodes.standard(7))
        assertEquals(WifiStandard.WIFI_7, WifiCodes.standard(8))
        assertNull(WifiCodes.standard(0))
        assertNull(WifiCodes.standard(99))
    }

    @Test
    fun securityTypesMap() {
        assertNull(WifiCodes.security(-1))
        assertEquals(WifiSecurity.OPEN, WifiCodes.security(0))
        assertEquals(WifiSecurity.WEP, WifiCodes.security(1))
        assertEquals(WifiSecurity.WPA_PSK, WifiCodes.security(2))
        assertEquals(WifiSecurity.WPA_ENTERPRISE, WifiCodes.security(3))
        assertEquals(WifiSecurity.WPA3_PERSONAL, WifiCodes.security(4))
        assertEquals(WifiSecurity.OWE, WifiCodes.security(5))
        assertEquals(WifiSecurity.WPA3_ENTERPRISE, WifiCodes.security(9))
        assertEquals(WifiSecurity.OTHER, WifiCodes.security(12))
    }

    @Test
    fun bandsAndChannelsAreDerivedFromFrequency() {
        assertEquals(WifiBand.GHZ_2_4, WifiBands.bandOf(2412))
        assertEquals(1, WifiBands.channelOf(2412))
        assertEquals(13, WifiBands.channelOf(2472))
        assertEquals(14, WifiBands.channelOf(2484))
        assertEquals(WifiBand.GHZ_5, WifiBands.bandOf(5180))
        assertEquals(36, WifiBands.channelOf(5180))
        assertEquals(149, WifiBands.channelOf(5745))
        assertEquals(WifiBand.GHZ_6, WifiBands.bandOf(5955))
        assertEquals(1, WifiBands.channelOf(5955))
        assertEquals(2, WifiBands.channelOf(5935))
        assertEquals(WifiBand.GHZ_60, WifiBands.bandOf(60_480))
        assertNull(WifiBands.bandOf(900))
        assertNull(WifiBands.channelOf(900))
    }
}
