"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import type { PeeringDbFacility } from "@/lib/asn";
import { valueOrDash } from "@/lib/format";
import type { ToolTranslation } from "@/lib/tool-i18n";
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
      <div className="rounded-2xl border border-border/80 bg-card/35 p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Building2 className="h-5 w-5 text-primary" />
          {t.asnFacilities}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">{t.asnNoFacilityRecords}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/35 p-5 shadow-sm md:p-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Building2 className="h-5 w-5 text-primary" />
            {t.asnFacilities}
          </h3>
          <p className="text-xs leading-normal text-muted-foreground">{t.asnFacilitiesDescription}</p>
        </div>
        <span className="shrink-0 self-start rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary md:self-center">
          {total}
        </span>
      </div>

      {/* Desktop view: Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-3 pr-4 font-bold">{t.asnLabelFacility}</th>
              <th className="pb-3 pr-4 font-bold">{t.asnLabelCity}</th>
              <th className="pb-3 pr-4 font-bold">{t.asnLabelCountry}</th>
              <th className="pb-3 font-bold">{t.asnLabelLocalAsn}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-muted-foreground">
            {visible.map((entry, idx) => (
              <tr key={`${entry.id}-${idx}`} className="group transition-colors hover:bg-secondary/15">
                <td className="max-w-sm truncate py-3 pr-4 font-medium text-foreground" title={entry.name}>
                  {entry.name}
                </td>
                <td className="py-3 pr-4">{valueOrDash(entry.city)}</td>
                <td className="py-3 pr-4 text-xs font-semibold uppercase">{valueOrDash(entry.country)}</td>
                <td className="py-3 font-mono text-xs text-foreground/80">{valueOrDash(entry.localAsn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view: Stacked Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {visible.map((entry, idx) => (
          <div key={`${entry.id}-${idx}`} className="flex flex-col gap-2 rounded-xl border border-border/80 bg-secondary/20 p-4">
            <span className="mb-1 border-b border-border/40 pb-2 text-sm font-semibold text-foreground">
              {entry.name}
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
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
              <div className="col-span-2 mt-1">
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
        <ShowMoreButton expanded={expanded} onToggle={() => setExpanded(!expanded)} count={facilities.length} t={t} />
      )}
    </div>
  );
}
