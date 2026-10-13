package com.leunos.ipinfo.web

import com.leunos.ipinfo.web.TrustedOrigin.BlockReason
import com.leunos.ipinfo.web.TrustedOrigin.Decision
import com.leunos.ipinfo.web.TrustedOrigin.ExternalKind
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class TrustedOriginTest {
    private val host = TrustedOrigin.HOST

    private fun decide(url: String?) = TrustedOrigin.decide(url)

    @Test
    fun theProductionOriginLoadsInTheApp() {
        listOf(
            "https://$host", "https://$host/", "https://$host/dns?target=example.com", "https://$host:443/check",
            "https://$host/asn/AS13335#top", "HTTPS://${host.uppercase()}/", "https://$host/privacy-policy",
        ).forEach { assertEquals(it, Decision.LoadInApp, decide(it)) }
    }

    @Test
    fun lookalikeHostsAreExternalNotTrusted() {
        listOf(
            "https://$host.evil.com/", "https://evil.com/$host", "https://evil.com/?u=https://$host/", "https://x$host/",
            "https://leunos.com/", "https://www.$host/", "https://sub.$host/", "https://${host}x/", "https://$host./",
            "https://evil.com#@$host", "https://evil.com/@$host",
        ).forEach { url ->
            val decision = decide(url)
            assertTrue("$url -> $decision", decision is Decision.OpenExternally)
        }
    }

    @Test
    fun credentialsInUrlsAreBlockedEvenForTheTrustedHost() {
        listOf("https://user:pass@$host/", "https://user@$host/", "https://$host@evil.com/", "https://evil.com@$host/").forEach {
            assertEquals(it, Decision.Block(BlockReason.CREDENTIALS_IN_URL), decide(it))
        }
    }

    @Test
    fun otherPortsAreNotTheTrustedOrigin() {
        assertTrue(decide("https://$host:8443/") is Decision.OpenExternally)
        assertTrue(decide("https://$host:80/") is Decision.OpenExternally)
        assertTrue(decide("http://$host:8080/") is Decision.OpenExternally)
    }

    @Test
    fun cleartextLinksToTheTrustedHostAreUpgradedToHttps() {
        assertEquals(Decision.UpgradeToHttps("https://$host/"), decide("http://$host"))
        assertEquals(Decision.UpgradeToHttps("https://$host/dns?target=a%20b#x"), decide("http://$host/dns?target=a%20b#x"))
        assertEquals(Decision.UpgradeToHttps("https://$host/p"), decide("http://$host:80/p"))
    }

    @Test
    fun externalWebLinksOpenInTheBrowser() {
        assertEquals(Decision.OpenExternally("https://github.com/ArturLauche", ExternalKind.WEB), decide("https://github.com/ArturLauche"))
        assertEquals(Decision.OpenExternally("http://example.com/", ExternalKind.WEB), decide("http://example.com/"))
    }

    @Test
    fun mailtoOpensTheMailApp() {
        assertEquals(Decision.OpenExternally("mailto:privacy@example.com", ExternalKind.MAIL), decide("mailto:privacy@example.com"))
        assertEquals(Decision.Block(BlockReason.MALFORMED), decide("mailto://x"))
    }

    @Test
    fun dangerousAndUnsupportedSchemesAreBlocked() {
        listOf(
            "javascript:alert(1)", "intent://scan/#Intent;scheme=zxing;end", "intent:#Intent;component=a/b;end", "file:///etc/passwd",
            "content://com.android.contacts/contacts", "data:text/html,<script>1</script>", "blob:https://$host/abc", "tel:+4912345",
            "sms:123", "market://details?id=a", "about:blank", "ftp://$host/", "chrome://flags", "view-source:https://$host/",
            "ws://$host/", "wss://$host/", "custom-scheme://x",
        ).forEach { assertEquals(it, Decision.Block(BlockReason.UNSUPPORTED_SCHEME), decide(it)) }
    }

    @Test
    fun malformedUrlsAreBlocked() {
        listOf(
            null, "", "   ", "https://", "https:///path", "https://exa mple.com/", "https://evil.com\\@$host/", "https://$host/\u0000",
            "https://$host/\npath", "ht!tp://x", "://nothing", "https://ex ample.com", "https://" + "a".repeat(9000),
        ).forEach { url ->
            val decision = decide(url)
            assertTrue("$url -> $decision", decision is Decision.Block)
        }
    }

    @Test
    fun trustCheckAndPathHelper() {
        assertTrue(TrustedOrigin.isTrusted("https://$host/x"))
        assertFalse(TrustedOrigin.isTrusted("http://$host/x"))
        assertFalse(TrustedOrigin.isTrusted(null))
        assertEquals("https://$host/privacy-policy", TrustedOrigin.urlForPath("/privacy-policy"))
        assertNull(TrustedOrigin.urlForPath("privacy-policy"))
        assertNull(TrustedOrigin.urlForPath("//evil.com/x"))
        assertNull(TrustedOrigin.urlForPath("/\\evil"))
        assertEquals("https://$host/", TrustedOrigin.HOME_URL)
    }
}
