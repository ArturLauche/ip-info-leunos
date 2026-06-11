"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Waypoints } from "lucide-react";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { normalizeAsnInput, type AsnProfile } from "@/lib/asn";
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

  const { loading, error, result, run, showError } = useToolLookup<AsnProfile>({
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

  useEffect(() => {
    const syncSourceInfoFlag = () => {
      setShowSourceInfo(hasSourceInfoFlag());
    };

    syncSourceInfoFlag();
    window.addEventListener("hashchange", syncSourceInfoFlag);
    window.addEventListener("popstate", syncSourceInfoFlag);

    return () => {
      window.removeEventListener("hashchange", syncSourceInfoFlag);
      window.removeEventListener("popstate", syncSourceInfoFlag);
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-8">
      <ToolSearchForm
        initialValue={initialAsn}
        placeholder={t.asnPlaceholder}
        submitLabel={t.asnLookupButton}
        loadingLabel={t.asnLookingUp}
        loading={loading}
        onSubmit={submit}
      />

      {!loading && !error && !result && (
        <div className="rounded-xl border border-border/80 bg-card/70 p-6 text-center shadow-sm">
          <Waypoints className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-lg font-semibold text-foreground">{t.asnEmptyTitle}</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">{t.asnEmptyDescription}</p>
        </div>
      )}

      {loading && <LoadingSkeleton />}

      {error && <ErrorPanel message={error} />}

      {result && !result.found && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 shadow-sm">
          <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            {t.asnNotFoundTitle}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t.asnNotFoundDescription}</p>
        </div>
      )}

      {result && result.found && (
        <div className="flex flex-col gap-6 duration-300 animate-in fade-in slide-in-from-bottom-2">
          <HeroHeader result={result} t={t} />

          {showSourceInfo && result.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                {t.asnWarnings}
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {result.warnings.map((warning) => (
                  <li key={warning}>{formatWarning(warning, t, locale)}</li>
                ))}
              </ul>
            </div>
          )}

          <QuickStats result={result} t={t} locale={locale} />
          <RoutingSection result={result} t={t} locale={locale} />
          <IxPresenceSection result={result} t={t} />
          <PrefixSection result={result} t={t} />

          {result.peeringdb && <PeeringDbProfileSection profile={result.peeringdb} t={t} />}
          {result.peeringdb && (
            <FacilitySection facilities={result.peeringdb.facilities} total={result.peeringdb.facilitiesTotal} t={t} />
          )}

          {showSourceInfo && <SourceDiagnosticsSection result={result} t={t} locale={locale} />}
        </div>
      )}
    </div>
  );
}
