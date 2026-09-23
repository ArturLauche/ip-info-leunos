"use client";

import { useId } from "react";
import { TriangleAlert } from "lucide-react";
import type { AsnProfile, SourceCacheStatus, SourceStatus } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import { formatCacheStatus, formatStatus, formatWarning, relativeShare, SOURCE_ORDER, sourceName } from "./helpers";
import { ScaleBar } from "./scale-bar";
import { SectionHeading } from "./section-heading";
import { SourceStatusMark, statusTone } from "./source-status";

interface DiagnosticRow {
  source: string;
  status: SourceStatus;
  durationMs: number | null;
  cache: SourceCacheStatus | null;
  warnings: number;
}

function StatusLabel({ status, t }: { status: SourceStatus; t: ToolTranslation }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", statusTone(status))}>
      <SourceStatusMark status={status} />
      {formatStatus(status, t)}
    </span>
  );
}

function Duration({ value, max, locale }: { value: number | null; max: number; locale: Locale }) {
  if (value === null) return <span className="text-muted-foreground/50">—</span>;
  return (
    <span className="inline-flex items-center justify-end gap-2">
      <ScaleBar pct={relativeShare(value, max)} className="w-12" />
      <span className="min-w-[4.25rem] text-right tabular-nums">{formatNumber(value, locale)} ms</span>
    </span>
  );
}

function WarningCount({ value, locale }: { value: number; locale: Locale }) {
  if (value <= 0) return <span className="text-muted-foreground/50">—</span>;
  return (
    <span className="inline-flex items-center gap-1 font-medium text-warning tabular-nums">
      <TriangleAlert className="size-3.5" aria-hidden />
      {formatNumber(value, locale)}
    </span>
  );
}

/**
 * Advanced, flag-gated panel (`?source-info=1`): per-provider availability,
 * latency, cache state and the raw provider warnings. Deliberately technical
 * and compact — mono figures, hairlines, no hero treatment.
 */
export function SourceDiagnosticsSection({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const headingId = useId();
  // With the source-info flag the API always ships per-source diagnostics; the
  // fallback keeps a usable availability view if they are ever absent.
  const rows: DiagnosticRow[] = (
    result.sourceDiagnostics && result.sourceDiagnostics.length > 0
      ? result.sourceDiagnostics
      : Object.entries(result.sources).map(([source, status]) => ({
          source,
          status,
          durationMs: null,
          cache: null,
          warnings: 0,
        }))
  )
    .slice()
    .sort(
      (a, b) =>
        SOURCE_ORDER.indexOf(a.source as (typeof SOURCE_ORDER)[number]) -
        SOURCE_ORDER.indexOf(b.source as (typeof SOURCE_ORDER)[number]),
    );
  const maxDuration = Math.max(0, ...rows.map((row) => row.durationMs || 0));

  const headCell = "px-3 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase";

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <SectionHeading
        id={headingId}
        title={t.asnSourceDiagnostics}
        description={t.asnSourceDiagnosticsDescription}
        hideTitle
      />

      {/* Desktop: compact diagnostics table */}
      <div className="hidden overflow-hidden rounded-lg border border-border/70 md:block">
        <table aria-labelledby={headingId} className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40">
              <th scope="col" className={cn(headCell, "pl-4 text-left")}>
                {t.asnDiagnosticSource}
              </th>
              <th scope="col" className={cn(headCell, "text-left")}>
                {t.asnLabelStatus}
              </th>
              <th scope="col" className={cn(headCell, "text-right")}>
                {t.asnDiagnosticDuration}
              </th>
              <th scope="col" className={cn(headCell, "text-left")}>
                {t.asnDiagnosticCache}
              </th>
              <th scope="col" className={cn(headCell, "pr-4 text-right")}>
                {t.asnDiagnosticWarnings}
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((row) => (
              <tr key={row.source} className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/30">
                <th scope="row" className="px-3 py-2.5 pl-4 text-left font-sans text-sm font-medium text-foreground">
                  {sourceName(row.source)}
                </th>
                <td className="px-3 py-2.5">
                  <StatusLabel status={row.status} t={t} />
                </td>
                <td className="px-3 py-2.5 text-right text-foreground/80">
                  <Duration value={row.durationMs} max={maxDuration} locale={locale} />
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {row.cache ? formatCacheStatus(row.cache, t) : "—"}
                </td>
                <td className="px-3 py-2.5 pr-4 text-right">
                  <WarningCount value={row.warnings} locale={locale} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one compact block per provider */}
      <ul className="flex flex-col md:hidden">
        {rows.map((row) => (
          <li key={row.source} className="flex flex-col gap-1.5 border-b border-border/50 py-3 first:pt-0 last:border-b-0">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">{sourceName(row.source)}</span>
              <span className="font-mono text-xs">
                <StatusLabel status={row.status} t={t} />
              </span>
            </div>
            <dl className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="flex flex-col gap-0.5">
                <dt className="font-sans text-muted-foreground/80">{t.asnDiagnosticDuration}</dt>
                <dd className="text-foreground/80 tabular-nums">
                  {row.durationMs === null ? "—" : `${formatNumber(row.durationMs, locale)} ms`}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="font-sans text-muted-foreground/80">{t.asnDiagnosticCache}</dt>
                <dd className="text-muted-foreground">{row.cache ? formatCacheStatus(row.cache, t) : "—"}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="font-sans text-muted-foreground/80">{t.asnDiagnosticWarnings}</dt>
                <dd>
                  <WarningCount value={row.warnings} locale={locale} />
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {result.warnings.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {t.asnWarnings}
            <span className="rounded-full bg-warning/12 px-1.5 font-mono text-[10.5px] leading-4 font-medium text-warning tabular-nums normal-case">
              {formatNumber(result.warnings.length, locale)}
            </span>
          </h4>
          <ul className="flex flex-col rounded-lg border border-border/70 bg-muted/20">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex items-start gap-2.5 border-b border-border/50 px-3 py-2 text-xs leading-relaxed text-foreground/85 last:border-b-0"
              >
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
                <span className="min-w-0 break-words">{formatWarning(warning, t, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
