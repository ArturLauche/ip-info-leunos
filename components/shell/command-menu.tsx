"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { type Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { resolveSmartTarget } from "@/lib/search-routing";
import { getNavItems, type ResolvedNavItem } from "./nav-config";

interface CommandMenuProps {
  locale: Locale;
}

type Result =
  | { type: "smart"; href: string; label: string; hint: string }
  | { type: "tool"; item: ResolvedNavItem };

/**
 * Global ⌘K command palette and search. One input routes to every tool: type a
 * target (IP, domain, ASN) to look it up, or filter and jump straight to a
 * tool. Acts as the primary navigation affordance alongside the tool rail.
 */
export function CommandMenu({ locale }: CommandMenuProps) {
  const router = useRouter();
  const toolT = getToolTranslation(locale);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => getNavItems(locale), [locale]);

  const results = useMemo<Result[]>(() => {
    const trimmed = query.trim();
    const list: Result[] = [];

    const smart = resolveSmartTarget(trimmed);
    if (smart) {
      list.push({
        type: "smart",
        href: smart.href,
        label: trimmed,
        hint: smart.kind === "asn" ? toolT.asnTabLabel : toolT.searchActionLookup,
      });
    }

    const needle = trimmed.toLowerCase();
    const matched = needle
      ? items.filter((item) =>
          `${item.label} ${item.description} ${item.key}`
            .toLowerCase()
            .includes(needle),
        )
      : items;

    for (const item of matched) list.push({ type: "tool", item });
    return list;
  }, [items, query, toolT]);

  // Keep the active row within bounds as results change.
  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(results.length - 1, 0)));
  }, [results.length]);

  // Global ⌘K / Ctrl+K shortcut.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const activate = useCallback(
    (result: Result) => {
      go(result.type === "smart" ? result.href : result.item.href);
    },
    [go],
  );

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(results.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + results.length) % Math.max(results.length, 1),
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const result = results[activeIndex];
      if (result) activate(result);
    }
  };

  // Reset state each time the palette opens.
  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setQuery("");
      setActiveIndex(0);
    }
  };

  // Scroll the active row into view as the user navigates.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(true)}
        aria-label={toolT.searchPlaceholderGlobal}
        className="h-9 gap-2 text-muted-foreground sm:w-64 sm:justify-between sm:pr-1.5 sm:pl-3"
      >
        <span className="flex items-center gap-2">
          <Search className="size-4" />
          <span className="hidden sm:inline">{toolT.searchPlaceholderGlobal}</span>
        </span>
        <kbd className="pointer-events-none hidden h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[0.65rem] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <DialogTitle className="sr-only">
            {toolT.searchPlaceholderGlobal}
          </DialogTitle>

          <div className="flex items-center gap-2.5 border-b px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder={toolT.searchPlaceholderGlobal}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div ref={listRef} className="max-h-[min(60vh,22rem)] overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {toolT.searchNoResults}
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {results.map((result, index) => {
                  const isActive = index === activeIndex;
                  const key =
                    result.type === "smart" ? "smart" : result.item.key;
                  const Icon = result.type === "smart" ? ArrowRight : result.item.icon;
                  const label =
                    result.type === "smart"
                      ? `${toolT.searchGoTo} "${result.label}"`
                      : result.item.label;
                  const description =
                    result.type === "smart" ? result.hint : result.item.description;

                  return (
                    <li key={key}>
                      <button
                        type="button"
                        data-index={index}
                        onClick={() => activate(result)}
                        onMouseMove={() => setActiveIndex(index)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors",
                          isActive ? "bg-accent" : "hover:bg-accent/60",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-md",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {label}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {description}
                          </span>
                        </span>
                        {isActive && (
                          <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
