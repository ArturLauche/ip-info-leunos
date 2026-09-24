import { PingChecker } from "@/components/ping-checker";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Radar } from "lucide-react";
import { headers } from "next/headers";
import { firstSearchParam, type SearchParamValue } from "@/lib/search-params";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { defaultPingPort, type PingMode } from "@/lib/ping";

export const metadata: Metadata = createPageMetadata({
  title: "Ping- und Port-Test für öffentliche Hosts",
  description: "Prüfe öffentliche Hosts, Ports, Endpoints und ausgewählte Dienste mit begrenzten serverseitigen TCP-, UDP- und Protokolltests auf Erreichbarkeit.",
  path: "/ping",
  keywords: ['Ping Test', 'Port Check', 'Latenz'],
});

interface PingPageProps {
  searchParams: Promise<{ target?: SearchParamValue; port?: SearchParamValue; mode?: SearchParamValue }>;
}

function normalizeMode(value: string | undefined): PingMode {
  return value === "udp" || value === "eb" || value === "database" ? value : "tcp";
}

export default async function PingPage({ searchParams }: PingPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getToolTranslation(locale);
  const params = await searchParams;

  return (
    <ToolPageShell
      locale={locale}
      active="ping"
      icon={Radar}
      title={t.pingTitle}
      subtitle={t.pingSubtitle}
    >
      <PingChecker
        locale={locale}
        initialTarget={firstSearchParam(params.target)}
        initialPort={firstSearchParam(params.port) || defaultPingPort(normalizeMode(firstSearchParam(params.mode)))}
        initialMode={normalizeMode(firstSearchParam(params.mode))}
      />
    </ToolPageShell>
  );
}
