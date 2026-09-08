"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { AsnProfile, AsnRelation } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { ShowMoreButton } from "./show-more-button";

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
  const powerPct = maxPower > 0 ? Math.min(100, Math.max(5, ((relation.power || 0) / maxPower) * 100)) : 0;
  const peerParts: string[] = [];
  if (relation.v4Peers !== null && relation.v4Peers !== undefined && relation.v4Peers > 0) {
    peerParts.push(`v4 ${formatNumber(relation.v4Peers, locale)}`);
  }
  if (relation.v6Peers !== null && relation.v6Peers !== undefined && relation.v6Peers > 0) {
    peerParts.push(`v6 ${formatNumber(relation.v6Peers, locale)}`);
  }

  return (
    <li className="group flex items-center gap-3 border-b py-2.5 last:border-b-0">
      <Link
        href={`/asn/${relation.asn}`}
        className="shrink-0 rounded-sm font-mono text-sm font-semibold text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        {relation.asn}
      </Link>
      <ArrowUpRight
        className="size-3.5 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        aria-hidden
      />
      <div className="ml-auto flex min-w-0 items-center gap-2">
        {peerParts.length > 0 && (
          <span className="truncate font-mono text-[11px] text-muted-foreground tabular-nums">
            {peerParts.join(" · ")}
          </span>
        )}
        {relation.source && (
          <span className="hidden shrink-0 text-[11px] text-muted-foreground/70 sm:inline">
            {relation.source}
          </span>
        )}
        {showPower && relation.power !== null && relation.power !== undefined && (
          <span className="flex shrink-0 items-center gap-1.5" title={powerLabel}>
            <span className="h-1 w-12 overflow-hidden rounded-full bg-secondary sm:w-16" aria-hidden>
              <span
                className="block h-full rounded-full bg-foreground/70"
                style={{ width: `${powerPct}%` }}
              />
            </span>
            <span className="font-mono text-[11px] font-semibold text-foreground/80 tabular-nums">
              {formatNumber(relation.power, locale)}
            </span>
          </span>
        )}
      </div>
    </li>
  );
}

function RelationColumn({
  title,
  relations,
  total,
  emptyText,
  locale,
  t,
}: {
  title: string;
  relations: AsnRelation[];
  total: number;
  emptyText: string;
  locale: Locale;
  t: ToolTranslation;
}) {
  const [expanded, setExpanded] = useState(false);
  const limit = 8;
  const visible = expanded ? relations : relations.slice(0, limit);
  const maxPower = useMemo(() => Math.max(...relations.map((r) => r.power || 0), 0), [relations]);
  const showPower = relations.some((r) => r.power !== null && r.power !== undefined);

  return (
    <section aria-label={title} className="flex min-w-0 flex-col">
      <p className="flex items-baseline justify-between gap-2 border-b pb-2">
        <span className="text-xs font-semibold tracking-wide text-foreground uppercase">{title}</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{formatNumber(total, locale)}</span>
      </p>

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
        <p className="py-6 text-center text-xs text-muted-foreground">{emptyText}</p>
      )}

      {relations.length > limit && (
        <div className="pt-2">
          <ShowMoreButton expanded={expanded} onToggle={() => setExpanded(!expanded)} count={relations.length} t={t} />
        </div>
      )}
    </section>
  );
}

export function RoutingSection({ result, t, locale }: { result: AsnProfile; t: ToolTranslation; locale: Locale }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t.asnRouting}
        </h3>
        <p className="max-w-2xl text-xs leading-normal text-muted-foreground">{t.asnRoutingDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5">
        <RelationColumn
          title={t.asnRelationPeers}
          relations={result.peers}
          total={result.peersTotal}
          emptyText={t.asnNoRelations}
          locale={locale}
          t={t}
        />
        <RelationColumn
          title={t.asnRelationUpstreams}
          relations={result.upstreams}
          total={result.upstreamsTotal}
          emptyText={t.asnNoRelations}
          locale={locale}
          t={t}
        />
        <RelationColumn
          title={t.asnRelationDownstreams}
          relations={result.downstreams}
          total={result.downstreamsTotal}
          emptyText={t.asnNoRelations}
          locale={locale}
          t={t}
        />
      </div>
    </div>
  );
}
