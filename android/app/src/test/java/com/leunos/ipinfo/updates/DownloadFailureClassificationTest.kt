package com.leunos.ipinfo.updates

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class DownloadFailureClassificationTest {

    @Test
    fun timeoutsThrottlingAndServerErrorsAreRetryable() {
        for (status in listOf(403, 408, 429, 500, 502, 503, 504, 599)) {
            val classified = classifyDownloadStatus(status)
            assertEquals("HTTP $status", UpdateFailure.DOWNLOAD_SERVER, classified.failure)
            assertTrue("HTTP $status", classified.retryable)
        }
    }

    @Test
    fun aMissingFileAndOtherRefusalsAreNotRetried() {
        assertEquals(DownloadFailureClass(UpdateFailure.DOWNLOAD_NOT_FOUND, retryable = false), classifyDownloadStatus(404))
        for (status in listOf(400, 401, 405, 410, 416, 451)) {
            val classified = classifyDownloadStatus(status)
            assertEquals("HTTP $status", UpdateFailure.DOWNLOAD_REJECTED, classified.failure)
            assertFalse("HTTP $status", classified.retryable)
        }
    }

    @Test
    fun theWorkersRetryDecisionAndTheStateMachinesTransienceAlwaysAgree() {
        // A download the worker gives up on must not be silently started again by every later update check.
        for (status in 100..599) {
            val classified = classifyDownloadStatus(status)
            assertEquals("HTTP $status", classified.retryable, classified.failure.isTransient)
        }
    }
}
