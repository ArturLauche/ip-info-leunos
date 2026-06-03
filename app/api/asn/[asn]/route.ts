import { createHash } from "node:crypto";
import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
  AsnValidationError,
  mergeAsnProfile,
  normalizeAsnInput,
  normalizeIpinfoAsnPayload,
  normalizePeeringDbPayload,
  normalizeRipeStatPayload,
  type AsnProfile,
  type AsnSource,
  type IpinfoAsnData,
  type NormalizedAsn,
  type PeeringDbProfile,
  type RipeStatAsnData,
  type SourceCacheStatus,
  type SourceDiagnostic,
  type SourceStatus,
} from "@/lib/asn";

export const runtime = "nodejs";

const PROVIDER_TIMEOUT_MS = 6_000;
const PROVIDER_MAX_BYTES = 1_500_000;
const AGGREGATION_DEADLINE_MS = 2_000;
const PROVIDER_CACHE_FRESH_MS = 60_000;
const PROVIDER_CACHE_STALE_MS = 5 * 60_000;
const PROVIDER_CACHE_MAX_ENTRIES = 256;

const asnParamSchema = z.object({
  asn: z
    .string()
    .trim()
    .min(1)
    .max(16)
    .transform((value, context) => {
      try {
        return normalizeAsnInput(value);
      } catch (error) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            error instanceof AsnValidationError
              ? error.message
              : "Use an AS-prefixed or numeric ASN, for example AS8881 or 8881.",
        });
        return z.NEVER;
      }
    }),
});

type ProviderErrorKind = "timeout" | "network" | "response_too_large" | "invalid_json";

class ProviderFetchError extends Error {
  constructor(
    readonly kind: ProviderErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "ProviderFetchError";
  }
}

type ProviderResult<TData, TStatus extends SourceStatus = SourceStatus> = {
  status: TStatus;
  data: TData | null;
  warnings: string[];
};

type TimedProviderResult<TData, TStatus extends SourceStatus = SourceStatus> = ProviderResult<TData, TStatus> & {
  diagnostic: SourceDiagnostic;
};

type IpinfoProviderResult = ProviderResult<IpinfoAsnData, SourceStatus>;
type PeeringDbProviderResult = ProviderResult<PeeringDbProfile, Exclude<SourceStatus, "not_configured">>;
type RipeStatProviderResult = ProviderResult<RipeStatAsnData, Exclude<SourceStatus, "not_configured">>;

type ProviderCacheEntry<TData, TStatus extends SourceStatus = SourceStatus> = {
  storedAt: number;
  result: ProviderResult<TData, TStatus>;
};

const providerCache = new Map<string, ProviderCacheEntry<unknown, SourceStatus>>();

interface RouteContext {
  params: Promise<{
    asn: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const limited = enforceRateLimit(request, "asn", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const params = await context.params;
  const parsedParams = asnParamSchema.safeParse(params);

  if (!parsedParams.success) {
    return apiValidationError(parsedParams.error);
  }

  const normalized = parsedParams.data.asn;
  const includeDiagnostics = hasSourceInfoFlag(request);
  const { ipinfoResult, peeringDbResult, ripeStatResult, sourceDiagnostics } = await fetchAggregatedAsn(normalized);

  const sources: AsnProfile["sources"] = {
    ipinfo: ipinfoResult.status,
    peeringdb: peeringDbResult.status,
    ripestat: ripeStatResult.status,
  };
  const warnings = dedupeWarnings([...ipinfoResult.warnings, ...peeringDbResult.warnings, ...ripeStatResult.warnings]);

  if (allAttemptedProvidersFailed(ipinfoResult, peeringDbResult, ripeStatResult)) {
    return apiError("upstream_error", "ASN data providers are currently unavailable.", 502, {
      sources,
      warnings,
      ...(includeDiagnostics ? { sourceDiagnostics } : {}),
    });
  }

  const profile = mergeAsnProfile({
    normalized,
    ipinfo: ipinfoResult.data,
    peeringdb: peeringDbResult.data,
    ripestat: ripeStatResult.data,
    sources,
    warnings,
  });

  if (includeDiagnostics) {
    profile.sourceDiagnostics = sourceDiagnostics;
  }

  return apiOk(profile);
}

async function fetchAggregatedAsn(normalized: NormalizedAsn) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AGGREGATION_DEADLINE_MS);
  const token = process.env.IPINFO_TOKEN?.trim() || "";

