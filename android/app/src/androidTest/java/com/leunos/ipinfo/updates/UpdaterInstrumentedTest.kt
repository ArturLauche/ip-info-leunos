package com.leunos.ipinfo.updates

import android.content.Context
import android.net.ConnectivityManager
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.MediumTest
import androidx.work.Configuration
import androidx.work.NetworkType
import androidx.work.WorkInfo
import androidx.work.WorkManager
import androidx.work.testing.WorkManagerTestInitHelper
import com.leunos.ipinfo.TestUtils
import com.leunos.ipinfo.settings.AppPreferences
import com.leunos.ipinfo.updates.http.HttpRequest
import com.leunos.ipinfo.updates.http.HttpResponse
import com.leunos.ipinfo.updates.http.HttpTransport
import com.leunos.ipinfo.util.ForegroundTracker
import com.leunos.ipinfo.util.NetworkStatusProvider
import com.leunos.ipinfo.util.Sha256
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.io.IOException

@RunWith(AndroidJUnit4::class)
@MediumTest
class UpdaterInstrumentedTest {
    private val context: Context get() = ApplicationProvider.getApplicationContext()
    private lateinit var workManager: WorkManager

    @Before
    fun setUp() {
        WorkManagerTestInitHelper.initializeTestWorkManager(context, Configuration.Builder().setMinimumLoggingLevel(android.util.Log.DEBUG).build())
        workManager = WorkManager.getInstance(context)
    }

    @After
    fun tearDown() {
        workManager.cancelAllWork().result.get()
        File(context.cacheDir, "guard-test").deleteRecursively()
        listOf("test_guard_state", "test_guard_settings").forEach { name ->
            context.getSharedPreferences(name, Context.MODE_PRIVATE).edit().clear().commit()
        }
    }

    private fun ownApk() = File(context.applicationInfo.sourceDir)

    @Test
    fun inspectsTheInstalledApkThroughThePlatformParser() {
        val identity = PackageIdentity.installedIdentity(context)
        val info = PackageManagerApkInspector(context).inspect(ownApk())
        assertNotNull("Android must be able to parse and verify its own APK", info)
        info!!
        assertEquals(context.packageName, info.packageName)
        assertEquals(identity.versionCode, info.versionCode)
        assertFalse(info.hasMultipleSigners)
        assertEquals(1, info.signers.size)
        assertEquals(identity.signers, info.signers.toSet())
        assertTrue(info.minSdk in 1..37)
    }

    /** Metadata describing [apk] itself, for [version], signed (as claimed) by the installed signer. */
    private fun metadataFor(apk: File, identity: InstalledIdentity, version: AppVersion): UpdateMetadata {
        val map = Fixtures.metadataMap(version.toString(), apk.length(), Sha256.hex(apk), identity.signers.single())
        map["applicationId"] = context.packageName
        return UpdateMetadataParser.parse(Fixtures.json(map))
    }

    /** Real parser and real signing data; only the display version name is aligned with the metadata. */
    private fun inspectorMatching(metadata: UpdateMetadata) =
        ApkInspector { file -> PackageManagerApkInspector(context).inspect(file)?.copy(versionName = metadata.versionName) }

    @Test
    fun realVerificationAcceptsEverythingExceptThatTheOwnApkIsNotNewer() {
        val apk = ownApk()
        val identity = PackageIdentity.installedIdentity(context)
        val metadata = metadataFor(apk, identity, AppVersion.fromVersionCode(identity.versionCode)!!)
        val result = ApkVerifier(inspectorMatching(metadata), identity, android.os.Build.VERSION.SDK_INT, emptySet()).verify(apk, metadata)
        assertTrue("got $result", result is Verification.Failed && result.failure == VerificationFailure.NOT_NEWER)
    }

