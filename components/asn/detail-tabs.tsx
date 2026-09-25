"use client";

import { useEffect, useState, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface DetailTab {
  value: string;
  label: string;
  /** Real provider total shown beside the label; null/undefined hides it. */
  count?: number | null;
  /** Screen-reader noun for the count when the number alone is ambiguous. */
  countLabel?: string;
  tone?: "default" | "warning";
}

/**
 * Section navigation for a loaded ASN, drawn as the header of the detail
 * card. The underline indicator reuses the measured sliding model of the
 * segment chip so switching sections reads as one continuous motion; on
 * phones the triggers share the full width in an equal grid (label over
 * count) so the bar never needs to scroll.
 */
export function AsnDetailTabs({
  tabs,
  label,
  locale,
  children,
}: {
  tabs: DetailTab[];
  label: string;
  locale: Locale;
  children: ReactNode;
}) {
  const [tab, setTab] = useState(tabs[0]?.value ?? "");
  const { containerRef, view, canAnimate } = useSegmentHighlight(tab);
  const values = tabs.map((item) => item.value).join("|");

  // Optional tabs (sources) can disappear while selected when the
  // source-info flag is removed; fall back to the first section.
  useEffect(() => {
    const available = values.split("|");
    setTab((current) => (available.includes(current) ? current : available[0] ?? ""));
  }, [values]);

  return (
    <Tabs value={tab} onValueChange={setTab} className="gap-0">
      <div ref={containerRef} className="relative border-b border-border/70 px-2 sm:px-3">
        <span
          className="tool-tab-indicator"
          style={{
            transform: `translate3d(${view.box.x}px, 0, 0)`,
            width: view.box.width,
            opacity: view.visible ? 1 : 0,
          }}
          data-animate={canAnimate ? "true" : undefined}
          data-slide={view.slide ? "true" : undefined}
          aria-hidden
        />
        <TabsList
          aria-label={label}
          className={cn(
            "grid h-auto w-full items-stretch gap-1 rounded-none bg-transparent p-0 sm:flex sm:w-auto sm:items-center sm:justify-start",
            tabs.length >= 4 ? "grid-cols-4" : "grid-cols-3",
          )}
        >
          {tabs.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={cn(
                "group my-1.5 h-auto min-h-11 min-w-0 flex-col justify-start gap-1 rounded-md sm:justify-center border-0 px-1.5 py-1.5 text-[13px] font-medium text-muted-foreground shadow-none transition-colors duration-200 ease-[var(--ease-smooth)] hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none sm:min-h-9 sm:flex-none sm:flex-row sm:gap-2 sm:px-3",
                "data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:hover:bg-muted/70",
                "dark:text-muted-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-foreground",
                // Without a measured indicator (first paint, no JS) the active
                // tab still needs a visible marker.
                !view.visible && "data-[state=active]:underline data-[state=active]:underline-offset-8",
              )}
            >
              <span className="max-w-full truncate">{item.label}</span>
              {typeof item.count === "number" && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 font-mono text-[10.5px] leading-4 font-medium tabular-nums transition-colors",
                    item.tone === "warning"
                      ? "bg-warning/12 text-warning"
                      : "bg-muted text-muted-foreground group-data-[state=active]:bg-foreground/10 group-data-[state=active]:text-foreground",
                  )}
                >
                  {item.tone === "warning" && <TriangleAlert className="size-2.5" aria-hidden />}
                  {formatNumber(item.count, locale)}
                  {item.countLabel && <span className="sr-only"> {item.countLabel}</span>}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {/* Content settles in with the shared section reveal (fade + small lift
          on the soft-deceleration curve), continuous with the sliding bar. */}
      <div key={tab} className="tool-section-reveal p-4 sm:p-6">
        {children}
      </div>
    </Tabs>
  );
}
