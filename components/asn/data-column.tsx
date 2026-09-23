"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Shared column scaffold for the routing and prefix lists: a label (with an
 * optional direction icon) and the provider total as the column's headline
 * figure, then the caller's rows. The column is a size container so rows can
 * switch between a stacked and a tabular layout based on the space they get,
 * not on the viewport.
 */
export function DataColumn({
  title,
  total,
  icon: Icon,
  monoTitle = false,
  children,
  footer,
  locale,
}: {
  title: string;
  /** Provider total shown next to the title; omitted when unknown. */
  total?: number | null;
  icon?: LucideIcon;
  monoTitle?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  locale: Locale;
}) {
  return (
    <section className="@container flex min-w-0 flex-col">
      <h4 className="flex items-center justify-between gap-3 border-b border-border/70 pb-2.5">
        <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold text-foreground">
          {Icon && (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon className="size-3.5" aria-hidden />
            </span>
          )}
          <span className={cn("min-w-0 break-words", monoTitle && "font-mono")}>{title}</span>
        </span>
        {typeof total === "number" && (
          <span
            className={cn(
              "shrink-0 font-mono text-sm font-semibold tabular-nums",
              total === 0 ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {formatNumber(total, locale)}
          </span>
        )}
      </h4>

      {children}

      {footer}
    </section>
  );
}

/** Quiet placeholder for a column (or table) the providers returned nothing for. */
export function EmptyColumn({ text }: { text: string }) {
  return (
    <p className="mt-2 rounded-md border border-dashed border-border/80 px-3 py-4 text-center text-xs text-muted-foreground">
      {text}
    </p>
  );
}
