"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { ResultPanel } from "@/components/result-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { type Locale } from "@/lib/i18n";
import { getApiErrorMessage, getToolTranslation } from "@/lib/tool-i18n";
import { Activity } from "lucide-react";
import { useState } from "react";

interface WhoisSummary {
  registrar?: string;
  created?: string;
  expires?: string;
  updated?: string;
  status: string[];
  nameservers: string[];
}

interface WhoisResult {
  target: string;
  server: string;
  raw: string;
  summary?: WhoisSummary;
  refer?: string;
  note?: string;
}

interface WhoisCheckerProps {
  locale: Locale;
  initialTarget?: string;
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-0.5 border-b py-2 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="font-mono text-sm break-all text-foreground sm:text-right">
        {value}
      </dd>
    </div>
  );
}

export function WhoisChecker({ locale, initialTarget = "" }: WhoisCheckerProps) {
  const [showRaw, setShowRaw] = useState(false);
  const t = getToolTranslation(locale);

  const { loading, error, result, run } = useToolLookup<WhoisResult>({
    buildApiUrl: (target) => `/api/whois?target=${encodeURIComponent(target)}`,
    buildHref: (target) => `/whois?target=${encodeURIComponent(target)}`,
    mapError: (lookupError) => getApiErrorMessage(lookupError, t, t.whoisLookupError),
    initialQuery: initialTarget,
    onStart: () => setShowRaw(false),
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={initialTarget}
        placeholder={t.whoisPlaceholder}
        submitLabel={t.whoisLookupButton}
        loadingLabel={t.lookupInProgress}
        loading={loading}
        onSubmit={run}
      />

      {!loading && !error && !result && (
        <EmptyState
          icon={Activity}
          title={t.whoisEmptyTitle}
          description={t.whoisEmptyDescription}
        />
      )}

      {error && <ErrorPanel message={error} />}

      {result && (
        <ResultPanel title={`${t.whoisFor} ${result.target}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="text-muted-foreground">
                {t.queriedServer}:{" "}
                <span className="font-mono text-foreground">{result.server}</span>
              </p>
              {result.refer && (
                <p className="mt-1 text-muted-foreground">
                  {t.referralSource}:{" "}
                  <span className="font-mono text-foreground">{result.refer}</span>
                </p>
              )}
              {result.note && (
                <p className="mt-2 text-xs text-muted-foreground">{result.note}</p>
              )}
            </div>

            {result.summary && (
              <dl className="rounded-lg border bg-muted/30 p-4">
                <SummaryRow label={t.whoisRegistrar} value={result.summary.registrar} />
                <SummaryRow label={t.whoisCreated} value={result.summary.created} />
                <SummaryRow label={t.whoisUpdated} value={result.summary.updated} />
                <SummaryRow label={t.whoisExpires} value={result.summary.expires} />
              </dl>
            )}
          </div>

          {result.summary &&
            (result.summary.status.length > 0 ||
              result.summary.nameservers.length > 0) && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.whoisStatusLabel}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {result.summary.status.length > 0 ? (
                      result.summary.status.map((status) => (
                        <Badge key={status} variant="secondary" className="font-normal">
                          {status}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.whoisNameservers}
                  </p>
                  <ul className="mt-2.5 space-y-1 text-sm text-muted-foreground">
                    {result.summary.nameservers.length > 0 ? (
                      result.summary.nameservers.map((nameserver) => (
                        <li key={nameserver} className="font-mono text-foreground">
                          {nameserver}
                        </li>
                      ))
                    ) : (
                      <li>-</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setShowRaw((value) => !value)}
          >
            {showRaw ? t.whoisHideRaw : t.whoisShowRaw}
          </Button>

          {showRaw && (
            <pre className="max-h-[32rem] overflow-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs break-words whitespace-pre-wrap text-foreground">
              {result.raw || t.noWhoisData}
            </pre>
          )}
        </ResultPanel>
      )}
    </div>
  );
}
