import { headers } from "next/headers";
import net from "node:net";
import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { getTranslation, resolveLocale, type Locale } from "@/lib/i18n";
import {
  assertPublicIpAddress,
  assertPublicTarget,
  TargetValidationError,
} from "@/lib/network/target";

const ipQuerySchema = z.object({
  ip: z.string().trim().min(1).max(253).optional(),
});

type IpApiPayload = {
  status: "success" | "fail";
  message?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  asname?: string;
  reverse?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  query?: string;
};

const ipApiPayloadSchema = z
  .object({
    status: z.enum(["success", "fail"]),
    message: z.string().optional(),
    country: z.string().optional(),
    countryCode: z.string().optional(),
    region: z.string().optional(),
    regionName: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
    lat: z.number().optional(),
    lon: z.number().optional(),
    timezone: z.string().optional(),
    isp: z.string().optional(),
    org: z.string().optional(),
    as: z.string().optional(),
    asname: z.string().optional(),
    reverse: z.string().optional(),
    mobile: z.boolean().optional(),
    proxy: z.boolean().optional(),
    hosting: z.boolean().optional(),
    query: z.string().optional(),
  })
  .passthrough();

function resolveIpApiLanguage(request: Request): Locale {
  return resolveLocale(request.headers.get("accept-language"));
}

function detectConnectionType(data: {
  isp: string;
  org: string;
  as: string;
  mobile: boolean;
  proxy: boolean;
  hosting: boolean;
  proxyType?: string;
}): string {
  const ispLower = (data.isp || "").toLowerCase();
  const orgLower = (data.org || "").toLowerCase();
  const asLower = (data.as || "").toLowerCase();
  const combinedText = `${ispLower} ${orgLower} ${asLower}`;
  const hasAnyKeyword = (keywords: string[]) =>
    keywords.some((keyword) => combinedText.includes(keyword));

  if (data.hosting) return "Rechenzentrum / Hosting";
  if (data.proxy) {
    if (data.proxyType === "tor") return "Tor Exit Node";
    if (data.proxyType === "vpn") return "VPN / Anonymizer";
    if (data.proxyType === "hosting-proxy") return "Datacenter Relay / Proxy";
    return "Proxy / VPN / Tor";
  }
  if (data.mobile) return "Mobilfunk";

  if (hasAnyKeyword(["starlink", "spacex"])) {
    return "Starlink (Satellit)";
  }

  if (
    hasAnyKeyword([
      "satellite",
      "satellit",
      "viasat",
      "hughesnet",
      "ses astra",
    ])
  ) {
    return "Satellit";
  }

  if (
    hasAnyKeyword([
      "fiber",
      "fibre",
      "glasfaser",
      "ftth",
      "fttb",
      "fttp",
      "xgs-pon",
      "gpon",
      "deutsche glasfaser",
      "init7",
    ])
  ) {
    return "Glasfaser";
  }

  if (
    hasAnyKeyword([
      "cable",
      "kabel",
      "docsis",
      "vodafone kabel",
      "unitymedia",
      "liberty global",
      "comcast",
      "charter",
      "cox",
      "cablevision",
      "pyur",
      "tele columbus",
    ])
  ) {
    return "Kabelinternet (Koax)";
  }

  if (
    hasAnyKeyword([
      "fwa",
      "fixed wireless",
      "fixed-wireless",
      "wireless broadband",
      "richtfunk",
      "wimax",
    ])
  ) {
    return "Funk / Richtfunk";
  }

  if (
    hasAnyKeyword([
      "dsl",
      "t-online",
      "adsl",
      "vdsl",
      "xdsl",
      "pppoe",
      "1&1",
      "o2",
      "ewe tel",
      "netcologne",
      "m-net",
      "easybell",
      "at&t",
      "centurylink",
      "bt ",
    ])
  ) {
    return "DSL";
  }

  if (
    hasAnyKeyword([
      "leased line",
      "dedicated internet",
      "dia",
      "business internet",
      "enterprise",
      "mpls",
    ])
  ) {
    return "Geschäftskundenleitung";
  }

  return "Festnetz";
}

type ProxyAssessment = {
  isProxy: boolean;
  proxyType: "tor" | "vpn" | "hosting-proxy" | "unknown";
  confidence: "none" | "low" | "medium" | "high";
  reasons: string[];
};

