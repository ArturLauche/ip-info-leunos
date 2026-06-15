"use client";

import { Search } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";

import { CommandPalette } from "./command-palette";

interface CommandMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandMenuContext = createContext<CommandMenuContextValue | null>(null);

/** Accesses the shared command-palette open state from any nested trigger. */
export function useCommandMenu(): CommandMenuContextValue {
  const context = useContext(CommandMenuContext);
  if (!context) {
    throw new Error("useCommandMenu must be used within a CommandMenuProvider");
  }
  return context;
}

interface CommandMenuProviderProps {
  locale: Locale;
  children: ReactNode;
}

/**
 * Hosts the single command-palette instance for the app shell and wires up the
 * global ⌘K / Ctrl+K (and "/") shortcut. Triggers anywhere in the subtree open
 * it through {@link useCommandMenu}.
 */
export function CommandMenuProvider({ locale, children }: CommandMenuProviderProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((previous) => !previous);
        return;
      }
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <CommandMenuContext.Provider value={value}>
      {children}
      <CommandPalette locale={locale} open={open} onOpenChange={setOpen} />
    </CommandMenuContext.Provider>
  );
}

interface CommandTriggerProps {
  locale: Locale;
  /** "bar" renders a full search field (sidebar); "icon" a compact button. */
  variant?: "bar" | "icon";
  className?: string;
}

/** Opens the command palette. Rendered in the sidebar and the mobile top bar. */
export function CommandTrigger({
  locale,
  variant = "bar",
  className,
}: CommandTriggerProps) {
  const { setOpen } = useCommandMenu();
  const t = getToolTranslation(locale);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    const platform =
      typeof navigator !== "undefined"
        ? navigator.platform || navigator.userAgent
        : "";
    setIsMac(/mac|iphone|ipad|ipod/i.test(platform));
  }, []);

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t.commandTriggerLabel}
        onClick={() => setOpen(true)}
        className={className}
      >
        <Search className="size-5" />
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "group flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background/60 px-3 text-sm text-muted-foreground shadow-xs outline-none transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30",
        className,
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate text-left">{t.commandTriggerLabel}</span>
      <kbd className="pointer-events-none hidden items-center rounded border border-border bg-muted px-1.5 font-sans text-[0.7rem] font-medium text-muted-foreground sm:inline-flex">
        {isMac ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}
