import { ApiClientError } from "@/lib/api/client";
import type { ToolTranslation } from "@/lib/tool-i18n";

/**
 * Maps a structured API error to a translated message via its error code.
 * Falls back to the tool-specific message for client-side network failures
 * and unknown codes.
 */
export function getApiErrorMessage(
  error: unknown,
  t: ToolTranslation,
  fallback: string,
): string {
  if (!(error instanceof ApiClientError)) return fallback;

  switch (error.code) {
    case "rate_limited":
      return t.errorRateLimited;
    case "invalid_target":
      return t.errorInvalidTarget;
    case "target_blocked":
      return t.errorTargetBlocked;
    case "timeout":
      return t.errorTimeout;
    case "upstream_error":
      return t.errorUpstream;
    case "bad_request":
      return t.errorBadRequest;
    case "network_error":
      return t.errorTargetNetwork;
    default:
      return fallback;
  }
}

const NON_RETRYABLE_CODES: ReadonlySet<string> = new Set([
  "bad_request",
  "invalid_target",
  "target_blocked",
]);

/**
 * Whether repeating the same lookup can succeed: transport failures, timeouts,
 * rate limits and upstream outages can; invalid or blocked targets cannot.
 * Aborts are never surfaced as errors, so they need no special case here.
 */
export function isRetryableLookupError(error: unknown): boolean {
  if (error instanceof ApiClientError) return !NON_RETRYABLE_CODES.has(error.code);
  return error !== null && error !== undefined;
}
