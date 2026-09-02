import { z } from "zod";
import type { RawEvidence, SourceStatus } from "./model";
import { isIPv6Address, stripIpv6Brackets } from "@/lib/network/target";

/**
 * Downloadable threat feeds (abuse.ch Feodo Tracker, Spamhaus DROP) are
 * fetched server-side on a slow schedule, cached in memory, and queried
 * locally so a user lookup never downloads the full dataset per request and
 * never sends the queried IP to these providers.
 *
 * Refresh intervals follow provider terms: Feodo Tracker recommends at least
 * 15 minutes between downloads; Spamhaus DROP must not be fetched more than
 * once per hour.
 */

const FEODO_URL = "https://feodotracker.abuse.ch/downloads/ipblocklist.json";
const FEODO_TTL_MS = 15 * 60_000;
const DROP_V4_URL = "https://www.spamhaus.org/drop/drop_v4.json";
const DROP_V6_URL = "https://www.spamhaus.org/drop/drop_v6.json";
const DROP_TTL_MS = 60 * 60_000;
const FEED_STALE_MS = 24 * 60 * 60_000;
const FEED_TIMEOUT_MS = 6_000;
const FEED_MAX_BYTES = 3_000_000;
const USER_AGENT = "ip-info-leunos-reputation/1.0";

export interface FeedMatchResult {
  status: SourceStatus;
  evidence: RawEvidence[];
}

const feodoEntrySchema = z
  .object({
    ip_address: z.string(),
    port: z.number().nullable().optional(),
    status: z.string().nullable().optional(),
    malware: z.string().nullable().optional(),
    first_seen: z.string().nullable().optional(),
    last_online: z.string().nullable().optional(),
  })
  .passthrough();

const dropEntrySchema = z
  .object({
    cidr: z.string(),
    sblid: z.string().nullable().optional(),
    rir: z.string().nullable().optional(),
  })
  .passthrough();

export interface FeodoEntry {
  ip: string;
  status: string | null;
  malware: string | null;
  firstSeen: string | null;
  lastOnline: string | null;
}

export function parseFeodoPayload(payload: unknown): FeodoEntry[] | null {
  const parsed = z.array(feodoEntrySchema).safeParse(payload);
  if (!parsed.success) return null;

  return parsed.data.map((entry) => ({
    ip: entry.ip_address.trim(),
    status: entry.status ?? null,
    malware: entry.malware ?? null,
    firstSeen: normalizeFeedDate(entry.first_seen),
    lastOnline: normalizeFeedDate(entry.last_online),
  }));
}

/** Accepts "2026-03-07" and "2022-06-04 21:24:53" and returns an ISO string. */
function normalizeFeedDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iso = trimmed.includes(" ") ? trimmed.replace(" ", "T") + "Z" : `${trimmed}T00:00:00Z`;
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

export interface CidrRange {
  network: bigint;
  bits: number;
  width: 32 | 128;
}

export interface DropEntry {
  range: CidrRange;
  sblid: string | null;
  cidr: string;
}

function prefixMask(bits: number, width: 32 | 128): bigint {
  if (bits <= 0) return 0n;
  return ((1n << BigInt(bits)) - 1n) << BigInt(width - bits);
}

export function parseCidr(cidr: string): CidrRange | null {
  const [address, bitsText] = cidr.split("/");
  if (!address || !bitsText) return null;

  const bits = Number(bitsText);
  if (!Number.isInteger(bits) || bits < 0 || bits > 128) return null;

  const parsed = parseIpAddress(address);
  if (parsed === null) return null;

  const width: 32 | 128 = isIPv6Address(stripIpv6Brackets(address)) ? 128 : 32;
  if (bits > width) return null;

  const mask = prefixMask(bits, width);
  return { network: parsed & mask, bits, width };
}

export function isInRange(address: bigint, range: CidrRange): boolean {
  return (address & prefixMask(range.bits, range.width)) === range.network;
}