    @Test
    fun aNewerVersionFromTheSameSignerWouldPassEveryCheckThatDoesNotNeedTheNewApk() {
        val apk = ownApk()
        val identity = PackageIdentity.installedIdentity(context)
        val metadata = metadataFor(apk, identity, AppVersion.fromVersionCode(identity.versionCode)!!)
        val olderInstalled = identity.copy(versionCode = identity.versionCode - 1)
        val result = ApkVerifier(inspectorMatching(metadata), olderInstalled, android.os.Build.VERSION.SDK_INT, emptySet()).verify(apk, metadata)
        assertEquals(Verification.Ok, result)
    }

    @Test
    fun foreignSignerIsRejectedByTheRealIdentityCheck() {
        val apk = ownApk()
        val identity = PackageIdentity.installedIdentity(context)
        val metadata = metadataFor(apk, identity, AppVersion.fromVersionCode(identity.versionCode)!!)
        val foreign = identity.copy(signers = setOf(Fixtures.CERT_B), signerHistory = emptySet(), versionCode = identity.versionCode - 1)
        val result = ApkVerifier(inspectorMatching(metadata), foreign, android.os.Build.VERSION.SDK_INT, emptySet()).verify(apk, metadata)
        assertTrue("got $result", result is Verification.Failed && result.failure == VerificationFailure.SIGNER_NOT_COMPATIBLE)
    }

    @Test
    fun installationIsRefusedUntilTheUserAllowsInstallsFromThisApp() {
        val controller = PackageInstallerController(context)
        val apk = ownApk()
        val metadata = UpdateMetadataParser.parse(Fixtures.metadataJson("1.1.0", apk.length(), Sha256.hex(apk)))
        if (controller.canRequestInstalls()) return // device already allows it; nothing to refuse
        assertEquals(PackageInstallerController.StartResult.NeedsInstallPermission, controller.install(apk, metadata, unattended = false))
    }

    @Test
    fun periodicCheckIsScheduledOncePerDayWithNetworkAndBatteryConstraints() {
        UpdateScheduler(context, updaterEnabled = true).syncPeriodicCheck(true)
        val infos = workManager.getWorkInfosForUniqueWork(UpdateScheduler.UNIQUE_CHECK).get()
        assertEquals(1, infos.size)
        val info = infos.single()
        assertEquals(WorkInfo.State.ENQUEUED, info.state)
        assertEquals(NetworkType.CONNECTED, info.constraints.requiredNetworkType)
        assertTrue(info.constraints.requiresBatteryNotLow())
        assertTrue(info.tags.any { it.contains("UpdateCheckWorker") })

        UpdateScheduler(context, updaterEnabled = true).syncPeriodicCheck(true)
        assertEquals("rescheduling must not duplicate work", 1, workManager.getWorkInfosForUniqueWork(UpdateScheduler.UNIQUE_CHECK).get().size)

        UpdateScheduler(context, updaterEnabled = true).syncPeriodicCheck(false)
        assertTrue(workManager.getWorkInfosForUniqueWork(UpdateScheduler.UNIQUE_CHECK).get().all { it.state == WorkInfo.State.CANCELLED })
    }

    @Test
    fun automaticDownloadsWaitForAnUnmeteredNetworkAndManualOnesDoNot() {
        val scheduler = UpdateScheduler(context, updaterEnabled = true)
        scheduler.enqueueDownload(userInitiated = false, preferences = UpdatePreferences())
        val auto = workManager.getWorkInfosForUniqueWork(UpdateScheduler.UNIQUE_DOWNLOAD).get().single()
        assertEquals(NetworkType.UNMETERED, auto.constraints.requiredNetworkType)

        scheduler.enqueueDownload(userInitiated = true, preferences = UpdatePreferences())
        val manual = workManager.getWorkInfosForUniqueWork(UpdateScheduler.UNIQUE_DOWNLOAD).get().first { !it.state.isFinished }
        assertEquals(NetworkType.CONNECTED, manual.constraints.requiredNetworkType)

        scheduler.cancelDownload()
        assertTrue(workManager.getWorkInfosForUniqueWork(UpdateScheduler.UNIQUE_DOWNLOAD).get().all { it.state.isFinished })
    }

