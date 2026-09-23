import type { Metadata } from "next";
import { Waypoints } from "lucide-react";
import { AsnChecker } from "@/components/asn/asn-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getRequestLocale } from "@/lib/request-locale";
import { createPageMetadata } from "@/lib/seo";
import { getToolTranslation } from "@/lib/tool-i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  return createPageMetadata({
    title: t.asnTitle,
    description: t.asnSubtitle,
    path: "/asn",
    keywords: [t.asnTitle, "ASN", "BGP", "PeeringDB", "RPKI"],
    locale,
  });
}

interface AsnPageProps {
  searchParams: Promise<{
    asn?: string;
    q?: string;
  }>;
}

export default async function AsnPage({ searchParams }: AsnPageProps) {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  const params = await searchParams;
  const initialAsn = params.asn || params.q || "";

  return (
    <ToolPageShell
      locale={locale}
      active="asn"
      icon={Waypoints}
      title={t.asnTitle}
      subtitle={t.asnSubtitle}
    >
      <AsnChecker locale={locale} initialAsn={initialAsn} />
    </ToolPageShell>
  );
}
