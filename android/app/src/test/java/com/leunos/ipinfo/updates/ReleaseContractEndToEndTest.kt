package com.leunos.ipinfo.updates

import com.leunos.ipinfo.util.Sha256
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.io.File

/**
 * Feeds real publisher output (android-update.json plus the APK and checksum next to it, produced by
 * android/scripts/generate-update-metadata.mjs) through the production updater code. Runs only when
 * -Pipinfo.contract.metadata=<path> is given, as in the CI release dry run.
 */
class ReleaseContractEndToEndTest {
    private val metadataPath = System.getProperty("ipinfo.contract.metadata")?.takeIf { it.isNotBlank() }

    @Test
    fun publisherOutputIsAcceptedByTheUpdater() {
        assumeTrue("pass -Pipinfo.contract.metadata=<android-update.json> to run", metadataPath != null)
        val metadataFile = File(metadataPath!!)
        val text = metadataFile.readText()
        val metadata = UpdateMetadataParser.parse(text)
        val dir = metadataFile.parentFile!!

        val apk = File(dir, metadata.apkFileName)
        assertTrue("APK missing next to the metadata", apk.isFile)
        assertEquals(apk.length(), metadata.apkSizeBytes)
        assertEquals(Sha256.hex(apk), metadata.apkSha256)

        val checksum = File(dir, ReleaseContract.checksumAssetName(metadata.version))
        assertEquals("${metadata.apkSha256}  ${metadata.apkFileName}\n", checksum.readText())

        // A GitHub release as the publisher creates it, one version ahead of the "installed" app.
        val assets = listOf(
            Fixtures.asset(metadata.apkFileName, apk.length(), url = ReleaseContract.apkDownloadUrl(metadata.version), digest = "sha256:${metadata.apkSha256}"),
            Fixtures.asset(checksum.name, checksum.length()),
            Fixtures.asset(ReleaseContract.METADATA_ASSET_NAME, metadataFile.length(), url = ReleaseContract.metadataDownloadUrl(metadata.version)),
        )
        val release = Fixtures.release(metadata.tag, "assets" to assets)
        val installed = InstalledApp(metadata.applicationId, metadata.versionCode - 1L, null)
        val validator = CandidateValidator(installed, deviceSdkInt = 34, pinnedCertificates = setOf(metadata.signingCertSha256))

        val result = validator.validate(release, text)
        assertTrue("updater rejected the publisher output: $result", result is Validation.Valid)
        assertTrue(ReleaseSelector.stableReleases(listOf(release)).any { it.version == metadata.version })
    }
}
