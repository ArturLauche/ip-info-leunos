import { ApiClientError } from "@/lib/api/client";
import { AsnValidationError, MAX_ASN_NUMBER } from "@/lib/asn-id";
import type {
  AsnProfile,
  AsnSource,
  AsnWarningDetail,
  SourceCacheStatus,
  SourceStatus,
} from "@/lib/asn";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getApiErrorMessage, type CountForms, type ToolTranslation } from "@/lib/tool-i18n";
import { getUiCopy } from "@/lib/ui-copy";

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

/** Prefixes and neighbours only come from IPinfo or RIPEstat. */
export function hasRoutingSource(result: AsnProfile) {
  return result.sources.ipinfo === "available" || result.sources.ripestat === "available";
}

/**
 * A total of 0 only means "none" when a routing source answered; otherwise
 * it is unknown (null) and must not be shown as an observed zero.
 */
export function knownTotal(result: AsnProfile, total: number) {
  return hasRoutingSource(result) || total > 0 ? total : null;
}

const pluralRules = new Map<Locale, Intl.PluralRules>();
const speedFormats = new Map<Locale, Intl.NumberFormat>();

function cached<T>(cache: Map<Locale, T>, locale: Locale, create: () => T) {
  let value = cache.get(locale);
  if (!value) {
    value = create();
    cache.set(locale, value);
  }
  return value;
}

/**
 * Picks the CLDR plural form the locale actually requires, then fills `{count}`
 * with a locale-formatted number. Categories a catalog omits fall back to
 * `other`, so locales whose grammar needs only one/other keep two strings.
 */
export function formatCount(forms: CountForms, count: number, locale: Locale) {
  const rules = cached(pluralRules, locale, () => new Intl.PluralRules(locale));
  const form = forms[rules.select(count) as keyof CountForms] ?? forms.other;
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

export function formatCacheStatus(
  status: SourceCacheStatus,
  t: ToolTranslation,
) {
  if (status === "fresh") return t.asnCacheFresh;
  if (status === "stale") return t.asnCacheStale;
  if (status === "not_configured") return t.asnCacheNotConfigured;
  return t.asnCacheMiss;
}

export function hasSourceInfoFlag() {
  if (typeof window === "undefined") return false;

  const searchParams = new URLSearchParams(window.location.search);
  return (
    searchParams.has("source-info") ||
    searchParams.has("sourceInfo") ||
    window.location.hash === "#source-info"
  );
}

// PeeringDB reports port speed in Mbps. One fractional digit keeps common
// port sizes exact (2.5 Gbps, 1.2 Tbps) instead of rounding them away.
export function formatSpeed(speed: number | null | undefined, t: ToolTranslation, locale: Locale) {
  if (!speed) return "—";
  const formatter = cached(speedFormats, locale, () => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }));
  const format = (value: number) => formatter.format(value);
  if (speed >= 1_000_000) {
    return `${format(speed / 1_000_000)} ${t.asnSpeedTbps}`;
  }
  if (speed >= 1_000) {
    return `${format(speed / 1_000)} ${t.asnSpeedGbps}`;
  }
  return `${format(speed)} ${t.asnSpeedMbps}`;
}

export function validationErrorMessage(
  error: unknown,
  t: ToolTranslation,
  locale: Locale,
) {
  if (!(error instanceof AsnValidationError)) return t.asnInvalidInput;
  if (error.code === "out_of_range") {
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
    "RIPEstat upstream-side neighbours":
      t.asnWarningLabelRipeStatUpstreamNeighbours,
    "RIPEstat downstream-side neighbours":
      t.asnWarningLabelRipeStatDownstreamNeighbours,
  };

  return labels[label] || t.asnSourceError;
}

export function formatWarning(
  warning: string | AsnWarningDetail,
  t: ToolTranslation,
  locale: Locale,
) {
  // Older cached responses may contain only the legacy string. Never display
  // that prose directly; the API now supplies a stable warning detail code.
  if (typeof warning === "string") return getUiCopy(locale).asnWarningUnknown;

  switch (warning.code) {
    case "ipinfo_unavailable":
      return t.asnWarningIpinfoUnavailable;
    case "ipinfo_unexpected":
      return t.asnWarningIpinfoUnexpected;
    case "ripe_no_data":
      return t.asnWarningNoRipeStatData;
    case "peeringdb_no_profile":
      return t.asnWarningNoPeeringDbProfile;
    case "provider_stale":
      return formatTemplate(t.asnWarningProviderStale, {
        provider: warning.provider ?? "",
      });
    case "provider_http":
      return formatTemplate(t.asnWarningProviderHttp, {
        provider: warning.provider ?? "",
        status: warning.status ?? "",
      });
    case "provider_timeout":
      return formatTemplate(t.asnWarningProviderTimedOut, {
        provider: warning.provider ?? "",
      });
    case "provider_too_large":
      return formatTemplate(t.asnWarningProviderTooLarge, {
        provider: warning.provider ?? "",
      });
    case "provider_invalid_json":
      return formatTemplate(t.asnWarningProviderInvalidJson, {
        provider: warning.provider ?? "",
      });
    case "provider_unavailable":
      return formatTemplate(t.asnWarningProviderUnavailable, {
        provider: warning.provider ?? "",
      });
    case "truncated":
      return formatTemplate(t.asnWarningTruncated, {
        label: warningLabel(warning.label ?? "", t),
        limit: formatNumber(warning.limit ?? 0, locale),
        total: formatNumber(warning.total ?? 0, locale),
      });
    case "unknown":
      return getUiCopy(locale).asnWarningUnknown;
    default:
      // API data is cast at runtime and can drift from this union during a
      // rolling deploy: a new code must still render a localized row instead
      // of leaving an empty diagnostic cell.
      return getUiCopy(locale).asnWarningUnknown;
  }
}
