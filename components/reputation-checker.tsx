"use client";

import { useMemo, useState, type ReactNode } from "react";
import { type Locale, getTranslation } from "@/lib/i18n";
import { ApiClientError } from "@/lib/api/client";
import { getApiErrorMessage, getToolTranslation, type ToolTranslation } from "@/lib/tool-i18n";
import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { formatNumber, formatTemplate } from "@/lib/format";
import { CountryFlag } from "@/components/country-flag";
import { getReputationSource } from "@/lib/reputation/model";
import type {
  EvidenceCategory,
  EvidenceItem,
  EvidenceSeverity,
  ReputationSummary,
  RiskLevel,
  SourceStatus,
} from "@/lib/reputation/model";
import {
  ChevronDown,
  Flag,
  ListChecks,
  MapPin,
  Network,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ToolT = ToolTranslation;

interface ReputationCheckerProps {
  locale: Locale;
  initialIp?: string;
}

const MAIL_SECTION_CATEGORIES = new Set<EvidenceCategory>([
  "mail_policy",
  "mail_reputation",
  "spam_observed",
]);

const NETWORK_SECTION_CATEGORIES = new Set<EvidenceCategory>([
  "vpn",
  "tor",
  "hosting",
  "residential",
  "mobile",
  "benign_service",
]);

const SEVERITY_ORDER: Record<EvidenceSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

function sortEvidence(items: EvidenceItem[]) {
  return [...items].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.points - a.points,
  );
}

function riskVariant(level: RiskLevel): "destructive" | "warning" | "success" {
  if (level === "high") return "destructive";
  if (level === "medium") return "warning";
  return "success";
}

function riskLabel(level: RiskLevel, t: ToolT) {
  if (level === "high") return t.reputationRiskHigh;
  if (level === "medium") return t.reputationRiskMedium;
  return t.reputationRiskLow;
}

function headlineLabel(summary: ReputationSummary, t: ToolT) {
  if (summary.headline === "no_malicious_activity") return t.reputationHeadlineClean;
  return riskLabel(summary.level, t);
}

function RiskIcon({ level }: { level: RiskLevel }) {
  if (level === "high") return <ShieldAlert className="size-6 text-destructive" />;
  if (level === "medium") return <Shield className="size-6 text-warning" />;
  return <ShieldCheck className="size-6 text-success" />;
}

function categoryLabel(category: EvidenceCategory, t: ToolT) {
  return t.reputationCategories[category] ?? category;
}

function severityLabel(severity: EvidenceSeverity, t: ToolT) {
  return t.reputationSeverities[severity] ?? severity;
}

function severityVariant(severity: EvidenceSeverity): "destructive" | "warning" | "secondary" {
  if (severity === "critical" || severity === "high") return "destructive";
  if (severity === "medium") return "warning";
  return "secondary";
}

function sourceName(sourceId: string) {
  return getReputationSource(sourceId)?.name ?? sourceId;
}

function reasonText(item: EvidenceItem, t: ToolT) {
  return t.reputationReasons[item.reason] ?? categoryLabel(item.category, t);
}

function stateLabel(status: SourceStatus, t: ToolT) {
  return t.reputationSourceStates[status] ?? status;
}

function stateVariant(status: SourceStatus): "destructive" | "warning" | "success" | "info" | "secondary" {
  if (status === "matched") return "destructive";
  if (status === "policy_listed") return "warning";
  if (status === "clean") return "success";
  if (status === "available") return "info";
  return "secondary";
}

