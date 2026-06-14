"use client";

import { AlertTriangle, CircleCheck, Globe } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import { getCountryFlag } from "@/lib/format";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <Card className="gap-0 overflow-hidden py-0">
      <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/20 to-info/40" />

      <div className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {result.country && (
              <Badge variant="secondary">
                {flag && <span className="text-sm leading-none">{flag}</span>}
                {result.country}
              </Badge>
            )}
            {result.type && (
              <Badge variant="outline" className={typeClass}>
                {result.type}
              </Badge>
            )}
            {result.registry && (
              <Badge variant="secondary" className="text-muted-foreground">
                {result.registry}
              </Badge>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight break-words text-foreground md:text-3xl">
            <span className="mr-2 font-mono text-primary">{result.asn}</span>
            <span className="text-foreground/90">{result.name || t.asnUnnamed}</span>
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {result.domain && (
              <a
                href={`https://${result.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary transition-colors hover:underline"
              >
                <Globe className="size-3.5" />
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

        <div className="shrink-0">
          {isPartial ? (
            <Badge variant="warning">
              <AlertTriangle className="size-3.5" />
              {t.asnPartialData}
            </Badge>
          ) : (
            <Badge variant="success">
              <CircleCheck className="size-3.5" />
              {t.asnCompleteData}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
