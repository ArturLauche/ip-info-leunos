"use client";

import { useId, useMemo, useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import type { AsnProfile, PeeringDbIxLan } from "@/lib/asn";
import type { IxSortKey, SortState } from "@/lib/asn-sort";
import { defaultIxSortDirection, nextHeaderSort, sortIxlan } from "@/lib/asn-sort";
import type { Locale } from "@/lib/i18n";
import { formatTemplate } from "@/lib/format";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyColumn } from "./data-column";
import { ExternalLink } from "./external-link";
import { ASN_ROW_LIMIT, formatCount, formatSpeed, peeringDbUrl, relativeShare, splitIxName } from "./helpers";
import { MobileSortControl } from "./mobile-sort-control";
import { ScaleBar } from "./scale-bar";
import { SectionHeading } from "./section-heading";
import { ShowMoreButton } from "./show-more-button";
import {
  SortableColumnHeader,
  sortAriaLabel,
  SortableTableHead,
  type SortableColumn,
} from "./sortable-column-header";

function ExchangeName({ entry, t }: { entry: PeeringDbIxLan; t: ToolTranslation }) {
  const { exchange, lan } = splitIxName(entry.name);
  const url = peeringDbUrl("ix", entry.ixId);

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      {url ? (
        <ExternalLink
          href={url}
          text={exchange}
          label={formatTemplate(t.asnViewOnPeeringDb, { name: entry.name })}
          variant="subtle"
          className="self-start text-sm font-medium"
        />
      ) : (
        <span className="text-sm font-medium break-words text-foreground">{exchange}</span>
      )}
      {lan && <span className="text-xs break-words text-muted-foreground">{lan}</span>}
      {entry.operational === false && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning">
          <TriangleAlert className="size-3" aria-hidden />
          {t.asnIxNotOperational}
        </span>
      )}
    </div>
  );
}

function RsPeer({ value, t }: { value: boolean | null; t: ToolTranslation }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.07] px-2 py-0.5 text-[11px] font-medium text-foreground capitalize">
        <Check className="size-3" strokeWidth={2.5} aria-hidden />
        {t.asnBooleanYes}
      </span>
    );
  }
  if (value === false) {
    return <span className="text-xs text-muted-foreground/70 capitalize">{t.asnBooleanNo}</span>;
  }
  return <span className="text-muted-foreground/50">—</span>;
}

function Address({ value }: { value: string }) {
  if (!value) return <span className="text-muted-foreground/50">—</span>;
  return <span className="break-all select-all">{value}</span>;
}

/**
 * IPv4 and IPv6 share one stacked column (as PeeringDB lays them out) so the
 * table fits beside the sidebar without hiding columns; each address family
 * keeps its own sort button.
 */
