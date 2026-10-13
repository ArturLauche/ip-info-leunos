import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { sha256Hex } from "./lib/contract.mjs";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const NOTES_SCRIPT = path.join(SCRIPTS, "extract-release-notes.mjs");
const IDENTITY_SCRIPT = path.join(SCRIPTS, "record-signing-identity.mjs");

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
}

test("release notes contain only the requested changelog section and verifiable footer", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ipinfo-release-notes-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const changelog = path.join(directory, "CHANGELOG.md");
  const output = path.join(directory, "release-notes.md");
  const facts = path.join(directory, "facts.json");
  const apkSha256 = "1".repeat(64);
  const certificateSha256 = "2".repeat(64);
  await writeFile(changelog, "## [1.0.0] - 2026-10-13\nRelease highlights.\n\n## [0.9.0]\nOld notes.\n", "utf8");
  await writeFile(facts, JSON.stringify({ apkSha256, certificateSha256 }), "utf8");
  const result = run(NOTES_SCRIPT, ["--version", "1.0.0", "--changelog", changelog, "--out", output, "--footer-json", facts]);
  assert.equal(result.status, 0, result.stderr);
  const notes = await readFile(output, "utf8");
  assert.match(notes, /^Release highlights\./);
  assert.doesNotMatch(notes, /Old notes/);
  assert.match(notes, /Install this APK once; later compatible native updates are delivered in the app/);
  assert.ok(notes.includes(`APK SHA-256: \`${apkSha256}\``));
  assert.ok(notes.includes(`Signing certificate SHA-256: \`${certificateSha256}\``));
  assert.match(notes, /docs\/android-release\.md/);
});

test("signing identity recording is idempotent and requires an explicit key rotation", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ipinfo-record-identity-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const identity = path.join(directory, "signing-identity.json");
  const empty = { schemaVersion: 1, applicationId: "com.leunos.ipinfo", certificateSha256: [] };
  await writeFile(identity, `${JSON.stringify(empty, null, 2)}\n`, "utf8");
  const first = "a".repeat(64);
  const second = "b".repeat(64);

  const added = run(IDENTITY_SCRIPT, ["--sha256", first, "--identity", identity]);
  assert.equal(added.status, 0, added.stderr);
  assert.deepEqual(JSON.parse(await readFile(identity, "utf8")).certificateSha256, [first]);
  assert.equal(run(IDENTITY_SCRIPT, ["--sha256", first, "--identity", identity]).status, 0);

  const refused = run(IDENTITY_SCRIPT, ["--sha256", second, "--identity", identity]);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /Use --rotate/);

  const rotated = run(IDENTITY_SCRIPT, ["--sha256", second, "--identity", identity, "--rotate"]);
  assert.equal(rotated.status, 0, rotated.stderr);
  assert.match(rotated.stderr, /valid Android signing-certificate lineage/);
  assert.deepEqual(JSON.parse(await readFile(identity, "utf8")).certificateSha256, [first, second]);
});

const KEYSTORE_SCRIPT = path.join(SCRIPTS, "generate-release-keystore.sh");
const keystoreToolsAvailable = ["bash", "git", "keytool", "openssl"].every(
  (tool) => spawnSync("sh", ["-c", `command -v ${tool}`], { stdio: "ignore" }).status === 0,
);

test("release keystore generation keeps credentials private and refuses unsafe targets", { skip: keystoreToolsAvailable ? false : "bash, git, keytool, and openssl are required" }, async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ipinfo-keystore-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const outDir = path.join(directory, "signing");
  const generate = (target) => spawnSync("bash", [KEYSTORE_SCRIPT, "--out-dir", target], { encoding: "utf8" });

  const created = generate(outDir);
  assert.equal(created.status, 0, created.stderr);
  const fingerprint = /Production signing certificate SHA-256: ([0-9a-f]{64})/.exec(created.stdout)?.[1];
  assert.ok(fingerprint, created.stdout);
  const password = (await readFile(path.join(outDir, "ANDROID_KEYSTORE_PASSWORD"), "utf8")).trim();
  assert.match(password, /^[0-9a-f]{64}$/);
  assert.ok(!created.stdout.includes(password) && !created.stderr.includes(password), "signing passwords must never be printed");
  assert.equal(await readFile(path.join(outDir, "ANDROID_KEY_ALIAS"), "utf8"), "ip-info-release");

  const keystore = path.join(outDir, "keystore.p12");
  const encoded = await readFile(path.join(outDir, "ANDROID_KEYSTORE_BASE64"), "utf8");
  assert.ok(Buffer.from(encoded, "base64").equals(await readFile(keystore)));
  const certificate = path.join(directory, "certificate.der");
  const exported = spawnSync("keytool", [
    "-exportcert", "-storetype", "PKCS12", "-keystore", keystore, "-storepass:env", "IPINFO_TEST_STOREPASS",
    "-alias", "ip-info-release", "-file", certificate,
  ], { encoding: "utf8", env: { ...process.env, IPINFO_TEST_STOREPASS: password } });
  assert.equal(exported.status, 0, exported.stderr);
  assert.equal(sha256Hex(await readFile(certificate)), fingerprint);

  if (process.platform !== "win32") {
    for (const name of ["keystore.p12", "ANDROID_KEYSTORE_BASE64", "ANDROID_KEYSTORE_PASSWORD", "ANDROID_KEY_ALIAS", "ANDROID_KEY_PASSWORD"]) {
      assert.equal((await stat(path.join(outDir, name))).mode & 0o777, 0o600, `${name} must be private`);
    }
  }

  const overwrite = generate(outDir);
  assert.notEqual(overwrite.status, 0);
  assert.match(overwrite.stderr, /Refusing to overwrite existing signing file/);

  const repository = path.join(directory, "repository");
  await mkdir(repository);
  assert.equal(spawnSync("git", ["init", "-q", repository]).status, 0);
  const inside = generate(path.join(repository, "signing"));
  assert.notEqual(inside.status, 0);
  assert.match(inside.stderr, /inside Git work tree/);
});
