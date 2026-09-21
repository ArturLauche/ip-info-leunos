"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Shared column scaffold for the routing and prefix lists: an uppercase label
 * with an optional icon and a monospace total, then the caller's rows. Keeps
 * both lists visually identical so switching tabs never changes the rhythm.
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
    <section className="flex min-w-0 flex-col">
      <h4 className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-2">
        <span
          className={cn(
            "flex min-w-0 items-center gap-1.5 text-xs font-semibold tracking-wider text-foreground uppercase",
            monoTitle && "font-mono tracking-tight normal-case",
          )}
        >
          {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />}
          <span className="min-w-0 break-words">{title}</span>
        </span>
        {typeof total === "number" && (
          <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
            {formatNumber(total, locale)}
          </span>
        )}
      </h4>

      {children}

      {footer}
    </section>
  );
}
