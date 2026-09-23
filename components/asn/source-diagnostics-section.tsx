"use client";

import { CheckCircle2, CircleAlert, Clock3, Database, TriangleAlert } from "lucide-react";
import type { AsnProfile, SourceCacheStatus, SourceStatus } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Badge } from "@/components/ui/badge";
import { formatCacheStatus, formatStatus } from "./helpers";

function statusVariant(status: SourceStatus) {
  if (status === "available") return "success" as const;
  if (status === "not_configured") return "info" as const;
  if (status === "unavailable") return "warning" as const;
  return "destructive" as const;
}

function statusIcon(status: SourceStatus) {
  if (status === "available") return <CheckCircle2 className="size-3" aria-hidden="true" />;
  if (status === "error") return <CircleAlert className="size-3" aria-hidden="true" />;
  return <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />;
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
  const available = rows.filter((row) => row.status === "available").length;
  const slowestDuration = rows.reduce((longest, row) => Math.max(longest, row.durationMs || 0), 0);
  const warningCount = rows.reduce((sum, row) => sum + row.warnings, 0);

  return (
    <section aria-label={t.asnSourceDiagnostics} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {t.asnSourceDiagnostics}
        </h3>
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
          {t.asnSourceDiagnosticsDescription}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60">
        <div className="flex flex-col gap-1 bg-card px-3 py-3">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            <Database className="size-3" aria-hidden="true" />
            {t.asnSourceCoverage}
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums">
            {available}/{rows.length}
          </span>
        </div>
        <div className="flex flex-col gap-1 bg-card px-3 py-3">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            <Clock3 className="size-3" aria-hidden="true" />
            {t.asnDiagnosticSlowestRequest}
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums">{formatNumber(slowestDuration, locale)} ms</span>
        </div>
        <div className="flex flex-col gap-1 bg-card px-3 py-3">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            <TriangleAlert className="size-3" aria-hidden="true" />
            {t.asnDiagnosticWarnings}
          </span>
          <span className={warningCount > 0 ? "font-mono text-sm font-semibold text-warning tabular-nums" : "font-mono text-sm font-semibold tabular-nums"}>
            {formatNumber(warningCount, locale)}
          </span>
        </div>
      </div>

      {/* Desktop: compact diagnostics table. */}
      <div className="hidden overflow-hidden rounded-lg border border-border/60 xl:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{t.asnSourceDiagnosticsDescription}</caption>
          <thead>
            <tr className="border-b border-border/60 bg-muted/35">
              <th scope="col" className="px-3 py-2 text-left text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {t.asnDiagnosticSource}
              </th>
              <th scope="col" className="px-3 py-2 text-left text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {t.asnLabelStatus}
              </th>
              <th scope="col" className="px-3 py-2 text-right text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {t.asnDiagnosticDuration}
              </th>
              <th scope="col" className="px-3 py-2 text-left text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {t.asnDiagnosticCache}
              </th>
              <th scope="col" className="px-3 py-2 text-right text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {t.asnDiagnosticWarnings}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.source} className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/35">
                <td className="px-3 py-2.5 font-mono text-xs font-medium text-foreground/80">{row.source}</td>
                <td className="px-3 py-2.5">
                  <Badge variant={statusVariant(row.status)} className="gap-1.5">
                    {statusIcon(row.status)}
                    {formatStatus(row.status, t)}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {row.durationMs === null ? "—" : `${formatNumber(row.durationMs, locale)} ms`}
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">
                  {row.cache ? formatCacheStatus(row.cache, t) : "—"}
                </td>
                <td className="px-3 py-2.5 text-right text-xs">
                  {row.warnings > 0 ? (
                    <span className="inline-flex items-center gap-1 font-medium text-warning tabular-nums">
                      <TriangleAlert className="size-3.5" aria-hidden="true" />
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

      {/* Mobile/tablet: compact blocks with explicit field labels. */}
      <ul className="flex flex-col xl:hidden">
        {rows.map((row) => (
          <li key={row.source} className="flex flex-col gap-2 border-b border-border/60 py-3 last:border-b-0">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 truncate font-mono text-xs font-semibold text-foreground/80">{row.source}</span>
              <Badge variant={statusVariant(row.status)} className="shrink-0 gap-1.5">
                {statusIcon(row.status)}
                {formatStatus(row.status, t)}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <span className="flex flex-col gap-0.5 text-muted-foreground">
                <span className="text-[10px] uppercase">{t.asnDiagnosticDuration}</span>
                <span className="font-mono tabular-nums text-foreground/80">
                  {row.durationMs === null ? "—" : `${formatNumber(row.durationMs, locale)} ms`}
                </span>
              </span>
              <span className="flex flex-col gap-0.5 text-muted-foreground">
                <span className="text-[10px] uppercase">{t.asnDiagnosticCache}</span>
                <span className="text-foreground/80">{row.cache ? formatCacheStatus(row.cache, t) : "—"}</span>
              </span>
              <span className="flex flex-col gap-0.5 text-muted-foreground">
                <span className="text-[10px] uppercase">{t.asnDiagnosticWarnings}</span>
                <span className={row.warnings > 0 ? "font-medium text-warning" : "text-foreground/80"}>
                  {row.warnings > 0 ? formatNumber(row.warnings, locale) : "—"}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
