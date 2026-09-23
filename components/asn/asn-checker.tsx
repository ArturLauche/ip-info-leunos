"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Building2, Waypoints } from "lucide-react";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { TabsContent } from "@/components/ui/tabs";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { normalizeAsnInput } from "@/lib/asn-id";
import type { AsnProfile, AsnWarningDetail } from "@/lib/asn";
import type { Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { AsnDetailTabs } from "./detail-tabs";
import { FacilitySection } from "./facility-section";
import {
  formatWarning,
  hasSourceInfoFlag,
  lookupErrorMessage,
  validationErrorMessage,
} from "./helpers";
import { IxPresenceSection } from "./ix-presence-section";
import { LoadingSkeleton } from "./loading-skeleton";
import { PeeringDbProfileSection } from "./peeringdb-profile-section";
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

  const { loading, error, result, run, showError, cancel, querySync } =
    useToolLookup<AsnProfile>({
      buildApiUrl: (asn) =>
        `/api/asn/${encodeURIComponent(asn)}${hasSourceInfoFlag() ? "?source-info=1" : ""}`,
      buildHref: (asn) =>
        `/asn/${asn}${hasSourceInfoFlag() ? "?source-info=1" : ""}`,
      mapError: (lookupError) => lookupErrorMessage(lookupError, t),
      initialQuery,
      onStart: () => setShowSourceInfo(hasSourceInfoFlag()),
    });

  const submit = useCallback(
    (value: string) => {
      try {
        run(normalizeAsnInput(value).asn);
      } catch (validationError) {
        showError(validationErrorMessage(validationError, t, locale));
      }
    },
    [locale, run, showError, t],
  );

  // Re-sync the source-info flag whenever the URL changes under us. Reacting
  // to searchParams (not hashchange/popstate) also covers client-side
  // pushState navigations from the command palette or in-page links.
  const sourceInfoInUrl =
    searchParams.has("source-info") || searchParams.has("sourceInfo");

  useEffect(() => {
    setShowSourceInfo(
      sourceInfoInUrl || window.location.hash === "#source-info",
    );
  }, [sourceInfoInUrl]);

  // Once a profile is on screen the form steps back to a quiet toolbar so the
  // result owns the visual hierarchy; empty/error states keep it prominent.
  const hasResult = Boolean(result && result.found);

  const routingCount = result
    ? (result.peersTotal || 0) +
      (result.upstreamsTotal || 0) +
      (result.downstreamsTotal || 0)
    : null;
  const prefixesCount = result
    ? (result.prefixes4Total || 0) + (result.prefixes6Total || 0)
    : null;

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={querySync.query}
        syncKey={querySync.revision}
        placeholder={t.asnPlaceholder}
        ariaLabel={t.asnTitle}
        submitLabel={t.asnLookupButton}
        loadingLabel={t.asnLookingUp}
        loading={loading}
        onCancel={cancel}
        cancelLabel={t.cancelLookup}
        onSubmit={submit}
        compact={hasResult}
      />

      {!loading && !error && !result && (
        <EmptyState
          icon={Waypoints}
          title={t.asnEmptyTitle}
          description={t.asnEmptyDescription}
        />
      )}

      {loading && <LoadingSkeleton label={t.lookupInProgress} />}

      {error && <ErrorPanel message={error} />}

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
          <section
            aria-label={`${result.asn} — ${t.asnTitle}`}
            className="flex flex-col"
          >
            <AsnSummaryCard result={result} t={t} locale={locale} />
          </section>

          {showSourceInfo && result.warnings.length > 0 && (
            <Alert variant="warning">
              <AlertTriangle />
              <AlertTitle>{t.asnWarnings}</AlertTitle>
              <AlertDescription>
                <ul className="space-y-1">
                  {result.warnings.map((warning, index) => {
                    const detail: AsnWarningDetail | undefined =
                      result.warningDetails?.[index];
                    return (
                      <li
                        key={
                          detail
                            ? `${detail.code}-${index}`
                            : `${warning}-${index}`
                        }
                      >
                        {formatWarning(detail ?? warning, t, locale)}
                      </li>
                    );
                  })}
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
              peeringLabel={t.asnPeeringDb}
              sourcesLabel={t.asnSourceDiagnostics}
              showSources={showSourceInfo}
              locale={locale}
            >
              <TabsContent value="routing" className="pt-4">
                <RoutingSection result={result} t={t} locale={locale} />
              </TabsContent>

              <TabsContent value="prefixes" className="pt-4">
                <PrefixSection result={result} t={t} locale={locale} />
              </TabsContent>

              <TabsContent value="peering" className="pt-4">
                {result.peeringdb ? (
                  <div className="flex flex-col gap-7">
                    <PeeringDbProfileSection
                      profile={result.peeringdb}
                      t={t}
                      locale={locale}
                    />
                    <div className="border-t border-border/60 pt-7">
                      <IxPresenceSection
                        result={result}
                        t={t}
                        locale={locale}
                      />
                    </div>
                    <div className="border-t border-border/60 pt-7">
                      <FacilitySection
                        facilities={result.peeringdb.facilities}
                        total={result.peeringdb.facilitiesTotal}
                        t={t}
                        locale={locale}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/70 px-6 py-10 text-center">
                    <Building2
                      className="size-5 text-muted-foreground/50"
                      aria-hidden
                    />
                    <p className="text-sm text-muted-foreground">
                      {t.asnWarningNoPeeringDbProfile}
                    </p>
                  </div>
                )}
              </TabsContent>

              {showSourceInfo && (
                <TabsContent value="sources" className="pt-4">
                  <SourceDiagnosticsSection
                    result={result}
                    t={t}
                    locale={locale}
                  />
                </TabsContent>
              )}
            </AsnDetailTabs>
          </Card>
        </div>
      )}
    </div>
  );
}
