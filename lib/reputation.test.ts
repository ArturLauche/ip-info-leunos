import { describe, expect, it } from "vitest";
import {
  aggregateReputation,
  calculateReputationScore,
  decodeBarracuda,
  decodeBlocklistDe,
  decodeDroneBl,
  decodeHoneyPot,
  decodeSpamCop,
  decodeSpamhausZen,
  interpretDnsblResponse,
  ipv6ToNibbleFormat,
  reverseIpv4ForDnsbl,
  type BlacklistStatus,
  type EvidenceItem,
  type NetworkContext,
  type ProviderSourceResult,
} from "./reputation";

function blacklist(partial: Partial<BlacklistStatus>): BlacklistStatus {
  return {
    id: "test",
    name: "Test",
    listed: false,
    checked: true,
    categories: [],
    ...partial,
  };
}

const defaultResidentialContext: NetworkContext = {
  type: "residential",
  isResidential: true,
  isHosting: false,
  isMobile: false,
  isProxy: false,
  isVpn: false,
  isTor: false,
  isp: "Deutsche Telekom AG",
  org: "Telekom Deutschland",
  as: "AS3320",
  asname: "DTAG",
};

const defaultHostingContext: NetworkContext = {
  type: "hosting",
  isResidential: false,
  isHosting: true,
  isMobile: false,
  isProxy: false,
  isVpn: false,
  isTor: false,
  isp: "Hetzner Online GmbH",
  org: "Hetzner Online GmbH",
  as: "AS24940",
  asname: "HETZNER",
};

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

describe("DNSBL response interpretation (legacy)", () => {
  it("classifies Spamhaus SBL answers as spam sources", () => {
    const result = interpretDnsblResponse("zen.spamhaus.org", ["127.0.0.2"]);
    expect(result).toEqual({ listed: true, blocked: false, categories: ["spam_source"] });
  });

  it("classifies Spamhaus XBL answers as botnet activity", () => {
    const result = interpretDnsblResponse("zen.spamhaus.org", ["127.0.0.4"]);
    expect(result).toEqual({ listed: true, blocked: false, categories: ["botnet"] });
  });

  it("does not treat PBL-only answers as listings", () => {
    const result = interpretDnsblResponse("zen.spamhaus.org", ["127.0.0.10"]);
    expect(result.listed).toBe(false);
    expect(result.blocked).toBe(false);
  });

  it("detects blocked Spamhaus queries", () => {
    const result = interpretDnsblResponse("zen.spamhaus.org", ["127.255.255.254"]);
    expect(result.listed).toBe(false);
    expect(result.blocked).toBe(true);
  });

  it("treats any 127/8 answer from generic zones as a listing", () => {
    const result = interpretDnsblResponse("bl.spamcop.net", ["127.0.0.2"]);
    expect(result).toEqual({ listed: true, blocked: false, categories: ["spam_source"] });
  });

  it("does not trust non-127/8 answers", () => {
    const result = interpretDnsblResponse("bl.spamcop.net", ["10.0.0.1"]);
    expect(result.listed).toBe(false);
    expect(result.blocked).toBe(true);
  });
});

describe("Spamhaus ZEN Decoder", () => {
  it("decodes SBL as direct spam source listing", () => {
    const res = decodeSpamhausZen(["127.0.0.2"]);
    expect(res.status).toBe("matched");
    expect(res.evidence[0].category).toBe("spam_observed");
    expect(res.evidence[0].severity).toBe("high");
  });

  it("decodes XBL as botnet / exploit listing", () => {
    const res = decodeSpamhausZen(["127.0.0.4"]);
    expect(res.status).toBe("matched");
    expect(res.evidence[0].category).toBe("botnet");
    expect(res.evidence[0].severity).toBe("high");
  });

  it("decodes PBL as a zero-threat policy listing", () => {
    const res = decodeSpamhausZen(["127.0.0.10"]);
    expect(res.status).toBe("policy_listed");
    expect(res.evidence[0].category).toBe("mail_policy");
    expect(res.evidence[0].isPolicy).toBe(true);
    expect(res.evidence[0].severity).toBe("info");
  });

  it("detects public DNS resolver rate-limiting / blocking (127.255.255.254)", () => {
    const res = decodeSpamhausZen(["127.255.255.254"]);
    expect(res.status).toBe("resolver_blocked");
    expect(res.evidence).toHaveLength(0);
  });

  it("handles clean non-listed results", () => {
    const res = decodeSpamhausZen([]);
    expect(res.status).toBe("clean");
    expect(res.evidence).toHaveLength(0);
  });
});

describe("SpamCop Decoder", () => {
  it("decodes active listing", () => {
    const res = decodeSpamCop(["127.0.0.2"]);
    expect(res.status).toBe("matched");
    expect(res.evidence[0].category).toBe("mail_reputation");
    expect(res.evidence[0].severity).toBe("medium");
  });

  it("handles clean result", () => {
    const res = decodeSpamCop([]);
    expect(res.status).toBe("clean");
  });
});

