"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  getGroupTitle,
  getNavLabel,
  navGroups,
  type ToolKey,
} from "./nav-config";

interface NavLinksProps {
  locale: Locale;
  active: ToolKey;
  onNavigate?: () => void;
}

/** The grouped navigation list shared by the desktop sidebar and mobile sheet. */
export function NavLinks({ locale, active, onNavigate }: NavLinksProps) {
  return (
    <nav className="flex flex-col gap-6">
      {navGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {getGroupTitle(group.id, locale)}
          </p>
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground/80 group-hover:text-foreground",
                  )}
                />
                <span className="truncate">{getNavLabel(item.key, locale)}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
