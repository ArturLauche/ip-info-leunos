"use client";

import Link from "next/link";
import {
  Building2,
  RotateCw,
  Route,
  SearchX,
  Share2,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SourceStatusList } from "./source-status";

/**
 * Well-known networks of different shapes: content, cloud, eyeball ISP. The
 * names are proper nouns, so they need no translation.
 */
const EXAMPLE_ASNS = [
  { asn: "AS13335", name: "Cloudflare" },
  { asn: "AS15169", name: "Google" },
  { asn: "AS3320", name: "Deutsche Telekom" },
];

export function ExampleAsns({
  t,
  sourceInfo = false,
  align = "center",
}: {
  t: ToolTranslation;
  sourceInfo?: boolean;
  align?: "center" | "start";
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        align === "center" ? "justify-center" : "justify-start",
      )}
    >
      <span className="text-xs text-muted-foreground">{t.asnExamplesLabel}</span>
      {EXAMPLE_ASNS.map(({ asn, name }) => (
        <Link
          key={asn}
          href={`/asn/${asn}${sourceInfo ? "?source-info=1" : ""}`}
          prefetch={false}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2.5 outline-none transition-colors hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring/60 pointer-coarse:h-11 dark:bg-input/30"
        >
          <span className="font-mono text-xs font-medium text-foreground">{asn}</span>
          <span className="text-xs text-muted-foreground">{name}</span>
        </Link>
      ))}
    </div>
  );
}

/**
 * What a lookup returns, one column per detail area, built from the copy the
 * result tabs already use (titles match the tabs a typical lookup shows). It
 * sits under the empty state so the first screen explains the tool instead of
 * leaving a blank form.
 */
export function AsnCapabilities({ t }: { t: ToolTranslation }) {
  const items: { key: string; icon: LucideIcon; title: string; description: string }[] = [
    { key: "routing", icon: Share2, title: t.asnTabRouting, description: t.asnRoutingDescription },
    { key: "prefixes", icon: Route, title: t.asnTabPrefixes, description: t.asnPrefixesDescription },
    { key: "peering", icon: Building2, title: t.asnPeeringDb, description: t.asnPeeringDbDescription },
  ];

  return (
    <ul className="grid divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {items.map(({ key, icon: Icon, title, description }) => (
        <li key={key} className="flex items-start gap-3 px-5 py-4 sm:p-5">
          <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * A valid ASN that no provider knows. Framed like the result card (identity
 * first, provenance strip last) so it reads as an answer, not a failure, and
 * offers known-good ASNs as the way forward.
 */
export function NotFoundState({
  result,
  t,
  sourceInfo = false,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  sourceInfo?: boolean;
}) {
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
          <div className="mt-3">
            <ExampleAsns t={t} sourceInfo={sourceInfo} align="start" />
          </div>
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
    <Alert variant="destructive" className="tool-section-reveal">
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
