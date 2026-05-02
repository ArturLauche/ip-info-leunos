import dns from "node:dns/promises";
import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { assertPublicTarget, TargetValidationError } from "@/lib/network/target";

export const runtime = "nodejs";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SRV"] as const;
type RecordType = (typeof RECORD_TYPES)[number];

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

async function resolveByType(hostname: string, type: RecordType): Promise<ResolveResult> {
  try {
    const resolved = await dns.resolve(hostname, type);
    const records = Array.isArray(resolved) ? resolved : [resolved];
    return {
      type,
      records: records.map((value) => ({ type, value: value as DnsRecordValue })),
    };
  } catch (error) {
    return {
      type,
      records: [],
      error: (error as NodeJS.ErrnoException).code || (error as Error).message,
    };
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
      .filter((entry) => entry.error)
      .map((entry) => ({ type: entry.type, error: entry.error })),
  });
}
