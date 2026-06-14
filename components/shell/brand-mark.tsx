import { cn } from "@/lib/utils";

/**
 * Bespoke brand mark — a small constellation of connected network nodes that
 * reads as routing topology, rendered on a tinted tile.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[0.65rem] bg-foreground text-background shadow-sm",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M6 7.5 12 4l6 3.5M6 7.5v9L12 20m-6-12.5L12 11m0 9 6-3.5v-9M12 20v-9m6-3.5L12 11"
          stroke="currentColor"
          strokeWidth="1.4"
          opacity="0.55"
        />
        <circle cx="12" cy="4" r="2.1" fill="currentColor" />
        <circle cx="6" cy="7.5" r="1.7" fill="currentColor" opacity="0.85" />
        <circle cx="18" cy="7.5" r="1.7" fill="currentColor" opacity="0.85" />
        <circle cx="6" cy="16.5" r="1.7" fill="currentColor" opacity="0.7" />
        <circle cx="18" cy="16.5" r="1.7" fill="currentColor" opacity="0.7" />
        <circle cx="12" cy="20" r="2.1" fill="currentColor" />
      </svg>
    </span>
  );
}
