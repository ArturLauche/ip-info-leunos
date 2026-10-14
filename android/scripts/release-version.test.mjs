import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const SCRIPT = fileURLToPath(new URL("./release-version.mjs", import.meta.url));
const ROOT = path.resolve(path.dirname(SCRIPT), "../..");

async function setup(t, version = "1.2.3") {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ipinfo-release-version-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const versionFile = path.join(directory, "version.properties");
  const changelog = path.join(directory, "CHANGELOG.md");
  const releasesFile = path.join(directory, "releases.json");
  await writeFile(versionFile, `versionName=${version}\n`, "utf8");
  await writeFile(changelog, `# Changes\n\n## [${version}] - 2026-10-13\nUseful release notes.\n`, "utf8");
  await writeFile(releasesFile, "[]\n", "utf8");
  return { directory, versionFile, changelog, releasesFile };
}

function run(args, env = {}) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: "utf8", env: { ...process.env, ...env } });
}

function baseArgs(files, tag = "android-v1.2.3") {
  return ["--tag", tag, "--version-file", files.versionFile, "--changelog", files.changelog, "--releases-json", files.releasesFile];
}

test("release-version emits consistent machine outputs and honors GITHUB_OUTPUT", async (t) => {
  const files = await setup(t);
  const outputFile = path.join(files.directory, "github-output.txt");
  const result = run([...baseArgs(files), "--github-output"], { GITHUB_OUTPUT: outputFile });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    version: "1.2.3",
    version_code: "1002003",
    tag: "android-v1.2.3",
    apk_name: "ip-info-android-v1.2.3.apk",
    checksum_name: "ip-info-android-v1.2.3.apk.sha256",
    release_title: "IP Info for Android 1.2.3",
  });
  assert.equal(await readFile(outputFile, "utf8"), [
    "version=1.2.3",
    "version_code=1002003",
    "tag=android-v1.2.3",
    "apk_name=ip-info-android-v1.2.3.apk",
    "checksum_name=ip-info-android-v1.2.3.apk.sha256",
    "release_title=IP Info for Android 1.2.3",
    "",
  ].join("\n"));
});

test("release-version ignores drafts and non-stable prereleases while requiring a strictly newer published version", async (t) => {
  const files = await setup(t);
  const releases = [
    { tagName: "android-v1.2.2", isDraft: false, isPrerelease: false },
    { tagName: "android-v9.0.0-rc.1", isDraft: false, isPrerelease: true },
    { tagName: "android-v2.0.0", isDraft: true, isPrerelease: false },
    { tagName: "website-v99.0.0", isDraft: false, isPrerelease: false },
  ];
  await writeFile(files.releasesFile, JSON.stringify(releases), "utf8");
  assert.equal(run(baseArgs(files)).status, 0);

  await writeFile(files.releasesFile, JSON.stringify([{ tagName: "android-v1.2.3", isDraft: false, isPrerelease: false }]), "utf8");
  const same = run(baseArgs(files));
  assert.notEqual(same.status, 0);
  assert.match(same.stderr, /published release already exists/);

  await writeFile(files.releasesFile, JSON.stringify([{ tagName: "android-v1.2.4", isDraft: false, isPrerelease: false }]), "utf8");
  const older = run(baseArgs(files));
  assert.notEqual(older.status, 0);
  assert.match(older.stderr, /must be newer/);

  await writeFile(files.releasesFile, JSON.stringify([{ tagName: "android-v1.2.4", isDraft: false, isPrerelease: true }]), "utf8");
  const blockedByPrerelease = run(baseArgs(files));
  assert.notEqual(blockedByPrerelease.status, 0);
  assert.match(blockedByPrerelease.stderr, /must be newer/);
});

test("release-version rejects mismatched tags, malformed stable releases, and missing notes", async (t) => {
  const files = await setup(t);
  const mismatch = run(baseArgs(files, "android-v1.2.4"));
  assert.notEqual(mismatch.status, 0);
  assert.match(mismatch.stderr, /does not match android\/version.properties/);

  await writeFile(files.releasesFile, JSON.stringify([{ tagName: "android-v1.2.x", isDraft: false, isPrerelease: false }]), "utf8");
  const malformed = run(baseArgs(files));
  assert.notEqual(malformed.status, 0);
  assert.match(malformed.stderr, /Invalid Android version/);

  await writeFile(files.releasesFile, "[]", "utf8");
  await writeFile(files.changelog, "## [0.1.0]\nnot these notes\n", "utf8");
  const noNotes = run(baseArgs(files));
  assert.notEqual(noNotes.status, 0);
  assert.match(noNotes.stderr, /section for 1.2.3 is missing or empty/);
});

test("release-version rejects invalid tags and missing GitHub output configuration", async (t) => {
  const files = await setup(t);
  const invalid = run(baseArgs(files, "android-v01.2.3"));
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /Invalid Android version/);
  const output = run([...baseArgs(files), "--github-output"], { GITHUB_OUTPUT: "" });
  assert.notEqual(output.status, 0);
  assert.match(output.stderr, /requires the GITHUB_OUTPUT/);
});
