import { headers } from "next/headers";
import { NextResponse } from "next/server";

const IP_API_LANGUAGE_MAP: Record<string, string> = {
  de: "de",
  en: "en",
  fr: "fr",
  es: "es",
  pt: "pt-BR",
  it: "en",
  nl: "en",
  pl: "en",
};

function resolveApiLanguage(lang: string | null): string {
  if (!lang) return "de";
  return IP_API_LANGUAGE_MAP[lang] || "de";
}

function detectConnectionType(data: {
  isp: string;
  org: string;
  as: string;
  mobile: boolean;
  proxy: boolean;
  hosting: boolean;
}): { connectionType: string; connectionEvidence: string } {
  const ispLower = (data.isp || "").toLowerCase();
  const orgLower = (data.org || "").toLowerCase();
  const asLower = (data.as || "").toLowerCase();

  if (data.hosting) return { connectionType: "Rechenzentrum / Hosting", connectionEvidence: "hosting=true" };
  if (data.proxy) return { connectionType: "Proxy / VPN / Tor", connectionEvidence: "proxy=true" };
  if (data.mobile) return { connectionType: "Mobilfunk", connectionEvidence: "mobile=true" };

  const keywordGroups = [
    {
      type: "Starlink (Satellit)",
      values: ["starlink", "spacex"],
    },
    {
      type: "Satellit",
      values: ["satellite", "satellit", "viasat", "hughesnet", "ses astra"],
    },
    {
      type: "Glasfaser",
      values: ["fiber", "fibre", "glasfaser", "ftth", "fttb", "fttp", "deutsche glasfaser", "init7"],
    },
    {
      type: "Kabelinternet (Koax)",
      values: ["cable", "kabel", "vodafone kabel", "unitymedia", "liberty global", "comcast", "charter", "cox", "cablevision", "pyur", "tele columbus"],
    },
    {
      type: "DSL",
      values: ["dsl", "telekom", "t-online", "1&1", "o2", "ewe tel", "netcologne", "m-net", "easybell", "at&t", "centurylink", "bt "],
    },
  ] as const;

  for (const group of keywordGroups) {
    for (const keyword of group.values) {
      if (ispLower.includes(keyword)) {
        return { connectionType: group.type, connectionEvidence: `isp:${keyword}` };
      }
      if (orgLower.includes(keyword)) {
        return { connectionType: group.type, connectionEvidence: `org:${keyword}` };
      }
      if (asLower.includes(keyword)) {
        return { connectionType: group.type, connectionEvidence: `as:${keyword}` };
      }
    }
  }

  return { connectionType: "Festnetz", connectionEvidence: "fallback:default" };
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

async function lookupIp(ip: string, lang: string) {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query&lang=${lang}`,
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
  country: "Unknown",
  countryCode: "",
  region: "Unknown",
  regionName: "Unknown",
  city: "Unknown",
  zip: "Unknown",
  lat: 0,
  lon: 0,
  timezone: "Unknown",
  isp: "Unknown",
  org: "Unknown",
  as: "Unknown",
  asname: "Unknown",
  reverse: "",
  mobile: false,
  proxy: false,
  hosting: false,
  connectionType: "Unknown",
  connectionEvidence: "fallback:unknown",
};

function buildResult(ipv4: string | null, ipv6: string | null, ipVersion: number, data: any) {
  const detected = detectConnectionType(data);

  return {
    ipv4,
    ipv6,
    ipVersion,
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
    connectionType: detected.connectionType,
    connectionEvidence: detected.connectionEvidence,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryIp = searchParams.get("ip");
  const requestLang = resolveApiLanguage(searchParams.get("lang"));

  if (queryIp) {
    const ip = queryIp.trim();
    const data = await lookupIp(ip, requestLang);

    if (!data) {
      return NextResponse.json({
        ipv4: isIPv4(ip) ? ip : null,
        ipv6: isIPv6(ip) ? ip : null,
        ipVersion: isIPv6(ip) ? 6 : 4,
        ...UNKNOWN_RESULT,
      });
    }

    const finalIp = data.query || ip;
    return NextResponse.json(buildResult(isIPv4(finalIp) ? finalIp : null, isIPv6(finalIp) ? finalIp : null, isIPv6(finalIp) ? 6 : 4, data));
  }

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");

  const { ipv4, ipv6 } = extractIps(forwardedFor, realIp);
  const primaryIp = ipv4 || ipv6 || "Unknown";
  const data = await lookupIp(primaryIp, requestLang);

  if (!data) {
    return NextResponse.json({
      ipv4,
      ipv6,
      ipVersion: ipv6 && !ipv4 ? 6 : 4,
      ...UNKNOWN_RESULT,
    });
  }

  const resolvedIp = data.query || primaryIp;
  let finalIpv4 = ipv4;
  let finalIpv6 = ipv6;

  if (isIPv4(resolvedIp) && !finalIpv4) finalIpv4 = resolvedIp;
  if (isIPv6(resolvedIp) && !finalIpv6) finalIpv6 = resolvedIp;

  return NextResponse.json(buildResult(finalIpv4, finalIpv6, finalIpv6 && !finalIpv4 ? 6 : 4, data));
}
