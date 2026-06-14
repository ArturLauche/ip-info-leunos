"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import type { PeeringDbFacility } from "@/lib/asn";
import { valueOrDash } from "@/lib/format";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
}: {
  facilities: PeeringDbFacility[];
  total: number;
  t: ToolTranslation;
}) {
  const [expanded, setExpanded] = useState(false);
  const limit = 8;
  const visible = expanded ? facilities : facilities.slice(0, limit);

  if (!facilities.length) {
    return (
      <Card className="gap-3 py-5">
        <h3 className="flex items-center gap-2 px-5 text-lg font-bold text-foreground">
          <Building2 className="size-5 text-primary" />
          {t.asnFacilities}
        </h3>
        <p className="px-5 text-sm text-muted-foreground">{t.asnNoFacilityRecords}</p>
      </Card>
    );
  }

  return (
    <Card className="gap-4 py-5">
      <div className="flex items-start justify-between gap-3 border-b px-5 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Building2 className="size-5 text-primary" />
            {t.asnFacilities}
          </h3>
          <p className="text-xs leading-normal text-muted-foreground">{t.asnFacilitiesDescription}</p>
        </div>
        <Badge variant="secondary" className="shrink-0 tabular-nums">
          {total}
        </Badge>
      </div>

      {/* Desktop: table */}
      <div className="hidden px-2 md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t.asnLabelFacility}</TableHead>
              <TableHead>{t.asnLabelCity}</TableHead>
              <TableHead>{t.asnLabelCountry}</TableHead>
              <TableHead>{t.asnLabelLocalAsn}</TableHead>
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
                <TableCell className="font-mono text-xs text-foreground/80">
                  {valueOrDash(entry.localAsn)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 px-5 md:hidden">
        {visible.map((entry, idx) => (
          <div key={`${entry.id}-${idx}`} className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-4">
            <span className="border-b pb-2 text-sm font-semibold text-foreground">{entry.name}</span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {t.asnLabelCity}
                </span>
                <span className="font-medium text-foreground">{valueOrDash(entry.city)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {t.asnLabelCountry}
                </span>
                <span className="font-medium uppercase text-foreground">{valueOrDash(entry.country)}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {t.asnLabelLocalAsn}
                </span>
                <span className="font-mono text-foreground">{valueOrDash(entry.localAsn)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {facilities.length > limit && (
        <div className="px-5">
          <ShowMoreButton expanded={expanded} onToggle={() => setExpanded(!expanded)} count={facilities.length} t={t} />
        </div>
      )}
    </Card>
  );
}
