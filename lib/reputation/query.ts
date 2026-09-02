import dns from "node:dns/promises";
import { lookupIpApi } from "@/lib/providers/ip-api";
import { detectConnectionType } from "@/lib/connection-type";
import { REPUTATION_SOURCES } from "./model";
import type { NetworkContext, RawEvidence, ReputationGeo, ReputationNetwork, SourceResult } from "./model";
import {
  interpretBarracudaResponse,
  interpretBlocklistDeResponse,
  interpretDroneblResponse,
  interpretHttpblResponse,
  interpretSpamcopResponse,
  interpretZenResponse,
  ipv6ToNibbleFormat,
  reverseIpv4ForDnsbl,
  type DnsblInterpretation,
} from "./dnsbl";
import { matchDrop, matchFeodo } from "./feeds";
import {
  abuseIpDbEvidence,
  greyNoiseEvidence,
  normalizeAbuseIpDbPayload,
  normalizeBlocklistDeCounts,
  normalizeGreyNoisePayload,
  normalizeThreatFoxPayload,
  threatFoxEvidence,
  type GreyNoiseResult,
} from "./providers";

/**
 * Server-side provider orchestration. Every provider is queried
 * independently with a bounded timeout; a provider failure degrades to a
 * per-source status and never fails the whole request.
 */

const DNSBL_TIMEOUT_MS = 2_500;
const HTTP_TIMEOUT_MS = 4_000;
const HTTPBL_ZONE = "dnsbl.httpbl.org";
const BLOCKLIST_DE_ZONE = "bl.blocklist.de";
const GREYNOISE_URL = "https://api.greynoise.io/v3/community/";
const GREYNOISE_CACHE_TTL_MS = 24 * 60 * 60_000;
const GREYNOISE_CACHE_MAX_ENTRIES = 1_024;
const USER_AGENT = "ip-info-leunos-reputation/1.0";

const SOURCE_ORDER = new Map(REPUTATION_SOURCES.map((source, index) => [source.id, index]));

export interface ReputationQueryResult {
  sources: SourceResult[];
  evidence: RawEvidence[];
  geo: ReputationGeo | null;
  network: ReputationNetwork | null;
  networkContext: NetworkContext | null;
}

interface ProviderOutcome {
  id: string;
  status: SourceResult["status"];
  evidence: RawEvidence[];
}

// Module singleton: constructing a Resolver per provider per request churns
// sockets and dominates reputation latency (~12 upstream lookups per check).
const sharedResolver = new dns.Resolver({ timeout: DNSBL_TIMEOUT_MS, tries: 1 });

async function queryDnsbl(
  sourceId: string,
  queryName: string,
  interpret: (aRecords: string[], txtRecords: string[][]) => DnsblInterpretation,
  options: { withTxt?: boolean } = {},
): Promise<ProviderOutcome> {
  const resolver = sharedResolver;

  let aRecords: string[] = [];
  let txtRecords: string[][] = [];
  try {
    aRecords = await resolver.resolve4(queryName);
    if (options.withTxt) {
      try {
        txtRecords = await resolver.resolveTxt(queryName);
      } catch {
        // TXT is supplementary (blocklist.de last-attack); an A answer stands alone.
      }
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code || "";
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return { id: sourceId, status: "clean", evidence: [] };
    }
    return { id: sourceId, status: "unavailable", evidence: [] };
  }

  const interpretation = interpret(aRecords, txtRecords);
  return { id: sourceId, status: interpretation.status, evidence: interpretation.evidence };
}

function unsupportedOutcome(sourceId: string): ProviderOutcome {
  return { id: sourceId, status: "unsupported", evidence: [] };
}

function notConfiguredOutcome(sourceId: string): ProviderOutcome {
  return { id: sourceId, status: "not_configured", evidence: [] };
}

async function fetchWithTimeout(
  url: string,
  headers: Record<string, string>,
  init: { method?: string; body?: string } = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  timer.unref?.();

  try {
    return await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers,
      ...(init.method ? { method: init.method } : {}),
      ...(init.body ? { body: init.body } : {}),
    });
  } finally {
    clearTimeout(timer);
  }
}

interface BlocklistDeCounts {
  attacks: number | null;
  reports: number | null;
}

