import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Shared "no query yet" surface for the tools: a grid-textured card with an
 * icon tile, a title and a one-line hint. Centralises the polished ASN /
 * reputation empty state so every tool opens with the same considered first
 * impression instead of a bare void.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "bg-grid items-center gap-3 overflow-hidden p-8 text-center sm:p-12",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
        <Icon className="size-6" />
      </span>
      <p className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </p>
      {description && (
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children && <div className="mt-1">{children}</div>}
    </Card>
  );
}
