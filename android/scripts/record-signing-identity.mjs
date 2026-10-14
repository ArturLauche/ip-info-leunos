#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { normalizeSha256, readSigningIdentity } from "./lib/contract.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  const values = new Map();
  let rotate = false;
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === "--rotate") {
      if (rotate) throw new Error("--rotate may only be supplied once.");
      rotate = true;
      continue;
    }
    if (!["--sha256", "--identity"].includes(option)) throw new Error(`Unknown option '${option}'.`);
    if (values.has(option)) throw new Error(`Option '${option}' may only be supplied once.`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Option '${option}' requires a value.`);
    values.set(option, value);
    index += 1;
  }
  if (!values.has("--sha256")) throw new Error("Missing required option --sha256 <hex>.");
  return { values, rotate };
}

async function main() {
  const { values, rotate } = parseArgs(process.argv.slice(2));
  const fingerprint = normalizeSha256(values.get("--sha256"));
  const identityPath = path.resolve(values.get("--identity") ?? path.join(ROOT, "android/release/signing-identity.json"));
  const identity = await readSigningIdentity(identityPath);
  if (identity.certificateSha256.includes(fingerprint)) {
    process.stdout.write(`Signing certificate ${fingerprint} is already recorded in ${identityPath}.\n`);
    return;
  }
  if (identity.certificateSha256.length && !rotate) {
    throw new Error("A different signing certificate is already recorded. Use --rotate only for an intentional Android signing-key rotation.");
  }
  if (rotate && identity.certificateSha256.length) {
    console.error("WARNING: key rotation changes the APK signer. Keep the old key and create a valid Android signing-certificate lineage before publishing updates.");
  }

  const updated = { ...identity, certificateSha256: [...identity.certificateSha256, fingerprint] };
  await writeFile(identityPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  process.stdout.write(`Recorded signing certificate ${fingerprint} in ${identityPath}.\n`);
}

main().catch((error) => {
  console.error(`record-signing-identity: ${error.message}`);
  process.exitCode = 1;
});
