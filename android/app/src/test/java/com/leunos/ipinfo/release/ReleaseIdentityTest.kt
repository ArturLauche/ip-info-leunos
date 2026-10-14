package com.leunos.ipinfo.release

import com.leunos.ipinfo.BuildConfig
import com.leunos.ipinfo.updates.AppVersion
import com.leunos.ipinfo.updates.ReleaseContract
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.io.File
import java.util.Properties

/**
 * Guards the long-lived identity of the app: package id, version mapping and the recorded production
 * signing certificate. Changing any of them must be a deliberate, reviewed act.
 */
class ReleaseIdentityTest {
    private fun repoFile(relative: String): File {
        // Gradle runs unit tests with the module directory (android/app) as working directory.
        val file = File(System.getProperty("user.dir"), "../$relative").canonicalFile
        assertTrue("missing ${file.path}", file.isFile)
        return file
    }

    private fun identity() = JSONObject(repoFile("release/signing-identity.json").readText())

    @Test
    fun applicationIdIsAValidAndStableAndroidPackageName() {
        val id = ReleaseContract.applicationId
        assertTrue(Regex("""^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$""").matches(id))
        assertEquals(id, identity().getString("applicationId"))
    }

    @Test
    fun debugAndReleaseBuildsHaveSeparatePackageIdentities() {
        if (BuildConfig.DEBUG) {
            assertEquals(ReleaseContract.applicationId + ".debug", BuildConfig.APPLICATION_ID)
            assertFalse("debug builds must never self-update", BuildConfig.UPDATER_ENABLED)
        } else {
            assertEquals(ReleaseContract.applicationId, BuildConfig.APPLICATION_ID)
            assertTrue(BuildConfig.UPDATER_ENABLED)
        }
    }

    @Test
    fun versionNameAndCodeComeFromVersionPropertiesWithTheDocumentedMapping() {
        val properties = Properties().apply { repoFile("version.properties").inputStream().use(::load) }
        val versionName = properties.getProperty("versionName").trim()
        val version = AppVersion.parseOrNull(versionName)
        assertTrue("version.properties must hold MAJOR.MINOR.PATCH", version != null)
        assertEquals(versionName, BuildConfig.VERSION_NAME.removeSuffix("-debug"))
        assertEquals(version!!.versionCode, BuildConfig.VERSION_CODE)
    }

    @Test
    fun recordedSigningIdentityIsWellFormed() {
        val json = identity()
        assertEquals(1, json.getInt("schemaVersion"))
        val array = json.getJSONArray("certificateSha256")
        val fingerprints = (0 until array.length()).map { array.getString(it) }
        fingerprints.forEach { assertTrue("'$it' must be a lowercase SHA-256", Regex("^[0-9a-f]{64}$").matches(it)) }
        assertEquals("fingerprints must be unique", fingerprints.size, fingerprints.toSet().size)
    }

    @Test
    fun theBuildPinsExactlyTheRecordedSigningIdentity() {
        // The CI release dry run pins an ephemeral certificate instead; that build is not comparable.
        assumeTrue(System.getProperty("ipinfo.contract.metadata").isNullOrBlank())
        val array = identity().getJSONArray("certificateSha256")
        val recorded = (0 until array.length()).map { array.getString(it) }
        val pinned = BuildConfig.PINNED_SIGNING_CERT_SHA256.split(',').filter { it.isNotBlank() }
        assertEquals("BuildConfig pins must equal android/release/signing-identity.json", recorded, pinned)
    }
}
