"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { ResultPanel } from "@/components/result-panel";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { formatDnsRecordValue, type DnsRecord } from "@/lib/dns-records";
import { type Locale } from "@/lib/i18n";
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
  const t = getToolTranslation(locale);

  const { loading, error, result, run } = useToolLookup<DnsResult>({
    buildApiUrl: (target) => `/api/dns?target=${encodeURIComponent(target)}`,
    buildHref: (target) => `/dns?target=${encodeURIComponent(target)}`,
    mapError: (lookupError) => getApiErrorMessage(lookupError, t, t.dnsLookupError),
    initialQuery: initialTarget,
    onStart: () => {
      setSelectedType("ALL");
      setShowRaw(false);
    },
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

      {!loading && !error && !result && (
        <EmptyState
          icon={Network}
          title={t.dnsEmptyTitle}
          description={t.dnsEmptyDescription}
        />
      )}

      {error && <ErrorPanel message={error} />}

      {result && (
        <ResultPanel title={`${t.dnsRecordsFor} ${result.target}`}>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.resolvedAddresses}
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {result.addresses.length > 0 ? (
                result.addresses.map((address) => (
                  <li
                    key={`${address.address}-${address.family}`}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 font-mono text-xs text-foreground"
                  >
                    <span className="min-w-0 break-all">{address.address}</span>
                    <Badge variant="secondary" className="shrink-0 font-mono text-[0.65rem]">
                      IPv{address.family}
                    </Badge>
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
            <ToggleGroup
              type="single"
              value={selectedType}
              onValueChange={(value) => value && setSelectedType(value)}
              variant="outline"
              size="sm"
              className="flex-wrap"
            >
              {["ALL", ...recordTypes].map((type) => (
                <ToggleGroupItem key={type} value={type} className="font-mono">
                  {type}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {t.recordDetails}
            </p>
            {visibleRecords.length > 0 ? (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-24">{t.dnsTableType}</TableHead>
                      <TableHead>{t.dnsTableValue}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRecords.map((record, index) => (
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
            ) : (
              <p className="text-sm text-muted-foreground">{t.dnsNoRecords}</p>
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
