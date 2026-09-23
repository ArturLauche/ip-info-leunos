"use client";

import { useMemo, useState } from "react";
import type { PeeringDbFacility } from "@/lib/asn";
import type { FacilitySortKey, SortState } from "@/lib/asn-sort";
import { defaultFacilitySortDirection, nextHeaderSort, sortFacilities } from "@/lib/asn-sort";
import { formatNumber, formatTemplate, valueOrDash } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { CountryFlag } from "@/components/country-flag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MobileSortControl } from "./mobile-sort-control";
import { ShowMoreButton } from "./show-more-button";
import { SortableColumnHeader } from "./sortable-column-header";

const ROW_LIMIT = 8;

function CountryCell({ country }: { country: string }) {
  if (!country) return <span className="text-muted-foreground/60">—</span>;

  return (
    <span className="inline-flex items-center gap-1.5">
      <CountryFlag countryCode={country} />
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {country}
      </span>
    </span>
  );
}

function sortLabel(column: string, key: FacilitySortKey, sort: SortState<FacilitySortKey>, t: ToolTranslation) {
  const state = sort.key === key && sort.direction ? sort.direction : null;
  const order = state === "asc" ? t.asnSortAscending : state === "desc" ? t.asnSortDescending : t.asnSortNotSorted;
  return `${formatTemplate(t.asnSortBy, { column })} (${order})`;
}

export function FacilitySection({
  facilities,
  total,
  t,
  locale,
}: {
  facilities: PeeringDbFacility[];
  total: number;
  t: ToolTranslation;
  locale: Locale;
}) {
  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState<SortState<FacilitySortKey>>({ key: null, direction: null });
  const sorted = useMemo(
    () => sortFacilities(facilities, sort.key, sort.direction, locale),
    [facilities, sort, locale],
  );
  const visible = expanded ? sorted : sorted.slice(0, ROW_LIMIT);
  const toggleSort = (key: FacilitySortKey) =>
    setSort((previous) => nextHeaderSort(previous, key, defaultFacilitySortDirection()));

  const headers: { key: FacilitySortKey; label: string; className?: string; align?: "left" | "right" }[] = [
    { key: "name", label: t.asnLabelFacility },
    { key: "city", label: t.asnLabelCity },
    { key: "country", label: t.asnLabelCountry },
    { key: "localAsn", label: t.asnLabelLocalAsn, className: "text-right", align: "right" },
  ];

  return (
    <section aria-label={t.asnFacilities} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {t.asnFacilities}
          </h3>
          {facilities.length > 0 && (
            <span className="flex flex-col items-end gap-0.5 text-right">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {formatNumber(total, locale)}
              </span>
              {facilities.length < total && (
                <span className="text-[10px] text-muted-foreground/75 tabular-nums">
                  {formatTemplate(t.asnLoadedOfReported, {
                    loaded: formatNumber(facilities.length, locale),
                    reported: formatNumber(total, locale),
                  })}
                </span>
              )}
            </span>
          )}
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">{t.asnFacilitiesDescription}</p>
      </div>

      {facilities.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/70 px-4 py-7 text-center">
          <p className="text-sm text-muted-foreground">{t.asnNoFacilityRecords}</p>
        </div>
      ) : (
        <>
          <div className="xl:hidden">
            <MobileSortControl
              label={t.asnSortControl}
              sortKey={sort.key}
              direction={sort.direction}
              options={[
                { key: "name", label: t.asnLabelFacility, defaultDirection: defaultFacilitySortDirection() },
                { key: "city", label: t.asnLabelCity, defaultDirection: defaultFacilitySortDirection() },
                { key: "country", label: t.asnLabelCountry, defaultDirection: defaultFacilitySortDirection() },
                { key: "localAsn", label: t.asnLabelLocalAsn, defaultDirection: defaultFacilitySortDirection() },
              ]}
              onToggle={toggleSort}
            />
          </div>

          {/* Desktop: dense, sortable data table. */}
          <div className="hidden overflow-hidden rounded-lg border border-border/60 xl:block">
            <Table className="min-w-[680px]" aria-label={`${t.asnFacilities} (${t.asnSortTable.toLowerCase()})`}>
              <caption className="sr-only">{t.asnFacilitiesDescription}</caption>
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
                {visible.map((entry, idx) => (
                  <TableRow key={`${entry.id}-${idx}`}>
                    <TableCell
                      className="max-w-[20rem] py-2.5 whitespace-normal font-medium text-foreground"
                      title={entry.name}
                    >
                      <span className="block truncate">{entry.name}</span>
                      {entry.status && (
                        <span className="mt-0.5 block truncate text-[10px] font-normal text-muted-foreground">
                          {entry.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-muted-foreground">{valueOrDash(entry.city)}</TableCell>
                    <TableCell className="py-2.5">
                      <CountryCell country={entry.country} />
                    </TableCell>
                    <TableCell className="py-2.5 text-right font-mono text-xs text-foreground/80 tabular-nums">
                      {entry.localAsn === null ? "—" : formatNumber(entry.localAsn, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile/tablet: geography and local ASN are explicit fields. */}
          <ul className="flex flex-col xl:hidden">
            {visible.map((entry, idx) => (
              <li
                key={`${entry.id}-${idx}`}
                className="flex flex-col gap-1.5 border-b border-border/60 py-3 first:pt-0 last:border-b-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 break-words text-sm font-medium text-foreground" title={entry.name}>
                    {entry.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-foreground/80 tabular-nums">
                    <span className="sr-only">{t.asnLabelLocalAsn}: </span>
                    {entry.localAsn === null ? "—" : formatNumber(entry.localAsn, locale)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  {entry.city && <span className="break-words">{entry.city}</span>}
                  {entry.city && entry.country && (
                    <span aria-hidden="true" className="text-muted-foreground/40">
                      ·
                    </span>
                  )}
                  <CountryCell country={entry.country} />
                </div>
                {entry.status && (
                  <span className="text-[10px] text-muted-foreground/70">{entry.status}</span>
                )}
              </li>
            ))}
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
