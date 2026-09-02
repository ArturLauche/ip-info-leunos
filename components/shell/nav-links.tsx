"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  getGroupTitle,
  getNavLabel,
  navGroups,
  type NavItem,
  type ToolKey,
} from "./nav-config";
import { getToolTranslation } from "@/lib/tool-i18n";
import { useNavHighlight } from "./use-nav-highlight";

interface NavLinksProps {
  locale: Locale;
  active?: ToolKey;
  onNavigate?: () => void;
}

/** The grouped navigation list shared by the desktop sidebar and mobile sheet. */
export function NavLinks({ locale, active, onNavigate }: NavLinksProps) {
  const [selected, setSelected] = useState(active);
  const toolsLabel = getToolTranslation(locale).navToolsLabel;

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
    <nav className="flex flex-col gap-6" aria-label={toolsLabel}>
      {navGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          <p className="px-3 pb-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {getGroupTitle(group.id, locale)}
          </p>
          <NavGroupList
            items={group.items}
            locale={locale}
            active={active}
            selected={selected}
            onNavigate={handleNavigate}
          />
        </div>
      ))}
    </nav>
  );
}

interface NavGroupListProps {
  items: NavItem[];
  locale: Locale;
  active?: ToolKey;
  selected?: ToolKey;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, key: ToolKey) => void;
}

function NavGroupList({
  items,
  locale,
  active,
  selected,
  onNavigate,
}: NavGroupListProps) {
  const { listRef, setItemRef, view, canAnimate } = useNavHighlight(selected);

  return (
    <div ref={listRef} className="relative isolate flex flex-col gap-1">
      <span
        className="tool-nav-highlight absolute inset-x-0 top-0 z-0"
        style={{
          transform: `translate3d(0, ${view.box.y}px, 0)`,
          height: view.box.height,
          opacity: view.visible ? 1 : 0,
        }}
        data-animate={canAnimate ? "true" : undefined}
        data-slide={view.slide ? "true" : undefined}
        aria-hidden
      />
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        const isSelected = selected === item.key;

        return (
          <Link
            key={item.key}
            href={item.href}
            ref={(node) => setItemRef(item.key, node)}
            onClick={(event) => onNavigate(event, item.key)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative z-10 flex min-h-11 items-center gap-2.5 rounded-lg py-1 pr-3 pl-3.5 text-sm font-medium outline-none transition-colors duration-200 ease-[var(--ease-smooth)] focus-visible:ring-2 focus-visible:ring-ring/60",
              isSelected
                ? "text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/45 hover:text-foreground",
              isSelected && !view.visible && "tool-nav-item-fallback",
            )}
          >
            <span
              className={cn(
                "tool-nav-icon flex size-6 shrink-0 items-center justify-center rounded-md",
                isSelected
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground/80 group-hover:bg-foreground/5 group-hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </span>
            <span className="min-w-0 truncate">{getNavLabel(item.key, locale)}</span>
          </Link>
        );
      })}
    </div>
  );
}
