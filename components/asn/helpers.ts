import { ApiClientError } from "@/lib/api/client";
import { AsnValidationError, MAX_ASN_NUMBER } from "@/lib/asn-id";
import type {
  AsnWarningDetail,
  SourceCacheStatus,
  SourceStatus,
} from "@/lib/asn";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getApiErrorMessage, type ToolTranslation } from "@/lib/tool-i18n";
import { getUiCopy } from "@/lib/ui-copy";

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

export function formatSpeed(
  speed: number | null | undefined,
  t: ToolTranslation,
  locale: Locale,
) {
  if (!speed) return "-";
  if (speed >= 1_000_000) {
    return `${(speed / 1_000_000).toFixed(0)} Tbps`;
  }
  if (speed >= 1_000) {
    return `${formatNumber(Math.round(speed / 1000), locale)} Gbps`;
  }
  return `${speed} ${t.asnSpeedMbps}`;
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
  }
}
