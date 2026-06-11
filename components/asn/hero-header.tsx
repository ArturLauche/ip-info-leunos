"use client";

import { AlertTriangle, CircleCheck, Globe } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import { getCountryFlag } from "@/lib/format";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { getTypeBadgeClass } from "./helpers";

export function HeroHeader({ result, t }: { result: AsnProfile; t: ToolTranslation }) {
  const flag = getCountryFlag(result.country);
  const typeClass = getTypeBadgeClass(result.type);
  const isPartial =
    result.sources.ipinfo !== "available" ||
    result.sources.peeringdb !== "available" ||
    result.sources.ripestat !== "available" ||
    result.warnings.length > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/45 p-6 shadow-md backdrop-blur-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary/10 to-primary/30" />

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {result.country && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                {flag && <span className="mr-0.5 text-sm leading-none">{flag}</span>}
                {result.country}
              </span>
            )}
            {result.type && (
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeClass}`}>
                {result.type}
              </span>
            )}
            {result.registry && (
              <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {result.registry}
              </span>
            )}
          </div>

          <h2 className="mt-4 break-words text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            <span className="mr-2 font-mono text-primary">{result.asn}</span>
            <span className="text-foreground/90">{result.name || t.asnUnnamed}</span>
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {result.domain && (
              <a
                href={`https://${result.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary transition-colors hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                {result.domain}
              </a>
            )}
            {result.allocated && (
              <span className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {t.asnLabelAllocated}:
                </span>
                <span className="text-foreground/80">{result.allocated}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center md:self-start">
          {isPartial ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              {t.asnPartialData}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300">
              <CircleCheck className="h-3.5 w-3.5 text-emerald-400" />
              {t.asnCompleteData}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
