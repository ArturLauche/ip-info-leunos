"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { formatNumber, formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";

/**
 * Shared column scaffold for the routing and prefix lists: a quiet title with
 * the provider total, an optional loaded/reported disclosure, and the caller's
 * rows. It keeps both technical lists aligned without turning them into cards.
 */
export function DataColumn({
  title,
  total,
  loadedCount,
  icon: Icon,
  monoTitle = false,
  children,
  footer,
  locale,
  t,
  className,
}: {
  title: string;
  /** Provider total shown next to the title; omitted when unknown. */
  total?: number | null;
  /** Number of records currently held in the response. */
  loadedCount?: number;
  icon?: LucideIcon;
  monoTitle?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  locale: Locale;
  t: ToolTranslation;
  className?: string;
}) {
  const showLoaded = typeof total === "number" && typeof loadedCount === "number" && loadedCount < total;

  return (
    <section className={cn("flex min-w-0 flex-col", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2.5">
        <h4
          className={cn(
            "flex min-w-0 items-center gap-1.5 text-xs font-semibold tracking-wider text-foreground uppercase",
            monoTitle && "font-mono tracking-tight normal-case",
          )}
        >
          {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />}
          <span className="min-w-0 break-words">{title}</span>
        </h4>
        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          {typeof total === "number" && (
            <span className="font-mono text-xs text-foreground/80 tabular-nums">
              {formatNumber(total, locale)}
            </span>
          )}
          {showLoaded && (
            <span className="text-[10px] text-muted-foreground/80 tabular-nums">
              {formatTemplate(t.asnLoadedOfReported, {
                loaded: formatNumber(loadedCount, locale),
                reported: formatNumber(total, locale),
              })}
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0">{children}</div>
      {footer}
    </section>
  );
}
