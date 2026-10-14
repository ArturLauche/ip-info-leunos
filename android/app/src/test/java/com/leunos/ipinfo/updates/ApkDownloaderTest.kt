package com.leunos.ipinfo.updates

import com.sun.net.httpserver.HttpServer
import com.leunos.ipinfo.updates.http.UrlConnectionTransport
import com.leunos.ipinfo.updates.http.UrlPolicy
import com.leunos.ipinfo.util.Sha256
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File
import java.net.InetSocketAddress
import java.util.concurrent.atomic.AtomicInteger

/** Downloads against a real local HTTP server (no mocks), exercising resume, corruption and failures. */
class ApkDownloaderTest {
    @get:Rule
    val temp = TemporaryFolder()

    private val payload = ByteArray(300_000) { (it * 31 + 7).toByte() }
    private lateinit var server: HttpServer
    private lateinit var storageDir: File

    // Server behaviour knobs
    @Volatile private var etag: String? = "\"v1\""
    @Volatile private var honorRange = true
    @Volatile private var cutAfterBytes: Int? = null
    @Volatile private var status: Int? = null
    @Volatile private var body: ByteArray = payload
    private val requestRanges = mutableListOf<String?>()
    private val requestIfRanges = mutableListOf<String?>()
    private val requests = AtomicInteger()

