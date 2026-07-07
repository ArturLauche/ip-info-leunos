import { headers } from "next/headers";
import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { resolveLocale } from "@/lib/i18n";
import {
  assessProxyRisk,
  createEmptyProxyHintAssessment,
  detectConnectionType,
  getNetworkProxyHintSignals,
  summarizeProxyHintSignals,
  type ProxyHintSignal,
} from "@/lib/connection-type";
import { lookupIpApi, type IpApiData } from "@/lib/providers/ip-api";
import {
  assessRequestProxyHints,
  getRequestProxyHintSignals,
} from "@/lib/request-proxy-hints";
import {
  assertPublicIpAddress,
  assertPublicTarget,
  isIPv4Address,
  isIPv6Address,
  TargetValidationError,
} from "@/lib/network/target";

const ipQuerySchema = z.object({
  ip: z.string().trim().min(1).max(253).optional(),
});

type LocalIpCheck = { ip: string; source: string; version: 4 | 6 };

function extractIps(forwardedFor: string | null, realIp: string | null) {
  let ipv4: string | null = null;
  let ipv6: string | null = null;

  const candidates: Array<{ ip: string; source: string }> = [];

  if (forwardedFor) {
    forwardedFor.split(",").forEach((part, index) => {
      const trimmed = part.trim();
      if (trimmed) {
        candidates.push({ ip: trimmed, source: `x-forwarded-for[${index}]` });
      }
    });
  }
  if (realIp) {
    const trimmed = realIp.trim();
    if (trimmed) candidates.push({ ip: trimmed, source: "x-real-ip" });
  }

  const localIpChecks: LocalIpCheck[] = candidates.flatMap((candidate) => {
    const version: 4 | 6 | null = isIPv4Address(candidate.ip)
      ? 4
      : isIPv6Address(candidate.ip)
        ? 6
        : null;
    return version ? [{ ...candidate, version }] : [];
  });

  for (const candidate of localIpChecks) {
    if (!ipv4 && candidate.version === 4) ipv4 = candidate.ip;
    if (!ipv6 && candidate.version === 6) ipv6 = candidate.ip;
    if (ipv4 && ipv6) break;
  }

  return { ipv4, ipv6, localIpChecks };
}

/**
 * Locale-neutral empty result. Unknown string fields stay empty; the UI
 * renders its own translated "unknown" placeholder.
 */
function getUnknownResult() {
  return {
    country: "",
    countryCode: "",
    region: "",
    regionName: "",
    city: "",
    zip: "",
    lat: 0,
    lon: 0,
    timezone: "",
    isp: "",
    org: "",
    as: "",
    asname: "",
    reverse: "",
    mobile: false,
    proxy: false,
    proxyType: "unknown",
    proxyConfidence: "none",
    proxyReasons: [] as string[],
    hosting: false,
    connectionType: "unknown",
    proxyHints: createEmptyProxyHintAssessment(),
  };
}

