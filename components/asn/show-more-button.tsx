"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";

interface ShowMoreButtonProps {
  expanded: boolean;
  onToggle: () => void;
  /** Rows hidden while collapsed. */
  hiddenCount: number;
  /** Rows the providers returned; may be capped below `total`. */
  listed: number;
  /** Provider total, including records beyond the response cap. */
  total: number;
  /** id of the list or table this control expands. */
  controls?: string;
  t: ToolTranslation;
  locale: Locale;
}

/**
 * List footer: a quiet expand toggle plus, when a provider capped the list,
 * an honest "N of M listed" note so "show more" never implies completeness.
 */
export function ShowMoreButton({
  expanded,
  onToggle,
  hiddenCount,
  listed,
  total,
  controls,
  t,
  locale,
}: ShowMoreButtonProps) {
  const capped = listed < total;
  if (hiddenCount <= 0 && !capped) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-2">
      {hiddenCount > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={controls}
          className="-ml-2 min-h-11 px-2 text-muted-foreground hover:text-foreground sm:min-h-8"
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-200 ease-[var(--ease-smooth)] motion-reduce:transition-none",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
          {expanded
            ? t.showLess
            : formatTemplate(t.asnShowMore, { count: formatNumber(hiddenCount, locale) })}
        </Button>
      ) : (
        <span />
      )}
      {capped && (
        <p className="text-[11px] text-muted-foreground tabular-nums">
          {formatTemplate(t.asnListedOfTotal, {
            shown: formatNumber(listed, locale),
            total: formatNumber(total, locale),
          })}
        </p>
      )}
    </div>
  );
}
