import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  APPLICATION_ID,
  apkName,
  checksumName,
  compareVersions,
  downloadUrl,
  extractChangelogSection,
  isSha256Hex,
  normalizeSha256,
  parseTag,
  parseVersion,
  readSigningIdentity,
  readVersionProperties,
  releaseTitle,
  releaseUrl,
  sha256Hex,
  tagFor,
  validateUpdateMetadata,
  versionCode,
} from "./contract.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

test("semantic versions map deterministically into Android version codes", () => {
  assert.equal(versionCode("0.0.1"), 1);
  assert.equal(versionCode("1.0.0"), 1_000_000);
  assert.equal(versionCode("2099.999.999"), 2_099_999_999);
  assert.deepEqual(parseVersion("1.2.3"), { major: 1, minor: 2, patch: 3, versionName: "1.2.3", versionCode: 1_002_003 });
  assert.equal(compareVersions("1.2.9", "1.3.0"), -1);
  assert.equal(compareVersions("1.3.0", "1.3.0"), 0);
  assert.equal(compareVersions("2.0.0", "1.999.999"), 1);
});

test("semantic version and tag parsers reject out-of-range and noncanonical values", () => {
  for (const version of ["2100.0.0", "1.1000.0", "1.0.1000", "01.0.0", "1.00.0", "1.0.00", "1.0.0-rc.1", "v1.0.0", "1.0"]) {
    assert.throws(() => parseVersion(version), /Invalid Android version|outside the supported range/);
  }
  assert.throws(() => parseVersion("0.0.0"), /versionCode range/);
  assert.throws(() => parseTag("android-v1.0.0-rc.1"), /Invalid Android version/);
  assert.deepEqual(parseTag("android-v1.0.0").versionCode, 1_000_000);
});

test("release names, links, digest helpers, and changelog extraction follow the public contract", () => {
  assert.equal(tagFor("1.0.0"), "android-v1.0.0");
  assert.equal(apkName("1.0.0"), "ip-info-android-v1.0.0.apk");
  assert.equal(checksumName("1.0.0"), "ip-info-android-v1.0.0.apk.sha256");
  assert.equal(releaseTitle("1.0.0"), "IP Info for Android 1.0.0");
  assert.equal(releaseUrl("1.0.0"), "https://github.com/ArturLauche/ip-info-leunos/releases/tag/android-v1.0.0");
  assert.equal(downloadUrl("1.0.0"), "https://github.com/ArturLauche/ip-info-leunos/releases/download/android-v1.0.0/ip-info-android-v1.0.0.apk");
  assert.equal(sha256Hex("abc"), createHash("sha256").update("abc").digest("hex"));
  assert.equal(isSha256Hex("a".repeat(64)), true);
  assert.equal(isSha256Hex("A".repeat(64)), false);
  assert.equal(normalizeSha256("AA:".repeat(31) + "AA"), "aa".repeat(32));
  const changelog = "# Android changes\n\n## [1.0.0] - 2026-10-13\nFirst line\n\nSecond paragraph\n\n## [0.9.0]\nOld notes\n";
  assert.equal(extractChangelogSection(changelog, "1.0.0"), "First line\n\nSecond paragraph");
  assert.equal(extractChangelogSection(changelog, "1.1.0"), null);
  assert.throws(() => extractChangelogSection("## [1.0.0]\n\n## [1.0.0]\nDuplicate", "1.0.0"), /more than one section/);
});

test("version properties and signing identity readers validate their inputs strictly", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ipinfo-contract-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const versionFile = path.join(directory, "version.properties");
  await writeFile(versionFile, "# comments\nversionName=1.2.3\n", "utf8");
  assert.equal((await readVersionProperties(versionFile)).versionCode, 1_002_003);
  await writeFile(versionFile, "versionName=1.2.3\nversionName=1.2.4\n", "utf8");
  await assert.rejects(readVersionProperties(versionFile), /Duplicate versionName/);

  const identityFile = path.join(directory, "identity.json");
  const identity = { schemaVersion: 1, applicationId: APPLICATION_ID, certificateSha256: [] };
  await writeFile(identityFile, `${JSON.stringify(identity)}\n`, "utf8");
  assert.deepEqual(await readSigningIdentity(identityFile), identity);
  await writeFile(identityFile, JSON.stringify({ ...identity, certificateSha256: ["A".repeat(64)] }), "utf8");
  await assert.rejects(readSigningIdentity(identityFile), /lowercase 64-character/);
  await writeFile(identityFile, JSON.stringify({ ...identity, unexpected: true }), "utf8");
  await assert.rejects(readSigningIdentity(identityFile), /exactly these fields/);
});

test("the updater contract fixture validates and keeps the publisher and Kotlin fixture byte-identical", async () => {
  const scriptsFixture = path.join(ROOT, "android/scripts/__fixtures__/android-update.valid.json");
  const androidFixture = path.join(ROOT, "android/contract/fixtures/android-update.valid.json");
  const [scriptsBytes, androidBytes] = await Promise.all([readFile(scriptsFixture), readFile(androidFixture)]);
  assert.deepEqual(scriptsBytes, androidBytes);
  const metadata = JSON.parse(scriptsBytes.toString("utf8"));
  validateUpdateMetadata(metadata, { tag: "android-v1.0.0" });
  assert.throws(() => validateUpdateMetadata({ ...metadata, versionCode: 1 }, { tag: "android-v1.0.0" }), /versionCode/);
});
