"use client";

import { AlertTriangle, CircleCheck, Globe, Waypoints } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import { CountryFlag } from "@/components/country-flag";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function HeroHeader({ result, t }: { result: AsnProfile; t: ToolTranslation }) {
  const isPartial =
    result.sources.ipinfo !== "available" ||
    result.sources.peeringdb !== "available" ||
    result.sources.ripestat !== "available" ||
    result.warnings.length > 0;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-5 py-3.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Waypoints className="size-4" aria-hidden />
          </span>
          <span className="font-mono text-sm font-semibold text-foreground">
            {result.asn}
          </span>
          {result.country && (
            <Badge variant="secondary">
              <CountryFlag countryCode={result.country} />
              {result.country}
            </Badge>
          )}
          {result.type && (
            <Badge variant="secondary" className="capitalize">
              {result.type}
            </Badge>
          )}
          {result.registry && (
            <Badge variant="secondary" className="text-muted-foreground">
              {result.registry}
            </Badge>
          )}
        </div>

        {isPartial ? (
          <Badge variant="warning">
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            {t.asnPartialData}
          </Badge>
        ) : (
          <Badge variant="success">
            <CircleCheck className="size-3.5" aria-hidden="true" />
            {t.asnCompleteData}
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-3 p-6">
        <h2 className="text-lg font-semibold tracking-tight break-words text-foreground sm:text-xl">
          <span className="mr-2 font-mono">{result.asn}</span>
          <span className="text-foreground/90">{result.name || t.asnUnnamed}</span>
        </h2>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          {result.domain && (
            <a
              href={`https://${result.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary transition-colors hover:underline"
            >
              <Globe className="size-3.5" aria-hidden="true" />
              {result.domain}
            </a>
          )}
          {result.allocated && (
            <span className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {t.asnLabelAllocated}:
              </span>
              <span className="text-foreground/80">{result.allocated}</span>
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
