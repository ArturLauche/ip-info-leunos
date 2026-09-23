"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { ToolTranslation } from "@/lib/tool-i18n";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ShowMoreButtonProps {
  expanded: boolean;
  onToggle: () => void;
  count: number;
  reportedTotal?: number;
  locale: Locale;
  t: ToolTranslation;
}

export function ShowMoreButton({
  expanded,
  onToggle,
  count,
  reportedTotal,
  locale,
  t,
}: ShowMoreButtonProps) {
  const hasReportedRecords = typeof reportedTotal === "number" && count < reportedTotal;
  const label = expanded
    ? t.showLess
    : hasReportedRecords
      ? formatTemplate(t.asnShowLoaded, { loaded: formatNumber(count, locale) })
      : `${t.showAll} (${count})`;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onToggle}
      aria-expanded={expanded}
      className="min-h-11 w-full justify-between border-border/70 bg-card/40 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
    >
      <span>{label}</span>
      <ChevronDown
        className={cn(
          "size-3.5 transition-transform duration-200 ease-[var(--ease-smooth)] motion-reduce:transition-none",
          expanded && "rotate-180",
        )}
        aria-hidden
      />
    </Button>
  );
}
