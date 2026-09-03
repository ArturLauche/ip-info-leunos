import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  INITIAL_SEGMENT_HIGHLIGHT,
  nextSegmentHighlight,
  type SegmentHighlightBox,
  type SegmentHighlightView,
} from "@/lib/segment-highlight";

function roundBox(box: SegmentHighlightBox): SegmentHighlightBox {
  return {
    x: Math.round(box.x),
    y: Math.round(box.y),
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
}

/**
 * Measures the active segmented-control item and returns a sliding-frame view.
 * Position comes from the DOM so wrapping (2×2 on small screens) and locale
 * labels cannot desync the indicator. Supports both Tabs (`data-state="active"`)
 * and ToggleGroup (`data-state="on"`) primitives.
 */
export function useSegmentHighlight(selected: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<SegmentHighlightView>(INITIAL_SEGMENT_HIGHLIGHT);
  const [view, setView] = useState<SegmentHighlightView>(INITIAL_SEGMENT_HIGHLIGHT);
  const [canAnimate, setCanAnimate] = useState(false);
  // Outline-style items (e.g. ToggleGroup) round only their outer corners, so
  // the travelling chip copies the active item's radius to sit exactly in frame.
  const [radius, setRadius] = useState("");

  const measure = useCallback(() => {
    const container = containerRef.current;
    const active = container?.querySelector<HTMLElement>(
      '[data-state="active"], [data-state="on"]',
    );
    let measured: SegmentHighlightBox | null = null;
    let measuredRadius = "";

    if (container && active && active.offsetWidth > 0) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      measured = roundBox({
        x: activeRect.left - containerRect.left,
        y: activeRect.top - containerRect.top,
        width: activeRect.width,
        height: activeRect.height,
      });
      measuredRadius = getComputedStyle(active).borderRadius;
    }

    const next = nextSegmentHighlight(viewRef.current, measured, canAnimate);
    viewRef.current = next;
    setView((previous) =>
      previous.box.x === next.box.x &&
      previous.box.y === next.box.y &&
      previous.box.width === next.box.width &&
      previous.box.height === next.box.height &&
      previous.visible === next.visible &&
      previous.slide === next.slide
        ? previous
        : next,
    );
    setRadius((previous) => (previous === measuredRadius ? previous : measuredRadius));
  }, [canAnimate]);

  useLayoutEffect(() => {
    measure();
  }, [measure, selected]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setCanAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    for (const item of container.querySelectorAll(
      '[data-slot="tabs-trigger"], [data-slot="toggle-group-item"]',
    )) {
      observer.observe(item);
    }

    return () => observer.disconnect();
  }, [measure]);

  return { containerRef, view, canAnimate, radius };
}
