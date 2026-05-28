import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { normalizeAsn, type NormalizedAsn } from "@/lib/asn/input";
import {
  buildAsnProfile,
  type IpinfoAsnPayload,
  type PeeringDbNetRecord,
  type SourceStatus,
} from "@/lib/asn/profile";

const UPSTREAM_TIMEOUT_MS = 6_000;

const asnParamSchema = z.object({
  asn: z.string().trim().min(1).max(32),
});

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function lookupIpinfo(
  normalized: NormalizedAsn,
): Promise<{ status: SourceStatus; payload?: IpinfoAsnPayload | null }> {
  const token = process.env.IPINFO_TOKEN;
  if (!token) {
    return { status: "not_configured" };
  }

  try {
    const response = await fetchWithTimeout(
      `https://ipinfo.io/${normalized.asn}/json?token=${encodeURIComponent(token)}`,
      { headers: { accept: "application/json" } },
    );

    if (!response.ok) {
      return { status: response.status === 404 ? "unavailable" : "error" };
    }

    const json = (await response.json()) as unknown;
    if (!json || typeof json !== "object") {
      return { status: "unavailable" };
    }

    const payload = json as IpinfoAsnPayload & { error?: unknown };
    if (payload.error || !payload.asn) {
      return { status: "unavailable" };
    }

    return { status: "available", payload };
  } catch {
    return { status: "error" };
  }
}

async function lookupPeeringDb(
  normalized: NormalizedAsn,
): Promise<{ status: SourceStatus; record?: PeeringDbNetRecord | null }> {
  try {
    const response = await fetchWithTimeout(
      `https://www.peeringdb.com/api/net?asn=${normalized.asnNumber}&depth=2`,
      { headers: { accept: "application/json" } },
    );

    if (!response.ok) {
      return { status: "error" };
    }

    const json = (await response.json()) as { data?: PeeringDbNetRecord[] } | null;
    const record = Array.isArray(json?.data) ? json?.data[0] : null;

    if (!record) {
      return { status: "unavailable" };
    }

    return { status: "available", record };
  } catch {
    return { status: "error" };
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ asn: string }> },
) {
  const limited = enforceRateLimit(request, "asn", { limit: 40, windowMs: 60_000 });
  if (limited) return limited;

  const params = await context.params;
  const parsed = asnParamSchema.safeParse({ asn: decodeURIComponent(params.asn) });
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const normalizedResult = normalizeAsn(parsed.data.asn);
  if (!normalizedResult.ok) {
    return apiError(
      "invalid_target",
      "Please provide a valid ASN, for example AS8881 or 8881.",
      400,
      { reason: normalizedResult.error },
    );
  }

  const normalized = normalizedResult.value;

  const [ipinfo, peeringdb] = await Promise.all([
    lookupIpinfo(normalized),
    lookupPeeringDb(normalized),
  ]);

  const profile = buildAsnProfile({ normalized, ipinfo, peeringdb });

  return apiOk(profile);
}
