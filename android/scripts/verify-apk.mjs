#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  APPLICATION_ID,
  normalizeSha256,
  parseVersion,
  readSigningIdentity,
  sha256File,
} from "./lib/contract.mjs";

function parseArgs(argv) {
  const values = new Map();
  let allowNoIdentity = false;
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option.startsWith("--allow-no-identity=")) {
      if (allowNoIdentity || option !== "--allow-no-identity=false") {
        throw new Error("--allow-no-identity only accepts the fail-closed value false.");
      }
      allowNoIdentity = true;
      continue;
    }
    if (!["--apk", "--version", "--identity", "--expected-cert-sha256", "--app-id", "--min-sdk", "--json-out", "--build-tools-dir"].includes(option)) {
      throw new Error(`Unknown option '${option}'.`);
    }
    if (values.has(option)) throw new Error(`Option '${option}' may only be supplied once.`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Option '${option}' requires a value.`);
    values.set(option, value);
    index += 1;
  }
  if (!values.has("--apk") || !values.has("--version")) throw new Error("Required options are --apk <file> and --version <X.Y.Z>.");
  if (values.has("--identity") === values.has("--expected-cert-sha256")) {
    throw new Error("Provide exactly one of --identity <file> or --expected-cert-sha256 <hex>.");
  }
  return { values, allowNoIdentity };
}

function findBuildTools(explicit) {
  const candidates = [explicit, process.env.ANDROID_BUILD_TOOLS].filter(Boolean);
  if (candidates.length) return path.resolve(candidates[0]);
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!sdk) throw new Error("Android build-tools not found: set --build-tools-dir, ANDROID_BUILD_TOOLS, or ANDROID_HOME.");
  const root = path.join(sdk, "build-tools");
  let versions;
  try {
    versions = readdirSync(root);
  } catch {
    throw new Error(`Android build-tools directory does not exist: '${root}'.`);
  }
  const sorted = versions.filter((name) => /^\d+(?:\.\d+){1,3}$/.test(name)).sort((a, b) => {
    const left = a.split(".").map(Number);
    const right = b.split(".").map(Number);
    for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
      const difference = (left[index] ?? 0) - (right[index] ?? 0);
      if (difference) return difference;
    }
    return 0;
  });
  if (!sorted.length) throw new Error(`No Android build-tools versions found under '${root}'.`);
  return path.join(root, sorted.at(-1));
}

function runTool(binary, args) {
  try {
    return execFileSync(binary, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 16 * 1024 * 1024 });
  } catch (error) {
    const detail = [error.stdout, error.stderr].filter((part) => typeof part === "string" && part.trim()).join("\n").trim();
    throw new Error(`${path.basename(binary)} failed${error.status === null ? ` to start: ${error.message}` : ` with exit code ${error.status}`}${detail ? `: ${detail}` : "."}`);
  }
}

function parseVersionArgument(value) {
  const debug = value.endsWith("-debug");
  const versionName = debug ? value.slice(0, -"-debug".length) : value;
  return { ...parseVersion(versionName), expectedName: value };
}

async function main() {
  const { values } = parseArgs(process.argv.slice(2));
  const apkPath = path.resolve(values.get("--apk"));
  if (!existsSync(apkPath)) throw new Error(`APK does not exist: '${apkPath}'.`);
  const apkStat = await stat(apkPath);
  if (!apkStat.isFile() || apkStat.size < 1) throw new Error("APK must be a non-empty regular file.");

  const expectedVersion = parseVersionArgument(values.get("--version"));
  const minSdk = Number(values.get("--min-sdk") ?? "29");
  if (!Number.isInteger(minSdk) || minSdk < 1 || minSdk > 100) throw new Error("--min-sdk must be a supported positive Android API level.");

  let identity;
  let expectedFingerprints;
  if (values.has("--identity")) {
    const identityPath = path.resolve(values.get("--identity"));
    identity = await readSigningIdentity(identityPath);
    if (identity.certificateSha256.length === 0) {
      throw new Error(`Signing identity has no pinned certificates. Release verification fails closed until the owner records the production fingerprint in '${identityPath}' (see record-signing-identity.mjs).`);
    }
    expectedFingerprints = identity.certificateSha256;
  } else {
    expectedFingerprints = values.get("--expected-cert-sha256").split(",").map((value) => normalizeSha256(value.trim()));
    if (new Set(expectedFingerprints).size !== expectedFingerprints.length) throw new Error("Expected certificate fingerprint list contains duplicates.");
  }
  const expectedAppId = values.get("--app-id") ?? identity?.applicationId ?? APPLICATION_ID;
  if (identity && expectedAppId !== identity.applicationId) {
    throw new Error("--app-id cannot override the applicationId pinned in --identity.");
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/.test(expectedAppId)) {
    throw new Error("Expected application ID is invalid.");
  }

  const buildTools = findBuildTools(values.get("--build-tools-dir"));
  const apksigner = path.join(buildTools, process.platform === "win32" ? "apksigner.bat" : "apksigner");
  const aapt2 = path.join(buildTools, process.platform === "win32" ? "aapt2.exe" : "aapt2");
  for (const tool of [apksigner, aapt2]) if (!existsSync(tool)) throw new Error(`Required Android verification tool is missing: '${tool}'.`);

  const errors = [];
  let signatureOutput = "";
  try {
    signatureOutput = runTool(apksigner, ["verify", "--verbose", "--print-certs", apkPath]);
  } catch (error) {
    errors.push(`APK signature verification failed: ${error.message}`);
  }

  const signatureSchemes = { v1: false, v2: false, v3: false, v31: false, v4: false };
  for (const match of signatureOutput.matchAll(/Verified using v(1|2|3(?:\.1)?|4) scheme[^\r\n]*?:\s*(true|false)/gi)) {
    const key = match[1] === "3.1" ? "v31" : `v${match[1]}`;
    signatureSchemes[key] = match[2].toLowerCase() === "true";
  }
  if (signatureOutput) {
    if (!signatureSchemes.v2 && !signatureSchemes.v3) errors.push("APK must have a verified APK Signature Scheme v2 or v3 signature.");
    const signers = /Number of signers:\s*(\d+)/i.exec(signatureOutput);
    if (!signers) errors.push("apksigner output did not report the signer count.");
    else if (Number(signers[1]) !== 1) errors.push(`APK must have exactly one signer; found ${signers[1]}.`);
  }

  const certificateMatch = /Signer #1 certificate SHA-256 digest:\s*([0-9a-f:]+)/i.exec(signatureOutput);
  const signerDn = /Signer #1 certificate DN:\s*([^\r\n]+)/i.exec(signatureOutput)?.[1]?.trim() ?? "";
  const certificateSha256 = certificateMatch ? normalizeSha256(certificateMatch[1]) : null;
  if (!certificateSha256 && signatureOutput) errors.push("apksigner output did not contain the signer's SHA-256 certificate fingerprint.");
  if (/\bCN\s*=\s*Android Debug(?:\s*[,/]|$)/i.test(signerDn)) {
    errors.push("APK is signed with the Android Debug certificate (CN=Android Debug), which is not allowed for stable releases.");
  }
  if (certificateSha256 && !expectedFingerprints.includes(certificateSha256)) {
    errors.push(`Signer certificate SHA-256 ${certificateSha256} is not in the expected signing identity.`);
  }

  let badging = "";
  try {
    badging = runTool(aapt2, ["dump", "badging", apkPath]);
  } catch (error) {
    errors.push(`APK package inspection failed: ${error.message}`);
  }
  const packageMatch = /^package:\s+name='([^']+)'\s+versionCode='(\d+)'\s+versionName='([^']*)'/m.exec(badging);
  const sdkMatch = /^uses-sdk:\s+minSdkVersion:'(\d+)'(?:\s+targetSdkVersion:'(\d+)')?/m.exec(badging);
  const minSdkMatch = /^minSdkVersion:'?(\d+)'?/m.exec(badging);
  const targetSdkMatch = /^targetSdkVersion:'?(\d+)'?/m.exec(badging);
  let applicationId;
  let actualVersionCode;
  let versionName;
  let actualMinSdk;
  let targetSdk;
  if (!packageMatch) errors.push("aapt2 did not report APK package name, versionCode, and versionName.");
  else {
    [, applicationId, actualVersionCode, versionName] = packageMatch;
    actualVersionCode = Number(actualVersionCode);
    if (applicationId !== expectedAppId) errors.push(`APK applicationId is '${applicationId}', expected '${expectedAppId}'.`);
    if (versionName !== expectedVersion.expectedName) errors.push(`APK versionName is '${versionName}', expected '${expectedVersion.expectedName}'.`);
    if (actualVersionCode !== expectedVersion.versionCode) errors.push(`APK versionCode is ${actualVersionCode}, expected ${expectedVersion.versionCode}.`);
  }
  const minSdkValue = sdkMatch?.[1] ?? minSdkMatch?.[1];
  const targetSdkValue = sdkMatch?.[2] ?? targetSdkMatch?.[1];
  if (minSdkValue === undefined) errors.push("aapt2 did not report the APK minimum SDK version.");
  else {
    actualMinSdk = Number(minSdkValue);
    targetSdk = targetSdkValue === undefined ? null : Number(targetSdkValue);
    if (actualMinSdk !== minSdk) errors.push(`APK minSdkVersion is ${actualMinSdk}, expected ${minSdk}.`);
    if (targetSdk === null) errors.push("aapt2 did not report the APK target SDK version.");
  }
  if (/^application-debuggable(?:\s|$|=)/m.test(badging)) errors.push("APK is marked debuggable.");
  if (/^application-testOnly(?:\s|$|=)/m.test(badging)) errors.push("APK is marked testOnly.");

  if (errors.length) throw new Error(`APK verification failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);

  const facts = {
    applicationId,
    versionName,
    versionCode: actualVersionCode,
    minSdk: actualMinSdk,
    targetSdk,
    certificateSha256,
    apkSha256: await sha256File(apkPath),
    sizeBytes: apkStat.size,
    signatureSchemes,
  };
  if (values.has("--json-out")) {
    const jsonPath = path.resolve(values.get("--json-out"));
    await mkdir(path.dirname(jsonPath), { recursive: true });
    await writeFile(jsonPath, `${JSON.stringify(facts, null, 2)}\n`, "utf8");
  }
  process.stdout.write(`${JSON.stringify(facts, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`verify-apk: ${error.message}`);
  process.exitCode = 1;
});
