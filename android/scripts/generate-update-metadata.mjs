#!/usr/bin/env node

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  APPLICATION_ID,
  DEFAULT_REPOSITORY,
  MIN_SDK,
  apkName,
  downloadUrl,
  parseTag,
  releaseUrl,
  sha256File,
  validatePublishedAt,
  validateRepository,
  validateUpdateMetadata,
} from "./lib/contract.mjs";

function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (!["--apk", "--facts", "--tag", "--out-dir", "--published-at", "--repo"].includes(option)) {
      throw new Error(`Unknown option '${option}'.`);
    }
    if (values.has(option)) throw new Error(`Option '${option}' may only be supplied once.`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Option '${option}' requires a value.`);
    values.set(option, value);
    index += 1;
  }
  for (const required of ["--apk", "--facts", "--tag", "--out-dir"]) {
    if (!values.has(required)) throw new Error(`Missing required option ${required}.`);
  }
  return values;
}

async function main() {
  const values = parseArgs(process.argv.slice(2));
  const tag = values.get("--tag");
  const parsedTag = parseTag(tag);
  const repository = validateRepository(values.get("--repo") ?? DEFAULT_REPOSITORY);
  const apkPath = path.resolve(values.get("--apk"));
  const factsPath = path.resolve(values.get("--facts"));
  const outDir = path.resolve(values.get("--out-dir"));
  const facts = JSON.parse(await readFile(factsPath, "utf8"));
  if (!facts || typeof facts !== "object" || Array.isArray(facts)) throw new Error("APK facts must be a JSON object.");
  if (facts.applicationId !== APPLICATION_ID) throw new Error(`APK facts applicationId must be '${APPLICATION_ID}'.`);
  if (facts.versionName !== parsedTag.versionName || facts.versionCode !== parsedTag.versionCode) {
    throw new Error("APK facts versionName/versionCode do not match the release tag.");
  }
  if (facts.minSdk !== MIN_SDK) throw new Error(`APK facts minSdk must be ${MIN_SDK}.`);
  if (typeof facts.certificateSha256 !== "string" || !/^[0-9a-f]{64}$/.test(facts.certificateSha256)) {
    throw new Error("APK facts certificateSha256 must be lowercase 64-character SHA-256 hex.");
  }
  if (!/^[0-9a-f]{64}$/.test(facts.apkSha256 ?? "") || !Number.isSafeInteger(facts.sizeBytes) || facts.sizeBytes < 1) {
    throw new Error("APK facts must contain a lowercase APK SHA-256 and positive sizeBytes.");
  }
  const sourceStat = await stat(apkPath);
  if (!sourceStat.isFile() || sourceStat.size !== facts.sizeBytes || await sha256File(apkPath) !== facts.apkSha256) {
    throw new Error("APK facts size or SHA-256 does not match the signed APK.");
  }

  const publishedAt = values.get("--published-at") ?? new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  validatePublishedAt(publishedAt);
  const name = apkName(parsedTag.versionName);
  const metadata = {
    schemaVersion: 1,
    applicationId: APPLICATION_ID,
    tag,
    versionName: parsedTag.versionName,
    versionCode: parsedTag.versionCode,
    minSdk: MIN_SDK,
    publishedAt,
    releaseNotesUrl: releaseUrl(parsedTag.versionName, repository),
    apk: {
      fileName: name,
      downloadUrl: downloadUrl(parsedTag.versionName, repository),
      sizeBytes: sourceStat.size,
      sha256: facts.apkSha256,
    },
    signing: { certificateSha256: facts.certificateSha256 },
  };
  validateUpdateMetadata(metadata, { repository, tag });

  await mkdir(outDir, { recursive: true });
  const apkBytes = await readFile(apkPath);
  const checksum = Buffer.from(`${metadata.apk.sha256}  ${name}\n`, "utf8");
  const metadataBytes = Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  const files = [
    [path.join(outDir, name), apkBytes],
    [path.join(outDir, `${name}.sha256`), checksum],
    [path.join(outDir, "android-update.json"), metadataBytes],
  ];
  for (const [filePath, bytes] of files) {
    try {
      const existing = await readFile(filePath);
      if (!existing.equals(bytes)) throw new Error(`Refusing to overwrite different release asset '${filePath}'.`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  for (const [filePath, bytes] of files) {
    try {
      await writeFile(filePath, bytes, { flag: "wx" });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      const existing = await readFile(filePath);
      if (!existing.equals(bytes)) throw new Error(`Refusing to overwrite different release asset '${filePath}'.`);
    }
  }
  const finalApkPath = path.join(outDir, name);
  if (await stat(finalApkPath).then((result) => result.size) !== metadata.apk.sizeBytes || await sha256File(finalApkPath) !== metadata.apk.sha256) {
    throw new Error("Final staged APK failed its size/SHA-256 check.");
  }
  process.stdout.write(`${metadataBytes.toString("utf8")}`);
}

main().catch((error) => {
  console.error(`generate-update-metadata: ${error.message}`);
  process.exitCode = 1;
});
