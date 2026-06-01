"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Binary,
  Building2,
  CircleCheck,
  ExternalLink,
  Globe,
  Hash,
  Network,
  Route,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { unwrapApiResponse } from "@/lib/api/client";
import {
  AsnValidationError,
  MAX_ASN_NUMBER,
  normalizeAsnInput,
  type AsnPrefix,
  type AsnProfile,
  type AsnRelation,
  type PeeringDbFacility,
  type PeeringDbIxLan,
  type SourceCacheStatus,
  type SourceStatus,
} from "@/lib/asn";
import { getToolTranslation } from "@/lib/tool-i18n";
import type { Locale } from "@/lib/i18n";

interface AsnCheckerProps {
  locale: Locale;
  initialAsn?: string;
}

type ToolT = ReturnType<typeof getToolTranslation>;

interface Metric {
  label: string;
  value: string;
  detail: string;
}

function formatStatus(status: SourceStatus, t: ToolT) {
  if (status === "available") return t.asnSourceAvailable;
  if (status === "unavailable") return t.asnSourceUnavailable;
  if (status === "not_configured") return t.asnSourceNotConfigured;
  return t.asnSourceError;
}

function sourceBadgeClass(status: SourceStatus) {
  if (status === "available") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  if (status === "not_configured") return "border-sky-500/40 bg-sky-500/10 text-sky-300";
  if (status === "unavailable") return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  return "border-red-500/40 bg-red-500/10 text-red-300";
}

function formatCacheStatus(status: SourceCacheStatus, t: ToolT) {
  if (status === "fresh") return t.asnCacheFresh;
  if (status === "stale") return t.asnCacheStale;
  if (status === "not_configured") return t.asnCacheNotConfigured;
  return t.asnCacheMiss;
}

function hasSourceInfoFlag() {
  if (typeof window === "undefined") return false;

  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.has("source-info") || searchParams.has("sourceInfo") || window.location.hash === "#source-info";
}

function valueOrDash(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatNumber(value: number | null | undefined, locale: Locale) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat(locale).format(value);
}

function formatBoolean(value: boolean | null | undefined, t: ToolT) {
  if (value === true) return t.asnBooleanYes;
  if (value === false) return t.asnBooleanNo;
  return "-";
}

function formatTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

function formatReturnedRecords(template: string, visible: number, total: number, locale: Locale) {
  return formatTemplate(template, {
    visible: formatNumber(visible, locale),
    total: formatNumber(total, locale),
  });
}

function validationErrorMessage(error: unknown, t: ToolT, locale: Locale) {
  if (!(error instanceof AsnValidationError)) return t.asnInvalidInput;
  if (error.message.includes("between")) {
    return formatTemplate(t.asnInvalidRange, {
      max: formatNumber(MAX_ASN_NUMBER, locale),
    });
  }

  return t.asnInvalidInput;
}

function lookupErrorMessage(error: unknown, t: ToolT) {
  const message = error instanceof Error ? error.message : "";

  if (message === "ASN data providers are currently unavailable.") return t.asnUpstreamError;
  if (message === "The request parameters are invalid.") return t.asnInvalidInput;
  if (message === "Too many requests. Please wait before trying again.") return t.asnRateLimitError;

  return t.asnNetworkError;
}

