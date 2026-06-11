"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { ToolTranslation } from "@/lib/tool-i18n";

interface ShowMoreButtonProps {
  expanded: boolean;
  onToggle: () => void;
  count: number;
  t: ToolTranslation;
}

export function ShowMoreButton({ expanded, onToggle, count, t }: ShowMoreButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/50 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-secondary hover:text-primary"
    >
      {expanded ? (
        <>
          <ChevronUp className="h-3.5 w-3.5" />
          {t.showLess}
        </>
      ) : (
        <>
          <ChevronDown className="h-3.5 w-3.5" />
          {t.showAll} ({count})
        </>
      )}
    </button>
  );
}