function formatDateTime(iso: string | null | undefined, locale: Locale) {
  if (!iso) return null;
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function errorMessage(error: unknown, t: ToolT) {
  if (error instanceof ApiClientError) {
    if (error.code === "bad_request" || error.code === "invalid_target") return t.reputationInvalidIp;
    if (error.code === "target_blocked") return t.reputationBlockedIp;
    if (error.code === "rate_limited") return t.reputationRateLimitError;
  }

  return getApiErrorMessage(error, t, t.reputationNetworkError);
}

function CardHeader({ icon: Icon, title }: { icon: typeof Shield; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3">
      <Icon className="size-4 text-primary" aria-hidden="true" />
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-all text-foreground">{value}</span>
    </div>
  );
}

function EvidenceCard({ item, t, locale }: { item: EvidenceItem; t: ToolT; locale: Locale }) {
  const firstSeen = formatDateTime(item.firstSeen, locale);
  const lastSeen = formatDateTime(item.lastSeen, locale);
  const confidence = item.confidence !== null ? `${formatNumber(item.confidence, locale)}%` : null;

  return (
    <div className="flex flex-col gap-2 border-b px-5 py-4 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">
          {categoryLabel(item.category, t)}
        </p>
        <span className="inline-flex items-center gap-2">
          <Badge variant={severityVariant(item.severity)}>{severityLabel(item.severity, t)}</Badge>
          {item.points > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">
              +{formatNumber(item.points, locale)}
            </span>
          )}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-foreground">{reasonText(item, t)}</p>

      <div className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-md bg-muted/30 px-3 py-2.5 sm:grid-cols-2">
        <MetaRow label={t.reputationFieldSource} value={sourceName(item.sourceId)} />
        {confidence !== null && <MetaRow label={t.reputationFieldConfidence} value={confidence} />}
        {firstSeen !== null && <MetaRow label={t.reputationFieldFirstSeen} value={firstSeen} />}
        {lastSeen !== null && <MetaRow label={t.reputationFieldLastSeen} value={lastSeen} />}
        {typeof item.reportCount === "number" && (
          <MetaRow
            label={t.reputationFieldReports}
            value={formatNumber(item.reportCount, locale)}
          />
        )}
        {typeof item.attackCount === "number" && (
          <MetaRow
            label={t.reputationFieldAttacks}
            value={formatNumber(item.attackCount, locale)}
          />
        )}
        {item.malwareFamily && <MetaRow label={t.reputationFieldMalware} value={item.malwareFamily} />}
        {item.detail && <MetaRow label={t.reputationFieldDetail} value={item.detail} />}
        {item.raw && <MetaRow label={t.reputationFieldReturnCode} value={<span className="font-mono">{item.raw}</span>} />}
      </div>
    </div>
  );
}

function ContextCell({
  icon: Icon,
  label,
  primary,
  secondary,
}: {
  icon: typeof Shield;
  label: string;
  primary: ReactNode;
  secondary?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-primary" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-1.5 text-sm font-semibold break-words text-foreground">{primary}</p>
      {secondary && (
        <p className="mt-0.5 text-xs break-words text-muted-foreground">{secondary}</p>
      )}
    </div>
  );
}

type EvidenceFilter = "all" | "threats" | "mail" | "network";

function filterEvidence(items: EvidenceItem[], filter: EvidenceFilter) {
  if (filter === "mail") {
    return items.filter((item) => MAIL_SECTION_CATEGORIES.has(item.category));
  }
  if (filter === "network") {
    return items.filter((item) => NETWORK_SECTION_CATEGORIES.has(item.category));
  }
  if (filter === "threats") {
    return items.filter(
      (item) =>
        !MAIL_SECTION_CATEGORIES.has(item.category) &&
        !NETWORK_SECTION_CATEGORIES.has(item.category),
    );
  }
  return items;
}

/** Sums score contributions per source so each source row can carry its
 *  points inline (replacing the separate score-breakdown card). Aggregation
 *  bonuses apply across sources and are reported separately below the list.
 */
function pointsBySource(contributions: ReputationSummary["contributions"]) {
  const totals = new Map<string, number>();
  for (const contribution of contributions) {
    if (contribution.sourceId === "aggregation") continue;
    totals.set(contribution.sourceId, (totals.get(contribution.sourceId) ?? 0) + contribution.points);
  }
  return totals;
}

function SourceRow({
  sourceId,
  status,
  points,
  t,
  locale,
}: {
  sourceId: string;
  status: SourceStatus;
  points: number | undefined;
  t: ToolT;
  locale: Locale;
}) {
  const definition = getReputationSource(sourceId);
  const description = definition ? t.reputationSourceDescriptions[sourceId] : undefined;

  return (
    <li className="flex flex-col gap-1 border-b px-5 py-3 last:border-b-0">
      <span className="flex items-center justify-between gap-2">
        <span className="min-w-0 text-sm font-medium text-foreground">
          {definition?.name ?? sourceId}
          {points ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
              +{formatNumber(points, locale)}
            </span>
          ) : null}
        </span>
        <Badge variant={stateVariant(status)} className="shrink-0">
          {stateLabel(status, t)}
        </Badge>
      </span>
      {description && (
        <span className="text-xs leading-relaxed text-muted-foreground">{description}</span>
      )}
    </li>
  );
}

