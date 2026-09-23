"use client";

import Link from "next/link";
import { RotateCw, SearchX, TriangleAlert } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SourceStatusList } from "./source-status";

/** Well-known networks of different shapes: content, cloud, eyeball ISP. */
const EXAMPLE_ASNS = ["AS13335", "AS15169", "AS3320"];

export function ExampleAsns({ t }: { t: ToolTranslation }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="text-xs text-muted-foreground">{t.asnExamplesLabel}</span>
      {EXAMPLE_ASNS.map((asn) => (
        <Link
          key={asn}
          href={`/asn/${asn}`}
          prefetch={false}
          className="inline-flex h-8 items-center rounded-md border border-border bg-background px-2.5 font-mono text-xs font-medium text-foreground/85 outline-none transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 pointer-coarse:h-11 dark:bg-input/30"
        >
          {asn}
        </Link>
      ))}
    </div>
  );
}

/**
 * A valid ASN that no provider knows. Framed like the result card (identity
 * first, provenance strip last) so it reads as an answer, not a failure.
 */
export function NotFoundState({ result, t }: { result: AsnProfile; t: ToolTranslation }) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border ring-inset">
          <SearchX className="size-5" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-mono text-sm font-semibold text-foreground">{result.asn}</p>
          <h2 className="text-base font-semibold tracking-tight text-foreground">{t.asnNotFoundTitle}</h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{t.asnNotFoundDescription}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 border-t border-border/60 bg-muted/30 px-5 py-2.5 text-xs sm:px-6">
        <span className="text-muted-foreground">{t.asnSourcesLabel}</span>
        <SourceStatusList sources={result.sources} t={t} />
      </div>
    </Card>
  );
}

/** Lookup failure with an in-place retry when repeating the request can help. */
export function LookupError({
  message,
  onRetry,
  t,
}: {
  message: string;
  onRetry?: () => void;
  t: ToolTranslation;
}) {
  return (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertDescription className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="min-w-0">{message}</span>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="min-h-11 text-foreground sm:min-h-8"
          >
            <RotateCw aria-hidden />
            {t.errorRetry}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
