"use client";

import { useCallback, useMemo } from "react";
import { AlertTriangle, Waypoints } from "lucide-react";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useToolLookup } from "@/hooks/use-tool-lookup";
import { normalizeAsnInput } from "@/lib/asn-id";
import type { AsnProfile } from "@/lib/asn";
import type { Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { AsnDetailTabs } from "./asn-detail-tabs";
import { AsnOverview } from "./asn-overview";
import { hasSourceInfoFlag, lookupErrorMessage, validationErrorMessage } from "./helpers";
import { LoadingSkeleton } from "./loading-skeleton";

interface AsnCheckerProps {
  locale: Locale;
  initialAsn?: string;
}

const EXAMPLE_ASNS = ["AS15169", "AS3320", "AS1299", "AS8881"];

export function AsnChecker({ locale, initialAsn = "" }: AsnCheckerProps) {
  const t = getToolTranslation(locale);

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

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={initialAsn}
        placeholder={t.asnPlaceholder}
        submitLabel={t.asnLookupButton}
        loadingLabel={t.asnLookingUp}
        loading={loading}
        onSubmit={submit}
      />

      {!loading && !error && !result && (
        <EmptyState icon={Waypoints} title={t.asnEmptyTitle} description={t.asnEmptyDescription}>
          <div className="flex flex-col items-center gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.asnTryExample}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_ASNS.map((example) => (
                <Button
                  key={example}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-mono"
                  onClick={() => submit(example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </EmptyState>
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
        <div className="tool-reveal flex flex-col gap-6">
          <AsnOverview result={result} t={t} locale={locale} />
          <AsnDetailTabs result={result} t={t} locale={locale} />
        </div>
      )}
    </div>
  );
}
