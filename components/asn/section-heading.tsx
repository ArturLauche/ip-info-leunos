import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Heading block for a detail section. Single-section tabs (routing, prefixes,
 * sources) already name themselves in the tab bar, so they keep the h3 for
 * the document outline but hide it visually; the peering tab stacks several
 * sections and shows each title with an optional quiet meta line.
 */
export function SectionHeading({
  id,
  title,
  meta,
  description,
  hideTitle = false,
  className,
}: {
  id: string;
  title: string;
  meta?: ReactNode;
  description?: string;
  hideTitle?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        className={cn(
          "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5",
          hideTitle && !meta && "sr-only",
        )}
      >
        <h3
          id={id}
          className={cn(
            "text-sm font-semibold tracking-tight text-foreground",
            hideTitle && "sr-only",
          )}
        >
          {title}
        </h3>
        {meta && <p className="text-xs text-muted-foreground tabular-nums">{meta}</p>}
      </div>
      {description && (
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
