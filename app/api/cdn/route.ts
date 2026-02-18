import dns from "node:dns/promises";
import { NextResponse } from "next/server";

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
  {
    provider: "Cloudflare",
    headerMatches: ["cf-ray", "cf-cache-status", "cf-apo-via", "cf-ew-via"],
    valueMatches: ["cloudflare"],
    cnameMatches: ["cloudflare.net"],
  },
  {
    provider: "Vercel Edge Network",
    headerMatches: ["x-vercel-id", "x-vercel-cache"],
    valueMatches: ["vercel"],
    cnameMatches: ["vercel-dns.com", "vercel.app"],
  },
  {
    provider: "Akamai",
    headerMatches: ["x-akamai", "akamai-grn", "x-akamai-staging"],
    valueMatches: ["akamai"],
    cnameMatches: ["edgekey.net", "edgesuite.net", "akamai"],
  },
  {
    provider: "Fastly",
    headerMatches: ["x-served-by", "x-fastly-request-id", "x-cache-hits", "x-timer"],
    valueMatches: ["fastly"],
    cnameMatches: ["fastly.net", "map.fastly.net"],
  },
  {
    provider: "Amazon CloudFront",
    headerMatches: ["x-amz-cf-id", "x-amz-cf-pop", "x-cache"],
    valueMatches: ["cloudfront"],
    cnameMatches: ["cloudfront.net"],
  },
  {
    provider: "Bunny CDN",
    headerMatches: ["cdn-pullzone", "cdn-cache", "cdn-requestid", "bcdn-cache-status"],
    valueMatches: ["bunnycdn", "bunny"],
    cnameMatches: ["b-cdn.net", "bunnycdn", "bunny.net"],
  },
  {
    provider: "KeyCDN",
    headerMatches: ["x-edge-location", "x-cache"],
    valueMatches: ["keycdn"],
    cnameMatches: ["kxcdn.com", "keycdn"],
  },
  {
    provider: "JSDelivr",
    headerMatches: ["x-jsd-version-type"],
    valueMatches: ["jsdelivr"],
    cnameMatches: ["cdn.jsdelivr.net"],
  },
  {
    provider: "UNPKG (Cloudflare-backed)",
    headerMatches: ["cf-ray", "cf-cache-status"],
    valueMatches: ["unpkg"],
    cnameMatches: ["unpkg.com"],
  },
  {
    provider: "Edgio",
    headerMatches: ["x-ec-custom-error", "x-ec-check-cacheable"],
    valueMatches: ["edgio", "limelight"],
    cnameMatches: ["edgecastcdn.net", "llnwd.net", "edgio"],
  },
  {
    provider: "CacheFly",
    headerMatches: ["x-cf-tsc", "x-cache"],
    valueMatches: ["cachefly"],
    cnameMatches: ["cachefly.net"],
  },
  {
    provider: "Google Cloud CDN",
    headerMatches: ["x-goog-generation", "x-goog-hash", "x-guploader-uploadid"],
    valueMatches: ["google frontend", "gws", "esf"],
    cnameMatches: ["googlehosted.com", "googleusercontent.com"],
  },
  {
    provider: "Microsoft Azure CDN",
    headerMatches: ["x-azure-ref", "x-msedge-ref", "x-cache"],
    valueMatches: ["azure", "microsoft"],
    cnameMatches: ["azureedge.net", "trafficmanager.net"],
  },
  {
    provider: "Alibaba Cloud CDN",
    headerMatches: ["x-swift-cachetime", "x-swift-savetime", "ali-swift-global-savetime"],
    valueMatches: ["aliyun", "alibaba cloud"],
    cnameMatches: ["kunlun", "alikunlun", "alikunlun.com"],
  },
  {
    provider: "Tencent Cloud EdgeOne/CDN",
    headerMatches: ["eo-cache-status", "x-tencent-trace-id"],
    valueMatches: ["edgeone", "tencent"],
    cnameMatches: ["edgeone-dns.com", "dnsv1.com"],
  },
  {
    provider: "Oracle Cloud CDN",
    headerMatches: ["x-oracle-dms-ecid", "x-oracle-dms-rid"],
    valueMatches: ["oracle"],
    cnameMatches: ["oraclecloud", "oci"],
  },
  {
    provider: "Netlify Edge",
    headerMatches: ["x-nf-request-id", "x-nf-render-mode"],
    valueMatches: ["netlify"],
    cnameMatches: ["netlify.global", "netlify.app"],
  },
  {
    provider: "Imperva / Incapsula",
    headerMatches: ["x-iinfo", "x-cdn", "x-cdn-forward"],
    valueMatches: ["incapsula", "imperva"],
    cnameMatches: ["incapdns.net", "impervadns.net"],
  },
  {
    provider: "Sucuri CDN",
    headerMatches: ["x-sucuri-id", "x-sucuri-cache"],
    valueMatches: ["sucuri"],
    cnameMatches: ["sucuri.net"],
  },
  {
    provider: "Gcore CDN",
    headerMatches: ["x-gcdn-cache", "x-gcore-request-id"],
    valueMatches: ["gcore"],
    cnameMatches: ["gcorelabs.com", "gcdn.co"],
  },
  {
    provider: "CDN77",
    headerMatches: ["x-cdn77-cache", "x-cdn77"],
    valueMatches: ["cdn77"],
    cnameMatches: ["cdn77.org"],
  },
  {
    provider: "StackPath",
    headerMatches: ["x-sp-edge", "x-sp-cache"],
    valueMatches: ["stackpath"],
    cnameMatches: ["stackpathdns.com"],
  },
];

