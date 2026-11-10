import { IpDisplay } from "@/components/ip-display";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getTranslation } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Globe } from "lucide-react";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { headers } from "next/headers";
import { extractVisitorIps } from "@/lib/visitor-ip";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const toolT = getToolTranslation(locale);
  return createPageMetadata({
    // The visible H1 stays the localized brand; the document title targets the
    // primary "my IP" intent while the brand remains in the suffix.
    title: toolT.navMyIp,
    description: t.homeSubtitle,
    path: "/",
    keywords: [toolT.navMyIp, t.homeTitle, t.checkTitle, "IPv4", "IPv6", "ASN"],
    locale,
  });
}

export default async function Home() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const toolT = getToolTranslation(locale);
  // Header parsing only (no upstream call): the visitor's own address is known
  // before any JavaScript runs, so it is part of the first HTML response. The
  // page is dynamic and served with private, no-store caching.
  const { ipv4, ipv6 } = extractVisitorIps(await headers());

  return (
    <ToolPageShell
      locale={locale}
      active="home"
      icon={Globe}
      title={t.homeTitle}
      subtitle={t.homeSubtitle}
      seoTitle={toolT.navMyIp}
    >
      <IpDisplay initialAddresses={{ ipv4, ipv6 }} />
    </ToolPageShell>
  );
}
