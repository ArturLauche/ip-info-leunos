import { ToolPageShell } from "@/components/tool-page-shell";
import { AsnChecker } from "@/components/asn-checker";
import { getToolTranslation } from "@/lib/tool-i18n";
import { resolveLocale } from "@/lib/i18n";
import { Hash } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "ASN Lookup - Autonome Systemnummer anzeigen",
  description: "Autonome Systemnummer (ASN) mit Routing-, Peering- und Internet-Exchange-Daten abfragen. RIPEstat und PeeringDB kombiniert.",
  path: "/asn",
  keywords: ["ASN", "Autonomes System", "BGP", "Peering", "RIPEstat", "PeeringDB"],
});

interface AsnPageProps {
  params: Promise<{ asn?: string[] }>;
  searchParams: Promise<{ asn?: string }>;
}

export default async function AsnPage({ params, searchParams }: AsnPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const toolT = getToolTranslation(locale);

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slugAsn = resolvedParams.asn?.join("/") || "";
  const queryAsn = resolvedSearchParams.asn || "";
  const initialAsn = slugAsn || queryAsn || "";

  return (
    <ToolPageShell
      locale={locale}
      active="asn"
      icon={Hash}
      title={toolT.asnTitle}
      subtitle={toolT.asnSubtitle}
      footer={
        <footer className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <p>
            {toolT.asnRipestatAttribution}{" "}
            <a
              href="https://stat.ripe.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary transition-colors hover:text-primary/80"
            >
              RIPEstat
            </a>
          </p>
          <p>
            {toolT.asnPeeringdbAttribution}{" "}
            <a
              href="https://www.peeringdb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary transition-colors hover:text-primary/80"
            >
              PeeringDB
            </a>
          </p>
        </footer>
      }
    >
      <AsnChecker locale={locale} initialAsn={initialAsn} />
    </ToolPageShell>
  );
}
