"use client";

import { useMemo, useState } from "react";
import type { PeeringDbFacility } from "@/lib/asn";
import type { FacilitySortKey, SortState } from "@/lib/asn-sort";
import {
  defaultFacilitySortDirection,
  nextHeaderSort,
  sortFacilities,
} from "@/lib/asn-sort";
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
import { ShowMoreButton } from "./show-more-button";
import { SortableColumnHeader } from "./sortable-column-header";

const ROW_LIMIT = 8;

function CountryCell({ country }: { country: string }) {
  if (!country) return <span className="text-muted-foreground/60">—</span>;

  return (
    <span className="inline-flex items-center gap-1.5">
      <CountryFlag countryCode={country} />
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {country}
      </span>
    </span>
  );
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
  const [sort, setSort] = useState<SortState<FacilitySortKey>>({
    key: null,
    direction: null,
  });

  const sorted = useMemo(
    () => sortFacilities(facilities, sort.key, sort.direction, locale),
    [facilities, sort, locale],
  );
  const visible = expanded ? sorted : sorted.slice(0, ROW_LIMIT);

  const toggleSort = (key: FacilitySortKey) =>
    setSort((prev) =>
      nextHeaderSort(prev, key, defaultFacilitySortDirection()),
    );

  const headers: {
    key: FacilitySortKey;
    label: string;
    className?: string;
    align?: "start" | "end";
  }[] = [
    { key: "name", label: t.asnLabelFacility },
    { key: "city", label: t.asnLabelCity },
    { key: "country", label: t.asnLabelCountry },
    {
      key: "localAsn",
      label: t.asnLabelLocalAsn,
      className: "text-end",
      align: "end",
    },
  ];

  const sortLabel = (column: string, key: FacilitySortKey) => {
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
    <section aria-label={t.asnFacilities} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="flex items-baseline justify-between gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t.asnFacilities}
          {facilities.length > 0 && (
            <span className="font-mono text-xs font-normal normal-case tabular-nums">
              {formatNumber(total, locale)}
            </span>
          )}
        </h3>
        <p className="max-w-2xl text-xs leading-normal text-muted-foreground">
          {t.asnFacilitiesDescription}
        </p>
      </div>

      {facilities.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t.asnNoFacilityRecords}
        </p>
      ) : (
        <>
          {/* Desktop: dense data table */}
          <div className="hidden overflow-hidden rounded-lg border border-border/60 md:block">
            <Table
              aria-label={`${t.asnFacilities} (${t.asnSortTable.toLowerCase()})`}
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
                {visible.map((entry, idx) => (
                  <TableRow key={`${entry.id}-${idx}`}>
                    <TableCell
                      className="max-w-[18rem] py-2 font-medium text-foreground"
                      title={entry.name}
                    >
                      <span className="block truncate">{entry.name}</span>
                    </TableCell>
                    <TableCell className="py-2 text-muted-foreground">
                      {valueOrDash(entry.city)}
                    </TableCell>
                    <TableCell className="py-2">
                      <CountryCell country={entry.country} />
                    </TableCell>
                    <TableCell className="py-2 text-end font-mono text-xs text-foreground/80 tabular-nums">
                      {valueOrDash(entry.localAsn)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: name with structured geography beneath */}
          <ul className="flex flex-col md:hidden">
            {visible.map((entry, idx) => (
              <li
                key={`${entry.id}-${idx}`}
                className="flex flex-col gap-1 border-b border-border/60 py-2.5 first:pt-0 last:border-b-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className="min-w-0 text-sm font-medium text-foreground"
                    title={entry.name}
                  >
                    {entry.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-foreground/80 tabular-nums">
                    {valueOrDash(entry.localAsn)}
                  </span>
                </div>
                <span className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                  {valueOrDash(entry.city)}
                  {entry.city && entry.country && (
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/40"
                    >
                      ·
                    </span>
                  )}
                  <CountryCell country={entry.country} />
                </span>
              </li>
            ))}
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
