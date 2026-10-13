package com.leunos.ipinfo.updates

import android.content.Context
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.Signature
import android.os.Build
import com.leunos.ipinfo.util.Sha256
import java.io.File

/** Reads package identity through the platform parser, which also verifies APK signatures. */
class PackageManagerApkInspector(private val context: Context) : ApkInspector {
    override fun inspect(file: File): ApkInfo? = try {
        val info = archiveInfo(file.path) ?: return null
        val signing = info.signingInfo ?: return null
        val application = info.applicationInfo
        ApkInfo(
            packageName = info.packageName,
            versionCode = info.longVersionCode,
            versionName = info.versionName,
            minSdk = application?.minSdkVersion ?: 0,
            targetSdk = application?.targetSdkVersion ?: 0,
            signers = signing.apkContentsSigners.orEmpty().map(::fingerprint),
            hasMultipleSigners = signing.hasMultipleSigners(),
            signerHistory = if (signing.hasPastSigningCertificates()) {
                signing.signingCertificateHistory.orEmpty().map(::fingerprint)
            } else {
                emptyList()
            },
        )
    } catch (e: RuntimeException) {
        null
    }

    @Suppress("DEPRECATION")
    private fun archiveInfo(path: String): PackageInfo? {
        val pm = context.packageManager
        return if (Build.VERSION.SDK_INT >= 33) {
            pm.getPackageArchiveInfo(path, PackageManager.PackageInfoFlags.of(PackageManager.GET_SIGNING_CERTIFICATES.toLong()))
        } else {
            pm.getPackageArchiveInfo(path, PackageManager.GET_SIGNING_CERTIFICATES)
        }
    }
}

fun fingerprint(signature: Signature): String = Sha256.hex(signature.toByteArray())

object PackageIdentity {
    @Suppress("DEPRECATION")
    private fun installedInfo(context: Context): PackageInfo {
        val pm = context.packageManager
        return if (Build.VERSION.SDK_INT >= 33) {
            pm.getPackageInfo(context.packageName, PackageManager.PackageInfoFlags.of(PackageManager.GET_SIGNING_CERTIFICATES.toLong()))
        } else {
            pm.getPackageInfo(context.packageName, PackageManager.GET_SIGNING_CERTIFICATES)
        }
    }

    fun installedApp(context: Context): InstalledApp {
        val info = installedInfo(context)
        return InstalledApp(info.packageName, info.longVersionCode, info.versionName)
    }

    fun installedIdentity(context: Context): InstalledIdentity {
        val info = installedInfo(context)
        val signing = info.signingInfo
        return InstalledIdentity(
            packageName = info.packageName,
            versionCode = info.longVersionCode,
            signers = signing?.apkContentsSigners.orEmpty().map(::fingerprint).toSet(),
            signerHistory = if (signing?.hasPastSigningCertificates() == true) {
                signing.signingCertificateHistory.orEmpty().map(::fingerprint).toSet()
            } else {
                emptySet()
            },
        )
    }

    /** SHA-256 fingerprint(s) of the certificate this app is signed with, for display in About. */
    fun signingFingerprints(context: Context): List<String> = installedIdentity(context).signers.toList()
}
