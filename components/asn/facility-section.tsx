"use client";

import { useState } from "react";
import type { PeeringDbFacility } from "@/lib/asn";
import { formatNumber, valueOrDash } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShowMoreButton } from "./show-more-button";

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
  const limit = 8;
  const visible = expanded ? facilities : facilities.slice(0, limit);

  return (
    <section aria-label={t.asnFacilities} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="flex items-baseline justify-between gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t.asnFacilities}
          {facilities.length > 0 && (
            <span className="font-mono font-normal normal-case tabular-nums">{formatNumber(total, locale)}</span>
          )}
        </h3>
        <p className="max-w-2xl text-xs leading-normal text-muted-foreground">{t.asnFacilitiesDescription}</p>
      </div>

      {facilities.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.asnNoFacilityRecords}</p>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t.asnLabelFacility}</TableHead>
                  <TableHead>{t.asnLabelCity}</TableHead>
                  <TableHead>{t.asnLabelCountry}</TableHead>
                  <TableHead className="text-right">{t.asnLabelLocalAsn}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((entry, idx) => (
                  <TableRow key={`${entry.id}-${idx}`}>
                    <TableCell
                      className="max-w-sm truncate font-medium text-foreground"
                      title={entry.name}
                    >
                      {entry.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{valueOrDash(entry.city)}</TableCell>
                    <TableCell className="text-xs font-semibold uppercase text-muted-foreground">
                      {valueOrDash(entry.country)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-foreground/80">
                      {valueOrDash(entry.localAsn)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: stacked rows */}
          <ul className="flex flex-col md:hidden">
            {visible.map((entry, idx) => (
              <li key={`${entry.id}-${idx}`} className="flex items-baseline justify-between gap-3 border-b py-2.5 last:border-b-0">
                <span className="min-w-0 truncate text-sm font-medium text-foreground" title={entry.name}>
                  {entry.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {[entry.city, entry.country].filter(Boolean).join(" · ") || "—"}
                </span>
              </li>
            ))}
          </ul>

          {facilities.length > limit && (
            <ShowMoreButton expanded={expanded} onToggle={() => setExpanded(!expanded)} count={facilities.length} t={t} />
          )}
        </>
      )}
    </section>
  );
}
