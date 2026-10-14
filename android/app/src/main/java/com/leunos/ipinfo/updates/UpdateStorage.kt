package com.leunos.ipinfo.updates

import android.annotation.SuppressLint
import java.io.File

/**
 * App-private storage for downloaded APKs. Nothing here is world readable. Production passes a
 * StorageManager based free-space provider (which counts clearable cache); the default is for tests.
 */
@SuppressLint("UsableSpace")
class UpdateStorage(
    private val directory: File,
    private val freeSpace: () -> Long = { directory.usableSpace },
) {
    init {
        directory.mkdirs()
    }

    fun apkFile(version: AppVersion): File = File(directory, ReleaseContract.apkAssetName(version))

    fun partFile(version: AppVersion): File = File(directory, ReleaseContract.apkAssetName(version) + ".part")

    fun resumeInfoFile(version: AppVersion): File = File(directory, ReleaseContract.apkAssetName(version) + ".part.json")

    fun freeBytes(): Long = freeSpace()

    /** Removes every stored file that does not belong to [keep] (obsolete versions, orphaned partials). */
    fun cleanupExcept(keep: AppVersion?) {
        val keepPrefix = keep?.let { ReleaseContract.apkAssetName(it) }
        directory.listFiles()?.forEach { file ->
            if (keepPrefix == null || !file.name.startsWith(keepPrefix)) file.deleteRecursively()
        }
    }

    fun deleteAll() = cleanupExcept(null)

    fun deletePartial(version: AppVersion) {
        partFile(version).delete()
        resumeInfoFile(version).delete()
    }
}
