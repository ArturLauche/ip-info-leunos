"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface DetailTab {
  value: string;
  label: string;
  /** Unobtrusive row count shown beside the label; null hides it. */
  count: number | null;
}

/**
 * Section navigation for a loaded ASN. Keeps the sliding segment highlight so
 * switching sections feels continuous, and surfaces real provider totals for
 * the two unbounded sections (routing, prefixes) so users can judge where the
 * data volume lives before opening a tab.
 */
export function AsnDetailTabs({
  routingLabel,
  routingCount,
  prefixesLabel,
  prefixesCount,
  peeringLabel,
  sourcesLabel,
  showSources,
  locale,
  children,
}: {
  routingLabel: string;
  routingCount: number | null;
  prefixesLabel: string;
  prefixesCount: number | null;
  peeringLabel: string;
  sourcesLabel: string;
  showSources: boolean;
  locale: Locale;
  children: ReactNode;
}) {
  const [tab, setTab] = useState("routing");
  const { containerRef, view, canAnimate, radius } = useSegmentHighlight(tab);

  // The sources tab only exists behind the source-info flag; fall back to
  // routing if the flag disappears while sources is selected.
  useEffect(() => {
    if (!showSources) {
      setTab((current) => (current === "sources" ? "routing" : current));
    }
  }, [showSources]);

  const triggers: DetailTab[] = [
    { value: "routing", label: routingLabel, count: routingCount },
    { value: "prefixes", label: prefixesLabel, count: prefixesCount },
    { value: "peering", label: peeringLabel, count: null },
  ];
  if (showSources) {
    triggers.push({ value: "sources", label: sourcesLabel, count: null });
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <div ref={containerRef} className="relative isolate">
        <span
          className="tool-segment-highlight"
          style={{
            transform: `translate3d(${view.box.x}px, ${view.box.y}px, 0)`,
            width: view.box.width,
            height: view.box.height,
            opacity: view.visible ? 1 : 0,
            borderRadius: radius || undefined,
          }}
          data-animate={canAnimate ? "true" : undefined}
          data-slide={view.slide ? "true" : undefined}
          aria-hidden
        />
        <TabsList className="h-auto min-h-12 w-full justify-start overflow-x-auto p-1 sm:w-fit">
          {triggers.map((trigger) => (
            <TabsTrigger
              key={trigger.value}
              value={trigger.value}
              className={cn(
                "group relative z-10 min-h-11 shrink-0 py-2 transition-[color,background-color,box-shadow,border-color] duration-200 ease-[var(--ease-smooth)]",
                view.visible &&
                  "data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent",
              )}
            >
              <span className="whitespace-nowrap">{trigger.label}</span>
              {trigger.count !== null && (
                <span className="font-mono text-[11px] text-muted-foreground/70 tabular-nums transition-colors group-data-[state=active]:text-foreground/70">
                  {formatNumber(trigger.count, locale)}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div key={tab} className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
        {children}
      </div>
    </Tabs>
  );
}
