"use client";

import { ArrowUpRight, Building2 } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { FacilitySection } from "./facility-section";
import { IxPresenceSection } from "./ix-presence-section";
import { PeeringDbProfileSection } from "./peeringdb-profile-section";

/**
 * The PeeringDB tab is an interconnection workspace rather than a single
 * profile card. A small local index keeps the three related data sets
 * discoverable without hiding the tables behind another layer of tabs.
 */
export function AsnInterconnectionWorkspace({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const profile = result.peeringdb;

  if (!profile) {
    return (
      <section
        aria-label={t.asnInterconnectionOverview}
        className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/70 bg-muted/10 px-6 py-12 text-center"
      >
        <span className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground shadow-xs">
          <Building2 className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">{t.asnPeeringDb}</h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t.asnWarningNoPeeringDbProfile}
          </p>
        </div>
      </section>
    );
  }

  const profileName = profile.name || result.name || t.asnPeeringDb;
  const peeringDbHref = profile.netId === null ? null : `https://www.peeringdb.com/net/${profile.netId}`;

  return (
    <section aria-label={t.asnInterconnectionOverview} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {t.asnInterconnectionOverview}
          </p>
          <h3 className="mt-1.5 break-words text-lg font-semibold tracking-tight text-foreground">
            {profileName}
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {t.asnPeeringDbDescription}
          </p>
        </div>
        {peeringDbHref && (
          <a
            href={peeringDbHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-md px-2 text-xs font-medium text-primary outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring/60 sm:self-auto"
          >
            {t.asnPeeringDb}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        )}
      </div>

      <nav
        aria-label={t.asnInterconnectionOverview}
        className="sticky top-14 z-10 -mx-1 grid grid-cols-3 gap-1 rounded-md border-y border-border/60 bg-card px-1 py-1.5 sm:flex sm:gap-1 lg:top-0"
      >
        {[
          ["asn-interconnection-profile", t.asnProfileSnapshot],
          ["asn-interconnection-ix", t.asnIxPresence],
          ["asn-interconnection-facilities", t.asnFacilities],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            title={label}
            className="inline-flex min-h-10 min-w-0 items-center justify-center truncate rounded-md px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 sm:shrink-0 sm:px-3"
          >
            {label}
          </a>
        ))}
      </nav>

      <div id="asn-interconnection-profile" className="scroll-mt-24">
        <PeeringDbProfileSection profile={profile} t={t} locale={locale} />
      </div>
      <div id="asn-interconnection-ix" className="scroll-mt-24 border-t border-border/60 pt-6">
        <IxPresenceSection result={result} t={t} locale={locale} />
      </div>
      <div id="asn-interconnection-facilities" className="scroll-mt-24 border-t border-border/60 pt-6">
        <FacilitySection
          facilities={profile.facilities}
          total={profile.facilitiesTotal}
          t={t}
          locale={locale}
        />
      </div>
    </section>
  );
}
