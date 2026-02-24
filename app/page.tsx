import { IpDisplay } from "@/components/ip-display";
import { getTranslation, resolveLocale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Globe, Network, Radar, Search, Shield } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";

export default async function Home() {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getTranslation(locale);
  const toolT = getToolTranslation(locale);

  return (
    <main className="app-shell">
      <div className="app-gradient" aria-hidden />

      <div className="z-10 flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-10 md:py-16">
        <header className="flex w-full max-w-xl flex-col items-center gap-6">
          <nav className="inline-flex items-center rounded-full border border-border/70 bg-card/80 p-1 backdrop-blur">
            <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
              {t.homeTitle}
            </span>
            <Link
              href="/check"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.checkTitle}
            </Link>
          </nav>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
            <Globe className="h-7 w-7 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t.homeTitle}
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground md:text-base">{t.homeSubtitle}</p>
          </div>
        </header>

        <section className="surface-panel w-full">
          <IpDisplay locale={locale} />
        </section>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/check"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/80"
          >
            <Search className="h-4 w-4" />
            {t.queryOtherIp}
          </Link>
          <Link
            href="/ping"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/80"
          >
            <Radar className="h-4 w-4" />
            {toolT.pingTabLabel}
          </Link>
          <Link
            href="/dns"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/80"
          >
            <Network className="h-4 w-4" />
            {toolT.dnsTabLabel}
          </Link>
          <Link
            href="/whois"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/80"
          >
            <Search className="h-4 w-4" />
            {toolT.whoisTabLabel}
          </Link>
          <Link
            href="/client-dns"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/80"
          >
            <Shield className="h-4 w-4" />
            Client DNS
          </Link>
        </div>

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
