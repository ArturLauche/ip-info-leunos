import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Globe,
  Hash,
  Network,
  Radar,
  Search,
  Shield,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { getTranslation } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";

type ToolKey = "home" | "check" | "ping" | "dns" | "whois" | "cdn" | "runtime-dns" | "asn";

const primaryLinks: Array<{ key: ToolKey; href: string; icon: LucideIcon }> = [
  { key: "home", href: "/", icon: Globe },
  { key: "check", href: "/check", icon: Search },
];

const diagnosticLinks: Array<{ key: ToolKey; href: string; icon: LucideIcon }> = [
  { key: "ping", href: "/ping", icon: Radar },
  { key: "dns", href: "/dns", icon: Network },
  { key: "whois", href: "/whois", icon: Activity },
  { key: "cdn", href: "/cdn", icon: ShieldCheck },
  { key: "asn", href: "/asn", icon: Hash },
  { key: "runtime-dns", href: "/client-dns", icon: Shield },
];

function labelFor(key: ToolKey, locale: Locale) {
  const t = getTranslation(locale);
  const toolT = getToolTranslation(locale);

  const labels: Record<ToolKey, string> = {
    home: t.homeTitle,
    check: t.checkTitle,
    ping: toolT.pingTabLabel,
    dns: toolT.dnsTabLabel,
    whois: toolT.whoisTabLabel,
    cdn: toolT.cdnTabLabel,
    asn: toolT.asnTabLabel,
    "runtime-dns": toolT.runtimeDnsTabLabel,
  };

  return labels[key];
}

function PrimaryNavLink({
  item,
  active,
  locale,
}: {
  item: { key: ToolKey; href: string; icon: LucideIcon };
  active: ToolKey;
  locale: Locale;
}) {
  const ItemIcon = item.icon;
  const isActive = active === item.key;

  return (
    <Link
      href={item.href}
      className={`nav-primary-link ${isActive ? "nav-primary-active" : "nav-primary-idle"}`}
    >
      <span className="nav-primary-icon-wrap">
        <ItemIcon className="h-4 w-4" />
      </span>
      {labelFor(item.key, locale)}
    </Link>
  );
}

function DiagnosticNavLink({
  item,
  active,
  locale,
}: {
  item: { key: ToolKey; href: string; icon: LucideIcon };
  active: ToolKey;
  locale: Locale;
}) {
  const ItemIcon = item.icon;
  const isActive = active === item.key;

  return (
    <Link
      href={item.href}
      className={`nav-diag-link ${isActive ? "nav-diag-active" : "nav-diag-idle"}`}
    >
      <ItemIcon className="h-3.5 w-3.5 shrink-0" />
      {labelFor(item.key, locale)}
    </Link>
  );
}

interface ToolPageShellProps {
  locale: Locale;
  active: ToolKey;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function ToolPageShell({
  locale,
  active,
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
}: ToolPageShellProps) {
  return (
    <main className="app-shell">
      <div className="app-gradient" aria-hidden />

      <div className="z-10 flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-8 md:py-12">
        {/* ── Navigation ── */}
        <nav className="nav-bar">
          {/* Primary tools — prominent */}
          <div className="flex items-center gap-1.5">
            {primaryLinks.map((item) => (
              <PrimaryNavLink key={item.key} item={item} active={active} locale={locale} />
            ))}
          </div>

          {/* Diagnostic tools — compact pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {diagnosticLinks.map((item) => (
              <DiagnosticNavLink key={item.key} item={item} active={active} locale={locale} />
            ))}
          </div>
        </nav>

        <header className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{subtitle}</p>
          </div>
        </header>

        <section className="surface-panel w-full">{children}</section>

        {footer}
      </div>
    </main>
  );
}
