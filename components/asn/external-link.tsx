import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Restrained outbound link: text plus a small arrow, no accent colour. The
 * arrow is glued to the last characters so a wrapped URL or facility name
 * never leaves it orphaned on a line of its own.
 */
export function ExternalLink({
  href,
  text,
  label,
  variant = "underline",
  className,
}: {
  href: string;
  text: string;
  /** Accessible name when the visible text alone lacks context. */
  label?: string;
  /** `underline` for values in prose/lists, `subtle` for table row names. */
  variant?: "underline" | "subtle";
  className?: string;
}) {
  const head = text.slice(0, -3);
  const tail = text.slice(-3);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={cn(
        "group/ext rounded-sm text-foreground underline-offset-4 outline-none transition-colors [overflow-wrap:anywhere] focus-visible:ring-2 focus-visible:ring-ring/60",
        variant === "underline"
          ? "underline decoration-border hover:decoration-foreground"
          : "decoration-border hover:underline",
        className,
      )}
    >
      {head}
      <span className="whitespace-nowrap">
        {tail}
        <ArrowUpRight
          className={cn(
            "ml-1 inline size-3.5 align-[-0.15em] transition-colors group-hover/ext:text-foreground",
            variant === "underline" ? "text-muted-foreground" : "text-muted-foreground/50",
          )}
          aria-hidden
        />
      </span>
    </a>
  );
}
