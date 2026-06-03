"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Binary,
  Building2,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  ExternalLink,
  Globe,
  Hash,
  Network,
  Route,
  Server,
  Waypoints,
  Zap,
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
  type PeeringDbProfile,
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

// Country code to Flag emoji helper
function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return "";
  }
}

// Type badge style classes helper
function getTypeBadgeClass(type: string) {
  const t = type.toLowerCase().trim();
  if (t === "isp") return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  if (t === "hosting") return "border-purple-500/30 bg-purple-500/10 text-purple-300";
  if (t === "education") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  if (t === "business") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  return "border-border bg-secondary text-muted-foreground";
}

// IX connection speed to human-readable speed helper
function formatSpeed(speed: number | null | undefined, t: ToolT) {
  if (!speed) return "-";
  if (speed >= 1000000) {
    return `${(speed / 1000000).toFixed(0)} Tbps`;
  }
  if (speed >= 1000) {
    return `${(speed / 1000).toLocaleString()} Gbps`;
  }
  return `${speed} ${t.asnSpeedMbps}`;
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

// Sub-components

function HeroHeader({ result, t, locale }: { result: AsnProfile; t: ToolT; locale: Locale }) {
  const flag = getCountryFlag(result.country);
  const typeClass = getTypeBadgeClass(result.type);
  const isPartial =
    result.sources.ipinfo !== "available" ||
    result.sources.peeringdb !== "available" ||
    result.sources.ripestat !== "available" ||
    result.warnings.length > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/45 p-6 shadow-md backdrop-blur-md">
      {/* Accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary/10 to-primary/30" />

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            {result.country && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                {flag && <span className="text-sm leading-none mr-0.5">{flag}</span>}
                {result.country}
              </span>
            )}
            {result.type && (
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeClass}`}>
                {result.type}
              </span>
            )}
            {result.registry && (
              <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {result.registry}
              </span>
            )}
          </div>

          <h2 className="mt-4 break-words text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            <span className="font-mono text-primary mr-2">{result.asn}</span>
            <span className="text-foreground/90">{result.name || "Unnamed AS"}</span>
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {result.domain && (
              <a
                href={`https://${result.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                {result.domain}
              </a>
            )}
            {result.allocated && (
              <span className="flex items-center gap-1.5">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground/60">
                  {t.asnLabelAllocated}:
                </span>
                <span className="text-foreground/80">{result.allocated}</span>
              </span>
            )}
          </div>
        </div>

        {/* Completeness Badge */}
        <div className="flex shrink-0 items-center md:self-start">
          {isPartial ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              {t.asnPartialData}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300">
              <CircleCheck className="h-3.5 w-3.5 text-emerald-400" />
              {t.asnCompleteData}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickStats({ result, t, locale }: { result: AsnProfile; t: ToolT; locale: Locale }) {
  const stats = [
    {
      label: t.asnMetricIpv4Addresses,
      value: formatNumber(result.numIps, locale),
      detail: t.asnMetricIpinfoDetail,
      icon: Hash,
    },
    {
      label: t.asnPrefixes,
      value: formatNumber((result.prefixes4Total || 0) + (result.prefixes6Total || 0), locale),
      detail: t.asnMetricAnnouncedPrefixesDetail,
      icon: Network,
    },
    {
      label: t.asnMetricRoutingNeighbours,
      value: formatNumber(result.peersTotal + result.upstreamsTotal + result.downstreamsTotal, locale),
      detail: t.asnMetricBgpRelationshipsDetail,
      icon: Route,
    },
    {
      label: t.asnMetricIxPresence,
      value: formatNumber(result.peeringdb?.ixCount || 0, locale),
      detail: t.asnMetricPeeringDbProfileDetail,
      icon: Waypoints,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/35 p-5 shadow-sm transition-all hover:scale-[1.02] hover:bg-card/50"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {stat.value}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground leading-normal">{stat.detail}</p>
          </div>
        );
      })}
    </div>
  );
}