  try {
    const [ipinfoResult, peeringDbResult, ripeStatResult] = await Promise.all([
      fetchProviderWithCache<IpinfoAsnData, SourceStatus>({
        source: "ipinfo",
        provider: "IPinfo",
        cacheKey: token ? `ipinfo:${hashToken(token)}:${normalized.asn}` : null,
        signal: controller.signal,
        fetcher: (signal) => fetchIpinfoAsn(normalized, signal, token),
      }),
      fetchProviderWithCache<PeeringDbProfile, Exclude<SourceStatus, "not_configured">>({
        source: "peeringdb",
        provider: "PeeringDB",
        cacheKey: `peeringdb:${normalized.asn}`,
        signal: controller.signal,
        fetcher: (signal) => fetchPeeringDbAsn(normalized, signal),
      }),
      fetchProviderWithCache<RipeStatAsnData, Exclude<SourceStatus, "not_configured">>({
        source: "ripestat",
        provider: "RIPEstat",
        cacheKey: `ripestat:${normalized.asn}`,
        signal: controller.signal,
        fetcher: (signal) => fetchRipeStatAsn(normalized, signal),
      }),
    ]);

    return {
      ipinfoResult,
      peeringDbResult,
      ripeStatResult,
      sourceDiagnostics: [ipinfoResult.diagnostic, peeringDbResult.diagnostic, ripeStatResult.diagnostic],
    };
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

async function fetchIpinfoAsn(normalized: NormalizedAsn, signal: AbortSignal, token: string): Promise<IpinfoProviderResult> {
  if (!token) {
    return {
      status: "not_configured",
      data: null,
      warnings: [],
    };
  }

  try {
    const { response, json } = await fetchProviderJson(
      `https://ipinfo.io/${normalized.asn}/json?token=${encodeURIComponent(token)}`,
      {
        "user-agent": "ip-info-leunos-asn-check/1.0",
        accept: "application/json",
      },
      signal,
    );

    if ([401, 403, 404].includes(response.status)) {
      return {
        status: "unavailable",
        data: null,
        warnings: ["IPinfo ASN data is unavailable for this ASN or token plan."],
      };
    }

    if (!response.ok) {
      return {
        status: "error",
        data: null,
        warnings: [`IPinfo returned HTTP ${response.status}.`],
      };
    }

    const warnings: string[] = [];
    const data = normalizeIpinfoAsnPayload(json, warnings);

    if (!data) {
      return {
        status: "error",
        data: null,
        warnings: ["IPinfo returned an unexpected ASN payload."],
      };
    }

    return {
      status: "available",
      data,
      warnings,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      warnings: [providerWarning("IPinfo", error)],
    };
  }
}

async function fetchRipeStatAsn(normalized: NormalizedAsn, signal: AbortSignal): Promise<RipeStatProviderResult> {
  const endpoints = {
    overview: `https://stat.ripe.net/data/as-overview/data.json?resource=${normalized.asn}`,
    prefixes: `https://stat.ripe.net/data/announced-prefixes/data.json?resource=${normalized.asn}`,
    neighbours: `https://stat.ripe.net/data/asn-neighbours/data.json?resource=${normalized.asn}`,
  };

  const entries = await Promise.allSettled(
    Object.entries(endpoints).map(async ([key, url]) => {
      const { response, json } = await fetchProviderJson(url, {
        "user-agent": "ip-info-leunos-asn-check/1.0",
        accept: "application/json",
      }, signal);

      if (!response.ok) {
        throw new ProviderFetchError("network", `RIPEstat ${key} returned HTTP ${response.status}.`);
      }

      return [key, json] as const;
    }),
  );

  const payload: Parameters<typeof normalizeRipeStatPayload>[0] = {};
  const warnings: string[] = [];

  for (const entry of entries) {
    if (entry.status === "fulfilled") {
      const [key, value] = entry.value;
      payload[key as keyof typeof payload] = value;
    } else {
      warnings.push(providerWarning("RIPEstat", entry.reason));
    }
  }

  const successfulRequests = Object.keys(payload).length;

  if (!successfulRequests) {
    return {
      status: "error",
      data: null,
      warnings,
    };
  }

  const data = normalizeRipeStatPayload(payload, warnings);

  if (!data) {
    return {
      status: "unavailable",
      data: null,
      warnings: [...warnings, "No RIPEstat ASN data was found for this ASN."],
    };
  }

  return {
    status: successfulRequests === Object.keys(endpoints).length ? "available" : "unavailable",
    data,
    warnings,
  };
}

async function fetchPeeringDbAsn(normalized: NormalizedAsn, signal: AbortSignal): Promise<PeeringDbProviderResult> {
  try {
    const { response, json } = await fetchProviderJson(
      `https://www.peeringdb.com/api/net?asn=${normalized.asnNumber}&depth=2`,
      {
        "user-agent": "ip-info-leunos-asn-check/1.0",
        accept: "application/json",
      },
      signal,
    );

    if (response.status === 404) {
      return {
        status: "unavailable",
        data: null,
        warnings: ["No public PeeringDB network profile was found for this ASN."],
      };
    }

    if (!response.ok) {
      return {
        status: "error",
        data: null,
        warnings: [`PeeringDB returned HTTP ${response.status}.`],
      };
    }

    const warnings: string[] = [];
    const data = normalizePeeringDbPayload(json, warnings, normalized.asnNumber);

    if (!data) {
      return {
        status: "unavailable",
        data: null,
        warnings: ["No public PeeringDB network profile was found for this ASN."],
      };
    }

    return {
      status: "available",
      data,
      warnings,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      warnings: [providerWarning("PeeringDB", error)],
    };
  }
}

async function fetchProviderWithCache<TData, TStatus extends SourceStatus>({
  source,
  provider,
  cacheKey,
  signal,
  fetcher,
}: {
  source: AsnSource;
  provider: string;
  cacheKey: string | null;
  signal: AbortSignal;
  fetcher: (signal: AbortSignal) => Promise<ProviderResult<TData, TStatus>>;
}): Promise<TimedProviderResult<TData, TStatus>> {
  const startedAt = Date.now();
  const cached = cacheKey ? getProviderCache<TData, TStatus>(cacheKey) : null;

  if (cacheKey && cached && Date.now() - cached.storedAt <= PROVIDER_CACHE_FRESH_MS) {
    touchProviderCache(cacheKey);
    return withDiagnostic(source, cached.result, "fresh", startedAt);
  }

  const stale = cached && Date.now() - cached.storedAt <= PROVIDER_CACHE_STALE_MS ? cached : null;
  const fetched = fetcher(signal).catch((error): ProviderResult<TData, TStatus> => {
    return {
      status: "error" as TStatus,
      data: null,
      warnings: [providerWarning(provider, error)],
    };
  });
  const result = await Promise.race([fetched, waitForAbort<TData, TStatus>(signal, provider)]);

  if (result.status === "not_configured") {
    return withDiagnostic(source, result, "not_configured", startedAt);
  }

  if (cacheKey && result.status === "error" && stale) {
    const staleResult = {
      ...stale.result,
      warnings: dedupeWarnings([
        ...stale.result.warnings,
        ...result.warnings,
        `${provider} data is currently unavailable; using stale cached data.`,
      ]),
    };
    touchProviderCache(cacheKey);
    return withDiagnostic(source, staleResult, "stale", startedAt);
  }

  if (cacheKey && result.status !== "error") {
    setProviderCache(cacheKey, result);
  }

  return withDiagnostic(source, result, "miss", startedAt);
}

async function fetchProviderJson(url: string, headers: HeadersInit, signal?: AbortSignal) {
  const controller = new AbortController();
  const abortFromParent = () => controller.abort();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    if (signal?.aborted) {
      controller.abort();
    } else {
      signal?.addEventListener("abort", abortFromParent, { once: true });
    }

    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers,
    });
    const json = await readJsonWithLimit(response, PROVIDER_MAX_BYTES);
    return { response, json };
  } catch (error) {
    if (error instanceof ProviderFetchError) throw error;
    if ((error as Error).name === "AbortError") {
      throw new ProviderFetchError("timeout", "Provider request timed out.");
    }

    throw new ProviderFetchError("network", (error as Error).message || "Provider request failed.");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromParent);
  }
}

