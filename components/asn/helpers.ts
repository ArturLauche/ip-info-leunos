import { ApiClientError } from "@/lib/api/client";
import { AsnValidationError, MAX_ASN_NUMBER } from "@/lib/asn-id";
import type { AsnProfile, AsnSource, SourceCacheStatus, SourceStatus } from "@/lib/asn";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getApiErrorMessage, type ToolTranslation } from "@/lib/tool-i18n";

/** Collapsed list length shared by every ASN list and table. */
export const ASN_ROW_LIMIT = 10;

const SOURCE_NAMES: Record<AsnSource, string> = {
  ipinfo: "IPinfo",
  peeringdb: "PeeringDB",
  ripestat: "RIPEstat",
};

/** Provider display order: identity first, then routing, then interconnection. */
export const SOURCE_ORDER: AsnSource[] = ["ipinfo", "ripestat", "peeringdb"];

export function sourceName(source: string) {
  return SOURCE_NAMES[source as AsnSource] ?? source;
}

export function isCompleteProfile(result: AsnProfile) {
  return (
    result.sources.ipinfo === "available" &&
    result.sources.peeringdb === "available" &&
    result.sources.ripestat === "available" &&
    result.warnings.length === 0
  );
}

export function routingTotal(result: AsnProfile) {
  return (result.peersTotal || 0) + (result.upstreamsTotal || 0) + (result.downstreamsTotal || 0);
}

export function prefixTotal(result: AsnProfile) {
  return (result.prefixes4Total || 0) + (result.prefixes6Total || 0);
}

/** Picks the CLDR plural form, then fills `{count}` with a locale-formatted number. */
export function formatCount(forms: Record<"one" | "other", string>, count: number, locale: Locale) {
  const form = new Intl.PluralRules(locale).select(count) === "one" ? forms.one : forms.other;
  return formatTemplate(form, { count: formatNumber(count, locale) });
}

const regionNames = new Map<Locale, Intl.DisplayNames | null>();

/** Localized country name for an ISO 3166-1 alpha-2 code, falling back to the code. */
export function countryName(code: string, locale: Locale) {
  const upper = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return code;

  if (!regionNames.has(locale)) {
    try {
      regionNames.set(locale, new Intl.DisplayNames([locale], { type: "region" }));
    } catch {
      regionNames.set(locale, null);
    }
  }

  try {
    return regionNames.get(locale)?.of(upper) || upper;
  } catch {
    return upper;
  }
}

const REGISTRY_NAMES: Record<string, string> = {
  afrinic: "AFRINIC",
  apnic: "APNIC",
  arin: "ARIN",
  lacnic: "LACNIC",
  ripe: "RIPE NCC",
  "ripe ncc": "RIPE NCC",
};

export function registryName(registry: string) {
  const key = registry.trim().toLowerCase();
  return REGISTRY_NAMES[key] ?? registry.trim().toUpperCase();
}