    @Before
    fun start() {
        storageDir = temp.newFolder("updates")
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/apk") { exchange ->
            requests.incrementAndGet()
            val range = exchange.requestHeaders.getFirst("Range")
            val ifRange = exchange.requestHeaders.getFirst("If-Range")
            synchronized(requestRanges) {
                requestRanges += range
                requestIfRanges += ifRange
            }
            status?.let {
                exchange.sendResponseHeaders(it, -1)
                exchange.close()
                return@createContext
            }
            etag?.let { exchange.responseHeaders.add("ETag", it) }
            val data = body
            val match = Regex("""bytes=(\d+)-""").matchEntire(range.orEmpty())
            val rangeValid = honorRange && match != null && (ifRange == null || ifRange == etag)
            if (rangeValid) {
                val start = match.groupValues[1].toInt()
                if (start >= data.size) {
                    exchange.sendResponseHeaders(416, -1)
                    exchange.close()
                    return@createContext
                }
                exchange.responseHeaders.add("Content-Range", "bytes $start-${data.size - 1}/${data.size}")
                exchange.sendResponseHeaders(206, (data.size - start).toLong())
                exchange.responseBody.use { out -> writeMaybeCut(out, data, start) }
            } else {
                exchange.sendResponseHeaders(200, data.size.toLong())
                exchange.responseBody.use { out -> writeMaybeCut(out, data, 0) }
            }
        }
        server.start()
    }

    private fun writeMaybeCut(out: java.io.OutputStream, data: ByteArray, start: Int) {
        val cut = cutAfterBytes
        if (cut == null) {
            out.write(data, start, data.size - start)
        } else {
            out.write(data, start, minOf(cut, data.size - start))
            out.flush()
            throw java.io.IOException("simulated connection drop")
        }
    }

    @After
    fun stop() = server.stop(0)

    private fun candidate(sha: String = Sha256.hex(payload), size: Long = payload.size.toLong()): UpdateCandidate {
        val base = UpdateMetadataParser.parse(Fixtures.metadataJson("1.1.0", size = size, sha = sha))
        val local = base.copy(apkDownloadUrl = "http://127.0.0.1:${server.address.port}/apk")
        return UpdateCandidate(local, Fixtures.json(Fixtures.metadataMap("1.1.0", size, sha)), null, "", null)
    }

    private fun downloader(freeBytes: Long = Long.MAX_VALUE / 4): Pair<ApkDownloader, UpdateStorage> {
        val storage = UpdateStorage(storageDir) { freeBytes }
        val transport = UrlConnectionTransport(UrlPolicy.loopbackForTests(), "test-agent")
        return ApkDownloader(transport, storage) to storage
    }

    private fun run(
        downloader: ApkDownloader,
        candidate: UpdateCandidate,
        cancelAfterBytes: Long = Long.MAX_VALUE,
    ): Pair<DownloadResult, List<Long>> {
        val progress = mutableListOf<Long>()
        val result = downloader.download(
            candidate,
            isCancelled = { progress.lastOrNull()?.let { it >= cancelAfterBytes } ?: false },
            onProgress = { done, _ -> progress += done },
        )
        return result to progress
    }

    @Test
    fun downloadsVerifiesAndStoresTheApk() {
        val (downloader, storage) = downloader()
        val (result, progress) = run(downloader, candidate())
        val file = (result as DownloadResult.Completed).file
        assertEquals(storage.apkFile(AppVersion(1, 1, 0)), file)
        assertEquals(payload.size.toLong(), file.length())
        assertEquals(Sha256.hex(payload), Sha256.hex(file))
        assertEquals(payload.size.toLong(), progress.last())
        assertFalse(storage.partFile(AppVersion(1, 1, 0)).exists())
        assertFalse(storage.resumeInfoFile(AppVersion(1, 1, 0)).exists())
    }

    @Test
    fun anAlreadyVerifiedFileIsNotDownloadedAgain() {
        val (downloader, _) = downloader()
        run(downloader, candidate())
        val before = requests.get()
        val (second, _) = run(downloader, candidate())
        assertTrue(second is DownloadResult.Completed)
        assertEquals(before, requests.get())
    }

    @Test
    fun interruptedDownloadResumesWithValidatedRangeRequest() {
        val (downloader, storage) = downloader()
        cutAfterBytes = 100_000
        val (interrupted, _) = run(downloader, candidate())
        assertTrue("got $interrupted", interrupted is DownloadResult.Interrupted)
        val part = storage.partFile(AppVersion(1, 1, 0))
        assertEquals(100_000L, part.length())

        cutAfterBytes = null
        val (resumed, _) = run(downloader, candidate())
        assertTrue("got $resumed", resumed is DownloadResult.Completed)
        assertEquals("bytes=100000-", requestRanges.last())
        assertEquals("\"v1\"", requestIfRanges.last())
        assertEquals(Sha256.hex(payload), Sha256.hex((resumed as DownloadResult.Completed).file))
    }

    @Test
    fun resumeIsRefusedWhenTheServerContentChanged() {
        val (downloader, storage) = downloader()
        cutAfterBytes = 100_000
        run(downloader, candidate())
        assertEquals(100_000L, storage.partFile(AppVersion(1, 1, 0)).length())

        // The object behind the URL changed: new ETag, so If-Range fails and the server sends everything.
        cutAfterBytes = null
        etag = "\"v2\""
        val (result, _) = run(downloader, candidate())
        assertTrue("got $result", result is DownloadResult.Completed)
        assertEquals("\"v1\"", requestIfRanges.last())
    }

    @Test
    fun restartsFromScratchWhenTheServerIgnoresRanges() {
        val (downloader, _) = downloader()
        cutAfterBytes = 50_000
        run(downloader, candidate())
        cutAfterBytes = null
        honorRange = false
        val (result, _) = run(downloader, candidate())
        assertTrue("got $result", result is DownloadResult.Completed)
        assertEquals(Sha256.hex(payload), Sha256.hex((result as DownloadResult.Completed).file))
    }

    @Test
    fun partialFilesWithoutAStrongValidatorAreNotResumed() {
        val (downloader, storage) = downloader()
        etag = null
        cutAfterBytes = 40_000
        run(downloader, candidate())
        assertEquals(40_000L, storage.partFile(AppVersion(1, 1, 0)).length())

        cutAfterBytes = null
        run(downloader, candidate())
        assertEquals("no Range header without a validator", null, requestRanges.last())
    }

    @Test
    fun weakEtagsAreNeverUsedForResume() {
        val (downloader, _) = downloader()
        etag = "W/\"weak\""
        cutAfterBytes = 40_000
        run(downloader, candidate())
        cutAfterBytes = null
        val (result, _) = run(downloader, candidate())
        assertTrue(result is DownloadResult.Completed)
        assertEquals(null, requestRanges.last())
    }

    @Test
    fun checksumMismatchDiscardsEverything() {
        val (downloader, storage) = downloader()
        val (result, _) = run(downloader, candidate(sha = "e".repeat(64)))
        assertTrue(result is DownloadResult.ChecksumMismatch)
        assertFalse(storage.apkFile(AppVersion(1, 1, 0)).exists())
        assertFalse(storage.partFile(AppVersion(1, 1, 0)).exists())
    }

    @Test
    fun serverSendingMoreThanDeclaredIsRejected() {
        val (downloader, storage) = downloader()
        body = payload + ByteArray(1000)
        val (result, _) = run(downloader, candidate())
        assertTrue("got $result", result is DownloadResult.UnexpectedContent)
        assertFalse(storage.partFile(AppVersion(1, 1, 0)).exists())
    }

    @Test
    fun serverSendingLessThanDeclaredIsAnInterruption() {
        val (downloader, storage) = downloader()
        body = payload.copyOf(payload.size - 500)
        val (result, _) = run(downloader, candidate())
        assertTrue("got $result", result is DownloadResult.UnexpectedContent || result is DownloadResult.Interrupted)
        assertFalse(storage.apkFile(AppVersion(1, 1, 0)).exists())
    }

    @Test
    fun notEnoughStorageStopsBeforeAnyNetworkTraffic() {
        val (downloader, _) = downloader(freeBytes = 1_000)
        val (result, _) = run(downloader, candidate())
        assertTrue(result is DownloadResult.InsufficientStorage)
        assertEquals(0, requests.get())
    }

    @Test
    fun httpErrorsAreReported() {
        val (downloader, _) = downloader()
        status = 404
        assertEquals(DownloadResult.HttpError(404), run(downloader, candidate()).first)
        status = 503
        assertEquals(DownloadResult.HttpError(503), run(downloader, candidate()).first)
    }

    @Test
    fun cancellationKeepsThePartialFileForResume() {
        val (downloader, storage) = downloader()
        val (result, _) = run(downloader, candidate(), cancelAfterBytes = 1)
        assertEquals(DownloadResult.Cancelled, result)
        assertTrue(storage.partFile(AppVersion(1, 1, 0)).exists())
    }

    @Test
    fun staleOrForeignPartialFilesAreDiscarded() {
        val (downloader, storage) = downloader()
        val version = AppVersion(1, 1, 0)
        storage.partFile(version).writeBytes(ByteArray(10) { 1 })
        storage.resumeInfoFile(version).writeText("""{"tag":"android-v1.1.0","sizeBytes":1,"sha256":"${"f".repeat(64)}","etag":"\"v1\""}""")
        val (result, _) = run(downloader, candidate())
        assertTrue(result is DownloadResult.Completed)
        assertEquals(null, requestRanges.last())
    }

    @Test
    fun cleanupRemovesObsoleteVersionsAndOrphans() {
        val storage = UpdateStorage(storageDir)
        storage.apkFile(AppVersion(1, 0, 5)).writeText("old")
        storage.partFile(AppVersion(1, 0, 6)).writeText("part")
        storage.apkFile(AppVersion(1, 1, 0)).writeText("keep")
        storage.cleanupExcept(AppVersion(1, 1, 0))
        assertEquals(listOf("ip-info-android-v1.1.0.apk"), storageDir.list()!!.sorted())
        storage.deleteAll()
        assertEquals(0, storageDir.list()!!.size)
    }
}
