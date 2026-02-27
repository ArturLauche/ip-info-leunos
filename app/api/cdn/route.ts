import { NextResponse } from "next/server";

export const runtime = "edge";

type Confidence = "high" | "medium" | "low";

interface CdnSignature {
  provider: string;
  headerMatches: string[];
  valueMatches: string[];
  cnameMatches: string[];
}

interface CdnDetection {
  provider: string;
  confidence: Confidence;
  reason: string;
  matchedSignals: string[];
}

const CDN_SIGNATURES: CdnSignature[] = [
  { provider: "Cloudflare", headerMatches: ["cf-ray", "cf-cache-status"], valueMatches: ["cloudflare"], cnameMatches: ["cloudflare.net"] },
  { provider: "Vercel Edge Network", headerMatches: ["x-vercel-id", "x-vercel-cache"], valueMatches: ["vercel"], cnameMatches: ["vercel-dns.com", "vercel.app"] },
  { provider: "Akamai", headerMatches: ["x-akamai", "akamai-grn"], valueMatches: ["akamai"], cnameMatches: ["edgekey.net", "edgesuite.net"] },
  { provider: "Fastly", headerMatches: ["x-served-by", "x-fastly-request-id"], valueMatches: ["fastly"], cnameMatches: ["fastly.net"] },
  { provider: "Amazon CloudFront", headerMatches: ["x-amz-cf-id", "x-amz-cf-pop"], valueMatches: ["cloudfront"], cnameMatches: ["cloudfront.net"] },
  { provider: "Netlify Edge", headerMatches: ["x-nf-request-id"], valueMatches: ["netlify"], cnameMatches: ["netlify.global", "netlify.app"] },
];

function normalizeTarget(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname) return null;
    return { hostname: parsed.hostname.toLowerCase(), url: `https://${parsed.hostname}` };
  } catch {
    return null;
  }
}

async function resolveCnameChain(hostname: string) {
  const cnames: string[] = [];
  let current = hostname;

  for (let i = 0; i < 5; i += 1) {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(current)}&type=CNAME`,
      { cache: "no-store" },
    ).catch(() => null);

    if (!response?.ok) break;

    const payload = (await response.json()) as { Answer?: { data?: string }[] };
    const next = payload.Answer?.[0]?.data?.replace(/\.$/, "").toLowerCase();
    if (!next || cnames.includes(next)) break;

    cnames.push(next);
    current = next;
  }

  return cnames;
}

async function resolveIpAddresses(hostname: string) {
  const lookups = await Promise.allSettled([
    fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`, { cache: "no-store" }),
    fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=AAAA`, { cache: "no-store" }),
  ]);

  const ips: string[] = [];
  for (const item of lookups) {
    if (item.status !== "fulfilled" || !item.value.ok) continue;
    const payload = (await item.value.json()) as { Answer?: { data?: string }[] };
    payload.Answer?.forEach((answer) => {
      if (answer.data) ips.push(answer.data);
    });
  }

  return [...new Set(ips)].slice(0, 8);
}

function mapScoreToConfidence(score: number): Confidence {
  if (score >= 8) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function detectProvider(headers: Headers, cnames: string[]): CdnDetection[] {
  const allHeaders = Array.from(headers.entries()).map(([key, value]) => ({ key: key.toLowerCase(), value: value.toLowerCase() }));

  const matches: CdnDetection[] = [];

  for (const signature of CDN_SIGNATURES) {
    const matchedSignals: string[] = [];
    let score = 0;

    for (const h of signature.headerMatches) {
      if (allHeaders.some((entry) => entry.key === h)) {
        matchedSignals.push(`header:${h}`);
        score += 3;
      }
    }

    for (const value of signature.valueMatches) {
      if (allHeaders.some((entry) => entry.value.includes(value))) {
        matchedSignals.push(`header-value:${value}`);
        score += 2;
      }
    }

    for (const cnamePart of signature.cnameMatches) {
      if (cnames.some((cname) => cname.includes(cnamePart))) {
        matchedSignals.push(`cname:${cnamePart}`);
        score += 3;
      }
    }

    if (score > 0) {
      matches.push({
        provider: signature.provider,
        confidence: mapScoreToConfidence(score),
        reason: `Detected ${matchedSignals.length} CDN signal(s).`,
        matchedSignals,
      });
    }
  }

  return matches.sort((a, b) => (a.confidence === b.confidence ? b.matchedSignals.length - a.matchedSignals.length : a.confidence === "high" ? -1 : 1));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target") || "";
  const normalized = normalizeTarget(target);

  if (!normalized) {
    return NextResponse.json({ error: "Please provide a valid domain or URL." }, { status: 400 });
  }

  const [response, cnames, ips] = await Promise.all([
    fetch(normalized.url, { method: "GET", redirect: "follow", cache: "no-store" }).catch(() => null),
    resolveCnameChain(normalized.hostname),
    resolveIpAddresses(normalized.hostname),
  ]);

  if (!response) {
    return NextResponse.json({ error: "Could not reach target." }, { status: 502 });
  }

  const detections = detectProvider(response.headers, cnames);

  return NextResponse.json({
    target: normalized.hostname,
    urlChecked: normalized.url,
    status: response.status,
    cnames,
    ips,
    detections,
    headers: Array.from(response.headers.keys()).slice(0, 30),
  });
}
