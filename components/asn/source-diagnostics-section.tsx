"use client";

import { Binary } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { formatCacheStatus, formatStatus, sourceBadgeClass } from "./helpers";

export function SourceDiagnosticsSection({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/35 p-5 shadow-sm md:p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Binary className="h-5 w-5 text-primary" />
        {t.asnSourceDiagnostics}
      </h3>

      <div className="flex flex-wrap gap-3">
        {Object.entries(result.sources).map(([source, status]) => (
          <span
            key={source}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${sourceBadgeClass(status)}`}
          >
            {source}: {formatStatus(status, t)}
          </span>
        ))}
      </div>

      {result.sourceDiagnostics && result.sourceDiagnostics.length > 0 && (
        <div className="mt-2 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            {t.asnDetailedDiagnostics}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {result.sourceDiagnostics.map((diagnostic) => (
              <div
                key={diagnostic.source}
                className="flex flex-col justify-between gap-1.5 rounded-xl border border-border bg-secondary/35 p-4 text-xs"
              >
                <p className="font-bold uppercase tracking-wider text-foreground">{diagnostic.source}</p>
                <p className="mt-1 leading-normal text-muted-foreground">
                  {t.asnDiagnosticDuration}:{" "}
                  <span className="font-semibold text-foreground">{formatNumber(diagnostic.durationMs, locale)} ms</span>
                </p>
                <p className="leading-normal text-muted-foreground">
                  {t.asnDiagnosticCache}:{" "}
                  <span className="font-semibold text-foreground">{formatCacheStatus(diagnostic.cache, t)}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