function toResponsePayload(
  source: IpApiData,
  ip: string,
  ipv4: string | null,
  ipv6: string | null,
  localIpChecks: LocalIpCheck[] = [],
  options: {
    includeProxyHints?: boolean;
    extraProxyHintSignals?: ProxyHintSignal[];
  } = {},
) {
  const proxyAssessment = assessProxyRisk({
    isp: source.isp || "",
    org: source.org || "",
    as: source.as || "",
    reverse: source.reverse,
    proxy: Boolean(source.proxy),
    hosting: Boolean(source.hosting),
    mobile: Boolean(source.mobile),
  });

  const resolvedQuery = source.query || ip;
  const responseIpv4 = isIPv4Address(resolvedQuery) ? resolvedQuery : ipv4;
  const responseIpv6 = isIPv6Address(resolvedQuery) ? resolvedQuery : ipv6;
  const proxyHints =
    options.includeProxyHints === false
      ? createEmptyProxyHintAssessment()
      : summarizeProxyHintSignals([
          ...getNetworkProxyHintSignals({
            isp: source.isp || "",
            org: source.org || "",
            as: source.as || "",
            asname: source.asname || "",
            reverse: source.reverse || "",
          }),
          ...(options.extraProxyHintSignals ?? []),
        ]);

  return {
    ipv4: responseIpv4,
    ipv6: responseIpv6,
    ipVersion: responseIpv6 && !responseIpv4 ? 6 : 4,
    ipSources: {
      ipv4: responseIpv4
        ? isIPv4Address(resolvedQuery)
          ? "ip-api-query"
          : localIpChecks.find((check) => check.ip === responseIpv4)?.source || "request-header"
        : undefined,
      ipv6: responseIpv6
        ? isIPv6Address(resolvedQuery)
          ? "ip-api-query"
          : localIpChecks.find((check) => check.ip === responseIpv6)?.source || "request-header"
        : undefined,
    },
    localIpChecks,
    country: source.country || "",
    countryCode: source.countryCode || "",
    region: source.region || "",
    regionName: source.regionName || "",
    city: source.city || "",
    zip: source.zip || "",
    lat: source.lat ?? 0,
    lon: source.lon ?? 0,
    timezone: source.timezone || "",
    isp: source.isp || "",
    org: source.org || "",
    as: source.as || "",
    asname: source.asname || "",
    reverse: source.reverse || "",
    mobile: Boolean(source.mobile),
    proxy: proxyAssessment.isProxy,
    proxyType: proxyAssessment.proxyType,
    proxyConfidence: proxyAssessment.confidence,
    proxyReasons: proxyAssessment.reasons,
    hosting: Boolean(source.hosting),
    connectionType: detectConnectionType({
      isp: source.isp || "",
      org: source.org || "",
      as: source.as || "",
      mobile: Boolean(source.mobile),
      proxy: proxyAssessment.isProxy,
      hosting: Boolean(source.hosting),
      proxyType: proxyAssessment.proxyType,
    }),
    proxyHints,
  };
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "ip", { limit: 80, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const parsedQuery = ipQuerySchema.safeParse({
    ip: searchParams.get("ip") || undefined,
  });

  if (!parsedQuery.success) {
    return apiValidationError(parsedQuery.error);
  }

  const queryIp = parsedQuery.data.ip;
  // ip-api.com localizes country/region/city names for the supported locales.
  const language = resolveLocale(request.headers.get("accept-language"));

  // If a specific IP was passed (from /check), just look it up
  if (queryIp) {
    let ip: string;

    try {
      const target = await assertPublicTarget(queryIp);
      ip = target.hostname;
    } catch (error) {
      if (error instanceof TargetValidationError) {
        return apiError(error.code, error.message, error.status, error.details);
      }

      return apiError("invalid_target", "Please provide a valid public IP address or domain.", 400);
    }

    const data = await lookupIpApi(ip, { language });

    if (!data) {
      return apiOk({
        ipv4: isIPv4Address(ip) ? ip : null,
        ipv6: isIPv6Address(ip) ? ip : null,
        ipVersion: isIPv6Address(ip) ? 6 : 4,
        ipSources: {
          ipv4: isIPv4Address(ip) ? "query-target" : undefined,
          ipv6: isIPv6Address(ip) ? "query-target" : undefined,
        },
        localIpChecks: [],
        ...getUnknownResult(),
      });
    }

    return apiOk(
      toResponsePayload(
        data,
        ip,
        isIPv4Address(ip) ? ip : null,
        isIPv6Address(ip) ? ip : null,
        [],
        { includeProxyHints: false },
      ),
    );
  }

  // Auto-detect from request headers
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const requestProxyHintSignals = getRequestProxyHintSignals(headersList);
  const requestProxyHints = assessRequestProxyHints(headersList);

  const { ipv4, ipv6, localIpChecks } = extractIps(forwardedFor, realIp);

  // Use whichever IP we found (prefer IPv4 for geolocation, it tends to be more accurate)
  const primaryIp = ipv4 || ipv6 || "";
  let data: IpApiData | null = null;

  if (primaryIp) {
    try {
      assertPublicIpAddress(primaryIp);
      data = await lookupIpApi(primaryIp, { language });
    } catch {
      data = null;
    }
  }

  if (!data) {
    return apiOk({
      ipv4,
      ipv6,
      ipVersion: ipv6 && !ipv4 ? 6 : 4,
      ipSources: {
        ipv4: ipv4
          ? localIpChecks.find((check) => check.ip === ipv4)?.source || "request-header"
          : undefined,
        ipv6: ipv6
          ? localIpChecks.find((check) => check.ip === ipv6)?.source || "request-header"
          : undefined,
      },
      localIpChecks,
      ...getUnknownResult(),
      proxyHints: requestProxyHints,
    });
  }

  return apiOk(
    toResponsePayload(data, primaryIp, ipv4, ipv6, localIpChecks, {
      extraProxyHintSignals: requestProxyHintSignals,
    }),
  );
}
