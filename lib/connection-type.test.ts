import { describe, expect, it } from "vitest";
import {
  assessConnectionType,
  assessLocalProxyHints,
  assessNetworkProxyHints,
  assessProxyRisk,
  createProxyHintAssessment,
  detectConnectionType,
  mergeProxyHintAssessments,
  type BrowserDeviceHints,
  type LocalProxyHintIpData,
} from "@/lib/connection-type";

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

describe("assessConnectionType", () => {
  const telekom = { ...baseSignals, isp: "Deutsche Telekom AG", org: "Deutsche Telekom AG" };

  it("reports provider short-circuits with high confidence", () => {
    expect(
      assessConnectionType({ ...baseSignals, hosting: true, reverse: "ftth-1-2-3-4.example.net" }),
    ).toEqual({ connectionType: "datacenter", confidence: "high", evidence: ["provider-hosting"] });
    expect(
      assessConnectionType({ ...baseSignals, proxy: true, proxyType: "vpn" }),
    ).toEqual({ connectionType: "vpn", confidence: "high", evidence: ["provider-proxy"] });
    expect(
      assessConnectionType({ ...baseSignals, mobile: true, reverse: "c-1-2-3-4.hsd1.example.net" }),
    ).toEqual({ connectionType: "mobile", confidence: "high", evidence: ["provider-mobile"] });
  });

  it("reads the medium from a DSL PTR label, not from the operator", () => {
    const result = assessConnectionType({
      ...telekom,
      reverse: "dslb-088-076-001-002.pool.example.net",
    });
    expect(result.connectionType).toBe("dsl");
    expect(result.confidence).toBe("high");
    expect(result.evidence).toContain("ptr-dsl");
  });

  it("keeps a dynamic pool without a technology token as fixed", () => {
    const result = assessConnectionType({ ...telekom, reverse: "p4FD8E8E8.dip0.t-ipconnect.de" });
    expect(result).toEqual({
      connectionType: "fixed",
      confidence: "low",
      evidence: ["unspecified-fixed"],
    });
  });

  it("detects cable from PTR labels", () => {
    expect(
      detectConnectionType({ ...baseSignals, reverse: "ip-1-2-3-4.pool.kabel.example.net" }),
    ).toBe("cable");

    const comcast = assessConnectionType({
      ...baseSignals,
      isp: "Comcast Cable Communications",
      reverse: "customer.hsd1.ca.comcast.net",
    });
    expect(comcast.connectionType).toBe("cable");
    expect(comcast.evidence).toEqual(["ptr-cable", "name-cable"]);

    const unbranded = assessConnectionType({
      ...baseSignals,
      isp: "Example Networks",
      reverse: "c-1-2-3-4.hsd1.example.net",
    });
    expect(unbranded).toEqual({ connectionType: "cable", confidence: "high", evidence: ["ptr-cable"] });
  });

  it("keeps technology-named providers and falls back to low-confidence fixed", () => {
    expect(assessConnectionType({ ...baseSignals, isp: "Deutsche Glasfaser GmbH" })).toEqual({
      connectionType: "fiber",
      confidence: "high",
      evidence: ["name-fiber"],
    });
    expect(detectConnectionType({ ...baseSignals, isp: "Telekom VDSL" })).toBe("dsl");
    expect(assessConnectionType({ ...baseSignals, isp: "Some Local Provider" })).toMatchObject({
      connectionType: "fixed",
      confidence: "low",
    });
  });

  it("does not infer a medium from a mixed operator brand", () => {
    for (const isp of ["Vodafone GmbH", "Comcast", "AT&T Services", "BT", "Telefonica", "Verizon"]) {
      expect(detectConnectionType({ ...baseSignals, isp })).toBe("fixed");
    }
  });

  it("matches tokens on word and label boundaries only", () => {
    expect(detectConnectionType({ ...baseSignals, isp: "Media Company" })).toBe("fixed");
    expect(detectConnectionType({ ...baseSignals, reverse: "host.nocable.example.net" })).toBe("fixed");
    expect(detectConnectionType({ ...baseSignals, reverse: "fiberoptic-host.example.net" })).toBe("fixed");
    expect(detectConnectionType({ ...baseSignals, reverse: "vdsl2-1-2-3-4.example.net" })).toBe("dsl");
  });

  it("lowers confidence and records both codes when strong tokens disagree", () => {
    const result = assessConnectionType({
      ...baseSignals,
      isp: "Example Kabel GmbH",
      reverse: "ftth-1-2-3-4.example.net",
    });
    expect(result).toEqual({
      connectionType: "fiber",
      confidence: "medium",
      evidence: ["ptr-fiber", "name-cable"],
    });
  });

  it("accepts a mobile label only from PTR or AS name, below fixed media", () => {
    expect(
      assessConnectionType({ ...baseSignals, isp: "Example Telecom", reverse: "1-2-3-4.lte.example.net" }),
    ).toEqual({ connectionType: "mobile", confidence: "medium", evidence: ["ptr-mobile"] });
    expect(
      assessConnectionType({ ...baseSignals, isp: "Example Telecom", asname: "EXAMPLE-MOBILE-AS" }),
    ).toMatchObject({ connectionType: "mobile", evidence: ["name-mobile"] });
    expect(detectConnectionType({ ...baseSignals, isp: "T-Mobile US" })).toBe("fixed");
    expect(
      assessConnectionType({ ...baseSignals, reverse: "1-2-3-4.lte.ftth.example.net" }),
    ).toMatchObject({ connectionType: "fiber", confidence: "medium" });
  });

  it("treats FTTC as DSL and CGNAT as no medium", () => {
    expect(detectConnectionType({ ...baseSignals, reverse: "fttc-1-2-3-4.example.net" })).toBe("dsl");
    expect(assessConnectionType({ ...baseSignals, reverse: "cgnat-1-2-3-4.example.net" })).toMatchObject({
      connectionType: "fixed",
      confidence: "low",
    });
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

describe("additional proxy hints", () => {
  const ipData: LocalProxyHintIpData = {
    isp: "Example ISP",
    org: "Example Network",
    as: "AS64500 Example",
    asname: "EXAMPLE",
    reverse: "customer.example.net",
    timezone: "UTC",
    countryCode: "US",
    mobile: false,
    hosting: false,
    connectionType: "fixed",
  };

  const deviceHints: BrowserDeviceHints = {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    platform: "Win32",
    language: "en-US",
    languages: ["en-US", "en"],
    hardwareConcurrency: 8,
    deviceMemory: 8,
    maxTouchPoints: 0,
    webdriver: false,
    timeZone: "UTC",
    timezoneOffsetMinutes: 0,
    screen: { width: 1920, height: 1080, colorDepth: 24 },
    connection: { type: "ethernet", effectiveType: "4g", downlink: 100, rtt: 20 },
  };

  it("does not treat school or company ownership alone as a proxy hint", () => {
    const school = assessNetworkProxyHints({
      isp: "Regional ISP",
      org: "Example University",
      as: "AS64500",
    });
    const company = assessNetworkProxyHints({
      isp: "Regional ISP",
      org: "Example Company",
      as: "AS64501",
    });

    expect(school).toMatchObject({ detected: false, confidence: "none" });
    expect(company).toMatchObject({ detected: false, confidence: "none" });
  });

  it("uses institutional context only when a gateway signature is also present", () => {
    const result = assessNetworkProxyHints({
      isp: "Regional ISP",
      org: "Example University Secure Web Gateway",
      as: "AS64500",
    });

    expect(result).toMatchObject({
      detected: true,
      confidence: "low",
      category: "school-proxy",
    });
    expect(result.reasons).toEqual(
      expect.arrayContaining(["school-network-context", "network-proxy-signature"]),
    );
  });

  it("keeps individual local mismatches below the display threshold", () => {
    const timezoneOnly = assessLocalProxyHints(
      { ...ipData, timezone: "Europe/Berlin", countryCode: "DE" },
      { ...deviceHints, language: "de-DE", languages: ["de-DE"] },
      new Date("2026-01-15T12:00:00Z"),
    );
    const languageOnly = assessLocalProxyHints(
      { ...ipData, countryCode: "DE" },
      { ...deviceHints, language: "en-US", languages: ["en-US"] },
    );
    const automationOnly = assessLocalProxyHints(ipData, {
      ...deviceHints,
      webdriver: true,
    });

    expect(timezoneOnly).toMatchObject({ detected: false, confidence: "none" });
    expect(languageOnly).toMatchObject({ detected: false, confidence: "none" });
    expect(automationOnly).toMatchObject({ detected: false, confidence: "none" });
  });

  it("combines weak local signals without over-counting them", () => {
    const result = assessLocalProxyHints(
      { ...ipData, timezone: "Europe/Berlin", countryCode: "DE" },
      {
        ...deviceHints,
        language: "en-US",
        languages: ["en-US"],
        webdriver: true,
      },
      new Date("2026-01-15T12:00:00Z"),
    );

    expect(result).toMatchObject({ detected: true, confidence: "low", category: "unknown" });
  });

  it("deduplicates reasons when server and local assessments are merged", () => {
    const first = createProxyHintAssessment({
      reasons: ["explicit-proxy-header"],
      labels: ["via-header"],
    });
    const duplicate = createProxyHintAssessment({
      reasons: ["explicit-proxy-header"],
      labels: ["via-header"],
    });

    expect(mergeProxyHintAssessments(first, duplicate)).toMatchObject({
      detected: true,
      confidence: "low",
      category: "transparent-proxy",
      reasons: ["explicit-proxy-header"],
    });
  });

  it("raises combined server evidence to medium or high at the defined thresholds", () => {
    const schoolContext = assessNetworkProxyHints({
      isp: "Regional ISP",
      org: "Example School District",
      as: "AS64500",
    });
    const viaHeader = createProxyHintAssessment({
      reasons: ["explicit-proxy-header"],
      labels: ["via-header"],
    });
    const productHeader = createProxyHintAssessment({
      reasons: ["enterprise-product-header", "explicit-proxy-header"],
      labels: ["product-header:zscaler", "via-header"],
    });

    expect(mergeProxyHintAssessments(schoolContext, viaHeader)).toMatchObject({
      confidence: "medium",
      category: "school-proxy",
    });
    expect(productHeader).toMatchObject({ confidence: "high", category: "security-gateway" });
  });
});
