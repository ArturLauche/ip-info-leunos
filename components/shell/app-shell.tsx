"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import type { Locale } from "@/lib/i18n";

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

  return (
    <CommandMenuProvider locale={locale}>
      <div className="relative flex min-h-screen w-full">
        <AppSidebar locale={locale} active={active} />
        <div className="flex min-h-screen w-full flex-col lg:pl-64">
          <MobileNav locale={locale} active={active} />
          {children}
        </div>
      </div>
    </CommandMenuProvider>
  );
}