// IPinfo reports lowercase categories ("isp", "hosting"); unknown values
// fall back to sentence case so the facts row still reads naturally.
export function networkTypeName(type: string, t: ToolTranslation) {
  const key = type.trim().toLowerCase();
  const known = t.asnNetworkTypes[key];
  if (known) return known;
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * RIR holder strings often read "HANDLE - Organisation" (e.g.
 * "CLOUDFLARENET - Cloudflare, Inc."). Splitting them lets the organisation
 * lead while the registry handle stays available as quieter mono metadata.
 */
export function splitHolderName(name: string): { handle: string; organisation: string } {
  const match = name.trim().match(/^([A-Z0-9][A-Z0-9._-]+)\s+-\s+(.+)$/);
  if (!match) return { handle: "", organisation: name.trim() };
  return { handle: match[1], organisation: match[2].trim() };
}

/** PeeringDB netixlan names read "Exchange: LAN"; split them into two lines. */
export function splitIxName(name: string): { exchange: string; lan: string } {
  const index = name.indexOf(": ");
  if (index <= 0) return { exchange: name, lan: "" };
  const exchange = name.slice(0, index).trim();
  const lan = name.slice(index + 2).trim();
  return { exchange, lan: lan === exchange ? "" : lan };
}

export function peeringDbUrl(kind: "net" | "ix" | "fac", id: number | null | undefined) {
  if (typeof id !== "number" || !Number.isFinite(id) || id <= 0) return null;
  return `https://www.peeringdb.com/${kind}/${id}`;
}

/** Prefix length of a single block holding the same number of IPv4 addresses. */
export function ipv4EquivalentBits(numIps: number | null) {
  if (typeof numIps !== "number" || !Number.isFinite(numIps) || numIps <= 0) return null;
  return Math.min(32, Math.max(0, Math.round(32 - Math.log2(numIps))));
}

/** Share of the strongest value, floored so small non-zero values stay visible. */
export function relativeShare(value: number | null | undefined, max: number, floor = 4) {
  if (!value || max <= 0) return 0;
  return Math.min(100, Math.max(floor, (value / max) * 100));
}

export function formatStatus(status: SourceStatus, t: ToolTranslation) {
  if (status === "available") return t.asnSourceAvailable;
  if (status === "unavailable") return t.asnSourceUnavailable;
  if (status === "not_configured") return t.asnSourceNotConfigured;
  return t.asnSourceError;
}

export function formatCacheStatus(status: SourceCacheStatus, t: ToolTranslation) {
  if (status === "fresh") return t.asnCacheFresh;
  if (status === "stale") return t.asnCacheStale;
  if (status === "not_configured") return t.asnCacheNotConfigured;
  return t.asnCacheMiss;
}

export function hasSourceInfoFlag() {
  if (typeof window === "undefined") return false;

  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.has("source-info") || searchParams.has("sourceInfo") || window.location.hash === "#source-info";
}

// PeeringDB reports port speed in Mbps. One fractional digit keeps common
// port sizes exact (2.5 Gbps, 1.2 Tbps) instead of rounding them away.
export function formatSpeed(speed: number | null | undefined, t: ToolTranslation, locale: Locale) {
  if (!speed) return "—";
  const format = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  if (speed >= 1_000_000) {
    return `${format(speed / 1_000_000)} ${t.asnSpeedTbps}`;
  }
  if (speed >= 1_000) {
    return `${format(speed / 1_000)} ${t.asnSpeedGbps}`;
  }
  return `${format(speed)} ${t.asnSpeedMbps}`;
}

export function validationErrorMessage(error: unknown, t: ToolTranslation, locale: Locale) {
  if (!(error instanceof AsnValidationError)) return t.asnInvalidInput;
  if (error.message.includes("between")) {
    return formatTemplate(t.asnInvalidRange, {
      max: formatNumber(MAX_ASN_NUMBER, locale),
    });
  }

  return t.asnInvalidInput;
}

export function lookupErrorMessage(error: unknown, t: ToolTranslation) {
  if (error instanceof ApiClientError) {
    if (error.code === "bad_request") return t.asnInvalidInput;
    if (error.code === "rate_limited") return t.asnRateLimitError;
    if (error.code === "upstream_error") return t.asnUpstreamError;
  }

  return getApiErrorMessage(error, t, t.asnNetworkError);
}

function warningLabel(label: string, t: ToolTranslation) {
  const labels: Record<string, string> = {
    "IPinfo IPv4 prefixes": t.asnWarningLabelIpinfoIpv4Prefixes,
    "IPinfo IPv6 prefixes": t.asnWarningLabelIpinfoIpv6Prefixes,
    "IPinfo peers": t.asnWarningLabelIpinfoPeers,
    "IPinfo upstreams": t.asnWarningLabelIpinfoUpstreams,
    "IPinfo downstreams": t.asnWarningLabelIpinfoDownstreams,
    "PeeringDB IX LAN records": t.asnWarningLabelPeeringDbIxLan,
    "PeeringDB facilities": t.asnWarningLabelPeeringDbFacilities,
    "RIPEstat IPv4 prefixes": t.asnWarningLabelRipeStatIpv4Prefixes,
    "RIPEstat IPv6 prefixes": t.asnWarningLabelRipeStatIpv6Prefixes,
    "RIPEstat routing neighbours": t.asnWarningLabelRipeStatRoutingNeighbours,
    "RIPEstat upstream-side neighbours": t.asnWarningLabelRipeStatUpstreamNeighbours,
    "RIPEstat downstream-side neighbours": t.asnWarningLabelRipeStatDownstreamNeighbours,
  };

  return labels[label] || label;
}

export function formatWarning(warning: string, t: ToolTranslation, locale: Locale) {
  if (warning === "IPinfo ASN data is unavailable for this ASN or token plan.") {
    return t.asnWarningIpinfoUnavailable;
  }
  if (warning === "IPinfo returned an unexpected ASN payload.") {
    return t.asnWarningIpinfoUnexpected;
  }
  if (warning === "No RIPEstat ASN data was found for this ASN.") {
    return t.asnWarningNoRipeStatData;
  }
  if (warning === "No public PeeringDB network profile was found for this ASN.") {
    return t.asnWarningNoPeeringDbProfile;
  }

  const staleMatch = warning.match(/^(.+) data is currently unavailable; using stale cached data\.$/);
  if (staleMatch) {
    return formatTemplate(t.asnWarningProviderStale, { provider: staleMatch[1] });
  }

  const httpMatch = warning.match(/^(.+) returned HTTP ([0-9]+)\.$/);
  if (httpMatch) {
    return formatTemplate(t.asnWarningProviderHttp, {
      provider: httpMatch[1],
      status: httpMatch[2],
    });
  }

  const timeoutMatch = warning.match(/^(.+) request timed out\.$/);
  if (timeoutMatch) {
    return formatTemplate(t.asnWarningProviderTimedOut, { provider: timeoutMatch[1] });
  }

  const tooLargeMatch = warning.match(/^(.+) response exceeded the size limit\.$/);
  if (tooLargeMatch) {
    return formatTemplate(t.asnWarningProviderTooLarge, { provider: tooLargeMatch[1] });
  }

  const invalidJsonMatch = warning.match(/^(.+) returned invalid JSON\.$/);
  if (invalidJsonMatch) {
    return formatTemplate(t.asnWarningProviderInvalidJson, { provider: invalidJsonMatch[1] });
  }

  const unavailableMatch = warning.match(/^(.+) data is currently unavailable\.$/);
  if (unavailableMatch) {
    return formatTemplate(t.asnWarningProviderUnavailable, { provider: unavailableMatch[1] });
  }

  const truncatedMatch = warning.match(/^(.+) truncated to ([0-9]+) of ([0-9]+) records\.$/);
  if (truncatedMatch) {
    return formatTemplate(t.asnWarningTruncated, {
      label: warningLabel(truncatedMatch[1], t),
      limit: formatNumber(Number(truncatedMatch[2]), locale),
      total: formatNumber(Number(truncatedMatch[3]), locale),
    });
  }

  return warning;
}
