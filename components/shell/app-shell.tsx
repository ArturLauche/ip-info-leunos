"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useI18n } from "@/components/i18n-provider";
import { PageTransition } from "@/components/page-transition";
import { AppSidebar } from "./app-sidebar";
import { CommandMenuProvider } from "./command-menu";
import { MobileNav } from "./mobile-nav";
import { activeToolFromPathname } from "./nav-config";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Persistent chrome around every page. Keeping the sidebar mounted is what
 * lets the selection frame finish its slide instead of remounting mid-motion.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const active = activeToolFromPathname(pathname);
  const { tool: t } = useI18n();

  return (
    <CommandMenuProvider>
      <div className="relative flex min-h-screen w-full">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-ring/60"
        >
          {t.skipToContent}
        </a>
        <AppSidebar active={active} />
        <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-clip lg:ps-64">
          <MobileNav active={active} />
          <PageTransition className="flex flex-1 flex-col">
            {children}
          </PageTransition>
        </div>
      </div>
    </CommandMenuProvider>
  );
}
