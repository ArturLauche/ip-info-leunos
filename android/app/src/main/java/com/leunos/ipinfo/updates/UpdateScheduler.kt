package com.leunos.ipinfo.updates

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import com.leunos.ipinfo.BuildConfig
import com.leunos.ipinfo.IpInfoApplication
import java.util.concurrent.TimeUnit

/**
 * Schedules update work with WorkManager: a periodic (~24 h) check that respects Doze, standby and
 * battery restrictions, and download work whose network constraint is UNMETERED unless the user
 * explicitly asked for a download or opted in to metered automatic downloads. No exact alarms, no
 * foreground services.
 */
class UpdateScheduler(
    private val context: Context,
    /** Overridable so tests can exercise scheduling in debug builds, where the updater is disabled. */
    private val updaterEnabled: Boolean = BuildConfig.UPDATER_ENABLED,
) {
    private val workManager get() = WorkManager.getInstance(context)

    /** Applies the user's preference: schedule or cancel the periodic check. */
    fun syncPeriodicCheck(enabled: Boolean) {
        if (!updaterEnabled || !enabled) {
            workManager.cancelUniqueWork(UNIQUE_CHECK)
            return
        }
        val request = PeriodicWorkRequestBuilder<UpdateCheckWorker>(
            UpdatePolicy.PERIODIC_INTERVAL_HOURS,
            TimeUnit.HOURS,
            UpdatePolicy.PERIODIC_FLEX_HOURS,
            TimeUnit.HOURS,
        )
            .setConstraints(periodicConstraints())
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.MINUTES)
            .build()
        workManager.enqueueUniquePeriodicWork(UNIQUE_CHECK, ExistingPeriodicWorkPolicy.UPDATE, request)
    }

    fun enqueueDownload(userInitiated: Boolean, preferences: UpdatePreferences) {
        val request = OneTimeWorkRequestBuilder<UpdateDownloadWorker>()
            .setConstraints(downloadConstraints(userInitiated, preferences))
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .setInputData(workDataOf(UpdateDownloadWorker.KEY_USER_INITIATED to userInitiated))
            .build()
        // A user tap replaces an automatic request that is still waiting for an unmetered network;
        // an automatic request never replaces anything that is already queued or running.
        val policy = if (userInitiated) ExistingWorkPolicy.REPLACE else ExistingWorkPolicy.KEEP
        workManager.enqueueUniqueWork(UNIQUE_DOWNLOAD, policy, request)
    }

    fun cancelDownload() {
        workManager.cancelUniqueWork(UNIQUE_DOWNLOAD)
    }

    /** True while a download is queued, waiting for constraints, or running. Blocking: call off the main thread. */
    fun isDownloadActive(): Boolean = runCatching {
        workManager.getWorkInfosForUniqueWork(UNIQUE_DOWNLOAD).get().any { !it.state.isFinished }
    }.getOrDefault(false)

    companion object {
        const val UNIQUE_CHECK = "update-check-periodic"
        const val UNIQUE_DOWNLOAD = "update-download"

        fun periodicConstraints(): Constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()

        /** UNMETERED unless the user tapped Download or opted in to metered automatic downloads. */
        fun downloadConstraints(userInitiated: Boolean, preferences: UpdatePreferences): Constraints {
            val anyNetwork = userInitiated || preferences.allowMeteredAutoDownload
            return Constraints.Builder()
                .setRequiredNetworkType(if (anyNetwork) NetworkType.CONNECTED else NetworkType.UNMETERED)
                .setRequiresStorageNotLow(!userInitiated)
                .build()
        }
    }
}

class UpdateCheckWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val graph = (applicationContext as IpInfoApplication).graph
        if (!BuildConfig.UPDATER_ENABLED || !graph.preferences.autoUpdateChecks) return Result.success()
        val outcome = graph.updates.checkForUpdates(UpdateRepository.CheckTrigger.BACKGROUND)
        val retry = outcome is CheckOutcome.Failed && outcome.error.retryable && runAttemptCount < MAX_ATTEMPTS
        return if (retry) Result.retry() else Result.success()
    }

    private companion object {
        const val MAX_ATTEMPTS = 3
    }
}

class UpdateDownloadWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val graph = (applicationContext as IpInfoApplication).graph
        if (!BuildConfig.UPDATER_ENABLED) return Result.success()
        val userInitiated = inputData.getBoolean(KEY_USER_INITIATED, false)
        return when (val run = graph.updates.runDownload(userInitiated)) {
            is UpdateRepository.DownloadRun.Failed ->
                if (run.retryable && runAttemptCount < MAX_ATTEMPTS) Result.retry() else Result.failure()
            else -> Result.success()
        }
    }

    companion object {
        const val KEY_USER_INITIATED = "user_initiated"
        private const val MAX_ATTEMPTS = 5
    }
}
