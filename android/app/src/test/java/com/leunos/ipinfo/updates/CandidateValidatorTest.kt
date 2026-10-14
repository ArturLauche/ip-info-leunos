package com.leunos.ipinfo.updates

import com.leunos.ipinfo.updates.Fixtures.Remove
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CandidateValidatorTest {
    private val installed = InstalledApp(Fixtures.appId, AppVersion(1, 0, 0).versionCode.toLong(), "1.0.0")

    private fun validator(sdk: Int = 34, pins: Set<String> = emptySet(), app: InstalledApp = installed) =
        CandidateValidator(app, sdk, pins)

    private fun invalidReason(result: Validation): InvalidReason = (result as Validation.Invalid).reason

    @Test
    fun acceptsConsistentNewerRelease() {
        val result = validator().validate(Fixtures.release("android-v1.1.0"), Fixtures.metadataJson("1.1.0"))
        val candidate = (result as Validation.Valid).candidate
        assertEquals("1.1.0", candidate.metadata.versionName)
        assertEquals("Release notes", candidate.releaseNotes)
        assertEquals(ReleaseContract.releasePageUrl(AppVersion(1, 1, 0)), candidate.releaseUrl)
    }

    @Test
    fun sameOrOlderVersionsAreNotUpdates() {
        val same = validator().validate(Fixtures.release("android-v1.0.0"), Fixtures.metadataJson("1.0.0"))
        assertTrue(same is Validation.NotNewer)
        val newerInstalled = installed.copy(versionCode = AppVersion(2, 0, 0).versionCode.toLong())
        val older = validator(app = newerInstalled).validate(Fixtures.release("android-v1.1.0"), Fixtures.metadataJson("1.1.0"))
        assertTrue("downgrade must never be offered", older is Validation.NotNewer)
    }

    @Test
    fun rejectsMetadataForAnotherApplicationId() {
        val map = Fixtures.mutate(Fixtures.metadataMap(), listOf("applicationId"), Fixtures.appId + ".debug")
        val result = validator().validate(Fixtures.release("android-v1.1.0"), Fixtures.json(map))
        assertEquals(InvalidReason.WRONG_APPLICATION_ID, invalidReason(result))
    }

    @Test
    fun debugBuildsNeverMatchTheStableMetadata() {
        val debugApp = installed.copy(packageName = Fixtures.appId + ".debug")
        val result = validator(app = debugApp).validate(Fixtures.release("android-v1.1.0"), Fixtures.metadataJson("1.1.0"))
        assertEquals(InvalidReason.WRONG_APPLICATION_ID, invalidReason(result))
    }

    @Test
    fun rejectsMetadataFromADifferentRelease() {
        val result = validator().validate(Fixtures.release("android-v1.2.0"), Fixtures.metadataJson("1.1.0"))
        assertEquals(InvalidReason.TAG_MISMATCH, invalidReason(result))
    }

    @Test
    fun neverTrustsUrlsFromMetadata() {
        val evilApk = Fixtures.mutate(Fixtures.metadataMap(), listOf("apk", "downloadUrl"), "https://evil.example/ip-info-android-v1.1.0.apk")
        assertEquals(InvalidReason.URL_MISMATCH, invalidReason(validator().validate(Fixtures.release("android-v1.1.0"), Fixtures.json(evilApk))))

        val otherName = Fixtures.mutate(Fixtures.metadataMap(), listOf("apk", "fileName"), "malware.apk")
        assertEquals(InvalidReason.URL_MISMATCH, invalidReason(validator().validate(Fixtures.release("android-v1.1.0"), Fixtures.json(otherName))))

        val evilNotes = Fixtures.mutate(Fixtures.metadataMap(), listOf("releaseNotesUrl"), "https://evil.example/notes")
        assertEquals(InvalidReason.URL_MISMATCH, invalidReason(validator().validate(Fixtures.release("android-v1.1.0"), Fixtures.json(evilNotes))))
    }

    @Test
    fun releaseAssetMustMatchMetadata() {
        val wrongSize = Fixtures.releaseMap("android-v1.1.0", assets = Fixtures.assetsFor("1.1.0", apkSize = 9999))
        val sizeResult = validator().validate(Fixtures.release("android-v1.1.0", "assets" to wrongSize["assets"]), Fixtures.metadataJson("1.1.0"))
        assertEquals(InvalidReason.SIZE_MISMATCH, invalidReason(sizeResult))

        val badDigest = Fixtures.assetsFor("1.1.0", apkDigest = "sha256:" + "d".repeat(64))
        val digestResult = validator().validate(Fixtures.release("android-v1.1.0", "assets" to badDigest), Fixtures.metadataJson("1.1.0"))
        assertEquals(InvalidReason.DIGEST_MISMATCH, invalidReason(digestResult))

        val goodDigest = Fixtures.assetsFor("1.1.0", apkDigest = "sha256:" + Fixtures.APK_SHA)
        assertTrue(validator().validate(Fixtures.release("android-v1.1.0", "assets" to goodDigest), Fixtures.metadataJson("1.1.0")) is Validation.Valid)

        val missingApk = Fixtures.assetsFor("1.1.0").filter { !(it["name"] as String).endsWith(".apk") }
        val missing = validator().validate(Fixtures.release("android-v1.1.0", "assets" to missingApk), Fixtures.metadataJson("1.1.0"))
        assertEquals(InvalidReason.ASSET_MISSING, invalidReason(missing))
    }

    @Test
    fun malformedMetadataIsInvalid() {
        val result = validator().validate(Fixtures.release("android-v1.1.0"), Fixtures.json(Fixtures.mutate(Fixtures.metadataMap(), listOf("apk"), Remove)))
        assertEquals(InvalidReason.MALFORMED_METADATA, invalidReason(result))
    }

    @Test
    fun reportsDevicesThatAreTooOld() {
        val result = validator(sdk = 28).validate(Fixtures.release("android-v1.1.0"), Fixtures.metadataJson("1.1.0"))
        assertEquals(Validation.RequiresNewerAndroid(AppVersion(1, 1, 0), 29), result)
    }

    @Test
    fun pinnedSigningIdentityIsEnforcedWhenConfigured() {
        val accepted = validator(pins = setOf(Fixtures.CERT_A)).validate(Fixtures.release("android-v1.1.0"), Fixtures.metadataJson("1.1.0"))
        assertTrue(accepted is Validation.Valid)
        val rejected = validator(pins = setOf(Fixtures.CERT_B)).validate(Fixtures.release("android-v1.1.0"), Fixtures.metadataJson("1.1.0", cert = Fixtures.CERT_A))
        assertEquals(InvalidReason.CERTIFICATE_NOT_PINNED, invalidReason(rejected))
    }
}
