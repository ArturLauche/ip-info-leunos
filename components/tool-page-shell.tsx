import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Globe,
  Network,
  Radar,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { getTranslation } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";

type ToolKey = "home" | "check" | "ping" | "dns" | "whois" | "cdn";

const primaryLinks: Array<{ key: ToolKey; href: string; icon: LucideIcon }> = [
  { key: "home", href: "/", icon: Globe },
  { key: "check", href: "/check", icon: Search },
];

const diagnosticLinks: Array<{ key: ToolKey; href: string; icon: LucideIcon }> = [
  { key: "ping", href: "/ping", icon: Radar },
  { key: "dns", href: "/dns", icon: Network },
  { key: "whois", href: "/whois", icon: Activity },
  { key: "cdn", href: "/cdn", icon: ShieldCheck },
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
  };

  return labels[key];
}

function NavLink({
  item,
  active,
  locale,
  compact = false,
}: {
  item: { key: ToolKey; href: string; icon: LucideIcon };
  active: ToolKey;
  locale: Locale;
  compact?: boolean;
}) {
  const ItemIcon = item.icon;
  const isActive = active === item.key;

  return (
    <Link
      href={item.href}
      className={`inline-flex items-center rounded-lg font-medium transition-colors ${
        compact ? "h-8 gap-1.5 px-2.5 text-xs" : "h-9 gap-2 px-3 text-sm"
      } ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      <ItemIcon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
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
        <nav className="flex w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/70 bg-card/75 p-2 backdrop-blur">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {primaryLinks.map((item) => (
              <NavLink key={item.key} item={item} active={active} locale={locale} />
            ))}
          </div>
          <div className="hidden h-6 w-px bg-border/80 md:block" aria-hidden />
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border/60 pt-2 md:border-l-0 md:border-t-0 md:pt-0">
            {diagnosticLinks.map((item) => (
              <NavLink key={item.key} item={item} active={active} locale={locale} compact />
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
