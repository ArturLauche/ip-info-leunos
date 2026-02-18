import dns from "node:dns/promises";
import { NextResponse } from "next/server";

interface CdnDetection {
  provider: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

const CDN_SIGNATURES = [
  {
    provider: "Cloudflare",
    headerMatches: ["cf-ray", "cf-cache-status", "__cf_bm"],
    valueMatches: ["cloudflare"],
    cnameMatches: ["cloudflare.net"],
  },
  {
    provider: "Akamai",
    headerMatches: ["x-akamai", "akamai-grn"],
    valueMatches: ["akamai"],
    cnameMatches: ["akamai", "edgekey.net", "edgesuite.net"],
  },
  {
    provider: "Fastly",
    headerMatches: ["x-served-by", "x-fastly-request-id", "x-cache-hits"],
    valueMatches: ["fastly"],
    cnameMatches: ["fastly.net", "map.fastly.net"],
  },
  {
    provider: "Amazon CloudFront",
    headerMatches: ["x-amz-cf-id", "x-amz-cf-pop"],
    valueMatches: ["cloudfront"],
    cnameMatches: ["cloudfront.net"],
  },
  {
    provider: "Bunny CDN",
    headerMatches: ["cdn-pullzone", "cdn-cache"],
    valueMatches: ["bunnycdn"],
    cnameMatches: ["b-cdn.net", "bunnycdn"],
  },
  {
    provider: "KeyCDN",
    headerMatches: ["x-edge-location"],
    valueMatches: ["keycdn"],
    cnameMatches: ["kxcdn.com", "keycdn"],
  },
  {
    provider: "Google Cloud CDN",
    headerMatches: ["x-goog-generation"],
    valueMatches: ["google frontend", "gws"],
    cnameMatches: ["googlehosted.com", "googleusercontent.com"],
  },
  {
    provider: "Microsoft Azure CDN",
    headerMatches: ["x-azure-ref", "x-msedge-ref"],
    valueMatches: ["azure"],
    cnameMatches: ["azureedge.net"],
  },
];

function normalizeTarget(input: string) {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    return {
      hostname: parsed.hostname,
      url: `https://${parsed.hostname}`,
    };
  } catch {
    return null;
  }
}

async function resolveCnameChain(hostname: string) {
  const cnames: string[] = [];
  let current = hostname;

  for (let i = 0; i < 3; i += 1) {
    try {
      const records = await dns.resolveCname(current);
      if (!records.length) break;
      const next = records[0].toLowerCase();
      cnames.push(next);
      current = next;
    } catch {
      break;
    }
  }

  return cnames;
}

function detectCdn(headers: Headers, cnameChain: string[]): CdnDetection | null {
  const headerPairs = [...headers.entries()].map(([key, value]) => ({
    key: key.toLowerCase(),
    value: value.toLowerCase(),
  }));
  const headerKeys = headerPairs.map((item) => item.key);
  const headerValues = headerPairs.map((item) => item.value);
  const cnameJoined = cnameChain.join(" ");

  for (const signature of CDN_SIGNATURES) {
    if (signature.headerMatches.some((needle) => headerKeys.includes(needle))) {
      return {
        provider: signature.provider,
        confidence: "high",
        reason: "Matched unique response headers.",
      };
    }

    if (signature.valueMatches.some((needle) => headerValues.some((value) => value.includes(needle)))) {
      return {
        provider: signature.provider,
        confidence: "medium",
        reason: "Matched CDN wording in response header values.",
      };
    }

    if (signature.cnameMatches.some((needle) => cnameJoined.includes(needle))) {
      return {
        provider: signature.provider,
        confidence: "medium",
        reason: "Matched CDN pattern in DNS CNAME chain.",
      };
    }
  }

  if (headerKeys.includes("x-cache") || headerKeys.includes("via")) {
    return {
      provider: "Unknown CDN / Reverse Proxy",
      confidence: "low",
      reason: "Caching/proxy headers exist but no known CDN signature matched.",
    };
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target") || "";
  const normalized = normalizeTarget(target);

  if (!normalized) {
    return NextResponse.json(
      { error: "Please provide a valid domain or URL via ?target=." },
      { status: 400 },
    );
  }

  const cnameChain = await resolveCnameChain(normalized.hostname);

  let responseHeaders: Headers;
  let status = 0;

  try {
    const response = await fetch(normalized.url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        "user-agent": "ip-info-leunos-cdn-check/1.0",
      },
    });

    responseHeaders = response.headers;
    status = response.status;
  } catch {
    return NextResponse.json(
      {
        target: normalized.hostname,
        reachable: false,
        usesCdn: false,
        detectedCdn: null,
        confidence: null,
        reason: "Target could not be reached from the server.",
        cnameChain,
        headers: [],
      },
      { status: 200 },
    );
  }

  const detection = detectCdn(responseHeaders, cnameChain);
  const selectedHeaders = [
    "server",
    "via",
    "x-cache",
    "x-served-by",
    "cf-ray",
    "cf-cache-status",
    "x-amz-cf-id",
    "x-amz-cf-pop",
    "x-azure-ref",
    "x-msedge-ref",
    "cdn-cache",
  ]
    .map((header) => {
      const value = responseHeaders.get(header);
      return value ? { key: header, value } : null;
    })
    .filter((item): item is { key: string; value: string } => Boolean(item));

  return NextResponse.json({
    target: normalized.hostname,
    reachable: true,
    status,
    usesCdn: Boolean(detection),
    detectedCdn: detection?.provider || null,
    confidence: detection?.confidence || null,
    reason: detection?.reason || "No known CDN signature detected.",
    cnameChain,
    headers: selectedHeaders,
  });
}
