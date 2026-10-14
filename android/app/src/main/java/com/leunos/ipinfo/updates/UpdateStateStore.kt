package com.leunos.ipinfo.updates

import android.content.SharedPreferences
import androidx.core.content.edit
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Persists [UpdateState] in app-private preferences so update progress survives process death and
 * restarts. Writes are synchronous (`commit`) because the process may be killed while a self-update
 * installs. Only release metadata is stored: no diagnostics and no identifiers.
 */
class UpdateStateStore(private val prefs: SharedPreferences) {
    private val flow = MutableStateFlow(read())

    val state: StateFlow<UpdateState> = flow.asStateFlow()
    val current: UpdateState get() = flow.value

    @Synchronized
    fun update(transform: (UpdateState) -> UpdateState): UpdateState {
        val next = transform(flow.value)
        if (next != flow.value) {
            write(next)
            flow.value = next
        }
        return next
    }

    /** Version code for which the "update available" notification was already shown. */
    var notifiedAvailableVersionCode: Long
        get() = prefs.getLong(KEY_NOTIFIED_AVAILABLE, 0)
        set(value) = prefs.edit(commit = true) { putLong(KEY_NOTIFIED_AVAILABLE, value) }

    var notifiedReadyVersionCode: Long
        get() = prefs.getLong(KEY_NOTIFIED_READY, 0)
        set(value) = prefs.edit(commit = true) { putLong(KEY_NOTIFIED_READY, value) }

    private fun read(): UpdateState {
        val candidate = prefs.getString(KEY_CANDIDATE_JSON, null)?.let { raw ->
            runCatching {
                UpdateCandidate(
                    metadata = UpdateMetadataParser.parse(raw),
                    rawMetadata = raw,
                    releaseNotes = prefs.getString(KEY_NOTES, null),
                    releaseUrl = prefs.getString(KEY_RELEASE_URL, null).orEmpty(),
                    publishedAt = prefs.getString(KEY_PUBLISHED, null),
                )
            }.getOrNull()
        }
        val phase = runCatching { UpdatePhase.valueOf(prefs.getString(KEY_PHASE, null).orEmpty()) }.getOrDefault(UpdatePhase.IDLE)
        return UpdateState(
            phase = if (candidate == null) UpdatePhase.IDLE else phase,
            candidate = candidate,
            failure = enumOrNull<UpdateFailure>(prefs.getString(KEY_FAILURE, null)),
            failureDetail = prefs.getString(KEY_FAILURE_DETAIL, null),
            lastCheckSuccessAt = prefs.getLong(KEY_LAST_SUCCESS, 0).takeIf { it > 0 },
            lastCheckAttemptAt = prefs.getLong(KEY_LAST_ATTEMPT, 0).takeIf { it > 0 },
            lastCheckError = enumOrNull<CheckError>(prefs.getString(KEY_CHECK_ERROR, null)),
            rateLimitedUntil = prefs.getLong(KEY_RATE_LIMITED_UNTIL, 0),
            installSessionId = prefs.getInt(KEY_SESSION, UpdateState.NO_SESSION),
            unsupportedVersion = prefs.getString(KEY_UNSUPPORTED, null),
        )
    }

    private fun write(state: UpdateState) {
        prefs.edit(commit = true) {
            putString(KEY_PHASE, state.phase.name)
            putString(KEY_CANDIDATE_JSON, state.candidate?.rawMetadata)
            putString(KEY_NOTES, state.candidate?.releaseNotes)
            putString(KEY_RELEASE_URL, state.candidate?.releaseUrl)
            putString(KEY_PUBLISHED, state.candidate?.publishedAt)
            putString(KEY_FAILURE, state.failure?.name)
            putString(KEY_FAILURE_DETAIL, state.failureDetail)
            putLong(KEY_LAST_SUCCESS, state.lastCheckSuccessAt ?: 0)
            putLong(KEY_LAST_ATTEMPT, state.lastCheckAttemptAt ?: 0)
            putString(KEY_CHECK_ERROR, state.lastCheckError?.name)
            putLong(KEY_RATE_LIMITED_UNTIL, state.rateLimitedUntil)
            putInt(KEY_SESSION, state.installSessionId)
            putString(KEY_UNSUPPORTED, state.unsupportedVersion)
        }
    }

    private inline fun <reified E : Enum<E>> enumOrNull(name: String?): E? =
        name?.let { runCatching { enumValueOf<E>(it) }.getOrNull() }

    companion object {
        const val FILE_NAME = "update_state"
        private const val KEY_PHASE = "phase"
        private const val KEY_CANDIDATE_JSON = "candidate_json"
        private const val KEY_NOTES = "candidate_notes"
        private const val KEY_RELEASE_URL = "candidate_release_url"
        private const val KEY_PUBLISHED = "candidate_published_at"
        private const val KEY_FAILURE = "failure"
        private const val KEY_FAILURE_DETAIL = "failure_detail"
        private const val KEY_LAST_SUCCESS = "last_check_success"
        private const val KEY_LAST_ATTEMPT = "last_check_attempt"
        private const val KEY_CHECK_ERROR = "last_check_error"
        private const val KEY_RATE_LIMITED_UNTIL = "rate_limited_until"
        private const val KEY_SESSION = "install_session"
        private const val KEY_UNSUPPORTED = "unsupported_version"
        private const val KEY_NOTIFIED_AVAILABLE = "notified_available"
        private const val KEY_NOTIFIED_READY = "notified_ready"
    }
}
