# Android changelog

Release notes for the IP Info Android app. The release workflow publishes the section that matches
`versionName` in `android/version.properties` as the GitHub Release notes
(see [docs/android-release.md](../docs/android-release.md)).

## [1.0.0]

First release.

- Opens the live IP Info website in an in-app browser. Only `ip-info.leunos.com` loads inside the app; links to other
  sites open in your browser or mail app, and certificate errors are never bypassed.
- Network Diagnostics works without the website: connection type, local addresses, gateway, DNS servers, link details
  and live changes while the screen is open. The Wi-Fi name and access point appear only if you allow precise location,
  which is requested from that screen alone. Nothing is uploaded; values stay on your device.
- App updates from GitHub Releases: automatic checks (on by default), downloads only on unmetered networks unless you
  allow otherwise, and a manual "download now" at any time. Every APK is checked for size, SHA-256, package name,
  version and signing certificate before Android is asked to install it. Android may still ask you to confirm the
  install.
- Settings for update behaviour, notifications and permissions; an About screen shows the version and the signing
  certificate fingerprint so you can compare it with the one published with each release.
- English and German, light and dark themes.
