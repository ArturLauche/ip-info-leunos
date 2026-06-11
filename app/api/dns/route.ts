import dns from "node:dns/promises";
import net from "node:net";
import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { assertPublicTarget, isIpAddress, TargetValidationError } from "@/lib/network/target";

export const runtime = "nodejs";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "SRV", "CAA"] as const;
type RecordType = (typeof RECORD_TYPES)[number] | "PTR";

const dnsQuerySchema = z.object({
  target: z.string().trim().min(1).max(253),
});

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

async function resolveByType(hostname: string, type: (typeof RECORD_TYPES)[number]): Promise<ResolveResult> {
  try {
    const resolved = await dns.resolve(hostname, type);
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
    const names = await dns.reverse(ip);
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

  // IP targets only support reverse (PTR) lookups.
  if (isIpAddress(hostname)) {
    const ptrResult = await resolvePtr(hostname);

    return apiOk({
      target: hostname,
      addresses: [{ address: hostname, family: net.isIP(hostname) }],
      records: ptrResult.records,
      lookupError: null,
      recordErrors: ptrResult.error ? [{ type: ptrResult.type, error: ptrResult.error }] : [],
    });
  }

  const [lookupResult, recordsByType] = await Promise.all([
    dns.lookup(hostname, { all: true }).then(
      (value) => ({ ok: true as const, value }),
      (error) => ({ ok: false as const, error: error as NodeJS.ErrnoException }),
    ),
    Promise.all(RECORD_TYPES.map((type) => resolveByType(hostname, type))),
  ]);

  const records = recordsByType.flatMap((entry) => entry.records);
  const addresses = lookupResult.ok ? lookupResult.value : [];

  return apiOk({
    target: hostname,
    addresses,
    records,
    lookupError: lookupResult.ok ? null : lookupResult.error.code || lookupResult.error.message,
    recordErrors: recordsByType
      // A type without records (ENODATA/ENOTFOUND) is normal, not noteworthy.
      .filter((entry) => entry.error && entry.error !== "ENODATA" && entry.error !== "ENOTFOUND")
      .map((entry) => ({ type: entry.type, error: entry.error })),
  });
}
