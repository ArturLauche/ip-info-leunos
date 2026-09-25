"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { PeeringDbFacility } from "@/lib/asn";
import type { FacilitySortKey, SortState } from "@/lib/asn-sort";
import { defaultFacilitySortDirection, nextHeaderSort, sortFacilities } from "@/lib/asn-sort";
import { formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import { CountryFlag } from "@/components/country-flag";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyColumn } from "./data-column";
import { ExternalLink } from "./external-link";
import { ASN_ROW_LIMIT, countryName, formatCount, peeringDbUrl } from "./helpers";
import { MobileSortControl } from "./mobile-sort-control";
import { SectionHeading } from "./section-heading";
import { ShowMoreButton } from "./show-more-button";
import { SortableTableHead, type SortableColumn } from "./sortable-column-header";

function Country({ code, locale }: { code: string; locale: Locale }) {
  if (!code) return <span className="text-muted-foreground/50">—</span>;
  const upper = code.toUpperCase();
  const name = countryName(upper, locale);

  return (
    <span className="inline-flex items-center gap-1.5" title={name}>
      <CountryFlag countryCode={upper} />
      <span className="font-mono text-xs font-medium text-foreground/80" aria-hidden>
        {upper}
      </span>
      <span className="sr-only">{name}</span>
    </span>
  );
}

function FacilityName({ entry, t }: { entry: PeeringDbFacility; t: ToolTranslation }) {
  const url = peeringDbUrl("fac", entry.facilityId);
  if (!url) return <span className="text-sm font-medium break-words text-foreground">{entry.name || "—"}</span>;

  return (
    <ExternalLink
      href={url}
      text={entry.name}
      label={formatTemplate(t.asnViewOnPeeringDb, { name: entry.name })}
      variant="subtle"
      className="self-start text-sm font-medium"
    />
  );
}

/**
 * Local ASN usually equals the looked-up network and is only context; a
 * different ASN (a sibling or regional network) is the interesting case, so
 * it is emphasised and links to its own profile.
 */
function LocalAsn({ value, ownAsn, t }: { value: number | null; ownAsn?: number; t: ToolTranslation }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground/50">—</span>;
  if (value === ownAsn) {
    return (
      <span className="font-mono text-xs text-muted-foreground tabular-nums" title={t.asnSameAsn}>
        AS{value}
      </span>
    );
  }
  return (
    <Link
      href={`/asn/AS${value}`}
      className="rounded-sm font-mono text-xs font-semibold text-foreground tabular-nums underline decoration-border underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      AS{value}
    </Link>
  );
}

export function FacilitySection({
  facilities,
  total,
  asnNumber,
  t,
  locale,
}: {
  facilities: PeeringDbFacility[];
  total: number;
  /** The looked-up ASN, so matching local ASNs can recede. */
  asnNumber?: number;
  t: ToolTranslation;
  locale: Locale;
}) {
  const headingId = useId();
  const tableId = useId();
  const listId = useId();
  const listedTotal = Math.max(total, facilities.length);
  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState<SortState<FacilitySortKey>>({ key: null, direction: null });

  const sorted = useMemo(
    () => sortFacilities(facilities, sort.key, sort.direction, locale),
    [facilities, sort, locale],
  );
  const visible = expanded ? sorted : sorted.slice(0, ASN_ROW_LIMIT);
  const sortedKey = sort.direction ? sort.key : null;

  const toggleSort = (key: FacilitySortKey) =>
    setSort((prev) => nextHeaderSort(prev, key, defaultFacilitySortDirection()));

  const columns: SortableColumn<FacilitySortKey>[] = [
    { key: "name", label: t.asnLabelFacility, className: "pl-4" },
    { key: "city", label: t.asnLabelCity },
    { key: "country", label: t.asnLabelCountry },
    { key: "localAsn", label: t.asnLabelLocalAsn, align: "right", className: "pr-4" },
  ];
  const cellTint = (key: FacilitySortKey) => sortedKey === key && "bg-muted/35";

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <SectionHeading
        id={headingId}
        title={t.asnFacilities}
        meta={listedTotal > 0 ? formatCount(t.asnFacilityCount, listedTotal, locale) : undefined}
        description={t.asnFacilitiesDescription}
      />

      {facilities.length === 0 ? (
        <EmptyColumn text={t.asnNoFacilityRecords} />
      ) : (
        <div className="flex flex-col gap-2">
          <MobileSortControl
            options={columns.map(({ key, label }) => ({ key, label }))}
            sort={sort}
            onChange={setSort}
            defaultDirection={() => defaultFacilitySortDirection()}
            t={t}
          />

          {/* Desktop: dense data table */}
          <div className="hidden overflow-hidden rounded-lg border border-border/70 md:block">
            <Table id={tableId} aria-labelledby={headingId}>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {columns.map((column) => (
                    <SortableTableHead key={column.key} column={column} sort={sort} onToggle={toggleSort} t={t} />
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((entry, idx) => (
                  <TableRow key={`${entry.id}-${idx}`} className="border-border/50 hover:bg-muted/30">
                    <TableCell className={cn("min-w-56 py-2.5 pl-4 whitespace-normal", cellTint("name"))}>
                      <FacilityName entry={entry} t={t} />
                    </TableCell>
                    <TableCell className={cn("py-2.5 text-sm text-foreground/80", cellTint("city"))}>
                      {entry.city || <span className="text-muted-foreground/50">—</span>}
                    </TableCell>
                    <TableCell className={cn("py-2.5", cellTint("country"))}>
                      <Country code={entry.country} locale={locale} />
                    </TableCell>
                    <TableCell className={cn("py-2.5 pr-4 text-right", cellTint("localAsn"))}>
                      <LocalAsn value={entry.localAsn} ownAsn={asnNumber} t={t} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Phones: name first, then structured geography and local ASN */}
          <ul id={listId} className="flex flex-col md:hidden">
            {visible.map((entry, idx) => (
              <li
                key={`${entry.id}-${idx}`}
                className="flex flex-col gap-1.5 border-b border-border/50 py-3 last:border-b-0"
              >
                <FacilityName entry={entry} t={t} />
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                    {entry.city && <span className="min-w-0 break-words">{entry.city}</span>}
                    {entry.country && <Country code={entry.country} locale={locale} />}
                  </span>
                  <LocalAsn value={entry.localAsn} ownAsn={asnNumber} t={t} />
                </div>
              </li>
            ))}
          </ul>

          <ShowMoreButton
            expanded={expanded}
            onToggle={() => setExpanded((value) => !value)}
            hiddenCount={sorted.length - ASN_ROW_LIMIT}
            listed={facilities.length}
            total={listedTotal}
            controls={`${tableId} ${listId}`}
            t={t}
            locale={locale}
          />
        </div>
      )}
    </section>
  );
}
