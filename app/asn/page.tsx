import type { Metadata } from "next";
import { headers } from "next/headers";
import { Waypoints } from "lucide-react";
import { AsnChecker } from "@/components/asn/asn-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";
import { getToolTranslation } from "@/lib/tool-i18n";

export const metadata: Metadata = createPageMetadata({
  title: "ASN Lookup für Routing- und Peeringdaten",
  description:
    "Analysiere verfügbare ASN-Profile, angekündigte IP-Prefixe, RIPEstat-Routing-Beobachtungen und öffentliche PeeringDB-Interconnection-Daten.",
  path: "/asn",
  keywords: ["ASN Lookup", "AS Nummer", "PeeringDB", "BGP"],
});

interface AsnPageProps {
  searchParams: Promise<{
    asn?: string | string[];
    q?: string | string[];
  }>;
}

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AsnPage({ searchParams }: AsnPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getToolTranslation(locale);
  const params = await searchParams;
  const initialAsn = firstSearchParam(params.asn) || firstSearchParam(params.q) || "";

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
