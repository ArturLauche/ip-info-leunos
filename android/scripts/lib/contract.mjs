import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";

export const APPLICATION_ID = "com.leunos.ipinfo";
export const MIN_SDK = 29;
export const DEFAULT_REPOSITORY = "ArturLauche/ip-info-leunos";

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const PACKAGE_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/;

export function parseVersion(value) {
  if (typeof value !== "string") {
    throw new Error("Android version must be a string in MAJOR.MINOR.PATCH format.");
  }

  const match = VERSION_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Invalid Android version '${value}': expected MAJOR.MINOR.PATCH without leading zeros or prerelease labels.`);
  }

  const [major, minor, patch] = match.slice(1).map(Number);
  if (major > 2099 || minor > 999 || patch > 999) {
    throw new Error(`Android version '${value}' is outside the supported range (MAJOR 0..2099, MINOR/PATCH 0..999).`);
  }

  const code = major * 1_000_000 + minor * 1_000 + patch;
  if (!Number.isSafeInteger(code) || code < 1 || code > 2_099_999_999) {
    throw new Error(`Android version '${value}' maps outside the supported versionCode range.`);
  }

  return { major, minor, patch, versionName: value, versionCode: code };
}

export function versionCode(version) {
  return parseVersion(version).versionCode;
}

export function compareVersions(left, right) {
  const a = typeof left === "string" ? parseVersion(left) : left;
  const b = typeof right === "string" ? parseVersion(right) : right;
  for (const key of ["major", "minor", "patch"]) {
    if (a[key] !== b[key]) return a[key] < b[key] ? -1 : 1;
  }
  return 0;
}

export function parseTag(tag) {
  if (typeof tag !== "string" || !tag.startsWith("android-v")) {
    throw new Error(`Invalid Android release tag '${tag}': expected android-vMAJOR.MINOR.PATCH.`);
  }
  const versionName = tag.slice("android-v".length);
  const parsed = parseVersion(versionName);
  return { ...parsed, tag };
}

export function isStableTag(tag) {
  try {
    parseTag(tag);
    return true;
  } catch {
    return false;
  }
}

export function tagFor(version) {
  parseVersion(version);
  return `android-v${version}`;
}

export function apkName(version) {
  parseVersion(version);
  return `ip-info-android-v${version}.apk`;
}

export function checksumName(version) {
  return `${apkName(version)}.sha256`;
}

export function validateRepository(repository) {
  if (typeof repository !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error(`Invalid GitHub repository '${repository}': expected OWNER/REPOSITORY.`);
  }
  return repository;
}

export function releaseUrl(version, repository = DEFAULT_REPOSITORY) {
  const tag = tagFor(version);
  validateRepository(repository);
  return `https://github.com/${repository}/releases/tag/${tag}`;
}

export function downloadUrl(version, repository = DEFAULT_REPOSITORY) {
  const tag = tagFor(version);
  validateRepository(repository);
  return `https://github.com/${repository}/releases/download/${tag}/${apkName(version)}`;
}

export function releaseTitle(version) {
  parseVersion(version);
  return `IP Info for Android ${version}`;
}

export function isSha256Hex(value) {
  return typeof value === "string" && SHA256_PATTERN.test(value);
}

export function normalizeSha256(value) {
  if (typeof value !== "string") throw new Error("SHA-256 fingerprint must be a string.");
  const normalized = value.replaceAll(":", "").toLowerCase();
  if (!SHA256_PATTERN.test(normalized)) {
    throw new Error("SHA-256 fingerprint must contain exactly 64 hexadecimal characters.");
  }
  return normalized;
}

export function sha256Hex(value) {
  if (typeof value !== "string" && !Buffer.isBuffer(value) && !(value instanceof Uint8Array)) {
    throw new TypeError("SHA-256 input must be a string or byte array.");
  }
  return createHash("sha256").update(value).digest("hex");
}

export async function sha256File(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex");
}

export async function readVersionProperties(filePath) {
  let contents;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(`Cannot read Android version file '${filePath}': ${error.message}`);
  }

  let versionName;
  for (const [index, rawLine] of contents.replace(/^\uFEFF/, "").split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("!")) continue;
    const match = /^([A-Za-z][A-Za-z0-9_.-]*)\s*=\s*(.*)$/.exec(line);
    if (!match) throw new Error(`Invalid property on line ${index + 1} of '${filePath}'.`);
    if (match[1] === "versionName") {
      if (versionName !== undefined) throw new Error(`Duplicate versionName in '${filePath}'.`);
      versionName = match[2].trim();
    }
  }

  if (versionName === undefined) throw new Error(`Missing versionName in '${filePath}'.`);
  return parseVersion(versionName);
}

