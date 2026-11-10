import net from "node:net";
import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { createPinnedLookup } from "@/lib/network/pinned-lookup";
import {
  referralCacheKey,
  tldReferralCache,
  whoisCache,
  whoisFlights,
  type WhoisOutcome,
} from "@/lib/whois-cache";
import { extractReferralServer, summarizeRdap, summarizeWhois } from "@/lib/whois";
import {
  assertPublicIpAddress,
  assertPublicTarget,
  fetchPublicUrl,
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
  const publicServer = await assertPublicTarget(server);

  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const chunks: Buffer[] = [];
    let receivedBytes = 0;
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      if (error) reject(error);
      else resolve(Buffer.concat(chunks).toString("utf8"));
    };

    // One budget covers every address attempt and the response body. Socket
    // inactivity timers alone can restart as connection attempts advance.
    const timer = setTimeout(() => {
      finish(new Error(`WHOIS request timed out after ${SOCKET_TIMEOUT_MS}ms.`));
    }, SOCKET_TIMEOUT_MS);
    timer.unref?.();
    socket.once("error", (error) => finish(error));

    socket.connect({
      port: WHOIS_PORT,
      host: publicServer.hostname,
      lookup: createPinnedLookup(publicServer.addresses),
      autoSelectFamily: true,
    }, () => {
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
  timer.unref?.();

  try {
    const response = await fetchPublicUrl(`https://rdap.org/${path}`, {
      cache: "no-store",
      signal: controller.signal,
      timeoutMs: SOCKET_TIMEOUT_MS,
      maxRedirects: 3,
      maxContentLengthBytes: MAX_WHOIS_RESPONSE_BYTES,
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

  const cached = whoisCache.get(target);
  if (cached) return apiOk(cached);

  const outcome = await whoisFlights.run(target, () => resolveWhois(target));
  if (!outcome.ok) {
    // Locale-neutral message (the UI translates by code); upstream details
    // stay machine-readable in details instead of leaking English text.
    return apiError("network_error", "WHOIS lookup failed.", 400, outcome.details);
  }
  return apiOk(outcome.payload);
}

async function resolveWhois(target: string): Promise<WhoisOutcome> {
  const tldKey = referralCacheKey(target, isIp(target));
  const cachedReferral = tldKey ? tldReferralCache.get(tldKey) : undefined;

  try {
    let referredServer = cachedReferral ?? null;
    if (!referredServer) {
      const ianaResponse = await queryWhois("whois.iana.org", target);
      referredServer = extractReferralServer(ianaResponse);

      if (!referredServer) {
        const payload = {
          target,
          server: "whois.iana.org",
          raw: ianaResponse,
          summary: summarizeWhois(ianaResponse),
          noteCode: "iana_only",
        };
        whoisCache.set(target, payload);
        return { ok: true, payload };
      }
      if (tldKey) tldReferralCache.set(tldKey, referredServer);
    }

    let referredResponse: string;
    try {
      referredResponse = await queryWhois(referredServer, target);
    } catch (error) {
      // A cached referral may have moved: ask IANA again next time.
      if (tldKey) tldReferralCache.delete(tldKey);
      throw error;
    }

    const payload = {
      target,
      server: referredServer,
      raw: referredResponse,
      summary: summarizeWhois(referredResponse),
      refer: "whois.iana.org",
    };
    whoisCache.set(target, payload);
    return { ok: true, payload };
  } catch (whoisError) {
    try {
      const rdap = await lookupViaRdap(target);
      const payload = {
        target,
        server: "rdap.org",
        raw: rdap.raw,
        rdap: rdap.rdap,
        summary: rdap.summary,
        noteCode: "rdap_fallback",
      };
      whoisCache.set(target, payload);
      return { ok: true, payload };
    } catch (rdapError) {
      return {
        ok: false,
        details: {
          whois: (whoisError as Error).message || "unknown WHOIS error",
          rdap: (rdapError as Error).message || "unknown RDAP error",
        },
      };
    }
  }
}