export function ReputationChecker({ locale, initialIp = "" }: ReputationCheckerProps) {
  const t = getToolTranslation(locale);
  const baseT = getTranslation(locale);
  const [filter, setFilter] = useState<EvidenceFilter>("all");
  const [showHiddenSources, setShowHiddenSources] = useState(false);

  const { loading, error, result, run } = useToolLookup<ReputationSummary>({
    buildApiUrl: (ip) => `/api/reputation?ip=${encodeURIComponent(ip)}`,
    buildHref: (ip) => `/reputation?ip=${encodeURIComponent(ip)}`,
    mapError: (checkError) => errorMessage(checkError, t),
    initialQuery: initialIp,
    onStart: () => {
      setFilter("all");
      setShowHiddenSources(false);
    },
  });

  const evidenceGroups = useMemo(() => {
    if (!result) return null;
    const sorted = sortEvidence(result.evidence);
    return {
      all: sorted,
      threats: filterEvidence(sorted, "threats"),
      mail: filterEvidence(sorted, "mail"),
      network: filterEvidence(sorted, "network"),
    };
  }, [result]);

  const sourcePoints = useMemo(
    () => (result ? pointsBySource(result.contributions) : new Map<string, number>()),
    [result],
  );

  const aggregationNotes = useMemo(
    () => result?.contributions.filter((c) => c.sourceId === "aggregation") ?? [],
    [result],
  );

  // Sources without a configured key never contribute evidence; keep them
  // collapsed behind a toggle so the list shows what was actually checked.
  const { activeSources, hiddenSources } = useMemo(() => {
    const active: ReputationSummary["sources"] = [];
    const hidden: ReputationSummary["sources"] = [];
    for (const source of result?.sources ?? []) {
      if (source.status === "not_configured") hidden.push(source);
      else active.push(source);
    }
    return { activeSources: active, hiddenSources: hidden };
  }, [result]);

  const visibleEvidence = evidenceGroups ? evidenceGroups[filter] : [];

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={initialIp}
        placeholder={t.reputationPlaceholder}
        submitLabel={t.reputationCheckButton}
        loadingLabel={t.reputationChecking}
        loading={loading}
        onSubmit={run}
      />

      {!loading && !error && !result && (
        <EmptyState
          icon={ShieldAlert}
          title={t.reputationEmptyTitle}
          description={t.reputationEmptyDescription}
        />
      )}

      {loading && (
        <div className="flex flex-col gap-6" role="status" aria-busy="true">
          <span className="sr-only">{t.reputationChecking}</span>
          <Skeleton className="h-28 rounded-xl" aria-hidden="true" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-xl" aria-hidden="true" />
          <Skeleton className="h-48 rounded-xl" aria-hidden="true" />
        </div>
      )}

      {error && <ErrorPanel message={error} />}

      {result && evidenceGroups && (
        <div className="tool-reveal flex flex-col gap-6">
          {/* Verdict */}
          <Card className="gap-3 py-5">
            <div className="flex flex-wrap items-center gap-3 px-5">
              <RiskIcon level={result.level} />
              <p className="font-mono text-lg font-semibold break-all text-foreground">
                {result.ip}
              </p>
              <Badge variant={riskVariant(result.level)} className="uppercase">
                {headlineLabel(result, t)}
              </Badge>
            </div>
            <div className="flex flex-col gap-1.5 px-5">
              {result.contextCategories.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {result.contextCategories.map((category) => categoryLabel(category, t)).join(" · ")}
                </p>
              )}
              <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">
                  {t.reputationScoreLabel}: {result.score}/100
                </span>
                <span>
                  {formatTemplate(t.reputationCoverageChecked, {
                    count: result.coverage.checkedCount,
                  })}
                </span>
                {result.coverage.matchedCount > 0 && (
                  <span>
                    {formatTemplate(t.reputationCoverageMatched, {
                      count: result.coverage.matchedCount,
                    })}
                  </span>
                )}
                {result.coverage.unavailableCount > 0 && (
                  <span>
                    {formatTemplate(t.reputationCoverageUnavailable, {
                      count: result.coverage.unavailableCount,
                    })}
                  </span>
                )}
                <span>
                  {formatTemplate(t.reputationGeneratedAt, {
                    time: formatDateTime(result.checkedAt, locale) ?? result.checkedAt,
                  })}
                </span>
              </p>
            </div>
          </Card>

          {/* Context */}
          <Card className="p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ContextCell
                icon={MapPin}
                label={t.reputationGeoLabel}
                primary={
                  result.geo ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CountryFlag countryCode={result.geo.countryCode} />
                      <span className="min-w-0">
                        {[result.geo.city, result.geo.country].filter(Boolean).join(", ") || "-"}
                      </span>
                    </span>
                  ) : (
                    "-"
                  )
                }
                secondary={result.geo?.region || undefined}
              />
              <ContextCell
                icon={Waypoints}
                label={t.reputationNetworkLabel}
                primary={result.network?.as || "-"}
                secondary={result.network?.isp || result.network?.org || undefined}
              />
              <ContextCell
                icon={Network}
                label={t.reputationConnectionLabel}
                primary={
                  result.networkContext
                    ? baseT.connectionTypes[result.networkContext.connectionType]
                    : "-"
                }
                secondary={result.networkContext?.reverse || undefined}
              />
              <ContextCell
                icon={ListChecks}
                label={t.reputationSectionSources}
                primary={formatTemplate(t.reputationCoverageChecked, {
                  count: result.coverage.checkedCount,
                })}
                secondary={
                  result.coverage.matchedCount > 0
                    ? formatTemplate(t.reputationCoverageMatched, {
                        count: result.coverage.matchedCount,
                      })
                    : result.coverage.policyCount > 0
                      ? formatTemplate(t.reputationCoveragePolicy, {
                          count: result.coverage.policyCount,
                        })
                      : undefined
                }
              />
            </div>
          </Card>

          {/* Evidence with filter */}
          <Card className="gap-0 overflow-hidden py-0">
            <CardHeader icon={ListChecks} title={t.reputationSectionSummary} />
            <div className="border-b px-5 py-3">
              <Tabs
                value={filter}
                onValueChange={(value) => setFilter(value as EvidenceFilter)}
              >
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
                  <TabsTrigger value="all">
                    {t.reputationFilterAll} ({formatNumber(evidenceGroups.all.length, locale)})
                  </TabsTrigger>
                  <TabsTrigger value="threats">
                    {t.reputationSectionThreats} ({formatNumber(evidenceGroups.threats.length, locale)})
                  </TabsTrigger>
                  <TabsTrigger value="mail">
                    {t.reputationSectionMail} ({formatNumber(evidenceGroups.mail.length, locale)})
                  </TabsTrigger>
                  <TabsTrigger value="network">
                    {t.reputationSectionNetwork} ({formatNumber(evidenceGroups.network.length, locale)})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-col">
              {visibleEvidence.length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted-foreground">
                  {filter === "threats"
                    ? t.reputationNoThreatEvidence
                    : filter === "mail"
                      ? t.reputationNoMailEvidence
                      : t.reputationNoEvidence}
                </p>
              ) : (
                visibleEvidence.map((item, index) => (
                  <EvidenceCard
                    key={`${item.sourceId}-${item.reason}-${index}`}
                    item={item}
                    t={t}
                    locale={locale}
                  />
                ))
              )}
            </div>
          </Card>

          {/* Sources */}
          <Card className="gap-0 overflow-hidden py-0">
            <CardHeader icon={Flag} title={t.reputationSectionSources} />
            <ul className="flex flex-col">
              {activeSources.map((source) => (
                <SourceRow
                  key={source.id}
                  sourceId={source.id}
                  status={source.status}
                  points={sourcePoints.get(source.id)}
                  t={t}
                  locale={locale}
                />
              ))}
            </ul>
            {hiddenSources.length > 0 && (
              <div className="border-t">
                {showHiddenSources && (
                  <ul className="flex flex-col border-b">
                    {hiddenSources.map((source) => (
                      <SourceRow
                        key={source.id}
                        sourceId={source.id}
                        status={source.status}
                        points={sourcePoints.get(source.id)}
                        t={t}
                        locale={locale}
                      />
                    ))}
                  </ul>
                )}
                <div className="px-5 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-expanded={showHiddenSources}
                    onClick={() => setShowHiddenSources((value) => !value)}
                  >
                    <ChevronDown
                      className={`size-4 transition-transform ${showHiddenSources ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                    {showHiddenSources
                      ? t.reputationHideHiddenSources
                      : formatTemplate(t.reputationShowHiddenSources, {
                          count: hiddenSources.length,
                        })}
                  </Button>
                </div>
              </div>
            )}
            {aggregationNotes.length > 0 && (
              <div className="border-t px-5 py-3">
                {aggregationNotes.map((note, index) => (
                  <p
                    key={`${note.reason}-${index}`}
                    className="text-xs leading-relaxed text-muted-foreground"
                  >
                    {t.reputationReasons[note.reason] ?? note.reason}{" "}
                    <span className="tabular-nums">+{formatNumber(note.points, locale)}</span>
                  </p>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
