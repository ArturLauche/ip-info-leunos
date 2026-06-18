"use client";

import { useEffect, useState, type MouseEvent } from "react";
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
  active?: ToolKey;
  onNavigate?: () => void;
}

/** The grouped navigation list shared by the desktop sidebar and mobile sheet. */
export function NavLinks({ locale, active, onNavigate }: NavLinksProps) {
  const [selected, setSelected] = useState(active);

  useEffect(() => {
    setSelected(active);
  }, [active]);

  function handleNavigate(
    event: MouseEvent<HTMLAnchorElement>,
    key: ToolKey,
  ) {
    const isPrimaryNavigation =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;

    if (!isPrimaryNavigation) return;

    setSelected(key);
    onNavigate?.();
  }

  return (
    <nav className="flex flex-col gap-6">
      {navGroups.map((group) => {
        const selectedIndex = group.items.findIndex(
          (item) => item.key === selected,
        );

        return (
          <div key={group.id} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {getGroupTitle(group.id, locale)}
            </p>
            <div className="relative flex flex-col gap-1">
              <span
                className={cn(
                  "tool-nav-highlight absolute inset-x-0 top-0 h-9 rounded-lg bg-sidebar-accent",
                  selectedIndex >= 0 ? "opacity-100" : "opacity-0",
                )}
                style={{
                  transform: `translateY(${Math.max(selectedIndex, 0) * 2.5}rem)`,
                }}
                aria-hidden
              >
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
              </span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                const isSelected = selected === item.key;

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={(event) => handleNavigate(event, item.key)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group relative z-10 flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors duration-300 ease-[var(--ease-smooth)] focus-visible:ring-2 focus-visible:ring-ring/60",
                      isSelected
                        ? "text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "tool-nav-icon flex size-4 shrink-0 items-center justify-center",
                        isSelected
                          ? "scale-105 text-primary"
                          : "text-muted-foreground/80 group-hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span
                      className={cn(
                        "tool-nav-label truncate",
                        isSelected && "translate-x-0.5",
                      )}
                    >
                      {getNavLabel(item.key, locale)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
