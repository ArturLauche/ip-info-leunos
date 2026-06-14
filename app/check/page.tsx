import { IpLookup } from "@/components/ip-lookup";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getTranslation, resolveLocale } from "@/lib/i18n";
import { Search } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "IP Check - IP oder Domain analysieren",
  description: "Prüfe jede öffentliche IP-Adresse oder Domain inklusive Standort, ASN, Provider, Reverse DNS und Netzwerkdaten.",
  path: "/check",
  keywords: ['IP prüfen', 'Domain prüfen', 'IP Check'],
});

interface CheckPageProps {
  searchParams: Promise<{
    ip?: string;
    q?: string;
  }>;
}

export default async function CheckPage({ searchParams }: CheckPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getTranslation(locale);
  const params = await searchParams;
  const initialQuery = params.ip || params.q || "";

  return (
    <ToolPageShell
      locale={locale}
      active="check"
      icon={Search}
      title={t.checkTitle}
      subtitle={t.checkSubtitle}
    >
      <IpLookup locale={locale} initialQuery={initialQuery} />
    </ToolPageShell>
  );
}