const sharedEncoder = new TextEncoder();

async function readJsonWithLimit(response: Response, maxBytes: number): Promise<unknown> {
  const contentLength = response.headers.get("content-length");
  const parsedLength = contentLength ? Number(contentLength) : 0;

  if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
    throw new ProviderFetchError("response_too_large", "Provider response exceeded the size limit.");
  }

  let text: string;

  if (!response.body) {
    text = await response.text();
    if (sharedEncoder.encode(text).byteLength > maxBytes) {
      throw new ProviderFetchError("response_too_large", "Provider response exceeded the size limit.");
    }
  } else {
    // Decode incrementally while enforcing the byte limit. This avoids buffering
    // every chunk and copying them into a combined Uint8Array before a final decode.
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let received = 0;
    text = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;

        received += value.byteLength;
        if (received > maxBytes) {
          await reader.cancel();
          throw new ProviderFetchError("response_too_large", "Provider response exceeded the size limit.");
        }

        text += decoder.decode(value, { stream: true });
      }

      text += decoder.decode();
    } finally {
      reader.releaseLock();
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ProviderFetchError("invalid_json", "Provider returned invalid JSON.");
  }
}

function getProviderCache<TData, TStatus extends SourceStatus>(key: string): ProviderCacheEntry<TData, TStatus> | null {
  return (providerCache.get(key) as ProviderCacheEntry<TData, TStatus> | undefined) || null;
}