export function parseDropLines(text: string, family: 4 | 6): DropEntry[] | null {
  const entries: DropEntry[] = [];
  const wantedWidth = family === 4 ? 32 : 128;

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(";") || trimmed.startsWith("#")) continue;

    const parsed = dropEntrySchema.safeParse(safeJsonParse(trimmed));
    if (!parsed.success) continue;

    const range = parseCidr(parsed.data.cidr);
    if (!range || range.width !== wantedWidth) continue;

    entries.push({
      range,
      sblid: parsed.data.sblid ?? null,
      cidr: parsed.data.cidr,
    });
  }

  // The real feeds contain hundreds of ranges; an empty or tiny result means
  // the download or parser failed, not that the list is empty.
  return entries.length >= 10 ? entries : null;
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

interface FeedState<T> {
  data: T;
  fetchedAt: number;
}

interface FeedCache<T> {
  state: FeedState<T> | null;
  refresh: Promise<FeedState<T> | null> | null;
}

const feodoCache: FeedCache<Map<string, FeodoEntry>> = { state: null, refresh: null };
const dropV4Cache: FeedCache<DropEntry[]> = { state: null, refresh: null };
const dropV6Cache: FeedCache<DropEntry[]> = { state: null, refresh: null };

async function fetchFeedText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, accept: "application/json, text/plain" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    if (text.length > FEED_MAX_BYTES) throw new Error("feed exceeds size limit");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Returns cached feed data, refreshing it when the TTL expired. Falls back to
 * stale data (up to FEED_STALE_MS) when a refresh fails; returns null only
 * when no usable data exists. Concurrent lookups share a single refresh.
 */
async function getFeed<T>(
  cache: FeedCache<T>,
  ttlMs: number,
  load: () => Promise<T | null>,
): Promise<FeedState<T> | null> {
  const now = Date.now();

  if (cache.state && now - cache.state.fetchedAt < ttlMs) return cache.state;

  if (!cache.refresh) {
    cache.refresh = (async () => {
      try {
        const data = await load();
        if (data !== null) {
          cache.state = { data, fetchedAt: Date.now() };
          return cache.state;
        }
        return null;
      } catch {
        return null;
      } finally {
        cache.refresh = null;
      }
    })();
  }

  const refreshed = await cache.refresh;
  if (refreshed) return refreshed;

  if (cache.state && now - cache.state.fetchedAt < FEED_STALE_MS) return cache.state;
  return null;
}

async function loadFeodo(): Promise<Map<string, FeodoEntry> | null> {
  const payload = safeJsonParse(await fetchFeedText(FEODO_URL));
  const entries = parseFeodoPayload(payload);
  if (!entries) return null;
  return new Map(entries.map((entry) => [entry.ip, entry]));
}

async function loadDrop(url: string, family: 4 | 6): Promise<DropEntry[] | null> {
  return parseDropLines(await fetchFeedText(url), family);
}

/** Test hooks: inject or reset feed state without network access. */
export function setFeedStateForTests(feed: "feodo" | "dropv4" | "dropv6", data: unknown, fetchedAtMs: number) {
  if (feed === "feodo") {
    const entries = data instanceof Map ? (data as Map<string, FeodoEntry>) : new Map();
    feodoCache.state = { data: entries, fetchedAt: fetchedAtMs };
    return;
  }

  const entries = Array.isArray(data) ? (data as DropEntry[]) : [];
  const cache = feed === "dropv4" ? dropV4Cache : dropV6Cache;
  cache.state = { data: entries, fetchedAt: fetchedAtMs };
}

export function clearFeedStateForTests() {
  feodoCache.state = null;
  feodoCache.refresh = null;
  dropV4Cache.state = null;
  dropV4Cache.refresh = null;
  dropV6Cache.state = null;
  dropV6Cache.refresh = null;
}

/**
 * Feodo Tracker lists botnet C2 servers for Dridex, Emotet, TrickBot, QakBot
 * and BazarLoader. Entries are only added after a valid C2 response was
 * observed, so a match is high-confidence botnet infrastructure evidence.
 */
