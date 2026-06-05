import dns from "node:dns/promises";
import { isIPv4Address, isIPv6Address, stripIpv6Brackets } from "@/lib/network/target";
import type { ProviderResult, ReputationProvider } from "./types";

const PROVIDER_TIMEOUT_MS = 4_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, reason: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(reason)), timeoutMs);
    timer.unref?.();
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

// ---------- Spamhaus ZEN DNSBL ----------

function reverseIPv4(ip: string): string {
  return ip.split(".").reverse().join(".");
}

function reverseIPv6(ip: string): string {
  const normalized = stripIpv6Brackets(ip).toLowerCase();
  if (isIPv6Address(normalized) !== true) return "";
  try {
    // Expand fully to 8 groups of 4 hex digits
    const ipv4TailMatch = normalized.match(/(.+):(\d{1,3}(?:\.\d{1,3}){3})$/);
    const expandedInput = ipv4TailMatch
      ? `${ipv4TailMatch[1]}:${Number(ipv4TailMatch[2].split(".")[0]).toString(16).padStart(2, "0")}${Number(ipv4TailMatch[2].split(".")[1]).toString(16).padStart(2, "0")}:${Number(ipv4TailMatch[2].split(".")[2]).toString(16).padStart(2, "0")}${Number(ipv4TailMatch[2].split(".")[3]).toString(16).padStart(2, "0")}`
      : normalized;

    const [leftRaw, rightRaw] = expandedInput.split("::");
    const left = leftRaw ? leftRaw.split(":").filter(Boolean) : [];
    const right = rightRaw ? rightRaw.split(":").filter(Boolean) : [];
    const fill = 8 - left.length - right.length;
    const parts = [...left, ...Array.from({ length: fill }, () => "0"), ...right];
    // Each part is 4 hex digits → each nibble becomes a reversed segment
    return parts
      .map((part) => part.padStart(4, "0"))
      .join("")
      .split("")
      .reverse()
      .join(".");
  } catch {
    return "";
  }
}

async function querySpamhaus(ip: string): Promise<ProviderResult> {
  const family = isIPv4Address(ip) ? 4 : isIPv6Address(ip) ? 6 : 0;
  if (family === 0) {
    return { status: "error", reason: "Invalid IP address." };
  }

  // Spamhaus IPv6 support is incomplete in practice; treat IPv6 as unknown
  if (family === 6) {
    return { status: "unknown", reason: "IPv6 support limited for Spamhaus." };
  }

  const query = `${reverseIPv4(ip)}.zen.spamhaus.org`;

  try {
    const records = await withTimeout(
      dns.resolve4(query),
      PROVIDER_TIMEOUT_MS,
      "Spamhaus DNS query timed out.",
    );

    if (!records || records.length === 0) {
      return { status: "clean", reason: "No Spamhaus DNSBL match." };
    }

    const first = records[0];
    if (first.startsWith("127.0.0.")) {
      // Specific codes (not exhaustive, but covers the main ones)
      const code = Number(first.split(".").pop());
      if (code === 2 || code === 3) {
        return { status: "listed", reason: `Spamhaus listed (code ${first}).` };
      }
      if ([4, 5, 6, 7].includes(code)) {
        return { status: "suspicious", reason: `Snowshoe/protocol abuse (code ${first}).` };
      }
      if ([9, 10, 11].includes(code)) {
        return { status: "listed", reason: `Botnet/malware/CBL (code ${first}).` };
      }
      return { status: "suspicious", reason: `Spamhaus match (code ${first}).` };
    }

    return { status: "clean", reason: "No Spamhaus DNSBL match." };
  } catch (error) {
    const message = (error as Error)?.message || "";
    if (message.includes("ENODATA") || message.includes("ENOTFOUND") || message.includes("NXDOMAIN")) {
      return { status: "clean", reason: "No Spamhaus DNSBL match." };
    }
    return { status: "error", reason: `Spamhaus DNS error: ${message}` };
  }
}

export const spamhausDnsbl: ReputationProvider = {
  name: "Spamhaus ZEN",
  isConfigured: () => true,
  check: (ip, _signal) => querySpamhaus(ip),
};

// ---------- AbuseIPDB ----------

