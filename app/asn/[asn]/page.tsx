import type { Metadata } from "next";
import { headers } from "next/headers";
import { Waypoints } from "lucide-react";
import { AsnChecker } from "@/components/asn/asn-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { normalizeAsnInput } from "@/lib/asn";
import { resolveLocale } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";
import { getToolTranslation } from "@/lib/tool-i18n";

interface AsnDeepLinkPageProps {
  params: Promise<{
    asn: string;
  }>;
}

export async function generateMetadata({ params }: AsnDeepLinkPageProps): Promise<Metadata> {
  const { asn } = await params;

  try {
    const normalized = normalizeAsnInput(asn);
    return createPageMetadata({
      title: `${normalized.asn} - ASN-Informationen`,
      description: `ASN-Profil für ${normalized.asn} mit IPinfo-ASN-Daten, angekündigten Prefixen, Routing-Beziehungen und öffentlichen PeeringDB-Interconnection-Daten.`,
      path: `/asn/${normalized.asn}`,
      keywords: [normalized.asn, "ASN Lookup", "PeeringDB", "BGP"],
    });
  } catch {
    return createPageMetadata({
      title: "ASN Lookup - Autonomes System analysieren",
      description:
        "ASN-Profile mit IPinfo-ASN-Daten, Prefixen, Routing-Beziehungen und öffentlichen PeeringDB-Interconnection-Daten nachschlagen.",
      path: "/asn",
      keywords: ["ASN Lookup", "AS Nummer", "PeeringDB", "BGP"],
    });
  }
}

export default async function AsnDeepLinkPage({ params }: AsnDeepLinkPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getToolTranslation(locale);
  const { asn } = await params;

  return (
    <ToolPageShell
      locale={locale}
      active="asn"
      icon={Waypoints}
      title={t.asnTitle}
      subtitle={t.asnSubtitle}
    >
      <AsnChecker locale={locale} initialAsn={asn} />
    </ToolPageShell>
  );
}
