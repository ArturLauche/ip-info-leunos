"use client";

import { useMemo, useState } from "react";
import type { AsnProfile } from "@/lib/asn";
import type { Locale } from "@/lib/i18n";
import { formatNumber, valueOrDash } from "@/lib/format";
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

function SpeedBar({ pct }: { pct: number }) {
  return (
    <span className="h-1 w-full max-w-28 overflow-hidden rounded-full bg-secondary" aria-hidden>
      <span className="block h-full rounded-full bg-foreground/70" style={{ width: `${pct}%` }} />
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
  const ixlan = useMemo(() => result.peeringdb?.ixlan || [], [result.peeringdb]);
  const total = result.peeringdb?.ixlanTotal || 0;

  const [expanded, setExpanded] = useState(false);
  const limit = 8;
  const visible = expanded ? ixlan : ixlan.slice(0, limit);

  const maxSpeed = useMemo(() => Math.max(...ixlan.map((x) => x.speed || 0), 1), [ixlan]);

  return (
    <section aria-label={t.asnIxPresence} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="flex items-baseline justify-between gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t.asnIxPresence}
          {ixlan.length > 0 && (
            <span className="font-mono font-normal normal-case tabular-nums">{formatNumber(total, locale)}</span>
          )}
        </h3>
        <p className="max-w-2xl text-xs leading-normal text-muted-foreground">{t.asnIxDescription}</p>
      </div>

      {ixlan.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.asnNoIxLanRecords}</p>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t.asnLabelExchange}</TableHead>
                  <TableHead>{t.asnLabelSpeed}</TableHead>
                  <TableHead>{t.asnLabelIpv4}</TableHead>
                  <TableHead>{t.asnLabelIpv6}</TableHead>
                  <TableHead className="text-right">{t.asnLabelRsPeer}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((entry, idx) => {
                  const speedPct = maxSpeed > 0 ? Math.min(100, Math.max(2, ((entry.speed || 0) / maxSpeed) * 100)) : 0;
                  return (
                    <TableRow key={`${entry.id}-${idx}`}>
                      <TableCell
                        className="max-w-xs truncate font-medium text-foreground"
                        title={entry.name}
                      >
                        {entry.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-[120px] flex-col gap-1.5">
                          <span className="font-mono text-xs font-semibold text-foreground/90">
                            {formatSpeed(entry.speed, t, locale)}
                          </span>
                          {entry.speed ? <SpeedBar pct={speedPct} /> : null}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs break-all text-muted-foreground">
                        {valueOrDash(entry.ipaddr4)}
                      </TableCell>
                      <TableCell className="font-mono text-xs break-all text-muted-foreground">
                        {valueOrDash(entry.ipaddr6)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {entry.isRsPeer === true ? t.asnBooleanYes : entry.isRsPeer === false ? t.asnBooleanNo : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: stacked rows */}
          <ul className="flex flex-col md:hidden">
            {visible.map((entry, idx) => {
              const speedPct = maxSpeed > 0 ? Math.min(100, Math.max(2, ((entry.speed || 0) / maxSpeed) * 100)) : 0;
              return (
                <li key={`${entry.id}-${idx}`} className="flex flex-col gap-1.5 border-b py-3 first:pt-0 last:border-b-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate text-sm font-semibold text-foreground" title={entry.name}>
                      {entry.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs font-semibold text-foreground/90">
                      {formatSpeed(entry.speed, t, locale)}
                    </span>
                  </div>
                  {entry.speed ? <SpeedBar pct={speedPct} /> : null}
                  <p className="font-mono text-[11px] break-all text-muted-foreground">
                    {valueOrDash(entry.ipaddr4)}
                    {entry.ipaddr6 && entry.ipaddr6 !== entry.ipaddr4 ? ` · ${entry.ipaddr6}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>

          {ixlan.length > limit && (
            <ShowMoreButton expanded={expanded} onToggle={() => setExpanded(!expanded)} count={ixlan.length} t={t} />
          )}
        </>
      )}
    </section>
  );
}
