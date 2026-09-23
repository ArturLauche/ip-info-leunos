"use client";

import { useMemo, useState } from "react";
import type { AsnProfile } from "@/lib/asn";
import type { IxSortKey, SortState } from "@/lib/asn-sort";
import {
  defaultIxSortDirection,
  nextHeaderSort,
  sortIxlan,
} from "@/lib/asn-sort";
import type { Locale } from "@/lib/i18n";
import { formatNumber, formatTemplate, valueOrDash } from "@/lib/format";
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
import { ShowMoreButton } from "./show-more-button";
import { SortableColumnHeader } from "./sortable-column-header";

const ROW_LIMIT = 8;

function SpeedBar({ pct }: { pct: number }) {
  return (
    <span
      className="block h-1 w-full overflow-hidden rounded-full bg-foreground/10"
      aria-hidden
    >
      <span
        className="block h-full rounded-full bg-foreground/60"
        style={{ width: `${pct}%` }}
      />
    </span>
  );
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
  const ixlan = useMemo(
    () => result.peeringdb?.ixlan || [],
    [result.peeringdb],
  );
  const total = result.peeringdb?.ixlanTotal || 0;

  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState<SortState<IxSortKey>>({
    key: null,
    direction: null,
  });

  const sorted = useMemo(
    () => sortIxlan(ixlan, sort.key, sort.direction, locale),
    [ixlan, sort, locale],
  );
  const visible = expanded ? sorted : sorted.slice(0, ROW_LIMIT);

  const maxSpeed = useMemo(
    () => Math.max(...ixlan.map((x) => x.speed || 0), 1),
    [ixlan],
  );

  const toggleSort = (key: IxSortKey) =>
    setSort((prev) => nextHeaderSort(prev, key, defaultIxSortDirection(key)));

  const headers: {
    key: IxSortKey;
    label: string;
    className?: string;
    align?: "start" | "end";
  }[] = [
    { key: "name", label: t.asnLabelExchange },
    {
      key: "speed",
      label: t.asnLabelSpeed,
      className: "text-end",
      align: "end",
    },
    { key: "ipv4", label: t.asnLabelIpv4 },
    { key: "ipv6", label: t.asnLabelIpv6 },
    {
      key: "rsPeer",
      label: t.asnLabelRsPeer,
      className: "text-end",
      align: "end",
    },
  ];

  const sortLabel = (column: string, key: IxSortKey) => {
    const state = sort.key === key && sort.direction ? sort.direction : null;
    const order =
      state === "asc"
        ? t.asnSortAscending
        : state === "desc"
          ? t.asnSortDescending
          : t.asnSortNotSorted;
    return `${formatTemplate(t.asnSortBy, { column })} (${order})`;
  };

  return (
    <section aria-label={t.asnIxPresence} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="flex items-baseline justify-between gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t.asnIxPresence}
          {ixlan.length > 0 && (
            <span className="font-mono text-xs font-normal normal-case tabular-nums">
              {formatNumber(total, locale)}
            </span>
          )}
        </h3>
        <p className="max-w-2xl text-xs leading-normal text-muted-foreground">
          {t.asnIxDescription}
        </p>
      </div>

      {ixlan.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.asnNoIxLanRecords}</p>
      ) : (
        <>
          {/* Desktop: dense data table */}
          <div className="hidden overflow-hidden rounded-lg border border-border/60 md:block">
            <Table
              aria-label={`${t.asnIxPresence} (${t.asnSortTable.toLowerCase()})`}
            >
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
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
                        active={
                          sort.key === header.key && Boolean(sort.direction)
                        }
                        direction={
                          sort.key === header.key ? sort.direction : null
                        }
                        onToggle={() => toggleSort(header.key)}
                        ariaLabel={sortLabel(header.label, header.key)}
                        align={header.align}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((entry, idx) => {
                  const speedPct =
                    maxSpeed > 0
                      ? Math.min(
                          100,
                          Math.max(2, ((entry.speed || 0) / maxSpeed) * 100),
                        )
                      : 0;
                  return (
                    <TableRow key={`${entry.id}-${idx}`}>
                      <TableCell
                        className="max-w-[14rem] py-2 font-medium text-foreground"
                        title={entry.name}
                      >
                        <span className="block truncate">{entry.name}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="ms-auto flex w-full max-w-32 flex-col items-stretch gap-1.5">
                          <span className="text-end font-mono text-xs font-semibold text-foreground/90 tabular-nums">
                            {formatSpeed(entry.speed, t, locale)}
                          </span>
                          {entry.speed ? <SpeedBar pct={speedPct} /> : null}
                        </div>
                      </TableCell>
                      <TableCell
                        className="max-w-[10rem] py-2 font-mono text-xs text-muted-foreground"
                        title={entry.ipaddr4 || undefined}
                      >
                        <span className="block truncate">
                          {valueOrDash(entry.ipaddr4)}
                        </span>
                      </TableCell>
                      <TableCell
                        className="max-w-[12rem] py-2 font-mono text-xs text-muted-foreground"
                        title={entry.ipaddr6 || undefined}
                      >
                        <span className="block truncate">
                          {valueOrDash(entry.ipaddr6)}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 text-end text-xs">
                        {entry.isRsPeer === true ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
                            <span
                              className="size-1.5 rounded-full bg-foreground/60"
                              aria-hidden
                            />
                            {t.asnBooleanYes}
                          </span>
                        ) : entry.isRsPeer === false ? (
                          <span className="text-muted-foreground">
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

          {/* Mobile: compact cards mirroring the table fields */}
          <ul className="flex flex-col md:hidden">
            {visible.map((entry, idx) => {
              const speedPct =
                maxSpeed > 0
                  ? Math.min(
                      100,
                      Math.max(2, ((entry.speed || 0) / maxSpeed) * 100),
                    )
                  : 0;
              return (
                <li
                  key={`${entry.id}-${idx}`}
                  className="flex flex-col gap-1.5 border-b border-border/60 py-3 first:pt-0 last:border-b-0"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="min-w-0 text-sm font-medium text-foreground"
                      title={entry.name}
                    >
                      {entry.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs font-semibold text-foreground/90 tabular-nums">
                      {formatSpeed(entry.speed, t, locale)}
                    </span>
                  </div>
                  {entry.speed ? <SpeedBar pct={speedPct} /> : null}
                  {(entry.ipaddr4 ||
                    (entry.ipaddr6 && entry.ipaddr6 !== entry.ipaddr4) ||
                    entry.isRsPeer === true) && (
                    <div className="flex flex-col gap-0.5 font-mono text-[11px] text-muted-foreground">
                      {entry.ipaddr4 && (
                        <span className="flex gap-1.5 break-all">
                          <span className="shrink-0 text-muted-foreground/60">
                            {t.asnLabelIpv4}
                          </span>
                          {entry.ipaddr4}
                        </span>
                      )}
                      {entry.ipaddr6 && entry.ipaddr6 !== entry.ipaddr4 && (
                        <span className="flex gap-1.5 break-all">
                          <span className="shrink-0 text-muted-foreground/60">
                            {t.asnLabelIpv6}
                          </span>
                          {entry.ipaddr6}
                        </span>
                      )}
                      {entry.isRsPeer === true && (
                        <span className="flex items-center gap-1.5 text-foreground/80">
                          <span
                            className="size-1.5 rounded-full bg-foreground/60"
                            aria-hidden
                          />
                          {t.asnLabelRsPeer}
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {sorted.length > ROW_LIMIT && (
            <ShowMoreButton
              expanded={expanded}
              onToggle={() => setExpanded(!expanded)}
              count={sorted.length}
              t={t}
            />
          )}
        </>
      )}
    </section>
  );
}
