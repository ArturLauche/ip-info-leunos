import { describe, expect, it } from "vitest";

import { buildActionTargets, classifyQuery, matchesQuery } from "./command";

describe("classifyQuery", () => {
  it("detects IPv4 addresses", () => {
    expect(classifyQuery("8.8.8.8")).toEqual({ kind: "ipv4", value: "8.8.8.8" });
  });

  it("does not treat an out-of-range IPv4 as an address", () => {
    expect(classifyQuery("999.1.1.1").kind).not.toBe("ipv4");
  });

  it("detects IPv6 addresses and lower-cases them", () => {
    expect(classifyQuery("2001:4860:4860::8888")).toEqual({
      kind: "ipv6",
      value: "2001:4860:4860::8888",
    });
    expect(classifyQuery("FE80::1")).toEqual({ kind: "ipv6", value: "fe80::1" });
  });

  it("does not treat a clock time as IPv6", () => {
    expect(classifyQuery("12:30:45").kind).not.toBe("ipv6");
  });

  it("detects AS-prefixed, spaced, and bare ASNs", () => {
    expect(classifyQuery("AS8881")).toEqual({ kind: "asn", value: "AS8881" });
    expect(classifyQuery("as 8881")).toEqual({ kind: "asn", value: "AS8881" });
    expect(classifyQuery("8881")).toEqual({ kind: "asn", value: "AS8881" });
  });

  it("detects domains case-insensitively", () => {
    expect(classifyQuery("Example.COM")).toEqual({ kind: "domain", value: "example.com" });
  });

  it("extracts the host from a URL", () => {
    expect(classifyQuery("https://example.com/path?x=1")).toEqual({
      kind: "domain",
      value: "example.com",
    });
  });

  it("falls back to free text for unrecognized input", () => {
    expect(classifyQuery("ping tester").kind).toBe("text");
  });

  it("treats blank input as empty", () => {
    expect(classifyQuery("   ")).toEqual({ kind: "empty", value: "" });
  });
});

describe("buildActionTargets", () => {
  it("suggests IP-oriented tools for an IPv4 address", () => {
    const targets = buildActionTargets(classifyQuery("8.8.8.8"));
    expect(targets.map((target) => target.tool)).toEqual([
      "check",
      "reputation",
      "dns",
      "whois",
    ]);
    expect(targets[0].href).toBe("/check?q=8.8.8.8");
    expect(targets[1].href).toBe("/reputation?ip=8.8.8.8");
  });

  it("suggests domain-oriented tools for a domain", () => {
    const targets = buildActionTargets(classifyQuery("example.com"));
    expect(targets.map((target) => target.tool)).toEqual([
      "check",
      "dns",
      "whois",
      "cdn",
      "ping",
    ]);
  });

  it("suggests the ASN tool for an ASN", () => {
    expect(buildActionTargets(classifyQuery("AS8881"))).toEqual([
      { tool: "asn", href: "/asn?q=AS8881" },
    ]);
  });

  it("returns no actions for free text", () => {
    expect(buildActionTargets(classifyQuery("hello world"))).toEqual([]);
  });

  it("url-encodes the deep-linked value", () => {
    const [first] = buildActionTargets(classifyQuery("2001:4860:4860::8888"));
    expect(first.href).toBe(`/check?q=${encodeURIComponent("2001:4860:4860::8888")}`);
  });
});

describe("matchesQuery", () => {
  it("matches when every term is present", () => {
    expect(matchesQuery("DNS Lookup tool", "dns lookup")).toBe(true);
  });

  it("fails when a term is missing", () => {
    expect(matchesQuery("DNS Lookup", "whois")).toBe(false);
  });

  it("matches everything for an empty query", () => {
    expect(matchesQuery("anything", "")).toBe(true);
  });
});
