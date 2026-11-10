import dns from "node:dns/promises";
import { withTimeout } from "@/lib/async";
import { createSingleFlight } from "@/lib/single-flight";
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
  return withTimeout(promise, RESOLVE_TIMEOUT_MS, () => new Error("DNS query timed out."));
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
  const limited = enforceRateLimit(request, "cdn", {
    limit: 20,
    windowMs: 60_000,
  });
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

    return apiError(
      "invalid_target",
      "Please provide a valid public domain or URL.",
      400,
    );
  }

  // CDN results depend only on the public target, never on the requester, so
  // identical concurrent checks share one probe.
  const outcome = await cdnFlights.run(normalized.toString(), () =>
    probeCdnTarget(normalized, hostname, resolvedIps),
  );
  if (!outcome.ok) {
    const { code, message, status, details } = outcome.error;
    return apiError(code, message, status, details);
  }
  return apiOk(outcome.payload);
}

type CdnOutcome =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; error: TargetValidationError };

const cdnFlights = createSingleFlight<CdnOutcome>();

async function probeCdnTarget(
  normalized: URL,
  hostname: string,
  validatedIps: string[],
): Promise<CdnOutcome> {
  // The HTTP probe and the DNS enrichment are independent: running them
  // concurrently makes the route take max(probe, dns) instead of their sum.
  const probe = fetchPublicUrl(normalized, {
    method: "GET",
    cache: "no-store",
    maxRedirects: 3,
    timeoutMs: 6_000,
    maxContentLengthBytes: 1_000_000,
    headers: {
      "user-agent": "ip-info-leunos-cdn-check/1.2",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  }).then(
    async (response) => {
      await response.body?.cancel();
      return { ok: true as const, headers: response.headers, status: response.status };
    },
    (error: unknown) => ({ ok: false as const, error }),
  );

  const [cnameChain, dnsResolvedIps, probed] = await Promise.all([
    resolveCnameChain(hostname),
    resolveIpAddresses(hostname),
    probe,
  ]);

  const resolvedIps = [...new Set([...validatedIps, ...dnsResolvedIps])].slice(0, 8);

  if (!probed.ok) {
    if (probed.error instanceof TargetValidationError) {
      return { ok: false, error: probed.error };
    }

    return {
      ok: true,
      payload: {
        target: hostname,
        reachable: false,
        usesCdn: false,
        detectedCdn: null,
        confidence: null,
        reason: "Target could not be reached from the server.",
        reasonCode: "unreachable",
        matchedSignals: [],
        resolvedIps,
        cnameChain,
        headers: [],
      },
    };
  }

  const responseHeaders = probed.headers;
  const status = probed.status;
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

  return {
    ok: true,
    payload: {
      target: hostname,
      reachable: true,
      status,
      usesCdn: Boolean(detection),
      detectedCdn: detection?.provider || null,
      confidence: detection?.confidence || null,
      reason: detection?.reason || "No known CDN signature detected.",
      reasonCode: detection?.reasonCode || "no_known_signature",
      matchedSignals: detection?.matchedSignals || [],
      resolvedIps,
      cnameChain,
      headers: selectedHeaders,
    },
  };
}
