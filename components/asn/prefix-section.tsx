"use client";

import { useState } from "react";
import type { AsnPrefix, AsnProfile } from "@/lib/asn";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Badge } from "@/components/ui/badge";
import { ShowMoreButton } from "./show-more-button";

function RpkiBadge({ prefix, t }: { prefix: AsnPrefix; t: ToolTranslation }) {
  const rpki = prefix.rpkiStatus?.toLowerCase().trim();
  if (rpki === "valid") {
    return <Badge variant="success">{t.asnRpkiValid}</Badge>;
  }
  if (rpki === "invalid") {
    return <Badge variant="destructive">{t.asnRpkiInvalid}</Badge>;
  }
  if (prefix.rpkiStatus) {
    return (
      <Badge variant="secondary">
        {formatTemplate(t.asnRpkiStatus, { status: prefix.rpkiStatus })}
      </Badge>
    );
  }
  return null;
}

function PrefixItem({ prefix, t }: { prefix: AsnPrefix; t: ToolTranslation }) {
  const details = [prefix.name, prefix.country, prefix.status, prefix.size ? `${prefix.size} ${t.asnPrefixIpCount}` : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-b py-2.5 last:border-b-0">
      <span className="min-w-0 font-mono text-sm font-semibold break-all text-foreground/95 select-all">
        {prefix.netblock}
      </span>
      <RpkiBadge prefix={prefix} t={t} />
      {details && (
        <span className="w-full text-[11px] break-words text-muted-foreground">{details}</span>
      )}
    </li>
  );
}

function PrefixColumn({
  title,
  prefixes,
  total,
  emptyText,
  locale,
  t,
}: {
  title: string;
  prefixes: AsnPrefix[];
  total: number;
  emptyText: string;
  locale: Locale;
  t: ToolTranslation;
}) {
  const [expanded, setExpanded] = useState(false);
  const limit = 6;
  const visible = expanded ? prefixes : prefixes.slice(0, limit);

  return (
    <section aria-label={title} className="flex min-w-0 flex-col">
      <p className="flex items-baseline justify-between gap-2 border-b pb-2">
        <span className="font-mono text-sm font-semibold text-foreground">{title}</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{formatNumber(total, locale)}</span>
      </p>

      {visible.length > 0 ? (
        <ul className="flex flex-col">
          {visible.map((prefix, idx) => (
            <PrefixItem key={`${prefix.netblock}-${idx}`} prefix={prefix} t={t} />
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center text-xs text-muted-foreground">{emptyText}</p>
      )}

      {prefixes.length > limit && (
        <div className="pt-2">
          <ShowMoreButton expanded={expanded} onToggle={() => setExpanded(!expanded)} count={prefixes.length} t={t} />
        </div>
      )}
    </section>
  );
}

export function PrefixSection({ result, t, locale }: { result: AsnProfile; t: ToolTranslation; locale: Locale }) {
  return (
    <section aria-label={t.asnPrefixes} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t.asnPrefixes}
        </h3>
        <p className="max-w-2xl text-xs leading-normal text-muted-foreground">{t.asnPrefixesDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-5">
        <PrefixColumn
          title={t.asnLabelIpv4}
          prefixes={result.prefixes4}
          total={result.prefixes4Total}
          emptyText={t.asnNoPrefixes}
          locale={locale}
          t={t}
        />
        <PrefixColumn
          title={t.asnLabelIpv6}
          prefixes={result.prefixes6}
          total={result.prefixes6Total}
          emptyText={t.asnNoPrefixes}
          locale={locale}
          t={t}
        />
      </div>
    </section>
  );
}
