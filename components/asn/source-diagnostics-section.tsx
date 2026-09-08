"use client";

import type { AsnProfile } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
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
    <section aria-label={t.asnSourceDiagnostics} className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {t.asnSourceDiagnostics}
      </h3>

      <ul className="flex flex-col">
        {Object.entries(result.sources).map(([source, status]) => (
          <li
            key={source}
            className="flex items-center justify-between gap-3 border-b py-2 text-xs last:border-b-0"
          >
            <span className="font-mono font-medium text-foreground/80">{source}</span>
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[11px] font-medium",
                sourceBadgeClass(status),
              )}
            >
              {formatStatus(status, t)}
            </span>
          </li>
        ))}
      </ul>

      {result.sourceDiagnostics && result.sourceDiagnostics.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
            {t.asnDetailedDiagnostics}
          </p>
          <ul className="flex flex-col">
            {result.sourceDiagnostics.map((diagnostic) => (
              <li
                key={diagnostic.source}
                className="flex items-baseline justify-between gap-3 border-b py-2 text-xs last:border-b-0"
              >
                <span className="font-mono font-medium text-foreground/80">{diagnostic.source}</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatNumber(diagnostic.durationMs, locale)} ms · {formatCacheStatus(diagnostic.cache, t)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
