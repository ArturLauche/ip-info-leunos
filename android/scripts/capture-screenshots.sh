#!/usr/bin/env bash
# Best-effort screenshots of the main screens for reviewers. Builds and installs the debug app and its
# instrumentation APK itself and removes them afterwards, so it also works when the test steps that follow fail.
# A missing screenshot is reported but never fails the build.
set -uo pipefail

adb_bin=${ADB:-adb}
gradle=${GRADLE:-./gradlew}
out=${1:-./app/build/ui-screenshots}
apk=./app/build/outputs/apk/debug/app-debug.apk
test_apk=./app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
metadata=./app/build/outputs/apk/debug/output-metadata.json

warn() { echo "capture-screenshots: $*" >&2; }

"$gradle" assembleDebug assembleDebugAndroidTest --stacktrace || { warn "the build failed; no screenshots."; exit 0; }
pkg=$(sed -n 's/.*"applicationId": *"\([^"]*\)".*/\1/p' "$metadata" 2>/dev/null | head -n 1)
[[ -n "$pkg" ]] || { warn "cannot read the application ID from $metadata."; exit 0; }
# Test classes live under the namespace, which is the application ID without the debug suffix.
ns=${pkg%.debug}
if ! "$adb_bin" install -r -t "$apk" >/dev/null || ! "$adb_bin" install -r -t "$test_apk" >/dev/null; then
  warn "could not install the debug APKs."
  exit 0
fi

"$adb_bin" shell am instrument -w \
  -e class "$ns.screenshots.ScreenshotsInstrumentedTest" \
  -e captureScreenshots true \
  "$pkg.test/androidx.test.runner.AndroidJUnitRunner" || warn "the instrumentation run failed."

# The test runs inside the app's process and saves to its private files directory; debug builds allow run-as.
mkdir -p "$out"
count=0
for name in $("$adb_bin" shell run-as "$pkg" ls files/screenshots 2>/dev/null | tr -d '\r'); do
  case "$name" in
    *.png)
      if "$adb_bin" exec-out run-as "$pkg" cat "files/screenshots/$name" > "$out/$name"; then
        count=$((count + 1))
      else
        warn "could not read $name."
      fi
      ;;
  esac
done

# Leave a clean device so the following test steps start from their usual state.
"$adb_bin" uninstall "$pkg.test" >/dev/null 2>&1
"$adb_bin" uninstall "$pkg" >/dev/null 2>&1
echo "capture-screenshots: wrote $count screenshots to $out"
exit 0
