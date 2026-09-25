import { DnsChecker } from "@/components/dns-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getRequestLocale } from "@/lib/request-locale";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Network } from "lucide-react";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  return createPageMetadata({
    title: t.dnsTitle,
    description: t.dnsSubtitle,
    path: "/dns",
    keywords: [t.dnsTitle, "A", "AAAA", "MX", "TXT", "SRV", "CAA"],
    locale,
  });
}

interface DnsPageProps {
  searchParams: Promise<{ target?: SearchParamValue }>;
}

export default async function DnsPage({ searchParams }: DnsPageProps) {
  const locale = await getRequestLocale();
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
      <DnsChecker
        locale={locale}
        initialTarget={firstSearchParam(params.target)}
      />
    </ToolPageShell>
  );
}
