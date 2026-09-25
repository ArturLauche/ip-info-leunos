"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, Waypoints } from "lucide-react";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { TabsContent } from "@/components/ui/tabs";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { AsnValidationError, normalizeAsnInput } from "@/lib/asn-id";
import type { AsnProfile } from "@/lib/asn";
import type { Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { AsnDetailTabs, type DetailTab } from "./detail-tabs";
import { FacilitySection } from "./facility-section";
import {
  hasSourceInfoFlag,
  knownTotal,
  lookupErrorMessage,
  prefixTotal,
  routingTotal,
  validationErrorMessage,
} from "./helpers";
import { IxPresenceSection } from "./ix-presence-section";
import { LoadingSkeleton } from "./loading-skeleton";
import { ExampleAsns, LookupError, NotFoundState } from "./lookup-states";
import { PeeringDbProfileSection } from "./peeringdb-profile-section";
import { PrefixSection } from "./prefix-section";
import { RoutingSection } from "./routing-section";
import { SourceDiagnosticsSection } from "./source-diagnostics-section";
import { AsnSummaryCard } from "./summary-card";

interface AsnCheckerProps {
  locale: Locale;
  initialAsn?: string;
}

function isValidAsn(value: string) {
  try {
    normalizeAsnInput(value);
    return true;
  } catch {
    return false;
  }
}

export function AsnChecker({ locale, initialAsn = "" }: AsnCheckerProps) {
  const t = getToolTranslation(locale);
  const [showSourceInfo, setShowSourceInfo] = useState(false);
  const [inputError, setInputError] = useState(false);
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
    // Also handles client-side validation errors (see showError below), so
    // the message is re-derived from the current locale on every render.
    mapError: (lookupError) =>
      lookupError instanceof AsnValidationError
        ? validationErrorMessage(lookupError, t, locale)
        : lookupErrorMessage(lookupError, t),
    initialQuery,
    onStart: () => {
      setShowSourceInfo(hasSourceInfoFlag());
      setInputError(false);
    },
  });

  const submit = useCallback(
    (value: string) => {
      try {
        const asn = normalizeAsnInput(value).asn;
        setInputError(false);
        run(asn);
      } catch (validationError) {
        setInputError(true);
        showError(validationError);
      }
    },
    // `t`/`locale` are intentionally absent: validation errors are stored raw
    // and mapped via the hook's mapError, which already closes over them.
    [run, showError],
  );

  // Network, rate-limit and provider failures are worth repeating in place;
  // input the client already rejected (or the API would reject) is not.
  const retryQuery = error && !inputError && isValidAsn(querySync.query) ? querySync.query : "";
  const retry = useCallback(() => {
    if (retryQuery) run(retryQuery, false);
  }, [retryQuery, run]);

  // Re-sync the source-info flag whenever the URL changes under us. Reacting
  // to searchParams (not hashchange/popstate) also covers client-side
  // pushState navigations from the command palette or in-page links.
  const sourceInfoInUrl = searchParams.has("source-info") || searchParams.has("sourceInfo");

  useEffect(() => {
    setShowSourceInfo(sourceInfoInUrl || window.location.hash === "#source-info");
  }, [sourceInfoInUrl]);

  // Once a lookup is running or answered, the form steps back to a quiet
  // toolbar so the result owns the hierarchy. Keeping it compact while a new
  // lookup loads avoids the form growing and shrinking around the skeleton.
  const compact = loading || Boolean(result);

  const tabs: DetailTab[] = result
    ? [
        { value: "routing", label: t.asnTabRouting, count: knownTotal(result, routingTotal(result)) },
        { value: "prefixes", label: t.asnTabPrefixes, count: knownTotal(result, prefixTotal(result)) },
        { value: "peering", label: t.asnTabPeering },
      ]
    : [];
  if (result && showSourceInfo) {
    tabs.push({
      value: "sources",
      label: t.asnTabSources,
      count: result.warnings.length > 0 ? result.warnings.length : null,
      countLabel: t.asnWarnings,
      tone: "warning",
    });
  }

  const announcement = result
    ? result.found
      ? `${result.asn} ${result.name}`.trim()
      : `${result.asn}: ${t.asnNotFoundTitle}`
    : "";

  return (
    <div className="flex w-full flex-col gap-5">
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
        compact={compact}
      />

      {!loading && !error && !result && (
        <EmptyState icon={Waypoints} title={t.asnEmptyTitle} description={t.asnEmptyDescription}>
          <ExampleAsns t={t} sourceInfo={showSourceInfo} />
        </EmptyState>
      )}

      {loading && <LoadingSkeleton label={t.lookupInProgress} />}

      {error && <LookupError message={error} onRetry={retryQuery ? retry : undefined} t={t} />}

      {result && !result.found && (
        <div className="tool-reveal">
          <NotFoundState result={result} t={t} />
        </div>
      )}

      {result && result.found && (
        <div className="tool-reveal flex flex-col gap-4">
          <section aria-label={`${result.asn} — ${t.asnTitle}`} className="flex flex-col">
            <AsnSummaryCard result={result} t={t} locale={locale} />
          </section>

          <Card className="gap-0 p-0">
            <AsnDetailTabs tabs={tabs} label={t.asnDetailNavLabel} locale={locale}>
              <TabsContent value="routing">
                <RoutingSection result={result} t={t} locale={locale} />
              </TabsContent>

              <TabsContent value="prefixes">
                <PrefixSection result={result} t={t} locale={locale} />
              </TabsContent>

              <TabsContent value="peering">
                {result.peeringdb ? (
                  <div className="flex flex-col gap-8">
                    <PeeringDbProfileSection profile={result.peeringdb} t={t} locale={locale} />
                    <div className="border-t border-border/60 pt-8">
                      <IxPresenceSection result={result} t={t} locale={locale} />
                    </div>
                    <div className="border-t border-border/60 pt-8">
                      <FacilitySection
                        facilities={result.peeringdb.facilities}
                        total={result.peeringdb.facilitiesTotal}
                        asnNumber={result.asnNumber}
                        t={t}
                        locale={locale}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/80 px-6 py-10 text-center">
                    <Building2 className="size-5 text-muted-foreground/60" aria-hidden />
                    <p className="max-w-sm text-sm text-muted-foreground">{t.asnWarningNoPeeringDbProfile}</p>
                  </div>
                )}
              </TabsContent>

              {showSourceInfo && (
                <TabsContent value="sources">
                  <SourceDiagnosticsSection result={result} t={t} locale={locale} />
                </TabsContent>
              )}
            </AsnDetailTabs>
          </Card>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
