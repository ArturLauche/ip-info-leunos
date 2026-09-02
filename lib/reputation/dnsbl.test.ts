import { describe, expect, it } from "vitest";
import {
  freshnessFromTimestamp,
  interpretBarracudaResponse,
  interpretBlocklistDeResponse,
  interpretDroneblResponse,
  interpretHttpblResponse,
  interpretSpamcopResponse,
  interpretZenResponse,
  ipv6ToNibbleFormat,
  parseBlocklistDeTxt,
  reverseIpv4ForDnsbl,
} from "./dnsbl";

const NOW_MS = Date.parse("2026-09-02T17:00:00.000Z");

describe("DNSBL query encoding", () => {
  it("reverses IPv4 octets", () => {
    expect(reverseIpv4ForDnsbl("203.0.113.7")).toBe("7.113.0.203");
  });

  it("expands and reverses IPv6 nibbles", () => {
    expect(ipv6ToNibbleFormat("2001:db8::1")).toBe(
      "1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2",
    );
  });

  it("handles embedded IPv4 tails", () => {
    expect(ipv6ToNibbleFormat("::ffff:1.2.3.4")).toBe(
      "4.0.3.0.2.0.1.0.f.f.f.f.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0",
    );
  });

  it("rejects invalid input", () => {
    expect(ipv6ToNibbleFormat("not-an-ip")).toBeNull();
    expect(ipv6ToNibbleFormat("203.0.113.7")).toBeNull();
  });
});

describe("Spamhaus ZEN interpretation", () => {
  it("decodes SBL as observed spam with high confidence", () => {
    const result = interpretZenResponse(["127.0.0.2"]);
    expect(result.status).toBe("matched");
    expect(result.evidence).toEqual([
      expect.objectContaining({
        category: "spam_observed",
        reason: "sbl",
        weight: 30,
        confidence: 90,
        raw: "127.0.0.2",
      }),
    ]);
  });

  it("decodes CSS as weaker mail reputation", () => {
    const result = interpretZenResponse(["127.0.0.3"]);
    expect(result.status).toBe("matched");
    expect(result.evidence[0]).toEqual(
      expect.objectContaining({ category: "mail_reputation", reason: "css", weight: 14 }),
    );
  });

  it("decodes XBL as botnet evidence", () => {
    const result = interpretZenResponse(["127.0.0.4"]);
    expect(result.evidence[0]).toEqual(expect.objectContaining({ category: "botnet", reason: "xbl", weight: 40 }));
  });

  it("decodes DROP and BCL as high-weight malware infrastructure", () => {
    expect(interpretZenResponse(["127.0.0.9"]).evidence[0]).toEqual(
      expect.objectContaining({ category: "malware", weight: 65 }),
    );
    expect(interpretZenResponse(["127.0.0.30"]).evidence[0]).toEqual(
      expect.objectContaining({ category: "botnet", reason: "bcl", weight: 65 }),
    );
  });

  it("treats PBL answers as policy listings with zero weight", () => {
    for (const code of ["127.0.0.10", "127.0.0.11"]) {
      const result = interpretZenResponse([code]);
      expect(result.status).toBe("policy_listed");
      expect(result.evidence).toEqual([
        expect.objectContaining({ category: "mail_policy", weight: 0, raw: code }),
      ]);
    }
  });

  it("keeps a PBL answer visible alongside threat codes", () => {
    const result = interpretZenResponse(["127.0.0.2", "127.0.0.10"]);
    expect(result.status).toBe("matched");
    expect(result.evidence).toHaveLength(2);
    expect(result.evidence.map((item) => item.category)).toEqual(["spam_observed", "mail_policy"]);
  });

  it("maps Spamhaus error answers to explicit source states", () => {
    expect(interpretZenResponse(["127.255.255.254"]).status).toBe("resolver_blocked");
    expect(interpretZenResponse(["127.255.255.252"]).status).toBe("rate_limited");
    expect(interpretZenResponse(["127.255.255.255"]).status).toBe("unavailable");
  });

  it("does not trust non-127/8 answers", () => {
    expect(interpretZenResponse(["10.0.0.1"]).status).toBe("resolver_blocked");
    expect(interpretZenResponse([]).status).toBe("clean");
  });
});

describe("SpamCop and Barracuda interpretation", () => {
  it("classifies SpamCop listings as mail reputation", () => {
    const result = interpretSpamcopResponse(["127.0.0.2"]);
    expect(result.status).toBe("matched");
    expect(result.evidence[0]).toEqual(
      expect.objectContaining({ category: "mail_reputation", reason: "spamcop_listing", weight: 14 }),
    );
    expect(interpretSpamcopResponse([]).status).toBe("clean");
  });

  it("classifies Barracuda as weak, partly historical mail reputation", () => {
    const result = interpretBarracudaResponse(["127.0.0.2"]);
    expect(result.status).toBe("matched");
    expect(result.evidence[0]).toEqual(
      expect.objectContaining({ category: "mail_reputation", weight: 12, freshness: 0.85 }),
    );
    expect(interpretBarracudaResponse([]).status).toBe("clean");
  });
});

