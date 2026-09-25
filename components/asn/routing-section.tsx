"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowDown, ArrowLeftRight, ArrowUp, ArrowUpRight, Share2, type LucideIcon } from "lucide-react";
import type { AsnProfile, AsnRelation } from "@/lib/asn";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import { DataColumn, EmptyColumn } from "./data-column";
import { ASN_ROW_LIMIT, relativeShare } from "./helpers";
import { ScaleBar } from "./scale-bar";
import { SectionHeading } from "./section-heading";
import { ShowMoreButton } from "./show-more-button";

// One template for the header and every row keeps the numeric columns on a
// shared grid. Below ~17.5rem of column width the peer counts move to a
// second line instead of squeezing the ASN.
const WIDE_ROW = "@min-[17.5rem]:grid-cols-[minmax(0,1fr)_3rem_3rem_5.25rem]";

function hasValue(value: number | null | undefined): value is number {
  return value !== null && value !== undefined;
}

function RelationRow({
  relation,
  maxPower,
  showMetrics,
  locale,
  t,
}: {
  relation: AsnRelation;
  maxPower: number;
  showMetrics: boolean;
  locale: Locale;
  t: ToolTranslation;
}) {
  const v4 = hasValue(relation.v4Peers) ? formatNumber(relation.v4Peers, locale) : null;
  const v6 = hasValue(relation.v6Peers) ? formatNumber(relation.v6Peers, locale) : null;
  const power = hasValue(relation.power) ? formatNumber(relation.power, locale) : null;

  // The visible cells are terse; the link's name spells the figures out.
  const description = [
    relation.asn,
    power && `${t.asnRelationPower} ${power}`,
    v4 && `${t.asnRelationV4Peers} ${v4}`,
    v6 && `${t.asnRelationV6Peers} ${v6}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <li>
      <Link
        href={`/asn/${relation.asn}`}
        aria-label={description}
        className={cn(
          "group/row -mx-2 grid min-h-9 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-0.5 rounded-md px-2 py-1.5 outline-none transition-colors duration-150 hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring/60 pointer-coarse:min-h-11",
          showMetrics && WIDE_ROW,
        )}
      >
        <span className="flex min-w-0 items-center gap-1 font-mono text-[13px] font-semibold text-foreground">
          <span className="truncate underline-offset-4 group-hover/row:underline">{relation.asn}</span>
          <ArrowUpRight
            className="size-3 shrink-0 text-muted-foreground/50 transition-[color,translate] duration-150 group-hover/row:translate-x-px group-hover/row:-translate-y-px group-hover/row:text-foreground group-focus-visible/row:text-foreground"
            aria-hidden
          />
        </span>

        {showMetrics && (
          <>
            <span className="hidden text-right font-mono text-xs text-muted-foreground tabular-nums @min-[17.5rem]:block">
              {v4 ?? "—"}
            </span>
            <span className="hidden text-right font-mono text-xs text-muted-foreground tabular-nums @min-[17.5rem]:block">
              {v6 ?? "—"}
            </span>
            <span className="flex items-center justify-end gap-2">
              {power && <ScaleBar pct={relativeShare(relation.power, maxPower, 6)} className="w-7" />}
              <span
                className={cn(
                  "min-w-[2.75rem] text-right font-mono text-xs tabular-nums",
                  power ? "font-medium text-foreground/90" : "text-muted-foreground/60",
                )}
              >
                {power ?? "—"}
              </span>
            </span>
            {(v4 || v6) && (
              <span className="col-span-2 font-mono text-[11px] text-muted-foreground tabular-nums @min-[17.5rem]:hidden">
                {[v4 && `v4 ${v4}`, v6 && `v6 ${v6}`].filter(Boolean).join(" · ")}
              </span>
            )}
          </>
        )}
      </Link>
    </li>
  );
}

function RelationColumn({
  title,
  icon,
  relations,
  total,
  locale,
  t,
}: {
  title: string;
  icon: LucideIcon;
  relations: AsnRelation[];
  total: number;
  locale: Locale;
  t: ToolTranslation;
}) {
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? relations : relations.slice(0, ASN_ROW_LIMIT);
  // Bars scale to the strongest relation in this column: they rank rows
  // within a relationship type; the figures compare across types.
  const maxPower = useMemo(() => Math.max(0, ...relations.map((r) => r.power || 0)), [relations]);
  const showMetrics = relations.some(
    (r) => hasValue(r.power) || hasValue(r.v4Peers) || hasValue(r.v6Peers),
  );

  return (
    <DataColumn
      title={title}
      icon={icon}
      total={total}
      locale={locale}
      footer={
        <ShowMoreButton
          expanded={expanded}
          onToggle={() => setExpanded((value) => !value)}
          hiddenCount={relations.length - ASN_ROW_LIMIT}
          listed={relations.length}
          total={total}
          controls={listId}
          t={t}
          locale={locale}
        />
      }
    >
      {visible.length > 0 ? (
        <>
          {showMetrics && (
            <div
              aria-hidden
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 pt-2.5 pb-1 text-[10.5px] font-medium tracking-wider text-muted-foreground/80 uppercase",
                WIDE_ROW,
              )}
            >
              <span>ASN</span>
              <span className="hidden text-right @min-[17.5rem]:block" title={t.asnRelationV4Peers}>
                v4
              </span>
              <span className="hidden text-right @min-[17.5rem]:block" title={t.asnRelationV6Peers}>
                v6
              </span>
              <span className="text-right">{t.asnRelationPower}</span>
            </div>
          )}
          <ul id={listId} className={cn("flex flex-col", !showMetrics && "pt-1.5")}>
            {visible.map((relation) => (
              <RelationRow
                key={relation.asn}
                relation={relation}
                maxPower={maxPower}
                showMetrics={showMetrics}
                locale={locale}
                t={t}
              />
            ))}
          </ul>
        </>
      ) : (
        <EmptyColumn text={t.asnNoneReported} />
      )}
    </DataColumn>
  );
}

export function RoutingSection({ result, t, locale }: { result: AsnProfile; t: ToolTranslation; locale: Locale }) {
  const headingId = useId();
  const all = [...result.upstreams, ...result.peers, ...result.downstreams];
  const empty = all.length === 0 && result.peersTotal + result.upstreamsTotal + result.downstreamsTotal === 0;
  const sources = [...new Set(all.map((relation) => relation.source).filter(Boolean))] as string[];

  // Topological order — providers, lateral neighbours, customers — so the
  // three lists read like the network's position in the routing hierarchy.
  const columns = [
    { key: "upstreams", title: t.asnRelationUpstreams, icon: ArrowUp, relations: result.upstreams, total: result.upstreamsTotal },
    { key: "peers", title: t.asnRelationPeers, icon: ArrowLeftRight, relations: result.peers, total: result.peersTotal },
    { key: "downstreams", title: t.asnRelationDownstreams, icon: ArrowDown, relations: result.downstreams, total: result.downstreamsTotal },
  ];

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <SectionHeading id={headingId} title={t.asnRouting} description={t.asnRoutingDescription} hideTitle />

      {empty ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/80 px-6 py-10 text-center">
          <Share2 className="size-5 text-muted-foreground/60" aria-hidden />
          <p className="max-w-sm text-sm text-muted-foreground">{t.asnNoRelations}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 xl:gap-8">
          {columns.map((column) => (
            <RelationColumn
              key={column.key}
              title={column.title}
              icon={column.icon}
              relations={column.relations}
              total={column.total}
              locale={locale}
              t={t}
            />
          ))}
        </div>
      )}

      {!empty && sources.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {formatTemplate(t.asnRelationObservedVia, { source: sources.join(", ") })}
        </p>
      )}
    </section>
  );
}
