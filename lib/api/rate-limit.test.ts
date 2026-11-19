import { afterEach, describe, expect, it, vi } from "vitest";
import { enforceRateLimit, getClientIp } from "./rate-limit";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("rate limiting", () => {
  it("normalizes trusted proxy IP headers before building bucket keys", () => {
    expect(
      getClientIp(
        new Request("https://example.test", {
          headers: {
            "cf-connecting-ip": "[2001:db8::1]:443",
            "x-forwarded-for": "198.51.100.10",
          },
        }),
      ),
    ).toBe("2001:db8::1");

    expect(
      getClientIp(
        new Request("https://example.test", {
          headers: {
            forwarded: 'for="203.0.113.10:1234";proto=https',
          },
        }),
      ),
    ).toBe("203.0.113.10");
  });

  it("returns retry metadata when a bucket is exhausted", async () => {
    const routeKey = `test-${Date.now()}-${Math.random()}`;
    const request = new Request("https://example.test", {
      headers: { "cf-connecting-ip": "198.51.100.20" },
    });

    expect(enforceRateLimit(request, routeKey, { limit: 1, windowMs: 1_000 })).toBeNull();

    const limited = enforceRateLimit(request, routeKey, { limit: 1, windowMs: 1_000 });
    expect(limited?.status).toBe(429);
    expect(limited?.headers.get("retry-after")).toBeTruthy();
    expect(limited?.headers.get("x-ratelimit-limit")).toBe("1");
    expect(limited?.headers.get("x-ratelimit-remaining")).toBe("0");
    expect(limited?.headers.get("cache-control")).toBe("no-store");
    await expect(limited?.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "rate_limited" },
    });
  });

  it("ignores spoofable forwarding headers when TRUSTED_PROXY_HEADERS=false", () => {
    vi.stubEnv("TRUSTED_PROXY_HEADERS", "false");

    const spoofed = new Request("https://example.test", {
      headers: {
        "cf-connecting-ip": "198.51.100.1",
        "x-forwarded-for": "198.51.100.2",
        forwarded: "for=198.51.100.3",
      },
    });
    expect(getClientIp(spoofed)).toBe("unknown");

    // Rotating the headers must not mint a fresh bucket: both requests share
    // the single "unknown" bucket and the second one is limited.
    const routeKey = `test-untrusted-${Date.now()}-${Math.random()}`;
    const first = new Request("https://example.test", {
      headers: { "cf-connecting-ip": "198.51.100.1" },
    });
    const second = new Request("https://example.test", {
      headers: { "cf-connecting-ip": "198.51.100.99" },
    });
    expect(enforceRateLimit(first, routeKey, { limit: 1, windowMs: 60_000 })).toBeNull();
    expect(enforceRateLimit(second, routeKey, { limit: 1, windowMs: 60_000 })?.status).toBe(429);
  });

  it("keeps trusting forwarding headers when TRUSTED_PROXY_HEADERS is unset or enabled", () => {
    vi.stubEnv("TRUSTED_PROXY_HEADERS", "");
    expect(
      getClientIp(
        new Request("https://example.test", { headers: { "cf-connecting-ip": "198.51.100.7" } }),
      ),
    ).toBe("198.51.100.7");

    vi.stubEnv("TRUSTED_PROXY_HEADERS", "true");
    expect(
      getClientIp(
        new Request("https://example.test", { headers: { "cf-connecting-ip": "198.51.100.8" } }),
      ),
    ).toBe("198.51.100.8");
  });
});
