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

function normalizeTarget(target: string) {
  return target.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "").toLowerCase();
}

async function resolveByType(hostname: string, type: RecordType): Promise<DnsRecord[]> {
  try {
    const records = await dns.resolve(hostname, type);
    if (!records.length) return [];
    return records.map((value) => ({ type, value: value as DnsRecordValue }));
  } catch {
    return [];
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

  try {
    const [lookup, recordsByType] = await Promise.all([
      dns.lookup(hostname, { all: true }),
      Promise.all(RECORD_TYPES.map((type) => resolveByType(hostname, type))),
    ]);

    const records = recordsByType.flat();

    return NextResponse.json({
      target: hostname,
      addresses: lookup,
      records,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `DNS lookup failed: ${(error as Error).message}`,
      },
      { status: 400 },
    );
  }
}
