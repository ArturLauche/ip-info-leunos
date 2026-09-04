import { IpDisplay } from "@/components/ip-display";
import { StructuredData } from "@/components/structured-data";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getNavDescription, getNavLabel, navGroups } from "@/components/shell/nav-config";
import { getTranslation, resolveLocale } from "@/lib/i18n";
import { canonicalUrl, siteConfig } from "@/lib/seo";
import { Globe } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Meine öffentliche IP-Adresse anzeigen",
  description:
    "Zeige deine öffentliche IPv4- und IPv6-Adresse mit verfügbaren Angaben zu Provider, ASN, Reverse DNS, Verbindungstyp und ungefährem Standort.",
  path: "/",
  keywords: ["öffentliche IP", "IPv4", "IPv6", "IP Standort"],
});

export default async function Home() {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getTranslation(locale);
  const pageUrl = canonicalUrl("/");

  // Invisible site-structure signal: every tool as an ItemList entry so
  // crawlers understand the toolbox without any visible link farm or
  // filler copy. Names/descriptions follow the negotiated UI locale.
  const toolItems = navGroups
    .flatMap((group) => group.items)
    .filter((item) => item.href !== "/")
    .map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: getNavLabel(item.key, locale),
      description: getNavDescription(item.key, locale),
      url: canonicalUrl(item.href),
    }));

  return (
    <ToolPageShell
      locale={locale}
      active="home"
      icon={Globe}
      title={t.homeTitle}
      subtitle={t.homeSubtitle}
    >
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${pageUrl}#tools`,
          name: t.homeTitle,
          description: t.homeSubtitle,
          numberOfItems: toolItems.length,
          itemListElement: toolItems,
          isPartOf: { "@id": `${siteConfig.url}/#website` },
        }}
      />
      <IpDisplay locale={locale} />
    </ToolPageShell>
  );
}
