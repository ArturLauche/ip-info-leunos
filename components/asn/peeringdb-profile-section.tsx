"use client";

import { ExternalLink } from "lucide-react";
import type { PeeringDbProfile } from "@/lib/asn";
import { formatNumber, valueOrDash } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";

interface ProfileFieldValue {
  label: string;
  value: string | number | null | undefined;
  /** Renders the value as an external link when it is a URL. */
  link?: boolean;
}

function ProfileRow({ field, locale }: { field: ProfileFieldValue; locale: Locale }) {
  const raw = field.value;
  const empty = raw === null || raw === undefined || raw === "";
  if (empty) return null;

  const isUrl =
    field.link !== false &&
    typeof raw === "string" &&
    (raw.startsWith("http://") || raw.startsWith("https://"));

  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2 last:border-b-0">
      <dt className="shrink-0 text-xs text-muted-foreground">{field.label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium break-all text-foreground tabular-nums">
        {isUrl ? (
          <a
            href={raw as string}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {(raw as string).replace(/^https?:\/\/(www\.)?/, "")}
            <ExternalLink className="size-3 shrink-0" aria-hidden />
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
    <div className="flex min-w-0 flex-col gap-1">
      <h4 className="border-b border-border/60 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
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

export function PeeringDbProfileSection({
  profile,
  t,
  locale,
}: {
  profile: PeeringDbProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const groups = [
    {
      heading: t.asnProfileIdentityHeading,
      fields: [
        { label: t.asnLabelName, value: profile.name },
        { label: t.asnLabelAlsoKnownAs, value: profile.aka },
        { label: t.asnLabelNetworkId, value: profile.netId },
        { label: t.asnLabelStatus, value: profile.status },
      ] as ProfileFieldValue[],
    },
    {
      heading: t.asnProfileInterconnectionHeading,
      fields: [
        { label: t.asnLabelTraffic, value: profile.traffic },
        { label: t.asnProfilePrefixes4, value: profile.infoPrefixes4 },
        { label: t.asnProfilePrefixes6, value: profile.infoPrefixes6 },
        { label: t.asnIxPresence, value: profile.ixCount },
        { label: t.asnFacilities, value: profile.facilityCount },
      ] as ProfileFieldValue[],
    },
    {
      heading: t.asnProfilePolicyHeading,
      fields: [
        { label: t.asnLabelPolicyGeneral, value: profile.policyGeneral },
        { label: t.asnLabelPolicyLocations, value: profile.policyLocations },
        { label: t.asnLabelPolicyRatio, value: profile.policyRatio },
        { label: t.asnLabelPolicyContracts, value: profile.policyContracts },
      ] as ProfileFieldValue[],
    },
    {
      heading: t.asnProfileExternalHeading,
      fields: [
        { label: t.asnLabelWebsite, value: profile.website },
        { label: t.asnLabelLookingGlass, value: profile.lookingGlass },
        { label: t.asnLabelRouteServer, value: profile.routeServer },
      ] as ProfileFieldValue[],
    },
  ];

  return (
    <section aria-label={t.asnPeeringDb} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t.asnPeeringDb}
        </h3>
        <p className="max-w-2xl text-xs leading-normal text-muted-foreground">{t.asnPeeringDbDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5">
        {groups.map((group) => (
          <ProfileGroup key={group.heading} heading={group.heading} fields={group.fields} locale={locale} />
        ))}
      </div>
    </section>
  );
}
