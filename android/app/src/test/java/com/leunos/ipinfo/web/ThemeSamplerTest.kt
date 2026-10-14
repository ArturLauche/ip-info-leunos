package com.leunos.ipinfo.web

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ThemeSamplerTest {
    @Test
    fun parsesTheJavascriptResultIntoOpaqueArgb() {
        assertEquals(0xFF0A0A0A.toInt(), ThemeSampler.parse("\"10,10,10,255\""))
        assertEquals(0xFFFFFFFF.toInt(), ThemeSampler.parse("\"255,255,255,255\""))
        assertEquals(0xFF123456.toInt(), ThemeSampler.parse("18,52,86,255"))
    }

    @Test
    fun rejectsEmptyTransparentAndMalformedResults() {
        listOf(null, "null", "\"\"", "\"0,0,0,0\"", "\"1,2,3\"", "\"a,b,c,d\"", "\"256,0,0,255\"", "\"-1,0,0,255\"", "\"1,2,3,4,5\"")
            .forEach { assertNull("'$it'", ThemeSampler.parse(it)) }
    }

    @Test
    fun classifiesLightAndDarkBackgrounds() {
        assertTrue(ThemeSampler.isLight(0xFFFFFFFF.toInt()))
        assertTrue(ThemeSampler.isLight(0xFFF5F5F5.toInt()))
        assertFalse(ThemeSampler.isLight(0xFF0A0A0A.toInt()))
        assertFalse(ThemeSampler.isLight(0xFF171717.toInt()))
    }

    @Test
    fun paletteMirrorsTheWebsiteTokens() {
        val dark = ChromePalette.forBackground(0xFF0A0A0A.toInt())
        assertEquals(0xFFFAFAFA.toInt(), dark.foreground)
        assertEquals(0xFFFAFAFA.toInt(), dark.primary)
        assertFalse(dark.isLight)
        val light = ChromePalette.forBackground(0xFFFFFFFF.toInt())
        assertEquals(0xFF0A0A0A.toInt(), light.foreground)
        assertEquals(0xFF171717.toInt(), light.primary)
        assertTrue(light.isLight)
    }

    @Test
    fun scriptIsAPureReadOnlyQuery() {
        assertTrue(ThemeSampler.SCRIPT.contains("getComputedStyle"))
        assertFalse(ThemeSampler.SCRIPT.contains("fetch"))
        assertFalse(ThemeSampler.SCRIPT.contains("XMLHttpRequest"))
    }
}
