#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { DEFAULT_REPOSITORY, extractChangelogSection, parseVersion, validateRepository } from "./lib/contract.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (!["--version", "--changelog", "--out", "--footer-json", "--repo"].includes(option)) {
      throw new Error(`Unknown option '${option}'.`);
    }
    if (values.has(option)) throw new Error(`Option '${option}' may only be supplied once.`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Option '${option}' requires a value.`);
    values.set(option, value);
    index += 1;
  }
  for (const required of ["--version", "--out"]) if (!values.has(required)) throw new Error(`Missing required option ${required}.`);
  return values;
}

async function main() {
  const values = parseArgs(process.argv.slice(2));
  const version = values.get("--version");
  parseVersion(version);
  const repository = validateRepository(values.get("--repo") ?? DEFAULT_REPOSITORY);
  const changelogPath = path.resolve(values.get("--changelog") ?? path.join(ROOT, "android/CHANGELOG.md"));
  const changelog = await readFile(changelogPath, "utf8");
  const notes = extractChangelogSection(changelog, version);
  if (!notes) throw new Error(`CHANGELOG section for ${version} is missing or empty in '${changelogPath}'.`);

  let apkLine = "APK SHA-256: see the attached .apk.sha256 checksum file.";
  let signingLine = "Signing certificate SHA-256: see android-update.json and verify the APK signature before installation.";
  if (values.has("--footer-json")) {
    const facts = JSON.parse(await readFile(path.resolve(values.get("--footer-json")), "utf8"));
    if (!facts || typeof facts !== "object" || !/^[0-9a-f]{64}$/.test(facts.apkSha256 ?? "") || !/^[0-9a-f]{64}$/.test(facts.certificateSha256 ?? "")) {
      throw new Error("Footer facts must include lowercase apkSha256 and certificateSha256 values.");
    }
    apkLine = `APK SHA-256: \`${facts.apkSha256}\``;
    signingLine = `Signing certificate SHA-256: \`${facts.certificateSha256}\``;
  }

  const footer = [
    "---",
    "Install this APK once; later compatible native updates are delivered in the app. Website changes remain available from the live site.",
    "",
    apkLine,
    signingLine,
    `Release guide: https://github.com/${repository}/blob/main/docs/android-release.md`,
  ].join("\n");
  const output = `${notes}\n\n${footer}\n`;
  const outPath = path.resolve(values.get("--out"));
  await writeFile(outPath, output, "utf8");
  process.stdout.write(`Wrote release notes for ${version} to ${outPath}\n`);
}

main().catch((error) => {
  console.error(`extract-release-notes: ${error.message}`);
  process.exitCode = 1;
});
