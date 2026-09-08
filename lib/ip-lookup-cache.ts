/**
 * Server-side memo for explicit `?ip=` lookups (upstream ip-api.com quota
 * protection).
 *
 * Lives outside the route module because Next.js route files may only export
 * request handlers and route config — cache state and test hooks exported
 * from `route.ts` break the build typecheck.
 *
 * Only successful provider answers are memoized: lookupIpApi() collapses
 * transport errors, timeouts, and malformed responses to null, and caching
 * that fallback would turn a transient upstream outage into a sticky
 * false-unknown response. Identical in-flight lookups additionally share one
 * upstream fetch (single-flight) so a burst of concurrent misses cannot
 * exceed the upstream budget on its own.
 */

import { createTtlCache } from "./cache/ttl-cache";
import type { IpApiData } from "./providers/ip-api";

const LOOKUP_CACHE_TTL_MS = 60_000;
const LOOKUP_CACHE_MAX_ENTRIES = 512;

const lookupCache = createTtlCache<unknown>({
  ttlMs: LOOKUP_CACHE_TTL_MS,
  maxEntries: LOOKUP_CACHE_MAX_ENTRIES,
});
const inflightLookups = new Map<string, Promise<IpApiData | null>>();

export function getCachedLookup(key: string): unknown | null {
  return lookupCache.get(key);
}

export function setCachedLookup(key: string, payload: unknown) {
  lookupCache.set(key, payload);
}

export function getInflightLookup(key: string): Promise<IpApiData | null> | undefined {
  return inflightLookups.get(key);
}

/** Registers an upstream fetch as the shared in-flight lookup for `key`. */
export function trackInflightLookup(
  key: string,
  promise: Promise<IpApiData | null>,
): Promise<IpApiData | null> {
  const tracked = promise.finally(() => {
    if (inflightLookups.get(key) === tracked) inflightLookups.delete(key);
  });
  inflightLookups.set(key, tracked);
  return tracked;
}

/** Test hook: clears memo and single-flight state between cases. */
export function clearIpLookupCacheForTests() {
  lookupCache.clear();
  inflightLookups.clear();
}
