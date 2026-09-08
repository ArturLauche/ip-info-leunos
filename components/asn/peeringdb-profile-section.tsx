"use client";

import { ExternalLink } from "lucide-react";
import type { PeeringDbProfile } from "@/lib/asn";
import { valueOrDash } from "@/lib/format";
import type { ToolTranslation } from "@/lib/tool-i18n";

function ProfileField({ label, value }: { label: string; value: string | number | null | undefined }) {
  const val = valueOrDash(value);
  const isUrl = typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"));

  return (
    <div className="flex items-baseline justify-between gap-4 border-b py-2 last:border-b-0">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium break-all text-foreground">
        {isUrl ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {value.replace(/^https?:\/\/(www\.)?/, "")}
            <ExternalLink className="size-3" aria-hidden />
          </a>
        ) : (
          val
        )}
      </dd>
    </div>
  );
}

export function PeeringDbProfileSection({ profile, t }: { profile: PeeringDbProfile; t: ToolTranslation }) {
  const groups = [
    {
      heading: t.asnProfileIdentityHeading,
      fields: [
        { label: t.asnLabelNetworkId, value: profile.netId },
        { label: t.asnLabelName, value: profile.name },
        { label: t.asnLabelAlsoKnownAs, value: profile.aka },
        { label: t.asnLabelStatus, value: profile.status },
      ],
    },
    {
      heading: t.asnProfileInterconnectionHeading,
      fields: [
        { label: t.asnLabelTraffic, value: profile.traffic },
        { label: t.asnLabelWebsite, value: profile.website },
        { label: t.asnLabelLookingGlass, value: profile.lookingGlass },
        { label: t.asnLabelRouteServer, value: profile.routeServer },
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
  ];

  return (
    <section aria-label={t.asnPeeringDb} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t.asnPeeringDb}
        </h3>
        <p className="max-w-2xl text-xs leading-normal text-muted-foreground">{t.asnPeeringDbDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5">
        {groups.map((group) => (
          <div key={group.heading} className="flex min-w-0 flex-col gap-1">
            <p className="border-b pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              {group.heading}
            </p>
            <dl className="flex flex-col">
              {group.fields.map((field) => (
                <ProfileField key={field.label} label={field.label} value={field.value} />
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
