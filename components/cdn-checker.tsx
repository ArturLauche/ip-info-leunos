"use client";

import { type Locale } from "@/lib/i18n";
import { getApiErrorMessage, getToolTranslation } from "@/lib/tool-i18n";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
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

function confidenceBadge(confidence: CdnResult["confidence"]) {
  if (confidence === "high") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  if (confidence === "medium") return "bg-amber-500/15 text-amber-300 border-amber-500/40";
  if (confidence === "low") return "bg-sky-500/15 text-sky-300 border-sky-500/40";
  return "bg-secondary text-muted-foreground border-border";
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

    if (!result.reachable) {
      return t.cdnSummaryUnreachable;
    }

    if (!result.usesCdn) {
      return t.cdnSummaryNoMatch;
    }

    return result.detectedCdn || t.cdnSummaryDetected;
  }, [result, t]);

  return (
    <div className="flex w-full flex-col gap-8">
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
            <div key={index} className="h-24 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      )}

      {error && <ErrorPanel message={error} />}

      {result && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {result.usesCdn ? (
                <CircleCheck className="h-5 w-5 text-emerald-400" />
              ) : (
                <Shield className="h-5 w-5 text-muted-foreground" />
              )}
              <p className="text-lg font-semibold text-foreground">{summary}</p>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${confidenceBadge(result.confidence)}`}
              >
                {result.confidence || t.cdnConfidenceNa}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{result.reason}</p>
          </div>

          {!result.usesCdn && result.resolvedIps.length > 0 && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-sm">
              <p className="text-sm font-medium text-foreground">{t.cdnNoProviderMatch}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.cdnInspectIpsHint}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.resolvedIps.map((ip) => (
                  <Link
                    key={ip}
                    href={`/check?ip=${encodeURIComponent(ip)}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-mono text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {ip}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">{t.cdnTargetLabel}</p>
              </div>
              <p className="mt-2 break-all font-mono text-sm text-muted-foreground">{result.target}</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-foreground">
                <Activity className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">{t.cdnHttpStatusLabel}</p>
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">{result.status || t.cdnConfidenceNa}</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">{t.cdnProviderLabel}</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{result.detectedCdn || t.cdnUnknown}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Binary className="h-4 w-4 text-primary" />
              {t.cdnMatchedSignals}
            </p>
            {result.matchedSignals.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                {result.matchedSignals.map((signal) => (
                  <li
                    key={signal}
                    className="rounded-full border border-border bg-secondary px-3 py-1 font-mono text-muted-foreground"
                  >
                    {signal}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">{t.cdnNoSignals}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Waypoints className="h-4 w-4 text-primary" />
                {t.cdnCnameChain}
              </p>
              {result.cnameChain.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {result.cnameChain.map((entry) => (
                    <li key={entry} className="font-mono">
                      {entry}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{t.cdnNoCname}</p>
              )}
            </div>

            <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
              <p className="text-sm font-medium text-foreground">{t.cdnInterestingHeaders}</p>
              {result.headers.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {result.headers.map((header) => (
                    <li key={header.key}>
                      <span className="font-mono text-foreground">{header.key}</span>: {header.value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{t.cdnNoHeaders}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
