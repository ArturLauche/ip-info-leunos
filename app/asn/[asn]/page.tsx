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

function readAsn(value: string) {
  try {
    return normalizeAsnInput(value);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: AsnDeepLinkPageProps): Promise<Metadata> {
  const { asn } = await params;
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  const normalized = readAsn(asn);

  if (!normalized) {
    return createPageMetadata({
      title: t.asnTitle,
      description: t.asnSubtitle,
      path: "/asn",
      keywords: [t.asnTitle, "ASN", "PeeringDB", "BGP"],
      locale,
      // An unparseable ASN is a soft 404 that canonicalizes to /asn.
      index: false,
    });
  }

  return createPageMetadata({
    title: `${normalized.asn} – ${t.asnTitle}`,
    description: `${t.asnSubtitle} ${normalized.asn}`,
    path: `/asn/${normalized.asn}`,
    keywords: [normalized.asn, t.asnTitle, "ASN", "PeeringDB", "BGP"],
    locale,
  });
}

export default async function AsnDeepLinkPage({
  params,
}: AsnDeepLinkPageProps) {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  const { asn } = await params;
  const normalized = readAsn(asn);

  // The deep-linked ASN belongs in the visible H1: every /asn/[asn] page
  // shares the metadata template, so a static shell title would put thousands
  // of distinct pages behind one identical headline.
  const displayTitle = normalized
    ? `${normalized.asn} – ${t.asnTitle}`
    : t.asnTitle;

  return (
    <ToolPageShell
      locale={locale}
      active="asn"
      icon={Waypoints}
      title={displayTitle}
      subtitle={t.asnSubtitle}
      structuredPath={normalized ? `/asn/${normalized.asn}` : undefined}
      breadcrumbLabel={normalized?.asn}
      // Invalid input canonicalizes to /asn, so it must not describe itself as
      // a distinct ASN page in the structured-data graph.
      structuredData={Boolean(normalized)}
    >
      <AsnChecker initialAsn={asn} />
    </ToolPageShell>
  );
}