function warningLabel(label: string, t: ToolT) {
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

function formatWarning(warning: string, t: ToolT, locale: Locale) {
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
  if (warning.match(/^(.+) data is currently unavailable; using stale cached data\.$/)) {
    const staleMatch = warning.match(/^(.+) data is currently unavailable; using stale cached data\.$/);
    return staleMatch
      ? formatTemplate(t.asnWarningProviderStale, { provider: staleMatch[1] })
      : warning;
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

function sectionTitle(icon: LucideIcon, title: string) {
  const Icon = icon;
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon className="h-4 w-4 text-primary" />
      {title}
    </p>
  );
}

function DetailGrid({ items }: { items: Array<{ label: string; value: string | number | null | undefined }> }) {
  return (
    <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 border-b border-border/60 pb-3 last:border-b-0 sm:last:border-b">
          <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-foreground">{valueOrDash(item.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{metric.label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{metric.value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
    </div>
  );
}

function PrefixList({
  title,
  prefixes,
  total,
  emptyText,
  locale,
  t,
}: {
  title: string;
  prefixes: AsnPrefix[];
  total: number;
  emptyText: string;
  locale: Locale;
  t: ToolT;
}) {
  const visible = prefixes.slice(0, 12);

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
          {total}
        </span>
      </div>
      {visible.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {visible.map((prefix) => (
            <li key={`${title}-${prefix.netblock}`} className="border-b border-border/60 pb-2 text-sm last:border-b-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="break-all font-mono text-foreground">{prefix.netblock}</span>
                {prefix.rpkiStatus && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    RPKI {prefix.rpkiStatus}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {[prefix.name, prefix.country, prefix.status, prefix.size ? `${prefix.size} ${t.asnPrefixIpCount}` : ""]
                  .filter(Boolean)
                  .join(" - ")}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{emptyText}</p>
      )}
      {total > visible.length && (
        <p className="mt-3 text-xs text-muted-foreground">
          {formatReturnedRecords(t.asnReturnedRecords, visible.length, total, locale)}
        </p>
      )}
    </div>
  );
}

function RelationList({
  title,
  relations,
  total,
  emptyText,
  showSourceInfo,
  locale,
  t,
}: {
  title: string;
  relations: AsnRelation[];
  total: number;
  emptyText: string;
  showSourceInfo: boolean;
  locale: Locale;
  t: ToolT;
}) {
  const visible = relations.slice(0, 30);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
          {total}
        </span>
      </div>
      {visible.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {visible.map((relation) => {
            const relationDetails = [
              showSourceInfo ? relation.source : "",
              relation.power ? `${t.asnRelationPower} ${formatNumber(relation.power, locale)}` : "",
              relation.v4Peers ? `${t.asnRelationIpv4Peers} ${formatNumber(relation.v4Peers, locale)}` : "",
              relation.v6Peers ? `${t.asnRelationIpv6Peers} ${formatNumber(relation.v6Peers, locale)}` : "",
            ].filter(Boolean);

            return (
              <div key={`${title}-${relation.asn}`} className="rounded-lg border border-border bg-secondary px-3 py-2">
                <Link
                  href={`/asn/${relation.asn}`}
                  className="inline-flex items-center gap-1 text-xs font-mono text-foreground transition-colors hover:text-primary"
                >
                  {relation.asn}
                  <ExternalLink className="h-3 w-3" />
                </Link>
                {relationDetails.length > 0 && (
                  <p className="mt-1 text-[11px] text-muted-foreground">{relationDetails.join(" - ")}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{emptyText}</p>
      )}
      {total > visible.length && (
        <p className="mt-3 text-xs text-muted-foreground">
          {formatReturnedRecords(t.asnReturnedRecords, visible.length, total, locale)}
        </p>
      )}
    </div>
  );
}

function IxLanTable({ items, total, locale, t }: { items: PeeringDbIxLan[]; total: number; locale: Locale; t: ToolT }) {
  const visible = items.slice(0, 20);

  if (!visible.length) {
    return <p className="mt-3 text-sm text-muted-foreground">{t.asnNoIxLanRecords}</p>;
  }

  return (
    <>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border/70">
              <th className="py-2 pr-4 font-medium">{t.asnLabelExchange}</th>
              <th className="py-2 pr-4 font-medium">{t.asnLabelSpeed}</th>
              <th className="py-2 pr-4 font-medium">{t.asnLabelIpv4}</th>
              <th className="py-2 pr-4 font-medium">{t.asnLabelIpv6}</th>
              <th className="py-2 font-medium">{t.asnLabelRsPeer}</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {visible.map((entry) => (
              <tr key={`${entry.id}-${entry.name}-${entry.ipaddr4}-${entry.ipaddr6}`} className="border-b border-border/50 last:border-b-0">
                <td className="py-2 pr-4 text-foreground">{valueOrDash(entry.name)}</td>
                <td className="py-2 pr-4">{entry.speed ? `${formatNumber(entry.speed, locale)} ${t.asnSpeedMbps}` : "-"}</td>
                <td className="py-2 pr-4 font-mono">{valueOrDash(entry.ipaddr4)}</td>
                <td className="py-2 pr-4 font-mono">{valueOrDash(entry.ipaddr6)}</td>
                <td className="py-2">{formatBoolean(entry.isRsPeer, t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > visible.length && (
        <p className="mt-3 text-xs text-muted-foreground">
          {formatReturnedRecords(t.asnReturnedRecords, visible.length, total, locale)}
        </p>
      )}
    </>
  );
}

function FacilityTable({ items, total, locale, t }: { items: PeeringDbFacility[]; total: number; locale: Locale; t: ToolT }) {
  const visible = items.slice(0, 20);

  if (!visible.length) {
    return <p className="mt-3 text-sm text-muted-foreground">{t.asnNoFacilityRecords}</p>;
  }

  return (
    <>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border/70">
              <th className="py-2 pr-4 font-medium">{t.asnLabelFacility}</th>
              <th className="py-2 pr-4 font-medium">{t.asnLabelCity}</th>
              <th className="py-2 pr-4 font-medium">{t.asnLabelCountry}</th>
              <th className="py-2 font-medium">{t.asnLabelLocalAsn}</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {visible.map((entry) => (
              <tr key={`${entry.id}-${entry.facilityId}-${entry.name}`} className="border-b border-border/50 last:border-b-0">
                <td className="py-2 pr-4 text-foreground">{valueOrDash(entry.name)}</td>
                <td className="py-2 pr-4">{valueOrDash(entry.city)}</td>
                <td className="py-2 pr-4">{valueOrDash(entry.country)}</td>
                <td className="py-2 font-mono">{valueOrDash(entry.localAsn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > visible.length && (
        <p className="mt-3 text-xs text-muted-foreground">
          {formatReturnedRecords(t.asnReturnedRecords, visible.length, total, locale)}
        </p>
      )}
    </>
  );
}

export function AsnChecker({ locale, initialAsn = "" }: AsnCheckerProps) {
  const router = useRouter();
  const t = getToolTranslation(locale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AsnProfile | null>(null);
  const [showSourceInfo, setShowSourceInfo] = useState(false);

  const runLookup = useCallback(
    async (value: string, updateUrl = true) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      let normalized;
      try {
        normalized = normalizeAsnInput(trimmed);
      } catch (lookupError) {
        setError(validationErrorMessage(lookupError, t, locale));
        setResult(null);
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      const shouldShowSourceInfo = hasSourceInfoFlag();
      setShowSourceInfo(shouldShowSourceInfo);

      if (updateUrl) {
        router.replace(`/asn/${normalized.asn}${shouldShowSourceInfo ? "?source-info=1" : ""}`, { scroll: false });
      }

      try {
        const response = await fetch(
          `/api/asn/${encodeURIComponent(normalized.asn)}${shouldShowSourceInfo ? "?source-info=1" : ""}`,
        );
        const data = unwrapApiResponse<AsnProfile>(await response.json());
        setResult(data);
      } catch (lookupError) {
        setError(lookupErrorMessage(lookupError, t));
      } finally {
        setLoading(false);
      }
    },
    [locale, router, t],
  );

  useEffect(() => {
    const syncSourceInfoFlag = () => {
      setShowSourceInfo(hasSourceInfoFlag());
    };

    syncSourceInfoFlag();
    window.addEventListener("hashchange", syncSourceInfoFlag);
    window.addEventListener("popstate", syncSourceInfoFlag);

    return () => {
      window.removeEventListener("hashchange", syncSourceInfoFlag);
      window.removeEventListener("popstate", syncSourceInfoFlag);
    };
  }, []);

  useEffect(() => {
    if (initialAsn.trim()) {
      runLookup(initialAsn, false);
    }
  }, [initialAsn, runLookup]);

  const metrics = useMemo<Metric[]>(() => {
    if (!result) return [];

    return [
      {
        label: t.asnMetricIpv4Addresses,
        value: formatNumber(result.numIps, locale),
        detail: t.asnMetricIpinfoDetail,
      },
      {
        label: t.asnMetricIpv4Prefixes,
        value: formatNumber(result.prefixes4Total || result.peeringdb?.infoPrefixes4 || 0, locale),
        detail: result.prefixes4Total ? t.asnMetricAnnouncedPrefixesDetail : t.asnMetricPeeringDbDeclaredCountDetail,
      },
      {
        label: t.asnMetricIpv6Prefixes,
        value: formatNumber(result.prefixes6Total || result.peeringdb?.infoPrefixes6 || 0, locale),
        detail: result.prefixes6Total ? t.asnMetricAnnouncedPrefixesDetail : t.asnMetricPeeringDbDeclaredCountDetail,
      },
      {
        label: t.asnMetricRoutingNeighbours,
        value: formatNumber(result.peersTotal + result.upstreamsTotal + result.downstreamsTotal, locale),
        detail: t.asnMetricBgpRelationshipsDetail,
      },
      {
        label: t.asnMetricIxPresence,
        value: formatNumber(result.peeringdb?.ixCount || 0, locale),
        detail: t.asnMetricPeeringDbProfileDetail,
      },
      {
        label: t.asnMetricFacilities,
        value: formatNumber(result.peeringdb?.facilityCount || 0, locale),
        detail: t.asnMetricPeeringDbProfileDetail,
      },
    ];
  }, [locale, result, t]);

  const isPartial =
    result !== null &&
    result.found &&
    (result.sources.ipinfo !== "available" ||
      result.sources.peeringdb !== "available" ||
      result.sources.ripestat !== "available" ||
      result.warnings.length > 0);

  return (
    <div className="flex w-full flex-col gap-8">
      <ToolSearchForm
        initialValue={initialAsn}
        placeholder={t.asnPlaceholder}
        submitLabel={t.asnLookupButton}
        loadingLabel={t.asnLookingUp}
        loading={loading}
        onSubmit={runLookup}
      />

      {!loading && !error && !result && (
        <div className="rounded-xl border border-border/80 bg-card/70 p-6 text-center shadow-sm">
          <Waypoints className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-lg font-semibold text-foreground">{t.asnEmptyTitle}</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">{t.asnEmptyDescription}</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      )}

      {error && <ErrorPanel message={error} />}

      {result && !result.found && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 shadow-sm">
          <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            {t.asnNotFoundTitle}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t.asnNotFoundDescription}</p>
        </div>
      )}

      {result && result.found && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t.asnAutonomousSystem}</p>
                <h2 className="mt-2 break-words text-2xl font-semibold text-foreground">
                  <span className="font-mono">{result.asn}</span>
                  {result.name ? ` - ${result.name}` : ""}
                </h2>
              </div>
              {isPartial ? (
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                  {t.asnPartialData}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <CircleCheck className="h-3.5 w-3.5" />
                  {t.asnCompleteData}
                </span>
              )}
            </div>
          </div>

          {showSourceInfo && result.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm">
              {sectionTitle(AlertTriangle, t.asnWarnings)}
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {result.warnings.map((warning) => (
                  <li key={warning}>{formatWarning(warning, t, locale)}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>

          <div className={`grid grid-cols-1 gap-4 ${showSourceInfo ? "lg:grid-cols-2" : ""}`}>
            <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
              {sectionTitle(Hash, t.asnIdentity)}
              <DetailGrid
                items={[
                  { label: t.asnLabelAsn, value: result.asn },
                  { label: t.asnLabelName, value: result.name },
                  { label: t.asnLabelCountry, value: result.country },
                  { label: t.asnLabelRegistry, value: result.registry },
                  { label: t.asnLabelAllocated, value: result.allocated },
                  { label: t.asnLabelDomain, value: result.domain },
                  { label: t.asnLabelType, value: result.type },
                ]}
              />
            </div>

            {showSourceInfo && (
              <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
                {sectionTitle(Binary, t.asnSources)}
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(result.sources).map(([source, status]) => (
                    <span
                      key={source}
                      className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${sourceBadgeClass(status)}`}
                    >
                      {source}: {formatStatus(status, t)}
                    </span>
                  ))}
                </div>
                {result.sourceDiagnostics && result.sourceDiagnostics.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t.asnSourceDiagnostics}
                    </p>
                    {result.sourceDiagnostics.map((diagnostic) => (
                      <div
                        key={diagnostic.source}
                        className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground"
                      >
                        <p className="font-medium uppercase tracking-wider text-foreground">{diagnostic.source}</p>
                        <p className="mt-1">
                          {t.asnDiagnosticDuration}: {formatNumber(diagnostic.durationMs, locale)} ms -{" "}
                          {t.asnDiagnosticCache}: {formatCacheStatus(diagnostic.cache, t)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            {sectionTitle(Network, t.asnPrefixes)}
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PrefixList
                title={t.asnLabelIpv4}
                prefixes={result.prefixes4}
                total={result.prefixes4Total}
                emptyText={t.asnNoPrefixes}
                locale={locale}
                t={t}
              />
              <PrefixList
                title={t.asnLabelIpv6}
                prefixes={result.prefixes6}
                total={result.prefixes6Total}
                emptyText={t.asnNoPrefixes}
                locale={locale}
                t={t}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            {sectionTitle(Route, t.asnRouting)}
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <RelationList
                title={t.asnRelationPeers}
                relations={result.peers}
                total={result.peersTotal}
                emptyText={t.asnNoRelations}
                showSourceInfo={showSourceInfo}
                locale={locale}
                t={t}
              />
              <RelationList
                title={t.asnRelationUpstreams}
                relations={result.upstreams}
                total={result.upstreamsTotal}
                emptyText={t.asnNoRelations}
                showSourceInfo={showSourceInfo}
                locale={locale}
                t={t}
              />
              <RelationList
                title={t.asnRelationDownstreams}
                relations={result.downstreams}
                total={result.downstreamsTotal}
                emptyText={t.asnNoRelations}
                showSourceInfo={showSourceInfo}
                locale={locale}
                t={t}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            {sectionTitle(Globe, t.asnPeeringDb)}
            {result.peeringdb ? (
              <DetailGrid
                items={[
                  { label: t.asnLabelNetworkId, value: result.peeringdb.netId },
                  { label: t.asnLabelName, value: result.peeringdb.name },
                  { label: t.asnLabelAlsoKnownAs, value: result.peeringdb.aka },
                  { label: t.asnLabelWebsite, value: result.peeringdb.website },
                  { label: t.asnLabelLookingGlass, value: result.peeringdb.lookingGlass },
                  { label: t.asnLabelRouteServer, value: result.peeringdb.routeServer },
                  { label: t.asnLabelTraffic, value: result.peeringdb.traffic },
                  { label: t.asnLabelPolicyGeneral, value: result.peeringdb.policyGeneral },
                  { label: t.asnLabelPolicyLocations, value: result.peeringdb.policyLocations },
                  { label: t.asnLabelPolicyRatio, value: result.peeringdb.policyRatio },
                  { label: t.asnLabelPolicyContracts, value: result.peeringdb.policyContracts },
                  { label: t.asnLabelStatus, value: result.peeringdb.status },
                ]}
              />
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{t.asnNoPeeringDb}</p>
            )}
          </div>

          {result.peeringdb && (
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
                {sectionTitle(Waypoints, t.asnIxPresence)}
                <IxLanTable items={result.peeringdb.ixlan} total={result.peeringdb.ixlanTotal} locale={locale} t={t} />
              </div>
              <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
                {sectionTitle(Building2, t.asnFacilities)}
                <FacilityTable
                  items={result.peeringdb.facilities}
                  total={result.peeringdb.facilitiesTotal}
                  locale={locale}
                  t={t}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
