import { IpDisplay } from "@/components/ip-display";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getTranslation, resolveLocale } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "IP Auskunft - Meine öffentliche IP anzeigen",
  description:
    "Ermittle in Sekunden deine öffentliche IPv4/IPv6-Adresse inklusive Standort, Provider, ASN und Verbindungstyp.",
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
      footer={
        <footer className="text-xs text-muted-foreground">
          <p>
            {t.footerDataBy}{" "}
            <a
              href="http://ip-api.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary transition-colors hover:text-primary/80"
            >
              ip-api.com
            </a>
          </p>
        </footer>
      }
    >
      <div className="flex w-full flex-col items-center gap-8">
        <IpDisplay locale={locale} />
      </div>
    </ToolPageShell>
  );
}
