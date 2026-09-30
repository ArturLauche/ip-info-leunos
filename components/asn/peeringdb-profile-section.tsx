"use client";

import { useId, type ReactNode } from "react";
import type { PeeringDbProfile } from "@/lib/asn";
import { useI18n } from "@/components/i18n-provider";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/locale-config";
import type { ToolTranslation } from "@/lib/tool-i18n";
import type { UiCopy } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";
import { ExternalLink } from "./external-link";
import { displayUrl, isUrl, peeringDbUrl } from "./helpers";
import { SectionHeading } from "./section-heading";

interface ProfileField {
  label: string;
  value: ReactNode;
}

function ProfileGroup({ heading, fields }: { heading: string; fields: ProfileField[] }) {
  const visible = fields.filter((field) => field.value !== null && field.value !== undefined && field.value !== "");
  if (visible.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-col">
      <h4 className="pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {heading}
      </h4>
      <dl className="flex flex-col border-t border-border">
        {visible.map((field) => (
          <div
            key={field.label}
            className="grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] items-baseline gap-3 border-b border-border/50 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)] sm:gap-4"
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
 * PeeringDB stores policy answers as English prose ("Required", "Not required").
 * Map the two closed answers to translated wording and keep any free-text
 * suffix (e.g. "Required for transit") intact.
 */
function formatPolicyValue(
  value: string | number | null | undefined,
  copy: UiCopy,
): string | number | null | undefined {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  const normalized = trimmed.toLowerCase();
  if (normalized === "required" || normalized.startsWith("required ")) {
    const suffix = policySuffix(trimmed, "required");
    return suffix ? `${copy.asnPolicyRequired} – ${suffix}` : copy.asnPolicyRequired;
  }
  if (
    normalized === "not required" ||
    normalized === "not_required" ||
    normalized.startsWith("not required ")
  ) {
    const suffix = policySuffix(trimmed, "not required");
    return suffix ? `${copy.asnPolicyNotRequired} – ${suffix}` : copy.asnPolicyNotRequired;
  }
  return value;
}

/** Free text after the closed answer, minus the separator PeeringDB writes ("Required - EU"). */
function policySuffix(value: string, answer: string) {
  return value.slice(answer.length).replace(/^[\s\-–—:]+/, "");
}

/**
 * The PeeringDB record as a spec sheet. The overview card already carries the
 * headline policy and traffic facts, so this is the complete, grouped detail
 * behind them; groups and rows without a value are not rendered.
 */
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
  const { ui } = useI18n();
  const recordUrl = peeringDbUrl("net", profile.netId);

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
        { label: t.asnLabelPolicyGeneral, value: formatPolicyValue(profile.policyGeneral, ui) },
        { label: t.asnLabelPolicyLocations, value: formatPolicyValue(profile.policyLocations, ui) },
        { label: t.asnLabelPolicyRatio, value: formatPolicyValue(profile.policyRatio, ui) },
        { label: t.asnLabelPolicyContracts, value: formatPolicyValue(profile.policyContracts, ui) },
      ],
    },
    {
      heading: t.asnProfileInterconnectionHeading,
      fields: [
        { label: t.asnLabelTraffic, value: profile.traffic },
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
      <SectionHeading
        id={headingId}
        title={t.asnPeeringDb}
        description={t.asnPeeringDbDescription}
        hideTitle
      />

      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
        {groups.map((group) => (
          <ProfileGroup key={group.heading} heading={group.heading} fields={group.fields} />
        ))}
      </div>
    </section>
  );
}
