import { WhoisChecker } from "@/components/whois-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getRequestLocale } from "@/lib/request-locale";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Activity } from "lucide-react";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  return createPageMetadata({
    title: t.whoisTitle,
    description: t.whoisSubtitle,
    path: "/whois",
    keywords: [t.whoisTitle, "WHOIS", "RDAP", "Registrar", "Nameserver"],
    locale,
  });
}

interface WhoisPageProps {
  searchParams: Promise<{ target?: SearchParamValue }>;
}

export default async function WhoisPage({ searchParams }: WhoisPageProps) {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  const params = await searchParams;

  return (
    <ToolPageShell
      locale={locale}
      active="whois"
      icon={Activity}
      title={t.whoisTitle}
      subtitle={t.whoisSubtitle}
    >
      <WhoisChecker
        locale={locale}
        initialTarget={firstSearchParam(params.target)}
      />
    </ToolPageShell>
  );
}
