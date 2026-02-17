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

  // Starlink detection
  if (
    ispLower.includes("starlink") ||
    orgLower.includes("starlink") ||
    asLower.includes("starlink") ||
    ispLower.includes("spacex")
  ) {
    return "Starlink (Satellit)";
  }

  // Satellite detection
  if (
    ispLower.includes("satellite") ||
    ispLower.includes("satellit") ||
    ispLower.includes("viasat") ||
    ispLower.includes("hughesnet") ||
    ispLower.includes("ses astra")
  ) {
    return "Satellit";
  }

  // Fiber detection
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

  // Cable / Coax detection
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

  // DSL detection
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryIp = searchParams.get("ip");

  let ip: string;

  if (queryIp) {
    ip = queryIp.trim();
  } else {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    ip = forwardedFor?.split(",")[0]?.trim() || realIp || "Unknown";
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query&lang=de`,
      { cache: "no-store" }
    );
    const data = await res.json();

    if (data.status === "fail") {
      return NextResponse.json({
        ip,
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
      });
    }

    return NextResponse.json({
      ip: data.query || ip,
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
  } catch {
    return NextResponse.json({
      ip,
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
    });
  }
}
