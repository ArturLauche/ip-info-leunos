"use client";

import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const loadCommandPalette = () =>
  import("./command-palette").then((module) => module.CommandPalette);

const CommandPalette = dynamic(loadCommandPalette, { ssr: false });

/**
 * Warms the palette chunk when a trigger is approached, so the dialog opens
 * without a network round trip and the first keystrokes are not lost. The
 * chunk is still never requested by visitors who do not reach for it.
 */
function prefetchCommandPalette() {
  void loadCommandPalette();
}

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
  children: ReactNode;
}

/**
 * Hosts the single command-palette instance for the app shell and wires up the
 * global ⌘K / Ctrl+K (and "/") shortcut. Triggers anywhere in the subtree open
 * it through {@link useCommandMenu}.
 */
export function CommandMenuProvider({ children }: CommandMenuProviderProps) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (open) setHasOpened(true);
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        // A held key auto-repeats; toggling on each repeat would flicker.
        if (!event.repeat) setOpen((previous) => !previous);
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
      {(open || hasOpened) && (
        <CommandPalette open={open} onOpenChange={setOpen} />
      )}
    </CommandMenuContext.Provider>
  );
}

interface CommandTriggerProps {
  /** "bar" renders a full search field (sidebar); "icon" a compact button. */
  variant?: "bar" | "icon";
  className?: string;
}

/** Opens the command palette. Rendered in the sidebar and the mobile top bar. */
export function CommandTrigger({
  variant = "bar",
  className,
}: CommandTriggerProps) {
  const { setOpen } = useCommandMenu();
  const { tool: t } = useI18n();
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
        size="icon"
        aria-label={t.commandTriggerLabel}
        onClick={() => setOpen(true)}
        onPointerEnter={prefetchCommandPalette}
        onFocus={prefetchCommandPalette}
        onTouchStart={prefetchCommandPalette}
        className={cn("rounded-md", className)}
      >
        <Search className="size-5" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      onPointerEnter={prefetchCommandPalette}
      onFocus={prefetchCommandPalette}
      onTouchStart={prefetchCommandPalette}
      className={cn(
        "group flex h-11 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm outline-none transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate text-start">
        {t.commandTriggerLabel}
      </span>
      <kbd className="pointer-events-none hidden items-center rounded-md border border-border bg-muted/60 px-2 py-0.5 font-sans text-xs font-medium text-muted-foreground sm:inline-flex">
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
