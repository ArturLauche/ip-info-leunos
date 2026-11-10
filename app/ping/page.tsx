import { PingChecker } from "@/components/ping-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getRequestLocale } from "@/lib/request-locale";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Radar } from "lucide-react";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { defaultPingPort, normalizeDatabaseType, type PingMode } from "@/lib/ping";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  return createPageMetadata({
    title: t.pingTitle,
    description: t.pingSubtitle,
    path: "/ping",
    keywords: [t.pingTitle, t.pingPort, t.pingLatencyLabel, "TCP", "UDP"],
    locale,
  });
}

interface PingPageProps {
  searchParams: Promise<{
    target?: SearchParamValue;
    port?: SearchParamValue;
    mode?: SearchParamValue;
    db?: SearchParamValue;
  }>;
}

function normalizeMode(value: string | undefined): PingMode {
  return value === "udp" || value === "eb" || value === "database"
    ? value
    : "tcp";
}

export default async function PingPage({ searchParams }: PingPageProps) {
  const locale = await getRequestLocale();
  const t = getToolTranslation(locale);
  const params = await searchParams;
  const mode = normalizeMode(firstSearchParam(params.mode));
  const databaseType = normalizeDatabaseType(firstSearchParam(params.db));

  return (
    <ToolPageShell
      locale={locale}
      active="ping"
      icon={Radar}
      title={t.pingTitle}
      subtitle={t.pingSubtitle}
    >
      <PingChecker
        initialTarget={firstSearchParam(params.target) || "example.com"}
        initialPort={firstSearchParam(params.port) || defaultPingPort(mode, databaseType)}
        initialMode={mode}
        initialDatabaseType={databaseType}
      />
    </ToolPageShell>
  );
}
