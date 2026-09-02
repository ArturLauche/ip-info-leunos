import { describe, expect, it } from "vitest";
import { ApiClientError, unwrapApiResponse } from "./client";

describe("unwrapApiResponse", () => {
  it("returns data for successful payloads", () => {
    expect(unwrapApiResponse({ ok: true, data: { ip: "8.8.8.8" } })).toEqual({
      ip: "8.8.8.8",
    });
  });

  it("throws ApiClientError with code for API errors", () => {
    try {
      unwrapApiResponse({ ok: false, error: { code: "rate_limited", message: "Slow down." } });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError);
      expect((error as ApiClientError).code).toBe("rate_limited");
    }
  });

  it("defaults to unknown code for malformed errors", () => {
    try {
      unwrapApiResponse({ ok: false });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError);
      expect((error as ApiClientError).code).toBe("unknown");
    }
  });

  it("passes through non-envelope payloads", () => {
    expect(unwrapApiResponse([1, 2, 3])).toEqual([1, 2, 3]);
  });
});
