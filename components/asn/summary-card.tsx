"use client";

/**
 * ASN overview: identity, source trust and the small set of figures that make
 * a network scannable at a glance. The detail tabs intentionally take over
 * after this compact brief; no provider-specific detail competes with the ASN.
 */

import type { ReactNode } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Globe,
  Network,
  Route,
  Share2,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import type { AsnProfile, SourceStatus } from "@/lib/asn";
import { CountryFlag } from "@/components/country-flag";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import { formatStatus } from "./helpers";

// IPinfo reports allocation as an ISO date; show it in the visitor's locale
// while tolerating unexpected provider values.
function formatAllocated(value: string, locale: Locale) {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const date = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return trimmed;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function sourceTone(status: SourceStatus) {
  if (status === "available") return "bg-success";
  if (status === "error") return "bg-destructive";
  if (status === "unavailable") return "bg-warning";
  return "bg-info";
}

function sourceTextTone(status: SourceStatus) {
  if (status === "available") return "text-foreground/75";
  if (status === "error") return "text-destructive";
  if (status === "unavailable") return "text-warning";
  return "text-muted-foreground";
}

function DataCompletenessBadge({ result, t }: { result: AsnProfile; t: ToolTranslation }) {
  const complete =
    result.sources.ipinfo === "available" &&
    result.sources.peeringdb === "available" &&
    result.sources.ripestat === "available" &&
    result.warnings.length === 0;

  return complete ? (
    <Badge variant="outline" className="gap-1.5 border-success/40 text-success">
      <CheckCircle2 className="size-3" aria-hidden />
      {t.asnCompleteData}
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1.5 border-warning/50 text-warning">
      <AlertTriangle className="size-3" aria-hidden />
      {t.asnPartialData}
    </Badge>
  );
}

function SourceCoverage({ result, t }: { result: AsnProfile; t: ToolTranslation }) {
  const sources = [
    { label: "IPinfo", status: result.sources.ipinfo },
    { label: "PeeringDB", status: result.sources.peeringdb },
    { label: "RIPEstat", status: result.sources.ripestat },
  ] as const;
  const available = sources.filter((source) => source.status === "available").length;

  return (
    <div className="mt-5 flex flex-col gap-2.5 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {t.asnSourceCoverage}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {available}/{sources.length}
        </span>
      </div>
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
        aria-label={t.asnSourceCoverageDescription}
        role="list"
      >
        {sources.map((source) => (
          <span
            key={source.label}
            role="listitem"
            className="inline-flex min-w-0 items-center gap-1.5 text-[11px]"
          >
            <span className={cn("size-1.5 shrink-0 rounded-full", sourceTone(source.status))} aria-hidden />
            <span className="font-medium text-muted-foreground">{source.label}</span>
            <span className={cn("truncate", sourceTextTone(source.status))}>
              {formatStatus(source.status, t)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function domainHref(domain: string) {
  const value = domain.trim();
  if (!value || value.length > 253 || !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(value)) {
    return null;
  }
  return `https://${value}`;
}

function AsnIdentity({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const type = result.type
    ? result.type.charAt(0).toUpperCase() + result.type.slice(1)
    : "";
  const registry = result.registry.trim();
  const domain = domainHref(result.domain);
  const metadata: { label: string; value: ReactNode }[] = [];

  if (result.country) {
    metadata.push({
      label: t.asnLabelCountry,
      value: (
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <CountryFlag countryCode={result.country} />
          <span className="font-medium text-foreground/80">{result.country.toUpperCase()}</span>
        </span>
      ),
    });
  }
  if (type) {
    metadata.push({ label: t.asnNetworkType, value: <span className="break-words">{type}</span> });
  }
  if (registry) {
    metadata.push({
      label: t.asnRegistry,
      value: <span className="font-mono text-xs tracking-wide text-foreground/80">{registry.toUpperCase()}</span>,
    });
  }
  if (result.allocated) {
    metadata.push({
      label: t.asnLabelAllocated,
      value: <span className="whitespace-nowrap">{formatAllocated(result.allocated, locale)}</span>,
    });
  }
  if (domain) {
    metadata.push({
      label: t.asnDomain,
      value: (
        <a
          href={domain}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-w-0 items-center gap-1.5 rounded-sm font-mono text-xs text-primary outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <Globe className="size-3.5 shrink-0" aria-hidden />
          <span className="break-all">{result.domain}</span>
        </a>
      ),
    });
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary sm:size-11">
            <Waypoints className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {t.asnNetworkIdentity}
              </span>
              <DataCompletenessBadge result={result} t={t} />
            </div>
            <h2 className="mt-1.5 font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {result.asn}
            </h2>
            <p className="mt-1 max-w-3xl text-base leading-snug font-medium break-words text-foreground/90 sm:text-lg">
              {result.name || t.asnUnnamed}
            </p>
          </div>
        </div>
      </div>

      {metadata.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/60 pt-4 sm:grid-cols-3 lg:grid-cols-5">
          {metadata.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/80 uppercase">
                {item.label}
              </dt>
              <dd className="mt-1 min-w-0 text-xs leading-relaxed text-foreground/80">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <SourceCoverage result={result} t={t} />
    </div>
  );
}

interface MetricCell {
  key: string;
  label: string;
  caption: string;
  icon: typeof Network;
  /** null renders as an em dash (data unavailable rather than zero). */
  value: number | null;
  detail?: string;
}

function RpkiHealth({ result, t, locale }: { result: AsnProfile; t: ToolTranslation; locale: Locale }) {
  const prefixes = [...result.prefixes4, ...result.prefixes6];
  const valid = prefixes.filter((prefix) => prefix.rpkiStatus?.toLowerCase().trim() === "valid").length;
  const invalid = prefixes.filter((prefix) => prefix.rpkiStatus?.toLowerCase().trim() === "invalid").length;
  const unknown = Math.max(0, prefixes.length - valid - invalid);
  const total = valid + invalid + unknown;
  const reportedPrefixes = (result.prefixes4Total ?? 0) + (result.prefixes6Total ?? 0);

  return (
    <div className="flex flex-col gap-2 border-t border-border/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {t.asnRouteHealth}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tabular-nums">
        {total > 0 ? (
          <>
            {valid > 0 && (
              <span className="inline-flex items-center gap-1.5 text-success">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                {t.asnRpkiValid} {formatNumber(valid, locale)}
              </span>
            )}
            {invalid > 0 && (
              <span className="inline-flex items-center gap-1.5 text-destructive">
                <span className="size-1.5 rounded-full bg-destructive" aria-hidden />
                {t.asnRpkiInvalid} {formatNumber(invalid, locale)}
              </span>
            )}
            {unknown > 0 && (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="size-1.5 rounded-full bg-muted-foreground/50" aria-hidden />
                {t.asnRpkiUnknown} {formatNumber(unknown, locale)}
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">{t.asnRpkiUnknown}</span>
        )}
        {reportedPrefixes > prefixes.length && (
          <span className="text-muted-foreground/75">
            {formatTemplate(t.asnLoadedOfReported, {
              loaded: formatNumber(prefixes.length, locale),
              reported: formatNumber(reportedPrefixes, locale),
            })}
          </span>
        )}
      </div>
    </div>
  );
}

function AsnMetrics({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const prefixTotal = (result.prefixes4Total ?? 0) + (result.prefixes6Total ?? 0);
  const relationTotal =
    (result.peersTotal ?? 0) + (result.upstreamsTotal ?? 0) + (result.downstreamsTotal ?? 0);
  const profile = result.peeringdb;
  const hasPrefixData = result.sources.ipinfo === "available" || result.sources.ripestat === "available";
  const hasRoutingData = result.sources.ipinfo === "available" || result.sources.ripestat === "available";
  const metrics: MetricCell[] = [
    {
      key: "ips",
      label: t.asnMetricIpv4Addresses,
      caption: t.asnMetricIpinfoDetail,
      icon: Network,
      value: result.numIps,
    },
    {
      key: "prefixes",
      label: t.asnPrefixes,
      caption: t.asnMetricAnnouncedPrefixesDetail,
      icon: Route,
      value: hasPrefixData ? prefixTotal : null,
      detail: hasPrefixData
        ? `${t.asnLabelIpv4} ${formatNumber(result.prefixes4Total, locale)} · ${t.asnLabelIpv6} ${formatNumber(result.prefixes6Total, locale)}`
        : undefined,
    },
    {
      key: "neighbours",
      label: t.asnMetricRoutingNeighbours,
      caption: t.asnMetricBgpRelationshipsDetail,
      icon: Share2,
      value: hasRoutingData ? relationTotal : null,
      detail: hasRoutingData
        ? `${t.asnRelationPeers} ${formatNumber(result.peersTotal, locale)} · ${t.asnRelationUpstreams} ${formatNumber(result.upstreamsTotal, locale)} · ${t.asnRelationDownstreams} ${formatNumber(result.downstreamsTotal, locale)}`
        : undefined,
    },
    {
      key: "ix",
      label: t.asnMetricIxPresence,
      caption: t.asnMetricPeeringDbProfileDetail,
      icon: Building2,
      value: profile ? profile.ixCount : null,
      detail: profile ? `${t.asnFacilities} ${formatNumber(profile.facilityCount, locale)}` : undefined,
    },
  ];

  return (
    <>
      <dl className="grid grid-cols-2 gap-px border-t border-border/60 bg-border/60 md:grid-cols-4">
        {metrics.map((metric) => {
          const missing = metric.value === null;
          const empty = metric.value === 0;
          return (
            <div key={metric.key} className="flex min-w-0 flex-col gap-1 bg-card p-4 sm:p-5">
              <dt className="order-2 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <metric.icon className="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
                <span className="min-w-0 break-words">{metric.label}</span>
              </dt>
              <dd
                className={cn(
                  "order-1 text-lg tracking-tight tabular-nums sm:text-xl lg:text-2xl",
                  missing && "font-normal text-muted-foreground/60",
                  empty && "font-medium text-foreground/75",
                  !missing && !empty && "font-semibold text-foreground",
                )}
              >
                {missing ? "—" : formatNumber(metric.value, locale)}
              </dd>
              {metric.detail && (
                <p className="order-3 line-clamp-2 text-[10px] leading-snug text-muted-foreground/75 sm:text-[11px]">
                  {metric.detail}
                </p>
              )}
              <p className="order-4 hidden text-[11px] leading-snug text-muted-foreground/70 lg:block">
                {metric.caption}
              </p>
            </div>
          );
        })}
      </dl>
      <RpkiHealth result={result} t={t} locale={locale} />
    </>
  );
}

export function AsnSummaryCard({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <AsnIdentity result={result} t={t} locale={locale} />
      <AsnMetrics result={result} t={t} locale={locale} />
    </Card>
  );
}
