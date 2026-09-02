"use client";

import { useState, type ReactNode } from "react";
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
import { formatTemplate } from "@/lib/format";
import { CountryFlag } from "@/components/country-flag";
import type {
  ReputationSummary,
  RiskLevel,
  EvidenceCategory,
  NetworkContextType,
  SourceStatus,
  EvidenceItem,
  ProviderSourceResult,
} from "@/lib/reputation";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  Info,
  Mail,
  MapPin,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Waypoints,
  Wifi,
  XCircle,
} from "lucide-react";

type ToolT = ToolTranslation;

interface ReputationCheckerProps {
  locale: Locale;
  initialIp?: string;
}

function riskBadgeVariant(level: RiskLevel): "destructive" | "warning" | "success" | "secondary" {
  if (level === "critical" || level === "high") return "destructive";
  if (level === "medium") return "warning";
  return "success";
}

function riskBadgeLabel(level: RiskLevel, t: ToolT) {
  if (level === "critical" || level === "high") return t.reputationRiskHigh;
  if (level === "medium") return t.reputationRiskMedium;
  return t.reputationRiskLow;
}

function RiskIcon({ level }: { level: RiskLevel }) {
  if (level === "critical" || level === "high") {
    return <ShieldAlert className="size-6 text-destructive shrink-0" />;
  }
  if (level === "medium") {
    return <Shield className="size-6 text-warning shrink-0" />;
  }
  return <ShieldCheck className="size-6 text-success shrink-0" />;
}

function categoryBadgeLabel(cat: EvidenceCategory, t: ToolT): string {
  const map: Record<EvidenceCategory, string> = {
    mail_policy: t.reputationCategoryMailPolicy,
    mail_reputation: t.reputationCategoryMailReputation,
    spam_observed: t.reputationCategorySpamObserved,
    scanner: t.reputationCategoryScanner,
    bruteforce: t.reputationCategoryBruteforce,
    botnet: t.reputationCategoryBotnet,
    malware: t.reputationCategoryMalware,
    proxy: t.reputationThreatProxy,
    vpn: t.reputationContextVpn,
    tor: t.reputationThreatTor,
    hosting: t.reputationThreatHosting,
    residential: t.reputationContextResidential,
    mobile: t.reputationContextMobile,
  };
  return map[cat] || cat;
}

function networkContextLabel(type: NetworkContextType, t: ToolT): string {
  const map: Record<NetworkContextType, string> = {
    residential: t.reputationContextResidential,
    business: t.reputationContextBusiness,
    mobile: t.reputationContextMobile,
    hosting: t.reputationContextHosting,
    vpn: t.reputationContextVpn,
    proxy: t.reputationContextProxy,
    tor: t.reputationContextTor,
    unknown: t.reputationContextUnknown,
  };
  return map[type] || t.reputationContextUnknown;
}

function sourceStatusBadge(status: SourceStatus, t: ToolT) {
  switch (status) {
    case "matched":
      return (
        <Badge variant="destructive" className="gap-1 whitespace-nowrap">
          <XCircle className="size-3" />
          {t.reputationStatusMatched}
        </Badge>
      );
    case "policy_listed":
      return (
        <Badge variant="secondary" className="gap-1 border-primary/30 text-primary whitespace-nowrap">
          <Info className="size-3" />
          {t.reputationStatusPolicy}
        </Badge>
      );
    case "clean":
      return (
        <Badge variant="success" className="gap-1 whitespace-nowrap">
          <CheckCircle2 className="size-3" />
          {t.reputationStatusClean}
        </Badge>
      );
    case "not_configured":
      return (
        <Badge variant="outline" className="text-muted-foreground whitespace-nowrap">
          {t.reputationStatusNotConfigured}
        </Badge>
      );
    case "resolver_blocked":
      return (
        <Badge variant="outline" className="text-warning border-warning/30 whitespace-nowrap">
          {t.reputationStatusResolverBlocked}
        </Badge>
      );
    case "rate_limited":
      return (
        <Badge variant="outline" className="text-warning whitespace-nowrap">
          {t.reputationStatusRateLimited}
        </Badge>
      );
    case "unsupported":
      return (
        <Badge variant="outline" className="text-muted-foreground whitespace-nowrap">
          {t.reputationStatusUnsupported}
        </Badge>
      );
    case "unavailable":
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground whitespace-nowrap">
          {t.reputationStatusUnavailable}
        </Badge>
      );
  }
}

function errorMessage(error: unknown, t: ToolT) {
  if (error instanceof ApiClientError) {
    if (error.code === "bad_request" || error.code === "invalid_target")
      return t.reputationInvalidIp;
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
  primary: ReactNode;
  secondary?: string;
}) {
  return (
    <Card className="gap-2 py-4">
      <div className="flex items-center gap-2 px-4 text-muted-foreground">
        <Icon className="size-4 text-primary shrink-0" />
        <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <div className="px-4">
        <div className="text-sm font-semibold break-words text-foreground">{primary}</div>
        {secondary && (
          <p className="mt-0.5 text-xs break-words text-muted-foreground">{secondary}</p>
        )}
      </div>
    </Card>
  );
}

