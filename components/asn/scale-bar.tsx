import { cn } from "@/lib/utils";

/**
 * Thin relative-scale track (routing power, IX port speed, source latency).
 * Purely decorative: the exact figure is always rendered beside it.
 */
export function ScaleBar({ pct, className }: { pct: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block h-1 shrink-0 overflow-hidden rounded-full bg-foreground/10", className)}
    >
      <span
        className="block h-full rounded-full bg-foreground/55"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </span>
  );
}
