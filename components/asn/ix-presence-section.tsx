"use client";

import { useMemo, useState } from "react";
import { CircleCheck, Server, Waypoints } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
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
import { formatSpeed } from "./helpers";
import { ShowMoreButton } from "./show-more-button";

function SpeedBar({ pct }: { pct: number }) {
  return (
    <div className="h-1 w-full max-w-28 overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full bg-foreground/80"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function IxPresenceSection({ result, t }: { result: AsnProfile; t: ToolTranslation }) {
  const ixlan = useMemo(() => result.peeringdb?.ixlan || [], [result.peeringdb]);
  const total = result.peeringdb?.ixlanTotal || 0;

  const [expanded, setExpanded] = useState(false);
  const limit = 8;
  const visible = expanded ? ixlan : ixlan.slice(0, limit);

  const maxSpeed = useMemo(() => Math.max(...ixlan.map((x) => x.speed || 0), 1), [ixlan]);

  if (!ixlan.length) {
    return (
      <Card className="gap-3 py-5">
        <h3 className="flex items-center gap-2 px-5 text-lg font-bold text-foreground">
          <Waypoints className="size-5 text-primary" />
          {t.asnIxPresence}
        </h3>
        <p className="px-5 text-sm text-muted-foreground">{t.asnNoIxLanRecords}</p>
      </Card>
    );
  }

  return (
    <Card className="gap-4 py-5">
      <div className="flex items-start justify-between gap-3 border-b px-5 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Server className="size-5 text-primary" />
            {t.asnIxPresence}
          </h3>
          <p className="text-xs leading-normal text-muted-foreground">{t.asnIxDescription}</p>
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
              <TableHead>{t.asnLabelExchange}</TableHead>
              <TableHead>{t.asnLabelSpeed}</TableHead>
              <TableHead>{t.asnLabelIpv4}</TableHead>
              <TableHead>{t.asnLabelIpv6}</TableHead>
              <TableHead className="text-center">{t.asnLabelRsPeer}</TableHead>
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
                        {formatSpeed(entry.speed, t)}
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
                  <TableCell className="text-center">
                    {entry.isRsPeer === true ? (
                      <Badge variant="success">
                        <CircleCheck className="size-3" />
                        {t.asnBooleanYes}
                      </Badge>
                    ) : entry.isRsPeer === false ? (
                      <Badge variant="secondary">{t.asnBooleanNo}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 px-5 md:hidden">
        {visible.map((entry, idx) => {
          const speedPct = maxSpeed > 0 ? Math.min(100, Math.max(2, ((entry.speed || 0) / maxSpeed) * 100)) : 0;
          return (
            <div key={`${entry.id}-${idx}`} className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-2 border-b pb-2">
                <span className="max-w-[75%] text-sm font-semibold break-words text-foreground">
                  {entry.name}
                </span>
                {entry.isRsPeer === true && (
                  <Badge variant="success" className="text-[0.65rem]">
                    {t.asnLabelRsPeer}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t.asnLabelSpeed}
                  </span>
                  <div className="mt-1 flex flex-col gap-1">
                    <span className="font-mono font-bold text-foreground">{formatSpeed(entry.speed, t)}</span>
                    {entry.speed ? <SpeedBar pct={speedPct} /> : null}
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
                <div className="col-span-2">
                  <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t.asnLabelIpv4}
                  </span>
                  <span className="font-mono text-xs break-all text-foreground">{valueOrDash(entry.ipaddr4)}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t.asnLabelIpv6}
                  </span>
                  <span className="font-mono text-xs break-all text-foreground">{valueOrDash(entry.ipaddr6)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ixlan.length > limit && (
        <div className="px-5">
          <ShowMoreButton expanded={expanded} onToggle={() => setExpanded(!expanded)} count={ixlan.length} t={t} />
        </div>
      )}
    </Card>
  );
}
