import { describe, expect, it } from "vitest";
import {
  abuseIpDbEvidence,
  greyNoiseEvidence,
  normalizeAbuseIpDbPayload,
  normalizeBlocklistDeCounts,
  normalizeGreyNoisePayload,
  normalizeThreatFoxPayload,
  threatFoxEvidence,
} from "./providers";

const NOW_MS = Date.parse("2026-09-02T17:00:00.000Z");

describe("GreyNoise community normalization", () => {
  it("normalizes the community payload", () => {
    expect(
      normalizeGreyNoisePayload({
        ip: "185.93.89.118",
        noise: true,
        riot: false,
        classification: "malicious",
        name: "unknown",
        link: "https://viz.greynoise.io/ip/185.93.89.118",
        last_seen: "2026-09-01",
        message: "Success",
      }),
    ).toEqual({
      noise: true,
      riot: false,
      classification: "malicious",
      name: "unknown",
      lastSeen: "2026-09-01",
    });

    expect(normalizeGreyNoisePayload("nope")).toBeNull();
  });

  it("maps a malicious scanner to scanner evidence", () => {
    const result = greyNoiseEvidence(
      { noise: true, riot: false, classification: "malicious", name: null, lastSeen: "2026-09-01" },
      NOW_MS,
    );
    expect(result.status).toBe("matched");
    expect(result.evidence[0]).toEqual(
      expect.objectContaining({ category: "scanner", reason: "greynoise_scanner_malicious", weight: 20 }),
    );
  });

  it("keeps unknown scanners weak and benign scanners informational", () => {
    const unknown = greyNoiseEvidence(
      { noise: true, riot: false, classification: "unknown", name: null, lastSeen: null },
      NOW_MS,
    );
    expect(unknown.evidence[0]).toEqual(expect.objectContaining({ weight: 12, confidence: 55 }));

    const benign = greyNoiseEvidence(
      { noise: true, riot: false, classification: "benign", name: "Censys", lastSeen: "2026-08-01" },
      NOW_MS,
    );
    expect(benign.evidence[0]).toEqual(expect.objectContaining({ weight: 0, confidence: 80 }));
    expect(benign.status).toBe("policy_listed");
  });

  it("treats RIOT entries as context and no-record answers as clean", () => {
    const riot = greyNoiseEvidence(
      { noise: false, riot: true, classification: "benign", name: "Cloudflare", lastSeen: "2026-08-01" },
      NOW_MS,
    );
    expect(riot.status).toBe("policy_listed");
    expect(riot.evidence[0]).toEqual(
      expect.objectContaining({ category: "benign_service", weight: 0, detail: "RIOT: Cloudflare" }),
    );

    const clean = greyNoiseEvidence({ noise: false, riot: false, classification: null, name: null, lastSeen: null }, NOW_MS);
    expect(clean.status).toBe("clean");
  });
});

describe("AbuseIPDB normalization", () => {
  it("normalizes the check payload", () => {
    expect(
      normalizeAbuseIpDbPayload({
        data: { abuseConfidenceScore: 100, totalReports: 250, lastReportedAt: "2026-09-01T10:00:00Z", isTor: false },
      }),
    ).toEqual({ confidenceScore: 100, totalReports: 250, lastReportedAt: "2026-09-01T10:00:00Z", isTor: false });

    expect(normalizeAbuseIpDbPayload({ data: "nope" })).toBeNull();
  });

  it("scales evidence weight with the provider confidence score", () => {
    const high = abuseIpDbEvidence(
      { confidenceScore: 100, totalReports: 500, lastReportedAt: "2026-09-01T10:00:00Z", isTor: false },
      NOW_MS,
    );
    expect(high.evidence[0]).toEqual(
      expect.objectContaining({ category: "abuse_reported", weight: 45, confidence: 100, reportCount: 500 }),
    );

    const low = abuseIpDbEvidence(
      { confidenceScore: 10, totalReports: 2, lastReportedAt: "2026-08-01T10:00:00Z", isTor: false },
      NOW_MS,
    );
    expect(low.evidence[0]).toEqual(expect.objectContaining({ weight: 45, confidence: 10 }));
  });

  it("marks Tor exits as context without threat points", () => {
    const result = abuseIpDbEvidence(
      { confidenceScore: 0, totalReports: 0, lastReportedAt: null, isTor: true },
      NOW_MS,
    );
    expect(result.status).toBe("policy_listed");
    expect(result.evidence).toEqual([
      expect.objectContaining({ category: "tor", reason: "abuseipdb_tor", weight: 0 }),
    ]);
  });

  it("reports clean when there are no reports and no flags", () => {
    const result = abuseIpDbEvidence({ confidenceScore: 0, totalReports: 0, lastReportedAt: null, isTor: false }, NOW_MS);
    expect(result.status).toBe("clean");
    expect(result.evidence).toEqual([]);
  });
});

describe("ThreatFox normalization", () => {
  it("normalizes IOC search results", () => {
    const iocs = normalizeThreatFoxPayload({
      query_status: "ok",
      data: [
        {
          ioc: "185.93.89.118:443",
          threat_type: "botnet_cc",
          malware_family: "AsyncRAT",
          first_seen: "2026-08-30 08:04:00",
          last_seen: null,
          confidence_level: 75,
        },
      ],
    });

    expect(iocs).toEqual([
      {
        ioc: "185.93.89.118:443",
        threatType: "botnet_cc",
        malwareFamily: "AsyncRAT",
        firstSeen: "2026-08-30T08:04:00.000Z",
        lastSeen: null,
        confidenceLevel: 75,
      },
    ]);

    expect(normalizeThreatFoxPayload({ query_status: "no_result", data: [] })).toEqual([]);
    expect(normalizeThreatFoxPayload({ broken: true })).toBeNull();
  });

  it("maps botnet C2 IOCs to botnet evidence", () => {
    const result = threatFoxEvidence(
      [{ ioc: "1.2.3.4:443", threatType: "botnet_cc", malwareFamily: "Cobalt Strike", firstSeen: null, lastSeen: null, confidenceLevel: 100 }],
      NOW_MS,
    );
    expect(result.status).toBe("matched");
    expect(result.evidence[0]).toEqual(
      expect.objectContaining({ category: "botnet", reason: "threatfox_ioc", weight: 55, confidence: 100, malwareFamily: "Cobalt Strike" }),
    );

    expect(threatFoxEvidence([], NOW_MS).status).toBe("clean");
  });
});

describe("blocklist.de counts normalization", () => {
  it("accepts string counts from api.php", () => {
    expect(normalizeBlocklistDeCounts({ attacks: "12816", reports: "113" })).toEqual({ attacks: 12816, reports: 113 });
    expect(normalizeBlocklistDeCounts({ attacks: 5, reports: 1 })).toEqual({ attacks: 5, reports: 1 });
    expect(normalizeBlocklistDeCounts({ attacks: "abc" })).toBeNull();
    expect(normalizeBlocklistDeCounts(null)).toBeNull();
  });
});
