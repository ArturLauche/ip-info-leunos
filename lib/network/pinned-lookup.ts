import { isIP, type LookupFunction } from "node:net";

/** Resolves exclusively within a caller's already-validated address set. */
export function createPinnedLookup(validatedAddresses: readonly string[]): LookupFunction {
  const addresses = validatedAddresses.map((address) => ({ address, family: isIP(address) }));
  return (_hostname, options, callback) => {
    const family = options.family === "IPv4" ? 4 : options.family === "IPv6" ? 6 : Number(options.family ?? 0);
    const candidates = addresses.filter((entry) => !family || entry.family === family);
    if (!candidates.length) {
      callback(Object.assign(new Error("No validated address for this family."), { code: "ENOTFOUND" }), "");
    } else if (options.all) {
      callback(null, candidates);
    } else {
      callback(null, candidates[0].address, candidates[0].family);
    }
  };
}
