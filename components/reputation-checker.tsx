"use client";

import { type ReactNode } from "react";
import { type Locale, getTranslation } from "@/lib/i18n";
import { ApiClientError } from "@/lib/api/client";
import { getApiErrorMessage, getToolTranslation, type ToolTranslation } from "@/lib/tool-i18n";
import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertTriangle,
  Flag,
  Gauge,
  ListChecks,
  Mail,
  MapPin,
  Network,
  Radar,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Waypoints,
} from "lucide-react";

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

function severityClass(severity: EvidenceSeverity) {
  if (severity === "critical" || severity === "high") return "text-destructive";
  if (severity === "medium") return "text-warning";
  return "text-muted-foreground";
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

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Shield;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
        <Icon className="size-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      </div>
      <div className="flex flex-col">{children}</div>
    </Card>
  );
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs">
      <span className="font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="break-words text-foreground">{value}</span>
    </div>
  );
}

function EvidenceCard({ item, t, locale }: { item: EvidenceItem; t: ToolT; locale: Locale }) {
  const firstSeen = formatDateTime(item.firstSeen, locale);
  const lastSeen = formatDateTime(item.lastSeen, locale);
  const confidence = item.confidence !== null ? `${formatNumber(item.confidence, locale)}%` : null;

  return (
    <div className="flex flex-col gap-2 border-b px-4 py-4 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
          {categoryLabel(item.category, t)}
        </p>
        <p className={`font-mono text-xs ${severityClass(item.severity)}`}>
          {severityLabel(item.severity, t)}
          {item.points > 0 ? ` · +${formatNumber(item.points, locale)}` : ""}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-foreground">{reasonText(item, t)}</p>

      <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
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

function StatCard({
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
    <Card className="gap-2 py-4">
      <div className="flex items-center gap-2 px-4 text-muted-foreground">
        <Icon className="size-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <div className="px-4">
        <p className="text-sm font-semibold break-words text-foreground">{primary}</p>
        {secondary && (
          <p className="mt-0.5 text-xs break-words text-muted-foreground">{secondary}</p>
        )}
      </div>
    </Card>
  );
}

export function ReputationChecker({ locale, initialIp = "" }: ReputationCheckerProps) {
  const t = getToolTranslation(locale);
  const baseT = getTranslation(locale);

  const { loading, error, result, run } = useToolLookup<ReputationSummary>({
    buildApiUrl: (ip) => `/api/reputation?ip=${encodeURIComponent(ip)}`,
    buildHref: (ip) => `/reputation?ip=${encodeURIComponent(ip)}`,
    mapError: (checkError) => errorMessage(checkError, t),
    initialQuery: initialIp,
  });

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
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-xl" />
        </div>
      )}

      {error && <ErrorPanel message={error} />}

      {result && (
        <div className="tool-reveal flex flex-col gap-4">
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
            <div className="flex flex-col gap-1 px-5">
              <p className="text-sm font-medium text-foreground">{headlineLabel(result, t)}</p>
              {result.contextCategories.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {result.contextCategories.map((category) => categoryLabel(category, t)).join(" · ")}
                </p>
              )}
              <p className="font-mono text-xs text-muted-foreground">
                {t.reputationScoreLabel}: {result.score}/100 ·{" "}
                {formatTemplate(t.reputationCoverageChecked, {
                  count: result.coverage.checkedCount,
                })}
                {result.coverage.matchedCount > 0 &&
                  ` · ${formatTemplate(t.reputationCoverageMatched, {
                    count: result.coverage.matchedCount,
                  })}`}
                {result.coverage.unavailableCount > 0 &&
                  ` · ${formatTemplate(t.reputationCoverageUnavailable, {
                    count: result.coverage.unavailableCount,
                  })}`}{" "}
                · {formatTemplate(t.reputationGeneratedAt, {
                  time: formatDateTime(result.checkedAt, locale) ?? result.checkedAt,
                })}
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
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
            <StatCard
              icon={Waypoints}
              label={t.reputationNetworkLabel}
              primary={result.network?.as || "-"}
              secondary={result.network?.isp || result.network?.org || undefined}
            />
            <StatCard
              icon={Network}
              label={t.reputationConnectionLabel}
              primary={
                result.networkContext
                  ? baseT.connectionTypes[result.networkContext.connectionType]
                  : "-"
              }
              secondary={result.networkContext?.reverse || undefined}
            />
            <StatCard
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

          <SectionCard icon={Radar} title={t.reputationSectionThreats}>
            {(() => {
              const items = sortEvidence(
                result.evidence.filter(
                  (item) =>
                    !MAIL_SECTION_CATEGORIES.has(item.category) &&
                    !NETWORK_SECTION_CATEGORIES.has(item.category),
                ),
              );
              if (items.length === 0) {
                return (
                  <p className="px-4 py-4 text-sm text-muted-foreground">
                    {t.reputationNoThreatEvidence}
                  </p>
                );
              }
              return items.map((item, index) => (
                <EvidenceCard key={`${item.sourceId}-${item.reason}-${index}`} item={item} t={t} locale={locale} />
              ));
            })()}
          </SectionCard>

          <SectionCard icon={Mail} title={t.reputationSectionMail}>
            {(() => {
              const items = sortEvidence(
                result.evidence.filter((item) => MAIL_SECTION_CATEGORIES.has(item.category)),
              );
              if (items.length === 0) {
                return (
                  <p className="px-4 py-4 text-sm text-muted-foreground">
                    {t.reputationNoMailEvidence}
                  </p>
                );
              }
              return items.map((item, index) => (
                <EvidenceCard key={`${item.sourceId}-${item.reason}-${index}`} item={item} t={t} locale={locale} />
              ));
            })()}
          </SectionCard>

          <SectionCard icon={Network} title={t.reputationSectionNetwork}>
            {(() => {
              const items = sortEvidence(
                result.evidence.filter((item) => NETWORK_SECTION_CATEGORIES.has(item.category)),
              );
              return (
                <>
                  {items.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-muted-foreground">-</p>
                  ) : (
                    items.map((item, index) => (
                      <div
                        key={`${item.sourceId}-${item.reason}-${index}`}
                        className="flex flex-col gap-1 border-b px-4 py-3 last:border-b-0"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {categoryLabel(item.category, t)}
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {reasonText(item, t)}
                        </p>
                      </div>
                    ))
                  )}
                </>
              );
            })()}
          </SectionCard>

          {result.contributions.length > 0 && (
            <SectionCard icon={Gauge} title={t.reputationSectionScore}>
              {result.contributions.map((contribution, index) => (
                <div
                  key={`${contribution.sourceId}-${contribution.reason}-${index}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-2.5 last:border-b-0"
                >
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">
                      {contribution.sourceId === "aggregation"
                        ? t.reputationReasons[contribution.reason]
                        : `${sourceName(contribution.sourceId)} — ${categoryLabel(contribution.category, t)}`}
                    </span>
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    +{formatNumber(contribution.points, locale)}
                  </p>
                </div>
              ))}
            </SectionCard>
          )}

          <SectionCard icon={Flag} title={t.reputationSectionSources}>
            <Table>
              <TableHeader className="sr-only">
                <TableRow>
                  <TableHead>{t.reputationFieldSource}</TableHead>
                  <TableHead>{t.reputationStatusHeader}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.sources.map((source) => {
                  const definition = getReputationSource(source.id);
                  const description = definition
                    ? t.reputationSourceDescriptions[source.id]
                    : undefined;
                  return (
                    <TableRow key={source.id}>
                      <TableCell className="py-3">
                        <p className="text-sm font-medium text-foreground">
                          {definition?.name ?? source.id}
                        </p>
                        {description && (
                          <p className="mt-0.5 hidden max-w-xl text-xs leading-relaxed text-muted-foreground md:block">
                            {description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <Badge variant={stateVariant(source.status)}>{stateLabel(source.status, t)}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SectionCard>

          <Alert variant="info">
            <AlertTriangle />
            <AlertDescription>{t.reputationDisclaimer}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
