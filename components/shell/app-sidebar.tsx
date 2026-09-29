import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { siteConfig } from "@/lib/site-config";
import { LanguageSelector } from "@/components/language-selector";
import { ModeToggle } from "@/components/mode-toggle";
import { BrandMark } from "./brand-mark";
import { CommandTrigger } from "./command-menu";
import { NavLinks } from "./nav-links";
import type { ToolKey } from "./nav-config";

interface AppSidebarProps {
  active?: ToolKey;
}

/**
 * Fixed desktop sidebar: brand, command trigger, grouped navigation, and the
 * language plus theme controls in the footer.
 */
export function AppSidebar({ active }: AppSidebarProps) {
  const { tool: toolT } = useI18n();

  return (
    <aside
      className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-sidebar-border bg-sidebar lg:flex"
      aria-label={toolT.sidebarLabel}
    >
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
        <CommandTrigger />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks active={active} />
      </div>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2 px-2">
          <LanguageSelector />
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
