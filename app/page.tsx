import { IpDisplay } from "@/components/ip-display";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getTranslation, resolveLocale } from "@/lib/i18n";
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

  return (
    <ToolPageShell
      locale={locale}
      active="home"
      icon={Globe}
      title={t.homeTitle}
      subtitle={t.homeSubtitle}
    >
      <IpDisplay locale={locale} />
    </ToolPageShell>
  );
}
