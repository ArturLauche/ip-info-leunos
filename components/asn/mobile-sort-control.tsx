"use client";

import { useId } from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SortDirection, SortState } from "@/lib/asn-sort";
import type { ToolTranslation } from "@/lib/tool-i18n";

/**
 * Phone counterpart to the sortable table headers: a native select for the
 * column (OS picker, fully accessible) plus a direction toggle, driving the
 * same sort state as the desktop table.
 */
export function MobileSortControl<K extends string>({
  options,
  sort,
  onChange,
  defaultDirection,
  t,
}: {
  options: { key: K; label: string }[];
  sort: SortState<K>;
  onChange: (next: SortState<K>) => void;
  defaultDirection: (key: K) => SortDirection;
  t: ToolTranslation;
}) {
  const id = useId();
  const active = Boolean(sort.key && sort.direction);
  const direction = sort.direction ?? "asc";
  const directionLabel = `${t.asnSortLabel}: ${direction === "asc" ? t.asnSortAscending : t.asnSortDescending}`;

  return (
    <div className="flex items-center gap-2 md:hidden">
      <label htmlFor={id} className="shrink-0 text-xs text-muted-foreground">
        {t.asnSortLabel}
      </label>
      <div className="relative min-w-0 flex-1">
        <select
          id={id}
          value={active ? (sort.key as string) : ""}
          onChange={(event) => {
            const key = event.target.value as K | "";
            onChange(key ? { key, direction: defaultDirection(key) } : { key: null, direction: null });
          }}
          className="h-11 w-full min-w-0 cursor-pointer appearance-none rounded-md border border-input bg-transparent pe-9 ps-3 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="">{t.asnSortDefault}</option>
          {options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 end-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 text-muted-foreground hover:text-foreground"
        disabled={!active}
        aria-label={directionLabel}
        title={directionLabel}
        onClick={() =>
          sort.key && onChange({ key: sort.key, direction: direction === "asc" ? "desc" : "asc" })
        }
      >
        {direction === "desc" ? <ArrowDownWideNarrow aria-hidden /> : <ArrowUpNarrowWide aria-hidden />}
      </Button>
    </div>
  );
}
