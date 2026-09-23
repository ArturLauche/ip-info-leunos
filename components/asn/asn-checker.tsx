"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowUpRight, Waypoints } from "lucide-react";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { TabsContent } from "@/components/ui/tabs";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { normalizeAsnInput } from "@/lib/asn-id";
import type { AsnProfile } from "@/lib/asn";
import type { Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { AsnDetailTabs } from "./detail-tabs";
import { AsnInterconnectionWorkspace } from "./interconnection-workspace";
import { formatWarning, hasSourceInfoFlag, lookupErrorMessage, validationErrorMessage } from "./helpers";
import { LoadingSkeleton } from "./loading-skeleton";
import { PrefixSection } from "./prefix-section";
import { RoutingSection } from "./routing-section";
import { SourceDiagnosticsSection } from "./source-diagnostics-section";
import { AsnSummaryCard } from "./summary-card";

interface AsnCheckerProps {
  locale: Locale;
  initialAsn?: string;
}

export function AsnChecker({ locale, initialAsn = "" }: AsnCheckerProps) {
  const t = getToolTranslation(locale);
  const [showSourceInfo, setShowSourceInfo] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [sourceInfoHash, setSourceInfoHash] = useState(false);
  const searchParams = useSearchParams();

  // Deep links may carry arbitrary input; pass it through so the API can
  // reject it with a translated validation error.
  const initialQuery = useMemo(() => {
    const trimmed = initialAsn.trim();
    if (!trimmed) return "";
    try {
      return normalizeAsnInput(trimmed).asn;
    } catch {
      return trimmed;
    }
  }, [initialAsn]);

  const { loading, error, result, run, showError, cancel, querySync } = useToolLookup<AsnProfile>({
    buildApiUrl: (asn) =>
      `/api/asn/${encodeURIComponent(asn)}${hasSourceInfoFlag() ? "?source-info=1" : ""}`,
    buildHref: (asn) => `/asn/${asn}${hasSourceInfoFlag() ? "?source-info=1" : ""}`,
    mapError: (lookupError) => lookupErrorMessage(lookupError, t),
    initialQuery,
    onStart: () => {
      setInputError(null);
      setShowSourceInfo(hasSourceInfoFlag());
    },
  });

  const submit = useCallback(
    (value: string) => {
      try {
        const normalized = normalizeAsnInput(value).asn;
        setInputError(null);
        run(normalized);
      } catch (validationError) {
        const message = validationErrorMessage(validationError, t, locale);
        setInputError(message);
        showError(message);
      }
    },
    [locale, run, showError, t],
  );

  // Re-sync the source-info flag whenever the URL changes under us. Reacting
  // to searchParams (not hashchange/popstate) also covers client-side
  // pushState navigations from the command palette or in-page links.
  const sourceInfoInUrl = searchParams.has("source-info") || searchParams.has("sourceInfo");

  useEffect(() => {
    const syncHash = () => setSourceInfoHash(window.location.hash === "#source-info");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    setShowSourceInfo(sourceInfoInUrl || sourceInfoHash);
  }, [sourceInfoHash, sourceInfoInUrl]);

  // Once a profile is on screen the form steps back to a quiet toolbar so the
  // result owns the visual hierarchy; empty/error states keep it prominent.
  const hasResult = Boolean(result && result.found);

  const routingCount = result
    ? (result.peersTotal ?? 0) + (result.upstreamsTotal ?? 0) + (result.downstreamsTotal ?? 0)
    : null;
  const prefixesCount = result
    ? (result.prefixes4Total ?? 0) + (result.prefixes6Total ?? 0)
    : null;
  const initialDetailTab = result
    ? result.peers.length > 0 || result.upstreams.length > 0 || result.downstreams.length > 0
      ? "routing"
      : result.prefixes4.length > 0 || result.prefixes6.length > 0
        ? "prefixes"
        : "peering"
    : "routing";

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={querySync.query}
        syncKey={querySync.revision}
        placeholder={t.asnPlaceholder}
        label={hasResult ? `${t.asnLookupAnother} — ${t.asnQueryLabel}` : t.asnQueryLabel}
        submitLabel={t.asnLookupButton}
        loadingLabel={t.asnLookingUp}
        loading={loading}
        onCancel={cancel}
        cancelLabel={t.cancelLookup}
        onSubmit={submit}
        inputError={inputError}
        compact={hasResult}
      />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {result?.found ? `${result.asn}: ${result.name || t.asnTitle}` : ""}
      </div>

      {!loading && !error && !result && (
        <EmptyState
          icon={Waypoints}
          title={t.asnEmptyTitle}
          description={t.asnEmptyDescription}
        />
      )}

      {loading && <LoadingSkeleton label={t.lookupInProgress} />}

      {error && !inputError && <ErrorPanel message={error} />}

      {result && !result.found && (
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>{t.asnNotFoundTitle}</AlertTitle>
          <AlertDescription>{t.asnNotFoundDescription}</AlertDescription>
        </Alert>
      )}

      {result && result.found && (
        <div className="tool-reveal flex flex-col gap-4">
          {/* Summary: identity + key figures in one card */}
          <section aria-label={`${result.asn} — ${t.asnTitle}`} className="flex flex-col">
            <AsnSummaryCard result={result} t={t} locale={locale} />
            {!showSourceInfo && (
              <div className="flex justify-end pt-1">
                <a
                  href="?source-info=1"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  {result.warnings.length > 0
                    ? `${result.warnings.length} ${t.asnWarnings}`
                    : t.asnViewSourceDiagnostics}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              </div>
            )}
          </section>

          {showSourceInfo && result.warnings.length > 0 && (
            <Alert variant="warning">
              <AlertTriangle />
              <AlertTitle>{t.asnWarnings}</AlertTitle>
              <AlertDescription>
                <ul className="space-y-1">
                  {result.warnings.map((warning) => (
                    <li key={warning}>{formatWarning(warning, t, locale)}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Detail: tabbed instead of a stack of competing cards */}
          <Card className="p-5 sm:p-6">
            <AsnDetailTabs
              routingLabel={t.asnRouting}
              routingCount={routingCount}
              prefixesLabel={t.asnPrefixes}
              prefixesCount={prefixesCount}
              peeringLabel={t.asnInterconnectionOverview}
              sourcesLabel={t.asnSourceDiagnostics}
              routingShortLabel={t.asnRoutingShort}
              prefixesShortLabel={t.asnPrefixesShort}
              peeringShortLabel={t.asnPeeringShort}
              sourcesShortLabel={t.asnSourcesShort}
              showSources={showSourceInfo}
              locale={locale}
              initialTab={initialDetailTab}
              navigationLabel={t.asnDetailsNavigation}
            >
              <TabsContent value="routing" className="pt-4 data-[state=inactive]:hidden" forceMount>
                <RoutingSection result={result} t={t} locale={locale} />
              </TabsContent>

              <TabsContent value="prefixes" className="pt-4 data-[state=inactive]:hidden" forceMount>
                <PrefixSection result={result} t={t} locale={locale} />
              </TabsContent>

              <TabsContent value="peering" className="pt-4 data-[state=inactive]:hidden" forceMount>
                <AsnInterconnectionWorkspace result={result} t={t} locale={locale} />
              </TabsContent>

              {showSourceInfo && (
                <TabsContent value="sources" className="pt-4 data-[state=inactive]:hidden" forceMount>
                  <SourceDiagnosticsSection result={result} t={t} locale={locale} />
                </TabsContent>
              )}
            </AsnDetailTabs>
          </Card>
        </div>
      )}
    </div>
  );
}
