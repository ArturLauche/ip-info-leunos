import { Resolver } from "node:dns/promises";
import {
  type ProviderSourceResult,
  type EvidenceItem,
  reverseIpv4ForDnsbl,
  ipv6ToNibbleFormat,
  decodeSpamhausZen,
  decodeSpamCop,
  decodeBarracuda,
  decodeDroneBl,
  decodeBlocklistDe,
  decodeHoneyPot,
} from "./reputation";
import { lookupFeodoTracker, lookupSpamhausDrop } from "./reputation-feeds";

const DNS_SERVERS = ["8.8.8.8", "1.1.1.1", "9.9.9.9"];

function createResolver(): Resolver {
  const resolver = new Resolver();
  try {
    resolver.setServers(DNS_SERVERS);
  } catch {
    // Keep system fallback if setServers fails
  }
  return resolver;
}

async function queryDnsWithTimeout(
  resolver: Resolver,
  domain: string,
  timeoutMs = 2500,
): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const records = await Promise.race([
      resolver.resolve4(domain),
      new Promise<string[]>((_, reject) => {
        controller.signal.addEventListener("abort", () => {
          reject(new Error("DNS query timeout"));
        });
      }),
    ]);
    return records;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 1. Spamhaus ZEN (DNSBL, IPv4 & IPv6)
 */
