import { afterEach, describe, expect, it } from "vitest";
import {
  clearGreyNoiseQuotaForTests,
  greyNoiseQuotaAvailable,
  greyNoiseQuotaRetryAfterMs,
  observeGreyNoiseQuota,
} from "./greynoise-quota";

const NOW = Date.parse("2026-09-25T12:00:00.000Z");

function response(headers: Record<string, string>, status = 200): Response {
  return new Response("{}", { status, headers });
}

afterEach(() => {
  clearGreyNoiseQuotaForTests();
});

describe("GreyNoise quota gate", () => {
  it("allows requests while the provider advertises quota", () => {
    observeGreyNoiseQuota(response({ "x-rl-remaining": "5" }), NOW);

    expect(greyNoiseQuotaAvailable(NOW)).toBe(true);
  });

  it("blocks a request once the advertised quota is spent", () => {
    const resetSeconds = Math.floor((NOW + 60_000) / 1_000);
    observeGreyNoiseQuota(
      response({ "x-rl-remaining": "0", "x-rl-reset": String(resetSeconds) }),
      NOW,
    );

    expect(greyNoiseQuotaAvailable(NOW)).toBe(false);
    expect(greyNoiseQuotaRetryAfterMs(NOW)).toBeGreaterThan(0);
  });

  it("treats a 429 as authoritative even without usable headers", () => {
    observeGreyNoiseQuota(response({}, 429), NOW);
    expect(greyNoiseQuotaAvailable(NOW)).toBe(false);

    // A later response that advertises quota again is not trusted: a
    // rejection cannot be undone by a stale low reading.
    observeGreyNoiseQuota(response({ "x-rl-remaining": "9" }), NOW);
    expect(greyNoiseQuotaAvailable(NOW)).toBe(false);
  });

  it("recovers once the advertised reset has passed", () => {
    observeGreyNoiseQuota(
      response({ "x-rl-remaining": "0", "x-rl-reset": String(NOW / 1_000 + 30) }),
      NOW,
    );
    expect(greyNoiseQuotaAvailable(NOW)).toBe(false);

    expect(greyNoiseQuotaAvailable(NOW + 31_000)).toBe(true);
    expect(greyNoiseQuotaRetryAfterMs(NOW + 31_000)).toBe(0);
  });

  it("accepts a seconds-from-now reset as well as an epoch", () => {
    observeGreyNoiseQuota(
      response({ "x-rl-remaining": "0", "x-rl-reset": "30" }),
      NOW,
    );
    expect(greyNoiseQuotaAvailable(NOW + 29_000)).toBe(false);
    expect(greyNoiseQuotaAvailable(NOW + 31_000)).toBe(true);
  });

  it("never backs off on a missing or malformed header", () => {
    observeGreyNoiseQuota(response({ "x-rl-remaining": "nonsense" }), NOW);
    expect(greyNoiseQuotaAvailable(NOW)).toBe(true);
  });
});
