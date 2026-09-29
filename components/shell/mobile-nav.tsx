"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useI18n } from "@/components/i18n-provider";
import { LanguageSelector } from "@/components/language-selector";
import { ModeToggle } from "@/components/mode-toggle";
import { getLocaleDirection } from "@/lib/locale-config";
import { siteConfig } from "@/lib/site-config";
import { BrandMark } from "./brand-mark";
import { CommandTrigger } from "./command-menu";
import { NavLinks } from "./nav-links";
import type { ToolKey } from "./nav-config";

interface MobileNavProps {
  active?: ToolKey;
}

/**
 * Sticky top bar with a slide-out navigation sheet for small screens. The
 * sheet footer carries the language control, keeping the bar to brand, search
 * and theme.
 */
export function MobileNav({ active }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { locale, tool: toolT } = useI18n();

  useEffect(() => {
    const closeOnHistoryNavigation = () => setOpen(false);
    window.addEventListener("popstate", closeOnHistoryNavigation);
    return () =>
      window.removeEventListener("popstate", closeOnHistoryNavigation);
  }, []);

  const themeLabels = {
    toggle: toolT.themeToggle,
    light: toolT.themeLight,
    dark: toolT.themeDark,
    system: toolT.themeSystem,
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background px-4 lg:hidden">
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <BrandMark className="size-8" />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          {siteConfig.name}
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <CommandTrigger variant="icon" />
        <ModeToggle labels={themeLabels} />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={toolT.navMenu}
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side={getLocaleDirection(locale) === "rtl" ? "left" : "right"}
            closeLabel={toolT.navClose}
            // Sheet and page motion share the same duration scale. The drawer
            // clears while the short route exit runs, before the incoming
            // panel reaches its motion peak.
            className="w-72 gap-0 p-0 data-[state=open]:ease-[var(--ease-fluid)] data-[state=closed]:ease-[var(--ease-smooth)] data-[state=open]:duration-[var(--motion-slow)] data-[state=closed]:duration-[var(--motion-base)] motion-reduce:duration-0"
          >
            <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-5">
              <SheetTitle className="flex items-center gap-3">
                <BrandMark />
                <span className="flex flex-col leading-tight text-start">
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    {siteConfig.name}
                  </span>
                  <span className="text-[0.7rem] font-normal text-muted-foreground">
                    {toolT.brandTagline}
                  </span>
                </span>
              </SheetTitle>
              <SheetDescription className="sr-only">
                {toolT.brandTagline}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-3 py-5">
              <NavLinks
                active={active}
                onNavigate={() => setOpen(false)}
              />
            </div>
            <div className="shrink-0 border-t border-sidebar-border px-4 py-4">
              <LanguageSelector
                onLocaleSelected={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
