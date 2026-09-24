import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * A restrained first-use surface. The grid remains a small brand signature,
 * while the border and spacing do the structural work instead of a stack of
 * nested cards and oversized icon tiles.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <section
      data-slot="empty-state"
      className={cn(
        "relative isolate overflow-hidden rounded-xl border bg-card px-6 py-10 text-center shadow-none sm:px-10 sm:py-12",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40" aria-hidden="true" />
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h2>
        {description && (
          <p className="max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        )}
        {children && <div className="mt-2 w-full">{children}</div>}
      </div>
    </section>
  );
}
