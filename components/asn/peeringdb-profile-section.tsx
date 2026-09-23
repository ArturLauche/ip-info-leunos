"use client";

import { ExternalLink, Globe2, Network, Radio, Route } from "lucide-react";
import type { PeeringDbProfile } from "@/lib/asn";
import { formatNumber, valueOrDash } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfileFieldValue {
  label: string;
  value: string | number | null | undefined;
  /** Renders the value as an external link when it is a safe HTTP(S) URL. */
  link?: boolean;
}

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function ProfileRow({ field, locale }: { field: ProfileFieldValue; locale: Locale }) {
  const raw = field.value;
  const empty = raw === null || raw === undefined || raw === "";
  if (empty) return null;

  const url = field.link !== false && typeof raw === "string" ? safeHttpUrl(raw) : null;

  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2 last:border-b-0">
      <dt className="shrink-0 text-xs text-muted-foreground">{field.label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium break-words text-foreground tabular-nums">
        {url ? (
          <a
            href={raw as string}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <span className="break-all">{raw.toString().replace(/^https?:\/\/(www\.)?/, "")}</span>
            <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
          </a>
        ) : typeof raw === "number" ? (
          formatNumber(raw, locale)
        ) : (
          valueOrDash(raw)
        )}
      </dd>
    </div>
  );
}

function ProfileGroup({
  heading,
  fields,
  locale,
}: {
  heading: string;
  fields: ProfileFieldValue[];
  locale: Locale;
}) {
  const visible = fields.filter(
    (field) => field.value !== null && field.value !== undefined && field.value !== "",
  );
  if (visible.length === 0) return null;

  return (
    <div className="min-w-0 border-t border-border/60 pt-3 first:border-t-0 first:pt-0">
      <h4 className="pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80 uppercase">
        {heading}
      </h4>
      <dl className="flex flex-col">
        {visible.map((field) => (
          <ProfileRow key={field.label} field={field} locale={locale} />
        ))}
      </dl>
    </div>
  );
}

function ProfileMetric({
  icon: Icon,
  label,
  value,
  locale,
}: {
  icon: typeof Network;
  label: string;
  value: string | number | null;
  locale: Locale;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 bg-card px-4 py-3.5 sm:px-5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 break-words">{label}</span>
      </div>
      <span
        title={typeof value === "string" ? value : undefined}
        className="truncate font-mono text-sm font-semibold text-foreground tabular-nums sm:text-base"
      >
        {typeof value === "number" ? formatNumber(value, locale) : value || "—"}
      </span>
    </div>
  );
}

export function PeeringDbProfileSection({
  profile,
  t,
  locale,
}: {
  profile: PeeringDbProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const profileStatus = profile.status.trim().toLowerCase();
  const profileStatusTone =
    profileStatus === "ok" ? "bg-success" : profileStatus === "error" ? "bg-destructive" : "bg-warning";

  const groups: { heading: string; fields: ProfileFieldValue[] }[] = [
    {
      heading: t.asnProfileIdentityHeading,
      fields: [
        { label: t.asnLabelName, value: profile.name },
        { label: t.asnLabelAlsoKnownAs, value: profile.aka },
        { label: t.asnLabelNetworkId, value: profile.netId },
        { label: t.asnLabelStatus, value: profile.status },
      ],
    },
    {
      heading: t.asnProfileInterconnectionHeading,
      fields: [
        { label: t.asnLabelTraffic, value: profile.traffic },
        { label: t.asnProfilePrefixes4, value: profile.infoPrefixes4 },
        { label: t.asnProfilePrefixes6, value: profile.infoPrefixes6 },
        { label: t.asnIxPresence, value: profile.ixCount },
        { label: t.asnFacilities, value: profile.facilityCount },
      ],
    },
    {
      heading: t.asnProfilePolicyHeading,
      fields: [
        { label: t.asnLabelPolicyGeneral, value: profile.policyGeneral },
        { label: t.asnLabelPolicyLocations, value: profile.policyLocations },
        { label: t.asnLabelPolicyRatio, value: profile.policyRatio },
        { label: t.asnLabelPolicyContracts, value: profile.policyContracts },
      ],
    },
    {
      heading: t.asnProfileExternalHeading,
      fields: [
        { label: t.asnLabelWebsite, value: profile.website },
        { label: t.asnLabelLookingGlass, value: profile.lookingGlass },
        { label: t.asnLabelRouteServer, value: profile.routeServer },
      ],
    },
  ];

  return (
    <section aria-label={t.asnPeeringDb} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {t.asnProfileSnapshot}
          </h3>
          {profile.status && (
            <Badge variant="outline" className="h-5 gap-1.5 px-1.5 text-[10px] text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", profileStatusTone)} aria-hidden="true" />
              {profile.status}
            </Badge>
          )}
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">{t.asnPeeringDbDescription}</p>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 sm:grid-cols-4">
        <ProfileMetric icon={Radio} label={t.asnLabelTraffic} value={profile.traffic || null} locale={locale} />
        <ProfileMetric icon={Network} label={t.asnProfilePrefixes4} value={profile.infoPrefixes4} locale={locale} />
        <ProfileMetric icon={Route} label={t.asnProfilePrefixes6} value={profile.infoPrefixes6} locale={locale} />
        <ProfileMetric icon={Globe2} label={t.asnIxPresence} value={profile.ixCount} locale={locale} />
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        {groups.map((group) => (
          <ProfileGroup key={group.heading} heading={group.heading} fields={group.fields} locale={locale} />
        ))}
      </div>
    </section>
  );
}
