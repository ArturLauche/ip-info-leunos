package com.leunos.ipinfo.diagnostics

import android.app.Application
import android.os.Build
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.leunos.ipinfo.diagnostics.model.ConnectionEvent
import com.leunos.ipinfo.diagnostics.model.DiagnosticsModel
import com.leunos.ipinfo.diagnostics.model.DiagnosticsModelBuilder
import com.leunos.ipinfo.diagnostics.model.LocationAccess
import com.leunos.ipinfo.diagnostics.model.LocationPermissionState
import com.leunos.ipinfo.diagnostics.model.NetworkSnapshot
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.stateIn

/** Holds the live diagnostics model. Callbacks are registered only while the screen is collecting. */
@OptIn(ExperimentalCoroutinesApi::class)
class DiagnosticsViewModel(application: Application) : AndroidViewModel(application) {
    private val source = NetworkSnapshotSource(application)
    private val refreshTick = MutableStateFlow(0)
    private val access = MutableStateFlow(LocationAccess(LocationPermissionState.NOT_ASKED, locationServicesEnabled = false))

    // In-memory only and free of identifiers: transport, validated and metered flags per change.
    private val events = ArrayDeque<ConnectionEvent>()
    private val eventsFlow = MutableStateFlow<List<ConnectionEvent>>(emptyList())

    private val snapshot: StateFlow<NetworkSnapshot?> = refreshTick
        .flatMapLatest { source.snapshots() }
        .onEach(::record)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(STOP_TIMEOUT_MS), null)

    val model: StateFlow<DiagnosticsModel?> = combine(snapshot, access, eventsFlow) { snap, acc, history ->
        if (snap == null) null else DiagnosticsModelBuilder.build(snap, acc, Build.VERSION.SDK_INT, history)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(STOP_TIMEOUT_MS), null)

    val locationAccess: StateFlow<LocationAccess> get() = access

    fun updateAccess(value: LocationAccess) {
        access.value = value
    }

    /** Re-registers the callbacks, which immediately delivers the current state again. */
    fun refresh() {
        refreshTick.value++
    }

    private fun record(snapshot: NetworkSnapshot) {
        val default = snapshot.defaultNetwork
        val event = ConnectionEvent(
            timeMillis = snapshot.capturedAtMillis,
            transports = default?.transports?.sortedBy { it.ordinal }.orEmpty(),
            validated = default?.capabilities?.validated ?: false,
            metered = default?.capabilities?.metered ?: false,
            connected = default != null,
        )
        val last = events.lastOrNull()
        if (last == null || last.copy(timeMillis = 0) != event.copy(timeMillis = 0)) {
            events.addLast(event)
            while (events.size > MAX_EVENTS) events.removeFirst()
            eventsFlow.value = events.toList()
        }
    }

    private companion object {
        const val STOP_TIMEOUT_MS = 5_000L
        const val MAX_EVENTS = 10
    }
}
