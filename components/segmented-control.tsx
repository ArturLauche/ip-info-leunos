"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";
import { cn } from "@/lib/utils";

/**
 * Shared sliding-indicator segmented control (ToggleGroup variant).
 * Extracted from the duplicated DNS type filter / ping mode tab sliders so
 * all single-select chip rows share one measured highlight implementation.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  mono = true,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  mono?: boolean;
}) {
  const { containerRef, view, canAnimate, radius } = useSegmentHighlight(value);

  return (
    <div ref={containerRef} className="relative isolate w-fit max-w-full">
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
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => next && onChange(next)}
        variant="outline"
        size="default"
        className="relative z-10 flex-wrap gap-0 border-0 bg-transparent p-0 shadow-none"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className={cn(
              "relative z-10 transition-[color,background-color,box-shadow,border-color] duration-200 ease-[var(--ease-smooth)]",
              mono && "font-mono",
              view.visible &&
                "data-[state=on]:border-transparent data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:shadow-none",
            )}
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
