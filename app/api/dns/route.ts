import dns from "node:dns/promises";
import net from "node:net";
import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { assertPublicTarget, isIpAddress, TargetValidationError } from "@/lib/network/target";
import { isCacheableDnsResult } from "@/lib/dns-cache";

export const runtime = "nodejs";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "SRV", "CAA"] as const;
type RecordType = (typeof RECORD_TYPES)[number] | "PTR";

// Bounds each individual resolver call. The OS resolver can retry for tens
// of seconds on unresponsive nameservers; racing it keeps the route latency
// predictable while fast record types still return normally.
const RESOLVE_TIMEOUT_MS = 6_000;

const dnsQuerySchema = z.object({
  target: z.string().trim().min(1).max(253),
});

// Short server-side memo for repeated public DNS lookups. DNS answers are
// public data (no per-request identity), so caching by normalized hostname is
// safe. The response header stays no-store; this only avoids hammering the
// resolver with 10 parallel queries per repeat request.
const DNS_CACHE_TTL_MS = 120_000;
const DNS_CACHE_MAX_ENTRIES = 512;

const dnsCache = new Map<string, { storedAt: number; payload: unknown }>();

function getCachedDns(hostname: string): unknown | null {
  const cached = dnsCache.get(hostname);
  if (!cached) return null;
  if (Date.now() - cached.storedAt >= DNS_CACHE_TTL_MS) {
    dnsCache.delete(hostname);
    return null;
  }
  return cached.payload;
}

function setCachedDns(hostname: string, payload: unknown) {
  dnsCache.set(hostname, { storedAt: Date.now(), payload });
  while (dnsCache.size > DNS_CACHE_MAX_ENTRIES) {
    const oldest = dnsCache.keys().next().value;
    if (oldest === undefined) break;
    dnsCache.delete(oldest);
  }
}

type DnsRecordValue = string | number | boolean | null | DnsRecordValue[] | { [key: string]: DnsRecordValue };

interface DnsRecord {
  type: RecordType;
  value: DnsRecordValue;
}

interface ResolveResult {
  type: RecordType;
  records: DnsRecord[];
  error?: string;
}

function errorCode(error: unknown) {
  return (error as NodeJS.ErrnoException).code || (error as Error).message;
}

function raceResolveTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("DNS query timed out.")),
      RESOLVE_TIMEOUT_MS,
    );
    timer.unref?.();
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function resolveByType(hostname: string, type: (typeof RECORD_TYPES)[number]): Promise<ResolveResult> {
  try {
    const resolved = await raceResolveTimeout(dns.resolve(hostname, type));
    const records = Array.isArray(resolved) ? resolved : [resolved];
    return {
      type,
      records: records.map((value) => ({ type, value: value as DnsRecordValue })),
    };
  } catch (error) {
    return { type, records: [], error: errorCode(error) };
  }
}

async function resolvePtr(ip: string): Promise<ResolveResult> {
  try {
    const names = await raceResolveTimeout(dns.reverse(ip));
    return {
      type: "PTR",
      records: names.map((value) => ({ type: "PTR" as const, value })),
    };
  } catch (error) {
    return { type: "PTR", records: [], error: errorCode(error) };
  }
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "dns", { limit: 40, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const parsedQuery = dnsQuerySchema.safeParse({
    target: searchParams.get("target"),
  });

  if (!parsedQuery.success) {
    return apiValidationError(parsedQuery.error);
  }

  let hostname: string;

  try {
    const target = await assertPublicTarget(parsedQuery.data.target);
    hostname = target.hostname;
  } catch (error) {
    if (error instanceof TargetValidationError) {
      return apiError(error.code, error.message, error.status, error.details);
    }

    return apiError("invalid_target", "Please provide a valid public domain or IP.", 400);
  }

  const cachedPayload = getCachedDns(hostname);
  if (cachedPayload) {
    return apiOk(cachedPayload);
  }

  // IP targets only support reverse (PTR) lookups.
  if (isIpAddress(hostname)) {
    const ptrResult = await resolvePtr(hostname);

    const recordErrors = ptrResult.error ? [{ type: ptrResult.type, error: ptrResult.error }] : [];
    const payload = {
      target: hostname,
      addresses: [{ address: hostname, family: net.isIP(hostname) }],
      records: ptrResult.records,
      lookupError: null,
      recordErrors,
    };
    if (isCacheableDnsResult(null, recordErrors)) {
      setCachedDns(hostname, payload);
    }
    return apiOk(payload);
  }

  const [lookupResult, recordsByType] = await Promise.all([
    raceResolveTimeout(dns.lookup(hostname, { all: true })).then(
      (value) => ({ ok: true as const, value }),
      (error) => ({ ok: false as const, error: error as NodeJS.ErrnoException }),
    ),
    Promise.all(RECORD_TYPES.map((type) => resolveByType(hostname, type))),
  ]);

  const records = recordsByType.flatMap((entry) => entry.records);
  const addresses = lookupResult.ok ? lookupResult.value : [];

  const lookupError = lookupResult.ok ? null : lookupResult.error.code || lookupResult.error.message;
  const recordErrors = recordsByType
    // A type without records (ENODATA/ENOTFOUND) is normal, not noteworthy.
    .filter((entry) => entry.error && entry.error !== "ENODATA" && entry.error !== "ENOTFOUND")
    .map((entry) => ({ type: entry.type, error: entry.error }));
  const payload = {
    target: hostname,
    addresses,
    records,
    lookupError,
    recordErrors,
  };
  if (isCacheableDnsResult(lookupError, recordErrors)) {
    setCachedDns(hostname, payload);
  }
  return apiOk(payload);
}
