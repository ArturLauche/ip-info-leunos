/**
 * In-memory cached feed loaders for high-confidence threat intelligence:
 * 1. Feodo Tracker (abuse.ch) botnet C2 IP dataset (refreshed every 10 min)
 * 2. Spamhaus DROP & DROPv6 hijacked/cybercriminal IP ranges (refreshed every 60 min)
 *
 * Feeds are downloaded once per TTL window, parsed into fast lookup structures,
 * and shared across all user requests. Failures degrade gracefully with stale cache
 * or null return, never breaking reputation lookups.
 */

export interface FeodoTrackerEntry {
  ip_address: string;
  port: number;
  status: "online" | "offline";
  hostname: string | null;
  as_number: number | null;
  as_name: string | null;
  country: string | null;
  first_seen: string | null;
  last_online: string | null;
  malware: string;
}

export interface SpamhausDropMatch {
  cidr: string;
  sblid: string;
  rir: string;
}

interface ParsedDropV4 {
  network: number;
  mask: number;
  cidr: string;
  sblid: string;
  rir: string;
}

interface ParsedDropV6 {
  network: bigint;
  mask: bigint;
  cidr: string;
  sblid: string;
  rir: string;
}

const FEODO_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const DROP_CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

// In-memory feed states
let feodoCache: { timestamp: number; map: Map<string, FeodoTrackerEntry> } | null = null;
let feodoPendingPromise: Promise<Map<string, FeodoTrackerEntry> | null> | null = null;

let dropCache: {
  timestamp: number;
  v4: ParsedDropV4[];
  v6: ParsedDropV6[];
} | null = null;
let dropPendingPromise: Promise<{ v4: ParsedDropV4[]; v6: ParsedDropV6[] } | null> | null = null;

