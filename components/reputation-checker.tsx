"use client";

import { type Locale } from "@/lib/i18n";
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
import { formatTemplate, getCountryFlag } from "@/lib/format";
import type { ReputationSummary, RiskLevel, ThreatCategory } from "@/lib/reputation";
import {
  AlertTriangle,
  Flag,
  ListX,
  MapPin,
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

function RiskIcon({ level }: { level: RiskLevel }) {
  if (level === "high") return <ShieldAlert className="size-6 text-destructive" />;
  if (level === "medium") return <Shield className="size-6 text-warning" />;
  return <ShieldCheck className="size-6 text-success" />;
}

function categoryLabel(category: ThreatCategory, t: ToolT) {
  const labels: Record<ThreatCategory, string> = {
    proxy_vpn: t.reputationThreatProxy,
    tor: t.reputationThreatTor,
    hosting: t.reputationThreatHosting,
    spam_source: t.reputationThreatSpam,
    botnet: t.reputationThreatBotnet,
    abuse_reported: t.reputationThreatAbuse,
  };
  return labels[category];
}

function errorMessage(error: unknown, t: ToolT) {
  if (error instanceof ApiClientError) {
    if (error.code === "bad_request" || error.code === "invalid_target") return t.reputationInvalidIp;
    if (error.code === "target_blocked") return t.reputationBlockedIp;
    if (error.code === "rate_limited") return t.reputationRateLimitError;
  }

  return getApiErrorMessage(error, t, t.reputationNetworkError);
}

function StatCard({
  icon: Icon,
  label,
  primary,
  secondary,
}: {
  icon: typeof Shield;
  label: string;
  primary: string;
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

  const { loading, error, result, run } = useToolLookup<ReputationSummary>({
    buildApiUrl: (ip) => `/api/reputation?ip=${encodeURIComponent(ip)}`,
    buildHref: (ip) => `/reputation?ip=${encodeURIComponent(ip)}`,
    mapError: (checkError) => errorMessage(checkError, t),
    initialQuery: initialIp,
  });

  const abuseSummary = (summary: ReputationSummary) => {
    if (summary.abuse.status === "not_configured") return t.reputationAbuseNotConfigured;
    if (summary.abuse.status === "unavailable") return t.reputationAbuseUnavailable;
    return formatTemplate(t.reputationAbuseReports, { count: summary.abuse.totalReports ?? 0 });
  };

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
          <Skeleton className="h-24 rounded-xl" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {error && <ErrorPanel message={error} />}

      {result && (
        <div className="flex flex-col gap-4 duration-300 animate-in fade-in slide-in-from-bottom-2">
          <Card className="gap-3 py-5">
            <div className="flex flex-wrap items-center gap-3 px-5">
              <RiskIcon level={result.level} />
              <p className="font-mono text-lg font-semibold break-all text-foreground">
                {result.ip}
              </p>
              <Badge variant={riskVariant(result.level)} className="uppercase">
                {riskLabel(result.level, t)}
              </Badge>
              <Badge variant="secondary">
                {t.reputationScoreLabel}: {result.score}/100
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 px-5">
              {result.categories.length > 0 ? (
                result.categories.map((category) => (
                  <Badge key={category} variant="warning">
                    {categoryLabel(category, t)}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t.reputationNoThreats}</p>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={ListX}
              label={t.reputationBlacklistsLabel}
              primary={formatTemplate(t.reputationListedSummary, {
                listed: result.listedCount,
                checked: result.checkedCount,
              })}
            />
            <StatCard
              icon={Flag}
              label={t.reputationAbuseLabel}
              primary={abuseSummary(result)}
              secondary={
                result.abuse.status === "available" && result.abuse.confidenceScore !== null
                  ? formatTemplate(t.reputationAbuseConfidence, {
                      score: result.abuse.confidenceScore,
                    })
                  : undefined
              }
            />
            <StatCard
              icon={MapPin}
              label={t.reputationGeoLabel}
              primary={
                result.geo
                  ? `${getCountryFlag(result.geo.countryCode)} ${[result.geo.city, result.geo.country].filter(Boolean).join(", ")}`.trim() || "-"
                  : "-"
              }
              secondary={result.geo?.region || undefined}
            />
            <StatCard
              icon={Waypoints}
              label={t.reputationNetworkLabel}
              primary={result.network?.as || "-"}
              secondary={result.network?.isp || result.network?.org || undefined}
            />
          </div>

          <Card className="gap-0 overflow-hidden py-0">
            <p className="border-b bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.reputationBlacklistsLabel}
            </p>
            <Table>
              <TableHeader className="sr-only">
                <TableRow>
                  <TableHead>{t.reputationBlacklistsLabel}</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.blacklists.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm text-foreground">
                      {entry.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.listed ? (
                        <Badge variant="destructive">
                          {t.reputationBlacklistListed}
                        </Badge>
                      ) : entry.checked ? (
                        <Badge variant="success">
                          {t.reputationBlacklistClean}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {t.reputationBlacklistUnchecked}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Alert variant="info">
            <AlertTriangle />
            <AlertDescription>{t.reputationDisclaimer}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