async function queryBlocklistDe(ip: string, family: 4 | 6, nowMs: number): Promise<ProviderOutcome> {
  if (family !== 4) return unsupportedOutcome("blocklist-de");

  const [dnsblOutcome, counts] = await Promise.all([
    queryDnsbl(
      "blocklist-de",
      `${reverseIpv4ForDnsbl(ip)}.${BLOCKLIST_DE_ZONE}`,
      (aRecords, txtRecords) =>
        interpretBlocklistDeResponse(aRecords, txtRecords.length > 0 ? txtRecords[0] : null, nowMs, null),
      { withTxt: true },
    ),
    fetchWithTimeout(`https://api.blocklist.de/api.php?ip=${encodeURIComponent(ip)}&start=1&format=json`, {
      "user-agent": USER_AGENT,
      accept: "application/json",
    })
      .then(async (response): Promise<BlocklistDeCounts | null> => {
        if (!response.ok) return null;
        return normalizeBlocklistDeCounts(await response.json());
      })
      .catch(() => null),
  ]);

  if (counts && (counts.reports ?? 0) > 0) {
    if (dnsblOutcome.status === "clean") {
      // Historical reports in the HTTP API, but not currently listed in the DNS zone.
      return {
        id: "blocklist-de",
        status: "matched",
        evidence: [
          {
            sourceId: "blocklist-de",
            category: "abuse_reported",
            reason: "bld_counts_only",
            weight: 18,
            confidence: 70,
            freshness: 0.5,
            reportCount: counts.reports,
            attackCount: counts.attacks,
          },
        ],
      };
    }

    return {
      ...dnsblOutcome,
      evidence: dnsblOutcome.evidence.map((item) => ({
        ...item,
        reportCount: counts.reports,
        attackCount: counts.attacks,
      })),
    };
  }

  return dnsblOutcome;
}

async function queryGreyNoise(ip: string, family: 4 | 6, nowMs: number): Promise<ProviderOutcome> {
  if (family !== 4) return unsupportedOutcome("greynoise");

  const cached = greyNoiseCache.get(ip);
  if (cached && nowMs - cached.checkedAt < GREYNOISE_CACHE_TTL_MS) {
    return greyNoiseOutcome(cached.result, nowMs);
  }

  const key = process.env.GREYNOISE_API_KEY?.trim() || "";
  const headers: Record<string, string> = {
    "user-agent": USER_AGENT,
    accept: "application/json",
    ...(key ? { key } : {}),
  };

  try {
    const response = await fetchWithTimeout(`${GREYNOISE_URL}${encodeURIComponent(ip)}`, headers);

    if (response.status === 429) return { id: "greynoise", status: "rate_limited", evidence: [] };
    if (response.status === 404) {
      cacheGreyNoise(ip, { noise: false, riot: false, classification: null, name: null, lastSeen: null }, nowMs);
      return { id: "greynoise", status: "clean", evidence: [] };
    }
    if (!response.ok) return { id: "greynoise", status: "unavailable", evidence: [] };

    const normalized = normalizeGreyNoisePayload(await response.json());
    if (!normalized) return { id: "greynoise", status: "unavailable", evidence: [] };

    cacheGreyNoise(ip, normalized, nowMs);
    return greyNoiseOutcome(normalized, nowMs);
  } catch {
    return { id: "greynoise", status: "unavailable", evidence: [] };
  }
}

const greyNoiseCache = new Map<string, { checkedAt: number; result: GreyNoiseResult }>();

function cacheGreyNoise(ip: string, result: GreyNoiseResult, nowMs: number) {
  greyNoiseCache.delete(ip);
  greyNoiseCache.set(ip, { checkedAt: nowMs, result });
  while (greyNoiseCache.size > GREYNOISE_CACHE_MAX_ENTRIES) {
    const oldest = greyNoiseCache.keys().next().value;
    if (oldest === undefined) break;
    greyNoiseCache.delete(oldest);
  }
}

function greyNoiseOutcome(result: GreyNoiseResult, nowMs: number): ProviderOutcome {
  const interpretation = greyNoiseEvidence(result, nowMs);
  return { id: "greynoise", status: interpretation.status, evidence: interpretation.evidence };
}

/** Test hook: clears the GreyNoise per-IP cache. */
export function clearGreyNoiseCacheForTests() {
  greyNoiseCache.clear();
}

