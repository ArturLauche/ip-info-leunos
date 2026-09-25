import type { Metadata } from "next";
import { Waypoints } from "lucide-react";
import { AsnChecker } from "@/components/asn/asn-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { normalizeAsnInput } from "@/lib/asn";
import { getRequestLocale } from "@/lib/request-locale";
import { createPageMetadata } from "@/lib/seo";
import { getToolTranslation } from "@/lib/tool-i18n";

interface AsnDeepLinkPageProps {
  params: Promise<{
    asn: string;
  }>;
}

export async function generateMetadata({
  params,
}: AsnDeepLinkPageProps): Promise<Metadata> {
  const { asn } = await params;
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);

  try {
    const normalized = normalizeAsnInput(asn);
    return createPageMetadata({
      title: `${normalized.asn} – ${t.asnTitle}`,
      description: `${t.asnSubtitle} ${normalized.asn}`,
      path: `/asn/${normalized.asn}`,
      keywords: [normalized.asn, t.asnTitle, "ASN", "PeeringDB", "BGP"],
      locale,
    });
  } catch {
    return createPageMetadata({
      title: t.asnTitle,
      description: t.asnSubtitle,
      path: "/asn",
      keywords: [t.asnTitle, "ASN", "PeeringDB", "BGP"],
      locale,
    });
  }
}

export default async function AsnDeepLinkPage({
  params,
}: AsnDeepLinkPageProps) {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  const { asn } = await params;

  // The deep-linked ASN belongs in the visible H1: every /asn/[asn] page
  // shares the metadata template, so a static shell title would put thousands
  // of distinct pages behind one identical headline.
  let displayTitle = t.asnTitle;
  try {
    displayTitle = `${normalizeAsnInput(asn).asn} – ${t.asnTitle}`;
  } catch {
    // Invalid input keeps the generic title; the checker surfaces the
    // translated validation error.
  }

  return (
    <ToolPageShell
      locale={locale}
      active="asn"
      icon={Waypoints}
      title={displayTitle}
      subtitle={t.asnSubtitle}
    >
      <AsnChecker locale={locale} initialAsn={asn} />
    </ToolPageShell>
  );
}