export function ipv4ToUint32(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map(Number);
  if (octets.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return null;
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

export function ipv6ToBigInt(ip: string): bigint | null {
  try {
    const clean = ip.toLowerCase().replace(/^\[|\]$/g, "");
    // Handle embedded IPv4
    const v4Match = clean.match(/^(.*):(\d{1,3}(?:\.\d{1,3}){3})$/);
    let address = clean;
    if (v4Match) {
      const octets = v4Match[2].split(".").map(Number);
      if (octets.some((o) => o > 255)) return null;
      const hex = octets.map((o) => o.toString(16).padStart(2, "0"));
      address = `${v4Match[1]}:${hex[0]}${hex[1]}:${hex[2]}${hex[3]}`;
    }

    const [headStr, tailStr = ""] = address.split("::");
    const head = headStr ? headStr.split(":").filter(Boolean) : [];
    const tail = tailStr ? tailStr.split(":").filter(Boolean) : [];
    const missing = 8 - head.length - tail.length;
    if (missing < 0) return null;

    const fullGroups = [...head, ...Array(missing).fill("0"), ...tail];
    if (fullGroups.length !== 8) return null;

    let big = 0n;
    for (let i = 0; i < 8; i++) {
      const val = parseInt(fullGroups[i] || "0", 16);
      if (Number.isNaN(val) || val < 0 || val > 0xffff) return null;
      big = (big << 16n) | BigInt(val);
    }
    return big;
  } catch {
    return null;
  }
}

export function parseCidrV4(cidr: string, sblid = "", rir = ""): ParsedDropV4 | null {
  const [ipPart, bitsStr] = cidr.split("/");
  if (!ipPart || !bitsStr) return null;
  const bits = Number(bitsStr);
  if (Number.isNaN(bits) || bits < 0 || bits > 32) return null;
  const ipNum = ipv4ToUint32(ipPart);
  if (ipNum === null) return null;
  const mask = bits === 0 ? 0 : ((0xffffffff << (32 - bits)) >>> 0);
  const network = (ipNum & mask) >>> 0;
  return { network, mask, cidr, sblid, rir };
}

export function parseCidrV6(cidr: string, sblid = "", rir = ""): ParsedDropV6 | null {
  const [ipPart, bitsStr] = cidr.split("/");
  if (!ipPart || !bitsStr) return null;
  const bits = BigInt(bitsStr);
  if (bits < 0n || bits > 128n) return null;
  const ipBig = ipv6ToBigInt(ipPart);
  if (ipBig === null) return null;
  const mask = bits === 0n ? 0n : ((~0n << (128n - bits)) & ((1n << 128n) - 1n));
  const network = ipBig & mask;
  return { network, mask, cidr, sblid, rir };
}

/**
 * Loads or refreshes the Feodo Tracker dataset.
 */
export async function getFeodoTrackerDataset(): Promise<Map<string, FeodoTrackerEntry> | null> {
  const now = Date.now();
  if (feodoCache && now - feodoCache.timestamp < FEODO_CACHE_TTL_MS) {
    return feodoCache.map;
  }

  if (feodoPendingPromise) {
    return feodoPendingPromise;
  }

  feodoPendingPromise = (async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch("https://feodotracker.abuse.ch/downloads/ipblocklist.json", {
        headers: { "User-Agent": "ip-info-reputation-toolbox/1.0" },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        return feodoCache ? feodoCache.map : null;
      }

      const json = (await res.json()) as unknown;
      if (!Array.isArray(json)) {
        return feodoCache ? feodoCache.map : null;
      }

      const map = new Map<string, FeodoTrackerEntry>();
      for (const item of json) {
        if (typeof item === "object" && item !== null && typeof item.ip_address === "string") {
          map.set(item.ip_address.trim(), {
            ip_address: item.ip_address.trim(),
            port: Number(item.port) || 0,
            status: item.status === "online" ? "online" : "offline",
            hostname: item.hostname ?? null,
            as_number: typeof item.as_number === "number" ? item.as_number : null,
            as_name: typeof item.as_name === "string" ? item.as_name : null,
            country: typeof item.country === "string" ? item.country : null,
            first_seen: typeof item.first_seen === "string" ? item.first_seen : null,
            last_online: typeof item.last_online === "string" ? item.last_online : null,
            malware: typeof item.malware === "string" ? item.malware : "Unknown",
          });
        }
      }

      feodoCache = { timestamp: now, map };
      return map;
    } catch {
      return feodoCache ? feodoCache.map : null;
    } finally {
      feodoPendingPromise = null;
    }
  })();

  return feodoPendingPromise;
}

/**
 * Loads or refreshes the Spamhaus DROP & DROPv6 datasets.
 */
export async function getSpamhausDropDataset(): Promise<{
  v4: ParsedDropV4[];
  v6: ParsedDropV6[];
} | null> {
  const now = Date.now();
  if (dropCache && now - dropCache.timestamp < DROP_CACHE_TTL_MS) {
    return { v4: dropCache.v4, v6: dropCache.v6 };
  }

  if (dropPendingPromise) {
    return dropPendingPromise;
  }

  dropPendingPromise = (async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);

      const [resV4, resV6] = await Promise.allSettled([
        fetch("https://www.spamhaus.org/drop/drop_v4.json", {
          headers: { "User-Agent": "ip-info-reputation-toolbox/1.0" },
          signal: controller.signal,
        }),
        fetch("https://www.spamhaus.org/drop/drop_v6.json", {
          headers: { "User-Agent": "ip-info-reputation-toolbox/1.0" },
          signal: controller.signal,
        }),
      ]);
      clearTimeout(timer);

      const v4List: ParsedDropV4[] = [];
      if (resV4.status === "fulfilled" && resV4.value.ok) {
        const text = await resV4.value.text();
        const lines = text.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("{")) continue;
          try {
            const parsed = JSON.parse(trimmed);
            if (typeof parsed.cidr === "string") {
              const item = parseCidrV4(parsed.cidr, parsed.sblid || "", parsed.rir || "");
              if (item) v4List.push(item);
            }
          } catch {
            // ignore malformed line
          }
        }
      } else if (dropCache) {
        v4List.push(...dropCache.v4);
      }

      const v6List: ParsedDropV6[] = [];
      if (resV6.status === "fulfilled" && resV6.value.ok) {
        const text = await resV6.value.text();
        const lines = text.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("{")) continue;
          try {
            const parsed = JSON.parse(trimmed);
            if (typeof parsed.cidr === "string") {
              const item = parseCidrV6(parsed.cidr, parsed.sblid || "", parsed.rir || "");
              if (item) v6List.push(item);
            }
          } catch {
            // ignore malformed line
          }
        }
      } else if (dropCache) {
        v6List.push(...dropCache.v6);
      }

      const result = { v4: v4List, v6: v6List };
      dropCache = { timestamp: now, ...result };
      return result;
    } catch {
      return dropCache ? { v4: dropCache.v4, v6: dropCache.v6 } : null;
    } finally {
      dropPendingPromise = null;
    }
  })();

  return dropPendingPromise;
}

/**
 * Checks an IP against Feodo Tracker.
 */
export async function lookupFeodoTracker(ip: string): Promise<FeodoTrackerEntry | null> {
  const dataset = await getFeodoTrackerDataset();
  if (!dataset) return null;
  return dataset.get(ip.trim()) ?? null;
}

/**
 * Checks an IP against Spamhaus DROP or DROPv6.
 */
export async function lookupSpamhausDrop(
  ip: string,
  family: "IPv4" | "IPv6",
): Promise<SpamhausDropMatch | null> {
  const dataset = await getSpamhausDropDataset();
  if (!dataset) return null;

  if (family === "IPv4") {
    const ipNum = ipv4ToUint32(ip);
    if (ipNum === null) return null;
    for (const entry of dataset.v4) {
      if (((ipNum & entry.mask) >>> 0) === entry.network) {
        return { cidr: entry.cidr, sblid: entry.sblid, rir: entry.rir };
      }
    }
  } else {
    const ipBig = ipv6ToBigInt(ip);
    if (ipBig === null) return null;
    for (const entry of dataset.v6) {
      if ((ipBig & entry.mask) === entry.network) {
        return { cidr: entry.cidr, sblid: entry.sblid, rir: entry.rir };
      }
    }
  }

  return null;
}
