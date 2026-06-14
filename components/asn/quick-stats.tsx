"use client";

import { Hash, Network, Route, Waypoints } from "lucide-react";
import type { AsnProfile } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { Card } from "@/components/ui/card";

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
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="group gap-0 py-0 transition-colors hover:border-primary/40"
          >
            <div className="flex flex-col gap-1 p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-foreground">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[10px] leading-normal text-muted-foreground">
                {stat.detail}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
