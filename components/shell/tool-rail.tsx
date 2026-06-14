"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Fragment } from "react";

import { cn } from "@/lib/utils";
import { type Locale } from "@/lib/i18n";
import { getNavLabel, navGroups, type ToolKey } from "./nav-config";

interface ToolRailProps {
  locale: Locale;
  active: ToolKey;
}

/**
 * Horizontal, scroll-aware tool navigation shared by every breakpoint. Replaces
 * the desktop sidebar and the mobile sheet with one consistent rail: the active
 * tool is always visible, off-screen tools are hinted with edge fades, and the
 * current item auto-centres on load.
 */
export function ToolRail({ locale, active }: ToolRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const updateEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setEdges({
      left: scrollLeft > 1,
      right: scrollLeft + clientWidth < scrollWidth - 1,
    });
  };

  useEffect(() => {
    updateEdges();
    // Centre the active tool within the rail on load.
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest" });

    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateEdges);
    };
  }, []);

  return (
    <div className="relative border-b border-border/70">
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent transition-opacity",
          edges.left ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent transition-opacity",
          edges.right ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />

      <nav
        ref={scrollRef}
        aria-label={getNavLabel(active, locale)}
        className="no-scrollbar mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto scroll-px-6 px-4 py-2 sm:px-6 lg:px-8"
      >
        {navGroups.map((group, groupIndex) => (
          <Fragment key={group.id}>
            {groupIndex > 0 && (
              <span
                className="mx-1.5 h-5 w-px shrink-0 bg-border"
                aria-hidden
              />
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <Link
                  key={item.key}
                  ref={isActive ? activeRef : undefined}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="whitespace-nowrap">
                    {getNavLabel(item.key, locale)}
                  </span>
                </Link>
              );
            })}
          </Fragment>
        ))}
      </nav>
    </div>
  );
}
