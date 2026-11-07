import type { ToolKey } from "@/components/shell/nav-config";
import { StructuredData } from "@/components/structured-data";
import {
  getTranslation,
  getLocaleSchemaLanguage,
  type Locale,
} from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { getUiCopy } from "@/lib/ui-copy";
import {
  canonicalUrl,
  defaultOpenGraphImage,
  siteConfig,
} from "@/lib/seo";

interface ToolStructuredDataProps {
  tool: ToolKey;
  /** Canonical path of the actual route, including deep links such as /asn/AS13335. */
  path: string;
  locale: Locale;
  name: string;
  description: string;
}

export function ToolStructuredData({
  tool,
  path,
  locale,
  name,
  description,
}: ToolStructuredDataProps) {
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
        mainEntityOfPage: { "@id": `${url}#webpage` },
        screenshot: {
          "@type": "ImageObject",
          url: canonicalUrl(defaultOpenGraphImage),
          width: 1200,
          height: 630,
          caption: `${siteConfig.name} – ${name}`,
        },
      }}
    />
  );
}
