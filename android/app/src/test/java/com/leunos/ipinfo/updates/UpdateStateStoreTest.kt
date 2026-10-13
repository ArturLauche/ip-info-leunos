package com.leunos.ipinfo.updates

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class UpdateStateStoreTest {
    private val prefs = FakeSharedPreferences()

    private fun candidate(): UpdateCandidate {
        val json = Fixtures.metadataJson("1.1.0")
        return UpdateCandidate(UpdateMetadataParser.parse(json), json, "Some notes", "https://github.com/x/releases/tag/android-v1.1.0", "2026-10-13T12:00:00Z")
    }

    @Test
    fun startsEmpty() {
        val state = UpdateStateStore(prefs).current
        assertEquals(UpdatePhase.IDLE, state.phase)
        assertNull(state.candidate)
        assertNull(state.lastCheckSuccessAt)
    }

    @Test
    fun stateSurvivesAProcessRestart() {
        val store = UpdateStateStore(prefs)
        store.update { UpdateStateMachine.checkSucceeded(it, CheckOutcome.Available(candidate()), 1234) }
        store.update { UpdateStateMachine.downloadStarted(it) }
        store.update { UpdateStateMachine.downloadFailed(it, UpdateFailure.CHECKSUM_MISMATCH, "detail") }
        store.update { it.copy(rateLimitedUntil = 99, installSessionId = 5) }

        val restored = UpdateStateStore(prefs).current
        assertEquals(UpdatePhase.FAILED, restored.phase)
        assertEquals(UpdateFailure.CHECKSUM_MISMATCH, restored.failure)
        assertEquals("detail", restored.failureDetail)
        assertEquals(1234L, restored.lastCheckSuccessAt)
        assertEquals(99L, restored.rateLimitedUntil)
        assertEquals(5, restored.installSessionId)
        assertEquals("Some notes", restored.candidate?.releaseNotes)
        assertEquals("1.1.0", restored.candidate?.metadata?.versionName)
    }

    @Test
    fun corruptedCandidateDataFallsBackToIdle() {
        prefs.edit().putString("phase", "READY_TO_INSTALL").putString("candidate_json", "{ broken").commit()
        val state = UpdateStateStore(prefs).current
        assertEquals(UpdatePhase.IDLE, state.phase)
        assertNull(state.candidate)
    }

    @Test
    fun unknownEnumValuesAreIgnoredNotFatal() {
        prefs.edit().putString("phase", "NOT_A_PHASE").putString("failure", "???").putString("last_check_error", "x").commit()
        val state = UpdateStateStore(prefs).current
        assertEquals(UpdatePhase.IDLE, state.phase)
        assertNull(state.failure)
        assertNull(state.lastCheckError)
    }

    @Test
    fun observersSeeEveryChange() {
        val store = UpdateStateStore(prefs)
        store.update { it.copy(lastCheckAttemptAt = 5) }
        assertEquals(5L, store.state.value.lastCheckAttemptAt)
        store.update { it }
        assertEquals(5L, store.state.value.lastCheckAttemptAt)
    }

    @Test
    fun notificationDeduplicationMarkersArePersisted() {
        val store = UpdateStateStore(prefs)
        store.notifiedAvailableVersionCode = 1_001_000
        store.notifiedReadyVersionCode = 1_001_000
        val again = UpdateStateStore(prefs)
        assertEquals(1_001_000L, again.notifiedAvailableVersionCode)
        assertEquals(1_001_000L, again.notifiedReadyVersionCode)
        assertTrue(prefs.data.values.none { it is String && it.contains("ssid", ignoreCase = true) })
    }
}
