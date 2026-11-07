import { IpDisplay } from "@/components/ip-display";
import { StructuredData } from "@/components/structured-data";
import { ToolPageShell } from "@/components/tool-page-shell";
import {
  getNavDescription,
  getNavLabel,
  navGroups,
} from "@/components/shell/nav-config";
import { getTranslation } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { getToolTranslation } from "@/lib/tool-i18n";
import { canonicalUrl, siteConfig } from "@/lib/site-config";
import {
  createPageMetadata,
  getHomeDescription,
  getHomeSeoTitle,
} from "@/lib/seo";
import { Globe } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  return createPageMetadata({
    title: getHomeSeoTitle(locale),
    description: getHomeDescription(locale),
    path: "/",
    keywords: [t.homeTitle, t.checkTitle, "IPv4", "IPv6", "ASN"],
    locale,
  });
}

export default async function Home() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const toolT = getToolTranslation(locale);
  const pageUrl = canonicalUrl("/");
  const navCopy = { core: t, tool: toolT };

  // Invisible site-structure signal: a machine-readable index of every tool,
  // using the same localized names and descriptions the navigation renders.
  const toolItems = navGroups
    .flatMap((group) => group.items)
    .filter((item) => item.key !== "home")
    .map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: getNavLabel(item.key, navCopy),
      description: getNavDescription(item.key, navCopy),
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
      <IpDisplay />
    </ToolPageShell>
  );
}
