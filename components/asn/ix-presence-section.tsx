"use client";

import { useMemo, useState } from "react";
import { CircleCheck, Server, Waypoints } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import { valueOrDash } from "@/lib/format";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { formatSpeed } from "./helpers";
import { ShowMoreButton } from "./show-more-button";

export function IxPresenceSection({ result, t }: { result: AsnProfile; t: ToolTranslation }) {
  const ixlan = useMemo(() => result.peeringdb?.ixlan || [], [result.peeringdb]);
  const total = result.peeringdb?.ixlanTotal || 0;

  const [expanded, setExpanded] = useState(false);
  const limit = 8;
  const visible = expanded ? ixlan : ixlan.slice(0, limit);

  const maxSpeed = useMemo(() => Math.max(...ixlan.map((x) => x.speed || 0), 1), [ixlan]);

  if (!ixlan.length) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card/35 p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Waypoints className="h-5 w-5 text-primary" />
          {t.asnIxPresence}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">{t.asnNoIxLanRecords}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/35 p-5 shadow-sm md:p-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Server className="h-5 w-5 text-primary" />
            {t.asnIxPresence}
          </h3>
          <p className="text-xs leading-normal text-muted-foreground">{t.asnIxDescription}</p>
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
              <th className="pb-3 pr-4 font-bold">{t.asnLabelExchange}</th>
              <th className="pb-3 pr-4 font-bold">{t.asnLabelSpeed}</th>
              <th className="pb-3 pr-4 font-bold">{t.asnLabelIpv4}</th>
              <th className="pb-3 pr-4 font-bold">{t.asnLabelIpv6}</th>
              <th className="pb-3 text-center font-bold">{t.asnLabelRsPeer}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-muted-foreground">
            {visible.map((entry, idx) => {
              const speedPct = maxSpeed > 0 ? Math.min(100, Math.max(2, ((entry.speed || 0) / maxSpeed) * 100)) : 0;
              return (
                <tr key={`${entry.id}-${idx}`} className="group transition-colors hover:bg-secondary/15">
                  <td className="max-w-xs truncate py-3 pr-4 font-medium text-foreground" title={entry.name}>
                    {entry.name}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex min-w-[120px] flex-col gap-1.5">
                      <span className="font-mono text-xs font-semibold text-foreground/90">
                        {formatSpeed(entry.speed, t)}
                      </span>
                      {entry.speed && (
                        <div className="h-1 w-28 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all"
                            style={{ width: `${speedPct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="break-all py-3 pr-4 font-mono text-xs">{valueOrDash(entry.ipaddr4)}</td>
                  <td className="break-all py-3 pr-4 font-mono text-xs">{valueOrDash(entry.ipaddr6)}</td>
                  <td className="py-3 text-center">
                    {entry.isRsPeer === true ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        <CircleCheck className="h-3 w-3" />
                        {t.asnBooleanYes}
                      </span>
                    ) : entry.isRsPeer === false ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {t.asnBooleanNo}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile view: Stacked Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {visible.map((entry, idx) => {
          const speedPct = maxSpeed > 0 ? Math.min(100, Math.max(2, ((entry.speed || 0) / maxSpeed) * 100)) : 0;
          return (
            <div key={`${entry.id}-${idx}`} className="flex flex-col gap-3 rounded-xl border border-border/80 bg-secondary/20 p-4">
              <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2">
                <span className="max-w-[75%] break-words text-sm font-semibold text-foreground">{entry.name}</span>
                {entry.isRsPeer === true && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
                    {t.asnLabelRsPeer}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t.asnLabelSpeed}
                  </span>
                  <div className="mt-1 flex flex-col gap-1">
                    <span className="font-mono font-bold text-foreground">{formatSpeed(entry.speed, t)}</span>
                    {entry.speed && (
                      <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                          style={{ width: `${speedPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t.asnLabelRsPeer}
                  </span>
                  <span className="mt-1 block font-medium text-foreground/80">
                    {entry.isRsPeer === true ? t.asnBooleanYes : entry.isRsPeer === false ? t.asnBooleanNo : "-"}
                  </span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t.asnLabelIpv4}
                  </span>
                  <span className="break-all font-mono text-xs text-foreground">{valueOrDash(entry.ipaddr4)}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t.asnLabelIpv6}
                  </span>
                  <span className="break-all font-mono text-xs text-foreground">{valueOrDash(entry.ipaddr6)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ixlan.length > limit && (
        <ShowMoreButton expanded={expanded} onToggle={() => setExpanded(!expanded)} count={ixlan.length} t={t} />
      )}
    </div>
  );
}
