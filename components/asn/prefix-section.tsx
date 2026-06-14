"use client";

import { useState } from "react";
import { Network } from "lucide-react";
import type { AsnPrefix, AsnProfile } from "@/lib/asn";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShowMoreButton } from "./show-more-button";

function PrefixItem({ prefix, t }: { prefix: AsnPrefix; t: ToolTranslation }) {
  const rpki = prefix.rpkiStatus?.toLowerCase().trim();
  let rpkiBadge = null;

  if (rpki === "valid") {
    rpkiBadge = (
      <Badge variant="success" className="text-[0.65rem] uppercase">
        RPKI Valid
      </Badge>
    );
  } else if (rpki === "invalid") {
    rpkiBadge = (
      <Badge variant="destructive" className="text-[0.65rem] uppercase">
        RPKI Invalid
      </Badge>
    );
  } else if (prefix.rpkiStatus) {
    rpkiBadge = (
      <Badge variant="secondary" className="text-[0.65rem] uppercase">
        RPKI {prefix.rpkiStatus}
      </Badge>
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
    <li className="flex flex-col gap-1.5 border-b pb-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-semibold text-foreground/95 select-all">
          {prefix.netblock}
        </span>
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
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-5">
      <div className="flex items-center justify-between border-b pb-2.5">
        <span className="font-mono text-sm font-semibold text-foreground">{title}</span>
        <Badge variant="secondary" className="font-mono tabular-nums">
          {total}
        </Badge>
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
    <Card className="gap-4 py-5">
      <div className="flex flex-col gap-1 border-b px-5 pb-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Network className="size-5 text-primary" />
          {t.asnPrefixes}
        </h3>
        <p className="text-xs leading-normal text-muted-foreground">{t.asnPrefixesDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 px-5 lg:grid-cols-2">
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
    </Card>
  );
}
