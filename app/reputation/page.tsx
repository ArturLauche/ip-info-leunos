import { ReputationChecker } from "@/components/reputation-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { ShieldAlert } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "IP Reputation Check mit Blacklist-Prüfung",
  description:
    "Prüfe öffentliche IP-Adressen gegen ausgewählte DNS-Blacklists, Proxy- und Hosting-Heuristiken sowie optional verfügbare AbuseIPDB-Meldedaten.",
  path: "/reputation",
  keywords: ["IP Reputation", "Blacklist Check", "Spamhaus", "AbuseIPDB", "RBL"],
});

interface ReputationPageProps {
  searchParams: Promise<{ ip?: string }>;
}

export default async function ReputationPage({ searchParams }: ReputationPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getToolTranslation(locale);
  const params = await searchParams;

  return (
    <ToolPageShell
      locale={locale}
      active="reputation"
      icon={ShieldAlert}
      title={t.reputationTitle}
      subtitle={t.reputationSubtitle}
    >
      <ReputationChecker locale={locale} initialIp={params.ip || ""} />
    </ToolPageShell>
  );
}
