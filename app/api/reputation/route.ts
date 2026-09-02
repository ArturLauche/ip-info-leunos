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
  calculateReputationScore,
  type EvidenceCategory,
  type EvidenceItem,
  type NetworkContext,
  type NetworkContextType,
  type ProviderSourceResult,
  type ReputationSummary,
  type BlacklistStatus,
  type ThreatCategory,
} from "@/lib/reputation";
import {
  checkSpamhausZen,
  checkSpamCop,
  checkBarracuda,
  checkDroneBl,
  checkBlocklistDe,
  checkFeodoTracker,
  checkSpamhausDrop,
  checkGreyNoise,
  checkAbuseIpDb,
  checkThreatFox,
  checkProjectHoneyPot,
} from "@/lib/reputation-providers";
import { detectConnectionType, type ConnectionType } from "@/lib/connection-type";

export const runtime = "nodejs";

const reputationQuerySchema = z.object({
  ip: z.string().trim().min(1).max(64),
});

function resolveNetworkContextType(
  connectionType: ConnectionType,
  signals: { hosting: boolean; mobile: boolean; proxy: boolean; tor: boolean },
): {
  type: NetworkContextType;
  isResidential: boolean;
  isHosting: boolean;
  isMobile: boolean;
  isProxy: boolean;
  isVpn: boolean;
  isTor: boolean;
} {
  const isTor = signals.tor || connectionType === "tor";
  const isVpn = connectionType === "vpn";
  const isProxy = signals.proxy || connectionType === "proxy" || isVpn || isTor;
  const isHosting = signals.hosting || connectionType === "datacenter";
  const isMobile = signals.mobile || connectionType === "mobile";

  const isResidential =
    !isHosting &&
    !isProxy &&
    !isTor &&
    !isMobile &&
    [
      "fiber",
      "cable",
      "dsl",
      "fixed",
      "fixed_wireless",
      "starlink",
      "satellite",
    ].includes(connectionType);

  let type: NetworkContextType = "unknown";
  if (isTor) type = "tor";
  else if (isVpn) type = "vpn";
  else if (isProxy) type = "proxy";
  else if (isHosting) type = "hosting";
  else if (isMobile) type = "mobile";
  else if (connectionType === "business") type = "business";
  else if (isResidential || connectionType === "fixed") type = "residential";

  return {
    type,
    isResidential,
    isHosting,
    isMobile,
    isProxy,
    isVpn,
    isTor,
  };
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

  const family: "IPv4" | "IPv6" = isIPv4Address(ip) ? "IPv4" : "IPv6";

  // Concurrently query metadata and all 11 security feeds/providers
  const [
    ipApiResult,
    spamhausZenResult,
    spamCopResult,
    barracudaResult,
    droneBlResult,
    blocklistDeResult,
    feodoResult,
    dropResult,
    greyNoiseResult,
    abuseIpDbResult,
    threatFoxResult,
    honeyPotResult,
  ] = await Promise.allSettled([
    lookupIpApi(ip, { timeoutMs: 4000 }),
    checkSpamhausZen(ip, family),
    checkSpamCop(ip, family),
    checkBarracuda(ip, family),
    checkDroneBl(ip, family),
    checkBlocklistDe(ip, family),
    checkFeodoTracker(ip, family),
    checkSpamhausDrop(ip, family),
    checkGreyNoise(ip, family),
    checkAbuseIpDb(ip, family),
    checkThreatFox(ip, family),
    checkProjectHoneyPot(ip, family),
  ]);

  const ipApi = ipApiResult.status === "fulfilled" ? ipApiResult.value : null;

  // Extract source results safely
  const sources: ProviderSourceResult[] = [
    spamhausZenResult.status === "fulfilled"
      ? spamhausZenResult.value
      : {
          id: "spamhaus-zen",
          name: "Spamhaus ZEN",
          type: "dnsbl",
          status: "unavailable",
          supportsIpv6: true,
          statusMessage: "Query failed or timed out.",
          evidence: [],
        },
    spamCopResult.status === "fulfilled"
      ? spamCopResult.value
      : {
          id: "spamcop",
          name: "SpamCop",
          type: "dnsbl",
          status: "unavailable",
          supportsIpv6: false,
          statusMessage: "Query failed or timed out.",
          evidence: [],
        },
    barracudaResult.status === "fulfilled"
      ? barracudaResult.value
      : {
          id: "barracuda",
          name: "Barracuda BRBL",
          type: "dnsbl",
          status: "unavailable",
          supportsIpv6: false,
          statusMessage: "Query failed or timed out.",
          evidence: [],
        },
    droneBlResult.status === "fulfilled"
      ? droneBlResult.value
      : {
          id: "dronebl",
          name: "DroneBL",
          type: "dnsbl",
          status: "unavailable",
          supportsIpv6: true,
          statusMessage: "Query failed or timed out.",
          evidence: [],
        },
    blocklistDeResult.status === "fulfilled"
      ? blocklistDeResult.value
      : {
          id: "blocklist-de",
          name: "blocklist.de",
          type: "dnsbl",
          status: "unavailable",
          supportsIpv6: false,
          statusMessage: "Query failed or timed out.",
          evidence: [],
        },
    feodoResult.status === "fulfilled"
      ? feodoResult.value
      : {
          id: "feodo-tracker",
          name: "Feodo Tracker (abuse.ch)",
          type: "threat_feed",
          status: "unavailable",
          supportsIpv6: false,
          statusMessage: "Query failed or timed out.",
          evidence: [],
        },
    dropResult.status === "fulfilled"
      ? dropResult.value
      : {
          id: "spamhaus-drop",
          name: "Spamhaus DROP",
          type: "threat_feed",
          status: "unavailable",
          supportsIpv6: true,
          statusMessage: "Query failed or timed out.",
          evidence: [],
        },
    greyNoiseResult.status === "fulfilled"
      ? greyNoiseResult.value
      : {
          id: "greynoise",
          name: "GreyNoise Community",
          type: "scanner_intel",
          status: "unavailable",
          supportsIpv6: true,
          statusMessage: "Query failed or timed out.",
          evidence: [],
        },
    abuseIpDbResult.status === "fulfilled"
      ? abuseIpDbResult.value
      : {
          id: "abuseipdb",
          name: "AbuseIPDB",
          type: "abuse_database",
          status: "unavailable",
          supportsIpv6: true,
          statusMessage: "Query failed or timed out.",
          evidence: [],
        },
    threatFoxResult.status === "fulfilled"
      ? threatFoxResult.value
      : {
          id: "threatfox",
          name: "ThreatFox (abuse.ch)",
          type: "threat_feed",
          status: "unavailable",
          supportsIpv6: true,
          statusMessage: "Query failed or timed out.",
          evidence: [],
        },
    honeyPotResult.status === "fulfilled"
      ? honeyPotResult.value
      : {
          id: "project-honeypot",
          name: "Project Honey Pot",
          type: "dnsbl",
          status: "unavailable",
          supportsIpv6: false,
          statusMessage: "Query failed or timed out.",
          evidence: [],
        },
  ];

  // Aggregate all evidence items
  const allEvidence: EvidenceItem[] = [];
  for (const src of sources) {
    for (const item of src.evidence) {
      allEvidence.push(item);
    }
  }

  // Network context detection
  const rawAbuse =
    abuseIpDbResult.status === "fulfilled" && "rawAbuse" in abuseIpDbResult.value
      ? (abuseIpDbResult.value.rawAbuse as { isTor?: boolean } | undefined)
      : undefined;

  const isTor = Boolean(rawAbuse?.isTor);
  const connType = detectConnectionType({
    isp: ipApi?.isp || "",
    org: ipApi?.org || "",
    as: ipApi?.as || "",
    mobile: Boolean(ipApi?.mobile),
    hosting: Boolean(ipApi?.hosting),
    proxy: Boolean(ipApi?.proxy),
    proxyType: isTor ? "tor" : undefined,
  });

  const contextSignals = resolveNetworkContextType(connType, {
    hosting: Boolean(ipApi?.hosting),
    mobile: Boolean(ipApi?.mobile),
    proxy: Boolean(ipApi?.proxy),
    tor: isTor,
  });

  const networkContext: NetworkContext = {
    ...contextSignals,
    isp: ipApi?.isp || "",
    org: ipApi?.org || "",
    as: ipApi?.as || "",
    asname: ipApi?.asname || "",
  };

  // Deterministic scoring & verdict calculation
  const { score, level, verdictTitle, verdictDescription } = calculateReputationScore(
    allEvidence,
    sources,
    networkContext,
  );

  // Collect distinct evidence categories
  const evidenceCategories: EvidenceCategory[] = [
    ...new Set(allEvidence.map((e) => e.category)),
  ];

  // Coverage report
  const checkedSources = sources.filter(
    (s) => s.status !== "not_configured" && s.status !== "unsupported",
  );
  const threatCount = sources.filter((s) => s.status === "matched").length;
  const policyCount = sources.filter((s) => s.status === "policy_listed").length;
  const cleanCount = sources.filter((s) => s.status === "clean").length;
  const unavailableCount = sources.filter(
    (s) =>
      s.status === "unavailable" ||
      s.status === "rate_limited" ||
      s.status === "resolver_blocked",
  ).length;

  // Backward-compatibility adapters
  const legacyBlacklists: BlacklistStatus[] = sources
    .filter((s) => s.type === "dnsbl")
    .map((s) => {
      const isPolicy = s.status === "policy_listed";
      return {
        id: s.id,
        name: s.name,
        listed: s.status === "matched" || isPolicy,
        checked: s.status === "clean" || s.status === "matched" || isPolicy,
        categories: isPolicy
          ? (["mail_policy"] as ThreatCategory[])
          : (s.evidence.map((e) => e.category) as ThreatCategory[]),
        status: s.status,
        rawCodes: s.rawCodes,
        statusMessage: s.statusMessage,
      };
    });

  const abuseSource = sources.find((s) => s.id === "abuseipdb");
  const abuseConfidence =
    abuseSource?.evidence.find((e) => typeof e.confidence === "number")?.confidence ??
    (abuseSource?.status === "clean" ? 0 : null);
  const abuseReports =
    abuseSource?.evidence.find((e) => typeof e.reportsCount === "number")?.reportsCount ??
    (abuseSource?.status === "clean" ? 0 : null);

  const payload: ReputationSummary = {
    ip,
    score,
    level,
    verdictTitle,
    verdictDescription,
    evidenceCategories,
    networkContext,
    geo: ipApi
      ? {
          country: ipApi.country || "",
          countryCode: ipApi.countryCode || "",
          region: ipApi.regionName || "",
          city: ipApi.city || "",
        }
      : null,
    evidence: allEvidence,
    sources,
    coverage: {
      totalSources: sources.length,
      checkedCount: checkedSources.length,
      threatCount,
      policyCount,
      cleanCount,
      unavailableCount,
    },
    checkedAt: new Date().toISOString(),

    // Legacy fields
    categories: evidenceCategories as ThreatCategory[],
    blacklists: legacyBlacklists,
    listedCount: threatCount,
    checkedCount: checkedSources.length,
    abuse: {
      status:
        abuseSource?.status === "not_configured"
          ? "not_configured"
          : abuseSource?.status === "unavailable"
            ? "unavailable"
            : "available",
      confidenceScore: abuseConfidence,
      totalReports: abuseReports,
      lastReportedAt:
        abuseSource?.evidence.find((e) => Boolean(e.lastSeen))?.lastSeen ?? null,
    },
    network: ipApi
      ? {
          as: ipApi.as || "",
          asname: ipApi.asname || "",
          isp: ipApi.isp || "",
          org: ipApi.org || "",
        }
      : null,
    flags: {
      proxy: Boolean(ipApi?.proxy),
      hosting: Boolean(ipApi?.hosting),
      mobile: Boolean(ipApi?.mobile),
    },
  };

  return apiOk(payload);
}
