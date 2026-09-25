import { CdnChecker } from "@/components/cdn-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getRequestLocale } from "@/lib/request-locale";
import { getToolTranslation } from "@/lib/tool-i18n";
import { ShieldCheck } from "lucide-react";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  return createPageMetadata({
    title: t.cdnTitle,
    description: t.cdnSubtitle,
    path: "/cdn",
    keywords: [t.cdnTitle, "CDN", "Cloudflare"],
    locale,
  });
}

interface CdnPageProps {
  searchParams: Promise<{ target?: SearchParamValue }>;
}

export default async function CdnPage({ searchParams }: CdnPageProps) {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  const params = await searchParams;

  return (
    <ToolPageShell
      locale={locale}
      active="cdn"
      icon={ShieldCheck}
      title={t.cdnTitle}
      subtitle={t.cdnSubtitle}
    >
      <CdnChecker
        locale={locale}
        initialTarget={firstSearchParam(params.target)}
      />
    </ToolPageShell>
  );
}
