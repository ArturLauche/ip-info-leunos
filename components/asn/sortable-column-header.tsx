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
  align = "left",
  className,
}: {
  label: ReactNode;
  active: boolean;
  direction: SortDirection | null;
  onToggle: () => void;
  ariaLabel: string;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-sm text-inherit outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
        align === "right" && "ml-auto flex-row-reverse",
        className,
      )}
    >
      <span className="inline-flex items-center">{label}</span>
      <span aria-hidden className="inline-flex shrink-0 items-center">
        {active && direction === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : active && direction === "desc" ? (
          <ArrowDown className="size-3.5" />
        ) : (
          <ArrowUpDown className="size-3.5 opacity-40" />
        )}
      </span>
    </button>
  );
}
