"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortDirection } from "@/lib/asn-sort";

export function SortableColumnHeader({
  label,
  active,
  direction,
  onToggle,
  ariaLabel,
  align = "start",
  className,
}: {
  label: ReactNode;
  active: boolean;
  direction: SortDirection | null;
  onToggle: () => void;
  ariaLabel: string;
  align?: "start" | "end";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      className={cn(
        "group/sort inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-sm text-inherit outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
        align === "end" && "ms-auto flex-row-reverse",
        active && "text-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center">{label}</span>
      <span
        aria-hidden
        className={cn(
          "inline-flex shrink-0 items-center transition-opacity",
          active ? "opacity-100" : "opacity-40 group-hover/sort:opacity-70",
        )}
      >
        {active && direction === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : active && direction === "desc" ? (
          <ArrowDown className="size-3.5" />
        ) : (
          <ArrowUpDown className="size-3.5" />
        )}
      </span>
    </button>
  );
}