function assessProxyRisk(data: {
  isp: string;
  org: string;
  as: string;
  reverse?: string;
  proxy: boolean;
  hosting: boolean;
  mobile: boolean;
}): ProxyAssessment {
  const combined = `${data.isp || ""} ${data.org || ""} ${data.as || ""} ${data.reverse || ""}`.toLowerCase();

  const includesAny = (keywords: string[]) =>
    keywords.some((keyword) => combined.includes(keyword));

  const torKeywords = [" tor ", ".tor", "tor-exit", "tor exit", "tor relay", "onion"]; 
  const vpnKeywords = [
    "vpn",
    "wireguard",
    "openvpn",
    "ipsec",
    "nordvpn",
    "mullvad",
    "expressvpn",
    "protonvpn",
    "surfshark",
    "cyberghost",
    "pia",
    "private internet access",
    "tunnel",
    "zerotier",
    "tailscale",
  ];
  const proxyKeywords = [
    "proxy",
    "socks",
    "residential gateway",
    "anonymizer",
    "exit node",
    "forwarder",
  ];
  const datacenterKeywords = [
    "digitalocean",
    "ovh",
    "hetzner",
    "linode",
    "amazon",
    "aws",
    "google cloud",
    "microsoft",
    "azure",
    "oracle cloud",
    "vultr",
    "choopa",
    "leaseweb",
    "contabo",
    "datacenter",
    "colo",
    "colocation",
  ];
  const residentialKeywords = [
    "telekom",
    "vodafone",
    "comcast",
    "charter",
    "cox",
    "orange",
    "telefonica",
    "verizon",
    "at&t",
    "bell",
    "movistar",
    "free",
    "bt",
  ];

  const reasons: string[] = [];
  let score = 0;
  let proxyType: ProxyAssessment["proxyType"] = "unknown";

  if (data.proxy) {
    score += 4;
    reasons.push("upstream-provider-flagged-proxy");
  }
  if (data.hosting) {
    score += 2;
    reasons.push("upstream-provider-flagged-hosting");
  }
  if (includesAny(torKeywords)) {
    score += 5;
    proxyType = "tor";
    reasons.push("tor-signature");
  }
  if (includesAny(vpnKeywords)) {
    score += 3;
    if (proxyType === "unknown") proxyType = "vpn";
    reasons.push("vpn-signature");
  }
  if (includesAny(proxyKeywords)) {
    score += 2;
    if (proxyType === "unknown") proxyType = "hosting-proxy";
    reasons.push("proxy-signature");
  }
  if (data.hosting && includesAny(datacenterKeywords)) {
    score += 2;
    if (proxyType === "unknown") proxyType = "hosting-proxy";
    reasons.push("datacenter-signature");
  }

  if (data.mobile || includesAny(residentialKeywords)) {
    score -= 3;
    reasons.push("residential-or-mobile-signal");
  }

  const isProxy = score >= 4 || proxyType === "tor";
  const confidence: ProxyAssessment["confidence"] = !isProxy
    ? "none"
    : score >= 7
      ? "high"
      : score >= 5
        ? "medium"
        : "low";

  return { isProxy, proxyType, confidence, reasons };
}

function isIPv4(ip: string): boolean {
  return net.isIP(ip) === 4;
}

function isIPv6(ip: string): boolean {
  return net.isIP(ip) === 6;
}

function extractIps(forwardedFor: string | null, realIp: string | null) {
  let ipv4: string | null = null;
  let ipv6: string | null = null;

  const candidates: Array<{ ip: string; source: string }> = [];

  if (forwardedFor) {
    forwardedFor.split(",").forEach((part, index) => {
      const trimmed = part.trim();
      if (trimmed) {
        candidates.push({ ip: trimmed, source: `x-forwarded-for[${index}]` });
      }
    });
  }
  if (realIp) {
    const trimmed = realIp.trim();
    if (trimmed) candidates.push({ ip: trimmed, source: "x-real-ip" });
  }

  const localIpChecks = candidates.flatMap((candidate) => {
    const version: 4 | 6 | null = isIPv4(candidate.ip)
      ? 4
      : isIPv6(candidate.ip)
        ? 6
        : null;
    return version ? [{ ...candidate, version }] : [];
  });

  for (const candidate of localIpChecks) {
    if (!ipv4 && candidate.version === 4) {
      ipv4 = candidate.ip;
    }
    if (!ipv6 && candidate.version === 6) {
      ipv6 = candidate.ip;
    }
    if (ipv4 && ipv6) break;
  }

  return { ipv4, ipv6, localIpChecks };
}

