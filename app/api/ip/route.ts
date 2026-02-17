import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const headersList = await headers();

  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "Unknown";

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {
      next: { revalidate: 0 },
    });
    const data = await res.json();

    if (data.status === "fail") {
      return NextResponse.json({
        ip,
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
    });
  } catch {
    return NextResponse.json({
      ip,
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
    });
  }
}
