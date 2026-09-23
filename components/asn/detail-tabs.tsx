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
  shortLabel: string;
  /** Unobtrusive row count shown beside the label; null hides it. */
  count: number | null;
}

/**
 * Section navigation for a loaded ASN. The chip travels between triggers while
 * the small-screen 2×2 layout keeps every target comfortably tappable. Counts
 * are provider totals, not invented section metrics.
 */
export function AsnDetailTabs({
  routingLabel,
  routingCount,
  prefixesLabel,
  prefixesCount,
  peeringLabel,
  sourcesLabel,
  routingShortLabel,
  prefixesShortLabel,
  peeringShortLabel,
  sourcesShortLabel,
  showSources,
  locale,
  children,
  initialTab = "routing",
  navigationLabel,
}: {
  routingLabel: string;
  routingCount: number | null;
  prefixesLabel: string;
  prefixesCount: number | null;
  peeringLabel: string;
  sourcesLabel: string;
  routingShortLabel: string;
  prefixesShortLabel: string;
  peeringShortLabel: string;
  sourcesShortLabel: string;
  showSources: boolean;
  locale: Locale;
  children: ReactNode;
  initialTab?: string;
  navigationLabel: string;
}) {
  const [tab, setTab] = useState(initialTab);
  const { containerRef, view, canAnimate, radius } = useSegmentHighlight(tab);

  // The sources tab only exists behind the source-info flag; fall back to
  // routing if the flag disappears while sources is selected.
  useEffect(() => {
    if (!showSources) {
      setTab((current) => (current === "sources" ? "routing" : current));
    }
  }, [showSources]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      containerRef.current
        ?.querySelector<HTMLElement>('[data-state="active"]')
        ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [containerRef, tab]);

  const triggers: DetailTab[] = [
    { value: "routing", label: routingLabel, shortLabel: routingShortLabel, count: routingCount },
    { value: "prefixes", label: prefixesLabel, shortLabel: prefixesShortLabel, count: prefixesCount },
    { value: "peering", label: peeringLabel, shortLabel: peeringShortLabel, count: null },
  ];
  if (showSources) {
    triggers.push({ value: "sources", label: sourcesLabel, shortLabel: sourcesShortLabel, count: null });
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <div ref={containerRef} className="relative isolate -mx-1 mb-1 px-1">
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
        <TabsList
          aria-label={navigationLabel}
          className="grid h-auto w-full grid-cols-2 gap-1 overflow-visible p-1 sm:flex sm:w-fit sm:flex-nowrap"
        >
          {triggers.map((trigger) => (
            <TabsTrigger
              key={trigger.value}
              value={trigger.value}
              aria-label={
                trigger.count !== null
                  ? `${trigger.label} (${formatNumber(trigger.count, locale)})`
                  : trigger.label
              }
              className={cn(
                "group relative z-10 min-h-11 shrink-0 justify-start px-3 py-2 text-xs transition-[color,background-color,box-shadow,border-color] duration-200 ease-[var(--ease-smooth)] sm:justify-center sm:px-3 sm:text-sm",
                view.visible &&
                  "data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent",
                "data-[state=active]:font-semibold data-[state=active]:text-foreground",
              )}
            >
              <span className="min-w-0 truncate xl:hidden">{trigger.shortLabel}</span>
              <span className="hidden min-w-0 truncate xl:inline">{trigger.label}</span>
              {trigger.count !== null && (
                <span className="font-mono text-[10px] text-muted-foreground/70 tabular-nums transition-colors group-data-[state=active]:text-foreground/70 sm:text-[11px]">
                  {formatNumber(trigger.count, locale)}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div className="tool-section-reveal">{children}</div>
    </Tabs>
  );
}
