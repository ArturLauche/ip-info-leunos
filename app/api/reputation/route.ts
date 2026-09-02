import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
  assertPublicIpAddress,
  isIPv4Address,
  stripIpv6Brackets,
  TargetValidationError,
} from "@/lib/network/target";
import { collectReputation } from "@/lib/reputation/query";
import { aggregateReputation } from "@/lib/reputation/scoring";
import type { ReputationSummary, SourceStatus } from "@/lib/reputation/model";

export const runtime = "nodejs";

const RESPONSE_CACHE_TTL_MS = 10 * 60_000;
const RESPONSE_CACHE_MAX_ENTRIES = 512;

const reputationQuerySchema = z.object({
  ip: z.string().trim().min(1).max(64),
});

interface CacheEntry {
  storedAt: number;
  summary: ReputationSummary;
}

const responseCache = new Map<string, CacheEntry>();

const CHECKED_STATUSES: ReadonlySet<SourceStatus> = new Set([
  "clean",
  "matched",
  "policy_listed",
  "available",
]);

const UNAVAILABLE_STATUSES: ReadonlySet<SourceStatus> = new Set([
  "unavailable",
  "rate_limited",
  "resolver_blocked",
]);

const SKIPPED_STATUSES: ReadonlySet<SourceStatus> = new Set(["not_configured", "unsupported"]);

function configFingerprint(): string {
  return [
    Boolean(process.env.ABUSEIPDB_API_KEY?.trim()),
    Boolean(process.env.GREYNOISE_API_KEY?.trim()),
    Boolean(process.env.HTTPBL_ACCESS_KEY?.trim()),
    Boolean(process.env.THREATFOX_AUTH_KEY?.trim()),
  ].join(",");
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "reputation", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const parsedQuery = reputationQuerySchema.safeParse({
    ip: searchParams.get("ip"),
  });

  if (!parsedQuery.success) {
    return apiValidationError(parsedQuery.error);
  }

  const ip = stripIpv6Brackets(parsedQuery.data.ip);

  try {
    assertPublicIpAddress(ip);
  } catch (error) {
    if (error instanceof TargetValidationError) {
      return apiError(error.code, error.message, error.status, error.details);
    }
    return apiError("invalid_target", "Please provide a valid public IP address.", 400);
  }

  const family: 4 | 6 = isIPv4Address(ip) ? 4 : 6;
  const cacheKey = `${ip}:${configFingerprint()}`;

  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.storedAt < RESPONSE_CACHE_TTL_MS) {
    return apiOk(cached.summary);
  }
  responseCache.delete(cacheKey);

  const { sources, evidence, geo, network, networkContext } = await collectReputation(ip, family);

  const checkedSources = sources.filter((source) => CHECKED_STATUSES.has(source.status));
  if (checkedSources.length === 0) {
    return apiError("upstream_error", "Reputation sources are currently unavailable.", 502, {
      sources: sources.map((source) => ({ id: source.id, status: source.status })),
    });
  }

  const aggregated = aggregateReputation(evidence);

  const summary: ReputationSummary = {
    ip,
    score: aggregated.score,
    rawScore: aggregated.rawScore,
    level: aggregated.level,
    headline: aggregated.headline,
    evidence: aggregated.evidence,
    contributions: aggregated.contributions,
    threatCategories: aggregated.threatCategories,
    mailCategories: aggregated.mailCategories,
    contextCategories: aggregated.contextCategories,
    networkContext,
    sources,
    coverage: {
      checkedCount: checkedSources.length,
      matchedCount: sources.filter((source) => source.status === "matched").length,
      policyCount: sources.filter(
        (source) => source.status === "policy_listed" || source.status === "available",
      ).length,
      cleanCount: sources.filter((source) => source.status === "clean").length,
      unavailableCount: sources.filter((source) => UNAVAILABLE_STATUSES.has(source.status)).length,
      skippedCount: sources.filter((source) => SKIPPED_STATUSES.has(source.status)).length,
    },
    geo,
    network,
    checkedAt: new Date().toISOString(),
  };

  responseCache.set(cacheKey, { storedAt: Date.now(), summary });
  while (responseCache.size > RESPONSE_CACHE_MAX_ENTRIES) {
    const oldest = responseCache.keys().next().value;
    if (oldest === undefined) break;
    responseCache.delete(oldest);
  }

  return apiOk(summary);
}