    /** Counts requests instead of reaching the network, so a test can prove whether a download was attempted. */
    private class CountingTransport : HttpTransport {
        var requests = 0

        override fun execute(request: HttpRequest): HttpResponse {
            requests++
            throw IOException("no network access expected in this test")
        }
    }

    /** A real repository over isolated preferences and storage whose state is a download killed with its process. */
    private fun repositoryWithInterruptedDownload(autoDownloadOn: Boolean, transport: HttpTransport): Pair<UpdateRepository, UpdateStateStore> {
        val statePrefs = context.getSharedPreferences("test_guard_state", Context.MODE_PRIVATE).also { it.edit().clear().commit() }
        val settingsPrefs = context.getSharedPreferences("test_guard_settings", Context.MODE_PRIVATE).also { it.edit().clear().commit() }
        val preferences = AppPreferences(settingsPrefs).apply { autoDownload = autoDownloadOn }
        val store = UpdateStateStore(statePrefs)
        val json = Fixtures.metadataJson("1.1.0")
        val candidate = UpdateCandidate(UpdateMetadataParser.parse(json), json, "notes", "https://github.com/x", null)
        store.update { UpdateStateMachine.downloadStarted(UpdateStateMachine.checkSucceeded(it, CheckOutcome.Available(candidate), 1)) }
        val directory = File(context.cacheDir, "guard-test").also { it.deleteRecursively() }
        val repository = UpdateRepository(
            context = context,
            store = store,
            preferences = preferences,
            transport = transport,
            releasesCache = FileReleasesCache(File(directory, "releases.json")),
            storage = UpdateStorage(File(directory, "apks")),
            installer = PackageInstallerController(context),
            scheduler = UpdateScheduler(context, updaterEnabled = true),
            notifier = UpdateNotifier(context, store, preferences),
            foreground = ForegroundTracker(),
            network = NetworkStatusProvider(context.getSystemService(ConnectivityManager::class.java)),
        )
        return repository to store
    }

    @Test
    fun aQueuedAutomaticDownloadIsSkippedAfterOptOutAndLeavesNoStalePhase() {
        val transport = CountingTransport()
        val (repository, store) = repositoryWithInterruptedDownload(autoDownloadOn = false, transport = transport)
        assertEquals(UpdatePhase.DOWNLOADING, store.current.phase)

        val run = runBlocking { repository.runDownload(userInitiated = false) }

        assertEquals(UpdateRepository.DownloadRun.NothingToDo, run)
        assertEquals("the release stays available for a manual download", UpdatePhase.AVAILABLE, store.current.phase)
        assertEquals("an opted-out automatic download must not touch the network", 0, transport.requests)
    }

    @Test
    fun aManualDownloadIsNeverHeldBackByTheAutomaticDownloadOptOut() {
        val transport = CountingTransport()
        val (repository, _) = repositoryWithInterruptedDownload(autoDownloadOn = false, transport = transport)

        runBlocking { repository.runDownload(userInitiated = true) }

        assertTrue("a manual download must reach the network", transport.requests >= 1)
    }

    @Test
    fun updateStateAndSettingsSurviveARestartOfTheComponents() {
        val prefs = context.getSharedPreferences("test_update_state", Context.MODE_PRIVATE)
        prefs.edit().clear().commit()
        val json = Fixtures.metadataJson("1.1.0")
        val candidate = UpdateCandidate(UpdateMetadataParser.parse(json), json, "notes", "https://github.com/x", null)
        UpdateStateStore(prefs).update { UpdateStateMachine.checkSucceeded(it, CheckOutcome.Available(candidate), 42) }
        val restored = UpdateStateStore(prefs).current
        assertEquals(UpdatePhase.AVAILABLE, restored.phase)
        assertEquals("1.1.0", restored.candidate?.metadata?.versionName)
        prefs.edit().clear().commit()
        assertFalse(TestUtils.context.packageName.isEmpty())
    }
}
