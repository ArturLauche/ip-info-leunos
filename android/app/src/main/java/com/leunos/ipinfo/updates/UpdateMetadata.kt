package com.leunos.ipinfo.updates

import com.leunos.ipinfo.util.Hex
import org.json.JSONException
import org.json.JSONObject
import java.time.Instant

/** Machine readable description of one Android release (`android-update.json`). */
data class UpdateMetadata(
    val applicationId: String,
    val tag: String,
    val version: AppVersion,
    val versionCode: Int,
    val minSdk: Int,
    val publishedAt: String,
    val releaseNotesUrl: String,
    val apkFileName: String,
    val apkDownloadUrl: String,
    val apkSizeBytes: Long,
    val apkSha256: String,
    val signingCertSha256: String,
) {
    val versionName: String get() = version.toString()
}

class MetadataException(message: String) : Exception(message)

/**
 * Strict parser for `android-update.json`. Types are checked exactly (no string-to-number coercion),
 * unknown keys are ignored for forward compatibility, and every field is validated for shape.
 * Authenticity is NOT established here: the APK signature is verified separately.
 */
object UpdateMetadataParser {
    const val MAX_BYTES = 64 * 1024

    private val APPLICATION_ID = Regex("""^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$""")
    private val TIMESTAMP = Regex("""^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$""")
    private val FILE_NAME = Regex("""^[A-Za-z0-9._-]{1,128}$""")

    fun parse(text: String): UpdateMetadata {
        if (text.length > MAX_BYTES) throw MetadataException("metadata is larger than $MAX_BYTES bytes")
        val root = try {
            JSONObject(text)
        } catch (e: JSONException) {
            throw MetadataException("metadata is not valid JSON")
        }
        val top = Fields(root, "")

        val schema = top.int("schemaVersion")
        if (schema != ReleaseContract.METADATA_SCHEMA_VERSION) throw MetadataException("unsupported schemaVersion $schema")

        val applicationId = top.string("applicationId")
        if (!APPLICATION_ID.matches(applicationId) || applicationId.length > 255) {
            throw MetadataException("applicationId is not a valid Android application id")
        }

        val tag = top.string("tag")
        val version = ReleaseContract.parseTag(tag) ?: throw MetadataException("tag '$tag' is not android-vMAJOR.MINOR.PATCH")

        val versionName = top.string("versionName")
        if (versionName != version.toString()) throw MetadataException("versionName does not match tag")

        val versionCode = top.int("versionCode")
        if (versionCode != version.versionCode) throw MetadataException("versionCode does not match version")

        val minSdk = top.int("minSdk")
        if (minSdk !in 1..200) throw MetadataException("minSdk is out of range")

        val publishedAt = top.string("publishedAt")
        if (!TIMESTAMP.matches(publishedAt) || runCatching { Instant.parse(publishedAt) }.isFailure) {
            throw MetadataException("publishedAt must be a UTC timestamp like 2026-01-31T12:00:00Z")
        }

        val releaseNotesUrl = top.string("releaseNotesUrl")
        if (!releaseNotesUrl.startsWith("https://")) throw MetadataException("releaseNotesUrl must be https")

        val apk = top.obj("apk")
        val apkFileName = apk.string("fileName")
        if (!FILE_NAME.matches(apkFileName)) throw MetadataException("apk.fileName is not a plain file name")
        val apkDownloadUrl = apk.string("downloadUrl")
        if (!apkDownloadUrl.startsWith("https://")) throw MetadataException("apk.downloadUrl must be https")
        val size = apk.long("sizeBytes")
        if (size !in 1..ReleaseContract.MAX_APK_BYTES) throw MetadataException("apk.sizeBytes is out of range")
        val sha = apk.string("sha256")
        if (!Hex.isSha256(sha)) throw MetadataException("apk.sha256 must be 64 lowercase hex characters")

        val cert = top.obj("signing").string("certificateSha256")
        if (!Hex.isSha256(cert)) throw MetadataException("signing.certificateSha256 must be 64 lowercase hex characters")

        return UpdateMetadata(
            applicationId = applicationId,
            tag = tag,
            version = version,
            versionCode = versionCode,
            minSdk = minSdk,
            publishedAt = publishedAt,
            releaseNotesUrl = releaseNotesUrl,
            apkFileName = apkFileName,
            apkDownloadUrl = apkDownloadUrl,
            apkSizeBytes = size,
            apkSha256 = sha,
            signingCertSha256 = cert,
        )
    }
}

/** Exact-typed field access over [JSONObject] (org.json coerces types by default, which we do not want). */
internal class Fields(private val json: JSONObject, private val path: String) {
    fun string(key: String): String = json.opt(key) as? String ?: fail(key, "a string")

    fun optionalString(key: String): String? {
        val value = json.opt(key)
        return when {
            value == null || value === JSONObject.NULL -> null
            value is String -> value
            else -> fail(key, "a string or null")
        }
    }

    fun boolean(key: String): Boolean = json.opt(key) as? Boolean ?: fail(key, "a boolean")

    fun long(key: String): Long {
        val value = json.opt(key)
        return when {
            value is Int -> value.toLong()
            value is Long -> value
            else -> fail(key, "an integer")
        }
    }

    fun int(key: String): Int {
        val value = long(key)
        if (value < Int.MIN_VALUE || value > Int.MAX_VALUE) fail(key, "a 32-bit integer")
        return value.toInt()
    }

    fun obj(key: String): Fields {
        val child = json.opt(key) as? JSONObject ?: fail(key, "an object")
        return Fields(child, "$path$key.")
    }

    private fun fail(key: String, expected: String): Nothing = throw MetadataException("$path$key must be $expected")
}
