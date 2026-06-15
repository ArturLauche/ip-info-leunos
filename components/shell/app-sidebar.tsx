import Link from "next/link";
import { getTranslation, type Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { siteConfig } from "@/lib/seo";
import { ModeToggle } from "@/components/mode-toggle";
import { BrandMark } from "./brand-mark";
import { CommandTrigger } from "./command-menu";
import { NavLinks } from "./nav-links";
import type { ToolKey } from "./nav-config";

interface AppSidebarProps {
  locale: Locale;
  active: ToolKey;
}

/** Fixed desktop sidebar: brand, grouped navigation, data source + theme. */
export function AppSidebar({ locale, active }: AppSidebarProps) {
  const t = getTranslation(locale);
  const toolT = getToolTranslation(locale);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <BrandMark />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              {siteConfig.name}
            </span>
            <span className="text-[0.7rem] text-muted-foreground">
              {toolT.brandTagline}
            </span>
          </span>
        </Link>
      </div>

      <div className="px-3 pb-1">
        <CommandTrigger locale={locale} />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks locale={locale} active={active} />
      </div>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2 px-2">
          <p className="min-w-0 truncate text-[0.7rem] text-muted-foreground">
            {t.footerDataBy}{" "}
            <a
              href="https://ip-api.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              ip-api.com
            </a>
          </p>
          <ModeToggle
            labels={{
              toggle: toolT.themeToggle,
              light: toolT.themeLight,
              dark: toolT.themeDark,
              system: toolT.themeSystem,
            }}
          />
        </div>
      </div>
    </aside>
  );
}
