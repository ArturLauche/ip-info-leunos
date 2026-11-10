import { describe, expect, it } from "vitest";
import { ApiClientError } from "./client";
import { isRetryableLookupError } from "./error-message";

describe("isRetryableLookupError", () => {
  it("offers retries for transient failures", () => {
    for (const code of ["rate_limited", "timeout", "upstream_error", "network_error", "unknown"]) {
      expect(isRetryableLookupError(new ApiClientError(code, "x")), code).toBe(true);
    }
    expect(isRetryableLookupError(new TypeError("Failed to fetch"))).toBe(true);
  });

  it("does not offer retries that cannot succeed", () => {
    for (const code of ["bad_request", "invalid_target", "target_blocked"]) {
      expect(isRetryableLookupError(new ApiClientError(code, "x")), code).toBe(false);
    }
    expect(isRetryableLookupError(null)).toBe(false);
    expect(isRetryableLookupError(undefined)).toBe(false);
  });
});
