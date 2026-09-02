import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearFeedStateForTests,
  isInRange,
  matchDrop,
  matchFeodo,
  parseCidr,
  parseDropLines,
  parseFeodoPayload,
  setFeedStateForTests,
  type DropEntry,
  type FeodoEntry,
} from "./feeds";

const DROP_V4_SAMPLE = [
  "; Spamhaus DROP List 2026/09/02",
  ...Array.from({ length: 12 }, (_, index) =>
    JSON.stringify({ cidr: `1.${index}.0.0/16`, sblid: `SBL${400000 + index}`, rir: "ripencc" }),
  ),
  JSON.stringify({ cidr: "2001:678:254::/48", sblid: "SBL697648", rir: "ripencc" }),
].join("\n");

const DROP_V6_SAMPLE = [
  ...Array.from({ length: 10 }, (_, index) =>
    JSON.stringify({ cidr: `2001:678:${(0x250 + index).toString(16)}::/48`, sblid: `SBL${500000 + index}`, rir: "ripencc" }),
  ),
  JSON.stringify({ cidr: "1.2.3.0/24", sblid: "SBL1", rir: "ripencc" }),
].join("\n");

function dropEntry(cidr: string): DropEntry {
  const range = parseCidr(cidr);
  if (!range) throw new Error(`invalid cidr: ${cidr}`);
  return { range, sblid: null, cidr };
}

afterEach(() => {
  clearFeedStateForTests();
  vi.unstubAllGlobals();
});

describe("feed payload parsing", () => {
  it("parses Feodo Tracker JSON entries into normalized form", () => {
    const entries = parseFeodoPayload([
      {
        ip_address: "50.16.16.211",
        port: 443,
        status: "online",
        hostname: "ec2-50-16-16-211.compute-1.amazonaws.com",
        as_number: 14618,
        as_name: "AMAZON-AES",
        country: "US",
        first_seen: "2025-12-30 13:56:31",
        last_online: "2026-09-01",
        malware: "QakBot",
      },
      { ip_address: "162.243.103.246", status: "offline", malware: "Emotet", first_seen: "2022-06-04 21:24:53", last_online: "2026-03-07" },
    ]);

    expect(entries).toEqual([
      {
        ip: "50.16.16.211",
        status: "online",
        malware: "QakBot",
        firstSeen: "2025-12-30T13:56:31.000Z",
        lastOnline: "2026-09-01T00:00:00.000Z",
      },
      expect.objectContaining({ ip: "162.243.103.246", status: "offline", malware: "Emotet" }),
    ]);
  });

  it("rejects malformed Feodo payloads", () => {
    expect(parseFeodoPayload({ not: "an array" })).toBeNull();
    expect(parseFeodoPayload([{ no_ip: true }])).toBeNull();
  });

  it("parses Spamhaus DROP NDJSON and filters by address family", () => {
    const v4 = parseDropLines(DROP_V4_SAMPLE, 4);
    expect(v4).not.toBeNull();
    expect(v4).toHaveLength(12);
    expect(v4?.every((entry) => entry.range.width === 32)).toBe(true);

    const v6 = parseDropLines(DROP_V6_SAMPLE, 6);
    expect(v6).not.toBeNull();
    expect(v6).toHaveLength(10);
    expect(v6?.every((entry) => entry.range.width === 128)).toBe(true);
  });

  it("treats a too-small DROP result as a failed download", () => {
    expect(parseDropLines(JSON.stringify({ cidr: "1.2.3.0/24", sblid: "SBL1" }), 4)).toBeNull();
    expect(parseDropLines("", 4)).toBeNull();
  });
});

