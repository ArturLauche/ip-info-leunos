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
  type IpinfoAsnData,
  type NormalizedAsn,
  type PeeringDbProfile,
  type RipeStatAsnData,
  type SourceStatus,
} from "@/lib/asn";

export const runtime = "nodejs";

const PROVIDER_TIMEOUT_MS = 6_000;
const PROVIDER_MAX_BYTES = 1_500_000;

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

type IpinfoProviderResult = {
  status: SourceStatus;
  data: IpinfoAsnData | null;
  warnings: string[];
};

type PeeringDbProviderResult = {
  status: Exclude<SourceStatus, "not_configured">;
  data: PeeringDbProfile | null;
  warnings: string[];
};

type RipeStatProviderResult = {
  status: Exclude<SourceStatus, "not_configured">;
  data: RipeStatAsnData | null;
  warnings: string[];
};

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
  const [ipinfoResult, peeringDbResult, ripeStatResult] = await Promise.all([
    fetchIpinfoAsn(normalized),
    fetchPeeringDbAsn(normalized),
    fetchRipeStatAsn(normalized),
  ]);

  const sources: AsnProfile["sources"] = {
    ipinfo: ipinfoResult.status,
    peeringdb: peeringDbResult.status,
    ripestat: ripeStatResult.status,
  };
  const warnings = [...ipinfoResult.warnings, ...peeringDbResult.warnings, ...ripeStatResult.warnings];

  if (allAttemptedProvidersFailed(ipinfoResult, peeringDbResult, ripeStatResult)) {
    return apiError("upstream_error", "ASN data providers are currently unavailable.", 502, {
      sources,
      warnings,
    });
  }

  return apiOk(
    mergeAsnProfile({
      normalized,
      ipinfo: ipinfoResult.data,
      peeringdb: peeringDbResult.data,
      ripestat: ripeStatResult.data,
      sources,
      warnings,
    }),
  );
}

async function fetchIpinfoAsn(normalized: NormalizedAsn): Promise<IpinfoProviderResult> {
  const token = process.env.IPINFO_TOKEN?.trim();

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

async function fetchRipeStatAsn(normalized: NormalizedAsn): Promise<RipeStatProviderResult> {
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
      });

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

async function fetchPeeringDbAsn(normalized: NormalizedAsn): Promise<PeeringDbProviderResult> {
  try {
    const { response, json } = await fetchProviderJson(
      `https://www.peeringdb.com/api/net?asn=${normalized.asnNumber}&depth=2`,
      {
        "user-agent": "ip-info-leunos-asn-check/1.0",
        accept: "application/json",
      },
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
    const data = normalizePeeringDbPayload(json, warnings);

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

async function fetchProviderJson(url: string, headers: HeadersInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
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
  }
}

async function readJsonWithLimit(response: Response, maxBytes: number): Promise<unknown> {
  const contentLength = response.headers.get("content-length");
  const parsedLength = contentLength ? Number(contentLength) : 0;

  if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
    throw new ProviderFetchError("response_too_large", "Provider response exceeded the size limit.");
  }

  let text: string;

  if (!response.body) {
    text = await response.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) {
      throw new ProviderFetchError("response_too_large", "Provider response exceeded the size limit.");
    }
  } else {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

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

        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    text = new TextDecoder().decode(bytes);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ProviderFetchError("invalid_json", "Provider returned invalid JSON.");
  }
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
