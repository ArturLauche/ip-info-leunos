"use client";

import { useState } from "react";
import { CheckCircle2, CircleX, Globe2, Layers3 } from "lucide-react";
import type { AsnPrefix, AsnProfile } from "@/lib/asn";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Badge } from "@/components/ui/badge";
import { DataColumn } from "./data-column";
import { ShowMoreButton } from "./show-more-button";

const ROW_LIMIT = 8;

function RpkiBadge({ prefix, t }: { prefix: AsnPrefix; t: ToolTranslation }) {
  const rpki = prefix.rpkiStatus?.toLowerCase().trim();
  if (rpki === "valid") {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="size-3" aria-hidden="true" />
        {t.asnRpkiValid}
      </Badge>
    );
  }
  if (rpki === "invalid") {
    return (
      <Badge variant="destructive" className="gap-1">
        <CircleX className="size-3" aria-hidden="true" />
        {t.asnRpkiInvalid}
      </Badge>
    );
  }
  if (prefix.rpkiStatus) {
    return <Badge variant="secondary">{prefix.rpkiStatus}</Badge>;
  }
  return null;
}

function PrefixItem({ prefix, t }: { prefix: AsnPrefix; t: ToolTranslation }) {
  const details = [
    prefix.name,
    prefix.country ? prefix.country.toUpperCase() : "",
    prefix.status,
    prefix.size ? `${prefix.size} ${t.asnPrefixIpCount}` : "",
  ].filter(Boolean);

  return (
    <li className="border-b border-border/60 py-3 last:border-b-0">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="min-w-0 font-mono text-sm font-semibold tracking-tight break-all text-foreground/95 select-all">
          {prefix.netblock}
        </span>
        <RpkiBadge prefix={prefix} t={t} />
      </div>
      {details.length > 0 && (
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-relaxed text-muted-foreground">
          {prefix.name && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Layers3 className="size-3 shrink-0 text-muted-foreground/60" aria-hidden="true" />
              <span className="break-words">{prefix.name}</span>
            </span>
          )}
          {prefix.country && (
            <span className="inline-flex items-center gap-1 font-mono tracking-wide uppercase">
              <Globe2 className="size-3 shrink-0 text-muted-foreground/60" aria-hidden="true" />
              {prefix.country}
            </span>
          )}
          {prefix.status && <span className="break-words">{prefix.status}</span>}
          {prefix.size && <span className="font-mono tabular-nums">{prefix.size} {t.asnPrefixIpCount}</span>}
        </p>
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
  const visible = expanded ? prefixes : prefixes.slice(0, ROW_LIMIT);

  return (
    <DataColumn
      title={title}
      monoTitle
      total={total}
      loadedCount={prefixes.length}
      locale={locale}
      t={t}
      footer={
        prefixes.length > ROW_LIMIT ? (
          <div className="pt-3">
            <ShowMoreButton
              expanded={expanded}
              onToggle={() => setExpanded(!expanded)}
              count={prefixes.length}
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
          {visible.map((prefix, idx) => (
            <PrefixItem key={`${prefix.netblock}-${idx}`} prefix={prefix} t={t} />
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

export function PrefixSection({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  return (
    <section aria-label={t.asnPrefixes} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {t.asnPrefixes}
        </h3>
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
          {t.asnPrefixesDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-7 md:grid-cols-2 md:gap-x-8">
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