function AddressesHead({
  sort,
  onToggle,
  t,
}: {
  sort: SortState<IxSortKey>;
  onToggle: (key: IxSortKey) => void;
  t: ToolTranslation;
}) {
  const activeKey = sort.direction && (sort.key === "ipv4" || sort.key === "ipv6") ? sort.key : null;
  const families: { key: IxSortKey; label: string }[] = [
    { key: "ipv4", label: t.asnLabelIpv4 },
    { key: "ipv6", label: t.asnLabelIpv6 },
  ];

  return (
    <TableHead
      scope="col"
      aria-sort={activeKey ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      className={cn("h-10 px-3 text-[11px] transition-colors", activeKey && "bg-muted/70")}
    >
      <span className="inline-flex items-center gap-1.5">
        {families.map((family, index) => (
          <span key={family.key} className="inline-flex items-center gap-1.5">
            {index > 0 && (
              <span aria-hidden className="text-muted-foreground/40">
                /
              </span>
            )}
            <SortableColumnHeader
              label={family.label}
              active={activeKey === family.key}
              direction={activeKey === family.key ? sort.direction : null}
              onToggle={() => onToggle(family.key)}
              ariaLabel={sortAriaLabel(family.label, activeKey === family.key ? sort.direction : null, t)}
            />
          </span>
        ))}
      </span>
    </TableHead>
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
  const headingId = useId();
  const tableId = useId();
  const listId = useId();
  const ixlan = useMemo(() => result.peeringdb?.ixlan || [], [result.peeringdb]);
  const total = Math.max(result.peeringdb?.ixlanTotal || 0, ixlan.length);
  const exchanges = result.peeringdb?.ixCount || 0;

  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState<SortState<IxSortKey>>({ key: null, direction: null });

  const sorted = useMemo(() => sortIxlan(ixlan, sort.key, sort.direction, locale), [ixlan, sort, locale]);
  const visible = expanded ? sorted : sorted.slice(0, ASN_ROW_LIMIT);
  const maxSpeed = useMemo(() => Math.max(0, ...ixlan.map((x) => x.speed || 0)), [ixlan]);
  const sortedKey = sort.direction ? sort.key : null;

  const toggleSort = (key: IxSortKey) => setSort((prev) => nextHeaderSort(prev, key, defaultIxSortDirection(key)));

  const nameColumn: SortableColumn<IxSortKey> = { key: "name", label: t.asnLabelExchange, className: "pl-4" };
  const speedColumn: SortableColumn<IxSortKey> = { key: "speed", label: t.asnLabelSpeed, align: "right" };
  const rsColumn: SortableColumn<IxSortKey> = {
    key: "rsPeer",
    label: t.asnLabelRsPeer,
    align: "right",
    className: "pr-4",
  };
  const sortOptions: { key: IxSortKey; label: string }[] = [
    { key: "name", label: t.asnLabelExchange },
    { key: "speed", label: t.asnLabelSpeed },
    { key: "ipv4", label: t.asnLabelIpv4 },
    { key: "ipv6", label: t.asnLabelIpv6 },
    { key: "rsPeer", label: t.asnLabelRsPeer },
  ];
  const cellTint = (...keys: IxSortKey[]) => sortedKey !== null && keys.includes(sortedKey) && "bg-muted/35";

  const meta =
    total > 0
      ? [
          formatCount(t.asnConnectionCount, total, locale),
          exchanges > 0 ? formatCount(t.asnExchangeCount, exchanges, locale) : "",
        ]
          .filter(Boolean)
          .join(" · ")
      : undefined;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <SectionHeading id={headingId} title={t.asnIxPresence} meta={meta} description={t.asnIxDescription} />

      {ixlan.length === 0 ? (
        <EmptyColumn text={t.asnNoIxLanRecords} />
      ) : (
        <div className="flex flex-col gap-2">
          <MobileSortControl
            options={sortOptions}
            sort={sort}
            onChange={setSort}
            defaultDirection={defaultIxSortDirection}
            t={t}
          />

          {/* Desktop: dense data table */}
          <div className="hidden overflow-hidden rounded-lg border border-border/70 md:block">
            <Table id={tableId} aria-labelledby={headingId}>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <SortableTableHead column={nameColumn} sort={sort} onToggle={toggleSort} t={t} />
                  <SortableTableHead column={speedColumn} sort={sort} onToggle={toggleSort} t={t} />
                  <AddressesHead sort={sort} onToggle={toggleSort} t={t} />
                  <SortableTableHead column={rsColumn} sort={sort} onToggle={toggleSort} t={t} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((entry, idx) => (
                  <TableRow key={`${entry.id}-${idx}`} className="border-border/50 hover:bg-muted/30">
                    <TableCell className={cn("min-w-44 py-2.5 pl-4 whitespace-normal", cellTint("name"))}>
                      <ExchangeName entry={entry} t={t} />
                    </TableCell>
                    <TableCell className={cn("py-2.5", cellTint("speed"))}>
                      <div className="flex items-center justify-end gap-2.5">
                        {entry.speed ? <ScaleBar pct={relativeShare(entry.speed, maxSpeed)} className="w-12" /> : null}
                        <span
                          className={cn(
                            "min-w-[4.5rem] text-right font-mono text-xs tabular-nums",
                            entry.speed ? "font-semibold text-foreground" : "text-muted-foreground/50",
                          )}
                        >
                          {formatSpeed(entry.speed, t, locale)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "max-w-[18rem] py-2.5 font-mono text-xs whitespace-normal text-foreground/80",
                        cellTint("ipv4", "ipv6"),
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <Address value={entry.ipaddr4} />
                        <Address value={entry.ipaddr6} />
                      </div>
                    </TableCell>
                    <TableCell className={cn("py-2.5 pr-4 text-right", cellTint("rsPeer"))}>
                      <RsPeer value={entry.isRsPeer} t={t} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Phones: one compact block per connection — exchange and port
              speed lead, addresses sit in an aligned mono grid below. */}
          <ul id={listId} className="flex flex-col md:hidden">
            {visible.map((entry, idx) => (
              <li
                key={`${entry.id}-${idx}`}
                className="flex flex-col gap-2 border-b border-border/50 py-3 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <ExchangeName entry={entry} t={t} />
                  <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                    <span
                      className={cn(
                        "font-mono text-xs tabular-nums",
                        entry.speed ? "font-semibold text-foreground" : "text-muted-foreground/50",
                      )}
                    >
                      {formatSpeed(entry.speed, t, locale)}
                    </span>
                    {entry.speed ? <ScaleBar pct={relativeShare(entry.speed, maxSpeed)} className="w-14" /> : null}
                  </div>
                </div>
                {(entry.ipaddr4 || entry.ipaddr6) && (
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 font-mono text-[11px]">
                    {entry.ipaddr4 && (
                      <>
                        <dt className="text-muted-foreground/70">{t.asnLabelIpv4}</dt>
                        <dd className="break-all text-foreground/80 select-all">{entry.ipaddr4}</dd>
                      </>
                    )}
                    {entry.ipaddr6 && (
                      <>
                        <dt className="text-muted-foreground/70">{t.asnLabelIpv6}</dt>
                        <dd className="break-all text-foreground/80 select-all">{entry.ipaddr6}</dd>
                      </>
                    )}
                  </dl>
                )}
                {entry.isRsPeer === true && (
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-foreground/[0.07] px-2 py-0.5 text-[11px] font-medium text-foreground">
                    <Check className="size-3" strokeWidth={2.5} aria-hidden />
                    {t.asnLabelRsPeer}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <ShowMoreButton
            expanded={expanded}
            onToggle={() => setExpanded((value) => !value)}
            hiddenCount={sorted.length - ASN_ROW_LIMIT}
            listed={ixlan.length}
            total={total}
            controls={`${tableId} ${listId}`}
            t={t}
            locale={locale}
          />
        </div>
      )}
    </section>
  );
}
