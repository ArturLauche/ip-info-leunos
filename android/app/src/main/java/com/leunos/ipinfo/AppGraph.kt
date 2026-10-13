package com.leunos.ipinfo

import android.app.Application
import android.content.Context
import android.net.ConnectivityManager
import android.os.storage.StorageManager
import com.leunos.ipinfo.settings.AppPreferences
import com.leunos.ipinfo.updates.FileReleasesCache
import com.leunos.ipinfo.updates.PackageInstallerController
import com.leunos.ipinfo.updates.ReleaseContract
import com.leunos.ipinfo.updates.UpdateNotifier
import com.leunos.ipinfo.updates.UpdateRepository
import com.leunos.ipinfo.updates.UpdateScheduler
import com.leunos.ipinfo.updates.UpdateStateStore
import com.leunos.ipinfo.updates.UpdateStorage
import com.leunos.ipinfo.updates.http.UrlConnectionTransport
import com.leunos.ipinfo.updates.http.UrlPolicy
import com.leunos.ipinfo.util.ForegroundTracker
import com.leunos.ipinfo.util.NetworkStatusProvider
import java.io.File

/**
 * Hand-written composition root. The app is small enough that a dependency-injection framework
 * would cost more than it saves; every collaborator is constructed here, once.
 */
class AppGraph(private val application: Application) {
    val preferences: AppPreferences by lazy {
        AppPreferences(application.getSharedPreferences(AppPreferences.FILE_NAME, Context.MODE_PRIVATE))
    }

    val foreground = ForegroundTracker()

    val networkStatus: NetworkStatusProvider by lazy {
        NetworkStatusProvider(application.getSystemService(ConnectivityManager::class.java))
    }

    val scheduler: UpdateScheduler by lazy { UpdateScheduler(application) }

    val notifier: UpdateNotifier by lazy { UpdateNotifier(application, updateStore, preferences) }

    private val updateStore: UpdateStateStore by lazy {
        UpdateStateStore(application.getSharedPreferences(UpdateStateStore.FILE_NAME, Context.MODE_PRIVATE))
    }

    val updates: UpdateRepository by lazy {
        val transport = UrlConnectionTransport(
            policy = UrlPolicy.GITHUB,
            userAgent = "IPInfo-Android/${BuildConfig.VERSION_NAME} (+${ReleaseContract.REPOSITORY_URL})",
        )
        UpdateRepository(
            context = application,
            store = updateStore,
            preferences = preferences,
            transport = transport,
            releasesCache = FileReleasesCache(File(application.cacheDir, "updates/releases.json")),
            storage = updateStorage(),
            installer = PackageInstallerController(application),
            scheduler = scheduler,
            notifier = notifier,
            foreground = foreground,
            network = networkStatus,
        )
    }

    /** Free space as the platform sees it: includes cached data Android can clear on demand. */
    private fun updateStorage(): UpdateStorage {
        val directory = File(application.noBackupFilesDir, "updates")
        val storageManager = application.getSystemService(StorageManager::class.java)
        directory.mkdirs()
        return UpdateStorage(directory) {
            runCatching { storageManager.getAllocatableBytes(storageManager.getUuidForPath(directory)) }
                .getOrElse { @Suppress("UsableSpace") directory.usableSpace }
        }
    }
}
