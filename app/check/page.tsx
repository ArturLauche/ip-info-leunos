import { IpLookup } from "@/components/ip-lookup";
import { getTranslation, resolveLocale } from "@/lib/i18n";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
export const runtime = 'edge'

export const metadata: Metadata = createPageMetadata({
  title: "IP Check - IP oder Domain analysieren",
  description: "Prüfe jede öffentliche IP-Adresse oder Domain inklusive Standort, ASN, Provider, Reverse DNS und Netzwerkdaten.",
  path: "/check",
  keywords: ['IP prüfen', 'Domain prüfen', 'IP Check'],
});

interface CheckPageProps {
  searchParams: Promise<{
    ip?: string;
    q?: string;
  }>;
}

export default async function CheckPage({ searchParams }: CheckPageProps) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getTranslation(locale);
  const params = await searchParams;
  const initialQuery = params.ip || params.q || "";

  return (
    <main className="app-shell">
      <div className="app-gradient" aria-hidden />

      <div className="z-10 flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-10 md:py-16">
        <header className="flex w-full max-w-xl flex-col items-center gap-6">
          <nav className="inline-flex items-center rounded-full border border-border/70 bg-card/80 p-1 backdrop-blur">
            <Link
              href="/"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.homeTitle}
            </Link>
            <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
              {t.checkTitle}
            </span>
          </nav>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
            <Search className="h-7 w-7 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t.checkTitle}
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground md:text-base">{t.checkSubtitle}</p>
          </div>
        </header>

        <section className="surface-panel w-full">
          <IpLookup locale={locale} initialQuery={initialQuery} />
        </section>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/80"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToOwnIp}
        </Link>

        <footer className="text-xs text-muted-foreground">
          <p>
            {t.footerDataBy}{" "}
            <a
              href="http://ip-api.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary transition-colors hover:text-primary/80"
            >
              ip-api.com
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}