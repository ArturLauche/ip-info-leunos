import groovy.json.JsonSlurper
import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
}

// ---------------------------------------------------------------------------
// Versioning: android/version.properties is the single source of truth.
// versionCode = MAJOR * 1_000_000 + MINOR * 1_000 + PATCH (see docs/android-release.md).
// ---------------------------------------------------------------------------
val versionProps = Properties().apply {
    load(providers.fileContents(layout.projectDirectory.file("../version.properties")).asText.get().reader())
}
val appVersionName: String = versionProps.getProperty("versionName")?.trim()
    ?: error("versionName is missing from android/version.properties")
val versionMatch = Regex("""^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$""").matchEntire(appVersionName)
    ?: error("versionName '$appVersionName' must be MAJOR.MINOR.PATCH without leading zeros")
val (vMajor, vMinor, vPatch) = versionMatch.destructured.toList().map { it.toLong() }
check(vMajor in 0..2099 && vMinor in 0..999 && vPatch in 0..999) {
    "version $appVersionName is outside the supported range (MAJOR 0..2099, MINOR/PATCH 0..999)"
}
val appVersionCode: Int = (vMajor * 1_000_000 + vMinor * 1_000 + vPatch).also {
    check(it in 1..2_099_999_999L) { "computed versionCode $it is outside Android's supported range" }
}.toInt()

// ---------------------------------------------------------------------------
// Expected production signing identity (public certificate fingerprints only).
// Empty until the owner records it; see docs/android-release.md.
// ---------------------------------------------------------------------------
val identityText = providers.fileContents(layout.projectDirectory.file("../release/signing-identity.json")).asText.get()

@Suppress("UNCHECKED_CAST")
val identity = JsonSlurper().parseText(identityText) as Map<String, Any?>
val recordedFingerprints: List<String> =
    (identity["certificateSha256"] as? List<*>).orEmpty().map { value -> value.toString().lowercase() }
// A dry-run (CI) build may pin an ephemeral certificate instead.
val pinnedFingerprints: List<String> = providers.gradleProperty("ipinfo.pinnedCertificates")
    .map { raw -> raw.split(',').map { it.trim().lowercase() }.filter { it.isNotEmpty() } }
    .getOrElse(recordedFingerprints)
pinnedFingerprints.forEach {
    check(Regex("^[0-9a-f]{64}$").matches(it)) { "Invalid certificate SHA-256 fingerprint in signing identity: '$it'" }
}

// Stable production application ID. It must never change once a release is published.
val releaseApplicationId = "com.leunos.ipinfo"
check(identity["applicationId"] == releaseApplicationId) {
    "android/release/signing-identity.json applicationId must equal '$releaseApplicationId'"
}

android {
    namespace = "com.leunos.ipinfo"
    compileSdk = 37
    buildToolsVersion = "36.0.0"

    defaultConfig {
        applicationId = releaseApplicationId
        minSdk = 29
        targetSdk = 37
        versionCode = appVersionCode
        versionName = appVersionName
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        buildConfigField("String", "RELEASE_APPLICATION_ID", "\"$releaseApplicationId\"")
        // Static shortcuts must name the installed package, which differs for debug builds.
        resValue("string", "shortcut_package", releaseApplicationId)
        buildConfigField("String", "PINNED_SIGNING_CERT_SHA256", "\"${pinnedFingerprints.joinToString(",")}\"")
    }

    val releaseKeystorePath = providers.environmentVariable("ANDROID_KEYSTORE_PATH")
    signingConfigs {
        create("release") {
            // Credentials only ever come from the environment of the trusted release job.
            if (releaseKeystorePath.isPresent) {
                storeFile = file(releaseKeystorePath.get())
                storePassword = providers.environmentVariable("ANDROID_KEYSTORE_PASSWORD").get()
                keyAlias = providers.environmentVariable("ANDROID_KEY_ALIAS").get()
                keyPassword = providers.environmentVariable("ANDROID_KEY_PASSWORD").get()
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            resValue("string", "shortcut_package", "$releaseApplicationId.debug")
            // Debug builds never self-update: they carry a different package id and signing key.
            buildConfigField("boolean", "UPDATER_ENABLED", "false")
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            buildConfigField("boolean", "UPDATER_ENABLED", "true")
            // Never fall back to the debug key: without credentials the APK stays unsigned
            // and the release pipeline rejects it.
            signingConfig = if (releaseKeystorePath.isPresent) signingConfigs.getByName("release") else null
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
        resValues = true
    }

    dependenciesInfo {
        includeInApk = false
        includeInBundle = false
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }

    lint {
        abortOnError = true
        warningsAsErrors = false
        checkReleaseBuilds = true
        lintConfig = file("lint.xml")
    }

    testOptions {
        unitTests {
            isReturnDefaultValues = true
        }
    }

    // Fixtures shared by JVM unit tests and instrumentation tests.
    sourceSets {
        getByName("test").kotlin.srcDir("src/sharedTest/java")
        getByName("androidTest").kotlin.srcDir("src/sharedTest/java")
    }
}

// Debug-only version override used by the emulator upgrade test (old build -> newer build).
// Release variants ignore it so a published version can only come from version.properties.
val debugVersionOverride: String? = providers.gradleProperty("ipinfo.debugVersionOverride").orNull
androidComponents {
    onVariants(selector().withBuildType("debug")) { variant ->
        if (debugVersionOverride != null) {
            val match = Regex("""^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$""").matchEntire(debugVersionOverride)
                ?: error("ipinfo.debugVersionOverride must be MAJOR.MINOR.PATCH")
            val (major, minor, patch) = match.destructured.toList().map { it.toLong() }
            variant.outputs.forEach { output ->
                output.versionCode.set((major * 1_000_000 + minor * 1_000 + patch).toInt())
                output.versionName.set("$debugVersionOverride-debug")
            }
        }
    }
}

tasks.withType<Test>().configureEach {
    // Lets the CI release dry run feed a freshly generated android-update.json to the contract test.
    providers.gradleProperty("ipinfo.contract.metadata").orNull?.let { systemProperty("ipinfo.contract.metadata", it) }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.activity.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.splashscreen)
    implementation(libs.androidx.webkit)
    implementation(libs.androidx.work.runtime.ktx)
    implementation(libs.androidx.recyclerview)
    implementation(libs.material)
    implementation(libs.kotlinx.coroutines.android)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.org.json)

    androidTestImplementation(libs.androidx.test.core)
    androidTestImplementation(libs.androidx.test.runner)
    androidTestImplementation(libs.androidx.test.rules)
    androidTestImplementation(libs.androidx.test.ext.junit)
    androidTestImplementation(libs.androidx.test.espresso.core)
    androidTestImplementation(libs.androidx.test.uiautomator)
    androidTestImplementation(libs.androidx.work.testing)
    androidTestImplementation(libs.kotlinx.coroutines.test)
}
