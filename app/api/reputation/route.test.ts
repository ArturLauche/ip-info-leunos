import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { clearFeedStateForTests } from "@/lib/reputation/feeds";
import { clearGreyNoiseCacheForTests } from "@/lib/reputation/query";

const dnsMock = vi.hoisted(() => ({
  aRecords: new Map<string, string[]>(),
  txtRecords: new Map<string, string[][]>(),
  failures: new Set<string>(),
}));

vi.mock("node:dns/promises", () => {
  class FakeResolver {
    constructor() {}

    async resolve4(name: string): Promise<string[]> {
      if (dnsMock.failures.has(name)) {
        const error = new Error("query timed out") as NodeJS.ErrnoException;
        error.code = "ETIMEOUT";
        throw error;
      }
      const records = dnsMock.aRecords.get(name);
      if (!records) {
        const error = new Error("not found") as NodeJS.ErrnoException;
        error.code = "ENOTFOUND";
        throw error;
      }
      return records;
    }

    async resolveTxt(name: string): Promise<string[][]> {
      const records = dnsMock.txtRecords.get(name);
      if (!records) {
        const error = new Error("not found") as NodeJS.ErrnoException;
        error.code = "ENOTFOUND";
        throw error;
      }
      return records;
    }
  }

  return { default: { Resolver: FakeResolver }, Resolver: FakeResolver };
});

const ORIGINAL_ENV = {
  ABUSEIPDB_API_KEY: process.env.ABUSEIPDB_API_KEY,
  GREYNOISE_API_KEY: process.env.GREYNOISE_API_KEY,
  HTTPBL_ACCESS_KEY: process.env.HTTPBL_ACCESS_KEY,
  THREATFOX_AUTH_KEY: process.env.THREATFOX_AUTH_KEY,
};

const DROP_V4_BODY = Array.from(
  { length: 12 },
  (_, index) => JSON.stringify({ cidr: `1.${index}.0.0/16`, sblid: `SBL${400000 + index}`, rir: "ripencc" }),
).join("\n");

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function ipApiPayload(overrides: Record<string, unknown> = {}) {
  return {
    status: "success",
    country: "Germany",
    countryCode: "DE",
    region: "Hessen",
    regionName: "Hessen",
    city: "Frankfurt am Main",
    isp: "Deutsche Telekom AG",
    org: "Deutsche Telekom AG",
    as: "AS3320 Deutsche Telekom AG",
    asname: "Deutsche Telekom AG",
    reverse: "pd9c86001.dip0.t-ipconnect.de",
    mobile: false,
    proxy: false,
    hosting: false,
    query: "84.134.0.1",
    ...overrides,
  };
}

