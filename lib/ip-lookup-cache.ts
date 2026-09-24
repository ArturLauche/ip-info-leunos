/**
 * Server-side memo for explicit `?ip=` lookups (upstream ip-api.com quota
 * protection). The cache is process-local and intentionally short-lived; the
 * shared primitives keep its expiry and single-flight semantics identical to
 * the other public-data caches.
 */

import { SingleFlight, TtlCache } from "@/lib/cache/ttl-cache";
import type { IpApiData } from "./providers/ip-api";

const LOOKUP_CACHE_TTL_MS = 60_000;
const LOOKUP_CACHE_MAX_ENTRIES = 512;

const lookupCache = new TtlCache<unknown>({
  ttlMs: LOOKUP_CACHE_TTL_MS,
  maxEntries: LOOKUP_CACHE_MAX_ENTRIES,
});
const inflightLookups = new SingleFlight<IpApiData | null>();

export function getCachedLookup(key: string): unknown | null {
  return lookupCache.get(key);
}

export function setCachedLookup(key: string, payload: unknown) {
  lookupCache.set(key, payload);
}

export function getInflightLookup(key: string): Promise<IpApiData | null> | undefined {
  return inflightLookups.getPending(key);
}

/** Registers an upstream fetch as the shared in-flight lookup for `key`. */
export function trackInflightLookup(
  key: string,
  promise: Promise<IpApiData | null>,
): Promise<IpApiData | null> {
  return inflightLookups.track(key, promise);
}

/** Test hook: clears memo and single-flight state between cases. */
export function clearIpLookupCacheForTests() {
  lookupCache.clear();
  inflightLookups.clear();
}