export async function checkSpamhausZen(
  ip: string,
  family: "IPv4" | "IPv6",
  resolver = createResolver(),
): Promise<ProviderSourceResult> {
  const start = Date.now();
  const rev = family === "IPv4" ? reverseIpv4ForDnsbl(ip) : ipv6ToNibbleFormat(ip);

  if (!rev) {
    return {
      id: "spamhaus-zen",
      name: "Spamhaus ZEN",
      type: "dnsbl",
      status: "unavailable",
      supportsIpv6: true,
      statusMessage: "Invalid IP address formatting for DNSBL lookup.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }

  try {
    const records = await queryDnsWithTimeout(resolver, `${rev}.zen.spamhaus.org`);
    const decoded = decodeSpamhausZen(records);
    return {
      id: "spamhaus-zen",
      name: "Spamhaus ZEN",
      type: "dnsbl",
      status: decoded.status,
      supportsIpv6: true,
      statusMessage: decoded.statusMessage,
      rawCodes: decoded.rawCodes,
      evidence: decoded.evidence,
      responseTimeMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        id: "spamhaus-zen",
        name: "Spamhaus ZEN",
        type: "dnsbl",
        status: "clean",
        supportsIpv6: true,
        statusMessage: "Not listed in Spamhaus ZEN.",
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }
    return {
      id: "spamhaus-zen",
      name: "Spamhaus ZEN",
      type: "dnsbl",
      status: "unavailable",
      supportsIpv6: true,
      statusMessage: "DNS lookup failed or timed out.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }
}

/**
 * 2. SpamCop (DNSBL, IPv4 only)
 */
export async function checkSpamCop(
  ip: string,
  family: "IPv4" | "IPv6",
  resolver = createResolver(),
): Promise<ProviderSourceResult> {
  const start = Date.now();
  if (family === "IPv6") {
    return {
      id: "spamcop",
      name: "SpamCop",
      type: "dnsbl",
      status: "unsupported",
      supportsIpv6: false,
      statusMessage: "SpamCop does not support IPv6 address queries.",
      evidence: [],
      responseTimeMs: 0,
    };
  }

  const rev = reverseIpv4ForDnsbl(ip);
  try {
    const records = await queryDnsWithTimeout(resolver, `${rev}.bl.spamcop.net`);
    const decoded = decodeSpamCop(records);
    return {
      id: "spamcop",
      name: "SpamCop",
      type: "dnsbl",
      status: decoded.status,
      supportsIpv6: false,
      statusMessage: decoded.statusMessage,
      rawCodes: decoded.rawCodes,
      evidence: decoded.evidence,
      responseTimeMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        id: "spamcop",
        name: "SpamCop",
        type: "dnsbl",
        status: "clean",
        supportsIpv6: false,
        statusMessage: "Not listed on SpamCop.",
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }
    return {
      id: "spamcop",
      name: "SpamCop",
      type: "dnsbl",
      status: "unavailable",
      supportsIpv6: false,
      statusMessage: "DNS lookup failed or timed out.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }
}

/**
 * 3. Barracuda BRBL (DNSBL, IPv4 only)
 */
export async function checkBarracuda(
  ip: string,
  family: "IPv4" | "IPv6",
  resolver = createResolver(),
): Promise<ProviderSourceResult> {
  const start = Date.now();
  if (family === "IPv6") {
    return {
      id: "barracuda",
      name: "Barracuda BRBL",
      type: "dnsbl",
      status: "unsupported",
      supportsIpv6: false,
      statusMessage: "Barracuda BRBL does not support IPv6 address queries.",
      evidence: [],
      responseTimeMs: 0,
    };
  }

  const rev = reverseIpv4ForDnsbl(ip);
  try {
    const records = await queryDnsWithTimeout(resolver, `${rev}.b.barracudacentral.org`);
    const decoded = decodeBarracuda(records);
    return {
      id: "barracuda",
      name: "Barracuda BRBL",
      type: "dnsbl",
      status: decoded.status,
      supportsIpv6: false,
      statusMessage: decoded.statusMessage,
      rawCodes: decoded.rawCodes,
      evidence: decoded.evidence,
      responseTimeMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        id: "barracuda",
        name: "Barracuda BRBL",
        type: "dnsbl",
        status: "clean",
        supportsIpv6: false,
        statusMessage: "Not listed on Barracuda BRBL.",
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }
    return {
      id: "barracuda",
      name: "Barracuda BRBL",
      type: "dnsbl",
      status: "unavailable",
      supportsIpv6: false,
      statusMessage: "DNS lookup failed or timed out.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }
}

/**
 * 4. DroneBL (DNSBL, IPv4 & IPv6)
 */
export async function checkDroneBl(
  ip: string,
  family: "IPv4" | "IPv6",
  resolver = createResolver(),
): Promise<ProviderSourceResult> {
  const start = Date.now();
  const rev = family === "IPv4" ? reverseIpv4ForDnsbl(ip) : ipv6ToNibbleFormat(ip);

  if (!rev) {
    return {
      id: "dronebl",
      name: "DroneBL",
      type: "dnsbl",
      status: "unavailable",
      supportsIpv6: true,
      statusMessage: "Invalid IP address formatting for DroneBL lookup.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }

  try {
    const records = await queryDnsWithTimeout(resolver, `${rev}.dnsbl.dronebl.org`);
    const decoded = decodeDroneBl(records);
    return {
      id: "dronebl",
      name: "DroneBL",
      type: "dnsbl",
      status: decoded.status,
      supportsIpv6: true,
      statusMessage: decoded.statusMessage,
      rawCodes: decoded.rawCodes,
      evidence: decoded.evidence,
      responseTimeMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        id: "dronebl",
        name: "DroneBL",
        type: "dnsbl",
        status: "clean",
        supportsIpv6: true,
        statusMessage: "Not listed on DroneBL.",
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }
    return {
      id: "dronebl",
      name: "DroneBL",
      type: "dnsbl",
      status: "unavailable",
      supportsIpv6: true,
      statusMessage: "DNS lookup failed or timed out.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }
}

/**
 * 5. blocklist.de (DNSBL + HTTP API, IPv4 only)
 */
export async function checkBlocklistDe(
  ip: string,
  family: "IPv4" | "IPv6",
  resolver = createResolver(),
): Promise<ProviderSourceResult> {
  const start = Date.now();
  if (family === "IPv6") {
    return {
      id: "blocklist-de",
      name: "blocklist.de",
      type: "dnsbl",
      status: "unsupported",
      supportsIpv6: false,
      statusMessage: "blocklist.de DNSBL is designed for IPv4 addresses.",
      evidence: [],
      responseTimeMs: 0,
    };
  }

  const rev = reverseIpv4ForDnsbl(ip);
  let dnsRecords: string[] = [];
  try {
    dnsRecords = await queryDnsWithTimeout(resolver, `${rev}.bl.blocklist.de`);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code !== "ENOTFOUND" && code !== "ENODATA") {
      // DNS error occurred, proceed to check API as fallback
    }
  }

  // If matched or for richer data, query API with short timeout
  let httpData: { attacks?: number; reports?: number } | null = null;
  if (dnsRecords.some((r) => r.startsWith("127."))) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(
        `https://api.blocklist.de/api.php?ip=${encodeURIComponent(ip)}&format=json`,
        { signal: controller.signal },
      );
      clearTimeout(timer);
      if (res.ok) {
        const json = (await res.json()) as { attacks?: number; reports?: number };
        httpData = {
          attacks: Number(json.attacks) || 1,
          reports: Number(json.reports) || 1,
        };
      }
    } catch {
      // API lookup failed, DNSBL records suffice
    }
  }

  const decoded = decodeBlocklistDe(dnsRecords, httpData);
  return {
    id: "blocklist-de",
    name: "blocklist.de",
    type: "dnsbl",
    status: decoded.status,
    supportsIpv6: false,
    statusMessage: decoded.statusMessage,
    rawCodes: decoded.rawCodes,
    evidence: decoded.evidence,
    responseTimeMs: Date.now() - start,
  };
}

/**
 * 6. Feodo Tracker (abuse.ch botnet C2 feed)
 */
export async function checkFeodoTracker(
  ip: string,
  family: "IPv4" | "IPv6",
): Promise<ProviderSourceResult> {
  const start = Date.now();
  if (family === "IPv6") {
    return {
      id: "feodo-tracker",
      name: "Feodo Tracker (abuse.ch)",
      type: "threat_feed",
      status: "unsupported",
      supportsIpv6: false,
      statusMessage: "Feodo Tracker dataset currently tracks IPv4 C2 infrastructure.",
      evidence: [],
      responseTimeMs: 0,
    };
  }

  try {
    const entry = await lookupFeodoTracker(ip);
    if (!entry) {
      return {
        id: "feodo-tracker",
        name: "Feodo Tracker (abuse.ch)",
        type: "threat_feed",
        status: "clean",
        supportsIpv6: false,
        statusMessage: "No botnet C2 activity found in Feodo Tracker.",
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }

    const evidence: EvidenceItem[] = [
      {
        id: "feodo-c2",
        sourceId: "feodo-tracker",
        sourceName: "Feodo Tracker",
        category: "botnet",
        severity: entry.status === "online" ? "critical" : "high",
        title: `Feodo Tracker C2: ${entry.malware}`,
        summary: `Confirmed botnet command & control (C2) server associated with ${entry.malware}. Status: ${entry.status}. First seen: ${entry.first_seen || "N/A"}, Last online: ${entry.last_online || "N/A"}.`,
        family: entry.malware,
        firstSeen: entry.first_seen,
        lastSeen: entry.last_online,
      },
    ];

    return {
      id: "feodo-tracker",
      name: "Feodo Tracker (abuse.ch)",
      type: "threat_feed",
      status: "matched",
      supportsIpv6: false,
      statusMessage: `Identified as active ${entry.malware} botnet C2 server (${entry.status}).`,
      evidence,
      responseTimeMs: Date.now() - start,
    };
  } catch {
    return {
      id: "feodo-tracker",
      name: "Feodo Tracker (abuse.ch)",
      type: "threat_feed",
      status: "unavailable",
      supportsIpv6: false,
      statusMessage: "Failed to query Feodo Tracker dataset.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }
}

/**
 * 7. Spamhaus DROP & DROPv6 (threat feed)
 */
export async function checkSpamhausDrop(
  ip: string,
  family: "IPv4" | "IPv6",
): Promise<ProviderSourceResult> {
  const start = Date.now();
  try {
    const match = await lookupSpamhausDrop(ip, family);
    if (!match) {
      return {
        id: "spamhaus-drop",
        name: "Spamhaus DROP",
        type: "threat_feed",
        status: "clean",
        supportsIpv6: true,
        statusMessage: "Not located within a Spamhaus DROP malicious range.",
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }

    const evidence: EvidenceItem[] = [
      {
        id: `drop-${match.sblid}`,
        sourceId: "spamhaus-drop",
        sourceName: "Spamhaus DROP",
        category: "malware",
        severity: "critical",
        title: `Spamhaus DROP (${match.sblid})`,
        summary: `Part of an allocated/leased IP range entirely controlled by professional cybercriminals or spammers (${match.cidr}, RIR: ${match.rir.toUpperCase()}).`,
        targetSubnet: match.cidr,
      },
    ];

    return {
      id: "spamhaus-drop",
      name: "Spamhaus DROP",
      type: "threat_feed",
      status: "matched",
      supportsIpv6: true,
      statusMessage: `Part of malicious network range ${match.cidr} (${match.sblid}).`,
      evidence,
      responseTimeMs: Date.now() - start,
    };
  } catch {
    return {
      id: "spamhaus-drop",
      name: "Spamhaus DROP",
      type: "threat_feed",
      status: "unavailable",
      supportsIpv6: true,
      statusMessage: "Failed to evaluate Spamhaus DROP feed.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }
}

/**
 * 8. GreyNoise Community (Scanner intelligence API)
 */
export async function checkGreyNoise(
  ip: string,
  _family: "IPv4" | "IPv6",
): Promise<ProviderSourceResult> {
  void _family;
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (process.env.GREYNOISE_API_KEY) {
    headers["key"] = process.env.GREYNOISE_API_KEY;
  }

  try {
    const res = await fetch(`https://api.greynoise.io/v3/community/${encodeURIComponent(ip)}`, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.status === 429) {
      return {
        id: "greynoise",
        name: "GreyNoise Community",
        type: "scanner_intel",
        status: "rate_limited",
        supportsIpv6: true,
        statusMessage: "GreyNoise rate limit exceeded.",
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }

    if (!res.ok) {
      return {
        id: "greynoise",
        name: "GreyNoise Community",
        type: "scanner_intel",
        status: "clean",
        supportsIpv6: true,
        statusMessage: "IP not observed scanning the Internet.",
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }

    const data = (await res.json()) as {
      noise?: boolean;
      riot?: boolean;
      classification?: string;
      message?: string;
    };

    if (data.noise) {
      const isMalicious = data.classification === "malicious";
      const isBenign = data.classification === "benign";

      if (isBenign) {
        return {
          id: "greynoise",
          name: "GreyNoise Community",
          type: "scanner_intel",
          status: "clean",
          supportsIpv6: true,
          statusMessage: "Observed conducting benign/authorized Internet scanning.",
          evidence: [
            {
              id: "greynoise-benign",
              sourceId: "greynoise",
              sourceName: "GreyNoise",
              category: "scanner",
              severity: "info",
              isPolicy: true,
              title: "GreyNoise: Benign Scanner",
              summary: "Known benign Internet research, inventory, or security scanner.",
            },
          ],
          responseTimeMs: Date.now() - start,
        };
      }

      return {
        id: "greynoise",
        name: "GreyNoise Community",
        type: "scanner_intel",
        status: "matched",
        supportsIpv6: true,
        statusMessage: isMalicious
          ? "Observed conducting malicious Internet scanning."
          : "Observed scanning the Internet.",
        evidence: [
          {
            id: "greynoise-noise",
            sourceId: "greynoise",
            sourceName: "GreyNoise",
            category: "scanner",
            severity: isMalicious ? "medium" : "low",
            title: isMalicious ? "GreyNoise: Malicious Scanner" : "GreyNoise: Internet Scanner",
            summary: isMalicious
              ? "Observed scanning the Internet with malicious or opportunistic intent."
              : "Observed actively probing ports and services across the Internet.",
          },
        ],
        responseTimeMs: Date.now() - start,
      };
    }

    if (data.riot) {
      return {
        id: "greynoise",
        name: "GreyNoise Community",
        type: "scanner_intel",
        status: "clean",
        supportsIpv6: true,
        statusMessage: "Verified legitimate business / cloud provider (GreyNoise RIOT).",
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }

    return {
      id: "greynoise",
      name: "GreyNoise Community",
      type: "scanner_intel",
      status: "clean",
      supportsIpv6: true,
      statusMessage: "IP not observed scanning the Internet.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  } catch {
    return {
      id: "greynoise",
      name: "GreyNoise Community",
      type: "scanner_intel",
      status: "unavailable",
      supportsIpv6: true,
      statusMessage: "Failed to connect to GreyNoise Community API.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }
}

/**
 * 9. AbuseIPDB (Abuse database, optional API key)
 */
export async function checkAbuseIpDb(
  ip: string,
  _family: "IPv4" | "IPv6",
): Promise<ProviderSourceResult & { rawAbuse?: unknown }> {
  void _family;
  const start = Date.now();
  const apiKey = process.env.ABUSEIPDB_API_KEY;

  if (!apiKey) {
    return {
      id: "abuseipdb",
      name: "AbuseIPDB",
      type: "abuse_database",
      status: "not_configured",
      supportsIpv6: true,
      statusMessage: "ABUSEIPDB_API_KEY is not configured.",
      evidence: [],
      responseTimeMs: 0,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose=false`,
      {
        headers: {
          Key: apiKey,
          Accept: "application/json",
        },
        signal: controller.signal,
      },
    );
    clearTimeout(timer);

    if (res.status === 429) {
      return {
        id: "abuseipdb",
        name: "AbuseIPDB",
        type: "abuse_database",
        status: "rate_limited",
        supportsIpv6: true,
        statusMessage: "AbuseIPDB rate limit exceeded.",
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }

    if (!res.ok) {
      return {
        id: "abuseipdb",
        name: "AbuseIPDB",
        type: "abuse_database",
        status: "unavailable",
        supportsIpv6: true,
        statusMessage: `AbuseIPDB API returned status ${res.status}.`,
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }

    const payload = (await res.json()) as {
      data?: {
        abuseConfidenceScore?: number;
        totalReports?: number;
        lastReportedAt?: string;
        isTor?: boolean;
      };
    };

    const data = payload.data || {};
    const confidence = Number(data.abuseConfidenceScore) || 0;
    const reports = Number(data.totalReports) || 0;
    const lastReported = data.lastReportedAt || null;

    if (confidence >= 20 || reports >= 3) {
      const severity: EvidenceItem["severity"] =
        confidence >= 80 ? "critical" : confidence >= 50 ? "high" : "medium";

      const evidence: EvidenceItem[] = [
        {
          id: "abuseipdb-reports",
          sourceId: "abuseipdb",
          sourceName: "AbuseIPDB",
          category: "bruteforce",
          severity,
          title: `AbuseIPDB: ${confidence}% Confidence`,
          summary: `${reports} abuse reports in the last 90 days with ${confidence}% abuse confidence score. Last reported: ${lastReported || "recently"}.`,
          confidence,
          reportsCount: reports,
          lastSeen: lastReported,
        },
      ];

      return {
        id: "abuseipdb",
        name: "AbuseIPDB",
        type: "abuse_database",
        status: "matched",
        supportsIpv6: true,
        statusMessage: `${reports} abuse reports recorded (confidence ${confidence}%).`,
        evidence,
        responseTimeMs: Date.now() - start,
        rawAbuse: data,
      };
    }

    return {
      id: "abuseipdb",
      name: "AbuseIPDB",
      type: "abuse_database",
      status: "clean",
      supportsIpv6: true,
      statusMessage: reports === 0 ? "0 abuse reports in the last 90 days." : "Low abuse confidence.",
      evidence: [],
      responseTimeMs: Date.now() - start,
      rawAbuse: data,
    };
  } catch {
    return {
      id: "abuseipdb",
      name: "AbuseIPDB",
      type: "abuse_database",
      status: "unavailable",
      supportsIpv6: true,
      statusMessage: "Failed to connect to AbuseIPDB API.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }
}

/**
 * 10. ThreatFox (abuse.ch IOC API, optional API key)
 */
export async function checkThreatFox(
  ip: string,
  _family: "IPv4" | "IPv6",
): Promise<ProviderSourceResult> {
  void _family;
  const start = Date.now();
  const apiKey = process.env.THREATFOX_API_KEY;

  if (!apiKey) {
    return {
      id: "threatfox",
      name: "ThreatFox (abuse.ch)",
      type: "threat_feed",
      status: "not_configured",
      supportsIpv6: true,
      statusMessage: "THREATFOX_API_KEY is not configured.",
      evidence: [],
      responseTimeMs: 0,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch("https://threatfox-api.abuse.ch/api/v1/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Auth-Key": apiKey,
      },
      body: JSON.stringify({ query: "search_ioc", search_term: ip }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return {
        id: "threatfox",
        name: "ThreatFox (abuse.ch)",
        type: "threat_feed",
        status: "unavailable",
        supportsIpv6: true,
        statusMessage: `ThreatFox API returned status ${res.status}.`,
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }

    const data = (await res.json()) as {
      query_status?: string;
      data?: Array<{
        threat_type?: string;
        malware_printable?: string;
        confidence_level?: number;
        first_seen?: string;
      }>;
    };

    if (data.query_status === "ok" && Array.isArray(data.data) && data.data.length > 0) {
      const top = data.data[0];
      const malware = top.malware_printable || "Malware";
      const evidence: EvidenceItem[] = [
        {
          id: "threatfox-ioc",
          sourceId: "threatfox",
          sourceName: "ThreatFox",
          category: "malware",
          severity: "high",
          title: `ThreatFox IOC: ${malware}`,
          summary: `Indicator of Compromise (IOC) matching ${malware} (${top.threat_type || "threat"}). Confidence: ${top.confidence_level || 100}%.`,
          confidence: top.confidence_level,
          family: malware,
          firstSeen: top.first_seen,
        },
      ];

      return {
        id: "threatfox",
        name: "ThreatFox (abuse.ch)",
        type: "threat_feed",
        status: "matched",
        supportsIpv6: true,
        statusMessage: `Active IOC recorded for ${malware}.`,
        evidence,
        responseTimeMs: Date.now() - start,
      };
    }

    return {
      id: "threatfox",
      name: "ThreatFox (abuse.ch)",
      type: "threat_feed",
      status: "clean",
      supportsIpv6: true,
      statusMessage: "No Indicators of Compromise (IOCs) found.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  } catch {
    return {
      id: "threatfox",
      name: "ThreatFox (abuse.ch)",
      type: "threat_feed",
      status: "unavailable",
      supportsIpv6: true,
      statusMessage: "Failed to connect to ThreatFox API.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }
}

/**
 * 11. Project Honey Pot HTTP:BL (DNSBL, optional key)
 */
export async function checkProjectHoneyPot(
  ip: string,
  family: "IPv4" | "IPv6",
  resolver = createResolver(),
): Promise<ProviderSourceResult> {
  const start = Date.now();
  const apiKey = process.env.HONEYPOT_API_KEY || process.env.PROJECT_HONEYPOT_API_KEY;

  if (!apiKey) {
    return {
      id: "project-honeypot",
      name: "Project Honey Pot",
      type: "dnsbl",
      status: "not_configured",
      supportsIpv6: false,
      statusMessage: "HONEYPOT_API_KEY is not configured.",
      evidence: [],
      responseTimeMs: 0,
    };
  }

  if (family === "IPv6") {
    return {
      id: "project-honeypot",
      name: "Project Honey Pot",
      type: "dnsbl",
      status: "unsupported",
      supportsIpv6: false,
      statusMessage: "Project Honey Pot HTTP:BL only supports IPv4 addresses.",
      evidence: [],
      responseTimeMs: 0,
    };
  }

  const rev = reverseIpv4ForDnsbl(ip);
  try {
    const records = await queryDnsWithTimeout(
      resolver,
      `${apiKey}.${rev}.dnsbl.httpbl.org`,
    );
    const decoded = decodeHoneyPot(records);
    return {
      id: "project-honeypot",
      name: "Project Honey Pot",
      type: "dnsbl",
      status: decoded.status,
      supportsIpv6: false,
      statusMessage: decoded.statusMessage,
      rawCodes: decoded.rawCodes,
      evidence: decoded.evidence,
      responseTimeMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        id: "project-honeypot",
        name: "Project Honey Pot",
        type: "dnsbl",
        status: "clean",
        supportsIpv6: false,
        statusMessage: "Not listed in Project Honey Pot.",
        evidence: [],
        responseTimeMs: Date.now() - start,
      };
    }
    return {
      id: "project-honeypot",
      name: "Project Honey Pot",
      type: "dnsbl",
      status: "unavailable",
      supportsIpv6: false,
      statusMessage: "DNS query failed or timed out.",
      evidence: [],
      responseTimeMs: Date.now() - start,
    };
  }
}
