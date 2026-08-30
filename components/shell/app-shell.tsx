"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import type { Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";

import { PageTransition } from "@/components/page-transition";
import { AppSidebar } from "./app-sidebar";
import { CommandMenuProvider } from "./command-menu";
import { MobileNav } from "./mobile-nav";
import { activeToolFromPathname } from "./nav-config";

interface AppShellProps {
  locale: Locale;
  children: ReactNode;
}

/**
 * Persistent chrome around every page. Keeping the sidebar mounted is what
 * lets the selection frame finish its slide instead of remounting mid-motion.
 */
export function AppShell({ locale, children }: AppShellProps) {
  const pathname = usePathname();
  const active = activeToolFromPathname(pathname);
  const t = getToolTranslation(locale);

  return (
    <CommandMenuProvider locale={locale}>
      <div className="relative flex min-h-screen w-full">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-ring/60"
        >
          {t.skipToContent}
        </a>
        <AppSidebar locale={locale} active={active} />
        <div className="flex min-h-screen w-full flex-col lg:pl-64">
          <MobileNav locale={locale} active={active} />
          {/*
           * Every route renders through this one wrapper. It has to sit here
           * rather than inside a page: the App Router keys each route segment,
           * so a page-level component is remounted on navigation and could not
           * hold the outgoing tree long enough to animate it out.
           */}
          <PageTransition className="flex flex-1 flex-col">{children}</PageTransition>
        </div>
      </div>
    </CommandMenuProvider>
  );
}
