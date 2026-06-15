"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { type Locale } from "@/lib/i18n";
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

/** Sticky top bar with a slide-out navigation sheet for small screens. */
export function MobileNav({ locale, active }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const toolT = getToolTranslation(locale);

  const themeLabels = {
    toggle: toolT.themeToggle,
    light: toolT.themeLight,
    dark: toolT.themeDark,
    system: toolT.themeSystem,
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:hidden">
      <Link href="/" className="flex items-center gap-2.5">
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
            <Button variant="ghost" size="icon-sm" aria-label={toolT.navMenu}>
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 gap-0 p-0 ease-[var(--ease-smooth)] data-[state=closed]:duration-[260ms] data-[state=open]:duration-[340ms] motion-reduce:duration-0"
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
            </SheetHeader>
            <div className="overflow-y-auto px-3 py-5">
              <NavLinks
                key={active}
                locale={locale}
                active={active}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
