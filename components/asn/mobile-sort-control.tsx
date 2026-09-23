"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { SortDirection } from "@/lib/asn-sort";
import { cn } from "@/lib/utils";

export interface MobileSortOption<T extends string> {
  key: T;
  label: string;
  defaultDirection: SortDirection;
}

/** Compact, keyboard-native sorting for the intentionally different mobile list. */
export function MobileSortControl<T extends string>({
  label,
  sortKey,
  direction,
  options,
  onToggle,
}: {
  label: string;
  sortKey: T | null;
  direction: SortDirection | null;
  options: MobileSortOption<T>[];
  onToggle: (key: T, defaultDirection: SortDirection) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label={label} role="group">
      <span className="mr-0.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </span>
      {options.map((option) => {
        const active = sortKey === option.key;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onToggle(option.key, option.defaultDirection)}
            aria-label={`${label}: ${option.label}`}
            aria-pressed={active}
            className={cn(
              "inline-flex min-h-10 items-center gap-1 rounded-md border border-border/70 bg-card/50 px-2.5 text-[11px] font-medium text-muted-foreground outline-none transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
              active && "border-foreground/25 bg-muted text-foreground",
            )}
          >
            {option.label}
            {active && direction === "asc" ? (
              <ArrowUp className="size-3" aria-hidden="true" />
            ) : active && direction === "desc" ? (
              <ArrowDown className="size-3" aria-hidden="true" />
            ) : (
              <ArrowUpDown className="size-3 opacity-45" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}
