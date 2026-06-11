"use client";

import { Hash, Network, Route, Waypoints } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";

export function QuickStats({ result, t, locale }: { result: AsnProfile; t: ToolTranslation; locale: Locale }) {
  const stats = [
    {
      label: t.asnMetricIpv4Addresses,
      value: formatNumber(result.numIps, locale),
      detail: t.asnMetricIpinfoDetail,
      icon: Hash,
    },
    {
      label: t.asnPrefixes,
      value: formatNumber((result.prefixes4Total || 0) + (result.prefixes6Total || 0), locale),
      detail: t.asnMetricAnnouncedPrefixesDetail,
      icon: Network,
    },
    {
      label: t.asnMetricRoutingNeighbours,
      value: formatNumber(result.peersTotal + result.upstreamsTotal + result.downstreamsTotal, locale),
      detail: t.asnMetricBgpRelationshipsDetail,
      icon: Route,
    },
    {
      label: t.asnMetricIxPresence,
      value: formatNumber(result.peeringdb?.ixCount || 0, locale),
      detail: t.asnMetricPeeringDbProfileDetail,
      icon: Waypoints,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/35 p-5 shadow-sm transition-all hover:scale-[1.02] hover:bg-card/50"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {stat.value}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-2 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-[10px] leading-normal text-muted-foreground">{stat.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
