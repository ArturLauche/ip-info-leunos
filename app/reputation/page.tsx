import { ReputationChecker } from "@/components/reputation-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getRequestLocale } from "@/lib/request-locale";
import { getToolTranslation } from "@/lib/tool-i18n";
import { ShieldAlert } from "lucide-react";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  return createPageMetadata({
    title: t.reputationTitle,
    description: t.reputationSubtitle,
    path: "/reputation",
    keywords: [t.reputationTitle, "DNSBL", "Spamhaus", "AbuseIPDB"],
    locale,
  });
}

interface ReputationPageProps {
  searchParams: Promise<{ ip?: SearchParamValue }>;
}

export default async function ReputationPage({
  searchParams,
}: ReputationPageProps) {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  const params = await searchParams;

  return (
    <ToolPageShell
      locale={locale}
      active="reputation"
      icon={ShieldAlert}
      title={t.reputationTitle}
      subtitle={t.reputationSubtitle}
    >
      <ReputationChecker
        locale={locale}
        initialIp={firstSearchParam(params.ip)}
      />
    </ToolPageShell>
  );
}
