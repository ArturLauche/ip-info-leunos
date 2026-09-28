"use client";

import { Check, Globe2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { matchesQuery } from "@/lib/command";
import {
  getLocaleDefinition,
  getLocaleDirection,
  getNativeLocaleName,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n";
import { persistLocalePreference } from "@/lib/locale-preference";
import { getToolTranslation } from "@/lib/tool-i18n";
import { getUiCopy } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";

/** Drops Latin combining marks so "espanol" can reach Español. */
function foldDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Search haystack for a locale: every name somebody might type to find it. The
 * English name and the language tag contribute the ASCII a Latin keyboard can
 * actually produce, so "jp" reaches 日本語, "br" reaches pt-BR and "szukaj"
 * reaches Polski.
 */
export function localeMatchesQuery(locale: Locale, query: string): boolean {
  const definition = getLocaleDefinition(locale);
  return matchesQuery(
    foldDiacritics(
      [
        definition.nativeName,
        definition.englishName,
        locale,
        definition.intlLocale,
      ].join(" "),
    ),
    foldDiacritics(query),
  );
}

interface LanguageSelectorProps {
  locale: Locale;
  compact?: boolean;
}

/**
 * Language picker for the app shell. Twenty-six options do not work as a
 * scroll-only menu, so the globe opens a filterable combobox that follows the
 * command palette's interaction model: type to narrow the list, arrows to walk
 * it, Enter to switch. The choice itself still travels through the locale
 * cookie, so it survives reloads and visits once the server render syncs.
 */
export function LanguageSelector({
  locale,
  compact = false,
}: LanguageSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const uiCopy = getUiCopy(locale);
  const t = getToolTranslation(locale);
  const currentName = getNativeLocaleName(locale);
  const selectorLabel = uiCopy.languageSelectorLabel;
  const triggerLabel = `${selectorLabel}: ${currentName}`;

  const matches = useMemo(
    () => SUPPORTED_LOCALES.filter((item) => localeMatchesQuery(item, query)),
    [query],
  );

  // An empty query starts the keyboard on the active language; typing a filter
  // moves the start to the narrowest match instead.
  const defaultActiveIndex = query.trim()
    ? 0
    : Math.max(SUPPORTED_LOCALES.indexOf(locale), 0);

  useEffect(() => {
    setActiveIndex(defaultActiveIndex);
  }, [defaultActiveIndex]);

  const activeRowIndex = Math.min(activeIndex, matches.length - 1);
  const activeLocale = matches[activeRowIndex];

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Keep the active row visible as the filtered set changes while typing.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeRowIndex}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeRowIndex, matches]);

  function selectLocale(nextLocale: Locale) {
    setOpen(false);
    if (nextLocale === locale) return;
    persistLocalePreference(nextLocale);
    startTransition(() => router.refresh());
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    // While a CJK composition is open, Enter belongs to the IME, not the list.
    if (event.nativeEvent.isComposing) return;
    if (matches.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeLocale) selectLocale(activeLocale);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon" : "sm"}
        onClick={() => setOpen(true)}
        aria-label={triggerLabel}
        title={triggerLabel}
        className={cn(
          "gap-2",
          compact && "size-9",
          isPending && "opacity-70",
        )}
      >
        <Globe2 className="size-4" aria-hidden="true" />
        {!compact && (
          <span className="max-w-28 truncate" lang={locale}>
            {currentName}
          </span>
        )}
      </Button>

      {/* Announced outside the dialog so the new language remains news after
          the panel closes and the server render catches up. */}
      <span role="status" className="sr-only">
        {triggerLabel}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/30 backdrop-blur-none" />
          <DialogPrimitive.Content
            dir={getLocaleDirection(locale)}
            className={cn(
              "fixed left-[50%] top-[12dvh] z-50 flex w-full max-w-[calc(100%-2rem)] translate-x-[-50%] flex-col overflow-hidden border bg-popover shadow-lg sm:max-w-md",
              "max-h-[76dvh] rounded-xl duration-200 motion-reduce:animate-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            )}
          >
            <DialogTitle className="sr-only">{selectorLabel}</DialogTitle>
            <DialogDescription className="sr-only" lang={locale}>
              {currentName}
            </DialogDescription>

            <div className="flex items-center gap-3 border-b border-border/50 px-4">
              <Search
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={uiCopy.languageSearchPlaceholder}
                role="combobox"
                aria-label={uiCopy.languageSearchPlaceholder}
                aria-expanded="true"
                aria-haspopup="listbox"
                aria-autocomplete="list"
                aria-controls="language-list"
                aria-activedescendant={
                  activeLocale ? `language-option-${activeLocale}` : undefined
                }
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="h-12 min-w-0 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <DialogPrimitive.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 shrink-0"
                  aria-label={t.commandHintClose}
                >
                  <X aria-hidden="true" />
                </Button>
              </DialogPrimitive.Close>
            </div>

            <div
              id="language-list"
              ref={listRef}
              role="listbox"
              aria-label={selectorLabel}
              className="min-h-0 overflow-y-auto p-2"
            >
              {matches.map((candidate, index) => {
                const definition = getLocaleDefinition(candidate);
                const selected = candidate === locale;
                const active = index === activeRowIndex;
                return (
                  <div
                    key={candidate}
                    id={`language-option-${candidate}`}
                    role="option"
                    // aria-selected marks the active language; the row the
                    // keyboard is on is announced through
                    // aria-activedescendant on the filter input.
                    aria-selected={selected}
                    data-index={index}
                    onClick={() => selectLocale(candidate)}
                    // A stationary pointer must not steal the keyboard from the
                    // row the user is steering with the arrow keys.
                    onMouseMove={() => setActiveIndex(index)}
                    lang={candidate}
                    dir={getLocaleDirection(candidate)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-start outline-none transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/60",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {definition.nativeName}
                    </span>
                    {definition.nativeName !== definition.englishName && (
                      <span className="min-w-0 truncate text-xs text-muted-foreground">
                        {definition.englishName}
                      </span>
                    )}
                    {selected && (
                      <Check className="size-4 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </div>

            {matches.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {t.commandEmpty}
              </p>
            )}

            <div className="hidden items-center gap-4 border-t border-border/50 px-4 py-2.5 text-xs text-muted-foreground sm:flex">
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                {t.commandHintNavigate}
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>↵</Kbd>
                {t.commandHintSelect}
              </span>
              <span className="ms-auto flex items-center gap-1.5">
                <Kbd>esc</Kbd>
                {t.commandHintClose}
              </span>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-sans text-[0.7rem] text-muted-foreground">
      {children}
    </kbd>
  );
}
