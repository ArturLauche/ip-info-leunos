"use client";

import { ErrorPanel } from "@/components/error-panel";
import { ResultPanel } from "@/components/result-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { type Locale } from "@/lib/i18n";
import { getApiErrorMessage, getToolTranslation } from "@/lib/tool-i18n";
import { useMemo, useState } from "react";

interface DnsAddress {
  address: string;
  family: number;
}

interface DnsRecord {
  type: string;
  value: unknown;
}

interface DnsResult {
  target: string;
  addresses: DnsAddress[];
  records: DnsRecord[];
  lookupError?: string | null;
  recordErrors?: Array<{ type: string; error?: string }>;
}

interface DnsCheckerProps {
  locale: Locale;
  initialTarget?: string;
}

export function DnsChecker({ locale, initialTarget = "" }: DnsCheckerProps) {
  const [selectedType, setSelectedType] = useState("ALL");
  const t = getToolTranslation(locale);

  const { loading, error, result, run } = useToolLookup<DnsResult>({
    buildApiUrl: (target) => `/api/dns?target=${encodeURIComponent(target)}`,
    buildHref: (target) => `/dns?target=${encodeURIComponent(target)}`,
    mapError: (lookupError) => getApiErrorMessage(lookupError, t, t.dnsLookupError),
    initialQuery: initialTarget,
    onStart: () => setSelectedType("ALL"),
  });

  const recordTypes = useMemo(() => {
    if (!result) return [];
    return [...new Set(result.records.map((record) => record.type))].sort();
  }, [result]);

  const visibleRecords = useMemo(() => {
    if (!result) return [];
    if (selectedType === "ALL") return result.records;
    return result.records.filter((record) => record.type === selectedType);
  }, [result, selectedType]);

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={initialTarget}
        placeholder={t.targetPlaceholder}
        submitLabel={t.dnsLookupButton}
        loadingLabel={t.lookupInProgress}
        loading={loading}
        onSubmit={run}
      />

      {error && <ErrorPanel message={error} />}

      {result && (
        <ResultPanel title={`${t.dnsRecordsFor} ${result.target}`}>
          <div>
            <p className="text-sm font-medium text-foreground">{t.resolvedAddresses}</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {result.addresses.length > 0 ? (
                result.addresses.map((address) => (
                  <li key={`${address.address}-${address.family}`} className="font-mono">
                    {address.address} (IPv{address.family})
                  </li>
                ))
              ) : (
                <li>{result.lookupError || t.noAddressResult}</li>
              )}
            </ul>
          </div>

          {recordTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {["ALL", ...recordTypes].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedType === type
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-secondary/60 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-foreground">{t.recordDetails}</p>
            <div className="mt-2 max-h-96 overflow-auto rounded-lg border border-border bg-secondary/40 p-3 font-mono text-xs text-foreground">
              <pre>{JSON.stringify(visibleRecords, null, 2)}</pre>
            </div>
          </div>

          {result.recordErrors && result.recordErrors.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <p className="font-medium text-amber-100">{t.dnsRecordNotes}</p>
              <ul className="mt-2 space-y-1">
                {result.recordErrors.map((entry) => (
                  <li key={`${entry.type}-${entry.error}`}>
                    <span className="font-mono">{entry.type}</span>: {entry.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ResultPanel>
      )}
    </div>
  );
}
