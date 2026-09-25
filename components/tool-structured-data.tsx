import { navGroups, type ToolKey } from "@/components/shell/nav-config";
import { StructuredData } from "@/components/structured-data";
import {
  getTranslation,
  getLocaleSchemaLanguage,
  type Locale,
} from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { getUiCopy } from "@/lib/ui-copy";
import { canonicalUrl, siteConfig } from "@/lib/seo";

interface ToolStructuredDataProps {
  tool: ToolKey;
  locale: Locale;
  name: string;
  description: string;
}

export function ToolStructuredData({
  tool,
  locale,
  name,
  description,
}: ToolStructuredDataProps) {
  const path =
    navGroups.flatMap((group) => group.items).find((item) => item.key === tool)
      ?.href ?? "/";
  const url = canonicalUrl(path);
  const t = getToolTranslation(locale);
  const baseT = getTranslation(locale);
  const ui = getUiCopy(locale);
  const featuresByTool: Record<ToolKey, string[]> = {
    home: [baseT.homeSubtitle, baseT.detectedConnectionType, baseT.reverseDns],
    check: [baseT.checkSubtitle, baseT.asNumber, baseT.reverseDns],
    asn: [t.asnSubtitle, t.asnPrefixes, t.asnRouting, t.asnPeeringDb],
    ping: [
      t.pingSubtitle,
      t.pingModeHelperTcp,
      t.pingModeHelperUdp,
      t.pingModeHelperDatabase,
    ],
    dns: [t.dnsSubtitle, t.dnsTableType, t.dnsTableValue, t.dnsNoRecords],
    whois: [
      t.whoisSubtitle,
      t.whoisRegistrar,
      t.whoisNameservers,
      t.noWhoisData,
    ],
    cdn: [
      t.cdnSubtitle,
      t.cdnMatchedSignals,
      t.cdnCnameChain,
      t.cdnInterestingHeaders,
    ],
    reputation: [
      t.reputationSubtitle,
      t.reputationSectionThreats,
      t.reputationSectionSources,
      t.reputationScoreLabel,
    ],
  };
  const features = featuresByTool[tool];
  const language = getLocaleSchemaLanguage(locale);

  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": ["WebApplication", "SoftwareApplication"],
        "@id": `${url}#web-application`,
        name,
        url,
        description,
        applicationCategory: "UtilitiesApplication",
        applicationSubCategory: ui.structuredDataCategory,
        operatingSystem: ui.structuredDataOperatingSystem,
        browserRequirements: ui.structuredDataBrowserRequirements,
        featureList: features,
        isAccessibleForFree: true,
        inLanguage: language,
        offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" },
        provider: { "@id": `${siteConfig.url}/#organization` },
        isPartOf: { "@id": `${siteConfig.url}/#website` },
      }}
    />
  );
}
