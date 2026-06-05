import { describe, expect, it, vi } from "vitest";
import dns from "node:dns/promises";
import { isPublicIpAddress, resolvePublicIp } from "./ip-validation";

describe("isPublicIpAddress", () => {
  it("accepts public IPv4", () => {
    const result = isPublicIpAddress("1.1.1.1");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.address).toBe("1.1.1.1");
  });

  it("accepts public IPv6", () => {
    const result = isPublicIpAddress("2606:4700:4700::1111");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.address).toBe("2606:4700:4700::1111");
  });

  it("rejects loopback", () => {
    const result = isPublicIpAddress("127.0.0.1");
    expect(result.ok).toBe(false);
  });

  it("rejects private IPv4", () => {
    expect(isPublicIpAddress("10.0.0.1").ok).toBe(false);
    expect(isPublicIpAddress("192.168.1.1").ok).toBe(false);
    expect(isPublicIpAddress("172.16.0.1").ok).toBe(false);
  });

  it("rejects private IPv6", () => {
    expect(isPublicIpAddress("::1").ok).toBe(false);
    expect(isPublicIpAddress("fc00::1").ok).toBe(false);
  });

  it("rejects domain names", () => {
    const result = isPublicIpAddress("example.com");
    expect(result.ok).toBe(false);
  });

  it("normalizes bracketed IPv6", () => {
    const result = isPublicIpAddress("[2606:4700::1111]");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.address).toBe("2606:4700::1111");
  });
});

describe("resolvePublicIp", () => {
  it("resolves domains to first public IP", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValueOnce([
      { address: "1.1.1.1", family: 4 },
    ] as never);

    const result = await resolvePublicIp("example.com");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ip).toBe("1.1.1.1");
      expect(result.hostname).toBe("example.com");
    }
  });

  it("rejects domains resolving only to private IPs", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValueOnce([
      { address: "192.168.1.1", family: 4 },
      { address: "10.0.0.2", family: 4 },
    ] as never);

    const result = await resolvePublicIp("private.example");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("target_blocked");
  });

  it("rejects domains with no resolution", async () => {
    vi.spyOn(dns, "lookup").mockRejectedValueOnce(new Error("ENOTFOUND"));

    const result = await resolvePublicIp("nxdomain.example");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("network_error");
  });
});
