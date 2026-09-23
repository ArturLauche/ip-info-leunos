import type { AsnProfile, SourceStatus } from "@/lib/asn";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import { formatStatus, SOURCE_ORDER, sourceName } from "./helpers";

/**
 * Shape carries the state as much as colour does: a filled dot for data that
 * arrived, a hollow ring for a provider that is not configured, and tinted
 * dots for degraded providers (which always get a visible status label too).
 */
export function SourceStatusMark({ status, className }: { status: SourceStatus; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        status === "available" && "bg-success",
        status === "unavailable" && "bg-warning",
        status === "error" && "bg-destructive",
        status === "not_configured" && "border border-muted-foreground/60",
        className,
      )}
    />
  );
}

export function statusTone(status: SourceStatus) {
  if (status === "available") return "text-success";
  if (status === "unavailable") return "text-warning";
  if (status === "error") return "text-destructive";
  return "text-muted-foreground";
}

/** Compact per-provider availability list for the summary and not-found states. */
export function SourceStatusList({
  sources,
  t,
  className,
}: {
  sources: AsnProfile["sources"];
  t: ToolTranslation;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-3.5 gap-y-1", className)}>
      {SOURCE_ORDER.map((source) => {
        const status = sources[source];
        const label = formatStatus(status, t);
        return (
          <li
            key={source}
            className="inline-flex items-center gap-1.5"
            title={`${sourceName(source)}: ${label}`}
          >
            <SourceStatusMark status={status} />
            <span
              className={cn(
                "font-medium",
                status === "available" ? "text-foreground/80" : "text-muted-foreground",
              )}
            >
              {sourceName(source)}
            </span>
            {status === "available" ? (
              <span className="sr-only">{label}</span>
            ) : (
              <span className={cn(status === "not_configured" ? "text-muted-foreground/80" : statusTone(status))}>
                {label}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
