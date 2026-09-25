"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SortDirection, SortState } from "@/lib/asn-sort";
import { formatTemplate } from "@/lib/format";
import type { ToolTranslation } from "@/lib/tool-i18n";

/** "Sort by Speed (descending)" — names the column and its current state. */
export function sortAriaLabel(label: string, direction: SortDirection | null, t: ToolTranslation) {
  const order =
    direction === "asc" ? t.asnSortAscending : direction === "desc" ? t.asnSortDescending : t.asnSortNotSorted;
  return `${formatTemplate(t.asnSortBy, { column: label })} (${order})`;
}

export interface SortableColumn<K extends string> {
  key: K;
  label: string;
  align?: "start" | "end";
  className?: string;
}

/**
 * Column header cell for the PeeringDB tables: carries aria-sort, a
 * descriptive button label, and a faint tint on the sorted column that the
 * body cells repeat so the active sort stays visible down the table.
 */
export function SortableTableHead<K extends string>({
  column,
  sort,
  onToggle,
  t,
}: {
  column: SortableColumn<K>;
  sort: SortState<K>;
  onToggle: (key: K) => void;
  t: ToolTranslation;
}) {
  const active = sort.key === column.key && Boolean(sort.direction);
  const direction = active ? sort.direction : null;

  return (
    <TableHead
      scope="col"
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
      className={cn(
        "h-10 px-3 text-[11px] transition-colors",
        column.align === "end" && "text-end",
        active && "bg-muted/70",
        column.className,
      )}
    >
      <SortableColumnHeader
        label={column.label}
        active={active}
        direction={direction}
        onToggle={() => onToggle(column.key)}
        ariaLabel={sortAriaLabel(column.label, direction, t)}
        align={column.align}
      />
    </TableHead>
  );
}

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
        "group/sort -mx-1.5 inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-sm px-1.5 text-inherit uppercase outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 pointer-coarse:min-h-11",
        align === "end" && "me-auto flex-row-reverse",
        active && "text-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center">{label}</span>
      {/* Idle columns show a faint two-way hint; the sorted column swaps it
          for a solid direction arrow so the state reads without colour. */}
      <span
        aria-hidden
        className={cn(
          "inline-flex shrink-0 items-center transition-opacity duration-150",
          active ? "opacity-100" : "opacity-30 group-hover/sort:opacity-70 group-focus-visible/sort:opacity-70",
        )}
      >
        {active && direction === "asc" ? (
          <ArrowUp className="size-3.5" strokeWidth={2.25} />
        ) : active && direction === "desc" ? (
          <ArrowDown className="size-3.5" strokeWidth={2.25} />
        ) : (
          <ArrowUpDown className="size-3.5" />
        )}
      </span>
    </button>
  );
}
