import Link from "next/link";

import { type Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { siteConfig } from "@/lib/seo";
import { ModeToggle } from "@/components/mode-toggle";
import { BrandMark } from "./brand-mark";
import { CommandMenu } from "./command-menu";
import { ToolRail } from "./tool-rail";
import type { ToolKey } from "./nav-config";

interface SiteHeaderProps {
  locale: Locale;
  active: ToolKey;
}

/**
 * Sticky top chrome: brand, the global ⌘K command/search, the theme toggle, and
 * the tool rail beneath. Replaces the former fixed sidebar + mobile sheet with a
 * single full-width header that behaves identically across breakpoints.
 */
export function SiteHeader({ locale, active }: SiteHeaderProps) {
  const toolT = getToolTranslation(locale);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 border-b border-border/60 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <BrandMark />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              {siteConfig.name}
            </span>
            <span className="text-[0.7rem] text-muted-foreground">
              {toolT.brandTagline}
            </span>
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <CommandMenu locale={locale} />
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

      <ToolRail locale={locale} active={active} />
    </header>
  );
}
