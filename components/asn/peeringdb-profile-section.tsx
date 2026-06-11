"use client";

import { ExternalLink, Globe } from "lucide-react";
import type { PeeringDbProfile } from "@/lib/asn";
import { valueOrDash } from "@/lib/format";
import type { ToolTranslation } from "@/lib/tool-i18n";

function ProfileField({ label, value }: { label: string; value: string | number | null | undefined }) {
  const val = valueOrDash(value);
  const isUrl = typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"));

  return (
    <div className="min-w-0 border-b border-border/40 pb-3 last:border-b-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{label}</dt>
      <dd className="mt-1 break-all text-sm font-semibold text-foreground">
        {isUrl ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {value.replace(/^https?:\/\/(www\.)?/, "")}
            <ExternalLink className="h-3 w-3" />
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
    <div className="flex flex-col gap-5 rounded-2xl border border-border/80 bg-card/35 p-5 shadow-sm md:p-6">
      <div className="border-b border-border/60 pb-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Globe className="h-5 w-5 text-primary" />
          {t.asnPeeringDb}
        </h3>
        <p className="text-xs leading-normal text-muted-foreground">{t.asnPeeringDbDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {groups.map((group) => (
          <div key={group.heading} className="flex flex-col gap-4 rounded-xl border border-border/80 bg-secondary/10 p-5">
            <p className="border-b border-border/50 pb-2 text-xs font-bold uppercase tracking-wider text-primary">
              {group.heading}
            </p>
            <dl className="flex flex-col gap-3">
              {group.fields.map((field) => (
                <ProfileField key={field.label} label={field.label} value={field.value} />
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
