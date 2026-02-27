import { NextResponse } from "next/server";

export const runtime = "edge";

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

function mapDnsAnswer(type: RecordType, answer: { data?: string }): DnsRecord {
  return { type, value: answer.data ?? null };
}

async function resolveByType(hostname: string, type: RecordType): Promise<ResolveResult> {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=${encodeURIComponent(type)}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return { type, records: [], error: `HTTP ${response.status}` };
    }

    const payload = (await response.json()) as {
      Status?: number;
      Answer?: { data?: string }[];
      Comment?: string;
    };

    const records = (payload.Answer || []).map((answer) => mapDnsAnswer(type, answer));

    return {
      type,
      records,
      error: payload.Status && payload.Status !== 0 ? payload.Comment || `DNS status ${payload.Status}` : undefined,
    };
  } catch (error) {
    return {
      type,
      records: [],
      error: (error as Error).message,
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

  const recordsByType = await Promise.all(RECORD_TYPES.map((type) => resolveByType(hostname, type)));

  const records = recordsByType.flatMap((entry) => entry.records);
  const addresses = records
    .filter((entry) => entry.type === "A" || entry.type === "AAAA")
    .map((entry) => ({ address: entry.value, family: entry.type === "A" ? 4 : 6 }));

  return NextResponse.json({
    target: hostname,
    addresses,
    records,
    lookupError: null,
    recordErrors: recordsByType
      .filter((entry) => entry.error)
      .map((entry) => ({ type: entry.type, error: entry.error })),
  });
}
