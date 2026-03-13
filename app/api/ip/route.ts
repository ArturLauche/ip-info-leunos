import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getTranslation, resolveLocale, type Locale } from "@/lib/i18n";

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

function isIPv6(ip: string): boolean {
  return ip.includes(":");
}

function isIPv4(ip: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);
}

function normalizeLookupTarget(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const parseCandidate = (candidate: string) => {
    try {
      const parsed = new URL(candidate);
      return parsed.hostname || trimmed;
    } catch {
      return null;
    }
  };

  const directParsed = parseCandidate(trimmed);
  if (directParsed) return directParsed;

  if (trimmed.startsWith("//")) {
    const protocolRelativeParsed = parseCandidate(`http:${trimmed}`);
    if (protocolRelativeParsed) return protocolRelativeParsed;
  }

  if (/[/?#]/.test(trimmed)) {
    const withProtocolParsed = parseCandidate(`http://${trimmed}`);
    if (withProtocolParsed) return withProtocolParsed;
  }

  return trimmed;
}

function extractIps(forwardedFor: string | null, realIp: string | null) {
  let ipv4: string | null = null;
  let ipv6: string | null = null;

  const candidates: string[] = [];

  if (forwardedFor) {
    forwardedFor.split(",").forEach((part) => {
      const trimmed = part.trim();
      if (trimmed) candidates.push(trimmed);
    });
  }
  if (realIp) {
    candidates.push(realIp.trim());
  }

  for (const candidate of candidates) {
    if (!ipv4 && isIPv4(candidate)) {
      ipv4 = candidate;
    }
    if (!ipv6 && isIPv6(candidate)) {
      ipv6 = candidate;
    }
    if (ipv4 && ipv6) break;
  }

  return { ipv4, ipv6 };
}

async function lookupIp(ip: string, language: string) {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query&lang=${language}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    if (data.status === "fail") return null;
    return data;
  } catch {
    return null;
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
  source: any,
  ip: string,
  ipv4: string | null,
  ipv6: string | null
) {
  const proxyAssessment = assessProxyRisk({
    isp: source.isp,
    org: source.org,
    as: source.as,
    reverse: source.reverse,
    proxy: source.proxy,
    hosting: source.hosting,
    mobile: source.mobile,
  });

  const resolvedQuery = source.query || ip;
  const responseIpv4 = isIPv4(resolvedQuery) ? resolvedQuery : ipv4;
  const responseIpv6 = isIPv6(resolvedQuery) ? resolvedQuery : ipv6;

  return {
    ipv4: responseIpv4,
    ipv6: responseIpv6,
    ipVersion: responseIpv6 && !responseIpv4 ? 6 : 4,
    country: source.country,
    countryCode: source.countryCode,
    region: source.region,
    regionName: source.regionName,
    city: source.city,
    zip: source.zip,
    lat: source.lat,
    lon: source.lon,
    timezone: source.timezone,
    isp: source.isp,
    org: source.org,
    as: source.as,
    asname: source.asname,
    reverse: source.reverse || "",
    mobile: source.mobile,
    proxy: proxyAssessment.isProxy,
    proxyType: proxyAssessment.proxyType,
    proxyConfidence: proxyAssessment.confidence,
    proxyReasons: proxyAssessment.reasons,
    hosting: source.hosting,
    connectionType: detectConnectionType({
      isp: source.isp,
      org: source.org,
      as: source.as,
      mobile: source.mobile,
      proxy: proxyAssessment.isProxy,
      hosting: source.hosting,
      proxyType: proxyAssessment.proxyType,
    }),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryIp = searchParams.get("ip");
  const language = resolveIpApiLanguage(request);

  // If a specific IP was passed (from /check), just look it up
  if (queryIp) {
    const ip = normalizeLookupTarget(queryIp);
    const data = await lookupIp(ip, language);

    if (!data) {
      return NextResponse.json({
        ipv4: isIPv4(ip) ? ip : null,
        ipv6: isIPv6(ip) ? ip : null,
        ipVersion: isIPv6(ip) ? 6 : 4,
        ...getUnknownResult(language),
      });
    }

    return NextResponse.json({
      ...toResponsePayload(data, ip, isIPv4(ip) ? ip : null, isIPv6(ip) ? ip : null),
    });
  }

  // Auto-detect from request headers
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");

  const { ipv4, ipv6 } = extractIps(forwardedFor, realIp);

  // Use whichever IP we found (prefer IPv4 for geolocation, it tends to be more accurate)
  const primaryIp = ipv4 || ipv6 || "Unknown";
  const data = await lookupIp(primaryIp, language);

  if (!data) {
    return NextResponse.json({
      ipv4,
      ipv6,
      ipVersion: ipv6 && !ipv4 ? 6 : 4,
      ...getUnknownResult(language),
    });
  }

  return NextResponse.json({
    ...toResponsePayload(data, primaryIp, ipv4, ipv6),
  });
}
