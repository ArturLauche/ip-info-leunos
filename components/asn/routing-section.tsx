"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeftRight, ArrowUp, ArrowUpRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AsnProfile, AsnRelation } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { DataColumn } from "./data-column";
import { hasSourceInfoFlag } from "./helpers";
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
  const power = relation.power;
  const hasPower = showPower && power !== null && power !== undefined;
  const powerPct =
    hasPower && maxPower > 0 && (power || 0) > 0
      ? Math.min(100, Math.max(6, ((power || 0) / maxPower) * 100))
      : 0;
  const metaParts: string[] = [];
  if (relation.v4Peers !== null && relation.v4Peers !== undefined && relation.v4Peers > 0) {
    metaParts.push(`v4 ${formatNumber(relation.v4Peers, locale)}`);
  }
  if (relation.v6Peers !== null && relation.v6Peers !== undefined && relation.v6Peers > 0) {
    metaParts.push(`v6 ${formatNumber(relation.v6Peers, locale)}`);
  }
  if (relation.source) metaParts.push(relation.source);

  return (
    <li className="border-b border-border/60 last:border-b-0">
      <Link
        href={`/asn/${relation.asn}${hasSourceInfoFlag() ? "?source-info=1" : ""}`}
        className="group/row -mx-2 flex min-w-0 flex-col gap-1.5 rounded-md px-2 py-2.5 outline-none transition-colors hover:bg-muted/55 focus-visible:bg-muted/55 focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate font-mono text-sm font-semibold tracking-tight text-foreground transition-colors group-hover/row:text-primary">
            {relation.asn}
          </span>
          <ArrowUpRight
            className="size-3.5 shrink-0 text-muted-foreground/45 transition-opacity group-hover/row:opacity-100"
            aria-hidden="true"
          />
          <span className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
            {hasPower && (
              <span
                className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-foreground/10 sm:block"
                aria-hidden="true"
              >
                <span
                  className="block h-full rounded-full bg-foreground/60 transition-[width] duration-300"
                  style={{ width: `${powerPct}%` }}
                />
              </span>
            )}
            {hasPower ? (
              <span
                className="font-mono text-xs font-semibold text-foreground/80 tabular-nums"
                title={powerLabel}
                aria-label={`${powerLabel}: ${formatNumber(power, locale)}`}
              >
                {formatNumber(power, locale)}
              </span>
            ) : (
              <Minus className="size-3 text-muted-foreground/40" aria-label={powerLabel} />
            )}
          </span>
        </div>
        {metaParts.length > 0 && (
          <p
            title={metaParts.join(" · ")}
            className="truncate font-mono text-[11px] text-muted-foreground tabular-nums"
          >
            {metaParts.join(" · ")}
          </p>
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
  emptyText,
  locale,
  t,
}: {
  title: string;
  icon: LucideIcon;
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
      loadedCount={relations.length}
      locale={locale}
      t={t}
      footer={
        relations.length > ROW_LIMIT ? (
          <div className="pt-3">
            <ShowMoreButton
              expanded={expanded}
              onToggle={() => setExpanded(!expanded)}
              count={relations.length}
              reportedTotal={total}
              locale={locale}
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
        <div className="mt-3 flex items-center justify-center rounded-md border border-dashed border-border/70 px-4 py-8 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">{emptyText}</p>
        </div>
      )}
    </DataColumn>
  );
}

export function RoutingSection({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  return (
    <section aria-label={t.asnRouting} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {t.asnRouting}
        </h3>
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
          {t.asnRoutingDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-7 md:grid-cols-3 md:gap-x-6">
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
