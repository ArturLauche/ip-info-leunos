// AGP 9.5.1 still brings vulnerable build-time libraries. Keep these constraints
// on the plugin classpath only; remove them as AGP adopts the patched releases.
buildscript {
    dependencies {
        constraints {
            add("classpath", "com.google.guava:guava:33.8.0-jre") {
                because("GHSA-xxph-c9ww-hj94: unbounded allocation during deserialization")
            }
            add("classpath", "org.apache.commons:commons-lang3:3.21.0") {
                because("GHSA-j288-q9x7-2f5v: uncontrolled recursion")
            }
            listOf("bcprov-jdk18on", "bcpkix-jdk18on", "bcutil-jdk18on").forEach { module ->
                add("classpath", "org.bouncycastle:$module:1.86") {
                    because("Fix certificate name constraints, ASN.1 depth checks and PKIX advisories; keep Bouncy Castle modules aligned")
                }
            }
            add("classpath", "org.bitbucket.b_c:jose4j:0.9.7") {
                because("GHSA-3677-xxcr-wjqv: compressed JWE denial of service")
            }
            add("classpath", "org.jdom:jdom2:2.0.6.1") {
                because("GHSA-2363-cqg2-863c: XML external entity injection")
            }
        }
    }
}

// AGP 9 compiles Kotlin itself ("built-in Kotlin"), so the module never applies
// org.jetbrains.kotlin.android. Declaring the plugin here (apply false) only puts
// the pinned Kotlin Gradle Plugin on the build classpath, which AGP then uses.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.pin) apply false
}
