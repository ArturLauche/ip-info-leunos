import type { Metadata } from "next";
import { headers } from "next/headers";
import { Waypoints } from "lucide-react";
import { AsnChecker } from "@/components/asn-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";
import { getToolTranslation } from "@/lib/tool-i18n";

export const metadata: Metadata = createPageMetadata({
  title: "ASN Lookup - Autonomes System analysieren",
  description:
    "ASN-Profile mit IPinfo-ASN-Daten, Prefixen, Routing-Beziehungen und oeffentlichen PeeringDB-Interconnection-Daten nachschlagen.",
  path: "/asn",
  keywords: ["ASN Lookup", "AS Nummer", "PeeringDB", "BGP"],
});

interface AsnPageProps {
  searchParams: Promise<{
    asn?: string;
    q?: string;
  }>;
}

export default async function AsnPage({ searchParams }: AsnPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
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
