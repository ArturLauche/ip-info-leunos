import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

  if (data.hosting) return "Rechenzentrum / Hosting";
  if (data.proxy) return "Proxy / VPN / Tor";
  if (data.mobile) return "Mobilfunk";

  if (
    ispLower.includes("starlink") ||
    orgLower.includes("starlink") ||
    asLower.includes("starlink") ||
    ispLower.includes("spacex")
  ) {
    return "Starlink (Satellit)";
  }

  if (
    ispLower.includes("satellite") ||
    ispLower.includes("satellit") ||
    ispLower.includes("viasat") ||
    ispLower.includes("hughesnet") ||
    ispLower.includes("ses astra")
  ) {
    return "Satellit";
  }

  if (
    ispLower.includes("fiber") ||
    ispLower.includes("fibre") ||
    ispLower.includes("glasfaser") ||
    ispLower.includes("ftth") ||
    ispLower.includes("fttb") ||
    ispLower.includes("fttp") ||
    orgLower.includes("fiber") ||
    orgLower.includes("glasfaser") ||
    ispLower.includes("deutsche glasfaser") ||
    ispLower.includes("init7")
  ) {
    return "Glasfaser";
  }

  if (
    ispLower.includes("cable") ||
    ispLower.includes("kabel") ||
    ispLower.includes("vodafone kabel") ||
    ispLower.includes("unitymedia") ||
    ispLower.includes("liberty global") ||
    ispLower.includes("comcast") ||
    ispLower.includes("charter") ||
    ispLower.includes("cox") ||
    ispLower.includes("cablevision") ||
    ispLower.includes("pyur") ||
    ispLower.includes("tele columbus")
  ) {
    return "Kabelinternet (Koax)";
  }

  if (
    ispLower.includes("dsl") ||
    ispLower.includes("telekom") ||
    ispLower.includes("t-online") ||
    ispLower.includes("1&1") ||
    ispLower.includes("o2") ||
    ispLower.includes("ewe tel") ||
    ispLower.includes("netcologne") ||
    ispLower.includes("m-net") ||
    ispLower.includes("easybell") ||
    ispLower.includes("at&t") ||
    ispLower.includes("centurylink") ||
    ispLower.includes("bt ") ||
    orgLower.includes("dsl")
  ) {
    return "DSL";
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

async function lookupIp(ip: string) {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query&lang=de`,
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

  // If a specific IP was passed (from /check), just look it up
  if (queryIp) {
    const ip = queryIp.trim();
    const data = await lookupIp(ip);

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
  const data = await lookupIp(primaryIp);

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
