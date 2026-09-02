import { describe, expect, it } from "vitest";
import { aggregateReputation } from "./scoring";
import type { RawEvidence } from "./model";

function evidence(partial: Partial<RawEvidence>): RawEvidence {
  return {
    sourceId: "test-source",
    category: "abuse_reported",
    reason: "test",
    weight: 0,
    confidence: 100,
    freshness: 1,
    ...partial,
  };
}

describe("evidence scoring semantics", () => {
  it("keeps a PBL-only result at zero risk without any spam classification", () => {
    const result = aggregateReputation([
      evidence({
        sourceId: "spamhaus-zen",
        category: "mail_policy",
        reason: "pbl_isp",
        weight: 0,
        confidence: 95,
      }),
    ]);

    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.headline).toBe("no_malicious_activity");
    expect(result.threatCategories).toEqual([]);
    expect(result.mailCategories).toEqual(["mail_policy"]);
    expect(result.contextCategories).toEqual(["mail_policy"]);
    expect(result.evidence[0].points).toBe(0);
    expect(result.contributions).toEqual([]);
  });

  it("scores a completely clean IP as low risk with no evidence", () => {
    const result = aggregateReputation([]);

    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.headline).toBe("no_malicious_activity");
    expect(result.evidence).toEqual([]);
  });

  it("keeps a single Barracuda listing low risk instead of confirming spam", () => {
    const result = aggregateReputation([
      evidence({
        sourceId: "barracuda",
        category: "mail_reputation",
        reason: "barracuda_listing",
        weight: 12,
        confidence: 60,
        freshness: 0.85,
      }),
    ]);

    expect(result.score).toBe(8);
    expect(result.level).toBe("low");
    expect(result.headline).toBe("low_risk");
    expect(result.evidence[0].category).toBe("mail_reputation");
    expect(result.evidence[0].severity).toBe("low");
    expect(result.contributions).toEqual([
      {
        sourceId: "barracuda",
        sourceName: "Barracuda BRBL",
        category: "mail_reputation",
        reason: "barracuda_listing",
        points: 8,
      },
    ]);
  });

  it("scores recent blocklist.de brute-force reports as medium risk", () => {
    const result = aggregateReputation([
      evidence({
        sourceId: "blocklist-de",
        category: "bruteforce",
        reason: "bld_attack",
        weight: 28,
        confidence: 70,
        freshness: 1,
        reportCount: 113,
        lastSeen: new Date().toISOString(),
      }),
    ]);

    // 28 weight x 0.85 confidence factor = 24, plus 20 report-volume bonus.
    expect(result.score).toBe(44);
    expect(result.level).toBe("medium");
    expect(result.evidence[0].points).toBe(44);
    expect(result.threatCategories).toContain("bruteforce");
  });

  it("rates an active Feodo botnet C2 as high risk", () => {
    const result = aggregateReputation([
      evidence({
        sourceId: "feodo-tracker",
        category: "botnet",
        reason: "feodo_c2_online",
        weight: 65,
        confidence: 95,
        freshness: 1,
        malwareFamily: "QakBot",
      }),
    ]);

    expect(result.score).toBe(63);
    expect(result.level).toBe("high");
    expect(result.headline).toBe("high_risk");
    expect(result.evidence[0].severity).toBe("critical");
  });

  it("keeps a Tor exit or VPN address at zero threat while showing context", () => {
    const result = aggregateReputation([
      evidence({ sourceId: "abuseipdb", category: "tor", reason: "abuseipdb_tor", weight: 0 }),
      evidence({ sourceId: "ip-api", category: "vpn", reason: "ipapi_vpn", weight: 0, confidence: 75 }),
      evidence({ sourceId: "ip-api", category: "hosting", reason: "ipapi_hosting", weight: 0 }),
    ]);

    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.headline).toBe("no_malicious_activity");
    expect(result.contextCategories).toEqual(expect.arrayContaining(["tor", "vpn", "hosting"]));
    expect(result.threatCategories).toEqual([]);
  });

  it("raises the score when several independent malicious sources corroborate", () => {
    const result = aggregateReputation([
      evidence({
        sourceId: "feodo-tracker",
        category: "botnet",
        reason: "feodo_c2_online",
        weight: 65,
        confidence: 95,
      }),
      evidence({
        sourceId: "abuseipdb",
        category: "abuse_reported",
        reason: "abuseipdb_reports",
        weight: 45,
        confidence: 100,
        reportCount: 500,
      }),
      evidence({
        sourceId: "blocklist-de",
        category: "bruteforce",
        reason: "bld_attack",
        weight: 28,
        confidence: 70,
        reportCount: 113,
      }),
    ]);

    // 63 + 70 + 44 = 177 raw, +22 for three independent direct-evidence groups.
    expect(result.score).toBe(100);
    expect(result.rawScore).toBe(199);
    expect(result.level).toBe("high");
    expect(result.contributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sourceId: "aggregation", reason: "corroboration", points: 22 }),
      ]),
    );
  });

  it("adds a fixed corroboration bonus of 10 for two independent direct sources", () => {
    const result = aggregateReputation([
      evidence({ sourceId: "spamhaus-zen", category: "botnet", reason: "xbl", weight: 40, confidence: 85 }),
      evidence({
        sourceId: "blocklist-de",
        category: "bruteforce",
        reason: "bld_attack",
        weight: 28,
        confidence: 70,
        reportCount: 113,
      }),
    ]);

    expect(result.score).toBe(91);
    expect(result.level).toBe("high");
  });

  it("does not double count correlated Spamhaus datasets", () => {
    const result = aggregateReputation([
      evidence({ sourceId: "spamhaus-zen", category: "spam_observed", reason: "sbl", weight: 30, confidence: 90 }),
      evidence({ sourceId: "spamhaus-zen", category: "mail_reputation", reason: "css", weight: 14, confidence: 75 }),
    ]);

    // Strongest signal 29 counts fully, the correlated CSS 12 only half.
    expect(result.score).toBe(35);
    expect(result.level).toBe("medium");
  });

  it("reconciles per-source points with the discounted score", () => {
    const result = aggregateReputation([
      evidence({ sourceId: "spamhaus-zen", category: "botnet", reason: "xbl", weight: 40, confidence: 85 }),
      evidence({ sourceId: "spamhaus-drop", category: "botnet", reason: "drop", weight: 30, confidence: 100 }),
    ]);

    // Raw 37 + 30, discounted group total 37 + round(30 * 0.5) = 52.
    // A single independence group means no corroboration bonus.
    expect(result.score).toBe(52);
    expect(result.evidence.map((item) => item.adjustedPoints).sort((a, b) => b - a)).toEqual([37, 15]);
    expect(result.contributions).toEqual([
      {
        sourceId: "spamhaus-zen",
        sourceName: "Spamhaus ZEN",
        category: "botnet",
        reason: "xbl",
        points: 37,
      },
      {
        sourceId: "spamhaus-drop",
        sourceName: "Spamhaus DROP",
        category: "botnet",
        reason: "drop",
        points: 15,
      },
    ]);

    // Displayed source points plus aggregation bonuses equal the score.
    const contributionPoints = result.contributions.reduce((sum, item) => sum + item.points, 0);
    expect(contributionPoints).toBe(result.score);
  });

  it("keeps adjusted points exact when discounted halves round", () => {
    const result = aggregateReputation([
      evidence({ sourceId: "spamhaus-zen", category: "botnet", reason: "xbl", weight: 11, confidence: 100 }),
      evidence({ sourceId: "spamhaus-drop", category: "botnet", reason: "drop", weight: 7, confidence: 100 }),
      evidence({ sourceId: "spamhaus-zen", category: "botnet", reason: "bcl", weight: 5, confidence: 100 }),
    ]);

    // Raw 11 + 7 + 5, discounted group total 11 + round(12 * 0.5) = 17.
    // Halves 3.5 + 2.5 distribute the rounding unit to the first item.
    expect(result.score).toBe(17);
    expect(result.rawScore).toBe(17);
    expect(result.evidence.map((item) => item.adjustedPoints).sort((a, b) => b - a)).toEqual([11, 4, 2]);
    expect(result.contributions.reduce((sum, item) => sum + item.points, 0)).toBe(result.score);
  });

  it("requires three independent mail reputation lists before adding mail corroboration", () => {
    const two = aggregateReputation([
      evidence({ sourceId: "spamcop", category: "mail_reputation", reason: "spamcop_listing", weight: 14, confidence: 70 }),
      evidence({ sourceId: "barracuda", category: "mail_reputation", reason: "barracuda_listing", weight: 12, confidence: 60, freshness: 0.85 }),
    ]);

    expect(two.score).toBe(25);
    expect(two.level).toBe("medium");

    const three = aggregateReputation([
      evidence({ sourceId: "spamcop", category: "mail_reputation", reason: "spamcop_listing", weight: 14, confidence: 70 }),
      evidence({
        sourceId: "barracuda",
        category: "mail_reputation",
        reason: "barracuda_listing",
        weight: 12,
        confidence: 60,
        freshness: 0.85,
      }),
      evidence({ sourceId: "spamhaus-zen", category: "mail_reputation", reason: "css", weight: 14, confidence: 75 }),
    ]);

    expect(three.score).toBe(47);
    expect(three.level).toBe("medium");
  });

  it("reduces the weight of stale and low-confidence evidence", () => {
    const stale = aggregateReputation([
      evidence({
        sourceId: "dronebl",
        category: "ddos",
        reason: "dronebl_ddos_drone",
        weight: 30,
        confidence: 70,
        freshness: 0.25,
      }),
    ]);

    expect(stale.score).toBe(6);
    expect(stale.level).toBe("low");
  });

  it("is deterministic and traceable", () => {
    const items = [
      evidence({ sourceId: "feodo-tracker", category: "botnet", reason: "feodo_c2_online", weight: 65, confidence: 95 }),
      evidence({ sourceId: "spamhaus-drop", category: "malware", reason: "drop", weight: 65, confidence: 90, freshness: 0.9 }),
      evidence({ sourceId: "greynoise", category: "scanner", reason: "greynoise_scanner_malicious", weight: 20, confidence: 80 }),
    ];

    const first = aggregateReputation(items);
    const second = aggregateReputation(items);

    expect(first).toEqual(second);

    const evidencePoints = first.evidence.reduce((sum, item) => sum + item.points, 0);
    const bonusPoints = first.contributions
      .filter((contribution) => contribution.sourceId === "aggregation")
      .reduce((sum, contribution) => sum + contribution.points, 0);

    // Every point in the score maps back to evidence items plus bonuses.
    expect(evidencePoints + bonusPoints).toBeGreaterThanOrEqual(first.score);
    expect(first.score).toBe(100);
    for (const contribution of first.contributions) {
      if (contribution.sourceId === "aggregation") continue;
      expect(first.evidence).toEqual(
        expect.arrayContaining([expect.objectContaining({ sourceId: contribution.sourceId, points: contribution.points })]),
      );
    }
  });
});
