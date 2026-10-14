package com.leunos.ipinfo.updates

import com.leunos.ipinfo.updates.http.HttpRequest
import com.leunos.ipinfo.updates.http.HttpTransport
import com.leunos.ipinfo.util.Sha256
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

sealed interface DownloadResult {
    data class Completed(val file: File) : DownloadResult
    data class InsufficientStorage(val requiredBytes: Long, val availableBytes: Long) : DownloadResult

    /** Connection dropped or response ended early. The partial file is kept so the download can resume. */
    data class Interrupted(val bytesOnDisk: Long) : DownloadResult
    data class HttpError(val status: Int) : DownloadResult
    data class ChecksumMismatch(val actualSha256: String) : DownloadResult
    data class UnexpectedContent(val detail: String) : DownloadResult
    data object Cancelled : DownloadResult
}

/**
 * Downloads the APK of a validated [UpdateCandidate] into [UpdateStorage].
 *
 * Safety rules: the origin is the contract-derived GitHub URL (never a URL taken from untrusted input),
 * the stored size and SHA-256 must match the metadata exactly, and a partial file is only resumed when
 * it was started for the same release and the server proves the content is unchanged (strong ETag with
 * `If-Range` plus a matching `Content-Range`). Anything else restarts from byte zero.
 */
class ApkDownloader(
    private val transport: HttpTransport,
    private val storage: UpdateStorage,
) {
    fun download(
        candidate: UpdateCandidate,
        isCancelled: () -> Boolean,
        onProgress: (downloaded: Long, total: Long) -> Unit,
    ): DownloadResult {
        val metadata = candidate.metadata
        val expected = metadata.apkSizeBytes
        val finalFile = storage.apkFile(metadata.version)

        if (finalFile.isFile) {
            if (finalFile.length() == expected && Sha256.hex(finalFile) == metadata.apkSha256) {
                onProgress(expected, expected)
                return DownloadResult.Completed(finalFile)
            }
            finalFile.delete()
        }

        val part = storage.partFile(metadata.version)
        var resumeFrom = reusablePartLength(metadata)

        val required = (expected - resumeFrom) + expected + SAFETY_MARGIN_BYTES
        val available = storage.freeBytes()
        if (available < required) return DownloadResult.InsufficientStorage(required, available)

        var restarted = false
        while (true) {
            if (resumeFrom == expected) break // a complete partial file only needs verification
            when (val attempt = fetchInto(candidate, resumeFrom, isCancelled, onProgress)) {
                Attempt.Done -> break
                Attempt.RestartFromScratch -> {
                    if (restarted) return DownloadResult.UnexpectedContent("server rejected a full download")
                    restarted = true
                    storage.deletePartial(metadata.version)
                    resumeFrom = 0
                }
                is Attempt.Finished -> return attempt.result
            }
        }

        val actual = Sha256.hex(part)
        if (part.length() != expected) {
            storage.deletePartial(metadata.version)
            return DownloadResult.UnexpectedContent("stored size ${part.length()} != $expected")
        }
        if (actual != metadata.apkSha256) {
            storage.deletePartial(metadata.version)
            return DownloadResult.ChecksumMismatch(actual)
        }
        if (!part.renameTo(finalFile)) {
            storage.deletePartial(metadata.version)
            return DownloadResult.UnexpectedContent("could not finalize the downloaded file")
        }
        storage.resumeInfoFile(metadata.version).delete()
        onProgress(expected, expected)
        return DownloadResult.Completed(finalFile)
    }

    private sealed interface Attempt {
        data object Done : Attempt
        data object RestartFromScratch : Attempt
        data class Finished(val result: DownloadResult) : Attempt
    }

    private fun fetchInto(
        candidate: UpdateCandidate,
        resumeFrom: Long,
        isCancelled: () -> Boolean,
        onProgress: (Long, Long) -> Unit,
    ): Attempt {
        val metadata = candidate.metadata
        val expected = metadata.apkSizeBytes
        val part = storage.partFile(metadata.version)

        val headers = linkedMapOf("Accept" to "application/octet-stream")
        if (resumeFrom > 0) {
            headers["Range"] = "bytes=$resumeFrom-"
            readResumeInfo(metadata)?.etag?.let { headers["If-Range"] = it }
        }

        val response = try {
            transport.execute(HttpRequest(metadata.apkDownloadUrl, headers))
        } catch (e: IOException) {
            return Attempt.Finished(DownloadResult.Interrupted(part.length().takeIf { part.exists() } ?: 0))
        }

        response.use { r ->
            val append: Boolean
            when (r.status) {
                200 -> {
                    val length = r.header("content-length")?.toLongOrNull()
                    if (length != null && length != expected) {
                        return Attempt.Finished(DownloadResult.UnexpectedContent("Content-Length $length != $expected"))
                    }
                    append = false
                }
                206 -> {
                    if (resumeFrom <= 0) return Attempt.Finished(DownloadResult.UnexpectedContent("unexpected partial response"))
                    val range = ContentRange.parse(r.header("content-range"))
                    if (range == null || range.start != resumeFrom || range.total != expected) return Attempt.RestartFromScratch
                    append = true
                }
                416 -> return Attempt.RestartFromScratch
                else -> return Attempt.Finished(DownloadResult.HttpError(r.status))
            }

            val etag = r.header("etag")?.takeIf { it.isNotBlank() && !it.startsWith("W/") }
            writeResumeInfo(metadata, etag)

            val input = r.body ?: return Attempt.Finished(DownloadResult.UnexpectedContent("empty response body"))
            var written = if (append) resumeFrom else 0L
            val buffer = ByteArray(BUFFER_BYTES)
            var lastReport = 0L
            FileOutputStream(part, append).use { out ->
                while (true) {
                    if (isCancelled()) {
                        out.flush()
                        return Attempt.Finished(DownloadResult.Cancelled)
                    }
                    val read = try {
                        input.read(buffer)
                    } catch (e: IOException) {
                        out.flush()
                        return Attempt.Finished(DownloadResult.Interrupted(written))
                    }
                    if (read < 0) break
                    if (written + read > expected) {
                        out.flush()
                        storage.deletePartial(metadata.version)
                        return Attempt.Finished(DownloadResult.UnexpectedContent("server sent more than $expected bytes"))
                    }
                    out.write(buffer, 0, read)
                    written += read
                    val now = System.nanoTime()
                    if (now - lastReport >= PROGRESS_INTERVAL_NANOS) {
                        lastReport = now
                        onProgress(written, expected)
                    }
                }
                out.flush()
                out.fd.sync()
            }
            if (written != expected) return Attempt.Finished(DownloadResult.Interrupted(written))
            return Attempt.Done
        }
    }

    /** Length of a partial file that may safely be resumed, or 0 after discarding unusable leftovers. */
    private fun reusablePartLength(metadata: UpdateMetadata): Long {
        val part = storage.partFile(metadata.version)
        if (!part.isFile) {
            storage.resumeInfoFile(metadata.version).delete()
            return 0
        }
        val info = readResumeInfo(metadata)
        val length = part.length()
        val usable = info != null && !info.etag.isNullOrBlank() && length in 1..metadata.apkSizeBytes
        if (!usable) {
            storage.deletePartial(metadata.version)
            return 0
        }
        return length
    }

    private class ResumeInfo(val etag: String?)

    private fun readResumeInfo(metadata: UpdateMetadata): ResumeInfo? = runCatching {
        val file = storage.resumeInfoFile(metadata.version)
        if (!file.isFile) return null
        val json = JSONObject(file.readText())
        val matches = json.optString("tag") == metadata.tag &&
            json.optLong("sizeBytes", -1) == metadata.apkSizeBytes &&
            json.optString("sha256") == metadata.apkSha256
        if (!matches) null else ResumeInfo(json.optString("etag").takeIf { it.isNotEmpty() })
    }.getOrNull()

    private fun writeResumeInfo(metadata: UpdateMetadata, etag: String?) {
        runCatching {
            storage.resumeInfoFile(metadata.version).writeText(
                JSONObject()
                    .put("tag", metadata.tag)
                    .put("sizeBytes", metadata.apkSizeBytes)
                    .put("sha256", metadata.apkSha256)
                    .put("etag", etag ?: "")
                    .toString(),
            )
        }
    }

    internal data class ContentRange(val start: Long, val end: Long, val total: Long) {
        companion object {
            private val PATTERN = Regex("""^bytes (\d+)-(\d+)/(\d+)$""")

            fun parse(header: String?): ContentRange? {
                val match = PATTERN.matchEntire(header?.trim().orEmpty()) ?: return null
                val (start, end, total) = match.destructured.toList().map { it.toLongOrNull() ?: return null }
                return if (start <= end && end < total) ContentRange(start, end, total) else null
            }
        }
    }

    private companion object {
        const val BUFFER_BYTES = 64 * 1024
        const val PROGRESS_INTERVAL_NANOS = 250_000_000L
        const val SAFETY_MARGIN_BYTES = 16L * 1024 * 1024
    }
}
