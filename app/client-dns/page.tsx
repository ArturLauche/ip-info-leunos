import { ClientDnsScanner } from "@/components/client-dns-scanner";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Shield } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Runtime DNS Resolver Scan",
  description:
    "Analysiere DNS-Resolver, die fuer diese App-Laufzeit sichtbar sind, und bewerte Datenschutz-Aspekte der Runtime-DNS-Aufloesung.",
  path: "/client-dns",
  keywords: ["Runtime DNS", "DNS Privacy", "Resolver Check"],
});

export default async function ClientDnsPage() {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getToolTranslation(locale);

  return (
    <ToolPageShell
      locale={locale}
      active="runtime-dns"
      icon={Shield}
      title={t.runtimeDnsTitle}
      subtitle={t.runtimeDnsSubtitle}
    >
      <ClientDnsScanner locale={locale} />
    </ToolPageShell>
  );
}
