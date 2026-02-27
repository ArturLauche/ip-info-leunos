import { NextResponse } from "next/server";

export const runtime = "edge";

function normalizeTarget(input: string) {
  return input.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "").toLowerCase();
}

function isIp(target: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(target) || target.includes(":");
}

async function lookupViaRdap(target: string) {
  const path = isIp(target) ? `ip/${target}` : `domain/${target}`;
  const response = await fetch(`https://rdap.org/${path}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`RDAP request failed with status ${response.status}.`);
  }

  const data = await response.json();
  return JSON.stringify(data, null, 2);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawTarget = searchParams.get("target");

  if (!rawTarget || !rawTarget.trim()) {
    return NextResponse.json({ error: "Missing target query parameter." }, { status: 400 });
  }

  const target = normalizeTarget(rawTarget);
  if (!target) {
    return NextResponse.json({ error: "Please provide a valid domain or IP." }, { status: 400 });
  }

  try {
    const rdapRaw = await lookupViaRdap(target);

    return NextResponse.json({
      target,
      server: "rdap.org",
      raw: rdapRaw,
      note: "Cloudflare Pages runtime does not support port-43 WHOIS sockets; returned RDAP data instead.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        target,
        error: "Lookup failed.",
        details: (error as Error).message,
      },
      { status: 502 },
    );
  }
}