function stubFetch(handler: (url: string) => Response | null) {
  const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const href = String(url instanceof Request ? url.url : url);
    const response = handler(href);
    if (response) return response;
    void init;
    return jsonResponse({ error: "unexpected request" }, 500);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Standard fetch stub: feeds empty/clean, GreyNoise not observed. */
function stubCleanEnvironment() {
  return stubFetch((href) => {
    if (href.includes("feodotracker.abuse.ch")) return jsonResponse([]);
    if (href.includes("spamhaus.org/drop/drop_v4.json")) {
      return new Response(DROP_V4_BODY, { status: 200 });
    }
    if (href.includes("api.greynoise.io")) {
      return jsonResponse({ ip: "x", noise: false, riot: false, message: "IP not observed scanning the internet." }, 404);
    }
    if (href.includes("ip-api.com")) return jsonResponse(ipApiPayload());
    if (href.includes("api.blocklist.de")) return jsonResponse({ attacks: "0", reports: "0" });
    return null;
  });
}

function invoke(ip: string, clientIp = "203.0.113.10") {
  return GET(
    new Request(`http://localhost/api/reputation?ip=${encodeURIComponent(ip)}`, {
      headers: { "x-real-ip": clientIp },
    }),
  );
}

beforeEach(() => {
  dnsMock.aRecords.clear();
  dnsMock.txtRecords.clear();
  dnsMock.failures.clear();
  delete process.env.ABUSEIPDB_API_KEY;
  delete process.env.GREYNOISE_API_KEY;
  delete process.env.HTTPBL_ACCESS_KEY;
  delete process.env.THREATFOX_AUTH_KEY;
});

afterEach(() => {
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  clearFeedStateForTests();
  clearGreyNoiseCacheForTests();
  vi.unstubAllGlobals();
});

describe("reputation API route", () => {
  it("answers a residential PBL-only result as low risk with a policy listing", async () => {
    stubCleanEnvironment();
    dnsMock.aRecords.set("1.0.134.84.zen.spamhaus.org", ["127.0.0.10"]);

    const response = await invoke("84.134.0.1", "203.0.113.101");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data).toMatchObject({
      ip: "84.134.0.1",
      score: 0,
      level: "low",
      headline: "no_malicious_activity",
      networkContext: {
        connectionType: "fixed",
        hosting: false,
        mobile: false,
        proxy: false,
        tor: false,
        residentialEstimated: true,
      },
    });

    const pbl = body.data.evidence.find((item: { category: string }) => item.category === "mail_policy");
    expect(pbl).toMatchObject({
      sourceId: "spamhaus-zen",
      reason: "pbl_isp",
      points: 0,
      severity: "info",
      raw: "127.0.0.10",
    });
    expect(body.data.evidence.some((item: { category: string }) => item.category === "residential")).toBe(true);
    expect(body.data.threatCategories).toEqual([]);
    expect(body.data.mailCategories).toEqual(["mail_policy"]);
    expect(body.data.contributions).toEqual([]);

    const sources = Object.fromEntries(body.data.sources.map((source: { id: string; status: string }) => [source.id, source.status]));
    expect(sources).toMatchObject({
      "spamhaus-zen": "policy_listed",
      "spamhaus-drop": "clean",
      spamcop: "clean",
      barracuda: "clean",
      dronebl: "clean",
      "blocklist-de": "clean",
      "feodo-tracker": "clean",
      greynoise: "clean",
      abuseipdb: "not_configured",
      httpbl: "not_configured",
      threatfox: "not_configured",
      "ip-api": "available",
    });
    expect(body.data.coverage).toMatchObject({
      checkedCount: 9,
      matchedCount: 0,
      unavailableCount: 0,
      skippedCount: 3,
    });
  });

  it("rates an active Feodo botnet C2 as high risk", async () => {
    stubFetch((href) => {
      if (href.includes("feodotracker.abuse.ch")) {
        return jsonResponse([
          {
            ip_address: "50.16.16.211",
            port: 443,
            status: "online",
            malware: "QakBot",
            first_seen: "2025-12-30 13:56:31",
            last_online: "2026-09-02",
          },
        ]);
      }
      if (href.includes("spamhaus.org/drop/drop_v4.json")) return new Response(DROP_V4_BODY, { status: 200 });
      if (href.includes("api.greynoise.io")) return jsonResponse({ noise: false, riot: false }, 404);
      if (href.includes("ip-api.com")) return jsonResponse(ipApiPayload({ hosting: true, reverse: "ec2-50-16-16-211.compute-1.amazonaws.com" }));
      if (href.includes("api.blocklist.de")) return jsonResponse({ attacks: "0", reports: "0" });
      return null;
    });

    const response = await invoke("50.16.16.211", "203.0.113.102");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.level).toBe("high");
    expect(body.data.headline).toBe("high_risk");
    expect(body.data.score).toBeGreaterThanOrEqual(60);
    expect(body.data.evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "feodo-tracker",
          category: "botnet",
          reason: "feodo_c2_online",
          malwareFamily: "QakBot",
          severity: "critical",
        }),
      ]),
    );
    expect(body.data.coverage.matchedCount).toBe(1);
  });

  it("scores recent blocklist.de attack evidence as medium risk with details", async () => {
    stubFetch((href) => {
      if (href.includes("feodotracker.abuse.ch")) return jsonResponse([]);
      if (href.includes("spamhaus.org/drop/drop_v4.json")) return new Response(DROP_V4_BODY, { status: 200 });
      if (href.includes("api.greynoise.io")) return jsonResponse({ noise: false, riot: false }, 404);
      if (href.includes("ip-api.com")) return jsonResponse(ipApiPayload());
      if (href.includes("api.blocklist.de")) return jsonResponse({ attacks: "12816", reports: "113" });
      return null;
    });
    dnsMock.aRecords.set("118.89.93.185.bl.blocklist.de", ["127.0.0.13"]);
    dnsMock.txtRecords.set("118.89.93.185.bl.blocklist.de", [
      ["Infected System (Service: sasl, Last-Attack: 1788355802), see http://www.blocklist.de/en/view.html?ip=185.93.89.118"],
    ]);

    const response = await invoke("185.93.89.118", "203.0.113.103");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.level).toBe("medium");
    expect(body.data.evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "blocklist-de",
          category: "bruteforce",
          detail: "Service: sasl",
          reportCount: 113,
          attackCount: 12816,
          lastSeen: new Date(1788355802000).toISOString(),
        }),
      ]),
    );
    expect(body.data.coverage.matchedCount).toBe(1);
  });

  it("reports Spamhaus resolver blocking as an explicit source state", async () => {
    stubCleanEnvironment();
    dnsMock.aRecords.set("2.0.134.84.zen.spamhaus.org", ["127.255.255.254"]);

    const response = await invoke("84.134.0.2", "203.0.113.104");
    const body = await response.json();

    expect(response.status).toBe(200);
    const sources = Object.fromEntries(body.data.sources.map((source: { id: string; status: string }) => [source.id, source.status]));
    expect(sources["spamhaus-zen"]).toBe("resolver_blocked");
    expect(body.data.coverage.unavailableCount).toBe(1);
    // The rest of the result remains usable.
    expect(body.data.level).toBe("low");
    expect(body.data.coverage.checkedCount).toBe(8);
  });

  it("marks IPv4-only providers as unsupported for IPv6 lookups", async () => {
    stubFetch((href) => {
      if (href.includes("feodotracker.abuse.ch")) return jsonResponse([]);
      if (href.includes("spamhaus.org/drop/drop_v6.json")) {
        return new Response(
          Array.from({ length: 10 }, (_, index) => JSON.stringify({ cidr: `2001:678:${(0x250 + index).toString(16)}::/48`, sblid: "SBL1", rir: "ripencc" })).join("\n"),
          { status: 200 },
        );
      }
      if (href.includes("api.greynoise.io")) return jsonResponse({ noise: false, riot: false }, 404);
      if (href.includes("ip-api.com")) {
        return jsonResponse(
          ipApiPayload({
            query: "2a00:1450:4001:81b::200e",
            isp: "Google LLC",
            org: "Google LLC",
            as: "AS15169 Google LLC",
            asname: "Google LLC",
            reverse: "",
          }),
        );
      }
      if (href.includes("api.blocklist.de")) return jsonResponse({ attacks: "0", reports: "0" });
      return null;
    });

    const response = await invoke("2a00:1450:4001:81b::200e", "203.0.113.105");
    const body = await response.json();

    expect(response.status).toBe(200);
    const sources = Object.fromEntries(body.data.sources.map((source: { id: string; status: string }) => [source.id, source.status]));
    expect(sources).toMatchObject({
      "spamhaus-zen": "clean",
      "spamhaus-drop": "clean",
      spamcop: "unsupported",
      barracuda: "unsupported",
      dronebl: "clean",
      "blocklist-de": "unsupported",
      "feodo-tracker": "unsupported",
      greynoise: "unsupported",
      "ip-api": "available",
    });
    expect(body.data.coverage.skippedCount).toBe(8);
  });

  it("keeps the request successful with partial provider availability", async () => {
    stubFetch((href) => {
      if (href.includes("feodotracker.abuse.ch")) return jsonResponse([]);
      if (href.includes("spamhaus.org/drop/drop_v4.json")) return new Response(DROP_V4_BODY, { status: 200 });
      if (href.includes("api.greynoise.io")) return jsonResponse({ message: "down" }, 500);
      if (href.includes("ip-api.com")) return jsonResponse({ message: "down" }, 500);
      if (href.includes("api.blocklist.de")) return jsonResponse({ attacks: "0", reports: "0" });
      return null;
    });
    dnsMock.failures.add("3.0.134.84.zen.spamhaus.org");

    const response = await invoke("84.134.0.3", "203.0.113.106");
    const body = await response.json();

    expect(response.status).toBe(200);
    const sources = Object.fromEntries(body.data.sources.map((source: { id: string; status: string }) => [source.id, source.status]));
    expect(sources["spamhaus-zen"]).toBe("unavailable");
    expect(sources["ip-api"]).toBe("unavailable");
    expect(sources.greynoise).toBe("unavailable");
    expect(body.data.coverage.unavailableCount).toBe(3);
    expect(body.data.geo).toBeNull();
    expect(body.data.networkContext).toBeNull();
    // DNS blocklists that answered still provide a verdict.
    expect(body.data.level).toBe("low");
  });

  it("returns an upstream error only when every source fails", async () => {
    stubFetch(() => jsonResponse({ message: "down" }, 500));
    for (const zone of ["zen.spamhaus.org", "bl.spamcop.net", "b.barracudacentral.org", "dnsbl.dronebl.org", "bl.blocklist.de"]) {
      dnsMock.failures.add(`4.0.134.84.${zone}`);
    }

    const response = await invoke("84.134.0.4", "203.0.113.107");
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toMatchObject({ ok: false, error: { code: "upstream_error" } });
    expect(body.error.details.sources).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "spamhaus-zen", status: "unavailable" })]),
    );
  });

  it("caches per-IP results to protect free provider quotas", async () => {
    const fetchMock = stubCleanEnvironment();

    const first = await invoke("84.134.0.5", "203.0.113.108");
    const second = await invoke("84.134.0.5", "203.0.113.108");

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const ipApiCalls = fetchMock.mock.calls.filter((call) => String(call[0]).includes("ip-api.com"));
    const greynoiseCalls = fetchMock.mock.calls.filter((call) => String(call[0]).includes("api.greynoise.io"));
    expect(ipApiCalls).toHaveLength(1);
    expect(greynoiseCalls).toHaveLength(1);
  });

  it("queries optional providers when keys are configured without leaking them", async () => {
    process.env.ABUSEIPDB_API_KEY = "abuse-secret-key";
    process.env.HTTPBL_ACCESS_KEY = "httpblkey";
    process.env.THREATFOX_AUTH_KEY = "threatfox-secret";

    const fetchMock = stubFetch((href) => {
      if (href.includes("feodotracker.abuse.ch")) return jsonResponse([]);
      if (href.includes("spamhaus.org/drop/drop_v4.json")) return new Response(DROP_V4_BODY, { status: 200 });
      if (href.includes("api.greynoise.io")) {
        return jsonResponse({ ip: "185.93.89.118", noise: true, riot: false, classification: "malicious", last_seen: "2026-09-01" });
      }
      if (href.includes("ip-api.com")) return jsonResponse(ipApiPayload());
      if (href.includes("api.blocklist.de")) return jsonResponse({ attacks: "0", reports: "0" });
      if (href.includes("api.abuseipdb.com")) {
        return jsonResponse({
          data: { abuseConfidenceScore: 100, totalReports: 500, lastReportedAt: "2026-09-01T10:00:00Z", isTor: false },
        });
      }
      if (href.includes("threatfox-api.abuse.ch")) {
        return jsonResponse({ query_status: "ok", data: [{ ioc: "185.93.89.118:443", threat_type: "botnet_cc", malware_family: "AsyncRAT", confidence_level: 100 }] });
      }
      return null;
    });
    dnsMock.aRecords.set("httpblkey.118.89.93.185.dnsbl.httpbl.org", ["127.1.100.4"]);

    const response = await invoke("185.93.89.118", "203.0.113.109");
    const body = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(200);
    const sources = Object.fromEntries(body.data.sources.map((source: { id: string; status: string }) => [source.id, source.status]));
    expect(sources).toMatchObject({
      abuseipdb: "matched",
      httpbl: "matched",
      threatfox: "matched",
      greynoise: "matched",
    });

    // Corroborating malicious sources push the score to high.
    expect(body.data.level).toBe("high");
    expect(serialized).not.toContain("abuse-secret-key");
    expect(serialized).not.toContain("httpblkey");
    expect(serialized).not.toContain("threatfox-secret");

    const abuseCall = fetchMock.mock.calls.find((call) => String(call[0]).includes("api.abuseipdb.com"));
    expect(abuseCall?.[1]).toMatchObject({ headers: { Key: "abuse-secret-key" } });
    expect(String(abuseCall?.[0])).not.toContain("abuse-secret-key");
  });

  it("propagates provider rate limits as source states", async () => {
    stubFetch((href) => {
      if (href.includes("feodotracker.abuse.ch")) return jsonResponse([]);
      if (href.includes("spamhaus.org/drop/drop_v4.json")) return new Response(DROP_V4_BODY, { status: 200 });
      if (href.includes("api.greynoise.io")) {
        return jsonResponse({ plan: "unauthenticated", "rate-limit": "10 IP lookups per day" }, 429);
      }
      if (href.includes("ip-api.com")) return jsonResponse(ipApiPayload());
      if (href.includes("api.blocklist.de")) return jsonResponse({ attacks: "0", reports: "0" });
      return null;
    });

    const response = await invoke("84.134.0.6", "203.0.113.110");
    const body = await response.json();

    expect(response.status).toBe(200);
    const sources = Object.fromEntries(body.data.sources.map((source: { id: string; status: string }) => [source.id, source.status]));
    expect(sources.greynoise).toBe("rate_limited");
    expect(body.data.coverage.unavailableCount).toBe(1);
  });

  it("rejects private and invalid targets", async () => {
    const privateResponse = await invoke("192.168.1.1", "203.0.113.111");
    expect(privateResponse.status).toBe(403);
    const privateBody = await privateResponse.json();
    expect(privateBody.error.code).toBe("target_blocked");

    const invalidResponse = await invoke("not-an-ip", "203.0.113.112");
    expect(invalidResponse.status).toBe(400);
  });

  it("rate limits excessive requests", async () => {
    stubCleanEnvironment();
    dnsMock.aRecords.set("1.0.134.84.zen.spamhaus.org", ["127.0.0.10"]);

    let lastStatus = 200;
    for (let index = 0; index < 21; index += 1) {
      const response = await invoke("84.134.0.7", "203.0.113.113");
      lastStatus = response.status;
    }

    expect(lastStatus).toBe(429);
  });
});
