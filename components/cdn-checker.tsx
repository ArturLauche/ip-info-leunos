"use client";

import { type Locale } from "@/lib/i18n";
import { getApiErrorMessage, getToolTranslation } from "@/lib/tool-i18n";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import Link from "next/link";
import { useMemo } from "react";
import {
  CircleCheck,
  Shield,
  Sparkles,
  Globe,
  Activity,
  Waypoints,
  Binary,
  ExternalLink,
} from "lucide-react";

interface HeaderPair {
  key: string;
  value: string;
}

interface CdnResult {
  target: string;
  reachable: boolean;
  status?: number;
  usesCdn: boolean;
  detectedCdn: string | null;
  confidence: "high" | "medium" | "low" | null;
  reason: string;
  matchedSignals: string[];
  resolvedIps: string[];
  cnameChain: string[];
  headers: HeaderPair[];
}

function confidenceVariant(
  confidence: CdnResult["confidence"],
): "success" | "warning" | "info" | "secondary" {
  if (confidence === "high") return "success";
  if (confidence === "medium") return "warning";
  if (confidence === "low") return "info";
  return "secondary";
}

interface DetailCardProps {
  icon: typeof Globe;
  label: string;
  value: string;
}

function DetailCard({ icon: Icon, label, value }: DetailCardProps) {
  return (
    <Card className="gap-2 py-4">
      <div className="flex items-center gap-2 px-5 text-muted-foreground">
        <Icon className="size-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p className="px-5 text-sm font-semibold break-all text-foreground">{value}</p>
    </Card>
  );
}

interface CdnCheckerProps {
  locale: Locale;
  initialTarget?: string;
}

export function CdnChecker({ locale, initialTarget = "" }: CdnCheckerProps) {
  const t = getToolTranslation(locale);

  const { loading, error, result, run } = useToolLookup<CdnResult>({
    buildApiUrl: (target) => `/api/cdn?target=${encodeURIComponent(target)}`,
    buildHref: (target) => `/cdn?target=${encodeURIComponent(target)}`,
    mapError: (checkError) => getApiErrorMessage(checkError, t, t.cdnNetworkError),
    initialQuery: initialTarget,
  });

  const summary = useMemo(() => {
    if (!result) return null;
    if (!result.reachable) return t.cdnSummaryUnreachable;
    if (!result.usesCdn) return t.cdnSummaryNoMatch;
    return result.detectedCdn || t.cdnSummaryDetected;
  }, [result, t]);

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={initialTarget}
        placeholder={t.targetPlaceholder}
        submitLabel={t.cdnAnalyzeButton}
        loadingLabel={t.cdnAnalyzing}
        loading={loading}
        onSubmit={run}
      />

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {error && <ErrorPanel message={error} />}

      {result && (
        <div className="flex flex-col gap-4">
          <Card className="gap-3 py-5">
            <div className="flex flex-wrap items-center gap-3 px-5">
              {result.usesCdn ? (
                <CircleCheck className="size-5 text-success" />
              ) : (
                <Shield className="size-5 text-muted-foreground" />
              )}
              <p className="text-lg font-semibold text-foreground">{summary}</p>
              <Badge
                variant={confidenceVariant(result.confidence)}
                className="uppercase"
              >
                {result.confidence || t.cdnConfidenceNa}
              </Badge>
            </div>
            <p className="px-5 text-sm text-muted-foreground">{result.reason}</p>
          </Card>

          {!result.usesCdn && result.resolvedIps.length > 0 && (
            <Card className="gap-2 border-primary/30 bg-primary/5 py-5">
              <p className="px-5 text-sm font-medium text-foreground">
                {t.cdnNoProviderMatch}
              </p>
              <p className="px-5 text-sm text-muted-foreground">
                {t.cdnInspectIpsHint}
              </p>
              <div className="flex flex-wrap gap-2 px-5 pt-1">
                {result.resolvedIps.map((ip) => (
                  <Link
                    key={ip}
                    href={`/check?ip=${encodeURIComponent(ip)}`}
                    className="inline-flex items-center gap-1 rounded-md border bg-card px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {ip}
                    <ExternalLink className="size-3" />
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <DetailCard icon={Globe} label={t.cdnTargetLabel} value={result.target} />
            <DetailCard
              icon={Activity}
              label={t.cdnHttpStatusLabel}
              value={result.status ? String(result.status) : t.cdnConfidenceNa}
            />
            <DetailCard
              icon={Sparkles}
              label={t.cdnProviderLabel}
              value={result.detectedCdn || t.cdnUnknown}
            />
          </div>

          <Card className="gap-3 py-5">
            <p className="flex items-center gap-2 px-5 text-sm font-medium text-foreground">
              <Binary className="size-4 text-primary" />
              {t.cdnMatchedSignals}
            </p>
            {result.matchedSignals.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 px-5">
                {result.matchedSignals.map((signal) => (
                  <Badge key={signal} variant="secondary" className="font-mono">
                    {signal}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="px-5 text-sm text-muted-foreground">{t.cdnNoSignals}</p>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="gap-3 py-5">
              <p className="flex items-center gap-2 px-5 text-sm font-medium text-foreground">
                <Waypoints className="size-4 text-primary" />
                {t.cdnCnameChain}
              </p>
              {result.cnameChain.length > 0 ? (
                <ul className="space-y-1 px-5 text-sm text-muted-foreground">
                  {result.cnameChain.map((entry) => (
                    <li key={entry} className="font-mono break-all">
                      {entry}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 text-sm text-muted-foreground">{t.cdnNoCname}</p>
              )}
            </Card>

            <Card className="gap-3 py-5">
              <p className="px-5 text-sm font-medium text-foreground">
                {t.cdnInterestingHeaders}
              </p>
              {result.headers.length > 0 ? (
                <ul className="space-y-1 px-5 text-sm text-muted-foreground">
                  {result.headers.map((header) => (
                    <li key={header.key} className="break-all">
                      <span className="font-mono text-foreground">{header.key}</span>:{" "}
                      {header.value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 text-sm text-muted-foreground">{t.cdnNoHeaders}</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
