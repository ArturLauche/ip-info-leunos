"use client";

import { type Locale } from "@/lib/i18n";
import { ApiClientError } from "@/lib/api/client";
import { getApiErrorMessage, getToolTranslation, type ToolTranslation } from "@/lib/tool-i18n";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
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

function riskBadgeClass(level: RiskLevel) {
  if (level === "high") return "border-red-500/40 bg-red-500/10 text-red-300";
  if (level === "medium") return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
}

function riskLabel(level: RiskLevel, t: ToolT) {
  if (level === "high") return t.reputationRiskHigh;
  if (level === "medium") return t.reputationRiskMedium;
  return t.reputationRiskLow;
}

function RiskIcon({ level }: { level: RiskLevel }) {
  if (level === "high") return <ShieldAlert className="h-6 w-6 text-red-400" />;
  if (level === "medium") return <Shield className="h-6 w-6 text-amber-400" />;
  return <ShieldCheck className="h-6 w-6 text-emerald-400" />;
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
    <div className="rounded-xl border border-border/80 bg-card/70 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-foreground">{primary}</p>
      {secondary && <p className="mt-1 break-words text-xs text-muted-foreground">{secondary}</p>}
    </div>
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
    <div className="flex w-full flex-col gap-8">
      <ToolSearchForm
        initialValue={initialIp}
        placeholder={t.reputationPlaceholder}
        submitLabel={t.reputationCheckButton}
        loadingLabel={t.reputationChecking}
        loading={loading}
        onSubmit={run}
      />

      {!loading && !error && !result && (
        <div className="rounded-xl border border-border/80 bg-card/70 p-6 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-lg font-semibold text-foreground">{t.reputationEmptyTitle}</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            {t.reputationEmptyDescription}
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-24 rounded-xl bg-secondary" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-xl bg-secondary" />
            ))}
          </div>
        </div>
      )}

      {error && <ErrorPanel message={error} />}

      {result && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <RiskIcon level={result.level} />
              <p className="font-mono text-lg font-semibold text-foreground">{result.ip}</p>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${riskBadgeClass(result.level)}`}
              >
                {riskLabel(result.level, t)}
              </span>
              <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {t.reputationScoreLabel}: {result.score}/100
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {result.categories.length > 0 ? (
                result.categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300"
                  >
                    {categoryLabel(category, t)}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t.reputationNoThreats}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
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

          <div className="rounded-xl border border-border/80 bg-card/70 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t.reputationBlacklistsLabel}
            </p>
            <ul className="mt-2 divide-y divide-border/40">
              {result.blacklists.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-2 py-2">
                  <span className="text-sm text-foreground">{entry.name}</span>
                  {entry.listed ? (
                    <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-300">
                      {t.reputationBlacklistListed}
                    </span>
                  ) : entry.checked ? (
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                      {t.reputationBlacklistClean}
                    </span>
                  ) : (
                    <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {t.reputationBlacklistUnchecked}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-xs">{t.reputationDisclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
