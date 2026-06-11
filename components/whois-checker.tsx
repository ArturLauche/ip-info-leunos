"use client";

import { ErrorPanel } from "@/components/error-panel";
import { ResultPanel } from "@/components/result-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { type Locale } from "@/lib/i18n";
import { getApiErrorMessage, getToolTranslation } from "@/lib/tool-i18n";
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
    <p>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-mono text-foreground">{value}</span>
    </p>
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

      {error && <ErrorPanel message={error} />}

      {result && (
        <ResultPanel title={`${t.whoisFor} ${result.target}`}>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div className="rounded-lg border border-border bg-secondary/40 p-3 text-muted-foreground">
              <p>
                {t.queriedServer}: <span className="font-mono text-foreground">{result.server}</span>
              </p>
              {result.refer && (
                <p>
                  {t.referralSource}: <span className="font-mono text-foreground">{result.refer}</span>
                </p>
              )}
              {result.note && <p className="mt-2">{result.note}</p>}
            </div>

            {result.summary && (
              <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
                <SummaryRow label={t.whoisRegistrar} value={result.summary.registrar} />
                <SummaryRow label={t.whoisCreated} value={result.summary.created} />
                <SummaryRow label={t.whoisUpdated} value={result.summary.updated} />
                <SummaryRow label={t.whoisExpires} value={result.summary.expires} />
              </div>
            )}
          </div>

          {result.summary && (result.summary.status.length > 0 || result.summary.nameservers.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-sm font-medium text-foreground">{t.whoisStatusLabel}</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {result.summary.status.length > 0 ? (
                    result.summary.status.map((status) => <li key={status}>{status}</li>)
                  ) : (
                    <li>-</li>
                  )}
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-sm font-medium text-foreground">{t.whoisNameservers}</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {result.summary.nameservers.length > 0 ? (
                    result.summary.nameservers.map((nameserver) => (
                      <li key={nameserver} className="font-mono">
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

          <button
            type="button"
            onClick={() => setShowRaw((value) => !value)}
            className="h-10 rounded-lg border border-border bg-secondary px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            {showRaw ? t.whoisHideRaw : t.whoisShowRaw}
          </button>

          {showRaw && (
            <div className="max-h-[32rem] overflow-auto rounded-lg border border-border bg-secondary/40 p-3 font-mono text-xs text-foreground">
              <pre className="whitespace-pre-wrap break-words">{result.raw || t.noWhoisData}</pre>
            </div>
          )}
        </ResultPanel>
      )}
    </div>
  );
}
