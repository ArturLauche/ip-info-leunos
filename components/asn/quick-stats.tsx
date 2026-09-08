"use client";

import type { AsnProfile } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";

// Four key figures as a quiet definition list inside the summary card —
// plain numeric values with muted labels, no per-stat card chrome.
export function QuickStats({ result, t, locale }: { result: AsnProfile; t: ToolTranslation; locale: Locale }) {
  const stats = [
    {
      label: t.asnMetricIpv4Addresses,
      value: result.numIps === null ? "—" : formatNumber(result.numIps, locale),
    },
    {
      label: t.asnPrefixes,
      value: formatNumber((result.prefixes4Total || 0) + (result.prefixes6Total || 0), locale),
    },
    {
      label: t.asnMetricRoutingNeighbours,
      value: formatNumber(result.peersTotal + result.upstreamsTotal + result.downstreamsTotal, locale),
    },
    {
      label: t.asnMetricIxPresence,
      value: formatNumber(result.peeringdb?.ixCount || 0, locale),
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-border/60 pt-5 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex min-w-0 flex-col gap-1">
          <dt className="order-2 text-xs leading-snug text-muted-foreground">{stat.label}</dt>
          <dd className="order-1 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
