"use client";

import { Check, Globe2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getLocaleDirection,
  getNativeLocaleName,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n";
import { persistLocalePreference } from "@/lib/locale-preference";
import { getUiCopy } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  locale: Locale;
  compact?: boolean;
}

export function LanguageSelector({
  locale,
  compact = false,
}: LanguageSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentName = getNativeLocaleName(locale);
  const selectorLabel = getUiCopy(locale).languageSelectorLabel;

  function selectLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;
    persistLocalePreference(nextLocale);
    startTransition(() => router.refresh());
  }

  return (
    <DropdownMenu dir={getLocaleDirection(locale)}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className={cn(
            "gap-2",
            compact && "size-9",
            isPending && "opacity-70",
          )}
          aria-label={`${selectorLabel}: ${currentName}`}
          title={`${selectorLabel}: ${currentName}`}
        >
          <Globe2 className="size-4" aria-hidden="true" />
          {!compact && (
            <span className="max-w-28 truncate" lang={locale}>
              {currentName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-80 min-w-52 overflow-y-auto"
      >
        <DropdownMenuLabel>{currentName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_LOCALES.map((candidate) => {
          const name = getNativeLocaleName(candidate);
          const selected = candidate === locale;
          return (
            <DropdownMenuItem
              key={candidate}
              onSelect={() => selectLocale(candidate)}
              className="justify-between gap-4"
              lang={candidate}
              dir={getLocaleDirection(candidate)}
              // Radio semantics announce the active language to assistive
              // technology; the trailing check icon alone is visual-only.
              role="menuitemradio"
              aria-checked={selected}
            >
              <span>{name}</span>
              {selected && <Check className="size-4" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
