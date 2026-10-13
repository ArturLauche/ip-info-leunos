import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { sha256Hex } from "./lib/contract.mjs";

const SCRIPT = fileURLToPath(new URL("./verify-apk.mjs", import.meta.url));
const ROOT = path.resolve(path.dirname(SCRIPT), "../..");
const SDK = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || "/opt/android-sdk";
const BUILD_TOOLS = process.env.ANDROID_BUILD_TOOLS || path.join(SDK, "build-tools/36.0.0");
const APK_SIGNER = path.join(BUILD_TOOLS, "apksigner");
const AAPT2 = path.join(BUILD_TOOLS, "aapt2");
const PLATFORM_JAR = path.join(SDK, "platforms/android-37.0/android.jar");
const DEBUG_APK = path.join(ROOT, "android/app/build/outputs/apk/debug/app-debug.apk");
const canRun = (command) => spawnSync(command, ["-help"], { stdio: "ignore" }).error === undefined;
const buildToolsSkipReason = !existsSync(APK_SIGNER) || !existsSync(AAPT2)
  ? "Android build-tools are not installed."
  : !existsSync(DEBUG_APK)
    ? "The real debug APK fixture is not present."
    : !canRun("keytool")
      ? "keytool is not installed."
      : null;
const signedFixtureSkipReason = buildToolsSkipReason ?? (!existsSync(PLATFORM_JAR) ? "Android platform android-37.0 is not installed." : null);

function cli(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: "utf8" });
}

test("APK verification rejects the real debug APK for its signer and debug package", { skip: buildToolsSkipReason ?? false }, async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ipinfo-verify-apk-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const result = cli([
    "--apk", DEBUG_APK,
    "--version", "1.0.0-debug",
    "--app-id", "com.leunos.ipinfo",
    "--expected-cert-sha256", "0".repeat(64),
    "--build-tools-dir", BUILD_TOOLS,
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Android Debug certificate/);
  assert.match(result.stderr, /Signer certificate SHA-256 .* not in the expected signing identity/);
  assert.match(result.stderr, /applicationId is 'com.leunos.ipinfo\.debug', expected 'com.leunos.ipinfo'/);
  assert.match(result.stderr, /APK is marked debuggable/);
});

test("APK verification accepts a non-debuggable APK signed by a generated throwaway identity", { skip: signedFixtureSkipReason ?? false }, async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ipinfo-verify-apk-signed-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const password = "test-only-keystore-password";
  const keystore = path.join(directory, "test.p12");
  execFileSync("keytool", [
    "-genkeypair", "-noprompt", "-storetype", "PKCS12", "-keystore", keystore,
    "-storepass", password, "-keypass", password, "-alias", "test", "-keyalg", "RSA",
    "-keysize", "2048", "-sigalg", "SHA256withRSA", "-validity", "2",
    "-dname", "CN=Test APK Signer, O=IP Info Tests",
  ], { stdio: "ignore" });

  const manifest = path.join(directory, "AndroidManifest.xml");
  await writeFile(manifest, `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.leunos.ipinfo.debug" android:versionCode="1000000" android:versionName="1.0.0-debug">
  <uses-sdk android:minSdkVersion="29" android:targetSdkVersion="37" />
  <application android:label="IP Info Test" />
</manifest>
`, "utf8");
  const unsignedApk = path.join(directory, "fixture-unsigned.apk");
  execFileSync(AAPT2, [
    "link", "--manifest", manifest, "-I", PLATFORM_JAR,
    "--min-sdk-version", "29", "--target-sdk-version", "37", "-o", unsignedApk,
  ], { stdio: "pipe" });
  const apk = path.join(directory, "fixture-signed.apk");
  execFileSync(APK_SIGNER, [
    "sign", "--ks", keystore, "--ks-key-alias", "test", "--ks-pass", `pass:${password}`,
    "--key-pass", `pass:${password}`, "--out", apk, unsignedApk,
  ], { stdio: "pipe" });
  const certificate = path.join(directory, "certificate.der");
  execFileSync("keytool", [
    "-exportcert", "-storetype", "PKCS12", "-keystore", keystore,
    "-storepass", password, "-alias", "test", "-file", certificate,
  ], { stdio: "ignore" });
  const fingerprint = sha256Hex(await readFile(certificate));
  const args = [
    "--apk", apk,
    "--version", "1.0.0-debug",
    "--app-id", "com.leunos.ipinfo.debug",
    "--expected-cert-sha256", fingerprint,
    "--build-tools-dir", BUILD_TOOLS,
  ];

  const accepted = cli(args);
  assert.equal(accepted.status, 0, accepted.stderr);
  const facts = JSON.parse(accepted.stdout);
  assert.equal(facts.applicationId, "com.leunos.ipinfo.debug");
  assert.equal(facts.versionCode, 1_000_000);
  assert.equal(facts.minSdk, 29);
  assert.equal(facts.targetSdk, 37);
  assert.equal(facts.certificateSha256, fingerprint);
  assert.ok(facts.signatureSchemes.v2 || facts.signatureSchemes.v3);

  const wrongFingerprint = cli(args.map((value, index) => index > 0 && args[index - 1] === "--expected-cert-sha256" ? "f".repeat(64) : value));
  assert.notEqual(wrongFingerprint.status, 0);
  assert.match(wrongFingerprint.stderr, /not in the expected signing identity/);

  const wrongVersion = cli(args.map((value, index) => index > 0 && args[index - 1] === "--version" ? "1.0.1-debug" : value));
  assert.notEqual(wrongVersion.status, 0);
  assert.match(wrongVersion.stderr, /versionName is '1.0.0-debug'/);
  assert.match(wrongVersion.stderr, /versionCode is 1000000/);

  const emptyIdentity = path.join(directory, "empty-identity.json");
  await writeFile(emptyIdentity, JSON.stringify({ schemaVersion: 1, applicationId: "com.leunos.ipinfo", certificateSha256: [] }), "utf8");
  const unpinned = cli(["--apk", apk, "--version", "1.0.0-debug", "--identity", emptyIdentity, "--build-tools-dir", BUILD_TOOLS]);
  assert.notEqual(unpinned.status, 0);
  assert.match(unpinned.stderr, /no pinned certificates.*owner records the production fingerprint/i);

  if (canRun("zip")) {
    const unsigned = path.join(directory, "unsigned.apk");
    await writeFile(unsigned, await readFile(apk));
    execFileSync("zip", ["-q", "-d", unsigned, "META-INF/*"]);
    const rejectedUnsigned = cli(args.map((value, index) => index > 0 && args[index - 1] === "--apk" ? unsigned : value));
    assert.notEqual(rejectedUnsigned.status, 0);
    assert.match(rejectedUnsigned.stderr, /APK signature verification failed/);
  }
});
