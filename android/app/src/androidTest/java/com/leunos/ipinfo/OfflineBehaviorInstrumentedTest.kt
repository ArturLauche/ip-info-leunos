package com.leunos.ipinfo

import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import androidx.test.uiautomator.By
import androidx.test.uiautomator.Until
import com.leunos.ipinfo.TestUtils.offlinePanelShown
import com.leunos.ipinfo.TestUtils.read
import com.leunos.ipinfo.diagnostics.NetworkSnapshotSource
import com.leunos.ipinfo.diagnostics.model.NetworkSnapshot
import com.leunos.ipinfo.util.NetworkStatusProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CopyOnWriteArrayList

/**
 * Connectivity loss and recovery on a real (emulated) network stack: the diagnostics source must report
 * the change as an event, and the website screen must show the native offline screen instead of a blank
 * page. The network is always restored afterwards.
 */
@RunWith(AndroidJUnit4::class)
@LargeTest
class OfflineBehaviorInstrumentedTest {
    private val context get() = TestUtils.context
    private val status get() = NetworkStatusProvider(context.getSystemService(android.net.ConnectivityManager::class.java))

    private fun setNetworks(enabled: Boolean) {
        val verb = if (enabled) "enable" else "disable"
        TestUtils.shell("svc wifi $verb")
        TestUtils.shell("svc data $verb")
    }

    @Test
    fun connectivityLossIsReportedAndTheOfflineScreenOffersRecovery() {
        assumeTrue("no connectivity to start with", status.current().connected)

        val snapshots = CopyOnWriteArrayList<NetworkSnapshot>()
        val scope = CoroutineScope(Job() + Dispatchers.Default)
        scope.launch { NetworkSnapshotSource(context).snapshots().collect { snapshots += it } }

        try {
            assertTrue("baseline snapshot", TestUtils.waitFor(20_000) { snapshots.isNotEmpty() })

            setNetworks(false)
            val lost = TestUtils.waitFor(45_000) { !status.current().connected }
            assumeTrue("the emulator did not drop connectivity", lost)
            assertTrue(
                "the source must emit an event when the connection changes while the screen is open",
                TestUtils.waitFor(30_000) { snapshots.lastOrNull()?.defaultNetwork == null || snapshots.size > 1 },
            )

            ActivityScenario.launch(MainActivity::class.java).use { scenario ->
                assertTrue("offline screen must appear", TestUtils.waitFor(60_000) { scenario.offlinePanelShown() })
                val retry = TestUtils.device.wait(Until.findObject(By.text(context.getString(R.string.offline_retry))), 10_000)
                assertTrue("retry action available", retry != null)
                val diagnosticsEntry = TestUtils.device.hasObject(By.text(context.getString(R.string.offline_open_diagnostics)))
                assertTrue("native diagnostics reachable while offline", diagnosticsEntry)
                assertTrue("settings reachable while offline", TestUtils.device.hasObject(By.text(context.getString(R.string.offline_open_settings))))

                setNetworks(true)
                assertTrue("connectivity returns", TestUtils.waitFor(90_000) { status.current().connected })
                // Android validates the network asynchronously; the screen retries by itself when it does.
                val recovered = TestUtils.waitFor(90_000) { !scenario.offlinePanelShown() }
                if (!recovered) {
                    scenario.read { it.findViewById<android.view.View>(R.id.offline_panel).findViewById<android.view.View>(R.id.retry_button).performClick() }
                    assertTrue("retry loads the page again", TestUtils.waitFor(60_000) { !scenario.offlinePanelShown() })
                }
            }
        } finally {
            setNetworks(true)
            scope.coroutineContext[Job]?.cancel()
            TestUtils.waitFor(60_000) { status.current().connected }
        }
    }
}
