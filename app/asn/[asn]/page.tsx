import { AsnLookup } from "@/components/asn-lookup";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { normalizeAsn } from "@/lib/asn/input";
import { Hash } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

interface AsnDetailPageProps {
  params: Promise<{ asn: string }>;
}

export async function generateMetadata({ params }: AsnDetailPageProps): Promise<Metadata> {
  const { asn } = await params;
  const normalized = normalizeAsn(decodeURIComponent(asn));
  const display = normalized.ok ? normalized.value.asn : asn;

  return createPageMetadata({
    title: `${display} - ASN Lookup`,
    description: `IPinfo-Routing-Daten und PeeringDB-Peering-Informationen für ${display}.`,
    path: `/asn/${encodeURIComponent(display)}`,
    keywords: [display, "ASN Lookup", "PeeringDB", "BGP Peering"],
  });
}

export default async function AsnDetailPage({ params }: AsnDetailPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getToolTranslation(locale);
  const { asn } = await params;
  const initialAsn = decodeURIComponent(asn);

  return (
    <ToolPageShell
      locale={locale}
      active="asn"
      icon={Hash}
      title={t.asnTitle}
      subtitle={t.asnSubtitle}
      footer={
        <footer className="max-w-2xl text-center text-xs text-muted-foreground">
          <p>
            {"ASN-Daten von "}
            <a
              href="https://ipinfo.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary transition-colors hover:text-primary/80"
            >
              IPinfo
            </a>
            {" und "}
            <a
              href="https://www.peeringdb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary transition-colors hover:text-primary/80"
            >
              PeeringDB
            </a>
            {"."}
          </p>
        </footer>
      }
    >
      <AsnLookup locale={locale} initialAsn={initialAsn} />
    </ToolPageShell>
  );
}
