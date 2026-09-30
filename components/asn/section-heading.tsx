import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Intro line for a detail panel. Every panel is named by its tab, so the h3
 * stays in the document outline but is hidden visually; what remains is the
 * one-sentence description with an optional quiet meta figure (counts,
 * provenance) aligned opposite it.
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
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1",
        hideTitle && !description && !meta && "sr-only",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 basis-72 flex-col gap-1">
        <h3
          id={id}
          className={cn(
            "text-sm font-semibold tracking-tight text-foreground",
            hideTitle && "sr-only",
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {meta && <p className="shrink-0 text-xs text-muted-foreground tabular-nums">{meta}</p>}
    </div>
  );
}
