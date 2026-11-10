/**
 * Memo state for the WHOIS route. Lives outside the route module because
 * Next.js route files may only export request handlers and route config.
 */
import { createSingleFlight } from "@/lib/single-flight";
import { createTtlCache } from "@/lib/ttl-cache";

export type WhoisPayload = Record<string, unknown> & { target: string; server: string };
export type WhoisOutcome =
  | { ok: true; payload: WhoisPayload }
  | { ok: false; details: { whois: string; rdap: string } };

// Registration data changes rarely, while registry WHOIS servers rate-limit
// aggressively per source IP. A short memo plus single-flight keeps repeated
// lookups of one name from spending the deployment's registry quota. Failures
// are never cached.
export const whoisCache = createTtlCache<WhoisPayload>({ ttlMs: 5 * 60_000, maxEntries: 256 });
export const whoisFlights = createSingleFlight<WhoisOutcome>();

// IANA refers every name under a TLD to the same registry WHOIS server, so the
// referral is cached per TLD and saves one IANA round trip per domain lookup.
// Only positive referrals are cached: IANA answers some reserved names
// (example.com …) itself, which is specific to the name, not the TLD.
export const tldReferralCache = createTtlCache<string>({
  ttlMs: 6 * 60 * 60_000,
  maxEntries: 512,
});

/** TLD key for the referral cache, or null for IP targets (referred per block). */
export function referralCacheKey(target: string, isIp: boolean) {
  return isIp ? null : target.slice(target.lastIndexOf(".") + 1);
}

/** Test hook: clears memo state between cases. */
export function clearWhoisCacheForTests() {
  whoisCache.clear();
  tldReferralCache.clear();
}