async function queryAbuseIpDb(ip: string, nowMs: number): Promise<ProviderOutcome> {
  const key = process.env.ABUSEIPDB_API_KEY?.trim() || "";
  if (!key) return notConfiguredOutcome("abuseipdb");

  try {
    const response = await fetchWithTimeout(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`,
      { Key: key, Accept: "application/json", "user-agent": USER_AGENT },
    );

    if (response.status === 429) return { id: "abuseipdb", status: "rate_limited", evidence: [] };
    if (!response.ok) return { id: "abuseipdb", status: "unavailable", evidence: [] };

    const normalized = normalizeAbuseIpDbPayload(await response.json());
    if (!normalized) return { id: "abuseipdb", status: "unavailable", evidence: [] };

    const interpretation = abuseIpDbEvidence(normalized, nowMs);
    return { id: "abuseipdb", status: interpretation.status, evidence: interpretation.evidence };
  } catch {
    return { id: "abuseipdb", status: "unavailable", evidence: [] };
  }
}

async function queryThreatFox(ip: string, nowMs: number): Promise<ProviderOutcome> {
  const key = process.env.THREATFOX_AUTH_KEY?.trim() || "";
  if (!key) return notConfiguredOutcome("threatfox");

  try {
    const response = await fetchWithTimeout(
      "https://threatfox-api.abuse.ch/api/v1/",
      { "Auth-Key": key, "Content-Type": "application/json", "user-agent": USER_AGENT },
      { method: "POST", body: JSON.stringify({ query: "search_ioc", search_term: ip }) },
    );

    if (response.status === 429) return { id: "threatfox", status: "rate_limited", evidence: [] };
    if (!response.ok) return { id: "threatfox", status: "unavailable", evidence: [] };

    const iocs = normalizeThreatFoxPayload(await response.json());
    if (!iocs) return { id: "threatfox", status: "unavailable", evidence: [] };

    const interpretation = threatFoxEvidence(iocs, nowMs);
    return { id: "threatfox", status: interpretation.status, evidence: interpretation.evidence };
  } catch {
    return { id: "threatfox", status: "unavailable", evidence: [] };
  }
}

interface IpApiOutcome extends ProviderOutcome {
  geo: ReputationGeo | null;
  network: ReputationNetwork | null;
  flags: { proxy: boolean; hosting: boolean; mobile: boolean };
  reverse: string | null;
}

async function queryIpApi(ip: string): Promise<IpApiOutcome> {
  const data = await lookupIpApi(ip, { timeoutMs: HTTP_TIMEOUT_MS });

  if (!data) {
    return {
      id: "ip-api",
      status: "unavailable",
      evidence: [],
      geo: null,
      network: null,
      flags: { proxy: false, hosting: false, mobile: false },
      reverse: null,
    };
  }

  const proxy = Boolean(data.proxy);
  const hosting = Boolean(data.hosting);
  const mobile = Boolean(data.mobile);
  const reverse = data.reverse || null;
  const connectionType = detectConnectionType({
    isp: data.isp || "",
    org: data.org || "",
    as: data.as || "",
    mobile,
    hosting,
    proxy,
  });
  const evidence: RawEvidence[] = [];

  if (proxy) {
    evidence.push({
      sourceId: "ip-api",
      category: "vpn",
      reason: "ipapi_vpn",
      weight: 0,
      confidence: 75,
      freshness: 1,
    });
  }
  if (hosting) {
    evidence.push({
      sourceId: "ip-api",
      category: "hosting",
      reason: "ipapi_hosting",
      weight: 0,
      confidence: 85,
      freshness: 1,
    });
  }
  if (mobile) {
    evidence.push({
      sourceId: "ip-api",
      category: "mobile",
      reason: "ipapi_mobile",
      weight: 0,
      confidence: 85,
      freshness: 1,
    });
  }

  const residentialEstimated =
    !proxy &&
    !hosting &&
    !mobile &&
    (connectionType === "dsl" || connectionType === "cable" || isDynamicReverseDns(reverse));

  if (residentialEstimated) {
    evidence.push({
      sourceId: "ip-api",
      category: "residential",
      reason: "residential_estimate",
      weight: 0,
      confidence: 60,
      freshness: 1,
      detail: reverse || undefined,
    });
  }

  return {
    id: "ip-api",
    status: "available",
    evidence,
    geo: {
      country: data.country || "",
      countryCode: data.countryCode || "",
      region: data.regionName || "",
      city: data.city || "",
    },
    network: {
      as: data.as || "",
      asname: data.asname || "",
      isp: data.isp || "",
      org: data.org || "",
    },
    flags: { proxy, hosting, mobile },
    reverse,
  };
}

const DYNAMIC_REVERSE_DNS =
  /(^|[-.])(dip|dipo|dyn|dynamic|pool|pools|ppp|pppoe|pppd|dhcp|dial|dialup|modem|dslb|dsl|cable)\d*([-.]|$)/i;

function isDynamicReverseDns(reverse: string | null): boolean {
  return reverse !== null && DYNAMIC_REVERSE_DNS.test(reverse);
}

/** Collects evidence from all providers concurrently (allSettled semantics). */
export async function collectReputation(ip: string, family: 4 | 6): Promise<ReputationQueryResult> {
  const nowMs = Date.now();
  const reversed = family === 4 ? reverseIpv4ForDnsbl(ip) : ipv6ToNibbleFormat(ip);
  const httpblKey = process.env.HTTPBL_ACCESS_KEY?.trim() || "";

  const tasks: Promise<ProviderOutcome | IpApiOutcome>[] = [
    reversed
      ? queryDnsbl("spamhaus-zen", `${reversed}.zen.spamhaus.org`, (records) => interpretZenResponse(records))
      : Promise.resolve(unsupportedOutcome("spamhaus-zen")),
    family === 4 && reversed
      ? queryDnsbl("spamcop", `${reversed}.bl.spamcop.net`, (records) => interpretSpamcopResponse(records))
      : Promise.resolve(unsupportedOutcome("spamcop")),
    family === 4 && reversed
      ? queryDnsbl("barracuda", `${reversed}.b.barracudacentral.org`, (records) => interpretBarracudaResponse(records))
      : Promise.resolve(unsupportedOutcome("barracuda")),
    reversed
      ? queryDnsbl("dronebl", `${reversed}.dnsbl.dronebl.org`, (records) => interpretDroneblResponse(records))
      : Promise.resolve(unsupportedOutcome("dronebl")),
    queryBlocklistDe(ip, family, nowMs),
    family === 4
      ? matchFeodo(ip, nowMs).then((result) => ({ id: "feodo-tracker", ...result }))
      : Promise.resolve(unsupportedOutcome("feodo-tracker")),
    matchDrop(ip, family).then((result) => ({ id: "spamhaus-drop", ...result })),
    queryGreyNoise(ip, family, nowMs),
    queryAbuseIpDb(ip, nowMs),
    httpblKey && family === 4 && reversed
      ? queryDnsbl(
          "httpbl",
          `${httpblKey}.${reversed}.${HTTPBL_ZONE}`,
          (records) => interpretHttpblResponse(records, nowMs),
        )
      : Promise.resolve(notConfiguredOutcome("httpbl")),
    queryThreatFox(ip, nowMs),
    queryIpApi(ip),
  ];

  const settled = await Promise.allSettled(tasks);

  const sources: SourceResult[] = [];
  const evidence: RawEvidence[] = [];
  let geo: ReputationGeo | null = null;
  let network: ReputationNetwork | null = null;
  let networkContext: NetworkContext | null = null;
  let torFlag = false;

  for (const result of settled) {
    if (result.status === "rejected") continue;
    const outcome = result.value;

    if ("geo" in outcome) {
      const ipApi = outcome as IpApiOutcome;
      sources.push({ id: ipApi.id, status: ipApi.status });
      evidence.push(...ipApi.evidence);
      geo = ipApi.geo;
      network = ipApi.network;
      if (ipApi.status === "available") {
        networkContext = {
          connectionType: detectConnectionType({
            isp: network?.isp ?? "",
            org: network?.org ?? "",
            as: network?.as ?? "",
            mobile: ipApi.flags.mobile,
            hosting: ipApi.flags.hosting,
            proxy: ipApi.flags.proxy,
          }),
          hosting: ipApi.flags.hosting,
          mobile: ipApi.flags.mobile,
          proxy: ipApi.flags.proxy,
          tor: false,
          residentialEstimated: ipApi.evidence.some((item) => item.category === "residential"),
          reverse: ipApi.reverse,
        };
      }
      continue;
    }

    if (outcome.id === "abuseipdb") {
      torFlag = outcome.evidence.some((item) => item.category === "tor");
    }

    sources.push({ id: outcome.id, status: outcome.status });
    evidence.push(...outcome.evidence);
  }

  if (torFlag && networkContext) {
    networkContext.tor = true;
  }

  const orderedSources = [...sources].sort(
    (a, b) => (SOURCE_ORDER.get(a.id) ?? SOURCE_ORDER.size) - (SOURCE_ORDER.get(b.id) ?? SOURCE_ORDER.size),
  );

  return { sources: orderedSources, evidence, geo, network, networkContext };
}
