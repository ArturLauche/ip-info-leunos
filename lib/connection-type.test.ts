import { describe, expect, it } from "vitest";
import { assessProxyRisk, detectConnectionType } from "@/lib/connection-type";

const baseSignals = {
  isp: "",
  org: "",
  as: "",
  mobile: false,
  proxy: false,
  hosting: false,
};

describe("detectConnectionType", () => {
  it("prioritizes hosting over keyword matches", () => {
    expect(
      detectConnectionType({ ...baseSignals, hosting: true, isp: "Deutsche Glasfaser" }),
    ).toBe("datacenter");
  });

  it("maps proxy types to dedicated codes", () => {
    expect(detectConnectionType({ ...baseSignals, proxy: true, proxyType: "tor" })).toBe("tor");
    expect(detectConnectionType({ ...baseSignals, proxy: true, proxyType: "vpn" })).toBe("vpn");
    expect(detectConnectionType({ ...baseSignals, proxy: true, proxyType: "hosting-proxy" })).toBe("proxy");
    expect(detectConnectionType({ ...baseSignals, proxy: true })).toBe("proxy");
  });

  it("detects mobile before access-technology keywords", () => {
    expect(detectConnectionType({ ...baseSignals, mobile: true, isp: "Vodafone Kabel" })).toBe("mobile");
  });

  it("detects access technologies from provider keywords", () => {
    expect(detectConnectionType({ ...baseSignals, isp: "SpaceX Starlink" })).toBe("starlink");
    expect(detectConnectionType({ ...baseSignals, isp: "ViaSat Inc." })).toBe("satellite");
    expect(detectConnectionType({ ...baseSignals, isp: "Deutsche Glasfaser GmbH" })).toBe("fiber");
    expect(detectConnectionType({ ...baseSignals, org: "Comcast Cable Communications" })).toBe("cable");
    expect(detectConnectionType({ ...baseSignals, isp: "Regional WiMAX Provider" })).toBe("fixed_wireless");
    expect(detectConnectionType({ ...baseSignals, isp: "Telekom VDSL" })).toBe("dsl");
    expect(detectConnectionType({ ...baseSignals, org: "Acme MPLS Networks" })).toBe("business");
  });

  it("falls back to fixed for unrecognized providers", () => {
    expect(detectConnectionType({ ...baseSignals, isp: "Some Local Provider" })).toBe("fixed");
  });
});

describe("assessProxyRisk", () => {
  it("reports no proxy for plain residential providers", () => {
    const result = assessProxyRisk({ ...baseSignals, isp: "Deutsche Telekom AG" });
    expect(result.isProxy).toBe(false);
    expect(result.confidence).toBe("none");
  });

  it("flags Tor even when other signals are weak", () => {
    const result = assessProxyRisk({ ...baseSignals, org: "tor-exit-gateway" });
    expect(result.isProxy).toBe(true);
    expect(result.proxyType).toBe("tor");
  });

  it("combines upstream proxy flags with VPN signatures", () => {
    const result = assessProxyRisk({ ...baseSignals, proxy: true, isp: "NordVPN" });
    expect(result.isProxy).toBe(true);
    expect(result.proxyType).toBe("vpn");
    expect(result.confidence).toBe("high");
    expect(result.reasons).toContain("vpn-signature");
  });

  it("treats flagged hosting in a known datacenter as a hosting proxy", () => {
    const result = assessProxyRisk({ ...baseSignals, hosting: true, org: "Hetzner Online GmbH" });
    expect(result.proxyType).toBe("hosting-proxy");
    expect(result.isProxy).toBe(true);
  });

  it("reduces the score for mobile and residential signals", () => {
    const result = assessProxyRisk({ ...baseSignals, hosting: true, mobile: true });
    expect(result.isProxy).toBe(false);
    expect(result.reasons).toContain("residential-or-mobile-signal");
  });
});
