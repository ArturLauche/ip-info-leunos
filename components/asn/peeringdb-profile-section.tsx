"use client";

import { useId, type ReactNode } from "react";
import type { PeeringDbProfile } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import { ExternalLink } from "./external-link";
import { formatCount, peeringDbUrl } from "./helpers";
import { SectionHeading } from "./section-heading";

function displayUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function isUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

interface ProfileField {
  label: string;
  value: ReactNode;
}

function ProfileGroup({ heading, fields }: { heading: string; fields: ProfileField[] }) {
  const visible = fields.filter((field) => field.value !== null && field.value !== undefined && field.value !== "");
  if (visible.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-col">
      <h4 className="pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {heading}
      </h4>
      <dl className="flex flex-col border-t border-border/70">
        {visible.map((field) => (
          <div
            key={field.label}
            className="grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] items-baseline gap-3 border-b border-border/50 py-2 last:border-b-0 sm:grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="text-xs text-muted-foreground">{field.label}</dt>
            <dd className="min-w-0 text-sm font-medium break-words text-foreground tabular-nums">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function linkField(value: string): ReactNode {
  if (!value) return null;
  return isUrl(value) ? <ExternalLink href={value} text={displayUrl(value)} /> : value;
}

function numberField(value: number | null, locale: Locale): ReactNode {
  return value === null || value === undefined ? null : formatNumber(value, locale);
}

/**
 * At-a-glance interconnection footprint: how many exchanges and facilities,
 * how open the network is to peering, and how much traffic it declares.
 */
function InterconnectionOverview({
  profile,
  t,
  locale,
}: {
  profile: PeeringDbProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  // Country spread is only honest when the facility list is complete.
  const facilityCountries =
    profile.facilities.length > 0 && profile.facilities.length >= profile.facilitiesTotal
      ? new Set(profile.facilities.map((facility) => facility.country).filter(Boolean)).size
      : 0;

  const stats: { key: string; label: string; value: ReactNode; detail?: string; numeric?: boolean }[] = [
    {
      key: "exchanges",
      label: t.asnLabelExchanges,
      value: formatNumber(profile.ixCount || 0, locale),
      detail: profile.ixlanTotal > 0 ? formatCount(t.asnConnectionCount, profile.ixlanTotal, locale) : undefined,
      numeric: true,
    },
    {
      key: "facilities",
      label: t.asnLabelFacilities,
      value: formatNumber(profile.facilityCount || 0, locale),
      detail: facilityCountries > 0 ? formatCount(t.asnCountryCount, facilityCountries, locale) : undefined,
      numeric: true,
    },
    { key: "policy", label: t.asnLabelPolicy, value: profile.policyGeneral || null },
    { key: "traffic", label: t.asnLabelTraffic, value: profile.traffic || null },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.key} className="flex min-w-0 flex-col gap-1 border-l-2 border-border pl-3">
          <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{stat.label}</dt>
          <dd
            className={cn(
              "text-lg leading-tight font-semibold tracking-tight break-words",
              stat.numeric && "tabular-nums",
              stat.value === null ? "font-normal text-muted-foreground/60" : "text-foreground",
            )}
          >
            {stat.value ?? "—"}
          </dd>
          {stat.detail && <dd className="text-[11px] text-muted-foreground tabular-nums">{stat.detail}</dd>}
        </div>
      ))}
    </dl>
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
  const headingId = useId();
  const recordUrl = peeringDbUrl("net", profile.netId);

  // Headline facts (policy, traffic, counts) live in the overview above, so
  // the groups only carry the supporting detail.
  const groups: { heading: string; fields: ProfileField[] }[] = [
    {
      heading: t.asnProfileIdentityHeading,
      fields: [
        { label: t.asnLabelName, value: profile.name },
        { label: t.asnLabelAlsoKnownAs, value: profile.aka },
        {
          label: t.asnLabelNetworkId,
          value:
            profile.netId === null ? null : recordUrl ? (
              <ExternalLink
                href={recordUrl}
                text={String(profile.netId)}
                label={`${t.asnLabelPeeringDbRecord} ${profile.netId}`}
                className="font-mono text-[13px]"
              />
            ) : (
              <span className="font-mono text-[13px]">{profile.netId}</span>
            ),
        },
        {
          label: t.asnLabelStatus,
          value: profile.status ? (
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className={cn(
                  "size-1.5 rounded-full",
                  profile.status.toLowerCase() === "ok" ? "bg-success" : "bg-warning",
                )}
              />
              {profile.status}
            </span>
          ) : null,
        },
      ],
    },
    {
      heading: t.asnProfilePolicyHeading,
      fields: [
        { label: t.asnLabelPolicyLocations, value: profile.policyLocations },
        { label: t.asnLabelPolicyRatio, value: profile.policyRatio },
        { label: t.asnLabelPolicyContracts, value: profile.policyContracts },
      ],
    },
    {
      heading: t.asnProfileInterconnectionHeading,
      fields: [
        { label: t.asnProfilePrefixes4, value: numberField(profile.infoPrefixes4, locale) },
        { label: t.asnProfilePrefixes6, value: numberField(profile.infoPrefixes6, locale) },
      ],
    },
    {
      heading: t.asnProfileExternalHeading,
      fields: [
        { label: t.asnLabelWebsite, value: linkField(profile.website) },
        { label: t.asnLabelLookingGlass, value: linkField(profile.lookingGlass) },
        { label: t.asnLabelRouteServer, value: linkField(profile.routeServer) },
      ],
    },
  ];

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-6">
      <SectionHeading id={headingId} title={t.asnPeeringDb} description={t.asnPeeringDbDescription} />

      <InterconnectionOverview profile={profile} t={t} locale={locale} />

      <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
        {groups.map((group) => (
          <ProfileGroup key={group.heading} heading={group.heading} fields={group.fields} />
        ))}
      </div>
    </section>
  );
}
