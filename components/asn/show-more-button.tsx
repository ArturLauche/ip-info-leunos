"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";

interface ShowMoreButtonProps {
  expanded: boolean;
  onToggle: () => void;
  count: number;
  t: ToolTranslation;
}

export function ShowMoreButton({ expanded, onToggle, count, t }: ShowMoreButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onToggle}
      aria-expanded={expanded}
      className="min-h-11 w-full text-muted-foreground hover:text-primary"
    >
      <ChevronDown
        className={cn(
          "size-3.5 transition-transform duration-200 ease-[var(--ease-smooth)] motion-reduce:transition-none",
          expanded && "rotate-180",
        )}
        aria-hidden
      />
      {expanded ? t.showLess : `${t.showAll} (${count})`}
    </Button>
  );
}