describe("DroneBL interpretation", () => {
  it("decodes the documented return codes into distinct categories", () => {
    expect(interpretDroneblResponse(["127.0.0.7"]).evidence[0]).toEqual(
      expect.objectContaining({ category: "ddos", reason: "dronebl_ddos_drone" }),
    );
    expect(interpretDroneblResponse(["127.0.0.8"]).evidence[0]).toEqual(
      expect.objectContaining({ category: "proxy", reason: "dronebl_open_socks_proxy", weight: 10 }),
    );
    expect(interpretDroneblResponse(["127.0.0.13"]).evidence[0]).toEqual(
      expect.objectContaining({ category: "bruteforce", reason: "dronebl_dictionary" }),
    );
    expect(interpretDroneblResponse(["127.0.0.15"]).evidence[0]).toEqual(
      expect.objectContaining({ category: "malware", reason: "dronebl_compromised_router" }),
    );
    expect(interpretDroneblResponse(["127.0.0.255"]).evidence[0]).toEqual(
      expect.objectContaining({ category: "abuse_reported", reason: "dronebl_uncategorized" }),
    );
  });

  it("ignores the testing code and empty answers", () => {
    expect(interpretDroneblResponse(["127.0.0.1"]).status).toBe("clean");
    expect(interpretDroneblResponse([]).status).toBe("clean");
  });
});

describe("blocklist.de interpretation", () => {
  const txt = ["Infected System (Service: sasl, Last-Attack: 1788355802), see http://www.blocklist.de/en/view.html?ip=185.93.89.118"];

  it("decodes the attacked service, recency and report counts", () => {
    const result = interpretBlocklistDeResponse(
      ["127.0.0.13"],
      txt,
      NOW_MS,
      { attacks: 12816, reports: 113 },
    );

    expect(result.status).toBe("matched");
    expect(result.evidence).toEqual([
      expect.objectContaining({
        category: "bruteforce",
        reason: "bld_attack",
        weight: 25,
        detail: "Service: sasl",
        reportCount: 113,
        attackCount: 12816,
        lastSeen: new Date(1788355802000).toISOString(),
        raw: "127.0.0.13",
      }),
    ]);
  });

  it("falls back to the service name encoded in the return code", () => {
    const result = interpretBlocklistDeResponse(["127.0.0.14"], [], NOW_MS, null);
    expect(result.evidence[0]).toEqual(expect.objectContaining({ detail: "Service: ssh" }));
  });

  it("reports historical counts when only the HTTP API has data", () => {
    const result = interpretBlocklistDeResponse([], null, NOW_MS, { attacks: 40, reports: 3 });
    expect(result.status).toBe("matched");
    expect(result.evidence[0]).toEqual(
      expect.objectContaining({ category: "abuse_reported", reason: "bld_counts_only", reportCount: 3 }),
    );
  });

  it("treats no DNS answer and no counts as clean", () => {
    expect(interpretBlocklistDeResponse([], null, NOW_MS, null).status).toBe("clean");
    expect(interpretBlocklistDeResponse([], null, NOW_MS, { attacks: 0, reports: 0 }).status).toBe("clean");
  });

  it("extracts service and last-attack from the TXT answer", () => {
    expect(parseBlocklistDeTxt(txt)).toEqual({
      service: "sasl",
      lastAttackAt: new Date(1788355802000).toISOString(),
    });
    expect(parseBlocklistDeTxt(null)).toEqual({ service: null, lastAttackAt: null });
  });
});

describe("freshness and http:BL interpretation", () => {
  it("decays freshness with age", () => {
    expect(freshnessFromTimestamp(null, NOW_MS)).toBe(0.5);
    expect(freshnessFromTimestamp(NOW_MS - 86_400_000, NOW_MS)).toBe(1);
    expect(freshnessFromTimestamp(NOW_MS - 20 * 86_400_000, NOW_MS)).toBe(0.85);
    expect(freshnessFromTimestamp(NOW_MS - 40 * 86_400_000, NOW_MS)).toBe(0.6);
    expect(freshnessFromTimestamp(NOW_MS - 100 * 86_400_000, NOW_MS)).toBe(0.4);
    expect(freshnessFromTimestamp(NOW_MS - 400 * 86_400_000, NOW_MS)).toBe(0.25);
  });

  it("decodes http:BL answer bytes into visitor types", () => {
    const result = interpretHttpblResponse(["127.1.100.6"], NOW_MS);
    expect(result.status).toBe("matched");
    expect(result.evidence.map((item) => item.reason)).toEqual(["httpbl_harvester", "httpbl_comment_spammer"]);
    expect(result.evidence[0]).toEqual(
      expect.objectContaining({ category: "spam_observed", weight: 15, lastSeen: new Date(NOW_MS - 86_400_000).toISOString() }),
    );
  });

  it("scales suspicious visitors down and marks search engines as context", () => {
    const suspicious = interpretHttpblResponse(["127.5.50.1"], NOW_MS);
    expect(suspicious.evidence[0]).toEqual(
      expect.objectContaining({ category: "scanner", reason: "httpbl_suspicious", weight: 5 }),
    );

    const searchEngine = interpretHttpblResponse(["127.0.9.0"], NOW_MS);
    expect(searchEngine.status).toBe("policy_listed");
    expect(searchEngine.evidence[0]).toEqual(
      expect.objectContaining({ category: "benign_service", weight: 0 }),
    );
  });

  it("treats no answer as clean", () => {
    expect(interpretHttpblResponse([], NOW_MS).status).toBe("clean");
  });
});
