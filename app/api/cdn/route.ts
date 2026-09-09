import dns from "node:dns/promises";
import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { detectCdn } from "@/lib/cdn-detection";
import {
  assertPublicUrl,
  fetchPublicUrl,
  normalizeWebUrl,
  TargetValidationError,
} from "@/lib/network/target";

export const runtime = "nodejs";

const cdnQuerySchema = z.object({
  target: z.string().trim().min(1).max(2048),
});

const RESOLVE_TIMEOUT_MS = 2_000;

function raceCdnResolve<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("DNS query timed out.")), RESOLVE_TIMEOUT_MS);
    timer.unref?.();
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function resolveCnameChain(hostname: string) {
  const cnames: string[] = [];
  let current = hostname;

  for (let i = 0; i < 5; i += 1) {
    try {
      // Bounded per hop: a hanging CNAME must not hold the route open.
      const records = await raceCdnResolve(dns.resolveCname(current));
      if (!records.length) break;

      const next = records[0].toLowerCase();
      if (cnames.includes(next)) break;

      cnames.push(next);
      current = next;
    } catch {
      break;
    }
  }

  return cnames;
}

async function resolveIpAddresses(hostname: string) {
  const [v4Result, v6Result] = await Promise.allSettled([
    raceCdnResolve(dns.resolve4(hostname)),
    raceCdnResolve(dns.resolve6(hostname)),
  ]);

  const ipv4 = v4Result.status === "fulfilled" ? v4Result.value : [];
  const ipv6 = v6Result.status === "fulfilled" ? v6Result.value : [];

  return [...new Set([...ipv4, ...ipv6])].slice(0, 8);
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "cdn", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const parsedQuery = cdnQuerySchema.safeParse({
    target: searchParams.get("target"),
  });

  if (!parsedQuery.success) {
    return apiValidationError(parsedQuery.error);
  }

  let normalized: URL;
  let hostname: string;
  let resolvedIps: string[];

  try {
    normalized = normalizeWebUrl(parsedQuery.data.target);
    const publicUrl = await assertPublicUrl(normalized);
    hostname = publicUrl.hostname;
    resolvedIps = publicUrl.addresses.slice(0, 8);
  } catch (error) {
    if (error instanceof TargetValidationError) {
      return apiError(error.code, error.message, error.status, error.details);
    }

    return apiError("invalid_target", "Please provide a valid public domain or URL.", 400);
  }

  const [cnameChain, dnsResolvedIps] = await Promise.all([
    resolveCnameChain(hostname),
    resolveIpAddresses(hostname),
  ]);

  resolvedIps = [...new Set([...resolvedIps, ...dnsResolvedIps])].slice(0, 8);

  let responseHeaders: Headers;
  let status = 0;

  try {
    const response = await fetchPublicUrl(normalized, {
      method: "GET",
      cache: "no-store",
      maxRedirects: 3,
      timeoutMs: 6_000,
      maxContentLengthBytes: 1_000_000,
      headers: {
        "user-agent": "ip-info-leunos-cdn-check/1.2",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    responseHeaders = response.headers;
    status = response.status;
    await response.body?.cancel();
  } catch (error) {
    if (error instanceof TargetValidationError) {
      return apiError(error.code, error.message, error.status, error.details);
    }

    return apiOk({
      target: hostname,
      reachable: false,
      usesCdn: false,
      detectedCdn: null,
      confidence: null,
      reason: "Target could not be reached from the server.",
      matchedSignals: [],
      resolvedIps,
      cnameChain,
      headers: [],
    });
  }

  const detection = detectCdn(responseHeaders, cnameChain, hostname);
  const selectedHeaders = [
    "server",
    "via",
    "cache-status",
    "x-cache",
    "x-served-by",
    "x-vercel-id",
    "x-vercel-cache",
    "x-nf-request-id",
    "cf-ray",
    "cf-cache-status",
    "x-amz-cf-id",
    "x-amz-cf-pop",
    "x-azure-ref",
    "x-msedge-ref",
    "x-swift-cachetime",
    "eo-cache-status",
    "x-oracle-dms-ecid",
    "cdn-cache",
    "bcdn-cache-status",
    "x-jsd-version-type",
    "x-cdn",
  ]
    .map((header) => {
      const value = responseHeaders.get(header);
      return value ? { key: header, value } : null;
    })
    .filter((item): item is { key: string; value: string } => Boolean(item));

  return apiOk({
    target: hostname,
    reachable: true,
    status,
    usesCdn: Boolean(detection),
    detectedCdn: detection?.provider || null,
    confidence: detection?.confidence || null,
    reason: detection?.reason || "No known CDN signature detected.",
    matchedSignals: detection?.matchedSignals || [],
    resolvedIps,
    cnameChain,
    headers: selectedHeaders,
  });
}
