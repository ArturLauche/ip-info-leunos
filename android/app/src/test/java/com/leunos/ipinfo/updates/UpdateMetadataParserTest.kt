package com.leunos.ipinfo.updates

import com.leunos.ipinfo.updates.Fixtures.Remove
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class UpdateMetadataParserTest {

    private fun parse(map: Map<String, Any?>) = UpdateMetadataParser.parse(Fixtures.json(map))

    private fun assertRejected(path: List<String>, value: Any?, reason: String = path.joinToString(".")) {
        val mutated = Fixtures.mutate(Fixtures.metadataMap(), path, value)
        assertThrows("$reason must be rejected", MetadataException::class.java) { parse(mutated) }
    }

    @Test
    fun parsesValidMetadata() {
        val m = parse(Fixtures.metadataMap())
        assertEquals(Fixtures.appId, m.applicationId)
        assertEquals("android-v1.1.0", m.tag)
        assertEquals(AppVersion(1, 1, 0), m.version)
        assertEquals(1_001_000, m.versionCode)
        assertEquals(29, m.minSdk)
        assertEquals("ip-info-android-v1.1.0.apk", m.apkFileName)
        assertEquals(4096L, m.apkSizeBytes)
        assertEquals(Fixtures.APK_SHA, m.apkSha256)
        assertEquals(Fixtures.CERT_A, m.signingCertSha256)
        assertEquals("1.1.0", m.versionName)
    }

    @Test
    fun ignoresUnknownKeysForForwardCompatibility() {
        val map = Fixtures.metadataMap().also { it["futureField"] = mapOf("anything" to 1) }
        parse(map)
    }

    @Test
    fun rejectsMissingRequiredFields() {
        listOf(
            listOf("schemaVersion"), listOf("applicationId"), listOf("tag"), listOf("versionName"), listOf("versionCode"),
            listOf("minSdk"), listOf("publishedAt"), listOf("releaseNotesUrl"), listOf("apk"), listOf("signing"),
            listOf("apk", "fileName"), listOf("apk", "downloadUrl"), listOf("apk", "sizeBytes"), listOf("apk", "sha256"),
            listOf("signing", "certificateSha256"),
        ).forEach { assertRejected(it, Remove, "missing ${it.joinToString(".")}") }
    }

    @Test
    fun rejectsWrongTypesWithoutCoercion() {
        assertRejected(listOf("versionCode"), "1001000")
        assertRejected(listOf("minSdk"), "29")
        assertRejected(listOf("minSdk"), 29.5)
        assertRejected(listOf("apk", "sizeBytes"), "4096")
        assertRejected(listOf("apk", "sizeBytes"), 4096.5)
        assertRejected(listOf("schemaVersion"), "1")
        assertRejected(listOf("tag"), 5)
        assertRejected(listOf("apk"), "not an object")
        assertRejected(listOf("signing"), listOf("x"))
    }

    @Test
    fun rejectsUnsupportedSchemaVersions() {
        assertRejected(listOf("schemaVersion"), 2)
        assertRejected(listOf("schemaVersion"), 0)
    }

    @Test
    fun rejectsInconsistentVersionInformation() {
        assertRejected(listOf("tag"), "android-v1.2.0")
        assertRejected(listOf("tag"), "v1.1.0")
        assertRejected(listOf("tag"), "android-v1.1.0-rc1")
        assertRejected(listOf("versionName"), "1.1.1")
        assertRejected(listOf("versionCode"), 1_001_001)
        assertRejected(listOf("versionCode"), 0)
    }

    @Test
    fun rejectsBadApplicationIdsAndRanges() {
        assertRejected(listOf("applicationId"), "")
        assertRejected(listOf("applicationId"), "nodots")
        assertRejected(listOf("applicationId"), "com..double")
        assertRejected(listOf("applicationId"), "1com.example")
        assertRejected(listOf("minSdk"), 0)
        assertRejected(listOf("minSdk"), 1000)
    }

    @Test
    fun rejectsBadTimestampsAndUrls() {
        assertRejected(listOf("publishedAt"), "2026-10-13")
        assertRejected(listOf("publishedAt"), "2026-10-13T12:00:00+02:00")
        assertRejected(listOf("publishedAt"), "yesterday")
        assertRejected(listOf("publishedAt"), "2026-13-45T25:61:61Z")
        assertRejected(listOf("releaseNotesUrl"), "http://github.com/x")
        assertRejected(listOf("apk", "downloadUrl"), "http://github.com/a.apk")
        assertRejected(listOf("apk", "downloadUrl"), "ftp://github.com/a.apk")
    }

    @Test
    fun rejectsBadFileNamesSizesAndHashes() {
        assertRejected(listOf("apk", "fileName"), "../evil.apk")
        assertRejected(listOf("apk", "fileName"), "a/b.apk")
        assertRejected(listOf("apk", "fileName"), "")
        assertRejected(listOf("apk", "sizeBytes"), 0)
        assertRejected(listOf("apk", "sizeBytes"), -5)
        assertRejected(listOf("apk", "sizeBytes"), ReleaseContract.MAX_APK_BYTES + 1)
        assertRejected(listOf("apk", "sha256"), "ABCDEF".repeat(11).take(64))
        assertRejected(listOf("apk", "sha256"), "abc")
        assertRejected(listOf("apk", "sha256"), "g".repeat(64))
        assertRejected(listOf("signing", "certificateSha256"), "A".repeat(64))
        assertRejected(listOf("signing", "certificateSha256"), "a".repeat(63))
    }

    @Test
    fun rejectsNonObjectsAndOversizedInput() {
        assertThrows(MetadataException::class.java) { UpdateMetadataParser.parse("not json") }
        assertThrows(MetadataException::class.java) { UpdateMetadataParser.parse("[]") }
        assertThrows(MetadataException::class.java) { UpdateMetadataParser.parse("") }
        assertThrows(MetadataException::class.java) { UpdateMetadataParser.parse(" ".repeat(UpdateMetadataParser.MAX_BYTES + 1)) }
    }
}
