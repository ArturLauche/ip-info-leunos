"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { ResultPanel } from "@/components/result-panel";
import { SegmentedControl } from "@/components/segmented-control";
import {
  CopyButton,
  CopyLinkButton,
  DownloadJsonButton,
  ExampleQueries,
} from "@/components/checker-actions";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { formatDnsRecordValue, type DnsRecord } from "@/lib/dns-records";
import { getTranslation, type Locale } from "@/lib/i18n";
import { getApiErrorMessage, getToolTranslation } from "@/lib/tool-i18n";
import { Network, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";

interface DnsAddress {
  address: string;
  family: number;
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
  const [showRaw, setShowRaw] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lastQuery, setLastQuery] = useState(initialTarget);
  const t = getToolTranslation(locale);
  const bt = getTranslation(locale);

  const { loading, error, result, run } = useToolLookup<DnsResult>({
    buildApiUrl: (target) => `/api/dns?target=${encodeURIComponent(target)}`,
    buildHref: (target) => `/dns?target=${encodeURIComponent(target)}`,
    mapError: (lookupError) => getApiErrorMessage(lookupError, t, t.dnsLookupError),
    initialQuery: initialTarget,
    onStart: () => {
      setSelectedType("ALL");
      setShowRaw(false);
      setExpanded(false);
    },
  });

  const handleRun = (query: string) => {
    setLastQuery(query);
    setExpanded(false);
    run(query);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setExpanded(false);
  };

  const recordTypes = useMemo(() => {
    if (!result) return [];
    return [...new Set(result.records.map((record) => record.type))].sort();
  }, [result]);

  const visibleRecords = useMemo(() => {
    if (!result) return [];
    if (selectedType === "ALL") return result.records;
    return result.records.filter((record) => record.type === selectedType);
  }, [result, selectedType]);

  const PAGE_SIZE = 50;
  const pagedRecords = expanded ? visibleRecords : visibleRecords.slice(0, PAGE_SIZE);

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={initialTarget}
        placeholder={t.targetPlaceholder}
        submitLabel={t.dnsLookupButton}
        loadingLabel={t.lookupInProgress}
        loading={loading}
        onSubmit={handleRun}
      />

      {!loading && !error && !result && (
        <EmptyState
          icon={Network}
          title={t.dnsEmptyTitle}
          description={t.dnsEmptyDescription}
        >
          <ExampleQueries
            examples={["example.com", "8.8.8.8", "google.com"]}
            onSelect={handleRun}
            label={t.tryExample}
          />
        </EmptyState>
      )}

      {loading && (
        <div className="flex flex-col gap-4" role="status" aria-busy="true">
          <span className="sr-only">{t.lookupInProgress}</span>
          <Skeleton className="h-20 rounded-lg" aria-hidden="true" />
          <Skeleton className="h-56 rounded-lg" aria-hidden="true" />
        </div>
      )}

      {error && (
        <ErrorPanel
          message={error}
          onRetry={lastQuery.trim() ? () => handleRun(lastQuery) : undefined}
          retryLabel={t.errorRetry}
        />
      )}

      {result && (
        <ResultPanel title={`${t.dnsRecordsFor} ${result.target}`}>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton
              href={`/dns?target=${encodeURIComponent(result.target)}`}
              label={t.copyLink}
              copiedLabel={bt.copiedToClipboard}
              failedLabel={bt.copyFailed}
            />
            <DownloadJsonButton
              data={result}
              filename={`dns-${result.target}.json`}
              label={t.downloadJson}
            />
          </div>
          <div className="border-b pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.resolvedAddresses}
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
              {result.addresses.length > 0 ? (
                result.addresses.map((address) => (
                  <li
                    key={`${address.address}-${address.family}`}
                    className="flex min-w-0 items-center gap-1 font-mono text-xs break-all text-foreground"
                  >
                    <span>
                      {address.address}
                      <span className="ml-1.5 text-muted-foreground">IPv{address.family}</span>
                    </span>
                    <CopyButton
                      text={address.address}
                      label={t.copyValue}
                      copiedLabel={bt.copiedToClipboard}
                      failedLabel={bt.copyFailed}
                    />
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">
                  {result.lookupError || t.noAddressResult}
                </li>
              )}
            </ul>
          </div>

          {recordTypes.length > 0 && (
            <SegmentedControl
              options={["ALL", ...recordTypes]}
              value={selectedType}
              onChange={handleTypeChange}
            />
          )}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.recordDetails}
            </p>
            {visibleRecords.length > 0 ? (
              <>
                <div
                  key={selectedType}
                  className="overflow-hidden rounded-lg border motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-200"
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-24">{t.dnsTableType}</TableHead>
                        <TableHead>{t.dnsTableValue}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedRecords.map((record, index) => (
                        <TableRow key={`${record.type}-${index}`}>
                          <TableCell className="align-top">
                            <Badge variant="outline" className="font-mono">
                              {record.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs break-all whitespace-normal text-foreground">
                            {formatDnsRecordValue(record)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {visibleRecords.length > PAGE_SIZE && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-fit"
                    onClick={() => setExpanded((value) => !value)}
                  >
                    {expanded
                      ? t.showLess
                      : `${t.showAll} (${visibleRecords.length})`}
                  </Button>
                )}
              </>
            ) : (
              <p
                key={selectedType}
                className="text-sm text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
              >
                {t.dnsNoRecords}
              </p>
            )}
          </div>

          {visibleRecords.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => setShowRaw((value) => !value)}
            >
              {showRaw ? t.dnsHideRaw : t.dnsShowRaw}
            </Button>
          )}

          {showRaw && (
            <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs text-foreground">
              {JSON.stringify(visibleRecords, null, 2)}
            </pre>
          )}

          {result.recordErrors && result.recordErrors.length > 0 && (
            <Alert variant="warning">
              <TriangleAlert />
              <AlertTitle>{t.dnsRecordNotes}</AlertTitle>
              <AlertDescription>
                <ul className="space-y-1">
                  {result.recordErrors.map((entry) => (
                    <li key={`${entry.type}-${entry.error}`}>
                      <span className="font-mono">{entry.type}</span>: {entry.error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </ResultPanel>
      )}
    </div>
  );
}
