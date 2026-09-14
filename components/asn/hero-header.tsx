"use client";

import { AlertTriangle, CircleCheck, Globe, Waypoints } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import { CountryFlag } from "@/components/country-flag";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Badge } from "@/components/ui/badge";

// Identity block rendered inside the summary card: mono ASN + name, a quiet
// plain-text metadata line (country, type, registry, allocation, domain),
// and a single semantic data-quality badge.
export function HeroHeader({ result, t }: { result: AsnProfile; t: ToolTranslation }) {
  const isPartial =
    result.sources.ipinfo !== "available" ||
    result.sources.peeringdb !== "available" ||
    result.sources.ripestat !== "available" ||
    result.warnings.length > 0;

  const meta: string[] = [];
  if (result.type) meta.push(result.type);
  if (result.registry) meta.push(result.registry);
  if (result.allocated) meta.push(`${t.asnLabelAllocated} ${result.allocated}`);

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Waypoints className="size-4" aria-hidden />
          </span>
          <h2 className="min-w-0 text-xl font-semibold tracking-tight break-words text-foreground">
            <span className="mr-2 font-mono">{result.asn}</span>
            <span className="text-foreground/90">{result.name || t.asnUnnamed}</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-[2.75rem] text-xs text-muted-foreground">
          {result.country && (
            <span className="inline-flex items-center gap-1 font-medium">
              <CountryFlag countryCode={result.country} />
              {result.country}
            </span>
          )}
          {meta.map((entry) => (
            <span key={entry} className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="text-muted-foreground/50">
                ·
              </span>
              <span className="break-words">{entry}</span>
            </span>
          ))}
          {result.domain && (
            <span className="inline-flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className="text-muted-foreground/50">
                ·
              </span>
              <a
                href={`https://${result.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 items-center gap-1 rounded-sm font-medium break-all text-primary outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <Globe className="size-3.5" aria-hidden />
                {result.domain}
              </a>
            </span>
          )}
        </div>
      </div>

      {isPartial ? (
        <Badge variant="warning" className="shrink-0">
          <AlertTriangle className="size-3.5" />
          {t.asnPartialData}
        </Badge>
      ) : (
        <Badge variant="success" className="shrink-0">
          <CircleCheck className="size-3.5" />
          {t.asnCompleteData}
        </Badge>
      )}
    </div>
  );
}
