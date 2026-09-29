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
