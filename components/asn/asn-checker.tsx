"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Waypoints } from "lucide-react";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { normalizeAsnInput } from "@/lib/asn-id";
import type { AsnProfile } from "@/lib/asn";
import type { Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { FacilitySection } from "./facility-section";
import { hasSourceInfoFlag, formatWarning, lookupErrorMessage, validationErrorMessage } from "./helpers";
import { HeroHeader } from "./hero-header";
import { IxPresenceSection } from "./ix-presence-section";
import { LoadingSkeleton } from "./loading-skeleton";
import { PeeringDbProfileSection } from "./peeringdb-profile-section";
import { PrefixSection } from "./prefix-section";
import { QuickStats } from "./quick-stats";
import { RoutingSection } from "./routing-section";
import { SourceDiagnosticsSection } from "./source-diagnostics-section";

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

  const { loading, error, result, run, showError, cancel, querySync } = useToolLookup<AsnProfile>({
    buildApiUrl: (asn) =>
      `/api/asn/${encodeURIComponent(asn)}${hasSourceInfoFlag() ? "?source-info=1" : ""}`,
    buildHref: (asn) => `/asn/${asn}${hasSourceInfoFlag() ? "?source-info=1" : ""}`,
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
  const sourceInfoInUrl = searchParams.has("source-info") || searchParams.has("sourceInfo");

  useEffect(() => {
    setShowSourceInfo(sourceInfoInUrl || window.location.hash === "#source-info");
  }, [sourceInfoInUrl]);

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={querySync.query}
        syncKey={querySync.revision}
        placeholder={t.asnPlaceholder}
        submitLabel={t.asnLookupButton}
        loadingLabel={t.asnLookingUp}
        loading={loading}
        onCancel={cancel}
        cancelLabel={t.cancelLookup}
        onSubmit={submit}
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
          <Card className="flex flex-col gap-5 p-5 sm:p-6">
            <HeroHeader result={result} t={t} />
            <QuickStats result={result} t={t} locale={locale} />
          </Card>

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
            <Tabs defaultValue="routing">
              <TabsList className="h-auto min-h-12 w-full justify-start overflow-x-auto p-1 sm:w-fit">
                <TabsTrigger value="routing" className="min-h-11 py-2">{t.asnRouting}</TabsTrigger>
                <TabsTrigger value="prefixes" className="min-h-11 py-2">{t.asnPrefixes}</TabsTrigger>
                <TabsTrigger value="peering" className="min-h-11 py-2">{t.asnPeeringDb}</TabsTrigger>
                {showSourceInfo && (
                  <TabsTrigger value="sources" className="min-h-11 py-2">{t.asnSourceDiagnostics}</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="routing" className="pt-4">
                <RoutingSection result={result} t={t} locale={locale} />
              </TabsContent>

              <TabsContent value="prefixes" className="pt-4">
                <PrefixSection result={result} t={t} locale={locale} />
              </TabsContent>

              <TabsContent value="peering" className="pt-4">
                <div className="flex flex-col gap-8">
                  {result.peeringdb ? (
                    <PeeringDbProfileSection profile={result.peeringdb} t={t} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t.asnWarningNoPeeringDbProfile}
                    </p>
                  )}
                  <IxPresenceSection result={result} t={t} locale={locale} />
                  <FacilitySection
                    facilities={result.peeringdb?.facilities ?? []}
                    total={result.peeringdb?.facilitiesTotal ?? 0}
                    t={t}
                    locale={locale}
                  />
                </div>
              </TabsContent>

              {showSourceInfo && (
                <TabsContent value="sources" className="pt-4">
                  <SourceDiagnosticsSection result={result} t={t} locale={locale} />
                </TabsContent>
              )}
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  );
}
