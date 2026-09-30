"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getLocaleDirection } from "@/lib/locale-config";
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

function activeTrigger(container: HTMLElement | null) {
  return (
    container?.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-state="active"]') ?? null
  );
}

/**
 * Section navigation for a loaded ASN: an underline tab bar that sits directly
 * on the page above the panel it controls. The underline reuses the measured
 * sliding model of the segment chip so switching sections reads as one
 * continuous motion. Labels never truncate: when a locale's labels outgrow the
 * width (phones) the strip scrolls and keeps the active tab in view.
 *
 * The measured container is the scroll *content* wrapper, so the indicator
 * scrolls with the tabs and needs no scroll compensation.
 */
export function AsnDetailTabs({
  tabs,
  value,
  onValueChange,
  label,
  locale,
  focusRequest = 0,
  children,
}: {
  tabs: DetailTab[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  locale: Locale;
  /** Bumped by callers that select a tab from elsewhere, to move focus to it. */
  focusRequest?: number;
  children: ReactNode;
}) {
  const { containerRef, view, canAnimate } = useSegmentHighlight(value);
  const previousValue = useRef(value);
  const handledFocus = useRef(focusRequest);

  // Keep the selected tab visible: horizontally in the scrolling strip, and
  // vertically when a summary shortcut selected it from further up the page.
  // Never on first render.
  useEffect(() => {
    if (previousValue.current === value) return;
    previousValue.current = value;
    activeTrigger(containerRef.current)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [value, containerRef]);

  useEffect(() => {
    if (handledFocus.current === focusRequest) return;
    handledFocus.current = focusRequest;
    activeTrigger(containerRef.current)?.focus();
  }, [focusRequest, containerRef]);

  return (
    // Radix defaults to LTR; follow the page so RTL locales get a mirrored
    // strip and arrow-key order.
    <Tabs value={value} onValueChange={onValueChange} dir={getLocaleDirection(locale)} className="gap-0">
      <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div ref={containerRef} className="relative w-max min-w-full">
          <span
            className="tool-tab-indicator"
            style={{
              bottom: 0,
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
            className="h-auto w-full min-w-max justify-start gap-1 rounded-none border-b border-border bg-transparent p-0"
          >
            {tabs.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className={cn(
                  "group h-auto min-h-11 flex-none scroll-mx-4 gap-2 rounded-none border-0 px-3 py-2 text-[13px] font-medium text-muted-foreground shadow-none transition-colors duration-200 ease-[var(--ease-smooth)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset focus-visible:outline-none sm:min-h-10",
                  "data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                  "dark:text-muted-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-foreground",
                  // Without a measured indicator (first paint, no JS) the
                  // active tab still needs a visible marker.
                  !view.visible && "data-[state=active]:underline data-[state=active]:underline-offset-8",
                )}
              >
                <span className="whitespace-nowrap">{item.label}</span>
                {typeof item.count === "number" && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-mono text-[11px] leading-none font-medium tabular-nums transition-colors",
                      item.tone === "warning"
                        ? "text-warning"
                        : "text-muted-foreground group-data-[state=active]:text-foreground",
                    )}
                  >
                    {item.tone === "warning" && <TriangleAlert className="size-3" aria-hidden />}
                    {formatNumber(item.count, locale)}
                    {item.countLabel && <span className="sr-only"> {item.countLabel}</span>}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>
      {/* Content settles in with the shared section reveal (fade + small lift
          on the soft-deceleration curve), continuous with the sliding bar. */}
      <div key={value} className="tool-section-reveal pt-5 sm:pt-6">
        {children}
      </div>
    </Tabs>
  );
}
