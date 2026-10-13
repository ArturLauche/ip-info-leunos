#!/usr/bin/env bash
# Best-effort screenshots of the main screens from the connected emulator or device, for reviewers.
# Builds and installs the debug app itself. A missing screenshot is reported but never fails the build,
# so it cannot mask test results.
set -uo pipefail

adb_bin=${ADB:-adb}
gradle=${GRADLE:-./gradlew}
out=${1:-./app/build/ui-screenshots}
apk=./app/build/outputs/apk/debug/app-debug.apk
metadata=./app/build/outputs/apk/debug/output-metadata.json

warn() { echo "capture-screenshots: $*" >&2; }

"$gradle" assembleDebug --stacktrace || { warn "debug build failed; no screenshots."; exit 0; }
pkg=$(sed -n 's/.*"applicationId": *"\([^"]*\)".*/\1/p' "$metadata" 2>/dev/null | head -n 1)
[[ -n "$pkg" ]] || { warn "cannot read the application ID from $metadata."; exit 0; }
# Activities live under the namespace, which is the application ID without the debug suffix.
ns=${pkg%.debug}
"$adb_bin" install -r -t "$apk" >/dev/null || { warn "could not install the debug APK."; exit 0; }
mkdir -p "$out"

shot() {
  "$adb_bin" exec-out screencap -p > "$out/$1.png" 2>/dev/null || warn "could not capture $1."
}

open_screen() {
  "$adb_bin" shell am start -W -n "$pkg/$ns.$1" >/dev/null 2>&1 || warn "could not start $1."
  sleep "$2"
}

capture_set() {
  local theme=$1
  "$adb_bin" shell cmd uimode night "$theme" >/dev/null 2>&1 || warn "could not switch the night mode to $theme."
  sleep 2
  local suffix=light
  [[ "$theme" == yes ]] && suffix=dark
  "$adb_bin" shell am force-stop "$pkg"
  open_screen MainActivity 20
  shot "main-$suffix"
  open_screen diagnostics.NetworkDiagnosticsActivity 8
  shot "diagnostics-$suffix"
  open_screen settings.SettingsActivity 5
  shot "settings-$suffix"
  open_screen settings.AboutActivity 5
  shot "about-$suffix"
}

capture_set no
capture_set yes
"$adb_bin" shell cmd uimode night no >/dev/null 2>&1
echo "capture-screenshots: wrote $(find "$out" -name '*.png' | wc -l | tr -d ' ') screenshots to $out"
exit 0
