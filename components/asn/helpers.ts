import { ApiClientError } from "@/lib/api/client";
import { AsnValidationError, MAX_ASN_NUMBER } from "@/lib/asn";
import type { SourceCacheStatus, SourceStatus } from "@/lib/asn";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getApiErrorMessage, type ToolTranslation } from "@/lib/tool-i18n";

export function formatStatus(status: SourceStatus, t: ToolTranslation) {
  if (status === "available") return t.asnSourceAvailable;
  if (status === "unavailable") return t.asnSourceUnavailable;
  if (status === "not_configured") return t.asnSourceNotConfigured;
  return t.asnSourceError;
}

export function sourceBadgeClass(status: SourceStatus) {
  if (status === "available") return "border-success/40 bg-success/10 text-success";
  if (status === "not_configured") return "border-info/40 bg-info/10 text-info";
  if (status === "unavailable") return "border-warning/40 bg-warning/10 text-warning";
  return "border-destructive/40 bg-destructive/10 text-destructive";
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

export function formatSpeed(speed: number | null | undefined, t: ToolTranslation) {
  if (!speed) return "-";
  if (speed >= 1_000_000) {
    return `${(speed / 1_000_000).toFixed(0)} Tbps`;
  }
  if (speed >= 1_000) {
    return `${(speed / 1_000).toLocaleString()} Gbps`;
  }
  return `${speed} ${t.asnSpeedMbps}`;
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
