# Android app

The Android app lives in `android/` (Kotlin, one `:app` module, minSdk 29, targetSdk 37). It wraps the deployed Next.js
site in a hardened WebView and adds two native features the website cannot offer: on-device network diagnostics and an
updater for the APK published on GitHub Releases. The web application, its API and its security controls are unchanged;
the app never replaces them.

Release process, signing identity and the update contract: [android-release.md](android-release.md).

## Build and test

Requirements: JDK 17, Android SDK platform `android-37.0` and build-tools `36.0.0`, Node.js 20 (release scripts only).
Point Gradle at the SDK with `ANDROID_HOME` or an untracked `android/local.properties` (`sdk.dir=...`).

```bash
cd android
./gradlew testDebugUnitTest lintDebug assembleDebug   # what CI runs on every pull request
./gradlew assembleDebugAndroidTest                    # compile the instrumentation tests
./gradlew connectedDebugAndroidTest                   # needs an emulator or device
cd .. && node --test android/scripts/*.test.mjs android/scripts/lib/*.test.mjs   # release tooling
```

| Variant | Application ID | Updater | Signed with |
| --- | --- | --- | --- |
| `debug` | stable ID + `.debug` | disabled | the local debug key |
| `release` | stable ID (`BuildConfig.RELEASE_APPLICATION_ID`) | enabled | the owner's release key, from CI only |

The two variants have different IDs and keys, so a debug build never replaces or updates a release install.
`android/version.properties` is the single source of the version; `versionCode = MAJOR*1000000 + MINOR*1000 + PATCH`.
A release build without signing credentials stays unsigned; there is no fallback to the debug key.

Every user-visible string is a resource in English (`values`) and German (`values-de`); the app follows the system
language and the light/dark setting.

## Layout

| Package (`android/app/src/main/java/com/leunos/ipinfo/`) | Responsibility |
| --- | --- |
| `web` | WebView configuration, navigation policy (`TrustedOrigin`), error handling, theme sampling |
| `diagnostics` | Connectivity snapshot source, platform mapping, language-neutral model, presenter, screen |
| `updates` | Release contract, GitHub client, metadata parser, checker, downloader, verifier, installer, scheduling |
| `settings` | Preferences, settings and about screens |
| `navigation`, `util` | Native screen navigation and small shared helpers |

Pure logic (policy decisions, models, parsers, state machine, verification) is separated from Android APIs so it runs in
plain JVM unit tests; instrumentation tests cover the integration points that need a device.

## Website shell

- **Trusted origin.** Only `https://ip-info.leunos.com` (exact host, default port, no credentials in the URL) loads in the
  WebView. Plain-HTTP links to that host are upgraded to HTTPS. Every other `http(s)` link and `mailto:` is handed to the
  system; any other scheme (`intent:`, `javascript:`, `file:` ...) is blocked. Checks run on every navigation, including
  server redirects.
- **WebView hardening.** JavaScript and DOM storage are on because the site needs them. There is no JavaScript bridge, no
  file or content access, no geolocation, no popup windows and no mixed content; third-party cookies are off and Safe
  Browsing is on. TLS errors cancel the load and show an error screen; they are never bypassed.
- **Transport.** Cleartext traffic is disabled for the whole app and only system certificate authorities are trusted.
- **Links into the app.** The manifest declares `https://ip-info.leunos.com` view links, which Android leaves to the user
  to enable under "Open by default" (they are not verified because that needs a Digital Asset Links file on the site).
  The activity validates every incoming URL again.
- **Failures.** Offline, DNS, TLS and gateway errors show a native retry screen and offer Network Diagnostics, which does
  not depend on the website.

## Network Diagnostics

The screen reads Android's connectivity APIs and shows the active connection, local IPv4/IPv6 addresses with scope
labels, gateway and routes, DNS servers and Private DNS state, link details (MTU, proxy, NAT64, bandwidth estimates),
other networks and, on Wi-Fi, signal, speeds, band, channel, standard and security. A "changes while open" list records
network changes during the session.

