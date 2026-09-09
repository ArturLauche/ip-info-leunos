import { IpLookup } from "@/components/ip-lookup";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getTranslation, resolveLocale } from "@/lib/i18n";
import { Search } from "lucide-react";
import { headers } from "next/headers";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "IP Check für öffentliche IPs und Domains",
  description: "Analysiere öffentliche IPv4-/IPv6-Adressen oder Domains mit verfügbaren Angaben zu Provider, ASN, Reverse DNS und ungefährer Geolokalisierung.",
  path: "/check",
  keywords: ['IP prüfen', 'Domain prüfen', 'IP Check'],
});

interface CheckPageProps {
  searchParams: Promise<{
    ip?: SearchParamValue;
    q?: SearchParamValue;
  }>;
}

export default async function CheckPage({ searchParams }: CheckPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getTranslation(locale);
  const params = await searchParams;
  const initialQuery = firstSearchParam(params.ip) || firstSearchParam(params.q);

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