describe("Barracuda BRBL Decoder", () => {
  it("decodes active listing", () => {
    const res = decodeBarracuda(["127.0.0.2"]);
    expect(res.status).toBe("matched");
    expect(res.evidence[0].category).toBe("mail_reputation");
  });

  it("handles clean result", () => {
    const res = decodeBarracuda([]);
    expect(res.status).toBe("clean");
  });
});

describe("DroneBL Decoder", () => {
  it("decodes IRC drone (code 3) as botnet evidence", () => {
    const res = decodeDroneBl(["127.0.0.3"]);
    expect(res.status).toBe("matched");
    expect(res.evidence[0].category).toBe("botnet");
  });

  it("decodes spambot (code 6) as spam observed", () => {
    const res = decodeDroneBl(["127.0.0.6"]);
    expect(res.status).toBe("matched");
    expect(res.evidence[0].category).toBe("spam_observed");
  });

  it("decodes open proxy (code 10)", () => {
    const res = decodeDroneBl(["127.0.0.10"]);
    expect(res.status).toBe("matched");
    expect(res.evidence[0].category).toBe("proxy");
  });
});

describe("blocklist.de Decoder", () => {
  it("decodes SSH brute-force attacks", () => {
    const res = decodeBlocklistDe(["127.0.0.2"], { attacks: 15, reports: 3 });
    expect(res.status).toBe("matched");
    expect(res.evidence[0].category).toBe("bruteforce");
    expect(res.evidence[0].reportsCount).toBe(15);
  });

  it("decodes Postfix / Mail spam attacks", () => {
    const res = decodeBlocklistDe(["127.0.0.3"]);
    expect(res.status).toBe("matched");
    expect(res.evidence[0].category).toBe("mail_reputation");
  });
});

describe("Project Honey Pot Decoder", () => {
  it("decodes suspicious search harvester", () => {
    // 127. <days>. <threat score 45>. <type 3 = Harvester + Suspicious>
    const res = decodeHoneyPot(["127.5.45.3"]);
    expect(res.status).toBe("matched");
    expect(res.evidence[0].category).toBe("scanner");
    expect(res.evidence[0].confidence).toBe(45);
  });

  it("decodes search engine crawler as clean", () => {
    // 127.1.1.0 -> search engine
    const res = decodeHoneyPot(["127.1.1.0"]);
    expect(res.status).toBe("clean");
  });
});

