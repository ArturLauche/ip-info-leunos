/**
 * Server-side memo in front of ip-api.com (upstream quota protection: the free
 * endpoint allows 45 requests per minute for the whole deployment).
 *
 * Lives outside the route module because Next.js route files may only export
 * request handlers and route config — cache state and test hooks exported
 * from `route.ts` break the build typecheck.
 *
 * What is cached is the provider's answer *about an address* (geo, ISP, ASN),
 * keyed by that address and the effective upstream language. It holds nothing
 * request-specific (no forwarding headers, no proxy hints), so it is shared by
 * explicit `?ip=` lookups and the visitor's own auto-detected lookup alike: a
 * visitor reloading the home page, or navigating back to it, no longer spends
 * a fresh upstream request for an answer fetched seconds earlier.
 *
 * Only successful provider answers are memoized: lookupIpApi() collapses
 * transport errors, timeouts, and malformed responses to null, and caching
 * that fallback would turn a transient upstream outage into a sticky
 * false-unknown response. Identical in-flight lookups additionally share one
 * upstream fetch (single-flight) so a burst of concurrent misses cannot
 * exceed the upstream budget on its own.
 */

import { lookupIpApi, toIpApiLanguage, type IpApiData } from "./providers/ip-api";
import { createSingleFlight } from "./single-flight";
import { createTtlCache } from "./ttl-cache";

const providerCache = createTtlCache<IpApiData>({ ttlMs: 60_000, maxEntries: 512 });
const providerFlights = createSingleFlight<IpApiData | null>();

/** Cache key: ip-api collapses most UI locales onto a handful of languages. */
export function ipLookupCacheKey(ip: string, language: string) {
  return `${ip}:${toIpApiLanguage(language)}`;
}

/**
 * ip-api data for `ip`, served from the memo when fresh. Resolves to null when
 * the provider is unavailable (never cached, so the next request retries).
 */
export function lookupIpApiCached(
  ip: string,
  language: string,
  options: { timeoutMs?: number } = {},
): Promise<IpApiData | null> {
  const key = ipLookupCacheKey(ip, language);
  const cached = providerCache.get(key);
  if (cached) return Promise.resolve(cached);

  return providerFlights.run(key, async () => {
    const data = await lookupIpApi(ip, { language, timeoutMs: options.timeoutMs });
    if (data) providerCache.set(key, data);
    return data;
  });
}

/** Test hook: clears memo state between cases. */
export function clearIpLookupCacheForTests() {
  providerCache.clear();
}