export function ReputationChecker({ locale, initialIp = "" }: ReputationCheckerProps) {
  const t = getToolTranslation(locale);
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);

  const { loading, error, result, run } = useToolLookup<ReputationSummary>({
    buildApiUrl: (ip) => `/api/reputation?ip=${encodeURIComponent(ip)}`,
    buildHref: (ip) => `/reputation?ip=${encodeURIComponent(ip)}`,
    mapError: (checkError) => errorMessage(checkError, t),
    initialQuery: initialIp,
  });

  // Separate active threats from pure policy listings and network signals
  const threatEvidence: EvidenceItem[] =
    result?.evidence?.filter((e) => !e.isPolicy) ?? [];

  const policyEvidence: EvidenceItem[] =
    result?.evidence?.filter((e) => e.isPolicy) ?? [];

  const sourcesList: ProviderSourceResult[] = result?.sources ?? [];

  const abuseSource = sourcesList.find((s) => s.id === "abuseipdb");
  const abuseSummaryText = () => {
    if (!abuseSource || abuseSource.status === "not_configured") {
      return t.reputationAbuseNotConfigured;
    }
    if (abuseSource.status === "unavailable") {
      return t.reputationAbuseUnavailable;
    }
    const reportItem = abuseSource.evidence.find((e) => typeof e.reportsCount === "number");
    const count = reportItem?.reportsCount ?? 0;
    return formatTemplate(t.reputationAbuseReports, { count });
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
          <Skeleton className="h-28 rounded-xl" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {error && <ErrorPanel message={error} />}

      {result && (
        <div className="tool-reveal flex flex-col gap-6">
          {/* Primary Assessment Card */}
          <Card className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <RiskIcon level={result.level} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xl font-bold tracking-tight text-foreground">
                      {result.ip}
                    </span>
                    {result.geo?.countryCode && (
                      <CountryFlag countryCode={result.geo.countryCode} />
                    )}
                    <Badge variant={riskBadgeVariant(result.level)} className="uppercase text-xs font-semibold">
                      {riskBadgeLabel(result.level, t)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.networkContext?.isp || result.network?.isp || result.network?.as || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t.reputationScoreLabel}
                  </span>
                  <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                    {result.score}
                    <span className="text-sm font-normal text-muted-foreground">/100</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Verdict summary text */}
            <div className="rounded-lg border bg-muted/40 p-3.5">
              <p className="text-sm font-semibold text-foreground">
                {result.verdictTitle || riskBadgeLabel(result.level, t)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {result.verdictDescription || t.reputationDisclaimer}
              </p>
            </div>

            {/* Categorical tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge variant="outline" className="gap-1 border-border/80">
                <Wifi className="size-3 text-muted-foreground" />
                {networkContextLabel(result.networkContext?.type || "unknown", t)}
              </Badge>

              {result.evidenceCategories && result.evidenceCategories.length > 0 ? (
                result.evidenceCategories.map((cat) => {
                  const isPol = cat === "mail_policy";
                  return (
                    <Badge
                      key={cat}
                      variant={isPol ? "secondary" : "warning"}
                      className="text-xs"
                    >
                      {categoryBadgeLabel(cat, t)}
                    </Badge>
                  );
                })
              ) : (
                <span className="text-xs text-muted-foreground">{t.reputationNoThreats}</span>
              )}
            </div>
          </Card>

          {/* Key Metric Overview */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Shield}
              label={t.reputationSectionSources}
              primary={
                formatTemplate(t.reputationCoverageSummary, {
                  checked: result.coverage?.checkedCount ?? result.checkedCount,
                  total: result.coverage?.totalSources ?? 11,
                  threats: result.coverage?.threatCount ?? result.listedCount,
                  policies: result.coverage?.policyCount ?? 0,
                })
              }
              secondary={`${result.coverage?.cleanCount ?? 0} ${t.reputationStatusClean.toLowerCase()}`}
            />
            <StatCard
              icon={Activity}
              label={t.reputationAbuseLabel}
              primary={abuseSummaryText()}
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
                result.geo ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CountryFlag countryCode={result.geo.countryCode} />
                    <span className="truncate">
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
              primary={result.network?.as || result.networkContext?.as || "-"}
              secondary={
                result.networkContext?.asname ||
                result.network?.asname ||
                result.network?.isp ||
                undefined
              }
            />
          </div>

          {/* Active Threat Evidence Section (only if threats exist or clean confirmation) */}
          <Card className="overflow-hidden py-0">
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.reputationSectionThreatEvidence}
                </p>
              </div>
              <Badge variant={threatEvidence.length > 0 ? "destructive" : "success"} className="text-xs">
                {threatEvidence.length} {threatEvidence.length === 1 ? "Threat" : "Threats"}
              </Badge>
            </div>

            {threatEvidence.length > 0 ? (
              <div className="divide-y">
                {threatEvidence.map((ev) => (
                  <div key={ev.id} className="flex flex-col gap-2 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            ev.severity === "critical" || ev.severity === "high"
                              ? "destructive"
                              : "warning"
                          }
                          className="uppercase text-[10px]"
                        >
                          {ev.severity}
                        </Badge>
                        <span className="font-semibold text-sm text-foreground">{ev.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {ev.sourceName}
                      </Badge>
                    </div>

                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {ev.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                      {ev.targetSubnet && (
                        <span>
                          <strong>{t.reputationTargetSubnetLabel}:</strong> {ev.targetSubnet}
                        </span>
                      )}
                      {ev.family && (
                        <span>
                          <strong>Malware:</strong> {ev.family}
                        </span>
                      )}
                      {typeof ev.confidence === "number" && (
                        <span>
                          <strong>{t.reputationConfidenceLabel}:</strong> {ev.confidence}%
                        </span>
                      )}
                      {typeof ev.reportsCount === "number" && (
                        <span>
                          <strong>{t.reputationReportsLabel}:</strong> {ev.reportsCount}
                        </span>
                      )}
                      {ev.lastSeen && (
                        <span>
                          <strong>{t.reputationLastSeenLabel}:</strong> {ev.lastSeen}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{t.reputationNoEvidence}</p>
              </div>
            )}
          </Card>

          {/* Mail Policy & Restrictions (Spamhaus PBL & Mail lists) */}
          {policyEvidence.length > 0 && (
            <Card className="border-primary/20 overflow-hidden py-0">
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.reputationSectionMailPolicy}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {t.reputationStatusPolicy}
                </Badge>
              </div>

              <div className="divide-y p-4 flex flex-col gap-3">
                {policyEvidence.map((ev) => (
                  <div key={ev.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-foreground">{ev.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {ev.sourceName}
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{ev.summary}</p>
                  </div>
                ))}

                <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <button
                    type="button"
                    onClick={() => setShowPolicyDetails((prev) => !prev)}
                    className="flex w-full items-center justify-between text-left text-xs font-medium text-foreground hover:underline"
                  >
                    <span className="flex items-center gap-1.5">
                      <Info className="size-3.5 text-primary shrink-0" />
                      {t.reputationPolicyExplainer}
                    </span>
                    {showPolicyDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  </button>

                  {showPolicyDetails && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {t.reputationPolicyExplainerText}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Network Classification & Topology Card */}
          <Card className="overflow-hidden py-0">
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.reputationSectionNetworkContext}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {networkContextLabel(result.networkContext?.type || "unknown", t)}
              </Badge>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded border p-2.5">
                  <span className="text-muted-foreground block text-[11px]">{t.reputationContextResidential}</span>
                  <span className="font-semibold text-foreground">
                    {result.networkContext?.isResidential ? t.asnBooleanYes : t.asnBooleanNo}
                  </span>
                </div>
                <div className="rounded border p-2.5">
                  <span className="text-muted-foreground block text-[11px]">{t.reputationContextHosting}</span>
                  <span className="font-semibold text-foreground">
                    {result.networkContext?.isHosting ? t.asnBooleanYes : t.asnBooleanNo}
                  </span>
                </div>
                <div className="rounded border p-2.5">
                  <span className="text-muted-foreground block text-[11px]">VPN / Proxy</span>
                  <span className="font-semibold text-foreground">
                    {result.networkContext?.isVpn || result.networkContext?.isProxy
                      ? t.asnBooleanYes
                      : t.asnBooleanNo}
                  </span>
                </div>
                <div className="rounded border p-2.5">
                  <span className="text-muted-foreground block text-[11px]">Tor Exit Relay</span>
                  <span className="font-semibold text-foreground">
                    {result.networkContext?.isTor ? t.asnBooleanYes : t.asnBooleanNo}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3">
                <button
                  type="button"
                  onClick={() => setShowNetworkDetails((prev) => !prev)}
                  className="flex w-full items-center justify-between text-left text-xs font-medium text-foreground hover:underline"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="size-3.5 text-primary shrink-0" />
                    {t.reputationNetworkExplainer}
                  </span>
                  {showNetworkDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>

                {showNetworkDetails && (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {t.reputationNetworkExplainerText}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Full Provider & Source Breakdown Table */}
          <Card className="gap-0 overflow-hidden py-0">
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.reputationSectionSources}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {sourcesList.length} sources
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.asnLabelName}</TableHead>
                    <TableHead>{t.reputationSourceTypeLabel}</TableHead>
                    <TableHead>{t.reputationSourceStatusLabel}</TableHead>
                    <TableHead>{t.reputationSourceDetailsLabel}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourcesList.map((src) => (
                    <TableRow key={src.id}>
                      <TableCell className="font-medium text-xs text-foreground whitespace-nowrap">
                        {src.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground uppercase whitespace-nowrap">
                        {src.type.replace("_", " ")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {sourceStatusBadge(src.status, t)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground min-w-[220px]">
                        {src.statusMessage || "-"}
                        {src.rawCodes && src.rawCodes.length > 0 && (
                          <span className="ml-1.5 font-mono text-[11px] text-muted-foreground/80">
                            [{src.rawCodes.join(", ")}]
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Legal / Technical Disclaimer */}
          <Alert variant="info">
            <AlertTriangle className="size-4" />
            <AlertDescription className="text-xs leading-relaxed">
              {t.reputationDisclaimer}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
