// AGP 9 compiles Kotlin itself ("built-in Kotlin"), so the module never applies
// org.jetbrains.kotlin.android. Declaring the plugin here (apply false) only puts
// the pinned Kotlin Gradle Plugin on the build classpath, which AGP then uses.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.pin) apply false
}
