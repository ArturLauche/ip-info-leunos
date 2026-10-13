package com.leunos.ipinfo.updates

/**
 * Stable Android release version (MAJOR.MINOR.PATCH, no pre-release or build metadata).
 *
 * The Android `versionCode` is derived deterministically and monotonically:
 * `MAJOR * 1_000_000 + MINOR * 1_000 + PATCH`. With MAJOR <= 2099 and MINOR/PATCH <= 999 the
 * largest code is 2_099_999_999, below Android's 2_100_000_000 ceiling.
 */
data class AppVersion(val major: Int, val minor: Int, val patch: Int) : Comparable<AppVersion> {
    init {
        require(major in 0..MAX_MAJOR) { "major $major is outside 0..$MAX_MAJOR" }
        require(minor in 0..MAX_MINOR_OR_PATCH) { "minor $minor is outside 0..$MAX_MINOR_OR_PATCH" }
        require(patch in 0..MAX_MINOR_OR_PATCH) { "patch $patch is outside 0..$MAX_MINOR_OR_PATCH" }
        require(versionCode >= 1) { "0.0.0 has no valid versionCode" }
    }

    val versionCode: Int get() = major * 1_000_000 + minor * 1_000 + patch

    override fun compareTo(other: AppVersion): Int = versionCode.compareTo(other.versionCode)

    override fun toString(): String = "$major.$minor.$patch"

    companion object {
        const val MAX_MAJOR = 2099
        const val MAX_MINOR_OR_PATCH = 999

        private val STRICT = Regex("""^(0|[1-9][0-9]{0,3})\.(0|[1-9][0-9]{0,2})\.(0|[1-9][0-9]{0,2})$""")

        /** Strict parser: no leading zeros, no sign, no pre-release or build suffix. */
        fun parseOrNull(text: String): AppVersion? {
            val match = STRICT.matchEntire(text) ?: return null
            val (major, minor, patch) = match.destructured.toList().map { it.toInt() }
            if (major > MAX_MAJOR) return null
            if (major * 1_000_000L + minor * 1_000L + patch < 1L) return null
            return AppVersion(major, minor, patch)
        }

        /** Inverse of [versionCode]; null when [code] is not a code this scheme produces. */
        fun fromVersionCode(code: Long): AppVersion? {
            if (code < 1 || code > 2_099_999_999L) return null
            return AppVersion((code / 1_000_000).toInt(), ((code / 1_000) % 1_000).toInt(), (code % 1_000).toInt())
        }
    }
}
