"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Waypoints } from "lucide-react";
import dynamic from "next/dynamic";
import { useI18n } from "@/components/i18n-provider";
import { ToolSearchForm } from "@/components/tool-search-form";
import { EmptyState } from "@/components/empty-state";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { AsnValidationError, normalizeAsnInput } from "@/lib/asn-id";
import type { AsnProfile } from "@/lib/asn";
import {
  hasSourceInfoFlag,
  lookupErrorMessage,
  validationErrorMessage,
} from "./helpers";
import { LoadingSkeleton } from "./loading-skeleton";
import { ExampleAsns, LookupError, NotFoundState } from "./lookup-states";

const loadAsnResult = () => import("./asn-result");
// Preloaded right after mount (see below), so a lookup result normally finds
// the module ready. If it does not, the same skeleton as the lookup stays up
// (the result's own live-region announcement covers screen readers).
const AsnResultView = dynamic(
  () => loadAsnResult().then((module) => module.AsnResultView),
  { loading: () => <LoadingSkeleton label="" /> },
);

interface AsnCheckerProps {
  initialAsn?: string;
}

export function AsnChecker({ initialAsn = "" }: AsnCheckerProps) {
  const { locale, tool: t } = useI18n();
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

  const { loading, error, result, run, retry, showError, cancel, querySync } = useToolLookup<AsnProfile>({
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

  useEffect(() => {
    void loadAsnResult();
  }, []);

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

      {/* The hook only offers retry for transient failures, never for input
          the client or API rejected. */}
      {error && <LookupError message={error} onRetry={inputError ? undefined : retry} t={t} />}

      {result && !result.found && (
        <div className="tool-reveal">
          <NotFoundState result={result} t={t} />
        </div>
      )}

      {result && result.found && (
        <AsnResultView result={result} showSourceInfo={showSourceInfo} t={t} locale={locale} />
      )}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