async function queryAbuseIpDb(ip: string): Promise<ProviderResult> {
  const key = process.env.ABUSEIPDB_API_KEY;
  if (!key) {
    return { status: "not_configured", reason: "ABUSEIPDB_API_KEY not set." };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`,
      {
        method: "GET",
        headers: {
          Key: key,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return { status: "error", reason: "AbuseIPDB rate limited." };
      }
      return { status: "error", reason: `AbuseIPDB HTTP ${response.status}.` };
    }

    const json = (await response.json()) as {
      data?: {
        abuseConfidenceScore?: number;
        totalReports?: number;
        lastReportedAt?: string;
      };
    };

    const score = json.data?.abuseConfidenceScore ?? 0;
    const totalReports = json.data?.totalReports ?? 0;
    const lastReported = json.data?.lastReportedAt;

    if (score >= 80) {
      return {
        status: "listed",
        score,
        reason: `High abuse confidence (${score}%, ${totalReports} reports).`,
        lastSeenAt: lastReported || undefined,
      };
    }

    if (score >= 25 || totalReports >= 2) {
      return {
        status: "suspicious",
        score,
        reason: `Some abuse reports (${score}%, ${totalReports} reports).`,
        lastSeenAt: lastReported || undefined,
      };
    }

    return {
      status: "clean",
      score,
      reason: totalReports > 0 ? `Few reports, low confidence (${score}%).` : "Clean." ,
    };
  } catch (error) {
    return { status: "error", reason: `AbuseIPDB request failed: ${(error as Error).message}` };
  } finally {
    clearTimeout(timer);
  }
}

export const abuseIpDb: ReputationProvider = {
  name: "AbuseIPDB",
  isConfigured: () => Boolean(process.env.ABUSEIPDB_API_KEY),
  check: (ip, _signal) => queryAbuseIpDb(ip),
};

// ---------- ip-api.com Heuristics ----------

async function queryIpApi(ip: string): Promise<ProviderResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,proxy,hosting,mobile,query`,
      {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return { status: "error", reason: `ip-api.com HTTP ${response.status}.` };
    }

    const json = (await response.json()) as {
      status?: string;
      message?: string;
      proxy?: boolean;
      hosting?: boolean;
      mobile?: boolean;
      query?: string;
    };

    if (json.status === "fail") {
      return { status: "unknown", reason: json.message || "ip-api.com returned fail." };
    }

    if (json.proxy) {
      return {
        status: "listed",
        reason: "Flagged as proxy/VPN/anonymizer.",
      };
    }

    if (json.hosting) {
      return {
        status: "suspicious",
        reason: "Flagged as hosting / datacenter.",
      };
    }

    return {
      status: "clean",
      reason: json.mobile ? "Mobile / residential." : "No proxy or hosting flags.",
    };
  } catch (error) {
    return {
      status: "error",
      reason: `ip-api.com request failed: ${(error as Error).message}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

export const ipApiReputation: ReputationProvider = {
  name: "ip-api.com",
  isConfigured: () => true,
  check: (ip, _signal) => queryIpApi(ip),
};

// ---------- AlienVault OTX ----------

async function queryAlienVaultOtx(ip: string): Promise<ProviderResult> {
  const key = process.env.OTX_API_KEY;
  if (!key) {
    return { status: "not_configured", reason: "OTX_API_KEY not set." };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://otx.alienvault.com/api/v1/indicators/IPv4/${encodeURIComponent(ip)}/reputation`,
      {
        method: "GET",
        headers: {
          "X-OTX-API-KEY": key,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { status: "clean", reason: "OTX has no reputation data for this IP." };
      }
      if (response.status === 429) {
        return { status: "error", reason: "OTX rate limited." };
      }
      return { status: "error", reason: `OTX HTTP ${response.status}.` };
    }

    const json = (await response.json()) as {
      reputation?: number;
      as?: string;
    };

    const reputation = json.reputation ?? null;
    if (reputation === null) {
      return { status: "unknown", reason: "OTX returned no reputation value." };
    }

    // Reputation scale from OTX: higher = more malicious. Thresholds heuristic.
    if (reputation >= 4) {
      return {
        status: "listed",
        score: reputation * 20,
        reason: `OTX reputation ${reputation}/10 — high malicious confidence.`,
      };
    }

    if (reputation >= 2) {
      return {
        status: "suspicious",
        score: reputation * 20,
        reason: `OTX reputation ${reputation}/10 — some suspicious signals.`,
      };
    }

    return {
      status: "clean",
      score: reputation * 20,
      reason: `OTX reputation ${reputation}/10 — low risk.`,
    };
  } catch (error) {
    return { status: "error", reason: `OTX request failed: ${(error as Error).message}` };
  } finally {
    clearTimeout(timer);
  }
}

export const alienVaultOtx: ReputationProvider = {
  name: "AlienVault OTX",
  isConfigured: () => Boolean(process.env.OTX_API_KEY),
  check: (ip, _signal) => queryAlienVaultOtx(ip),
};

export const ALL_PROVIDERS: ReputationProvider[] = [
  spamhausDnsbl,
  abuseIpDb,
  ipApiReputation,
  alienVaultOtx,
];