async function lookupIp(ip: string, language: string): Promise<IpApiPayload | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query&lang=${language}`,
      { cache: "no-store", signal: controller.signal },
    );
    const parsed = ipApiPayloadSchema.safeParse(await res.json());
    if (!parsed.success) return null;

    const data = parsed.data;
    if (data.status === "fail") return null;
    return data;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function getUnknownResult(language: Locale) {
  const t = getTranslation(language);

  return {
    country: t.unknown,
    countryCode: "",
    region: t.unknown,
    regionName: t.unknown,
    city: t.unknown,
    zip: t.unknown,
    lat: 0,
    lon: 0,
    timezone: t.unknown,
    isp: t.unknown,
    org: t.unknown,
    as: t.unknown,
    asname: t.unknown,
    reverse: "",
    mobile: false,
    proxy: false,
    proxyType: "unknown",
    proxyConfidence: "none",
    proxyReasons: [] as string[],
    hosting: false,
    connectionType: t.unknown,
  };
}

function toResponsePayload(
  source: IpApiPayload,
  ip: string,
  ipv4: string | null,
  ipv6: string | null,
  localIpChecks: Array<{ ip: string; source: string; version: 4 | 6 }> = [],
) {
  const proxyAssessment = assessProxyRisk({
    isp: source.isp || "",
    org: source.org || "",
    as: source.as || "",
    reverse: source.reverse,
    proxy: Boolean(source.proxy),
    hosting: Boolean(source.hosting),
    mobile: Boolean(source.mobile),
  });

  const resolvedQuery = source.query || ip;
  const responseIpv4 = isIPv4(resolvedQuery) ? resolvedQuery : ipv4;
  const responseIpv6 = isIPv6(resolvedQuery) ? resolvedQuery : ipv6;

  return {
    ipv4: responseIpv4,
    ipv6: responseIpv6,
    ipVersion: responseIpv6 && !responseIpv4 ? 6 : 4,
    ipSources: {
      ipv4: responseIpv4
        ? isIPv4(resolvedQuery)
          ? "ip-api-query"
          : localIpChecks.find((check) => check.ip === responseIpv4)?.source || "request-header"
        : undefined,
      ipv6: responseIpv6
        ? isIPv6(resolvedQuery)
          ? "ip-api-query"
          : localIpChecks.find((check) => check.ip === responseIpv6)?.source || "request-header"
        : undefined,
    },
    localIpChecks,
    country: source.country || "",
    countryCode: source.countryCode || "",
    region: source.region || "",
    regionName: source.regionName || "",
    city: source.city || "",
    zip: source.zip || "",
    lat: source.lat ?? 0,
    lon: source.lon ?? 0,
    timezone: source.timezone || "",
    isp: source.isp || "",
    org: source.org || "",
    as: source.as || "",
    asname: source.asname || "",
    reverse: source.reverse || "",
    mobile: Boolean(source.mobile),
    proxy: proxyAssessment.isProxy,
    proxyType: proxyAssessment.proxyType,
    proxyConfidence: proxyAssessment.confidence,
    proxyReasons: proxyAssessment.reasons,
    hosting: Boolean(source.hosting),
    connectionType: detectConnectionType({
      isp: source.isp || "",
      org: source.org || "",
      as: source.as || "",
      mobile: Boolean(source.mobile),
      proxy: proxyAssessment.isProxy,
      hosting: Boolean(source.hosting),
      proxyType: proxyAssessment.proxyType,
    }),
  };
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "ip", { limit: 80, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const parsedQuery = ipQuerySchema.safeParse({
    ip: searchParams.get("ip") || undefined,
  });

  if (!parsedQuery.success) {
    return apiValidationError(parsedQuery.error);
  }

  const queryIp = parsedQuery.data.ip;
  const language = resolveIpApiLanguage(request);

  // If a specific IP was passed (from /check), just look it up
  if (queryIp) {
    let ip: string;

    try {
      const target = await assertPublicTarget(queryIp);
      ip = target.hostname;
    } catch (error) {
      if (error instanceof TargetValidationError) {
        return apiError(error.code, error.message, error.status, error.details);
      }

      return apiError("invalid_target", "Please provide a valid public IP address or domain.", 400);
    }

    const data = await lookupIp(ip, language);

    if (!data) {
      return apiOk({
        ipv4: isIPv4(ip) ? ip : null,
        ipv6: isIPv6(ip) ? ip : null,
        ipVersion: isIPv6(ip) ? 6 : 4,
        ipSources: {
          ipv4: isIPv4(ip) ? "query-target" : undefined,
          ipv6: isIPv6(ip) ? "query-target" : undefined,
        },
        localIpChecks: [],
        ...getUnknownResult(language),
      });
    }

    return apiOk({
      ...toResponsePayload(data, ip, isIPv4(ip) ? ip : null, isIPv6(ip) ? ip : null),
    });
  }

  // Auto-detect from request headers
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");

  const { ipv4, ipv6, localIpChecks } = extractIps(forwardedFor, realIp);

  // Use whichever IP we found (prefer IPv4 for geolocation, it tends to be more accurate)
  const primaryIp = ipv4 || ipv6 || "";
  let data: IpApiPayload | null = null;

  if (primaryIp) {
    try {
      assertPublicIpAddress(primaryIp);
      data = await lookupIp(primaryIp, language);
    } catch {
      data = null;
    }
  }

  if (!data) {
    return apiOk({
      ipv4,
      ipv6,
      ipVersion: ipv6 && !ipv4 ? 6 : 4,
      ipSources: {
        ipv4: ipv4
          ? localIpChecks.find((check) => check.ip === ipv4)?.source || "request-header"
          : undefined,
        ipv6: ipv6
          ? localIpChecks.find((check) => check.ip === ipv6)?.source || "request-header"
          : undefined,
      },
      localIpChecks,
      ...getUnknownResult(language),
    });
  }

  return apiOk({
    ...toResponsePayload(data, primaryIp, ipv4, ipv6, localIpChecks),
  });
}