- **Privacy.** Everything is read and shown on the device. Nothing is sent to the backend, GitHub or any analytics.
  Local addresses are labelled as local so they are not confused with the public address the website reports.
- **Wi-Fi name (SSID/BSSID).** Android reveals them only to apps holding precise location while the system location
  setting is on. The app asks for the permission only when the user taps the action on the diagnostics screen, explains
  why first, handles approximate-only, "don't ask again" and location-off states, and never scans for nearby networks.
  Every other field works without any permission.
- **VPN.** Android does not always report the underlying network of a VPN; the screen says so instead of guessing.

## Updates

1. **Check.** Launch (at most every 6 hours) and a periodic WorkManager job (about every 24 hours) list the repository's
   releases and keep only `android-vMAJOR.MINOR.PATCH` stable releases that are not drafts. Each candidate must have an
   `android-update.json` asset that matches the contract in [android-release.md](android-release.md).
2. **Download.** Automatic downloads (on by default) wait for an unmetered network unless the user opts in to metered
   data. A manual download is always possible and the UI says it may use mobile data. Downloads go to app-private storage
   with a size cap, over HTTPS, to the expected GitHub URLs only.
3. **Verify.** Before installing, the APK must match the published size and SHA-256 and be readable by Android's package
   parser; its package, `versionCode`, `versionName` and `minSdk` must match the metadata; it must be newer than the
   installed version; it must have exactly one signer that equals the metadata and, once the owner has recorded the
   release identity, one of the pinned certificates; and it must be signed compatibly with the installed app. The
   checksum only proves integrity; authenticity comes from the signature.
4. **Install.** The verified bytes are streamed into a `PackageInstaller` session and re-hashed on the way. Android
   decides whether to ask for confirmation. The user must allow "Install unknown apps" for this app once. Silent updates
   are never promised: on Android 12+ the app only requests that no confirmation be needed, which the system grants
   under its own conditions.

Updates apply to the native app. Website changes ship by deploying the site and need no app update.

## Permissions and data

| Permission | Why | When it is requested |
| --- | --- | --- |
| `INTERNET` | Website, GitHub update checks | Install time |
| `ACCESS_NETWORK_STATE` | Connection facts and the metered-network check | Install time |
| `ACCESS_WIFI_STATE` | Wi-Fi link details | Install time |
| `ACCESS_FINE_LOCATION` (+ `COARSE`) | Wi-Fi name and access point only | From the diagnostics screen, on user action |
| `POST_NOTIFICATIONS` | "Update available" notice | When the user enables notifications (Android 13+) |
| `REQUEST_INSTALL_PACKAGES` | Hand the verified APK to `PackageInstaller` | User enables "Install unknown apps" |
| `UPDATE_PACKAGES_WITHOUT_USER_ACTION` | Let Android 12+ skip the install prompt when it permits | Install time |

The app does not request background location, nearby-device or contacts permissions and includes no analytics or
advertising SDK. Settings and update state stay in app-private storage and are excluded from backup and device transfer.
The only network peers are `ip-info.leunos.com` (WebView) and `api.github.com` / `github.com` (updates).

## Known limits

- The website is compiled for Chrome 111 or newer (the Next.js default), so it needs a current Android System WebView.
  Devices whose WebView was never updated cannot run its JavaScript; the stock API 29 emulator image ships WebView 74
  and shows exactly that. Instrumentation tests therefore check navigation and native behaviour, not page content.
- Instrumentation tests need an emulator or device; CI runs them on API 29 and API 36 emulators and none run in a plain JVM.
  The app targets API 37, which CI covers by compiling and linting only: the API 37.0 emulator image restarts its runtime
  during first boot and races the emulator runner's unlock step, so it is not part of the matrix yet.
- Installing an update normally needs one tap of confirmation from the user.
- The Wi-Fi name stays unavailable if the user declines precise location or turns location services off.
- Release publishing stays disabled until the owner generates the signing key and records its certificate fingerprint
  (see [android-release.md](android-release.md)).
