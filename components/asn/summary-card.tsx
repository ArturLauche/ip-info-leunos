"use client";

/**
 * ASN overview: the identity block (ASN, name, geography, provenance) followed
 * by a hairline-divided metrics band. Everything a user needs to understand an
 * ASN within seconds sits in this one card; details live in the tabs below.
 */

import type { ReactNode } from "react";
import {
  AlertTriangle,
  Building2,
  Globe,
  Network,
  Route,
  Share2,
  Waypoints,
} from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import { CountryFlag } from "@/components/country-flag";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";

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

function DataCompletenessBadge({ complete, t }: { complete: boolean; t: ToolTranslation }) {
  // Deliberately quiet (outline + status dot): the badge explains the data, it
  // must never compete with the ASN identity beside it.
  return complete ? (
    <Badge variant="outline" className="gap-1.5 border-success/40 text-success">
      <span className="size-1.5 rounded-full bg-success" aria-hidden />
      {t.asnCompleteData}
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1.5 border-warning/50 text-warning">
      <AlertTriangle className="size-3" aria-hidden />
      {t.asnPartialData}
    </Badge>
  );
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
  const complete =
    result.sources.ipinfo === "available" &&
    result.sources.peeringdb === "available" &&
    result.sources.ripestat === "available" &&
    result.warnings.length === 0;

  const meta: ReactNode[] = [];
  if (result.country) {
    meta.push(
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground/75">
        <CountryFlag countryCode={result.country} />
        {result.country}
      </span>,
    );
  }
  if (result.type) {
    // IPinfo reports lowercase categories ("content", "transit"); present them
    // as proper nouns so the metadata line reads like prose.
    const type = result.type.charAt(0).toUpperCase() + result.type.slice(1);
    meta.push(<span className="break-words">{type}</span>);
  }
  if (result.registry) meta.push(<span className="break-words">{result.registry.toUpperCase()}</span>);
  if (result.allocated) {
    meta.push(
      <span className="break-words">
        {t.asnLabelAllocated} {formatAllocated(result.allocated, locale)}
      </span>,
    );
  }

  return (
    <div className="flex flex-col gap-3.5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 sm:size-10">
            <Waypoints className="size-4 sm:size-5" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="font-mono text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {result.asn}
            </h2>
            <p className="text-[0.95rem] leading-snug font-medium break-words text-foreground/90 sm:text-base">
              {result.name || t.asnUnnamed}
            </p>
          </div>
        </div>
        <DataCompletenessBadge complete={complete} t={t} />
      </div>

      {(meta.length > 0 || result.domain) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-12 text-[13px] leading-relaxed text-muted-foreground sm:pl-13">
          {meta.map((entry, index) => (
            <span key={index} className="inline-flex min-w-0 items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-muted-foreground/40">
                  ·
                </span>
              )}
              {entry}
            </span>
          ))}
          {result.domain && (
            <span className="inline-flex min-w-0 items-center gap-2">
              {meta.length > 0 && (
                <span aria-hidden="true" className="text-muted-foreground/40">
                  ·
                </span>
              )}
              <a
                href={`https://${result.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 items-center gap-1.5 rounded-sm font-medium break-all text-primary outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <Globe className="size-3.5 shrink-0" aria-hidden />
                {result.domain}
              </a>
            </span>
          )}
        </div>
      )}
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
      value: (result.prefixes4Total || 0) + (result.prefixes6Total || 0),
    },
    {
      key: "neighbours",
      label: t.asnMetricRoutingNeighbours,
      caption: t.asnMetricBgpRelationshipsDetail,
      icon: Share2,
      value:
        (result.peersTotal || 0) + (result.upstreamsTotal || 0) + (result.downstreamsTotal || 0),
    },
    {
      key: "ix",
      label: t.asnMetricIxPresence,
      caption: t.asnMetricPeeringDbProfileDetail,
      icon: Building2,
      value: result.peeringdb ? result.peeringdb.ixCount || 0 : null,
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px border-t border-border/60 bg-border/60 md:grid-cols-4">
      {metrics.map((metric) => {
        const missing = metric.value === null;
        const empty = metric.value === 0;
        return (
          <div key={metric.key} className="flex min-w-0 flex-col gap-1 bg-card p-4 sm:p-5">
            {/* Value leads visually (strong number hierarchy, immune to label
                wrapping); the DOM keeps dt before dd for assistive tech. */}
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
            <p className="order-3 hidden text-[11px] leading-snug text-muted-foreground/70 lg:block">
              {metric.caption}
            </p>
          </div>
        );
      })}
    </dl>
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
