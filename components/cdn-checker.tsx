"use client";

import { type Locale } from "@/lib/i18n";
import { getApiErrorMessage, getToolTranslation } from "@/lib/tool-i18n";
import { EmptyState } from "@/components/empty-state";
import { ExampleQueries } from "@/components/example-queries";
import { ErrorPanel } from "@/components/error-panel";
import { ResultActions } from "@/components/result-actions";
import { ResultPanel } from "@/components/result-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import Link from "next/link";
import { useMemo } from "react";
import {
  ShieldCheck,
  Server,
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

function confidenceLabel(
  confidence: CdnResult["confidence"],
  t: ReturnType<typeof getToolTranslation>,
) {
  if (confidence === "high") return t.cdnConfidenceHigh;
  if (confidence === "medium") return t.cdnConfidenceMedium;
  if (confidence === "low") return t.cdnConfidenceLow;
  return t.cdnConfidenceNa;
}

function confidenceVariant(
  confidence: CdnResult["confidence"],
): "success" | "warning" | "info" | "secondary" {
  if (confidence === "high") return "success";
  if (confidence === "medium") return "warning";
  if (confidence === "low") return "info";
  return "secondary";
}

interface CdnCheckerProps {
  locale: Locale;
  initialTarget?: string;
}

export function CdnChecker({ locale, initialTarget = "" }: CdnCheckerProps) {
  const t = getToolTranslation(locale);

  const { loading, error, result, run, cancel, querySync } = useToolLookup<CdnResult>({
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
        initialValue={querySync.query}
        syncKey={querySync.revision}
        placeholder={t.targetPlaceholder}
        label={t.lookupTarget}
        submitLabel={t.cdnAnalyzeButton}
        loadingLabel={t.cdnAnalyzing}
        loading={loading}
        onCancel={cancel}
        cancelLabel={t.cancelLookup}
        onSubmit={run}
      />

      {!loading && !error && !result && (
        <EmptyState
          icon={ShieldCheck}
          title={t.cdnEmptyTitle}
          description={t.cdnEmptyDescription}
        >
          <ExampleQueries
            examples={["example.com", "github.com"]}
            label={t.tryExample}
            onSelect={run}
          />
        </EmptyState>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3" role="status" aria-busy="true">
          <span className="sr-only">{t.cdnAnalyzing}</span>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" aria-hidden="true" />
          ))}
        </div>
      )}

      {error && (
        <ErrorPanel
          message={error}
          onRetry={querySync.query.trim() ? () => run(querySync.query) : undefined}
          retryLabel={t.errorRetry}
        />
      )}

      {result && (
        <ResultPanel
          title={summary || t.cdnSummaryNoMatch}
          tone={result.usesCdn ? "success" : result.reachable ? "neutral" : "warning"}
          description={result.reason}
          actions={
            <ResultActions
              locale={locale}
              data={result}
              copyText={JSON.stringify({
                target: result.target,
                provider: result.detectedCdn,
                httpStatus: result.status ?? null,
                signals: result.matchedSignals,
              }, null, 2)}
              filename={`cdn-${result.target}`}
            />
          }
        >
          <div className="flex flex-wrap items-center gap-2 border-b pb-4">
            <Badge
              variant={confidenceVariant(result.confidence)}
              className="uppercase"
            >
              {confidenceLabel(result.confidence, t)}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">{result.target}</span>
          </div>

          {!result.usesCdn && result.resolvedIps.length > 0 && (
            <section className="border-b pb-4">
              <p className="text-sm font-medium text-foreground">{t.cdnNoProviderMatch}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.cdnInspectIpsHint}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.resolvedIps.map((ip) => (
                  <Link
                    key={ip}
                    href={`/check?ip=${encodeURIComponent(ip)}`}
                    className="inline-flex min-h-9 items-center gap-1 rounded-md border bg-card px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {ip}
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 border-b pb-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.cdnTargetLabel}</dt>
              <dd className="mt-1 font-mono text-sm break-all text-foreground">{result.target}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.cdnHttpStatusLabel}</dt>
              <dd className="mt-1 font-mono text-sm text-foreground tabular-nums">
                {result.status ? result.status : t.cdnConfidenceNa}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.cdnProviderLabel}</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
                <Server className="size-4 text-primary" aria-hidden="true" />
                {result.detectedCdn || t.cdnUnknown}
              </dd>
            </div>
          </dl>

          <section>
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Binary className="size-4 text-primary" aria-hidden="true" />
              {t.cdnMatchedSignals}
            </p>
            {result.matchedSignals.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {result.matchedSignals.map((signal) => (
                  <Badge key={signal} variant="secondary" className="font-mono">
                    {signal}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">{t.cdnNoSignals}</p>
            )}
          </section>

          <div className="grid grid-cols-1 gap-5 border-t pt-4 md:grid-cols-2">
            <section>
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Waypoints className="size-4 text-primary" aria-hidden="true" />
                {t.cdnCnameChain}
              </p>
              {result.cnameChain.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {result.cnameChain.map((entry) => (
                    <li key={entry} className="font-mono break-all">
                      {entry}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{t.cdnNoCname}</p>
              )}
            </section>

            <section>
              <p className="text-sm font-medium text-foreground">{t.cdnInterestingHeaders}</p>
              {result.headers.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {result.headers.map((header) => (
                    <li key={header.key} className="break-all">
                      <span className="font-mono text-foreground">{header.key}</span>: {header.value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{t.cdnNoHeaders}</p>
              )}
            </section>
          </div>
        </ResultPanel>
      )}
    </div>
  );
}
