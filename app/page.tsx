import { IpDisplay } from "@/components/ip-display";
import { ToolPageShell } from "@/components/tool-page-shell";
import { getTranslation } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { Globe } from "lucide-react";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);
  return createPageMetadata({
    title: t.homeTitle,
    description: t.homeSubtitle,
    path: "/",
    keywords: [t.homeTitle, t.checkTitle, "IPv4", "IPv6", "ASN"],
    locale,
  });
}

export default async function Home() {
  const locale = await getRequestLocale();
  const t = getTranslation(locale);

  return (
    <ToolPageShell
      locale={locale}
      active="home"
      icon={Globe}
      title={t.homeTitle}
      subtitle={t.homeSubtitle}
    >
      <IpDisplay locale={locale} />
    </ToolPageShell>
  );
}
