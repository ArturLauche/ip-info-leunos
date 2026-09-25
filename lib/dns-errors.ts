/**
 * Classification of resolver failures into stable, client-facing codes.
 *
 * Lives outside the route module because Next.js route files may only export
 * request handlers and route config — test hooks exported from `route.ts`
 * break the build typecheck.
 *
 * Node's resolver reports c-ares failures with an `E` prefix: a server-side
 * lookup failure is `ESERVFAIL`, never `SERVFAIL`. Both spellings are accepted
 * here so an unexpected spelling still degrades to `temporary` instead of
 * `unknown`.
 */

export type DnsLookupErrorCode = "timeout" | "not_found" | "temporary" | "unknown";

const TIMEOUT_CODES = new Set(["ETIMEOUT"]);
const NOT_FOUND_CODES = new Set(["ENOTFOUND", "ENODATA"]);
const TEMPORARY_CODES = new Set([
  "EAI_AGAIN",
  "ESERVFAIL",
  "SERVFAIL",
  "EREFUSED",
]);

export const DNS_TIMEOUT_MESSAGE = "DNS query timed out.";

export function dnsLookupErrorCode(
  error: string | null | undefined,
): DnsLookupErrorCode {
  if (!error) return "unknown";
  if (error === DNS_TIMEOUT_MESSAGE || TIMEOUT_CODES.has(error)) return "timeout";
  if (NOT_FOUND_CODES.has(error)) return "not_found";
  if (TEMPORARY_CODES.has(error)) return "temporary";
  return "unknown";
}
