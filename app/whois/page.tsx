import { WhoisChecker } from "@/components/whois-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Search } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Whois Lookup für Domains und IPs",
  description: "Rufe Whois-Daten für Domains und IP-Adressräume ab, inklusive Registrar-, Inhaber- und Ablauf-Informationen.",
  path: "/whois",
  keywords: ['Whois Lookup', 'Domain Whois', 'IP Whois'],
});

interface WhoisPageProps {
  searchParams: Promise<{ target?: string }>;
}

export default async function WhoisPage({ searchParams }: WhoisPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getToolTranslation(locale);
  const params = await searchParams;

  return (
    <ToolPageShell
      locale={locale}
      active="whois"
      icon={Search}
      title={t.whoisTitle}
      subtitle={t.whoisSubtitle}
    >
      <WhoisChecker locale={locale} initialTarget={params.target || ""} />
    </ToolPageShell>
  );
}
