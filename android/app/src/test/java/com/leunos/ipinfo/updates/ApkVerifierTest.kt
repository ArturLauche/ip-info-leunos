package com.leunos.ipinfo.updates

import com.leunos.ipinfo.util.Sha256
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class ApkVerifierTest {
    @get:Rule
    val temp = TemporaryFolder()

    private lateinit var apk: File
    private val bytes = ByteArray(2048) { (it % 251).toByte() }

    private val installed = InstalledIdentity(Fixtures.appId, AppVersion(1, 0, 0).versionCode.toLong(), setOf(Fixtures.CERT_A), emptySet())

    @Before
    fun setUp() {
        apk = temp.newFile("update.apk").apply { writeBytes(bytes) }
    }

    private fun metadata(cert: String = Fixtures.CERT_A, version: String = "1.1.0") =
        UpdateMetadataParser.parse(Fixtures.metadataJson(version, size = bytes.size.toLong(), sha = Sha256.hex(bytes), cert = cert))

    private fun info(
        packageName: String = Fixtures.appId,
        versionCode: Long = AppVersion(1, 1, 0).versionCode.toLong(),
        versionName: String? = "1.1.0",
        minSdk: Int = 29,
        signers: List<String> = listOf(Fixtures.CERT_A),
        multiple: Boolean = false,
        history: List<String> = emptyList(),
    ) = ApkInfo(packageName, versionCode, versionName, minSdk, 37, signers, multiple, history)

    private fun verifier(
        apkInfo: ApkInfo? = info(),
        identity: InstalledIdentity = installed,
        sdk: Int = 34,
        pins: Set<String> = emptySet(),
    ) = ApkVerifier({ apkInfo }, identity, sdk, pins)

    private fun failure(result: Verification) = (result as Verification.Failed).failure

    @Test
    fun acceptsAMatchingNewerApkFromTheSameSigner() {
        assertEquals(Verification.Ok, verifier().verify(apk, metadata()))
    }

    @Test
    fun rejectsMissingTruncatedAndCorruptFiles() {
        assertEquals(VerificationFailure.MISSING, failure(verifier().verify(File(temp.root, "nope.apk"), metadata())))

        apk.writeBytes(bytes.copyOf(bytes.size - 10))
        assertEquals(VerificationFailure.SIZE_MISMATCH, failure(verifier().verify(apk, metadata())))

        apk.writeBytes(ByteArray(bytes.size) { 9 })
        assertEquals(VerificationFailure.CHECKSUM_MISMATCH, failure(verifier().verify(apk, metadata())))
    }

    @Test
    fun rejectsPackagesThatAndroidCannotParseOrVerify() {
        assertEquals(VerificationFailure.UNREADABLE_OR_BADLY_SIGNED, failure(verifier(apkInfo = null).verify(apk, metadata())))
    }

    @Test
    fun rejectsAWrongPackageId() {
        val result = verifier(info(packageName = "com.example.other")).verify(apk, metadata())
        assertEquals(VerificationFailure.WRONG_PACKAGE, failure(result))
    }

    @Test
    fun rejectsTheDebugPackageAsAStableUpdate() {
        val debugInstalled = installed.copy(packageName = Fixtures.appId + ".debug")
        val result = verifier(identity = debugInstalled).verify(apk, metadata())
        assertEquals(VerificationFailure.WRONG_PACKAGE, failure(result))
    }

    @Test
    fun rejectsVersionDisagreementsBetweenApkAndMetadata() {
        assertEquals(VerificationFailure.VERSION_MISMATCH, failure(verifier(info(versionCode = 1_005_000)).verify(apk, metadata())))
        assertEquals(VerificationFailure.VERSION_MISMATCH, failure(verifier(info(versionName = "1.1.1")).verify(apk, metadata())))
        assertEquals(VerificationFailure.VERSION_MISMATCH, failure(verifier(info(minSdk = 26)).verify(apk, metadata())))
    }

    @Test
    fun rejectsDowngradesAndReinstallsOfTheSameVersion() {
        val newer = installed.copy(versionCode = AppVersion(2, 0, 0).versionCode.toLong())
        assertEquals(VerificationFailure.DOWNGRADE, failure(verifier(identity = newer).verify(apk, metadata())))

        val same = installed.copy(versionCode = AppVersion(1, 1, 0).versionCode.toLong())
        assertEquals(VerificationFailure.NOT_NEWER, failure(verifier(identity = same).verify(apk, metadata())))
    }

    @Test
    fun rejectsApksNeedingANewerAndroid() {
        assertEquals(VerificationFailure.MIN_SDK, failure(verifier(info(minSdk = 31), sdk = 30).verify(apk, metadata().copy(minSdk = 31))))
    }

    @Test
    fun rejectsUnexpectedSigningCertificates() {
        val other = verifier(info(signers = listOf(Fixtures.CERT_B))).verify(apk, metadata(cert = Fixtures.CERT_B))
        assertEquals(VerificationFailure.SIGNER_NOT_COMPATIBLE, failure(other))
    }

    @Test
    fun signerClaimedInMetadataMustMatchTheRealSigner() {
        val result = verifier(info(signers = listOf(Fixtures.CERT_B))).verify(apk, metadata(cert = Fixtures.CERT_A))
        assertEquals(VerificationFailure.SIGNER_MISMATCH_METADATA, failure(result))
    }

    @Test
    fun rejectsMultipleSigners() {
        assertEquals(VerificationFailure.MULTIPLE_SIGNERS, failure(verifier(info(multiple = true)).verify(apk, metadata())))
        assertEquals(VerificationFailure.MULTIPLE_SIGNERS, failure(verifier(info(signers = listOf(Fixtures.CERT_A, Fixtures.CERT_B))).verify(apk, metadata())))
        assertEquals(VerificationFailure.MULTIPLE_SIGNERS, failure(verifier(info(signers = emptyList())).verify(apk, metadata())))
    }

    @Test
    fun pinnedIdentityMustMatchEvenWhenTheInstalledAppAgrees() {
        assertEquals(Verification.Ok, verifier(pins = setOf(Fixtures.CERT_A)).verify(apk, metadata()))
        val result = verifier(pins = setOf(Fixtures.CERT_B)).verify(apk, metadata())
        assertEquals(VerificationFailure.SIGNER_NOT_PINNED, failure(result))
    }

    @Test
    fun keyRotationIsAcceptedOnlyWithALineageProvingTheInstalledKey() {
        val rotated = info(signers = listOf(Fixtures.CERT_B), history = listOf(Fixtures.CERT_A, Fixtures.CERT_B))
        assertEquals(Verification.Ok, verifier(rotated).verify(apk, metadata(cert = Fixtures.CERT_B)))

        val noLineage = info(signers = listOf(Fixtures.CERT_B), history = emptyList())
        assertTrue(verifier(noLineage).verify(apk, metadata(cert = Fixtures.CERT_B)) is Verification.Failed)
    }
}