describe("CIDR matching", () => {
  it("matches IPv4 ranges on network bits", () => {
    const range = parseCidr("1.10.16.0/20");
    expect(range).not.toBeNull();
    expect(isInRange(0x010a1005n, range!)).toBe(true);
    expect(isInRange(0x010a2001n, range!)).toBe(false);
  });

  it("matches IPv6 ranges on the high prefix bits", () => {
    const range = parseCidr("2001:678:254::/48");
    expect(isInRange(0x20010678025400000000000000000001n, range!)).toBe(true);
    expect(isInRange(0x20010678025500000000000000000001n, range!)).toBe(false);
  });

  it("rejects invalid CIDRs", () => {
    expect(parseCidr("1.2.3.4")).toBeNull();
    expect(parseCidr("1.2.3.0/33")).toBeNull();
    expect(parseCidr("nope/24")).toBeNull();
  });
});

describe("feed matching", () => {
  it("matches an active Feodo C2 with critical weight", async () => {
    const entries = new Map<string, FeodoEntry>([
      ["50.16.16.211", { ip: "50.16.16.211", status: "online", malware: "QakBot", firstSeen: "2025-12-30T13:56:31.000Z", lastOnline: "2026-09-02T00:00:00.000Z" }],
    ]);
    setFeedStateForTests("feodo", entries, Date.now());

    const result = await matchFeodo("50.16.16.211", Date.parse("2026-09-02T12:00:00.000Z"));
    expect(result.status).toBe("matched");
    expect(result.evidence[0]).toEqual(
      expect.objectContaining({
        category: "botnet",
        reason: "feodo_c2_online",
        weight: 65,
        confidence: 95,
        malwareFamily: "QakBot",
      }),
    );

    const clean = await matchFeodo("203.0.113.9", Date.parse("2026-09-02T12:00:00.000Z"));
    expect(clean.status).toBe("clean");
  });

  it("reduces the weight for offline Feodo C2 servers", async () => {
    setFeedStateForTests(
      "feodo",
      new Map([["162.243.103.246", { ip: "162.243.103.246", status: "offline", malware: "Emotet", firstSeen: null, lastOnline: "2026-08-20T00:00:00.000Z" }]]),
      Date.now(),
    );

    const result = await matchFeodo("162.243.103.246", Date.parse("2026-09-02T12:00:00.000Z"));
    expect(result.evidence[0]).toEqual(
      expect.objectContaining({ reason: "feodo_c2_offline", weight: 50, freshness: 0.85 }),
    );
  });

  it("matches DROP netblocks locally for IPv4 and IPv6", async () => {
    setFeedStateForTests("dropv4", [dropEntry("185.93.88.0/22")], Date.now());
    setFeedStateForTests("dropv6", [dropEntry("2a01:4f8::/32")], Date.now());

    const v4 = await matchDrop("185.93.89.118", 4);
    expect(v4.status).toBe("matched");
    expect(v4.evidence[0]).toEqual(
      expect.objectContaining({ category: "malware", reason: "drop", weight: 65, detail: "Network: 185.93.88.0/22" }),
    );

    const v6 = await matchDrop("2a01:4f8:1:2::3", 6);
    expect(v6.status).toBe("matched");

    const noMatch = await matchDrop("203.0.113.9", 4);
    expect(noMatch.status).toBe("clean");
  });

  it("falls back to stale feed data when a refresh fails", async () => {
    setFeedStateForTests(
      "feodo",
      new Map([
        ["50.16.16.211", { ip: "50.16.16.211", status: "online", malware: "QakBot", firstSeen: null, lastOnline: null }],
      ]),
      Date.now() - 2 * 60 * 60_000,
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("service unavailable", { status: 503 })),
    );

    const result = await matchFeodo("50.16.16.211", Date.now());
    expect(result.status).toBe("matched");
  });

  it("reports unavailable when no feed data can be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("service unavailable", { status: 503 })),
    );

    const feodo = await matchFeodo("50.16.16.211", Date.now());
    expect(feodo.status).toBe("unavailable");

    const drop = await matchDrop("185.93.89.118", 4);
    expect(drop.status).toBe("unavailable");
  });
});
