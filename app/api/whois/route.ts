import net from "node:net";
import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { extractReferralServer, summarizeRdap, summarizeWhois } from "@/lib/whois";
import {
  assertPublicIpAddress,
  assertPublicTarget,
  normalizeLookupTarget,
  TargetValidationError,
} from "@/lib/network/target";

export const runtime = "nodejs";

const WHOIS_PORT = 43;
const SOCKET_TIMEOUT_MS = 6000;
const MAX_WHOIS_RESPONSE_BYTES = 256_000;

const whoisQuerySchema = z.object({
  target: z.string().trim().min(1).max(253),
});

function isIp(target: string) {
  return net.isIP(target) !== 0;
}

function validateWhoisTarget(input: string) {
  const target = normalizeLookupTarget(input);

  if (isIp(target)) {
    assertPublicIpAddress(target);
  }

  return target;
}

async function queryWhois(server: string, query: string): Promise<string> {
  await assertPublicTarget(server);

  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const chunks: Buffer[] = [];
    let receivedBytes = 0;
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (error) reject(error);
      else resolve(Buffer.concat(chunks).toString("utf8"));
    };

    socket.setTimeout(SOCKET_TIMEOUT_MS);
    socket.once("error", (error) => finish(error));
    socket.once("timeout", () => {
      finish(new Error(`WHOIS request timed out after ${SOCKET_TIMEOUT_MS}ms.`));
    });

    socket.connect(WHOIS_PORT, server, () => {
      socket.write(`${query}\r\n`);
    });

    socket.on("data", (data) => {
      receivedBytes += data.length;
      if (receivedBytes > MAX_WHOIS_RESPONSE_BYTES) {
        finish(new Error("WHOIS response exceeded the public response size limit."));
        return;
      }

      chunks.push(data);
    });

    socket.once("close", () => finish());
  });
}

async function lookupViaRdap(target: string) {
  const path = isIp(target) ? `ip/${target}` : `domain/${target}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SOCKET_TIMEOUT_MS);

  try {
    const response = await fetch(`https://rdap.org/${path}`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`RDAP request failed with status ${response.status}.`);
    }

    const data = await response.json();
    return {
      raw: JSON.stringify(data, null, 2),
      rdap: data,
      summary: summarizeRdap(data),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "whois", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const parsedQuery = whoisQuerySchema.safeParse({
    target: searchParams.get("target"),
  });

  if (!parsedQuery.success) {
    return apiValidationError(parsedQuery.error);
  }

  let target: string;

  try {
    target = validateWhoisTarget(parsedQuery.data.target);
  } catch (error) {
    if (error instanceof TargetValidationError) {
      return apiError(error.code, error.message, error.status, error.details);
    }

    return apiError("invalid_target", "Please provide a valid public domain or IP.", 400);
  }

  try {
    const ianaResponse = await queryWhois("whois.iana.org", target);
    const referredServer = extractReferralServer(ianaResponse);

    if (!referredServer) {
      return apiOk({
        target,
        server: "whois.iana.org",
        raw: ianaResponse,
        summary: summarizeWhois(ianaResponse),
        note: "No referral server found. Showing IANA WHOIS response.",
      });
    }

    const referredResponse = await queryWhois(referredServer, target);

    return apiOk({
      target,
      server: referredServer,
      raw: referredResponse,
      summary: summarizeWhois(referredResponse),
      refer: "whois.iana.org",
    });
  } catch (whoisError) {
    try {
      const rdap = await lookupViaRdap(target);

      return apiOk({
        target,
        server: "rdap.org",
        raw: rdap.raw,
        rdap: rdap.rdap,
        summary: rdap.summary,
        note: "WHOIS port lookup unavailable; returned RDAP data instead.",
      });
    } catch (rdapError) {
      const whoisMessage = (whoisError as Error).message || "unknown WHOIS error";
      const rdapMessage = (rdapError as Error).message || "unknown RDAP error";

      return apiError(
        "network_error",
        `WHOIS lookup failed (${whoisMessage}). RDAP fallback failed (${rdapMessage}).`,
        400,
      );
    }
  }
}
