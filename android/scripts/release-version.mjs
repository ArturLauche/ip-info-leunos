#!/usr/bin/env node

import { appendFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  apkName,
  checksumName,
  compareVersions,
  extractChangelogSection,
  isStableTag,
  parseTag,
  readVersionProperties,
  releaseTitle,
} from "./lib/contract.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  const values = new Map();
  let githubOutput = false;
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === "--github-output") {
      if (githubOutput) throw new Error("--github-output may only be supplied once.");
      githubOutput = true;
      continue;
    }
    if (!["--tag", "--version-file", "--changelog", "--releases-json"].includes(option)) {
      throw new Error(`Unknown option '${option}'.`);
    }
    if (values.has(option)) throw new Error(`Option '${option}' may only be supplied once.`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Option '${option}' requires a value.`);
    values.set(option, value);
    index += 1;
  }
  if (!values.has("--tag")) throw new Error("Missing required option --tag <android-vMAJOR.MINOR.PATCH>.");
  return { values, githubOutput };
}

async function loadPublishedReleases(filePath, activeTag) {
  let releases;
  try {
    releases = JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read release list '${filePath}': ${error.message}`);
  }
  if (!Array.isArray(releases)) throw new Error("Release list must be a JSON array.");

  const published = [];
  for (const [index, release] of releases.entries()) {
    if (!release || typeof release !== "object" || Array.isArray(release)) {
      throw new Error(`Release list item ${index + 1} must be an object.`);
    }
    if (typeof release.tagName !== "string" || typeof release.isDraft !== "boolean" || typeof release.isPrerelease !== "boolean") {
      throw new Error(`Release list item ${index + 1} must contain tagName, isDraft, and isPrerelease.`);
    }
    if (release.isDraft || !release.tagName.startsWith("android-v")) continue;
    if (release.tagName === activeTag) {
      throw new Error(`A published release already exists for ${activeTag}; published Android releases are immutable.`);
    }
    if (release.isPrerelease && !isStableTag(release.tagName)) continue;
    published.push(parseTag(release.tagName));
  }
  return published;
}

async function main() {
  const { values, githubOutput } = parseArgs(process.argv.slice(2));
  const activeTag = values.get("--tag");
  const parsedTag = parseTag(activeTag);
  const versionFile = path.resolve(values.get("--version-file") ?? path.join(ROOT, "android/version.properties"));
  const changelogFile = path.resolve(values.get("--changelog") ?? path.join(ROOT, "android/CHANGELOG.md"));
  const version = await readVersionProperties(versionFile);
  if (version.versionName !== parsedTag.versionName) {
    throw new Error(`Release tag ${activeTag} does not match android/version.properties (${version.versionName}).`);
  }

  let changelog;
  try {
    changelog = await readFile(changelogFile, "utf8");
  } catch (error) {
    throw new Error(`Cannot read Android changelog '${changelogFile}': ${error.message}`);
  }
  if (!extractChangelogSection(changelog, version.versionName)) {
    throw new Error(`CHANGELOG section for ${version.versionName} is missing or empty in '${changelogFile}'.`);
  }

  if (values.has("--releases-json")) {
    const releases = await loadPublishedReleases(path.resolve(values.get("--releases-json")), activeTag);
    const newer = releases.find((release) => compareVersions(version, release) <= 0);
    if (newer) {
      throw new Error(`Release ${activeTag} must be newer than every published Android release; ${newer.tag} already exists.`);
    }
  }

  const outputs = {
    version: version.versionName,
    version_code: String(version.versionCode),
    tag: activeTag,
    apk_name: apkName(version.versionName),
    checksum_name: checksumName(version.versionName),
    release_title: releaseTitle(version.versionName),
  };
  if (githubOutput) {
    const outputPath = process.env.GITHUB_OUTPUT;
    if (!outputPath) throw new Error("--github-output requires the GITHUB_OUTPUT environment variable.");
    await appendFile(path.resolve(outputPath), `${Object.entries(outputs).map(([key, value]) => `${key}=${value}`).join("\n")}\n`, "utf8");
  }
  process.stdout.write(`${JSON.stringify(outputs, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`release-version: ${error.message}`);
  process.exitCode = 1;
});
