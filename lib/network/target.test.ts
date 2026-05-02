import { describe, expect, it } from "vitest";
import {
  assertPublicIpAddress,
  assertPublicTarget,
  normalizeLookupTarget,
  TargetValidationError,
} from "./target";

describe("network target validation", () => {
  it("normalizes URLs, domains, IPv4, and bracketed IPv6", () => {
    expect(normalizeLookupTarget("https://Example.COM:443/path?q=1")).toBe("example.com");
    expect(normalizeLookupTarget("example.com/path")).toBe("example.com");
    expect(normalizeLookupTarget("1.1.1.1")).toBe("1.1.1.1");
    expect(normalizeLookupTarget("[2606:4700:4700::1111]")).toBe("2606:4700:4700::1111");
  });

  it("blocks local and internal hostnames", async () => {
    await expect(assertPublicTarget("localhost")).rejects.toMatchObject({
      code: "target_blocked",
    } satisfies Partial<TargetValidationError>);
    await expect(assertPublicTarget("router.local")).rejects.toMatchObject({
      code: "target_blocked",
    } satisfies Partial<TargetValidationError>);
  });

  it("blocks private, local, reserved, documentation, and metadata IPv4 ranges", () => {
    for (const address of [
      "127.0.0.1",
      "10.0.0.1",
      "172.16.0.1",
      "192.168.1.1",
      "169.254.169.254",
      "192.0.2.1",
      "198.51.100.1",
      "203.0.113.1",
    ]) {
      expect(() => assertPublicIpAddress(address), address).toThrow(TargetValidationError);
    }
  });

  it("blocks private and reserved IPv6 ranges", () => {
    for (const address of ["::1", "fc00::1", "fe80::1", "2001:db8::1"]) {
      expect(() => assertPublicIpAddress(address), address).toThrow(TargetValidationError);
    }
  });

  it("allows known public resolver addresses", async () => {
    expect(() => assertPublicIpAddress("1.1.1.1")).not.toThrow();
    expect(() => assertPublicIpAddress("2606:4700:4700::1111")).not.toThrow();
    await expect(assertPublicTarget("1.1.1.1")).resolves.toMatchObject({
      hostname: "1.1.1.1",
      addresses: ["1.1.1.1"],
    });
  });
});
