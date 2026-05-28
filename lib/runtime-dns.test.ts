import { describe, expect, it } from "vitest";
import {
  buildRuntimeDnsScan,
  classifyResolverScope,
  inspectRuntimeResolver,
  normalizeResolverAddress,
} from "./runtime-dns";

describe("runtime DNS resolver inspection", () => {
  it("normalizes resolver addresses with custom ports and IPv6 zone ids", () => {
    expect(normalizeResolverAddress("8.8.8.8:1053")).toBe("8.8.8.8");
    expect(normalizeResolverAddress("[2001:4860:4860::8888]:1053")).toBe(
      "2001:4860:4860::8888",
    );
    expect(normalizeResolverAddress("fe80::1%eth0")).toBe("fe80::1");
  });

  it("classifies private, loopback, link-local, and public resolver scopes", () => {
    expect(classifyResolverScope("172.28.28.3")).toBe("private");
    expect(classifyResolverScope("127.0.0.1")).toBe("loopback");
    expect(classifyResolverScope("fe80::1")).toBe("link-local");
    expect(classifyResolverScope("2606:4700:4700::1111")).toBe("public");
  });

  it("does not assign a medium privacy score to private runtime resolvers", () => {
    const resolver = inspectRuntimeResolver("172.28.28.3");

    expect(resolver).toMatchObject({
      address: "172.28.28.3",
      provider: "Private/network runtime resolver",
      privacy: "unknown",
      networkScope: "private",
      known: false,
    });
  });

  it("recognizes known IPv6 public resolvers", () => {
    expect(inspectRuntimeResolver("[2606:4700:4700::1111]:53")).toMatchObject({
      address: "2606:4700:4700::1111",
      provider: "Cloudflare",
      privacy: "high",
      networkScope: "public",
      known: true,
    });
  });

  it("returns a nullable privacy score when resolver providers cannot be known", () => {
    const scan = buildRuntimeDnsScan(["172.28.28.3"], new Date("2026-05-28T00:00:00.000Z"));

    expect(scan).toMatchObject({
      checkedAt: "2026-05-28T00:00:00.000Z",
      leakTestComparable: false,
      privacyScore: null,
      scoreReason: "unscored-unknown-resolvers",
      knownResolverCount: 0,
      unknownResolverCount: 1,
    });
  });

  it("scores only fully profiled resolver lists", () => {
    const scan = buildRuntimeDnsScan(["1.1.1.1", "8.8.8.8"], new Date("2026-05-28T00:00:00.000Z"));

    expect(scan).toMatchObject({
      privacyScore: 83,
      scoreReason: "all-resolvers-profiled",
      knownResolverCount: 2,
      unknownResolverCount: 0,
    });
  });
});
