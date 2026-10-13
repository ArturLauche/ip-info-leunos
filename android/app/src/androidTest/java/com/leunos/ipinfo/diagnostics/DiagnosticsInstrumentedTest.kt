package com.leunos.ipinfo.diagnostics

import android.Manifest
import androidx.recyclerview.widget.RecyclerView
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.MediumTest
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.By
import androidx.test.uiautomator.Until
import com.leunos.ipinfo.R
import com.leunos.ipinfo.TestUtils
import com.leunos.ipinfo.TestUtils.read
import com.leunos.ipinfo.diagnostics.model.DiagnosticsItem
import com.leunos.ipinfo.diagnostics.model.FieldKey
import com.leunos.ipinfo.diagnostics.model.LocationPermissionState
import com.leunos.ipinfo.diagnostics.model.NetworkSnapshot
import com.leunos.ipinfo.diagnostics.model.Value
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeoutOrNull
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.FixMethodOrder
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.MethodSorters

/**
 * Real-device checks of the native diagnostics. Ordered: the "denied" scenario must run before any
 * test grants the location permission (granting does not restart the process; revoking would).
 */
@RunWith(AndroidJUnit4::class)
@MediumTest
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
class DiagnosticsInstrumentedTest {
    private val context get() = TestUtils.context

    /** The first emission can precede the link properties callback, so callers may wait for a complete snapshot. */
    private fun snapshot(timeoutMs: Long = 20_000, accept: (NetworkSnapshot) -> Boolean = { true }): NetworkSnapshot? = runBlocking {
        withTimeoutOrNull(timeoutMs) { NetworkSnapshotSource(context).snapshots().first(accept) }
    }

    private fun locationGranted() =
        context.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED

    private fun rows(scenario: ActivityScenario<NetworkDiagnosticsActivity>): List<DiagnosticsRow> =
        scenario.read { activity ->
            val list = activity.findViewById<RecyclerView>(R.id.list)
            (list.adapter as DiagnosticsAdapter).currentList
        }

    @Test
    fun a1_collectsASnapshotFromAndroidWithoutAnyScan() {
        val snap = snapshot()
        assertNotNull("the snapshot source must emit", snap)
        val default = snap!!.defaultNetwork
        assumeTrue("device has no default network", default != null)
        assertTrue("default network should report internet capability", default!!.capabilities.hasInternet)
        assertTrue(default.transports.isNotEmpty())
        default.link?.let { link -> assertTrue("a connected network has at least one address", link.addresses.isNotEmpty()) }
    }

    @Test
    fun a2_diagnosticsScreenShowsConnectionOverviewAndLocalVsPublicExplanation() {
        ActivityScenario.launch(NetworkDiagnosticsActivity::class.java).use { scenario ->
            assertTrue(
                "the screen title is shown",
                TestUtils.device.wait(Until.hasObject(By.text(context.getString(R.string.diag_title))), 15_000),
            )
            assertTrue("rows are populated", TestUtils.waitFor(30_000) { rows(scenario).isNotEmpty() })
            val rows = rows(scenario)
            assertTrue(rows.any { it is DiagnosticsRow.Header && it.title == context.getString(R.string.diag_section_overview) })
            assertTrue(rows.any { it is DiagnosticsRow.Notice && it.text == context.getString(R.string.diag_notice_local_vs_public) } || snapshot()?.defaultNetwork == null)
        }
    }

    @Test
    fun a3_deniedLocationShowsAnExplanationAndNeverAutoPromptsForPermission() {
        assumeTrue("location already granted on this device", !locationGranted())
        ActivityScenario.launch(NetworkDiagnosticsActivity::class.java).use { scenario ->
            assertTrue(TestUtils.waitFor(30_000) { rows(scenario).isNotEmpty() })
            val wifiShown = TestUtils.waitFor(5_000) { rows(scenario).any { it is DiagnosticsRow.Header && it.title == context.getString(R.string.diag_section_wifi) } }
            assumeTrue("not connected to Wi-Fi; nothing to explain", wifiShown)

            val ssid = rows(scenario).filterIsInstance<DiagnosticsRow.Field>().first { it.id == FieldKey.WIFI_SSID.name }
            assertTrue("the SSID must be reported as unavailable, not invented: ${ssid.value}", ssid.unavailable)
            assertEquals(context.getString(R.string.unavailable_needs_permission), ssid.value)
            assertTrue(rows(scenario).any { it is DiagnosticsRow.Notice && it.action == NoticeAction.REQUEST_LOCATION_PERMISSION })

            // No system permission dialog may appear on its own.
            assertFalse(
                "no unsolicited permission dialog",
                TestUtils.device.wait(Until.hasObject(By.res("com.android.permissioncontroller:id/permission_allow_foreground_only_button")), 2_000),
            )
        }
    }

