"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, Minus } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import type { IxSortKey, SortState } from "@/lib/asn-sort";
import { defaultIxSortDirection, nextHeaderSort, sortIxlan } from "@/lib/asn-sort";
import type { Locale } from "@/lib/i18n";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { ToolTranslation } from "@/lib/tool-i18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatSpeed } from "./helpers";
import { MobileSortControl } from "./mobile-sort-control";
import { ShowMoreButton } from "./show-more-button";
import { SortableColumnHeader } from "./sortable-column-header";

const ROW_LIMIT = 8;

function SpeedBar({ pct }: { pct: number }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-foreground/10" aria-hidden="true">
      <span
        className="block h-full rounded-full bg-foreground/60 transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

function OperationalMark({ operational, t }: { operational: boolean | null; t: ToolTranslation }) {
  if (operational === true) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
        <Check className="size-3" aria-hidden="true" />
        {t.asnOperational}
      </span>
    );
  }
  if (operational === false) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-warning">
        <CircleAlert className="size-3" aria-hidden="true" />
        {t.asnNotOperational}
      </span>
    );
  }
  return null;
}

function sortLabel(column: string, key: IxSortKey, sort: SortState<IxSortKey>, t: ToolTranslation) {
  const state = sort.key === key && sort.direction ? sort.direction : null;
  const order = state === "asc" ? t.asnSortAscending : state === "desc" ? t.asnSortDescending : t.asnSortNotSorted;
  return `${formatTemplate(t.asnSortBy, { column })} (${order})`;
}

