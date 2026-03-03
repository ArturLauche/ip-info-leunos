import { ClientDnsScanner } from "@/components/client-dns-scanner";
import { resolveLocale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Shield } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Client DNS & Privacy Scan",
  description:
    "Analysiere aktive DNS-Resolver, identifiziere Provider und bewerte Datenschutz-Aspekte deiner DNS-Auflösung.",
  path: "/client-dns",
  keywords: ["Client DNS", "DNS Privacy", "Resolver Check"],
});

export default async function ClientDnsPage() {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getToolTranslation(locale);

  return (
    <main className="app-shell">
      <div className="app-gradient" aria-hidden />

      <div className="z-10 flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-10 md:py-16">
        <header className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{t.clientDnsTitle}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{t.clientDnsSubtitle}</p>
          </div>
        </header>

        <section className="surface-panel w-full">
          <ClientDnsScanner locale={locale} />
        </section>
      </div>
    </main>
  );
}