function RelationChip({
  relation,
  maxPower,
  locale,
  t,
}: {
  relation: AsnRelation;
  maxPower: number;
  locale: Locale;
  t: ToolT;
}) {
  const powerPct = maxPower > 0 ? Math.min(100, Math.max(5, ((relation.power || 0) / maxPower) * 100)) : 0;

  return (
    <div className="group flex flex-col gap-2 rounded-xl border border-border/80 bg-card/25 p-3.5 transition-all hover:scale-[1.01] hover:border-primary/40 hover:bg-card/45">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/asn/${relation.asn}`}
          className="inline-flex items-center gap-1 font-mono text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          {relation.asn}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        {relation.source && (
          <span className="text-[10px] text-muted-foreground/60 font-medium bg-secondary px-1.5 py-0.5 rounded">
            {relation.source}
          </span>
        )}
      </div>

      {relation.power !== null && relation.power !== undefined && (
        <div className="mt-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" />
              {t.asnRelationPower}
            </span>
            <span className="font-mono font-bold text-foreground/90">{formatNumber(relation.power, locale)}</span>
          </div>
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${powerPct}%` }}
            />
          </div>
        </div>
      )}

      {(relation.v4Peers || relation.v6Peers) && (
        <div className="mt-1 flex items-center gap-2">
          {relation.v4Peers !== null && relation.v4Peers !== undefined && relation.v4Peers > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              v4: {formatNumber(relation.v4Peers, locale)}
            </span>
          )}
          {relation.v6Peers !== null && relation.v6Peers !== undefined && relation.v6Peers > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              v6: {formatNumber(relation.v6Peers, locale)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function RelationColumn({
  title,
  relations,
  total,
  emptyText,
  locale,
  t,
}: {
  title: string;
  relations: AsnRelation[];
  total: number;
  emptyText: string;
  locale: Locale;
  t: ToolT;
}) {
  const [expanded, setExpanded] = useState(false);
  const limit = 8;
  const visible = expanded ? relations : relations.slice(0, limit);
  const maxPower = useMemo(() => Math.max(...relations.map((r) => r.power || 0), 0), [relations]);

  const showAllText = locale === "de" ? "Alle anzeigen" : "Show All";
  const showLessText = locale === "de" ? "Weniger anzeigen" : "Show Less";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/20 p-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <p className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Route className="h-4 w-4 text-primary" />
          {title}
        </p>
        <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
          {total}
        </span>
      </div>

      {visible.length > 0 ? (
        <div className="flex flex-col gap-3">
          {visible.map((relation) => (
            <RelationChip
              key={relation.asn}
              relation={relation}
              maxPower={maxPower}
              locale={locale}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        </div>
      )}

      {relations.length > limit && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/50 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-secondary hover:text-primary"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              {showLessText}
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              {showAllText} ({relations.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}

function RoutingSection({ result, t, locale }: { result: AsnProfile; t: ToolT; locale: Locale }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Waypoints className="h-5 w-5 text-primary" />
          {t.asnRouting}
        </h3>
        <p className="text-xs text-muted-foreground leading-normal">
          Autonomous System interconnections, neighbours, and path weights. Higher weights signify more preferred routing paths.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <RelationColumn
          title={t.asnRelationPeers}
          relations={result.peers}
          total={result.peersTotal}
          emptyText={t.asnNoRelations}
          locale={locale}
          t={t}
        />
        <RelationColumn
          title={t.asnRelationUpstreams}
          relations={result.upstreams}
          total={result.upstreamsTotal}
          emptyText={t.asnNoRelations}
          locale={locale}
          t={t}
        />
        <RelationColumn
          title={t.asnRelationDownstreams}
          relations={result.downstreams}
          total={result.downstreamsTotal}
          emptyText={t.asnNoRelations}
          locale={locale}
          t={t}
        />
      </div>
    </div>
  );
}

function IxPresenceSection({
  result,
  locale,
  t,
}: {
  result: AsnProfile;
  locale: Locale;
  t: ToolT;
}) {
  const ixlan = result.peeringdb?.ixlan || [];
  const total = result.peeringdb?.ixlanTotal || 0;

  const [expanded, setExpanded] = useState(false);
  const limit = 8;
  const visible = expanded ? ixlan : ixlan.slice(0, limit);

  const maxSpeed = useMemo(() => Math.max(...ixlan.map((x) => x.speed || 0), 1), [ixlan]);

  const showAllText = locale === "de" ? "Alle Exchanges anzeigen" : "Show All Exchanges";
  const showLessText = locale === "de" ? "Weniger anzeigen" : "Show Less";

  if (!ixlan.length) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card/35 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Waypoints className="h-5 w-5 text-primary" />
          {t.asnIxPresence}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">{t.asnNoIxLanRecords}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card/35 p-5 md:p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            {t.asnIxPresence}
          </h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Internet Exchanges (IX) where this Autonomous System is present, including interconnection bandwidth.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary shrink-0 self-start md:self-center">
          {total}
        </span>
      </div>

      {/* Desktop view: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-3 pr-4 font-bold">{t.asnLabelExchange}</th>
              <th className="pb-3 pr-4 font-bold">{t.asnLabelSpeed}</th>
              <th className="pb-3 pr-4 font-bold">{t.asnLabelIpv4}</th>
              <th className="pb-3 pr-4 font-bold">{t.asnLabelIpv6}</th>
              <th className="pb-3 font-bold text-center">{t.asnLabelRsPeer}</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground divide-y divide-border/40">
            {visible.map((entry, idx) => {
              const speedPct = maxSpeed > 0 ? Math.min(100, Math.max(2, ((entry.speed || 0) / maxSpeed) * 100)) : 0;
              return (
                <tr key={`${entry.id}-${idx}`} className="group hover:bg-secondary/15 transition-colors">
                  <td className="py-3 pr-4 font-medium text-foreground max-w-xs truncate" title={entry.name}>
                    {entry.name}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                      <span className="font-semibold text-foreground/90 font-mono text-xs">
                        {formatSpeed(entry.speed, t)}
                      </span>
                      {entry.speed && (
                        <div className="h-1 w-28 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all"
                            style={{ width: `${speedPct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs break-all">
                    {valueOrDash(entry.ipaddr4)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs break-all">
                    {valueOrDash(entry.ipaddr6)}
                  </td>
                  <td className="py-3 text-center">
                    {entry.isRsPeer === true ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        <CircleCheck className="h-3 w-3" />
                        {t.asnBooleanYes}
                      </span>
                    ) : entry.isRsPeer === false ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {t.asnBooleanNo}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile view: Stacked Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {visible.map((entry, idx) => {
          const speedPct = maxSpeed > 0 ? Math.min(100, Math.max(2, ((entry.speed || 0) / maxSpeed) * 100)) : 0;
          return (
            <div key={`${entry.id}-${idx}`} className="rounded-xl border border-border/80 bg-secondary/20 p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2">
                <span className="font-semibold text-foreground text-sm break-words max-w-[75%]">{entry.name}</span>
                {entry.isRsPeer === true && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
                    RS Peer
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground/70 block uppercase text-[9px] font-semibold tracking-wider">Speed</span>
                  <div className="mt-1 flex flex-col gap-1">
                    <span className="font-bold text-foreground font-mono">{formatSpeed(entry.speed, t)}</span>
                    {entry.speed && (
                      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                          style={{ width: `${speedPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground/70 block uppercase text-[9px] font-semibold tracking-wider">RS Peer</span>
                  <span className="mt-1 block font-medium text-foreground/80">
                    {entry.isRsPeer === true ? t.asnBooleanYes : entry.isRsPeer === false ? t.asnBooleanNo : "-"}
                  </span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-muted-foreground/70 block uppercase text-[9px] font-semibold tracking-wider">{t.asnLabelIpv4}</span>
                  <span className="font-mono text-foreground break-all text-xs">{valueOrDash(entry.ipaddr4)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground/70 block uppercase text-[9px] font-semibold tracking-wider">{t.asnLabelIpv6}</span>
                  <span className="font-mono text-foreground break-all text-xs">{valueOrDash(entry.ipaddr6)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ixlan.length > limit && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/50 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-secondary hover:text-primary"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              {showLessText}
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              {showAllText} ({ixlan.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}

function PrefixItem({ prefix, t }: { prefix: AsnPrefix; t: ToolT }) {
  const rpki = prefix.rpkiStatus?.toLowerCase().trim();
  let rpkiBadge = null;

  if (rpki === "valid") {
    rpkiBadge = (
      <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300 uppercase tracking-wider">
        RPKI Valid
      </span>
    );
  } else if (rpki === "invalid") {
    rpkiBadge = (
      <span className="rounded bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-red-300 uppercase tracking-wider">
        RPKI Invalid
      </span>
    );
  } else if (prefix.rpkiStatus) {
    rpkiBadge = (
      <span className="rounded bg-secondary border border-border px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
        RPKI {prefix.rpkiStatus}
      </span>
    );
  }

  const details = [
    prefix.name,
    prefix.country,
    prefix.status,
    prefix.size ? `${prefix.size} ${t.asnPrefixIpCount}` : "",
  ].filter(Boolean).join(" • ");

  return (
    <li className="flex flex-col gap-1.5 border-b border-border/40 pb-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-semibold text-foreground/95 select-all">{prefix.netblock}</span>
        {rpkiBadge}
      </div>
      {details && <p className="text-[11px] text-muted-foreground">{details}</p>}
    </li>
  );
}

function PrefixColumn({
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
  const [expanded, setExpanded] = useState(false);
  const limit = 6;
  const visible = expanded ? prefixes : prefixes.slice(0, limit);

  const showAllText = locale === "de" ? "Alle anzeigen" : "Show All";
  const showLessText = locale === "de" ? "Weniger anzeigen" : "Show Less";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-secondary/15 p-5">
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <span className="font-semibold text-foreground text-sm font-mono">{title}</span>
        <span className="rounded-full bg-secondary border border-border px-2.5 py-0.5 text-xs text-muted-foreground font-mono">
          {total}
        </span>
      </div>

      {visible.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {visible.map((prefix, idx) => (
            <PrefixItem key={`${prefix.netblock}-${idx}`} prefix={prefix} t={t} />
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-xs text-muted-foreground">{emptyText}</p>
      )}

      {prefixes.length > limit && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/50 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-secondary hover:text-primary"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              {showLessText}
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              {showAllText} ({prefixes.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}

function PrefixSection({ result, t, locale }: { result: AsnProfile; t: ToolT; locale: Locale }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/35 p-5 md:p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            {t.asnPrefixes}
          </h3>
          <p className="text-xs text-muted-foreground leading-normal">
            IP netblocks announced by this Autonomous System to the global routing table.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PrefixColumn
          title={t.asnLabelIpv4}
          prefixes={result.prefixes4}
          total={result.prefixes4Total}
          emptyText={t.asnNoPrefixes}
          locale={locale}
          t={t}
        />
        <PrefixColumn
          title={t.asnLabelIpv6}
          prefixes={result.prefixes6}
          total={result.prefixes6Total}
          emptyText={t.asnNoPrefixes}
          locale={locale}
          t={t}
        />
      </div>
    </div>
  );
}

function PeeringDbProfileCard({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const val = valueOrDash(value);
  const isUrl = typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"));

  return (
    <div className="min-w-0 border-b border-border/40 pb-3 last:border-b-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
        {label}
      </dt>
      <dd className="mt-1 break-all text-sm font-semibold text-foreground">
        {isUrl ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {value.replace(/^https?:\/\/(www\.)?/, "")}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          val
        )}
      </dd>
    </div>
  );
}

function ProfileSection({
  profile,
  t,
}: {
  profile: PeeringDbProfile;
  t: ToolT;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/35 p-5 md:p-6 shadow-sm flex flex-col gap-5">
      <div className="border-b border-border/60 pb-3">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          {t.asnPeeringDb}
        </h3>
        <p className="text-xs text-muted-foreground leading-normal">
          Interconnection profile and routing policies declared in the public PeeringDB database.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Info & General */}
        <div className="rounded-xl border border-border/80 bg-secondary/10 p-5 flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/50 pb-2">
            Identity & Status
          </p>
          <dl className="flex flex-col gap-3">
            <PeeringDbProfileCard label={t.asnLabelNetworkId} value={profile.netId} />
            <PeeringDbProfileCard label={t.asnLabelName} value={profile.name} />
            <PeeringDbProfileCard label={t.asnLabelAlsoKnownAs} value={profile.aka} />
            <PeeringDbProfileCard label={t.asnLabelStatus} value={profile.status} />
          </dl>
        </div>

        {/* Resources */}
        <div className="rounded-xl border border-border/80 bg-secondary/10 p-5 flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/50 pb-2">
            Interconnection Details
          </p>
          <dl className="flex flex-col gap-3">
            <PeeringDbProfileCard label={t.asnLabelTraffic} value={profile.traffic} />
            <PeeringDbProfileCard label={t.asnLabelWebsite} value={profile.website} />
            <PeeringDbProfileCard label={t.asnLabelLookingGlass} value={profile.lookingGlass} />
            <PeeringDbProfileCard label={t.asnLabelRouteServer} value={profile.routeServer} />
          </dl>
        </div>

        {/* Policy */}
        <div className="rounded-xl border border-border/80 bg-secondary/10 p-5 flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/50 pb-2">
            Peering Policy
          </p>
          <dl className="flex flex-col gap-3">
            <PeeringDbProfileCard label={t.asnLabelPolicyGeneral} value={profile.policyGeneral} />
            <PeeringDbProfileCard label={t.asnLabelPolicyLocations} value={profile.policyLocations} />
            <PeeringDbProfileCard label={t.asnLabelPolicyRatio} value={profile.policyRatio} />
            <PeeringDbProfileCard label={t.asnLabelPolicyContracts} value={profile.policyContracts} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function FacilitySection({
  facilities,
  total,
  locale,
  t,
}: {
  facilities: PeeringDbFacility[];
  total: number;
  locale: Locale;
  t: ToolT;
}) {
  const [expanded, setExpanded] = useState(false);
  const limit = 8;
  const visible = expanded ? facilities : facilities.slice(0, limit);

  const showAllText = locale === "de" ? "Alle Standorte anzeigen" : "Show All Facilities";
  const showLessText = locale === "de" ? "Weniger anzeigen" : "Show Less";

  if (!facilities.length) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card/35 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {t.asnFacilities}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">{t.asnNoFacilityRecords}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card/35 p-5 md:p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t.asnFacilities}
          </h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Physical data centers and colocation facilities where this network is present.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary shrink-0 self-start md:self-center">
          {total}
        </span>
      </div>

      {/* Desktop view: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-3 pr-4 font-bold">{t.asnLabelFacility}</th>
              <th className="pb-3 pr-4 font-bold">{t.asnLabelCity}</th>
              <th className="pb-3 pr-4 font-bold">{t.asnLabelCountry}</th>
              <th className="pb-3 font-bold">{t.asnLabelLocalAsn}</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground divide-y divide-border/40">
            {visible.map((entry, idx) => (
              <tr key={`${entry.id}-${idx}`} className="group hover:bg-secondary/15 transition-colors">
                <td className="py-3 pr-4 font-medium text-foreground max-w-sm truncate" title={entry.name}>
                  {entry.name}
                </td>
                <td className="py-3 pr-4">{valueOrDash(entry.city)}</td>
                <td className="py-3 pr-4 uppercase text-xs font-semibold">{valueOrDash(entry.country)}</td>
                <td className="py-3 font-mono text-xs text-foreground/80">{valueOrDash(entry.localAsn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view: Stacked Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {visible.map((entry, idx) => (
          <div key={`${entry.id}-${idx}`} className="rounded-xl border border-border/80 bg-secondary/20 p-4 flex flex-col gap-2">
            <span className="font-semibold text-foreground text-sm border-b border-border/40 pb-2 mb-1">{entry.name}</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground/70 block uppercase text-[9px] font-semibold tracking-wider">{t.asnLabelCity}</span>
                <span className="font-medium text-foreground">{valueOrDash(entry.city)}</span>
              </div>
              <div>
                <span className="text-muted-foreground/70 block uppercase text-[9px] font-semibold tracking-wider">{t.asnLabelCountry}</span>
                <span className="font-medium text-foreground uppercase">{valueOrDash(entry.country)}</span>
              </div>
              <div className="col-span-2 mt-1">
                <span className="text-muted-foreground/70 block uppercase text-[9px] font-semibold tracking-wider">{t.asnLabelLocalAsn}</span>
                <span className="font-mono text-foreground">{valueOrDash(entry.localAsn)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {facilities.length > limit && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/50 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-secondary hover:text-primary"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              {showLessText}
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              {showAllText} ({facilities.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Hero Header Skeleton */}
      <div className="rounded-2xl border border-border/40 bg-card/25 p-6 h-36 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-5 w-20 bg-muted rounded-full" />
          <div className="h-5 w-12 bg-muted rounded-full" />
        </div>
        <div className="h-8 w-2/3 bg-muted rounded-lg mt-3" />
        <div className="h-4 w-1/3 bg-muted rounded-md mt-2" />
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card/25 p-5 h-28 flex flex-col justify-between">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-7 w-20 bg-muted rounded mt-2" />
            <div className="h-3 w-full bg-muted rounded mt-3" />
          </div>
        ))}
      </div>

      {/* Routing Section Skeleton */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="rounded-2xl border border-border/40 bg-card/25 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-5 w-8 bg-muted rounded-full" />
            </div>
            {Array.from({ length: 4 }).map((_, row) => (
              <div key={row} className="rounded-xl border border-border/30 bg-card/10 p-3.5 flex flex-col gap-2">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded mt-1" />
                <div className="h-3 w-1/2 bg-muted rounded mt-1" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Component

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
          <Waypoints className="mx-auto h-8 w-8 text-primary animate-pulse" />
          <p className="mt-3 text-lg font-semibold text-foreground">{t.asnEmptyTitle}</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">{t.asnEmptyDescription}</p>
        </div>
      )}

      {loading && <LoadingSkeleton />}

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
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* 1. Hero Header */}
          <HeroHeader result={result} t={t} locale={locale} />

          {/* Warnings (if active) */}
          {showSourceInfo && result.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                {t.asnWarnings}
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {result.warnings.map((warning) => (
                  <li key={warning}>{formatWarning(warning, t, locale)}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 2. Quick Stats Row */}
          <QuickStats result={result} t={t} locale={locale} />

          {/* 3. Peers & Routing (BGP neighbours) */}
          <RoutingSection result={result} t={t} locale={locale} />

          {/* 4. IX Presence & Speeds */}
          <IxPresenceSection result={result} locale={locale} t={t} />

          {/* 5. Announced Network Prefixes */}
          <PrefixSection result={result} t={t} locale={locale} />

          {/* 6. PeeringDB Profile Details */}
          {result.peeringdb && (
            <ProfileSection profile={result.peeringdb} t={t} />
          )}

          {/* 7. Colocation Facilities */}
          {result.peeringdb && (
            <FacilitySection
              facilities={result.peeringdb.facilities}
              total={result.peeringdb.facilitiesTotal}
              locale={locale}
              t={t}
            />
          )}

          {/* Source diagnostics (only shown under ?source-info flag) */}
          {showSourceInfo && (
            <div className="rounded-2xl border border-border/80 bg-card/35 p-5 md:p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Binary className="h-5 w-5 text-primary" />
                {t.asnSourceDiagnostics}
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {Object.entries(result.sources).map(([source, status]) => (
                  <span
                    key={source}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${sourceBadgeClass(status)}`}
                  >
                    {source}: {formatStatus(status, t)}
                  </span>
                ))}
              </div>

              {result.sourceDiagnostics && result.sourceDiagnostics.length > 0 && (
                <div className="mt-2 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                    Detailed Diagnostics
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {result.sourceDiagnostics.map((diagnostic) => (
                      <div
                        key={diagnostic.source}
                        className="rounded-xl border border-border bg-secondary/35 p-4 text-xs flex flex-col justify-between gap-1.5"
                      >
                        <p className="font-bold uppercase tracking-wider text-foreground">{diagnostic.source}</p>
                        <p className="text-muted-foreground leading-normal mt-1">
                          {t.asnDiagnosticDuration}: <span className="text-foreground font-semibold">{formatNumber(diagnostic.durationMs, locale)} ms</span>
                        </p>
                        <p className="text-muted-foreground leading-normal">
                          {t.asnDiagnosticCache}: <span className="text-foreground font-semibold">{formatCacheStatus(diagnostic.cache, t)}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