export async function readSigningIdentity(filePath) {
  let contents;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(`Cannot read signing identity '${filePath}': ${error.message}`);
  }

  let identity;
  try {
    identity = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Invalid JSON in signing identity '${filePath}': ${error.message}`);
  }

  assertObject(identity, "Signing identity");
  assertExactKeys(identity, ["schemaVersion", "applicationId", "certificateSha256"], "Signing identity");
  if (identity.schemaVersion !== 1) throw new Error("Signing identity schemaVersion must be 1.");
  if (identity.applicationId !== APPLICATION_ID || !PACKAGE_PATTERN.test(identity.applicationId)) {
    throw new Error(`Signing identity applicationId must be '${APPLICATION_ID}'.`);
  }
  if (!Array.isArray(identity.certificateSha256)) {
    throw new Error("Signing identity certificateSha256 must be an array.");
  }

  const fingerprints = identity.certificateSha256;
  if (fingerprints.some((fingerprint) => !isSha256Hex(fingerprint))) {
    throw new Error("Signing identity fingerprints must be lowercase 64-character SHA-256 hex strings.");
  }
  if (new Set(fingerprints).size !== fingerprints.length) {
    throw new Error("Signing identity contains duplicate certificate fingerprints.");
  }

  return { schemaVersion: 1, applicationId: identity.applicationId, certificateSha256: [...fingerprints] };
}

export function extractChangelogSection(contents, version) {
  parseVersion(version);
  const escaped = version.replaceAll(".", "\\.");
  const headingPattern = new RegExp(`^## \\[${escaped}\\](?: - .*)?$`);
  const lines = contents.replace(/\r/g, "").split("\n");
  const headings = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (headingPattern.test(lines[index])) headings.push(index);
  }
  if (headings.length > 1) throw new Error(`CHANGELOG has more than one section for version ${version}.`);
  if (headings.length === 0) return null;

  const start = headings[0] + 1;
  let end = start;
  while (end < lines.length && !/^## /.test(lines[end])) end += 1;
  const notes = lines.slice(start, end).join("\n").trim();
  return notes || null;
}

export function validatePublishedAt(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) {
    throw new Error("publishedAt must be a UTC ISO-8601 instant in YYYY-MM-DDTHH:MM:SSZ format.");
  }
  const date = new Date(value);
  if (Number.isNaN(date.valueOf()) || date.toISOString().replace(/\.\d{3}Z$/, "Z") !== value) {
    throw new Error("publishedAt is not a valid UTC date-time.");
  }
  return value;
}

export function validateUpdateMetadata(metadata, { repository = DEFAULT_REPOSITORY, tag } = {}) {
  validateRepository(repository);
  assertObject(metadata, "Update metadata");
  assertExactKeys(metadata, [
    "schemaVersion",
    "applicationId",
    "tag",
    "versionName",
    "versionCode",
    "minSdk",
    "publishedAt",
    "releaseNotesUrl",
    "apk",
    "signing",
  ], "Update metadata");

  if (metadata.schemaVersion !== 1) throw new Error("Update metadata schemaVersion must be 1.");
  if (metadata.applicationId !== APPLICATION_ID) throw new Error(`Update metadata applicationId must be '${APPLICATION_ID}'.`);
  const parsed = parseTag(metadata.tag);
  if (tag !== undefined && metadata.tag !== tag) throw new Error(`Update metadata tag must be '${tag}'.`);
  if (metadata.versionName !== parsed.versionName) throw new Error("Update metadata versionName does not match its tag.");
  if (!Number.isInteger(metadata.versionCode) || metadata.versionCode !== parsed.versionCode) {
    throw new Error("Update metadata versionCode does not match the semantic version mapping.");
  }
  if (metadata.minSdk !== MIN_SDK) throw new Error(`Update metadata minSdk must be ${MIN_SDK}.`);
  validatePublishedAt(metadata.publishedAt);
  if (metadata.releaseNotesUrl !== releaseUrl(parsed.versionName, repository)) {
    throw new Error("Update metadata releaseNotesUrl does not match its tag and repository.");
  }

  assertObject(metadata.apk, "Update metadata apk");
  assertExactKeys(metadata.apk, ["fileName", "downloadUrl", "sizeBytes", "sha256"], "Update metadata apk");
  if (metadata.apk.fileName !== apkName(parsed.versionName)) throw new Error("Update metadata APK filename does not match its version.");
  if (metadata.apk.downloadUrl !== downloadUrl(parsed.versionName, repository)) {
    throw new Error("Update metadata APK URL does not match its version and repository.");
  }
  if (!Number.isSafeInteger(metadata.apk.sizeBytes) || metadata.apk.sizeBytes < 1) {
    throw new Error("Update metadata APK sizeBytes must be a positive safe integer.");
  }
  if (!isSha256Hex(metadata.apk.sha256)) throw new Error("Update metadata APK SHA-256 must be lowercase hexadecimal.");

  assertObject(metadata.signing, "Update metadata signing");
  assertExactKeys(metadata.signing, ["certificateSha256"], "Update metadata signing");
  if (!isSha256Hex(metadata.signing.certificateSha256)) {
    throw new Error("Update metadata signing certificateSha256 must be lowercase hexadecimal.");
  }

  return metadata;
}

function assertObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }
}

function assertExactKeys(value, expected, label) {
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  if (actual.length !== required.length || actual.some((key, index) => key !== required[index])) {
    throw new Error(`${label} must contain exactly these fields: ${expected.join(", ")}.`);
  }
}

