import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Full-width band under the centred content, e.g. a preview of what a lookup returns. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Shared "no query yet" surface for the tools: a grid-textured card with an
 * icon tile, a title and a one-line hint, plus an optional footer band.
 * Centralises the polished ASN / reputation empty state so every tool opens
 * with the same considered first impression instead of a bare void.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  footer,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "bg-grid gap-0 overflow-hidden p-0 text-center",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 p-8 sm:p-12">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {children && <div className="mt-1">{children}</div>}
      </div>
      {footer && (
        <div className="border-t border-border/60 bg-card text-start">{footer}</div>
      )}
    </Card>
  );
}