describe("Evidence-Based Scoring Engine (calculateReputationScore)", () => {
  it("scores a residential IP on Spamhaus PBL as 0 threat risk", () => {
    const pblEvidence: EvidenceItem[] = [
      {
        id: "spamhaus-pbl",
        sourceId: "spamhaus-zen",
        sourceName: "Spamhaus PBL",
        category: "mail_policy",
        severity: "info",
        isPolicy: true,
        title: "Spamhaus PBL: End-User Dynamic IP",
        summary: "Policy listing designating residential broadband range.",
      },
    ];

    const sources: ProviderSourceResult[] = [
      {
        id: "spamhaus-zen",
        name: "Spamhaus ZEN",
        type: "dnsbl",
        status: "policy_listed",
        supportsIpv6: true,
        evidence: pblEvidence,
      },
      {
        id: "spamcop",
        name: "SpamCop",
        type: "dnsbl",
        status: "clean",
        supportsIpv6: false,
        evidence: [],
      },
    ];

    const result = calculateReputationScore(pblEvidence, sources, defaultResidentialContext);

    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.verdictTitle).toContain("No malicious activity");
  });

  it("scores active botnet C2 (Feodo Tracker) as high/critical threat", () => {
    const c2Evidence: EvidenceItem[] = [
      {
        id: "feodo-c2",
        sourceId: "feodo-tracker",
        sourceName: "Feodo Tracker",
        category: "botnet",
        severity: "critical",
        title: "Feodo Tracker: QakBot C2",
        summary: "Confirmed active botnet command & control server.",
        family: "QakBot",
      },
    ];

    const sources: ProviderSourceResult[] = [
      {
        id: "feodo-tracker",
        name: "Feodo Tracker",
        type: "threat_feed",
        status: "matched",
        supportsIpv6: false,
        evidence: c2Evidence,
      },
    ];

    const result = calculateReputationScore(c2Evidence, sources, defaultHostingContext);

    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.level).toBe("critical");
    expect(result.verdictTitle).toContain("Botnet");
  });

  it("scores Spamhaus DROP cybercrime range as critical threat", () => {
    const dropEvidence: EvidenceItem[] = [
      {
        id: "drop-sbl123",
        sourceId: "spamhaus-drop",
        sourceName: "Spamhaus DROP",
        category: "malware",
        severity: "critical",
        title: "Spamhaus DROP",
        summary: "Subnet operated entirely by cybercriminals.",
        targetSubnet: "198.51.100.0/24",
      },
    ];

    const sources: ProviderSourceResult[] = [
      {
        id: "spamhaus-drop",
        name: "Spamhaus DROP",
        type: "threat_feed",
        status: "matched",
        supportsIpv6: true,
        evidence: dropEvidence,
      },
    ];

    const result = calculateReputationScore(dropEvidence, sources, defaultHostingContext);

    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.level).toBe("critical");
  });

  it("corroborates multiple independent sources without artificial duplication", () => {
    const multiEvidence: EvidenceItem[] = [
      {
        id: "dronebl-1",
        sourceId: "dronebl",
        sourceName: "DroneBL",
        category: "bruteforce",
        severity: "medium",
        title: "DroneBL: SSH Brute-Force",
        summary: "Automated brute-force attacks.",
      },
      {
        id: "blocklist-1",
        sourceId: "blocklist-de",
        sourceName: "blocklist.de",
        category: "bruteforce",
        severity: "high",
        title: "blocklist.de: SSH Attacks",
        summary: "40 attacks reported.",
      },
      {
        id: "abuseipdb-1",
        sourceId: "abuseipdb",
        sourceName: "AbuseIPDB",
        category: "bruteforce",
        severity: "high",
        title: "AbuseIPDB",
        summary: "85% confidence score.",
        confidence: 85,
      },
    ];

    const sources: ProviderSourceResult[] = [
      { id: "dronebl", name: "DroneBL", type: "dnsbl", status: "matched", supportsIpv6: true, evidence: [] },
      { id: "blocklist-de", name: "blocklist.de", type: "dnsbl", status: "matched", supportsIpv6: false, evidence: [] },
      { id: "abuseipdb", name: "AbuseIPDB", type: "abuse_database", status: "matched", supportsIpv6: true, evidence: [] },
    ];

    const result = calculateReputationScore(multiEvidence, sources, defaultHostingContext);

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(["high", "critical"]).toContain(result.level);
    expect(result.verdictTitle).toContain("Brute-Force");
  });

  it("treats proxy and hosting connection flags alone as 0 threat risk", () => {
    const proxyContext: NetworkContext = {
      type: "proxy",
      isResidential: false,
      isHosting: true,
      isMobile: false,
      isProxy: true,
      isVpn: false,
      isTor: false,
      isp: "Cloudflare",
      org: "Cloudflare Warp",
      as: "AS13335",
      asname: "CLOUDFLARENET",
    };

    const result = calculateReputationScore([], [], proxyContext);

    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.verdictTitle).toContain("No abuse detected");
  });
});

describe("reputation aggregation (backward-compatibility wrapper)", () => {
  it("scores a clean IP as low risk", () => {
    const result = aggregateReputation({
      blacklists: [blacklist({})],
      abuseConfidence: 0,
      abuseReports: 0,
      proxy: false,
      hosting: false,
      tor: false,
    });

    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.categories).toEqual([]);
  });

  it("scores blacklist listings and abuse reports as high risk", () => {
    const result = aggregateReputation({
      blacklists: [
        blacklist({ id: "sbl", listed: true, categories: ["spam_source"] }),
        blacklist({ id: "xbl", listed: true, categories: ["botnet"] }),
      ],
      abuseConfidence: 100,
      abuseReports: 50,
      proxy: false,
      hosting: false,
      tor: false,
    });

    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(["high", "critical"]).toContain(result.level);
    expect(result.categories).toContain("spam_source");
    expect(result.categories).toContain("botnet");
    expect(result.categories).toContain("bruteforce");
  });

  it("scores proxy and hosting connection flags with 0 threat risk", () => {
    const result = aggregateReputation({
      blacklists: [],
      abuseConfidence: null,
      abuseReports: null,
      proxy: true,
      hosting: true,
      tor: false,
    });

    // In the new evidence-based model, network topology does not add threat score
    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.categories).toContain("proxy_vpn");
    expect(result.categories).toContain("hosting");
  });

  it("weights Tor exits above plain proxies without conflating with threat evidence", () => {
    const tor = aggregateReputation({
      blacklists: [
        blacklist({ id: "spam1", listed: true, categories: ["spam_source"] }),
        blacklist({ id: "spam2", listed: true, categories: ["spam_source"] }),
      ],
      abuseConfidence: 100,
      abuseReports: 10,
      proxy: true,
      hosting: true,
      tor: true,
    });

    expect(tor.score).toBeGreaterThanOrEqual(60);
    expect(["high", "critical"]).toContain(tor.level);
    expect(tor.categories).toContain("tor");
    expect(tor.categories).not.toContain("proxy_vpn");
  });
});