function normalizeTarget(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname) return null;

    return {
      hostname: parsed.hostname.toLowerCase(),
      url: `https://${parsed.hostname}`,
    };
  } catch {
    return null;
  }
}

async function resolveCnameChain(hostname: string) {
  const cnames: string[] = [];
  let current = hostname;

  for (let i = 0; i < 5; i += 1) {
    try {
      const records = await dns.resolveCname(current);
      if (!records.length) break;

      const next = records[0].toLowerCase();
      if (cnames.includes(next)) break;

      cnames.push(next);
      current = next;
    } catch {
      break;
    }
  }

  return cnames;
}

async function resolveIpAddresses(hostname: string) {
  const [v4Result, v6Result] = await Promise.allSettled([
    dns.resolve4(hostname),
    dns.resolve6(hostname),
  ]);

  const ipv4 = v4Result.status === "fulfilled" ? v4Result.value : [];
  const ipv6 = v6Result.status === "fulfilled" ? v6Result.value : [];

  return [...new Set([...ipv4, ...ipv6])].slice(0, 8);
}

function mapScoreToConfidence(score: number): Confidence {
  if (score >= 8) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function detectCdn(headers: Headers, cnameChain: string[], hostname: string): CdnDetection | null {
  const headerPairs = [...headers.entries()].map(([key, value]) => ({
    key: key.toLowerCase(),
    value: value.toLowerCase(),
  }));

  const headerKeys = new Set(headerPairs.map((pair) => pair.key));
  const headerValues = headerPairs.map((pair) => pair.value);
  const cnameJoined = cnameChain.join(" ");
  const serverValue = headers.get("server")?.toLowerCase() || "";

  let bestMatch: CdnDetection | null = null;
  let bestScore = 0;

  for (const signature of CDN_SIGNATURES) {
    let score = 0;
    const matchedSignals: string[] = [];

    for (const needle of signature.headerMatches) {
      if (headerKeys.has(needle)) {
        score += 5;
        matchedSignals.push(`header:${needle}`);
      }
    }

    for (const needle of signature.valueMatches) {
      if (headerValues.some((value) => value.includes(needle))) {
        score += 3;
        matchedSignals.push(`header-value:${needle}`);
      }
    }

    for (const needle of signature.cnameMatches) {
      if (cnameJoined.includes(needle)) {
        score += 4;
        matchedSignals.push(`dns:${needle}`);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        provider: signature.provider,
        confidence: mapScoreToConfidence(score),
        reason: `Matched ${matchedSignals.length} CDN signal${matchedSignals.length > 1 ? "s" : ""}.`,
        matchedSignals,
      };
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  // Heuristic fallback for big platforms that often hide classic CDN headers.
  if (["gws", "esf"].includes(serverValue) || serverValue.includes("google frontend")) {
    if (
      hostname.endsWith("google.com") ||
      hostname.endsWith("youtube.com") ||
      hostname.endsWith("googlevideo.com") ||
      hostname.endsWith("gstatic.com")
    ) {
      return {
        provider: "Google Edge Network",
        confidence: "low",
        reason: "Google frontend server fingerprint detected.",
        matchedSignals: [`header-value:server=${serverValue}`],
      };
    }
  }

  if (serverValue.includes("microsoft") && (hostname.endsWith("bing.com") || hostname.endsWith("msn.com"))) {
    return {
      provider: "Microsoft Edge Network",
      confidence: "low",
      reason: "Microsoft server fingerprint detected.",
      matchedSignals: [`header-value:server=${serverValue}`],
    };
  }

  if (headerKeys.has("x-cache") || headerKeys.has("via") || headerKeys.has("cache-status")) {
    return {
      provider: "Unknown CDN / Reverse Proxy",
      confidence: "low",
      reason: "Caching/proxy headers were found but no provider-specific signature matched.",
      matchedSignals: ["header:x-cache/via/cache-status"],
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

  const [cnameChain, resolvedIps] = await Promise.all([
    resolveCnameChain(normalized.hostname),
    resolveIpAddresses(normalized.hostname),
  ]);

  let responseHeaders: Headers;
  let status = 0;

  try {
    const response = await fetch(normalized.url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        "user-agent": "ip-info-leunos-cdn-check/1.2",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    responseHeaders = response.headers;
    status = response.status;
  } catch {
    return NextResponse.json({
      target: normalized.hostname,
      reachable: false,
      usesCdn: false,
      detectedCdn: null,
      confidence: null,
      reason: "Target could not be reached from the server.",
      matchedSignals: [],
      resolvedIps,
      cnameChain,
      headers: [],
    });
  }

  const detection = detectCdn(responseHeaders, cnameChain, normalized.hostname);
  const selectedHeaders = [
    "server",
    "via",
    "cache-status",
    "x-cache",
    "x-served-by",
    "x-vercel-id",
    "x-vercel-cache",
    "x-nf-request-id",
    "cf-ray",
    "cf-cache-status",
    "x-amz-cf-id",
    "x-amz-cf-pop",
    "x-azure-ref",
    "x-msedge-ref",
    "x-swift-cachetime",
    "eo-cache-status",
    "x-oracle-dms-ecid",
    "cdn-cache",
    "bcdn-cache-status",
    "x-jsd-version-type",
    "x-cdn",
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
    matchedSignals: detection?.matchedSignals || [],
    resolvedIps,
    cnameChain,
    headers: selectedHeaders,
  });
}
