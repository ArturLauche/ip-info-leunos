/**
 * Memoization policy for the public DNS route.
 *
 * Lives outside the route module because Next.js route files may only export
 * request handlers and route config — test hooks exported from `route.ts`
 * break the build typecheck.
 */

export interface DnsRecordErrorDescriptor {
  type: string;
  error?: string;
}

/**
 * Only stable answers are memoized: successful lookups and stable negatives
 * (NXDOMAIN / no-data). Transient resolver failures (timeouts, SERVFAIL,
 * refused) must never become deterministic bad results for the TTL window.
 */
export function isCacheableDnsResult(
  lookupError: string | null,
  recordErrors: DnsRecordErrorDescriptor[],
): boolean {
  if (recordErrors.length > 0) return false;
  return lookupError === null || lookupError === "ENOTFOUND" || lookupError === "ENODATA";
}
