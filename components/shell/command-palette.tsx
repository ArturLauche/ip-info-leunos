"use client";

import type { LucideIcon } from "lucide-react";
import { CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildActionTargets, classifyQuery, matchesQuery } from "@/lib/command";
import type { Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";

import {
  getNavDescription,
  getNavLabel,
  navGroups,
  type ToolKey,
} from "./nav-config";

/** Static map of tool key → icon, sourced from the navigation config. */
const TOOL_ICONS = Object.fromEntries(
  navGroups.flatMap((group) => group.items).map((item) => [item.key, item.icon]),
) as Record<ToolKey, LucideIcon>;

const ALL_DESTINATIONS = navGroups.flatMap((group) => group.items);

interface ResolvedItem {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
}

interface CommandPaletteProps {
  locale: Locale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Spotlight-style command palette: a centered search surface that turns a typed
 * query into smart deep links (IP / domain / ASN) and filters the tool pages as
 * navigation destinations. Built on the shared Radix dialog primitive.
 */
export function CommandPalette({ locale, open, onOpenChange }: CommandPaletteProps) {
  const t = getToolTranslation(locale);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const classification = useMemo(() => classifyQuery(query), [query]);

  const actionItems = useMemo<ResolvedItem[]>(
    () =>
      buildActionTargets(classification).map((target) => ({
        id: `action:${target.href}`,
        icon: TOOL_ICONS[target.tool],
        title: getNavLabel(target.tool, locale),
        subtitle: classification.value,
        href: target.href,
      })),
    [classification, locale],
  );

  const pageItems = useMemo<ResolvedItem[]>(() => {
    const items = ALL_DESTINATIONS.map((item) => ({
      id: `page:${item.key}`,
      icon: item.icon,
      title: getNavLabel(item.key, locale),
      subtitle: getNavDescription(item.key, locale),
      href: item.href,
    }));
    return items.filter((item) =>
      matchesQuery(`${item.title} ${item.subtitle} ${item.href}`, query),
    );
  }, [locale, query]);

  const items = useMemo(
    () => [...actionItems, ...pageItems],
    [actionItems, pageItems],
  );

  // Reset the query and selection each time the palette opens, and focus input.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Keep the highlighted row valid as the result set changes while typing.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep the active row scrolled into view during keyboard navigation.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const select = (item: ResolvedItem) => {
    onOpenChange(false);
    router.push(item.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (items.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + items.length) % items.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) select(item);
    }
  };

  const renderItem = (item: ResolvedItem, index: number) => {
    const Icon = item.icon;
    const isActive = index === activeIndex;
    return (
      <button
        key={item.id}
        id={`command-item-${index}`}
        type="button"
        role="option"
        aria-selected={isActive}
        data-index={index}
        onClick={() => select(item)}
        onMouseMove={() => setActiveIndex(index)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-foreground hover:bg-accent/60",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md border bg-background transition-colors",
            isActive ? "border-border" : "border-border/60",
          )}
        >
          <Icon className="size-4 text-muted-foreground" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{item.title}</span>
          <span className="truncate text-xs text-muted-foreground">
            {item.subtitle}
          </span>
        </span>
        {isActive && (
          <CornerDownLeft
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
        )}
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* Plain dim scrim (no blur) so the bar's glass has the page to refract
            through, while the background itself stays un-frosted. */}
        <DialogOverlay className="bg-black/30 backdrop-blur-none" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[12vh] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] overflow-hidden sm:max-w-xl",
            "max-h-[76vh] rounded-[1.75rem] duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            // iOS-26 liquid glass surface (see .liquid-glass in globals.css).
            "liquid-glass",
          )}
        >
        <DialogTitle className="sr-only">{t.commandTriggerLabel}</DialogTitle>
        <DialogDescription className="sr-only">
          {t.commandPlaceholder}
        </DialogDescription>

        <div className="flex items-center gap-3 border-b border-border/50 px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.commandPlaceholder}
            role="combobox"
            aria-expanded
            aria-controls="command-list"
            aria-activedescendant={
              items.length > 0 ? `command-item-${activeIndex}` : undefined
            }
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div
          id="command-list"
          ref={listRef}
          role="listbox"
          className="max-h-[min(60vh,24rem)] overflow-y-auto p-2"
        >
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {t.commandEmpty}
            </p>
          ) : (
            <>
              {actionItems.length > 0 && (
                <div className="mb-1">
                  <p className="px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t.commandGroupActions}
                  </p>
                  {actionItems.map((item, index) => renderItem(item, index))}
                </div>
              )}
              {pageItems.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t.commandGroupPages}
                  </p>
                  {pageItems.map((item, index) =>
                    renderItem(item, actionItems.length + index),
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border/50 px-4 py-2.5 text-[0.7rem] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            {t.commandHintNavigate}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            {t.commandHintSelect}
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Kbd>esc</Kbd>
            {t.commandHintClose}
          </span>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-sans text-[0.7rem] text-muted-foreground">
      {children}
    </kbd>
  );
}
