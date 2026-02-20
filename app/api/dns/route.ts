import dns from "node:dns/promises";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SRV"] as const;
type RecordType = (typeof RECORD_TYPES)[number];

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

function normalizeTarget(target: string) {
  const trimmed = target.trim();
  if (!trimmed) return "";

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    return parsed.hostname.replace(/\.$/, "").toLowerCase();
  } catch {
    return trimmed
      .split(/[/?#]/)[0]
      .replace(/:\d+$/, "")
      .replace(/^\[|\]$/g, "")
      .replace(/\.$/, "")
      .toLowerCase();
  }
}

async function resolveByType(hostname: string, type: RecordType): Promise<ResolveResult> {
  try {
    const records = await dns.resolve(hostname, type);
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
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target");

  if (!target || !target.trim()) {
    return NextResponse.json({ error: "Missing target query parameter." }, { status: 400 });
  }

  const hostname = normalizeTarget(target);
  if (!hostname) {
    return NextResponse.json({ error: "Please provide a valid domain." }, { status: 400 });
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

  return NextResponse.json({
    target: hostname,
    addresses,
    records,
    lookupError: lookupResult.ok ? null : lookupResult.error.code || lookupResult.error.message,
    recordErrors: recordsByType
      .filter((entry) => entry.error)
      .map((entry) => ({ type: entry.type, error: entry.error })),
  });
}
