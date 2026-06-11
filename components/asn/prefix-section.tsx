"use client";

import { useState } from "react";
import { Network } from "lucide-react";
import type { AsnPrefix, AsnProfile } from "@/lib/asn";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { ShowMoreButton } from "./show-more-button";

function PrefixItem({ prefix, t }: { prefix: AsnPrefix; t: ToolTranslation }) {
  const rpki = prefix.rpkiStatus?.toLowerCase().trim();
  let rpkiBadge = null;

  if (rpki === "valid") {
    rpkiBadge = (
      <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
        RPKI Valid
      </span>
    );
  } else if (rpki === "invalid") {
    rpkiBadge = (
      <span className="rounded border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-red-300">
        RPKI Invalid
      </span>
    );
  } else if (prefix.rpkiStatus) {
    rpkiBadge = (
      <span className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        RPKI {prefix.rpkiStatus}
      </span>
    );
  }

  const details = [
    prefix.name,
    prefix.country,
    prefix.status,
    prefix.size ? `${prefix.size} ${t.asnPrefixIpCount}` : "",
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <li className="flex flex-col gap-1.5 border-b border-border/40 pb-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="select-all font-mono text-sm font-semibold text-foreground/95">{prefix.netblock}</span>
        {rpkiBadge}
      </div>
      {details && <p className="text-[11px] text-muted-foreground">{details}</p>}
    </li>
  );
}

function PrefixColumn({
  title,
  prefixes,
  total,
  emptyText,
  t,
}: {
  title: string;
  prefixes: AsnPrefix[];
  total: number;
  emptyText: string;
  t: ToolTranslation;
}) {
  const [expanded, setExpanded] = useState(false);
  const limit = 6;
  const visible = expanded ? prefixes : prefixes.slice(0, limit);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-secondary/15 p-5">
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <span className="font-mono text-sm font-semibold text-foreground">{title}</span>
        <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
          {total}
        </span>
      </div>

      {visible.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {visible.map((prefix, idx) => (
            <PrefixItem key={`${prefix.netblock}-${idx}`} prefix={prefix} t={t} />
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-xs text-muted-foreground">{emptyText}</p>
      )}

      {prefixes.length > limit && (
        <ShowMoreButton expanded={expanded} onToggle={() => setExpanded(!expanded)} count={prefixes.length} t={t} />
      )}
    </div>
  );
}

export function PrefixSection({ result, t }: { result: AsnProfile; t: ToolTranslation }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/35 p-5 shadow-sm md:p-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Network className="h-5 w-5 text-primary" />
            {t.asnPrefixes}
          </h3>
          <p className="text-xs leading-normal text-muted-foreground">{t.asnPrefixesDescription}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PrefixColumn
          title={t.asnLabelIpv4}
          prefixes={result.prefixes4}
          total={result.prefixes4Total}
          emptyText={t.asnNoPrefixes}
          t={t}
        />
        <PrefixColumn
          title={t.asnLabelIpv6}
          prefixes={result.prefixes6}
          total={result.prefixes6Total}
          emptyText={t.asnNoPrefixes}
          t={t}
        />
      </div>
    </div>
  );
}
