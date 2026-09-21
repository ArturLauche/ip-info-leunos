"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeftRight, ArrowUp, ArrowUpRight } from "lucide-react";
import type { AsnProfile, AsnRelation } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { DataColumn } from "./data-column";
import { ShowMoreButton } from "./show-more-button";

const ROW_LIMIT = 8;

function RelationRow({
  relation,
  maxPower,
  showPower,
  locale,
  powerLabel,
}: {
  relation: AsnRelation;
  maxPower: number;
  showPower: boolean;
  locale: Locale;
  powerLabel: string;
}) {
  const powerPct =
    maxPower > 0 ? Math.min(100, Math.max(6, ((relation.power || 0) / maxPower) * 100)) : 0;
  // Secondary metadata shares one quiet line so peer counts and provenance
  // never truncate against the power cluster on narrow columns.
  const metaParts: string[] = [];
  if (relation.v4Peers !== null && relation.v4Peers !== undefined && relation.v4Peers > 0) {
    metaParts.push(`v4 ${formatNumber(relation.v4Peers, locale)}`);
  }
  if (relation.v6Peers !== null && relation.v6Peers !== undefined && relation.v6Peers > 0) {
    metaParts.push(`v6 ${formatNumber(relation.v6Peers, locale)}`);
  }
  if (relation.source) {
    metaParts.push(relation.source);
  }
  const hasPower = showPower && relation.power !== null && relation.power !== undefined;

  return (
    <li className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/40">
      <div className="flex items-center gap-2 py-2.5">
        <Link
          href={`/asn/${relation.asn}`}
          className="group/link flex min-w-0 items-center gap-1 rounded-sm font-mono text-sm font-semibold text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          {relation.asn}
          <ArrowUpRight
            className="size-3.5 shrink-0 text-muted-foreground/50 transition-opacity group-hover/link:opacity-100"
            aria-hidden
          />
        </Link>
        {hasPower && (
          <span className="ml-auto flex shrink-0 items-center gap-2" title={powerLabel}>
            <span
              className="hidden h-1 w-14 overflow-hidden rounded-full bg-foreground/10 sm:block"
              aria-hidden
            >
              <span
                className="block h-full rounded-full bg-foreground/60"
                style={{ width: `${powerPct}%` }}
              />
            </span>
            <span className="font-mono text-xs font-semibold text-foreground/80 tabular-nums">
              {formatNumber(relation.power, locale)}
            </span>
          </span>
        )}
      </div>
      {metaParts.length > 0 && (
        <p className="pb-2.5 font-mono text-[11px] text-muted-foreground tabular-nums">
          {metaParts.join(" · ")}
        </p>
      )}
    </li>
  );
}

function RelationColumn({
  title,
  icon,
  relations,
  total,
  emptyText,
  locale,
  t,
}: {
  title: string;
  icon: typeof ArrowUp;
  relations: AsnRelation[];
  total: number;
  emptyText: string;
  locale: Locale;
  t: ToolTranslation;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? relations : relations.slice(0, ROW_LIMIT);
  const maxPower = useMemo(() => Math.max(...relations.map((r) => r.power || 0), 0), [relations]);
  const showPower = relations.some((r) => r.power !== null && r.power !== undefined);

  return (
    <DataColumn
      title={title}
      icon={icon}
      total={total}
      locale={locale}
      footer={
        relations.length > ROW_LIMIT ? (
          <div className="pt-3">
            <ShowMoreButton
              expanded={expanded}
              onToggle={() => setExpanded(!expanded)}
              count={relations.length}
              t={t}
            />
          </div>
        ) : undefined
      }
    >
      {visible.length > 0 ? (
        <ul className="flex flex-col">
          {visible.map((relation) => (
            <RelationRow
              key={relation.asn}
              relation={relation}
              maxPower={maxPower}
              showPower={showPower}
              locale={locale}
              powerLabel={t.asnRelationPower}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-border/70 px-4 py-7 text-center">
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        </div>
      )}
    </DataColumn>
  );
}

export function RoutingSection({ result, t, locale }: { result: AsnProfile; t: ToolTranslation; locale: Locale }) {
  return (
    <section aria-label={t.asnRouting} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t.asnRouting}
        </h3>
        <p className="max-w-2xl text-xs leading-normal text-muted-foreground">{t.asnRoutingDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5">
        <RelationColumn
          title={t.asnRelationPeers}
          icon={ArrowLeftRight}
          relations={result.peers}
          total={result.peersTotal}
          emptyText={t.asnNoRelations}
          locale={locale}
          t={t}
        />
        <RelationColumn
          title={t.asnRelationUpstreams}
          icon={ArrowUp}
          relations={result.upstreams}
          total={result.upstreamsTotal}
          emptyText={t.asnNoRelations}
          locale={locale}
          t={t}
        />
        <RelationColumn
          title={t.asnRelationDownstreams}
          icon={ArrowDown}
          relations={result.downstreams}
          total={result.downstreamsTotal}
          emptyText={t.asnNoRelations}
          locale={locale}
          t={t}
        />
      </div>
    </section>
  );
}
