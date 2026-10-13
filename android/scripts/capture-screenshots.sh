#!/usr/bin/env bash
# Best-effort screenshots of the main screens for reviewers. Run after emulator-upgrade-test.sh, which leaves the
# debug app and the instrumentation APK installed. A missing screenshot is reported but never fails the build.
set -uo pipefail

adb_bin=${ADB:-adb}
out=${1:-./app/build/ui-screenshots}
metadata=./app/build/outputs/apk/debug/output-metadata.json

warn() { echo "capture-screenshots: $*" >&2; }

pkg=$(sed -n 's/.*"applicationId": *"\([^"]*\)".*/\1/p' "$metadata" 2>/dev/null | head -n 1)
[[ -n "$pkg" ]] || { warn "cannot read the application ID from $metadata."; exit 0; }
# Test classes live under the namespace, which is the application ID without the debug suffix.
ns=${pkg%.debug}
remote="/sdcard/Android/media/$pkg/additional_test_output"

"$adb_bin" shell rm -rf "$remote"
"$adb_bin" shell am instrument -w \
  -e class "$ns.screenshots.ScreenshotsInstrumentedTest" \
  -e captureScreenshots true \
  -e additionalTestOutputDir "$remote" \
  "$pkg.test/androidx.test.runner.AndroidJUnitRunner" || warn "the instrumentation run failed."
mkdir -p "$out"
"$adb_bin" pull "$remote/." "$out" >/dev/null || warn "no screenshots to pull."
echo "capture-screenshots: wrote $(find "$out" -name '*.png' | wc -l | tr -d ' ') screenshots to $out"
exit 0
