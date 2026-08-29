"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { ModeToggle } from "@/components/mode-toggle";
import { type Locale } from "@/lib/i18n";
import {
  SHEET_CLOSE_MS,
  SHEET_NAV_CLOSE_DELAY_MS,
  clearPageReveal,
  hasSheetPageReveal,
  markSheetPageReveal,
} from "@/lib/page-transition";
import { getToolTranslation } from "@/lib/tool-i18n";
import { siteConfig } from "@/lib/seo";
import { BrandMark } from "./brand-mark";
import { CommandTrigger } from "./command-menu";
import { NavLinks } from "./nav-links";
import type { ToolKey } from "./nav-config";

interface MobileNavProps {
  locale: Locale;
  active?: ToolKey;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Sticky top bar with a slide-out navigation sheet for small screens. */
export function MobileNav({ locale, active }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const previousPathnameRef = useRef(pathname);
  const toolT = getToolTranslation(locale);

  const closeSheetForRouteChange = useCallback((fromNavLinks: boolean) => {
    if (prefersReducedMotion()) {
      setOpen(false);
      return;
    }

    markSheetPageReveal();
    clearTimeout(closeTimerRef.current);
    clearTimeout(revealTimerRef.current);
    const delay = fromNavLinks ? SHEET_NAV_CLOSE_DELAY_MS : 0;
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, delay);
    revealTimerRef.current = setTimeout(() => {
      clearPageReveal();
    }, delay + SHEET_CLOSE_MS + 20);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(closeTimerRef.current);
      clearTimeout(revealTimerRef.current);
      // The reveal flag lives on <html>, so cancelling the timer alone would
      // leave view transitions permanently suppressed after an unmount.
      clearPageReveal();
    };
  }, []);

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;
    if (previousPathname === pathname) return;
    if (!open) return;
    if (hasSheetPageReveal()) return;
    closeSheetForRouteChange(false);
  }, [pathname, open, closeSheetForRouteChange]);

  const themeLabels = {
    toggle: toolT.themeToggle,
    light: toolT.themeLight,
    dark: toolT.themeDark,
    system: toolT.themeSystem,
  };

  return (
    <header className="tool-mobile-chrome sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:hidden">
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
        <CommandTrigger locale={locale} variant="icon" />
        <ModeToggle labels={themeLabels} />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={toolT.navMenu}>
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            closeLabel={toolT.navClose}
            // Close faster than the page enter so the drawer clears as the
            // destination's lift peaks. Open stays slow and fluid.
            overlayClassName="duration-[220ms] ease-[var(--ease-smooth)] data-[state=open]:duration-[420ms] data-[state=open]:ease-[var(--ease-fluid)] motion-reduce:duration-0"
            className="w-72 gap-0 p-0 data-[state=open]:ease-[var(--ease-fluid)] data-[state=closed]:ease-[var(--ease-smooth)] data-[state=open]:duration-[420ms] data-[state=closed]:duration-[220ms] motion-reduce:duration-0"
          >
            <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-5">
              <SheetTitle className="flex items-center gap-3">
                <BrandMark />
                <span className="flex flex-col leading-tight text-left">
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    {siteConfig.name}
                  </span>
                  <span className="text-[0.7rem] font-normal text-muted-foreground">
                    {toolT.brandTagline}
                  </span>
                </span>
              </SheetTitle>
              <SheetDescription className="sr-only">{toolT.brandTagline}</SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto px-3 py-5">
              <NavLinks
                locale={locale}
                active={active}
                onNavigate={() => closeSheetForRouteChange(true)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