function setProviderCache<TData, TStatus extends SourceStatus>(key: string, result: ProviderResult<TData, TStatus>) {
  if (providerCache.has(key)) {
    providerCache.delete(key);
  }

  providerCache.set(key, {
    storedAt: Date.now(),
    result: {
      ...result,
      warnings: dedupeWarnings(result.warnings),
    } as ProviderResult<unknown, SourceStatus>,
  });

  while (providerCache.size > PROVIDER_CACHE_MAX_ENTRIES) {
    const oldestKey = providerCache.keys().next().value;
    if (!oldestKey) break;
    providerCache.delete(oldestKey);
  }
}

function touchProviderCache(key: string) {
  const entry = providerCache.get(key);
  if (!entry) return;
  providerCache.delete(key);
  providerCache.set(key, entry);
}

function waitForAbort<TData, TStatus extends SourceStatus>(
  signal: AbortSignal,
  provider: string,
): Promise<ProviderResult<TData, TStatus>> {
  if (signal.aborted) {
    return Promise.resolve(providerTimeoutResult(provider));
  }

  return new Promise((resolve) => {
    signal.addEventListener("abort", () => resolve(providerTimeoutResult(provider)), { once: true });
  });
}

function providerTimeoutResult<TData, TStatus extends SourceStatus>(provider: string): ProviderResult<TData, TStatus> {
  return {
    status: "error" as TStatus,
    data: null,
    warnings: [providerWarning(provider, new ProviderFetchError("timeout", "Provider request timed out."))],
  };
}

function withDiagnostic<TData, TStatus extends SourceStatus>(
  source: AsnSource,
  result: ProviderResult<TData, TStatus>,
  cache: SourceCacheStatus,
  startedAt: number,
): TimedProviderResult<TData, TStatus> {
  const warnings = dedupeWarnings(result.warnings);

  return {
    ...result,
    warnings,
    diagnostic: {
      source,
      status: result.status,
      durationMs: Math.max(0, Date.now() - startedAt),
      cache,
      warnings: warnings.length,
    },
  };
}

function hasSourceInfoFlag(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  return searchParams.has("source-info") || searchParams.has("sourceInfo");
}

let cachedTokenHash: { token: string; hash: string } | null = null;

function hashToken(token: string) {
  if (cachedTokenHash && cachedTokenHash.token === token) {
    return cachedTokenHash.hash;
  }

  const hash = createHash("sha256").update(token).digest("hex").slice(0, 16);
  cachedTokenHash = { token, hash };
  return hash;
}

function dedupeWarnings(warnings: string[]) {
  return [...new Set(warnings.filter(Boolean))];
}

function allAttemptedProvidersFailed(
  ipinfoResult: IpinfoProviderResult,
  peeringDbResult: PeeringDbProviderResult,
  ripeStatResult: RipeStatProviderResult,
) {
  if (peeringDbResult.status !== "error" || ripeStatResult.status !== "error") return false;
  if (ipinfoResult.status === "not_configured") return true;
  return ipinfoResult.status === "error";
}

function providerWarning(provider: string, error: unknown) {
  if (error instanceof ProviderFetchError) {
    if (error.kind === "timeout") return `${provider} request timed out.`;
    if (error.kind === "response_too_large") return `${provider} response exceeded the size limit.`;
    if (error.kind === "invalid_json") return `${provider} returned invalid JSON.`;
  }

  return `${provider} data is currently unavailable.`;
}
