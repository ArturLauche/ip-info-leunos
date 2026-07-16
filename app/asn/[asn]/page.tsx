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
      description: `Analysiere verfügbare Daten zu ${normalized.asn}: Identität, angekündigte IP-Prefixe, RIPEstat-Routing-Beobachtungen und öffentliche PeeringDB-Profile.`,
      path: `/asn/${normalized.asn}`,
      keywords: [normalized.asn, "ASN Lookup", "PeeringDB", "BGP"],
    });
  } catch {
    return createPageMetadata({
      title: "ASN Lookup für Routing- und Peeringdaten",
      description:
        "Analysiere verfügbare ASN-Profile, angekündigte IP-Prefixe, RIPEstat-Routing-Beobachtungen und öffentliche PeeringDB-Interconnection-Daten.",
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
