import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { parseLocaleCookie, resolveLocale } from "@/lib/i18n";
import {
  assessConnectionType,
  assessNetworkProxyHints,
  assessProxyRisk,
  mergeProxyHintAssessments,
  type ProxyHintAssessment,
} from "@/lib/connection-type";
import { assessRequestProxyHints } from "@/lib/request-proxy-hints";
import type { IpApiData } from "@/lib/providers/ip-api";
import { lookupIpApiCached } from "@/lib/ip-lookup-cache";
import { extractVisitorIps, type VisitorIpCheck } from "@/lib/visitor-ip";
import {
  assertPublicTarget,
  isIPv4Address,
  isIPv6Address,
  TargetValidationError,
} from "@/lib/network/target";

export const runtime = "nodejs";

// Upstream answers are memoized per address and effective language by
// lib/ip-lookup-cache.ts (quota protection). The response header stays
// no-store; per-request data (forwarding headers, proxy hints) is computed
// fresh for every request and never cached.

const ipQuerySchema = z.object({
  ip: z.string().trim().min(1).max(253).optional(),
});

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
    connectionTypeConfidence: "none",
    connectionTypeEvidence: [] as string[],
  };
}

function toResponsePayload(
  source: IpApiData,
  ip: string,
  ipv4: string | null,
  ipv6: string | null,
  localIpChecks: VisitorIpCheck[] = [],
  requestProxyHints?: ProxyHintAssessment,
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

  const connection = assessConnectionType({
    isp: source.isp || "",
    org: source.org || "",
    as: source.as || "",
    asname: source.asname || "",
    reverse: source.reverse || "",
    mobile: Boolean(source.mobile),
    proxy: proxyAssessment.isProxy,
    hosting: Boolean(source.hosting),
    proxyType: proxyAssessment.proxyType,
  });

  const resolvedQuery = source.query || ip;
  const responseIpv4 = isIPv4Address(resolvedQuery) ? resolvedQuery : ipv4;
  const responseIpv6 = isIPv6Address(resolvedQuery) ? resolvedQuery : ipv6;
  const proxyHints = requestProxyHints
    ? mergeProxyHintAssessments(
        requestProxyHints,
        assessNetworkProxyHints({
          isp: source.isp || "",
          org: source.org || "",
          as: source.as || "",
          asname: source.asname || "",
          reverse: source.reverse || "",
        }),
      )
    : undefined;

  return {
    ipv4: responseIpv4,
    ipv6: responseIpv6,
    ipVersion: responseIpv6 && !responseIpv4 ? 6 : 4,
    ipSources: {
      ipv4: responseIpv4
        ? isIPv4Address(resolvedQuery)
          ? "ip-api-query"
          : localIpChecks.find((check) => check.ip === responseIpv4)?.source ||
            "request-header"
        : undefined,
      ipv6: responseIpv6
        ? isIPv6Address(resolvedQuery)
          ? "ip-api-query"
          : localIpChecks.find((check) => check.ip === responseIpv6)?.source ||
            "request-header"
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
    connectionType: connection.connectionType,
    connectionTypeConfidence: connection.confidence,
    connectionTypeEvidence: connection.evidence,
    ...(proxyHints ? { proxyHints } : {}),
  };
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "ip", {
    limit: 80,
    windowMs: 60_000,
  });
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
  const language = resolveLocale(
    request.headers.get("accept-language"),
    parseLocaleCookie(request.headers.get("cookie")),
  );

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

      return apiError(
        "invalid_target",
        "Please provide a valid public IP address or domain.",
        400,
      );
    }

    const data = await lookupIpApiCached(ip, language);

    if (!data) {
      // Upstream failure: never memoized, so the next request retries live.
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
      ),
    );
  }

  // Auto-detect from request headers. Vercel's forwarding headers are normal
  // client identity inputs; only additional or inconsistent signals affect hints.
  const requestProxyHints = assessRequestProxyHints(request.headers);
  const { ipv4, ipv6, localIpChecks } = extractVisitorIps(request.headers);

  // Use whichever IP we found (prefer IPv4 for geolocation, it tends to be more accurate)
  const primaryIp = ipv4 || ipv6 || "";
  let data: IpApiData | null = null;

  if (primaryIp) {
    // extractVisitorIps only returns public addresses, so the visitor's own
    // lookup can share the per-address memo with explicit lookups.
    data = await lookupIpApiCached(primaryIp, language).catch(() => null);
  }

  if (!data) {
    return apiOk({
      ipv4,
      ipv6,
      ipVersion: ipv6 && !ipv4 ? 6 : 4,
      ipSources: {
        ipv4: ipv4
          ? localIpChecks.find((check) => check.ip === ipv4)?.source ||
            "request-header"
          : undefined,
        ipv6: ipv6
          ? localIpChecks.find((check) => check.ip === ipv6)?.source ||
            "request-header"
          : undefined,
      },
      localIpChecks,
      ...getUnknownResult(),
      proxyHints: requestProxyHints,
    });
  }

  return apiOk(
    toResponsePayload(
      data,
      primaryIp,
      ipv4,
      ipv6,
      localIpChecks,
      requestProxyHints,
    ),
  );
}
