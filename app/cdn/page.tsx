import { CdnChecker } from "@/components/cdn-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { ShieldCheck } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "CDN Check für Domains und Edge-Anbieter",
  description: "Analysiere öffentliche Domains anhand begrenzter DNS-, HTTP-Header- und Netzwerksignale auf Hinweise zu bekannten CDN- und Edge-Anbietern.",
  path: "/cdn",
  keywords: ['CDN Check', 'Cloudflare erkennen', 'Edge Netzwerk'],
});

interface CdnPageProps {
  searchParams: Promise<{ target?: string }>;
}

export default async function CdnPage({ searchParams }: CdnPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getToolTranslation(locale);
  const params = await searchParams;

  return (
    <ToolPageShell
      locale={locale}
      active="cdn"
      icon={ShieldCheck}
      title={t.cdnTitle}
      subtitle={t.cdnSubtitle}
    >
      <CdnChecker locale={locale} initialTarget={params.target || ""} />
    </ToolPageShell>
  );
}
