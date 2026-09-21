"use client";

import { TriangleAlert } from "lucide-react";
import type { AsnProfile, SourceCacheStatus, SourceStatus } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Badge } from "@/components/ui/badge";
import { formatCacheStatus, formatStatus } from "./helpers";

// Availability maps onto the design system's semantic badge variants so the
// diagnostics panel reads like the rest of the product.
function statusVariant(status: SourceStatus) {
  if (status === "available") return "success" as const;
  if (status === "not_configured") return "info" as const;
  if (status === "unavailable") return "warning" as const;
  return "destructive" as const;
}

interface DiagnosticRow {
  source: string;
  status: SourceStatus;
  durationMs: number | null;
  cache: SourceCacheStatus | null;
  warnings: number;
}

export function SourceDiagnosticsSection({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  // With the source-info flag the API always ships per-source diagnostics; the
  // fallback keeps a usable availability view if they are ever absent.
  const rows: DiagnosticRow[] =
    result.sourceDiagnostics && result.sourceDiagnostics.length > 0
      ? result.sourceDiagnostics
      : Object.entries(result.sources).map(([source, status]) => ({
          source,
          status,
          durationMs: null,
          cache: null,
          warnings: 0,
        }));

  return (
    <section aria-label={t.asnSourceDiagnostics} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t.asnSourceDiagnostics}
        </h3>
        <p className="max-w-2xl text-xs leading-normal text-muted-foreground">
          {t.asnSourceDiagnosticsDescription}
        </p>
      </div>

      {/* Desktop: compact diagnostics table */}
      <div className="hidden overflow-hidden rounded-lg border border-border/60 md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40">
              <th
                scope="col"
                className="px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                {t.asnDiagnosticSource}
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                {t.asnLabelStatus}
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-right text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                {t.asnDiagnosticDuration}
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                {t.asnDiagnosticCache}
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-right text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                {t.asnDiagnosticWarnings}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.source} className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/40">
                <td className="px-3 py-2 font-mono text-xs font-medium text-foreground/80">
                  {row.source}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={statusVariant(row.status)}>{formatStatus(row.status, t)}</Badge>
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {row.durationMs === null ? "—" : `${formatNumber(row.durationMs, locale)} ms`}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {row.cache ? formatCacheStatus(row.cache, t) : "—"}
                </td>
                <td className="px-3 py-2 text-right text-xs">
                  {row.warnings > 0 ? (
                    <span className="inline-flex items-center gap-1 font-medium text-warning tabular-nums">
                      <TriangleAlert className="size-3.5" aria-hidden />
                      {formatNumber(row.warnings, locale)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one compact block per provider */}
      <ul className="flex flex-col md:hidden">
        {rows.map((row) => (
          <li
            key={row.source}
            className="flex flex-col gap-1 border-b border-border/60 py-2.5 last:border-b-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-medium text-foreground/80">{row.source}</span>
              <Badge variant={statusVariant(row.status)}>{formatStatus(row.status, t)}</Badge>
            </div>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-muted-foreground tabular-nums">
              <span>{row.durationMs === null ? "—" : `${formatNumber(row.durationMs, locale)} ms`}</span>
              {row.cache && (
                <>
                  <span aria-hidden="true" className="text-muted-foreground/40">
                    ·
                  </span>
                  <span>{formatCacheStatus(row.cache, t)}</span>
                </>
              )}
              {row.warnings > 0 && (
                <>
                  <span aria-hidden="true" className="text-muted-foreground/40">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-warning">
                    <TriangleAlert className="size-3" aria-hidden />
                    {formatNumber(row.warnings, locale)}
                  </span>
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
