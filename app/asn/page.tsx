import { AsnLookup } from "@/components/asn-lookup";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Hash } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "ASN Lookup - Autonomes System abfragen",
  description:
    "Frage eine Autonomous-System-Nummer (ASN) ab und kombiniere IPinfo-Routing-Daten mit PeeringDB-Peering-Informationen.",
  path: "/asn",
  keywords: ["ASN Lookup", "Autonomes System", "PeeringDB", "BGP Peering"],
});

interface AsnPageProps {
  searchParams: Promise<{ asn?: string; q?: string }>;
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
