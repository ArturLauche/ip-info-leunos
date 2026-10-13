package com.leunos.ipinfo.updates

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class GitHubReleasesTest {

    private fun stable(vararg releases: Map<String, Any?>) =
        ReleaseSelector.stableReleases(GitHubReleasesParser.parse(Fixtures.releasesJson(*releases)).releases)

    @Test
    fun picksStableAndroidReleasesNewestFirst() {
        val result = stable(
            Fixtures.releaseMap("android-v1.0.0"),
            Fixtures.releaseMap("android-v1.10.0"),
            Fixtures.releaseMap("android-v1.2.0"),
        )
        assertEquals(listOf("1.10.0", "1.2.0", "1.0.0"), result.map { it.version.toString() })
    }

    @Test
    fun ignoresPrereleasesDraftsAndUnrelatedTags() {
        val result = stable(
            Fixtures.releaseMap("android-v2.0.0", prerelease = true),
            Fixtures.releaseMap("android-v1.9.0", draft = true),
            Fixtures.releaseMap("v3.0.0", assets = emptyList()),
            Fixtures.releaseMap("web-1.4.0", assets = emptyList()),
            Fixtures.releaseMap("android-v1.5.0-rc1", assets = Fixtures.assetsFor("1.5.0")),
            Fixtures.releaseMap("android-v1.1.0"),
        )
        assertEquals(listOf("1.1.0"), result.map { it.version.toString() })
    }

    @Test
    fun ignoresReleasesWithoutPublicationDate() {
        assertTrue(stable(Fixtures.releaseMap("android-v1.1.0", publishedAt = null)).isEmpty())
        assertTrue(stable(Fixtures.releaseMap("android-v1.1.0", publishedAt = "garbage")).isEmpty())
    }

    @Test
    fun partiallyUploadedReleasesAreNeverAdvertised() {
        val v = "1.2.0"
        val noMetadata = Fixtures.assetsFor(v).filter { it["name"] != ReleaseContract.METADATA_ASSET_NAME }
        val noApk = Fixtures.assetsFor(v).filter { !(it["name"] as String).endsWith(".apk") }
        val staleApk = Fixtures.assetsFor(v).map {
            if ((it["name"] as String).endsWith(".apk")) it + ("state" to "starter") else it
        }
        assertTrue(stable(Fixtures.releaseMap("android-v1.2.0", assets = noMetadata)).isEmpty())
        assertTrue(stable(Fixtures.releaseMap("android-v1.2.0", assets = noApk)).isEmpty())
        assertTrue(stable(Fixtures.releaseMap("android-v1.2.0", assets = staleApk)).isEmpty())
    }

    @Test
    fun malformedEntriesAreSkippedNotTrusted() {
        val json = """[
            {"tag_name": "android-v1.1.0"},
            "just a string",
            42,
            {"tag_name": 5, "draft": false, "prerelease": false, "html_url": "x", "assets": []},
            ${Fixtures.json(Fixtures.releaseMap("android-v1.3.0"))}
        ]"""
        val parsed = GitHubReleasesParser.parse(json)
        assertEquals(1, parsed.releases.size)
        assertEquals(4, parsed.skipped)
    }

    @Test
    fun nonArrayResponsesAreRejected() {
        assertThrows(MetadataException::class.java) { GitHubReleasesParser.parse("{\"message\": \"Not Found\"}") }
        assertThrows(MetadataException::class.java) { GitHubReleasesParser.parse("<html>") }
    }

    @Test
    fun malformedAssetsAreDroppedFromTheRelease() {
        val map = LinkedHashMap(Fixtures.releaseMap("android-v1.1.0"))
        @Suppress("UNCHECKED_CAST")
        map["assets"] = (map["assets"] as List<Map<String, Any?>>) + listOf(mapOf("name" to 5), mapOf("size" to 1))
        val release = GitHubReleasesParser.parse(Fixtures.releasesJson(map)).releases.single()
        assertEquals(3, release.assets.size)
    }

    @Test
    fun releaseNotesAreSanitizedAndBounded() {
        val noisy = "Fixes\u0000 things\u001B[31m\nSecond line" + "x".repeat(10_000)
        val release = Fixtures.release("android-v1.1.0", "body" to noisy)
        val notes = release.body.orEmpty()
        assertTrue(notes.length <= GitHubReleasesParser.MAX_NOTES_CHARS + 1)
        assertTrue(notes.none { it == '\u0000' || it == '\u001B' })
        assertTrue(notes.contains("\nSecond line"))
        assertNull(Fixtures.release("android-v1.1.0", "body" to null).body)
    }
}
