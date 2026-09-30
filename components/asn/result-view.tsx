"use client";

import { useCallback, useMemo, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import type { AsnProfile } from "@/lib/asn";
import type { Locale } from "@/lib/locale-config";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { AsnDetailTabs, type DetailTab } from "./detail-tabs";
import { FacilitySection } from "./facility-section";
import { knownTotal, prefixTotal, routingTotal, TAB, type TabId } from "./helpers";
import { IxPresenceSection } from "./ix-presence-section";
import { PeeringUnavailable } from "./peering-unavailable";
import { PeeringDbProfileSection } from "./peeringdb-profile-section";
import { PrefixSection } from "./prefix-section";
import { RoutingSection } from "./routing-section";
import { SourceDiagnosticsSection } from "./source-diagnostics-section";
import { AsnSummaryCard } from "./summary-card";

/**
 * Tab set for a found ASN. PeeringDB contributes three tabs (exchanges,
 * facilities, profile) when it has a record and one explanatory "Peering" tab
 * when it does not; the sources tab only exists behind the source-info flag.
 */
export function buildDetailTabs(
  result: AsnProfile,
  t: ToolTranslation,
  showSourceInfo: boolean,
): DetailTab[] {
  const tabs: DetailTab[] = [
    { value: TAB.routing, label: t.asnTabRouting, count: knownTotal(result, routingTotal(result)) },
    { value: TAB.prefixes, label: t.asnTabPrefixes, count: knownTotal(result, prefixTotal(result)) },
  ];

  if (result.peeringdb) {
    tabs.push(
      { value: TAB.exchanges, label: t.asnLabelExchanges, count: result.peeringdb.ixCount || 0 },
      { value: TAB.facilities, label: t.asnLabelFacilities, count: result.peeringdb.facilityCount || 0 },
      { value: TAB.profile, label: t.asnPeeringDb },
    );
  } else {
    tabs.push({ value: TAB.peering, label: t.asnTabPeering });
  }

  if (showSourceInfo) {
    tabs.push({
      value: TAB.sources,
      label: t.asnTabSources,
      count: result.warnings.length > 0 ? result.warnings.length : null,
      countLabel: t.asnWarnings,
      tone: "warning",
    });
  }

  return tabs;
}

/**
 * A found ASN: the overview card followed by the tabbed detail. Owns the
 * selected tab so the overview's headline figures can jump to their section;
 * it only mounts for a result, so every new lookup starts on routing again.
 * Renders two siblings so the checker's reveal can stagger them.
 */
export function AsnResultView({
  result,
  t,
  locale,
  showSourceInfo,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
  showSourceInfo: boolean;
}) {
  const [selected, setSelected] = useState<string>(TAB.routing);
  const [focusRequest, setFocusRequest] = useState(0);
  const tabs = useMemo(() => buildDetailTabs(result, t, showSourceInfo), [result, t, showSourceInfo]);

  // The sources tab can disappear while selected (flag removed from the URL).
  const tab = tabs.some((item) => item.value === selected) ? selected : TAB.routing;

  const navigate = useCallback((next: TabId) => {
    setSelected(next);
    setFocusRequest((count) => count + 1);
  }, []);

  return (
    <>
      <section aria-label={`${result.asn} — ${t.asnTitle}`} className="flex flex-col">
        <AsnSummaryCard result={result} t={t} locale={locale} onNavigate={navigate} />
      </section>

      <AsnDetailTabs
        tabs={tabs}
        value={tab}
        onValueChange={setSelected}
        label={t.asnDetailNavLabel}
        locale={locale}
        focusRequest={focusRequest}
      >
        <TabsContent value={TAB.routing}>
          <RoutingSection result={result} t={t} locale={locale} />
        </TabsContent>

        <TabsContent value={TAB.prefixes}>
          <PrefixSection result={result} t={t} locale={locale} />
        </TabsContent>

        {result.peeringdb ? (
          <>
            <TabsContent value={TAB.exchanges}>
              <IxPresenceSection result={result} t={t} locale={locale} />
            </TabsContent>
            <TabsContent value={TAB.facilities}>
              <FacilitySection
                facilities={result.peeringdb.facilities}
                total={result.peeringdb.facilitiesTotal}
                asnNumber={result.asnNumber}
                t={t}
                locale={locale}
              />
            </TabsContent>
            <TabsContent value={TAB.profile}>
              <PeeringDbProfileSection profile={result.peeringdb} t={t} locale={locale} />
            </TabsContent>
          </>
        ) : (
          <TabsContent value={TAB.peering}>
            <PeeringUnavailable result={result} t={t} locale={locale} />
          </TabsContent>
        )}

        {showSourceInfo && (
          <TabsContent value={TAB.sources}>
            <SourceDiagnosticsSection result={result} t={t} locale={locale} />
          </TabsContent>
        )}
      </AsnDetailTabs>
    </>
  );
}
