import dns from "node:dns/promises";
import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { lookupIpApi } from "@/lib/providers/ip-api";
import {
  assertPublicIpAddress,
  isIPv4Address,
  stripIpv6Brackets,
  TargetValidationError,
} from "@/lib/network/target";
import {
  aggregateReputation,
  interpretDnsblResponse,
  ipv6ToNibbleFormat,
  REPUTATION_BLACKLISTS,
  reverseIpv4ForDnsbl,
  type AbuseSummary,
  type BlacklistDefinition,
  type BlacklistStatus,
  type ReputationSummary,
} from "@/lib/reputation";

export const runtime = "nodejs";

const SOURCE_TIMEOUT_MS = 4_000;
const DNSBL_TIMEOUT_MS = 2_500;

const reputationQuerySchema = z.object({
  ip: z.string().trim().min(1).max(64),
});

async function queryBlacklist(
  ip: string,
  family: 4 | 6,
  definition: BlacklistDefinition,
): Promise<BlacklistStatus> {
  const base: BlacklistStatus = {
    id: definition.id,
    name: definition.name,
    listed: false,
    checked: false,
    categories: [],
  };

  if (family === 6 && !definition.supportsIpv6) {
    return base;
  }

  const prefix = family === 4 ? reverseIpv4ForDnsbl(ip) : ipv6ToNibbleFormat(ip);
  if (!prefix) {
    return base;
  }

  const resolver = new dns.Resolver({ timeout: DNSBL_TIMEOUT_MS, tries: 1 });

  try {
    const records = await resolver.resolve4(`${prefix}.${definition.zone}`);
    const interpretation = interpretDnsblResponse(definition.zone, records);

    return {
      ...base,
      listed: interpretation.listed,
      checked: !interpretation.blocked,
      categories: interpretation.categories,
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code || "";
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return { ...base, checked: true };
    }
    return base;
  }
}

type IpApiResult = {
  geo: ReputationSummary["geo"];
  network: ReputationSummary["network"];
  proxy: boolean;
  hosting: boolean;
  mobile: boolean;
} | null;

async function lookupIpMetadata(ip: string): Promise<IpApiResult> {
  const data = await lookupIpApi(ip, { timeoutMs: SOURCE_TIMEOUT_MS });
  if (!data) return null;

  return {
    geo: {
      country: data.country || "",
      countryCode: data.countryCode || "",
      region: data.regionName || "",
      city: data.city || "",
    },
    network: {
      as: data.as || "",
      asname: data.asname || "",
      isp: data.isp || "",
      org: data.org || "",
    },
    proxy: Boolean(data.proxy),
    hosting: Boolean(data.hosting),
    mobile: Boolean(data.mobile),
  };
}

const abuseIpDbSchema = z
  .object({
    data: z
      .object({
        abuseConfidenceScore: z.number().optional(),
        totalReports: z.number().optional(),
        lastReportedAt: z.string().nullable().optional(),
        isTor: z.boolean().optional(),
      })
      .passthrough(),
  })
  .passthrough();

async function lookupAbuseIpDb(ip: string): Promise<AbuseSummary & { isTor: boolean }> {
  const key = process.env.ABUSEIPDB_API_KEY;
  if (!key) {
    return {
      status: "not_configured",
      confidenceScore: null,
      totalReports: null,
      lastReportedAt: null,
      isTor: false,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`,
      {
        headers: { Key: key, Accept: "application/json" },
        cache: "no-store",
        signal: controller.signal,
      },
    );

    const parsed = abuseIpDbSchema.safeParse(await response.json());
    if (!response.ok || !parsed.success) {
      return {
        status: "unavailable",
        confidenceScore: null,
        totalReports: null,
        lastReportedAt: null,
        isTor: false,
      };
    }

    const data = parsed.data.data;
    return {
      status: "available",
      confidenceScore: data.abuseConfidenceScore ?? 0,
      totalReports: data.totalReports ?? 0,
      lastReportedAt: data.lastReportedAt || null,
      isTor: Boolean(data.isTor),
    };
  } catch {
    return {
      status: "unavailable",
      confidenceScore: null,
      totalReports: null,
      lastReportedAt: null,
      isTor: false,
    };
  } finally {
    clearTimeout(timer);
  }
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

  const [blacklists, ipApi, abuse] = await Promise.all([
    Promise.all(REPUTATION_BLACKLISTS.map((definition) => queryBlacklist(ip, family, definition))),
    lookupIpMetadata(ip),
    lookupAbuseIpDb(ip),
  ]);

  const { score, level, categories } = aggregateReputation({
    blacklists,
    abuseConfidence: abuse.confidenceScore,
    abuseReports: abuse.totalReports,
    proxy: ipApi?.proxy ?? false,
    hosting: ipApi?.hosting ?? false,
    tor: abuse.isTor,
  });

  const payload: ReputationSummary = {
    ip,
    score,
    level,
    categories,
    blacklists,
    listedCount: blacklists.filter((entry) => entry.listed).length,
    checkedCount: blacklists.filter((entry) => entry.checked).length,
    abuse: {
      status: abuse.status,
      confidenceScore: abuse.confidenceScore,
      totalReports: abuse.totalReports,
      lastReportedAt: abuse.lastReportedAt,
    },
    geo: ipApi?.geo ?? null,
    network: ipApi?.network ?? null,
    flags: {
      proxy: ipApi?.proxy ?? false,
      hosting: ipApi?.hosting ?? false,
      mobile: ipApi?.mobile ?? false,
    },
    checkedAt: new Date().toISOString(),
  };

  return apiOk(payload);
}
