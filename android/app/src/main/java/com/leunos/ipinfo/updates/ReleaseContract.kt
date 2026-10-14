package com.leunos.ipinfo.updates

import com.leunos.ipinfo.BuildConfig

/**
 * The single, documented contract between the release pipeline (`.github/workflows/android-release.yml`,
 * `android/scripts/`) and the in-app updater. See docs/android-release.md.
 */
object ReleaseContract {
    const val REPO_OWNER = "ArturLauche"
    const val REPO_NAME = "ip-info-leunos"
    const val REPOSITORY_URL = "https://github.com/$REPO_OWNER/$REPO_NAME"
    const val RELEASES_PAGE_URL = "$REPOSITORY_URL/releases"
    const val RELEASES_API_URL = "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases?per_page=30"

    const val TAG_PREFIX = "android-v"
    const val METADATA_ASSET_NAME = "android-update.json"
    const val METADATA_SCHEMA_VERSION = 1

    /** Hard ceiling for any APK we are willing to download. The real APK is a few megabytes. */
    const val MAX_APK_BYTES = 100L * 1024 * 1024

    /** Stable application id; debug builds use a different id and are never updated. */
    val applicationId: String get() = BuildConfig.RELEASE_APPLICATION_ID

    private val TAG_REGEX = Regex("""^android-v(.+)$""")

    fun tagFor(version: AppVersion): String = "$TAG_PREFIX$version"

    /** Parses `android-vMAJOR.MINOR.PATCH`; anything else (website tags, pre-releases, ...) yields null. */
    fun parseTag(tag: String): AppVersion? =
        TAG_REGEX.matchEntire(tag)?.let { AppVersion.parseOrNull(it.groupValues[1]) }

    fun apkAssetName(version: AppVersion): String = "ip-info-android-v$version.apk"

    fun checksumAssetName(version: AppVersion): String = "${apkAssetName(version)}.sha256"

    private fun downloadBase(version: AppVersion): String =
        "$REPOSITORY_URL/releases/download/${tagFor(version)}"

    fun apkDownloadUrl(version: AppVersion): String = "${downloadBase(version)}/${apkAssetName(version)}"

    fun metadataDownloadUrl(version: AppVersion): String = "${downloadBase(version)}/$METADATA_ASSET_NAME"

    fun releasePageUrl(version: AppVersion): String = "$RELEASES_PAGE_URL/tag/${tagFor(version)}"

    fun releaseTitle(version: AppVersion): String = "IP Info for Android $version"
}
