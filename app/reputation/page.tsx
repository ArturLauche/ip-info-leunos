import type { Metadata } from "next";
import { headers } from "next/headers";
import { ShieldQuestion } from "lucide-react";
import { ReputationChecker } from "@/components/reputation-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";
import { getToolTranslation } from "@/lib/tool-i18n";

export const metadata: Metadata = createPageMetadata({
  title: "IP-Reputation – öffentliche RBL & Abuse-Checks",
  description:
    "Prüfe eine öffentliche IP-Adresse oder Domain mit Spamhaus, AbuseIPDB, ip-api.com und AlienVault OTX auf Reputation und Abuse-Verdacht.",
  path: "/reputation",
  keywords: ["IP Reputation", "Spamhaus", "AbuseIPDB", "RBL", "Blacklist Check", "IP Abuse"],
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
      icon={ShieldQuestion}
      title={t.reputationTitle}
      subtitle={t.reputationSubtitle}
    >
      <ReputationChecker locale={locale} initialIp={params.ip || ""} />
    </ToolPageShell>
  );
}
