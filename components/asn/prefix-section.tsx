"use client";

import { useId, useState } from "react";
import { Route, ShieldCheck, ShieldQuestion, ShieldX } from "lucide-react";
import type { AsnPrefix, AsnProfile } from "@/lib/asn";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import { DataColumn, EmptyColumn } from "./data-column";
import { ASN_ROW_LIMIT } from "./helpers";
import { SectionHeading } from "./section-heading";
import { ShowMoreButton } from "./show-more-button";

/**
 * RPKI state as icon + word + colour, never colour alone. Valid and invalid
 * use the semantic tokens; anything else (unknown, not-found) stays neutral.
 */
function RpkiStatus({ prefix, t }: { prefix: AsnPrefix; t: ToolTranslation }) {
  const raw = prefix.rpkiStatus?.trim() ?? "";
  const rpki = raw.toLowerCase();
  if (!rpki) return <span className="text-[11px] text-muted-foreground/50">—</span>;

  if (rpki === "valid" || rpki === "invalid") {
    const valid = rpki === "valid";
    const Icon = valid ? ShieldCheck : ShieldX;
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 text-[11px] font-medium",
          valid ? "text-success" : "text-destructive",
        )}
      >
        <Icon className="size-3.5" aria-hidden />
        <span aria-hidden>{valid ? t.asnRpkiValidShort : t.asnRpkiInvalidShort}</span>
        <span className="sr-only">{valid ? t.asnRpkiValid : t.asnRpkiInvalid}</span>
      </span>
    );
  }

  const label = formatTemplate(t.asnRpkiStatus, { status: raw });
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground" title={label}>
      <ShieldQuestion className="size-3.5" aria-hidden />
      <span aria-hidden>{raw}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

function Netblock({ value }: { value: string }) {
  // The prefix length is what engineers scan for; keep it in its own quieter
  // weight so /24s and /12s separate at a glance.
  const slash = value.lastIndexOf("/");
  const address = slash > 0 ? value.slice(0, slash) : value;
  const length = slash > 0 ? value.slice(slash) : "";

  return (
    <span className="min-w-0 font-mono text-[13px] break-all select-all">
      <span className="font-semibold text-foreground">{address}</span>
      {length && <span className="font-medium text-muted-foreground">{length}</span>}
    </span>
  );
}

function PrefixItem({
  prefix,
  showRpki,
  locale,
  t,
}: {
  prefix: AsnPrefix;
  showRpki: boolean;
  locale: Locale;
  t: ToolTranslation;
}) {
  const size = Number(prefix.size);
  const details = [
    prefix.name,
    prefix.country,
    prefix.size ? `${Number.isFinite(size) ? formatNumber(size, locale) : prefix.size} ${t.asnPrefixIpCount}` : "",
    // Every entry here is announced by definition; only surface other states.
    prefix.status && prefix.status.toLowerCase() !== "announced" ? prefix.status : "",
  ].filter(Boolean);

  return (
    <li className="flex min-h-9 flex-col justify-center gap-0.5 border-b border-border/50 py-1.5 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <Netblock value={prefix.netblock} />
        {showRpki && <RpkiStatus prefix={prefix} t={t} />}
      </div>
      {details.length > 0 && (
        <p className="text-[11px] leading-relaxed break-words text-muted-foreground">
          {details.join(" · ")}
        </p>
      )}
    </li>
  );
}

function PrefixColumn({
  title,
  prefixes,
  total,
  locale,
  t,
}: {
  title: string;
  prefixes: AsnPrefix[];
  total: number;
  locale: Locale;
  t: ToolTranslation;
}) {
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? prefixes : prefixes.slice(0, ASN_ROW_LIMIT);
  const showRpki = prefixes.some((prefix) => prefix.rpkiStatus?.trim());

  return (
    <DataColumn
      title={title}
      monoTitle
      total={total}
      locale={locale}
      footer={
        <ShowMoreButton
          expanded={expanded}
          onToggle={() => setExpanded((value) => !value)}
          hiddenCount={prefixes.length - ASN_ROW_LIMIT}
          listed={prefixes.length}
          total={total}
          controls={listId}
          t={t}
          locale={locale}
        />
      }
    >
      {visible.length > 0 ? (
        <>
          {showRpki && (
            <div
              aria-hidden
              className="flex justify-end pt-2.5 pb-0.5 text-[10.5px] font-medium tracking-wider text-muted-foreground/80 uppercase"
            >
              {t.asnRpkiLabel}
            </div>
          )}
          <ul id={listId} className={cn("flex flex-col", !showRpki && "pt-1")}>
            {visible.map((prefix, idx) => (
              <PrefixItem
                key={`${prefix.netblock}-${idx}`}
                prefix={prefix}
                showRpki={showRpki}
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

export function PrefixSection({ result, t, locale }: { result: AsnProfile; t: ToolTranslation; locale: Locale }) {
  const headingId = useId();
  const empty =
    result.prefixes4.length === 0 &&
    result.prefixes6.length === 0 &&
    result.prefixes4Total + result.prefixes6Total === 0;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <SectionHeading id={headingId} title={t.asnPrefixes} description={t.asnPrefixesDescription} hideTitle />

      {empty ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/80 px-6 py-10 text-center">
          <Route className="size-5 text-muted-foreground/60" aria-hidden />
          <p className="max-w-sm text-sm text-muted-foreground">{t.asnNoPrefixes}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 xl:gap-10">
          <PrefixColumn
            title={t.asnLabelIpv4}
            prefixes={result.prefixes4}
            total={result.prefixes4Total}
            locale={locale}
            t={t}
          />
          <PrefixColumn
            title={t.asnLabelIpv6}
            prefixes={result.prefixes6}
            total={result.prefixes6Total}
            locale={locale}
            t={t}
          />
        </div>
      )}
    </section>
  );
}
