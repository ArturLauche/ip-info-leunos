"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Route, Waypoints, Zap } from "lucide-react";
import type { AsnProfile, AsnRelation } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { ShowMoreButton } from "./show-more-button";

function RelationChip({
  relation,
  maxPower,
  locale,
  t,
}: {
  relation: AsnRelation;
  maxPower: number;
  locale: Locale;
  t: ToolTranslation;
}) {
  const powerPct = maxPower > 0 ? Math.min(100, Math.max(5, ((relation.power || 0) / maxPower) * 100)) : 0;

  return (
    <div className="group flex flex-col gap-2 rounded-xl border border-border/80 bg-card/25 p-3.5 transition-all hover:scale-[1.01] hover:border-primary/40 hover:bg-card/45">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/asn/${relation.asn}`}
          className="inline-flex items-center gap-1 font-mono text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {relation.asn}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
        {relation.source && (
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60">
            {relation.source}
          </span>
        )}
      </div>

      {relation.power !== null && relation.power !== undefined && (
        <div className="mt-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1 font-medium text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              {t.asnRelationPower}
            </span>
            <span className="font-mono font-bold text-foreground/90">{formatNumber(relation.power, locale)}</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${powerPct}%` }}
            />
          </div>
        </div>
      )}

      {(relation.v4Peers || relation.v6Peers) && (
        <div className="mt-1 flex items-center gap-2">
          {relation.v4Peers !== null && relation.v4Peers !== undefined && relation.v4Peers > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              v4: {formatNumber(relation.v4Peers, locale)}
            </span>
          )}
          {relation.v6Peers !== null && relation.v6Peers !== undefined && relation.v6Peers > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              v6: {formatNumber(relation.v6Peers, locale)}
            </span>
          )}
        </div>
      )}
    </div>
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

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/20 p-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Route className="h-4 w-4 text-primary" />
          {title}
        </p>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
          {total}
        </span>
      </div>

      {visible.length > 0 ? (
        <div className="flex flex-col gap-3">
          {visible.map((relation) => (
            <RelationChip key={relation.asn} relation={relation} maxPower={maxPower} locale={locale} t={t} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        </div>
      )}

      {relations.length > limit && (
        <ShowMoreButton expanded={expanded} onToggle={() => setExpanded(!expanded)} count={relations.length} t={t} />
      )}
    </div>
  );
}

export function RoutingSection({ result, t, locale }: { result: AsnProfile; t: ToolTranslation; locale: Locale }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Waypoints className="h-5 w-5 text-primary" />
          {t.asnRouting}
        </h3>
        <p className="text-xs leading-normal text-muted-foreground">{t.asnRoutingDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
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
