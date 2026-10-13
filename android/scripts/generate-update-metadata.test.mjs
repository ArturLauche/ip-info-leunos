import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { sha256Hex, validateUpdateMetadata } from "./lib/contract.mjs";

const SCRIPT = fileURLToPath(new URL("./generate-update-metadata.mjs", import.meta.url));
const ROOT = path.resolve(path.dirname(SCRIPT), "../..");
const GOLDEN = path.join(ROOT, "android/scripts/__fixtures__/android-update.valid.json");

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ipinfo-metadata-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const apk = path.join(directory, "signed.apk");
  const bytes = Buffer.from("fixture-android-apk\n", "utf8");
  await writeFile(apk, bytes);
  const facts = path.join(directory, "facts.json");
  await writeFile(facts, `${JSON.stringify({
    applicationId: "com.leunos.ipinfo",
    versionName: "1.0.0",
    versionCode: 1_000_000,
    minSdk: 29,
    targetSdk: 37,
    certificateSha256: "a".repeat(64),
    apkSha256: sha256Hex(bytes),
    sizeBytes: bytes.length,
    signatureSchemes: { v1: false, v2: true, v3: false },
  }, null, 2)}\n`, "utf8");
  const outDir = path.join(directory, "release");
  return { directory, apk, facts, outDir, bytes };
}

function run(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: "utf8" });
}

function argsFor(files, extra = []) {
  return [
    "--apk", files.apk,
    "--facts", files.facts,
    "--tag", "android-v1.0.0",
    "--out-dir", files.outDir,
    "--published-at", "2026-10-13T12:00:00Z",
    "--repo", "ArturLauche/ip-info-leunos",
    ...extra,
  ];
}

test("generated metadata and APK checksum match the byte-for-byte release golden fixture", async (t) => {
  const files = await fixture(t);
  const result = run(argsFor(files));
  assert.equal(result.status, 0, result.stderr);
  const expected = await readFile(GOLDEN);
  const generated = await readFile(path.join(files.outDir, "android-update.json"));
  assert.deepEqual(generated, expected);
  const metadata = JSON.parse(generated.toString("utf8"));
  validateUpdateMetadata(metadata, { tag: "android-v1.0.0" });
  assert.deepEqual(await readFile(path.join(files.outDir, metadata.apk.fileName)), files.bytes);
  assert.equal(await readFile(path.join(files.outDir, `${metadata.apk.fileName}.sha256`), "utf8"), `${metadata.apk.sha256}  ${metadata.apk.fileName}\n`);
});

test("metadata generation is idempotent but never overwrites different release assets", async (t) => {
  const files = await fixture(t);
  assert.equal(run(argsFor(files)).status, 0);
  assert.equal(run(argsFor(files)).status, 0);
  await writeFile(path.join(files.outDir, "android-update.json"), "{}\n", "utf8");
  const result = run(argsFor(files));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Refusing to overwrite different release asset/);
});

test("metadata generation rejects mismatched facts, tags, repositories, and timestamps", async (t) => {
  const files = await fixture(t);
  const facts = JSON.parse(await readFile(files.facts, "utf8"));
  facts.versionCode += 1;
  await writeFile(files.facts, JSON.stringify(facts), "utf8");
  const mismatch = run(argsFor(files));
  assert.notEqual(mismatch.status, 0);
  assert.match(mismatch.stderr, /do not match the release tag/);

  facts.versionCode -= 1;
  await writeFile(files.facts, JSON.stringify(facts), "utf8");
  const badDateArgs = argsFor(files);
  badDateArgs[badDateArgs.indexOf("--published-at") + 1] = "2026-02-30T12:00:00Z";
  const badDate = run(badDateArgs);
  assert.notEqual(badDate.status, 0);
  assert.match(badDate.stderr, /valid UTC date-time/);
});