export function IxPresenceSection({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const ixlan = useMemo(() => result.peeringdb?.ixlan || [], [result.peeringdb]);
  const total = result.peeringdb?.ixlanTotal ?? 0;
  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState<SortState<IxSortKey>>({ key: null, direction: null });
  const sorted = useMemo(() => sortIxlan(ixlan, sort.key, sort.direction, locale), [ixlan, sort, locale]);
  const visible = expanded ? sorted : sorted.slice(0, ROW_LIMIT);
  const maxSpeed = useMemo(() => Math.max(...ixlan.map((entry) => entry.speed || 0), 1), [ixlan]);
  const toggleSort = (key: IxSortKey) =>
    setSort((previous) => nextHeaderSort(previous, key, defaultIxSortDirection(key)));

  const headers: { key: IxSortKey; label: string; className?: string; align?: "left" | "right" }[] = [
    { key: "name", label: t.asnLabelExchange },
    { key: "speed", label: t.asnLabelSpeed, className: "text-right", align: "right" },
    { key: "ipv4", label: t.asnLabelIpv4 },
    { key: "ipv6", label: t.asnLabelIpv6 },
    { key: "rsPeer", label: t.asnLabelRsPeer, className: "text-right", align: "right" },
  ];

  return (
    <section aria-label={t.asnIxPresence} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {t.asnIxPresence}
          </h3>
          {ixlan.length > 0 && (
            <span className="flex flex-col items-end gap-0.5 text-right">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {formatNumber(total, locale)}
              </span>
              {ixlan.length < total && (
                <span className="text-[10px] text-muted-foreground/75 tabular-nums">
                  {formatTemplate(t.asnLoadedOfReported, {
                    loaded: formatNumber(ixlan.length, locale),
                    reported: formatNumber(total, locale),
                  })}
                </span>
              )}
            </span>
          )}
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">{t.asnIxDescription}</p>
      </div>

      {ixlan.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/70 px-4 py-7 text-center">
          <p className="text-sm text-muted-foreground">{t.asnNoIxLanRecords}</p>
        </div>
      ) : (
        <>
          <div className="xl:hidden">
            <MobileSortControl
              label={t.asnSortControl}
              sortKey={sort.key}
              direction={sort.direction}
              options={[
                { key: "name", label: t.asnLabelExchange, defaultDirection: defaultIxSortDirection("name") },
                { key: "speed", label: t.asnLabelSpeed, defaultDirection: defaultIxSortDirection("speed") },
                { key: "ipv4", label: t.asnLabelIpv4, defaultDirection: defaultIxSortDirection("ipv4") },
                { key: "ipv6", label: t.asnLabelIpv6, defaultDirection: defaultIxSortDirection("ipv6") },
                { key: "rsPeer", label: t.asnLabelRsPeer, defaultDirection: defaultIxSortDirection("rsPeer") },
              ]}
              onToggle={toggleSort}
            />
          </div>

          {/* Desktop: dense, sortable data table. */}
          <div className="hidden overflow-hidden rounded-lg border border-border/60 xl:block">
            <Table className="min-w-[760px]" aria-label={`${t.asnIxPresence} (${t.asnSortTable.toLowerCase()})`}>
              <caption className="sr-only">{t.asnIxDescription}</caption>
              <TableHeader>
                <TableRow className="bg-muted/35 hover:bg-muted/35">
                  {headers.map((header) => (
                    <TableHead
                      key={header.key}
                      scope="col"
                      className={header.className}
                      aria-sort={
                        sort.key === header.key && sort.direction
                          ? sort.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <SortableColumnHeader
                        label={header.label}
                        active={sort.key === header.key && Boolean(sort.direction)}
                        direction={sort.key === header.key ? sort.direction : null}
                        onToggle={() => toggleSort(header.key)}
                        ariaLabel={sortLabel(header.label, header.key, sort, t)}
                        align={header.align}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((entry, idx) => {
                  const speed = entry.speed || 0;
                  const speedPct = maxSpeed > 0 ? Math.min(100, Math.max(2, (speed / maxSpeed) * 100)) : 0;
                  return (
                    <TableRow key={`${entry.id}-${idx}`} className="group">
                      <TableCell className="max-w-[15rem] py-2.5 whitespace-normal font-medium text-foreground">
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate" title={entry.name}>
                            {entry.name}
                          </span>
                          <OperationalMark operational={entry.operational} t={t} />
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="ml-auto flex w-full max-w-32 flex-col items-stretch gap-1.5">
                          <span className="text-right font-mono text-xs font-semibold text-foreground/90 tabular-nums">
                            {formatSpeed(entry.speed, t, locale)}
                          </span>
                          {entry.speed ? <SpeedBar pct={speedPct} /> : null}
                        </div>
                      </TableCell>
                      <TableCell
                        className="max-w-[10rem] py-2.5 font-mono text-xs text-muted-foreground"
                        title={entry.ipaddr4 || undefined}
                      >
                        <span className="block truncate">{entry.ipaddr4 || "—"}</span>
                      </TableCell>
                      <TableCell
                        className="max-w-[12rem] py-2.5 font-mono text-xs text-muted-foreground"
                        title={entry.ipaddr6 || undefined}
                      >
                        <span className="block truncate">{entry.ipaddr6 || "—"}</span>
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-xs">
                        {entry.isRsPeer === true ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
                            <Check className="size-3.5 text-success" aria-hidden="true" />
                            {t.asnBooleanYes}
                          </span>
                        ) : entry.isRsPeer === false ? (
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <Minus className="size-3.5" aria-hidden="true" />
                            {t.asnBooleanNo}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile/tablet: deliberately structured records, not a squeezed table. */}
          <ul className="flex flex-col xl:hidden">
            {visible.map((entry, idx) => {
              const speed = entry.speed || 0;
              const speedPct = maxSpeed > 0 ? Math.min(100, Math.max(2, (speed / maxSpeed) * 100)) : 0;
              return (
                <li
                  key={`${entry.id}-${idx}`}
                  className="flex flex-col gap-2 border-b border-border/60 py-3.5 first:pt-0 last:border-b-0"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block break-words text-sm font-medium text-foreground">{entry.name}</span>
                      <OperationalMark operational={entry.operational} t={t} />
                    </div>
                    <span className="shrink-0 text-right font-mono text-xs font-semibold text-foreground/90 tabular-nums">
                      <span className="sr-only">{t.asnLabelSpeed}: </span>
                      {formatSpeed(entry.speed, t, locale)}
                    </span>
                  </div>
                  {entry.speed ? <SpeedBar pct={speedPct} /> : null}
                  <div className="flex flex-col gap-1 font-mono text-[11px] text-muted-foreground">
                    {entry.ipaddr4 && (
                      <span className="flex min-w-0 gap-1.5 break-all">
                        <span className="w-12 shrink-0 text-muted-foreground/60">{t.asnLabelIpv4}</span>
                        <span>{entry.ipaddr4}</span>
                      </span>
                    )}
                    {entry.ipaddr6 && entry.ipaddr6 !== entry.ipaddr4 && (
                      <span className="flex min-w-0 gap-1.5 break-all">
                        <span className="w-12 shrink-0 text-muted-foreground/60">{t.asnLabelIpv6}</span>
                        <span>{entry.ipaddr6}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <span className="w-14 shrink-0 whitespace-nowrap text-muted-foreground/60">{t.asnLabelRsPeer}</span>
                      {entry.isRsPeer === true ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <Check className="size-3" aria-hidden="true" />
                          {t.asnBooleanYes}
                        </span>
                      ) : entry.isRsPeer === false ? (
                        <span>{t.asnBooleanNo}</span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {sorted.length > ROW_LIMIT && (
            <ShowMoreButton
              expanded={expanded}
              onToggle={() => setExpanded(!expanded)}
              count={sorted.length}
              reportedTotal={total}
              locale={locale}
              t={t}
            />
          )}
        </>
      )}
    </section>
  );
}
