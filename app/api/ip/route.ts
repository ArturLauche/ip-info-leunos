import { headers } from "next/headers";
import { NextResponse } from "next/server";

const IP_API_SUPPORTED_LANGUAGES = new Set([
  "de",
  "en",
  "es",
  "pt-BR",
  "fr",
  "ja",
  "zh-CN",
  "ru",
]);

const IP_API_LANGUAGE_ALIASES: Record<string, string> = {
  "de-at": "de",
  "de-ch": "de",
  "de-de": "de",
  "en-gb": "en",
  "en-us": "en",
  "es-es": "es",
  "es-mx": "es",
  "fr-ca": "fr",
  "fr-fr": "fr",
  "ja-jp": "ja",
  "pt": "pt-BR",
  "pt-pt": "pt-BR",
  "pt-br": "pt-BR",
  "ru-ru": "ru",
  "zh": "zh-CN",
  "zh-hans": "zh-CN",
  "zh-hk": "zh-CN",
  "zh-sg": "zh-CN",
  "zh-tw": "zh-CN",
};

function resolveIpApiLanguage(request: Request): string {
  const acceptLanguage = request.headers.get("accept-language");

  if (!acceptLanguage) {
    return "en";
  }

  const preferredLanguages = acceptLanguage
    .split(",")
    .map((entry) => entry.trim().split(";")[0])
    .filter(Boolean);

  for (const language of preferredLanguages) {
    if (IP_API_SUPPORTED_LANGUAGES.has(language)) {
      return language;
    }

    const normalizedLanguage = language.toLowerCase();
    const aliasedLanguage = IP_API_LANGUAGE_ALIASES[normalizedLanguage];
    if (aliasedLanguage && IP_API_SUPPORTED_LANGUAGES.has(aliasedLanguage)) {
      return aliasedLanguage;
    }

    const baseLanguage = normalizedLanguage.split("-")[0];
    if (baseLanguage && IP_API_SUPPORTED_LANGUAGES.has(baseLanguage)) {
      return baseLanguage;
    }

    const aliasedBaseLanguage = baseLanguage
      ? IP_API_LANGUAGE_ALIASES[baseLanguage]
      : null;
    if (
      aliasedBaseLanguage &&
      IP_API_SUPPORTED_LANGUAGES.has(aliasedBaseLanguage)
    ) {
      return aliasedBaseLanguage;
    }
  }

  return "en";
}

function detectConnectionType(data: {
  isp: string;
  org: string;
  as: string;
  mobile: boolean;
  proxy: boolean;
  hosting: boolean;
}): string {
  const ispLower = (data.isp || "").toLowerCase();
  const orgLower = (data.org || "").toLowerCase();
  const asLower = (data.as || "").toLowerCase();
  const combinedText = `${ispLower} ${orgLower} ${asLower}`;
  const hasAnyKeyword = (keywords: string[]) =>
    keywords.some((keyword) => combinedText.includes(keyword));

  if (data.hosting) return "Rechenzentrum / Hosting";
  if (data.proxy) return "Proxy / VPN / Tor";
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

function isIPv6(ip: string): boolean {
  return ip.includes(":");
}

function isIPv4(ip: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);
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

const UNKNOWN_RESULT = {
  country: "Unbekannt",
  countryCode: "",
  region: "Unbekannt",
  regionName: "Unbekannt",
  city: "Unbekannt",
  zip: "Unbekannt",
  lat: 0,
  lon: 0,
  timezone: "Unbekannt",
  isp: "Unbekannt",
  org: "Unbekannt",
  as: "Unbekannt",
  asname: "Unbekannt",
  reverse: "",
  mobile: false,
  proxy: false,
  hosting: false,
  connectionType: "Unbekannt",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryIp = searchParams.get("ip");
  const language = resolveIpApiLanguage(request);

  // If a specific IP was passed (from /check), just look it up
  if (queryIp) {
    const ip = queryIp.trim();
    const data = await lookupIp(ip, language);

    if (!data) {
      return NextResponse.json({
        ipv4: isIPv4(ip) ? ip : null,
        ipv6: isIPv6(ip) ? ip : null,
        ipVersion: isIPv6(ip) ? 6 : 4,
        ...UNKNOWN_RESULT,
      });
    }

    return NextResponse.json({
      ipv4: isIPv4(data.query || ip) ? (data.query || ip) : null,
      ipv6: isIPv6(data.query || ip) ? (data.query || ip) : null,
      ipVersion: isIPv6(data.query || ip) ? 6 : 4,
      country: data.country,
      countryCode: data.countryCode,
      region: data.region,
      regionName: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      as: data.as,
      asname: data.asname,
      reverse: data.reverse || "",
      mobile: data.mobile,
      proxy: data.proxy,
      hosting: data.hosting,
      connectionType: detectConnectionType(data),
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
      ...UNKNOWN_RESULT,
    });
  }

  // If we got a different IP back from ip-api (e.g. resolved domain), check it
  const resolvedIp = data.query || primaryIp;
  let finalIpv4 = ipv4;
  let finalIpv6 = ipv6;

  if (isIPv4(resolvedIp) && !finalIpv4) finalIpv4 = resolvedIp;
  if (isIPv6(resolvedIp) && !finalIpv6) finalIpv6 = resolvedIp;

  return NextResponse.json({
    ipv4: finalIpv4,
    ipv6: finalIpv6,
    ipVersion: finalIpv6 && !finalIpv4 ? 6 : 4,
    country: data.country,
    countryCode: data.countryCode,
    region: data.region,
    regionName: data.regionName,
    city: data.city,
    zip: data.zip,
    lat: data.lat,
    lon: data.lon,
    timezone: data.timezone,
    isp: data.isp,
    org: data.org,
    as: data.as,
    asname: data.asname,
    reverse: data.reverse || "",
    mobile: data.mobile,
    proxy: data.proxy,
    hosting: data.hosting,
    connectionType: detectConnectionType(data),
  });
}