export async function matchFeodo(ip: string, nowMs: number): Promise<FeedMatchResult> {
  const state = await getFeed(feodoCache, FEODO_TTL_MS, loadFeodo);
  if (!state) return { status: "unavailable", evidence: [] };

  const entry = state.data.get(ip);
  if (!entry) return { status: "clean", evidence: [] };

  const online = entry.status?.toLowerCase() === "online";
  const lastOnlineMs = entry.lastOnline ? Date.parse(entry.lastOnline) : null;
  const freshness = online
    ? 1
    : freshnessFromDays(lastOnlineMs === null ? null : (nowMs - lastOnlineMs) / 86_400_000);

  return {
    status: "matched",
    evidence: [
      {
        sourceId: "feodo-tracker",
        category: "botnet",
        reason: online ? "feodo_c2_online" : "feodo_c2_offline",
        weight: online ? 65 : 50,
        confidence: 95,
        freshness,
        firstSeen: entry.firstSeen,
        lastSeen: entry.lastOnline,
        malwareFamily: entry.malware,
        detail: entry.status ? `C2 status: ${entry.status}` : null,
      },
    ],
  };
}

function freshnessFromDays(ageDays: number | null): number {
  if (ageDays === null) return 0.5;
  if (ageDays <= 7) return 1;
  if (ageDays <= 30) return 0.85;
  if (ageDays <= 90) return 0.6;
  return 0.4;
}

/**
 * Spamhaus DROP lists entire netblocks controlled by criminal or bulletproof
 * hosting operations (a subset of SBL). A match means the whole network is
 * classified as malicious infrastructure, not that this exact host was seen
 * attacking.
 */
export async function matchDrop(ip: string, family: 4 | 6): Promise<FeedMatchResult> {
  const cache = family === 4 ? dropV4Cache : dropV6Cache;
  const state = await getFeed(cache, DROP_TTL_MS, () =>
    loadDrop(family === 4 ? DROP_V4_URL : DROP_V6_URL, family),
  );
  if (!state) return { status: "unavailable", evidence: [] };

  const address = parseIpAddress(ip);
  if (address === null) return { status: "unavailable", evidence: [] };

  for (const entry of state.data) {
    if (!isInRange(address, entry.range)) continue;

    return {
      status: "matched",
      evidence: [
        {
          sourceId: "spamhaus-drop",
          category: "malware",
          reason: "drop",
          weight: 65,
          confidence: 90,
          freshness: 0.9,
          detail: `Network: ${entry.cidr}${entry.sblid ? ` (${entry.sblid})` : ""}`,
        },
      ],
    };
  }

  return { status: "clean", evidence: [] };
}

/** Parses IPv4 and IPv6 addresses into a big integer (IPv4 in the low 32 bits). */
export function parseIpAddress(ip: string): bigint | null {
  const value = stripIpv6Brackets(ip).toLowerCase();
  if (!value) return null;

  if (isIPv4String(value)) {
    const octets = value.split(".").map(Number);
    if (octets.length !== 4 || octets.some((octet) => octet > 255)) return null;
    let result = 0n;
    for (const octet of octets) result = (result << 8n) | BigInt(octet);
    return result;
  }

  if (!isIPv6Address(value)) return null;

  let address = value;
  const v4Match = address.match(/^(.*):(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (v4Match) {
    const octets = v4Match[2].split(".").map(Number);
    if (octets.some((octet) => octet > 255)) return null;
    const hex = octets.map((octet) => octet.toString(16).padStart(2, "0"));
    address = `${v4Match[1]}:${hex[0]}${hex[1]}:${hex[2]}${hex[3]}`;
  }

  const [head, tail = ""] = address.split("::");
  const headParts = head ? head.split(":").filter(Boolean) : [];
  const tailParts = tail ? tail.split(":").filter(Boolean) : [];
  const missing = 8 - headParts.length - tailParts.length;
  if (missing < 0) return null;

  const groups = [...headParts, ...Array.from({ length: missing }, () => "0"), ...tailParts];
  if (groups.length !== 8) return null;

  let result = 0n;
  for (const group of groups) {
    const parsed = Number.parseInt(group, 16);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 0xffff) return null;
    result = (result << 16n) | BigInt(parsed);
  }
  return result;
}

function isIPv4String(value: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(value);
}
