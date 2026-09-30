"use client";

/**
 * ASN overview, read top to bottom: who the network is (organisation, ASN,
 * registry facts), how big it is (four headline figures that double as
 * shortcuts to their detail tab), then a quiet provenance strip. Everything
 * needed to understand an ASN within seconds sits in this one card; the tabs
 * below hold the detail.
 */

import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  Building2,
  CircleCheck,
  Network,
  Route,
  Share2,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import { CopyButton } from "@/components/copy-button";
import { CountryFlag } from "@/components/country-flag";
import { Card } from "@/components/ui/card";
import { formatNumber, formatTemplate } from "@/lib/format";
import { useI18n } from "@/components/i18n-provider";
import type { Locale } from "@/lib/locale-config";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import {
  countryName,
  displayUrl,
  exchangesTab,
  formatCount,
  hasRoutingSource,
  ipv4EquivalentBits,
  isCompleteProfile,
  isUrl,
  knownTotal,
  networkTypeName,
  prefixTotal,
  registryName,
  routingTotal,
  splitHolderName,
  TAB,
  type TabId,
} from "./helpers";
import { ExternalLink } from "./external-link";
import { SourceStatusList } from "./source-status";

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

interface Fact {
  key: string;
  label: string;
  value: ReactNode;
}

/**
 * Registry facts first (IPinfo), then the two PeeringDB facts that matter
 * before opening any tab. PeeringDB's website stands in for the domain when
 * IPinfo is not configured, so the row is rarely empty.
 */
function buildFacts(result: AsnProfile, t: ToolTranslation, locale: Locale): Fact[] {
  const facts: Fact[] = [];

  if (result.country) {
    const code = result.country.trim().toUpperCase();
    facts.push({
      key: "country",
      label: t.asnLabelCountry,
      value: (
        // The code flows inline after the name so a wrapped name (e.g. "Vereinigte
        // Staaten") keeps it attached instead of pushing it to the far edge.
        <span className="inline-flex min-w-0 items-start gap-2">
          <CountryFlag countryCode={code} className="mt-[3px]" />
          <span className="min-w-0 break-words">
            {countryName(code, locale)}{" "}
            <span className="font-mono text-[11px] font-medium text-muted-foreground">{code}</span>
          </span>
        </span>
      ),
    });
  }
  if (result.type) {
    facts.push({ key: "type", label: t.asnLabelType, value: networkTypeName(result.type, t) });
  }
  if (result.registry) {
    facts.push({ key: "registry", label: t.asnLabelRegistry, value: registryName(result.registry) });
  }
  if (result.allocated) {
    facts.push({
      key: "allocated",
      label: t.asnLabelAllocated,
      value: <time dateTime={result.allocated}>{formatAllocated(result.allocated, locale)}</time>,
    });
  }

  const website = result.peeringdb?.website.trim() ?? "";
  if (result.domain) {
    facts.push({
      key: "domain",
      label: t.asnLabelDomain,
      value: <ExternalLink href={`https://${result.domain}`} text={result.domain} />,
    });
  } else if (website && isUrl(website)) {
    facts.push({
      key: "website",
      label: t.asnLabelWebsite,
      value: <ExternalLink href={website} text={displayUrl(website)} />,
    });
  }

  if (result.peeringdb?.policyGeneral) {
    facts.push({
      key: "policy",
      label: t.asnProfilePolicyHeading,
      value: result.peeringdb.policyGeneral,
    });
  }
  if (result.peeringdb?.traffic) {
    facts.push({ key: "traffic", label: t.asnLabelTraffic, value: result.peeringdb.traffic });
  }

  return facts;
}

