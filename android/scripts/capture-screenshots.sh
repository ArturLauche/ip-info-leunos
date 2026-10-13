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
echo "capture-screenshots: wrote $count screenshots to $out"
exit 0
