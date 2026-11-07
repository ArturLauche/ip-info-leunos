import { IpLookup } from "@/components/ip-lookup";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getTranslation } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { Search } from "lucide-react";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  return createPageMetadata({
    title: t.checkTitle,
    // The empty-state copy names the fields the lookup actually returns
    // (location, network, ASN, reverse DNS), giving the snippet more context
    // than the one-line subtitle without changing the visible page.
    description: t.checkEmptyDescription,
    path: "/check",
    keywords: [t.checkTitle, t.homeTitle, "ASN", "Reverse DNS"],
    locale,
  });
}

interface CheckPageProps {
  searchParams: Promise<{
    ip?: SearchParamValue;
    q?: SearchParamValue;
  }>;
}

export default async function CheckPage({ searchParams }: CheckPageProps) {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  const params = await searchParams;
  const initialQuery =
    firstSearchParam(params.ip) || firstSearchParam(params.q);

  return (
    <ToolPageShell
      locale={locale}
      active="check"
      icon={Search}
      title={t.checkTitle}
      subtitle={t.checkSubtitle}
    >
      <IpLookup initialQuery={initialQuery} />
    </ToolPageShell>
  );
}
