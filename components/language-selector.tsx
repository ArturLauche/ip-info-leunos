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

const PANEL_ID = "language-panel";

/** Drops Latin combining marks so "espanol" can reach Español. */
function foldDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Search haystack for a locale: every name somebody might type to find it. The
 * English name and the language tag contribute the ASCII a Latin keyboard can
 * actually produce, so "jp" reaches 日本語, "br" reaches pt-BR and "portugues"
 * reaches both spellings of Português.
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

interface LocaleOptionRowProps {
  candidate: Locale;
  /** Row the keyboard cursor sits on; announced through aria-activedescendant. */
  isActive: boolean;
  /** Language the page is currently rendered in. */
  isCurrent: boolean;
  onSelect: (candidate: Locale) => void;
  onHighlight: (candidate: Locale) => void;
}

/**
 * One language in the picker. The row carries its own `lang` and direction, so
 * a right-to-left candidate renders correctly inside a left-to-right page.
 */
export function LocaleOptionRow({
  candidate,
  isActive,
  isCurrent,
  onSelect,
  onHighlight,
}: LocaleOptionRowProps) {
  const definition = getLocaleDefinition(candidate);

  return (
    <div
      id={`language-option-${candidate}`}
      role="option"
      // The highlighted row is what aria-activedescendant points at, so it
      // carries the selection; the language in effect is marked separately.
      aria-selected={isActive}
      aria-current={isCurrent ? "true" : undefined}
      data-locale={candidate}
      onClick={() => onSelect(candidate)}
      // A stationary pointer must not steal the keyboard from the row the user
      // is steering with the arrow keys.
      onMouseMove={() => onHighlight(candidate)}
      lang={candidate}
      dir={getLocaleDirection(candidate)}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-start outline-none transition-colors",
        isActive
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
      {isCurrent && (
        <Check className="size-4 shrink-0" aria-hidden="true" />
      )}
    </div>
  );
}

/**
 * Language picker for the shell footer. Twenty-six options do not work as a
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
  // The keyboard cursor tracks a locale rather than a row index, so a filtered
  // list can never leave it pointing past the end of the options.
  const [highlightedLocale, setHighlightedLocale] = useState<Locale>(locale);
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

  // Open on the active language; once a filter hides it, the first match takes
  // over until the keyboard moves on deliberately.
  const activeLocale = matches.includes(highlightedLocale)
    ? highlightedLocale
    : matches[0];

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHighlightedLocale(locale);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, locale]);

  // Keep the announced row visible when the panel opens and while filtering.
  useEffect(() => {
    if (!open || !activeLocale) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-locale="${activeLocale}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [open, activeLocale, matches]);

  function selectLocale(nextLocale: Locale) {
    setOpen(false);
    if (nextLocale === locale) return;
    persistLocalePreference(nextLocale);
    startTransition(() => router.refresh());
  }

  function moveHighlight(delta: 1 | -1) {
    if (!activeLocale) return;
    const current = matches.indexOf(activeLocale);
    setHighlightedLocale(
      matches[(current + delta + matches.length) % matches.length],
    );
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    // While a CJK composition is open, Enter belongs to the IME, not the list.
    if (event.nativeEvent.isComposing) return;
    if (!activeLocale) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectLocale(activeLocale);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon" : "sm"}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? PANEL_ID : undefined}
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

      {/* The switch is news once the panel closes and the server render catches
          up, so only the new language is announced here; the labelled trigger
          above already states it. */}
      <span role="status" className="sr-only">
        {currentName}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/30 backdrop-blur-none" />
          <DialogPrimitive.Content
            id={PANEL_ID}
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
              {matches.map((candidate) => (
                <LocaleOptionRow
                  key={candidate}
                  candidate={candidate}
                  isActive={candidate === activeLocale}
                  isCurrent={candidate === locale}
                  onSelect={selectLocale}
                  onHighlight={setHighlightedLocale}
                />
              ))}
            </div>

            {matches.length === 0 && (
              <p
                role="status"
                className="px-3 py-8 text-center text-sm text-muted-foreground"
              >
                {uiCopy.languageNoMatch}
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
                {selectorLabel}
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
