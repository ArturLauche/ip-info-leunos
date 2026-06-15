import { cn } from "@/lib/utils";

/**
 * Brand mark — a minimal globe with a centred locator dot, reading as
 * "geolocated IP / global network". Rendered on the inverted brand tile
 * (black-on-white in light, white-on-black in dark). The same motif is used
 * for the favicon and app icons (see scripts/generate-icons.mjs).
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
        <g stroke="currentColor" strokeWidth="1.7" fill="none">
          <circle cx="12" cy="12" r="7.25" />
          <path d="M4.75 12H19.25" />
          <path d="M12 4.75A3.8 7.25 0 0 1 12 19.25" />
          <path d="M12 4.75A3.8 7.25 0 0 0 12 19.25" />
        </g>
        <circle cx="12" cy="12" r="1.9" fill="currentColor" />
      </svg>
    </span>
  );
}