    @Test
    fun a4_permissionActionExplainsBeforeAsking() {
        assumeTrue(!locationGranted())
        ActivityScenario.launch(NetworkDiagnosticsActivity::class.java).use { scenario ->
            assertTrue(TestUtils.waitFor(30_000) { rows(scenario).isNotEmpty() })
            assumeTrue("no Wi-Fi permission notice on this network", TestUtils.waitFor(5_000) { rows(scenario).any { it is DiagnosticsRow.Notice && it.action == NoticeAction.REQUEST_LOCATION_PERMISSION } })
            // The notice sits below the fold on small screens; UiAutomator only sees visible views.
            scenario.onActivity { activity ->
                val list = activity.findViewById<RecyclerView>(R.id.list)
                val index = rows(scenario).indexOfFirst { it is DiagnosticsRow.Notice && it.action == NoticeAction.REQUEST_LOCATION_PERMISSION }
                list.scrollToPosition(index)
            }
            InstrumentationRegistry.getInstrumentation().waitForIdleSync()
            val button = TestUtils.device.wait(Until.findObject(By.text(context.getString(R.string.diag_action_allow_wifi_name))), 10_000)
            assertNotNull(button)
            button.click()
            val explanation = TestUtils.device.wait(Until.hasObject(By.text(context.getString(R.string.diag_permission_title))), 10_000)
            assertTrue("an explanation dialog must precede the system dialog", explanation)
            TestUtils.device.findObject(By.text(context.getString(R.string.action_not_now)))?.click()
            assertFalse(locationGranted())
        }
    }

    @Test
    fun b1_grantedLocationRevealsTheWifiNameWhenAndroidAllowsIt() {
        TestUtils.shell("pm grant ${context.packageName} ${Manifest.permission.ACCESS_FINE_LOCATION}")
        TestUtils.shell("pm grant ${context.packageName} ${Manifest.permission.ACCESS_COARSE_LOCATION}")
        assumeTrue(locationGranted())
        ActivityScenario.launch(NetworkDiagnosticsActivity::class.java).use { scenario ->
            assertTrue(TestUtils.waitFor(30_000) { rows(scenario).isNotEmpty() })
            val hasWifi = TestUtils.waitFor(5_000) { rows(scenario).any { it is DiagnosticsRow.Header && it.title == context.getString(R.string.diag_section_wifi) } }
            assumeTrue("not connected to Wi-Fi", hasWifi)

            val access = scenario.read { DiagnosticsPermissions.access(it, it, requestedBefore = true) }
            assertEquals(LocationPermissionState.PRECISE_GRANTED, access.permission)
            val ssid = rows(scenario).filterIsInstance<DiagnosticsRow.Field>().first { it.id == FieldKey.WIFI_SSID.name }
            if (access.locationServicesEnabled) {
                assertTrue(
                    "with permission and location on, the name must not be reported as permission-gated: ${ssid.value}",
                    ssid.value != context.getString(R.string.unavailable_needs_permission),
                )
            } else {
                assertEquals(context.getString(R.string.unavailable_needs_location_services), ssid.value)
            }
        }
    }

    @Test
    fun c1_copyingAValuePutsItOnTheClipboard() {
        ActivityScenario.launch(NetworkDiagnosticsActivity::class.java).use { scenario ->
            assertTrue(TestUtils.waitFor(30_000) { rows(scenario).isNotEmpty() })
            val candidate = rows(scenario).filterIsInstance<DiagnosticsRow.Field>().firstOrNull { it.copyText != null }
            assumeTrue("nothing copyable (no network)", candidate != null)
            val copyable: DiagnosticsRow.Field = candidate!!
            scenario.onActivity { activity ->
                val list = activity.findViewById<RecyclerView>(R.id.list)
                val index = rows(scenario).indexOf(copyable)
                list.scrollToPosition(index)
            }
            InstrumentationRegistry.getInstrumentation().waitForIdleSync()
            scenario.onActivity { activity ->
                val list = activity.findViewById<RecyclerView>(R.id.list)
                val index = rows(scenario).indexOf(copyable)
                val holder = list.findViewHolderForAdapterPosition(index)
                assertNotNull(holder)
                holder!!.itemView.performClick()
            }
            val clip = scenario.read { activity ->
                val manager = activity.getSystemService(android.content.ClipboardManager::class.java)
                manager.primaryClip?.getItemAt(0)?.text?.toString()
            }
            assertEquals(copyable.copyText, clip)
        }
    }

    @Test
    fun d1_privateAddressesAreNotLabelledAsPublic() {
        val snap = snapshot { it.defaultNetwork?.link != null }
        assumeTrue("no default network with link properties", snap != null)
        val model = com.leunos.ipinfo.diagnostics.model.DiagnosticsModelBuilder.build(
            snap, com.leunos.ipinfo.diagnostics.model.LocationAccess(LocationPermissionState.NOT_ASKED, false), android.os.Build.VERSION.SDK_INT,
        )
        val v4 = model.field(FieldKey.LOCAL_IPV4) as DiagnosticsItem.Field
        v4.values.filterIsInstance<Value.Address>().forEach { address ->
            val first = address.address.split('.').firstOrNull()?.toIntOrNull()
            if (first == 10 || address.address.startsWith("192.168.")) {
                assertEquals(com.leunos.ipinfo.diagnostics.model.AddressScope.PRIVATE, address.scope)
            }
        }
        assertTrue(model.hasNotice(com.leunos.ipinfo.diagnostics.model.NoticeKind.LOCAL_VS_PUBLIC))
    }
}
