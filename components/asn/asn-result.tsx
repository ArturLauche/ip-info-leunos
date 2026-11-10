"use client";

import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import type { AsnProfile } from "@/lib/asn";
import type { Locale } from "@/lib/locale-config";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { AsnDetailTabs, type DetailTab } from "./detail-tabs";
import { FacilitySection } from "./facility-section";
import { knownTotal, prefixTotal, routingTotal } from "./helpers";
import { IxPresenceSection } from "./ix-presence-section";
import { PeeringDbProfileSection } from "./peeringdb-profile-section";
import { PrefixSection } from "./prefix-section";
import { RoutingSection } from "./routing-section";
import { SourceDiagnosticsSection } from "./source-diagnostics-section";
import { AsnSummaryCard } from "./summary-card";

/**
 * The complete profile view for a found ASN. Split from the checker so the
 * sections (tables, sorting, PeeringDB/IX/facility rendering) are not part of
 * the code /asn must download and run before it becomes interactive; the
 * checker preloads this module right after mount.
 */
export function AsnResultView({
  result,
  showSourceInfo,
  t,
  locale,
}: {
  result: AsnProfile;
  showSourceInfo: boolean;
  t: ToolTranslation;
  locale: Locale;
}) {
  const tabs: DetailTab[] = [
    { value: "routing", label: t.asnTabRouting, count: knownTotal(result, routingTotal(result)) },
    { value: "prefixes", label: t.asnTabPrefixes, count: knownTotal(result, prefixTotal(result)) },
    { value: "peering", label: t.asnTabPeering },
  ];
  if (showSourceInfo) {
    tabs.push({
      value: "sources",
      label: t.asnTabSources,
      count: result.warnings.length > 0 ? result.warnings.length : null,
      countLabel: t.asnWarnings,
      tone: "warning",
    });
  }

  return (
    <div className="tool-reveal flex flex-col gap-4">
      <section aria-label={`${result.asn} — ${t.asnTitle}`} className="flex flex-col">
        <AsnSummaryCard result={result} t={t} locale={locale} />
      </section>

      <Card className="gap-0 p-0">
        <AsnDetailTabs tabs={tabs} label={t.asnDetailNavLabel} locale={locale}>
          <TabsContent value="routing">
            <RoutingSection result={result} t={t} locale={locale} />
          </TabsContent>

          <TabsContent value="prefixes">
            <PrefixSection result={result} t={t} locale={locale} />
          </TabsContent>

          <TabsContent value="peering">
            {result.peeringdb ? (
              <div className="flex flex-col gap-8">
                <PeeringDbProfileSection profile={result.peeringdb} t={t} locale={locale} />
                <div className="border-t border-border/60 pt-8">
                  <IxPresenceSection result={result} t={t} locale={locale} />
                </div>
                <div className="border-t border-border/60 pt-8">
                  <FacilitySection
                    facilities={result.peeringdb.facilities}
                    total={result.peeringdb.facilitiesTotal}
                    asnNumber={result.asnNumber}
                    t={t}
                    locale={locale}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/80 px-6 py-10 text-center">
                <Building2 className="size-5 text-muted-foreground/60" aria-hidden />
                <p className="max-w-sm text-sm text-muted-foreground">{t.asnWarningNoPeeringDbProfile}</p>
              </div>
            )}
          </TabsContent>

          {showSourceInfo && (
            <TabsContent value="sources">
              <SourceDiagnosticsSection result={result} t={t} locale={locale} />
            </TabsContent>
          )}
        </AsnDetailTabs>
      </Card>
    </div>
  );
}
