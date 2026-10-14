package com.leunos.ipinfo.updates

import com.leunos.ipinfo.util.Sha256
import java.io.File

/** Facts about an APK file as reported by Android's package parser (which also verifies its signature). */
data class ApkInfo(
    val packageName: String,
    val versionCode: Long,
    val versionName: String?,
    val minSdk: Int,
    val targetSdk: Int,
    /** SHA-256 of the current signing certificate(s), lowercase hex. */
    val signers: List<String>,
    val hasMultipleSigners: Boolean,
    /** SHA-256 of past signing certificates when the APK carries a rotation lineage. */
    val signerHistory: List<String>,
)

/** Signing identity of the installed app. */
data class InstalledIdentity(
    val packageName: String,
    val versionCode: Long,
    val signers: Set<String>,
    val signerHistory: Set<String>,
)

/** Abstraction over `PackageManager.getPackageArchiveInfo`; null means unreadable, corrupt or badly signed. */
fun interface ApkInspector {
    fun inspect(file: File): ApkInfo?
}

enum class VerificationFailure {
    MISSING,
    SIZE_MISMATCH,
    CHECKSUM_MISMATCH,
    UNREADABLE_OR_BADLY_SIGNED,
    WRONG_PACKAGE,
    VERSION_MISMATCH,
    DOWNGRADE,
    NOT_NEWER,
    MIN_SDK,
    MULTIPLE_SIGNERS,
    SIGNER_MISMATCH_METADATA,
    SIGNER_NOT_PINNED,
    SIGNER_NOT_COMPATIBLE,
}

sealed interface Verification {
    data object Ok : Verification
    data class Failed(val failure: VerificationFailure, val detail: String) : Verification
}

/**
 * Verifies a downloaded APK before it may be installed. The metadata checksum only proves the file
 * arrived intact; authenticity comes from the APK's own signature, which must match the identity of
 * the app that is already installed (and the pinned release identity when one is configured).
 */
class ApkVerifier(
    private val inspector: ApkInspector,
    private val installed: InstalledIdentity,
    private val deviceSdkInt: Int,
    private val pinnedCertificates: Set<String>,
) {
    fun verify(file: File, metadata: UpdateMetadata): Verification {
        if (!file.isFile) return fail(VerificationFailure.MISSING, "APK file does not exist")
        if (file.length() != metadata.apkSizeBytes) {
            return fail(VerificationFailure.SIZE_MISMATCH, "size ${file.length()} != ${metadata.apkSizeBytes}")
        }
        if (Sha256.hex(file) != metadata.apkSha256) return fail(VerificationFailure.CHECKSUM_MISMATCH, "SHA-256 differs")

        val info = inspector.inspect(file)
            ?: return fail(VerificationFailure.UNREADABLE_OR_BADLY_SIGNED, "Android could not parse or verify the package")

        if (info.packageName != installed.packageName || info.packageName != metadata.applicationId) {
            return fail(VerificationFailure.WRONG_PACKAGE, "package ${info.packageName}")
        }
        if (info.versionCode != metadata.versionCode.toLong() || info.versionName != metadata.versionName) {
            return fail(VerificationFailure.VERSION_MISMATCH, "APK ${info.versionName}/${info.versionCode} != metadata")
        }
        if (info.versionCode < installed.versionCode) return fail(VerificationFailure.DOWNGRADE, "would downgrade the app")
        if (info.versionCode == installed.versionCode) return fail(VerificationFailure.NOT_NEWER, "same version code")
        if (info.minSdk > deviceSdkInt) return fail(VerificationFailure.MIN_SDK, "requires API ${info.minSdk}")
        if (info.minSdk != metadata.minSdk) return fail(VerificationFailure.VERSION_MISMATCH, "minSdk differs from metadata")

        if (info.hasMultipleSigners || info.signers.size != 1) {
            return fail(VerificationFailure.MULTIPLE_SIGNERS, "expected exactly one signer")
        }
        val signer = info.signers.single()
        if (signer != metadata.signingCertSha256) {
            return fail(VerificationFailure.SIGNER_MISMATCH_METADATA, "APK signer differs from metadata")
        }
        if (pinnedCertificates.isNotEmpty() && signer !in pinnedCertificates) {
            return fail(VerificationFailure.SIGNER_NOT_PINNED, "APK signer is not a pinned identity")
        }
        val compatible = signer in installed.signers || installed.signers.any { it in info.signerHistory }
        if (!compatible) return fail(VerificationFailure.SIGNER_NOT_COMPATIBLE, "APK is signed with a different key than the installed app")

        return Verification.Ok
    }

    private fun fail(failure: VerificationFailure, detail: String) = Verification.Failed(failure, detail)
}