function AsnIdentity({ result, t, locale }: { result: AsnProfile; t: ToolTranslation; locale: Locale }) {
  const { core: baseT } = useI18n();
  const { handle, organisation } = splitHolderName(result.name);
  const facts = buildFacts(result, t, locale);

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2
          className={cn(
            "text-xl leading-tight font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-2xl",
            organisation ? "text-foreground" : "text-muted-foreground",
          )}
          title={handle ? result.name : undefined}
        >
          {organisation || t.asnUnnamed}
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-0.5">
            <span className="font-mono text-[15px] font-semibold text-foreground">{result.asn}</span>
            <CopyButton
              text={result.asn}
              label={t.asnCopyAsn}
              copiedLabel={baseT.copiedToClipboard}
              failedLabel={baseT.copyFailed}
              className="size-8 pointer-coarse:size-11 [&_svg]:size-3.5"
            />
          </span>
          {handle && (
            <span className="font-mono text-xs font-medium tracking-wide break-all text-muted-foreground">
              {handle}
            </span>
          )}
        </div>
      </div>

      {facts.length > 0 && (
        // Two aligned columns on phones; a wrapping row once there is room.
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5 border-t border-border/60 pt-4 sm:flex sm:flex-wrap sm:gap-x-10">
          {facts.map((fact) => (
            <div key={fact.key} className="flex max-w-full min-w-0 flex-col gap-1">
              <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {fact.label}
              </dt>
              <dd className="text-sm font-medium text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

interface Metric {
  key: string;
  label: string;
  icon: LucideIcon;
  /** null renders as an em dash (data unavailable rather than zero). */
  value: number | null;
  caption: ReactNode;
  /** Detail tab this figure is the summary of. */
  target: TabId;
}

function RelationSplit({ result, t, locale }: { result: AsnProfile; t: ToolTranslation; locale: Locale }) {
  const parts = [
    { key: "up", icon: ArrowUp, label: t.asnRelationUpstreams, value: result.upstreamsTotal },
    { key: "peer", icon: ArrowLeftRight, label: t.asnRelationPeers, value: result.peersTotal },
    { key: "down", icon: ArrowDown, label: t.asnRelationDownstreams, value: result.downstreamsTotal },
  ];

  return (
    <span className="inline-flex flex-wrap gap-x-2 gap-y-0.5">
      {parts.map((part) => (
        <span
          key={part.key}
          className="inline-flex items-center gap-0.5"
          title={`${part.label}: ${formatNumber(part.value, locale)}`}
        >
          <part.icon className="size-3 shrink-0 opacity-70" aria-hidden />
          <span className="sr-only">{part.label}</span>
          {formatNumber(part.value, locale)}
        </span>
      ))}
    </span>
  );
}

function AsnMetrics({
  result,
  t,
  locale,
  onNavigate,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
  onNavigate?: (tab: TabId) => void;
}) {
  // Prefixes and neighbours only come from IPinfo or RIPEstat. When neither
  // answered, a zero would claim "none announced" — show unavailable instead.
  const routingSourceAvailable = hasRoutingSource(result);
  const prefixes = prefixTotal(result);
  const neighbours = routingTotal(result);
  const bits = ipv4EquivalentBits(result.numIps);

  const metrics: Metric[] = [
    {
      key: "ips",
      label: t.asnMetricIpv4Addresses,
      icon: Network,
      value: result.numIps,
      target: TAB.prefixes,
      caption:
        bits !== null
          ? formatTemplate(t.asnMetricIpv4Equivalent, { bits })
          : result.numIps === null
            ? result.sources.ipinfo === "not_configured"
              ? t.asnMetricRequiresIpinfo
              : t.asnMetricNotReported
            : null,
    },
    {
      key: "prefixes",
      label: t.asnPrefixes,
      icon: Route,
      value: knownTotal(result, prefixes),
      target: TAB.prefixes,
      caption:
        prefixes > 0 ? (
          <>
            {formatNumber(result.prefixes4Total, locale)} {t.asnLabelIpv4}
            <span aria-hidden className="px-1 text-muted-foreground/50">
              ·
            </span>
            {formatNumber(result.prefixes6Total, locale)} {t.asnLabelIpv6}
          </>
        ) : routingSourceAvailable ? null : (
          t.asnMetricNotReported
        ),
    },
    {
      key: "neighbours",
      label: t.asnMetricRoutingNeighbours,
      icon: Share2,
      value: knownTotal(result, neighbours),
      target: TAB.routing,
      caption:
        neighbours > 0 ? (
          <RelationSplit result={result} t={t} locale={locale} />
        ) : routingSourceAvailable ? null : (
          t.asnMetricNotReported
        ),
    },
    {
      key: "ix",
      label: t.asnMetricIxPresence,
      icon: Building2,
      value: result.peeringdb ? result.peeringdb.ixCount || 0 : null,
      target: exchangesTab(result),
      caption: result.peeringdb
        ? formatCount(t.asnFacilityCount, result.peeringdb.facilityCount || 0, locale)
        : t.asnMetricNoPeeringDb,
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-px border-t border-border/60 bg-border/60 md:grid-cols-4">
      {metrics.map((metric) => {
        const missing = metric.value === null;
        const empty = metric.value === 0;
        // Each cell spans three subgrid rows (label, value, caption) so
        // values stay on one line across a band even when a label wraps.
        const cell =
          "row-span-3 grid min-w-0 grid-rows-subgrid gap-y-1 bg-card px-5 py-3.5 text-start sm:px-6 sm:py-4";
        const body = (
          <>
            <span className="flex min-w-0 items-start gap-1.5 self-end text-xs font-medium text-muted-foreground">
              <metric.icon className="mt-px size-3.5 shrink-0 opacity-70" aria-hidden />
              <span className="min-w-0 break-words">{metric.label}</span>
            </span>
            <span
              className={cn(
                "block text-xl leading-tight tracking-tight tabular-nums sm:text-2xl",
                missing && "font-normal text-muted-foreground/60",
                empty && "font-medium text-foreground/60",
                !missing && !empty && "font-semibold text-foreground",
              )}
            >
              {missing ? "—" : formatNumber(metric.value, locale)}
            </span>
            {metric.caption ? (
              <span className="block text-[11px] leading-snug text-muted-foreground tabular-nums">
                {metric.caption}
              </span>
            ) : (
              <span aria-hidden />
            )}
          </>
        );

        return (
          <li key={metric.key} className="row-span-3 grid grid-rows-subgrid">
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate(metric.target)}
                className={cn(
                  cell,
                  "cursor-pointer outline-none transition-colors duration-150 hover:bg-muted focus-visible:relative focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset",
                )}
              >
                {body}
              </button>
            ) : (
              <div className={cell}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function AsnProvenance({ result, t }: { result: AsnProfile; t: ToolTranslation }) {
  const complete = isCompleteProfile(result);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 bg-muted/30 px-5 py-2.5 text-xs sm:px-6">
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground/85">
        {complete ? (
          <CircleCheck className="size-3.5 text-success" aria-hidden />
        ) : (
          <TriangleAlert className="size-3.5 text-warning" aria-hidden />
        )}
        {complete ? t.asnCompleteData : t.asnPartialData}
      </span>
      <span aria-hidden className="hidden h-3.5 w-px bg-border sm:block" />
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
        <span className="text-muted-foreground">{t.asnSourcesLabel}</span>
        <SourceStatusList sources={result.sources} t={t} />
      </div>
    </div>
  );
}

export function AsnSummaryCard({
  result,
  t,
  locale,
  onNavigate,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
  /** Makes each headline figure a shortcut to its detail tab. */
  onNavigate?: (tab: TabId) => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <AsnIdentity result={result} t={t} locale={locale} />
      <AsnMetrics result={result} t={t} locale={locale} onNavigate={onNavigate} />
      <AsnProvenance result={result} t={t} />
    </Card>
  );
}
