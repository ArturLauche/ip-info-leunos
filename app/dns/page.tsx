import { DnsChecker } from "@/components/dns-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Network } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "DNS Lookup für A, AAAA, MX, TXT und mehr",
  description: "Prüfe öffentliche DNS-Daten für A, AAAA, CNAME, MX, NS, TXT, SOA, SRV und CAA sowie PTR-Reverse-DNS für IP-Adressen.",
  path: "/dns",
  keywords: ['DNS Lookup', 'DNS Records', 'MX Check'],
});

interface DnsPageProps {
  searchParams: Promise<{ target?: string }>;
}

export default async function DnsPage({ searchParams }: DnsPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getToolTranslation(locale);
  const params = await searchParams;

  return (
    <ToolPageShell
      locale={locale}
      active="dns"
      icon={Network}
      title={t.dnsTitle}
      subtitle={t.dnsSubtitle}
    >
      <DnsChecker locale={locale} initialTarget={params.target || ""} />
    </ToolPageShell>
  );
}
