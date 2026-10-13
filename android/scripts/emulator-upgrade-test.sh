#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "emulator-upgrade-test: $*" >&2
  exit 1
}

[[ -f ./gradlew && -d ./app ]] || fail "run this script from the android/ project root."
command -v adb >/dev/null || fail "adb is required and must be on PATH."
"${ADB:-adb}" get-state >/dev/null 2>&1 || fail "no ready Android emulator/device is connected."

gradle=${GRADLE:-./gradlew}
adb_bin=${ADB:-adb}
build_tools_dir=${ANDROID_BUILD_TOOLS:-${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}/build-tools/36.0.0}
aapt2="$build_tools_dir/aapt2"
[[ -x "$aapt2" ]] || fail "aapt2 not found at '$aapt2'; set ANDROID_BUILD_TOOLS."
version_name=$(sed -n 's/^versionName=//p' ./version.properties | tr -d '\r')
[[ "$version_name" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]] || fail "versionName in version.properties must be MAJOR.MINOR.PATCH."
major=${BASH_REMATCH[1]} minor=${BASH_REMATCH[2]} patch=${BASH_REMATCH[3]}
baseline_code=$((major * 1000000 + minor * 1000 + patch))
upgrade_patch=$((patch + 1))
upgrade_version="$major.$minor.$upgrade_patch"
upgrade_code=$((major * 1000000 + minor * 1000 + upgrade_patch))

tmp_dir=$(mktemp -d "${TMPDIR:-/tmp}/ip-info-upgrade.XXXXXX")
trap 'rm -rf -- "$tmp_dir"' EXIT

echo "Building baseline debug app and instrumentation APK."
"$gradle" assembleDebug assembleDebugAndroidTest --stacktrace
app_v1="$tmp_dir/app-v1.apk"
test_apk="$tmp_dir/app-debug-androidTest.apk"
[[ -f ./app/build/outputs/apk/debug/app-debug.apk ]] || fail "baseline debug APK was not produced."
[[ -f ./app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk ]] || fail "debug instrumentation APK was not produced."
cp ./app/build/outputs/apk/debug/app-debug.apk "$app_v1"
cp ./app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk "$test_apk"

check_badging() {
  local apk=$1 expected_name=$2 expected_code=$3 badging
  badging=$("$aapt2" dump badging "$apk") || fail "aapt2 could not inspect $apk."
  grep -Fq "package: name='com.leunos.ipinfo.debug' versionCode='$expected_code' versionName='$expected_name'" <<<"$badging" || fail "unexpected package/version in $apk."
}
check_badging "$app_v1" "$version_name-debug" "$baseline_code"

echo "Installing baseline and instrumentation APKs."
"$adb_bin" install -r -t "$app_v1"
"$adb_bin" install -r -t "$test_apk"

run_instrumentation() {
  local class_name=$1 log_file=$2 expected_code=${3:-} output
  local args=(-w -e class "$class_name")
  if [[ -n "$expected_code" ]]; then args+=(-e expectedVersionCode "$expected_code"); fi
  if ! "$adb_bin" shell am instrument "${args[@]}" com.leunos.ipinfo.debug.test/androidx.test.runner.AndroidJUnitRunner >"$log_file" 2>&1; then
    cat "$log_file" >&2
    fail "instrumentation command failed for $class_name."
  fi
  cat "$log_file"
  output=$(tr -d '\r' <"$log_file")
  if grep -Eq '^(FAILURES!!!|INSTRUMENTATION_RESULT: shortMsg=|INSTRUMENTATION_STATUS: Error=|INSTRUMENTATION_STATUS_CODE: -[12]$)' <<<"$output"; then
    fail "instrumentation reported a test failure or crash for $class_name."
  fi
  grep -Eq '^OK \([1-9][0-9]* tests?\)$' <<<"$output" || fail "instrumentation did not report a passing run for $class_name."
}

echo "Seeding app settings before upgrade."
run_instrumentation com.leunos.ipinfo.upgrade.SeedSettingsInstrumentedTest "$tmp_dir/seed.log"
before=$("$adb_bin" shell dumpsys package com.leunos.ipinfo.debug)
first_install_before=$(sed -nE 's/^[[:space:]]*firstInstallTime=(.*)$/\1/p' <<<"$before" | head -n 1)
last_update_before=$(sed -nE 's/^[[:space:]]*lastUpdateTime=(.*)$/\1/p' <<<"$before" | head -n 1)
[[ -n "$first_install_before" && -n "$last_update_before" ]] || fail "could not read baseline install timestamps from dumpsys package."

echo "Building version $upgrade_version with the same debug signing key."
"$gradle" assembleDebug -Pipinfo.debugVersionOverride="$upgrade_version" --stacktrace
app_v2=./app/build/outputs/apk/debug/app-debug.apk
[[ -f "$app_v2" ]] || fail "version 1.0.1 debug APK was not produced."
check_badging "$app_v2" "$upgrade_version-debug" "$upgrade_code"

echo "Installing the higher version over the existing package."
"$adb_bin" install -r "$app_v2"
run_instrumentation com.leunos.ipinfo.upgrade.VerifySettingsInstrumentedTest "$tmp_dir/verify.log" "$upgrade_code"

after=$("$adb_bin" shell dumpsys package com.leunos.ipinfo.debug)
grep -Eq "versionCode=${upgrade_code}([[:space:]]|\$)" <<<"$after" || fail "installed package versionCode is not $upgrade_code."
first_install_after=$(sed -nE 's/^[[:space:]]*firstInstallTime=(.*)$/\1/p' <<<"$after" | head -n 1)
last_update_after=$(sed -nE 's/^[[:space:]]*lastUpdateTime=(.*)$/\1/p' <<<"$after" | head -n 1)
[[ -n "$first_install_after" && -n "$last_update_after" ]] || fail "could not read upgraded install timestamps from dumpsys package."
[[ "$first_install_after" == "$first_install_before" ]] || fail "firstInstallTime changed during update (app may have been reinstalled rather than upgraded)."
[[ "$last_update_after" != "$last_update_before" ]] || fail "lastUpdateTime did not change after installing the higher version."

echo "Upgrade test passed: versionCode=$upgrade_code, install identity preserved, and seeded settings survived."
