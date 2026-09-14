"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Waypoints } from "lucide-react";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { normalizeAsnInput } from "@/lib/asn-id";
import type { AsnProfile } from "@/lib/asn";
import type { Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
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
            <AsnDetailTabs
              routingLabel={t.asnRouting}
              prefixesLabel={t.asnPrefixes}
              peeringLabel={t.asnPeeringDb}
              sourcesLabel={t.asnSourceDiagnostics}
              showSources={showSourceInfo}
            >
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
            </AsnDetailTabs>
          </Card>
        </div>
      )}
    </div>
  );
}

function AsnDetailTabs({
  routingLabel,
  prefixesLabel,
  peeringLabel,
  sourcesLabel,
  showSources,
  children,
}: {
  routingLabel: string;
  prefixesLabel: string;
  peeringLabel: string;
  sourcesLabel: string;
  showSources: boolean;
  children: ReactNode;
}) {
  const [tab, setTab] = useState("routing");
  const { containerRef, view, canAnimate, radius } = useSegmentHighlight(tab);

  // The sources tab only exists behind the source-info flag; fall back to
  // routing if the flag disappears while sources is selected.
  useEffect(() => {
    if (!showSources) {
      setTab((current) => (current === "sources" ? "routing" : current));
    }
  }, [showSources]);

  const triggers: Array<{ value: string; label: string }> = [
    { value: "routing", label: routingLabel },
    { value: "prefixes", label: prefixesLabel },
    { value: "peering", label: peeringLabel },
  ];
  if (showSources) {
    triggers.push({ value: "sources", label: sourcesLabel });
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <div ref={containerRef} className="relative isolate">
        <span
          className="tool-segment-highlight"
          style={{
            transform: `translate3d(${view.box.x}px, ${view.box.y}px, 0)`,
            width: view.box.width,
            height: view.box.height,
            opacity: view.visible ? 1 : 0,
            borderRadius: radius || undefined,
          }}
          data-animate={canAnimate ? "true" : undefined}
          data-slide={view.slide ? "true" : undefined}
          aria-hidden
        />
        <TabsList className="h-auto min-h-12 w-full justify-start overflow-x-auto p-1 sm:w-fit">
          {triggers.map((trigger) => (
            <TabsTrigger
              key={trigger.value}
              value={trigger.value}
              className={cn(
                "relative z-10 min-h-11 shrink-0 py-2 transition-[color,background-color,box-shadow,border-color] duration-200 ease-[var(--ease-smooth)]",
                view.visible &&
                  "data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent",
              )}
            >
              {trigger.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div key={tab} className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
        {children}
      </div>
    </Tabs>
  );
}
