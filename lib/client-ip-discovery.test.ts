import { describe, expect, it, vi } from "vitest";
import {
  discoverClientIp,
  getIpVersion,
  resolveDisplayIps,
  type IpDisplayInput,
} from "./client-ip-discovery";

function jsonResponse(body: unknown, ok = true) {
  return new Response(JSON.stringify(body), {
    status: ok ? 200 : 500,
    headers: { "content-type": "application/json" },
  });
}

function textResponse(body: string, ok = true) {
  return new Response(body, { status: ok ? 200 : 500 });
}

describe("client IP discovery", () => {
  it("uses ipify first when it returns a valid preferred IP", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ ip: "2001:db8::1" }));

    await expect(
      discoverClientIp({ preferredVersion: 6, fetchImpl }),
    ).resolves.toEqual({ ip: "2001:db8::1", version: 6, source: "ipify" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("falls back to AWS Check IP when ipify fails", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: "missing ip" }))
      .mockResolvedValueOnce(textResponse("2001:db8::2\n"));

    await expect(
      discoverClientIp({ preferredVersion: 6, fetchImpl }),
    ).resolves.toEqual({ ip: "2001:db8::2", version: 6, source: "aws-check-ip" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("returns null when all providers fail or return invalid values", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ ip: "not-an-ip" }))
      .mockResolvedValueOnce(textResponse("also-not-an-ip"));

    await expect(discoverClientIp({ fetchImpl })).resolves.toBeNull();
  });

  it("validates plausible IPv4 and IPv6 values", () => {
    expect(getIpVersion("203.0.113.7")).toBe(4);
    expect(getIpVersion("2001:db8::7")).toBe(6);
    expect(getIpVersion("999.0.0.1")).toBeNull();
    expect(getIpVersion("example.com")).toBeNull();
  });
});

describe("display IP fallback order", () => {
  const baseData: IpDisplayInput = { ipv4: null, ipv6: null };

  it("keeps the primary IPv4 result when present", () => {
    const display = resolveDisplayIps({
      ...baseData,
      ipv4: "198.51.100.10",
      localIpChecks: [{ ip: "198.51.100.11", source: "x-real-ip", version: 4 }],
    });

    expect(display.ipv4).toEqual({
      ip: "198.51.100.10",
      source: "api-ip-primary",
      isFallback: false,
    });
  });

  it("uses local IPv4 checks before external provider fallbacks", () => {
    const display = resolveDisplayIps(
      {
        ...baseData,
        localIpChecks: [{ ip: "198.51.100.12", source: "x-forwarded-for[1]", version: 4 }],
      },
      { ip: "198.51.100.13", version: 4, source: "aws-check-ip" },
    );

    expect(display.ipv4).toEqual({
      ip: "198.51.100.12",
      source: "x-forwarded-for[1]",
      isFallback: true,
    });
  });

  it("uses a valid external IPv4 only when no primary or local IPv4 exists", () => {
    const display = resolveDisplayIps(
      baseData,
      { ip: "198.51.100.14", version: 4, source: "aws-check-ip" },
    );

    expect(display.ipv4).toEqual({
      ip: "198.51.100.14",
      source: "aws-check-ip",
      isFallback: true,
    });
  });
});
