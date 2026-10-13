package com.leunos.ipinfo.updates

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ReleaseContractTest {
    private val v = AppVersion(1, 2, 3)

    @Test
    fun namesAndUrlsAreDerivedFromTheVersion() {
        assertEquals("android-v1.2.3", ReleaseContract.tagFor(v))
        assertEquals("ip-info-android-v1.2.3.apk", ReleaseContract.apkAssetName(v))
        assertEquals("ip-info-android-v1.2.3.apk.sha256", ReleaseContract.checksumAssetName(v))
        assertEquals("android-update.json", ReleaseContract.METADATA_ASSET_NAME)
        assertEquals("IP Info for Android 1.2.3", ReleaseContract.releaseTitle(v))
        assertEquals(
            "https://github.com/ArturLauche/ip-info-leunos/releases/download/android-v1.2.3/ip-info-android-v1.2.3.apk",
            ReleaseContract.apkDownloadUrl(v),
        )
        assertEquals(
            "https://github.com/ArturLauche/ip-info-leunos/releases/download/android-v1.2.3/android-update.json",
            ReleaseContract.metadataDownloadUrl(v),
        )
        assertEquals("https://github.com/ArturLauche/ip-info-leunos/releases/tag/android-v1.2.3", ReleaseContract.releasePageUrl(v))
    }

    @Test
    fun releasesApiTargetsTheRepositoryReleasesList() {
        assertEquals(
            "https://api.github.com/repos/ArturLauche/ip-info-leunos/releases?per_page=30",
            ReleaseContract.RELEASES_API_URL,
        )
    }

    @Test
    fun parsesOnlyAndroidStableTags() {
        assertEquals(v, ReleaseContract.parseTag("android-v1.2.3"))
        listOf(
            "v1.2.3", "web-v1.2.3", "android-1.2.3", "android-v1.2", "android-v1.2.3-rc1", "android-v1.2.3+meta",
            "ANDROID-V1.2.3", "android-v01.2.3", "android-v2100.0.0", "Android-v1.2.3", " android-v1.2.3", "", "android-v",
        ).forEach { assertNull("'$it' must not be an Android release tag", ReleaseContract.parseTag(it)) }
    }
}
