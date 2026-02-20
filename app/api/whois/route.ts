import net from "node:net";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const WHOIS_PORT = 43;
const SOCKET_TIMEOUT_MS = 6000;

function normalizeTarget(input: string) {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

function isIp(target: string) {
  return net.isIP(target) !== 0;
}

function queryWhois(server: string, query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const chunks: string[] = [];

    socket.setTimeout(SOCKET_TIMEOUT_MS);

    socket.once("error", (error) => reject(error));
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error(`WHOIS request timed out after ${SOCKET_TIMEOUT_MS}ms.`));
    });

    socket.connect(WHOIS_PORT, server, () => {
      socket.write(`${query}\r\n`);
    });

    socket.on("data", (data) => {
      chunks.push(data.toString("utf8"));
    });

    socket.once("close", () => {
      resolve(chunks.join(""));
    });
  });
}

function extractReferralServer(response: string) {
  const lines = response.split(/\r?\n/);
  for (const line of lines) {
    const [rawKey, ...rawValue] = line.split(":");
    if (!rawKey || rawValue.length === 0) continue;

    const key = rawKey.trim().toLowerCase();
    const value = rawValue.join(":").trim();

    if (["refer", "whois", "whois server", "referralserver"].includes(key) && value) {
      return value.replace(/^whois:\/\//i, "").trim();
    }
  }

  return null;
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
    const ianaResponse = await queryWhois("whois.iana.org", target);
    const referredServer = extractReferralServer(ianaResponse);

    if (!referredServer) {
      return NextResponse.json({
        target,
        server: "whois.iana.org",
        raw: ianaResponse,
        note: "No referral server found. Showing IANA WHOIS response.",
      });
    }

    const referredResponse = await queryWhois(referredServer, target);

    return NextResponse.json({
      target,
      server: referredServer,
      raw: referredResponse,
      refer: "whois.iana.org",
    });
  } catch (whoisError) {
    try {
      const rdapRaw = await lookupViaRdap(target);

      return NextResponse.json({
        target,
        server: "rdap.org",
        raw: rdapRaw,
        note: "WHOIS port lookup unavailable; returned RDAP data instead.",
      });
    } catch (rdapError) {
      const whoisMessage = (whoisError as Error).message || "unknown WHOIS error";
      const rdapMessage = (rdapError as Error).message || "unknown RDAP error";

      return NextResponse.json(
        { error: `WHOIS lookup failed (${whoisMessage}). RDAP fallback failed (${rdapMessage}).` },
        { status: 400 },
      );
    }
  }
}
