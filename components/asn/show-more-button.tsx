"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ToolTranslation } from "@/lib/tool-i18n";

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
      className="w-full text-muted-foreground hover:text-primary"
    >
      {expanded ? (
        <>
          <ChevronUp className="size-3.5" />
          {t.showLess}
        </>
      ) : (
        <>
          <ChevronDown className="size-3.5" />
          {t.showAll} ({count})
        </>
      )}
    </Button>
  );
}
