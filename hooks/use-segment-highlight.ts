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
 * labels cannot desync the indicator.
 */
export function useSegmentHighlight(selected: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<SegmentHighlightView>(INITIAL_SEGMENT_HIGHLIGHT);
  const [view, setView] = useState<SegmentHighlightView>(INITIAL_SEGMENT_HIGHLIGHT);
  const [canAnimate, setCanAnimate] = useState(false);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const active = container?.querySelector<HTMLElement>('[data-state="active"]');
    let measured: SegmentHighlightBox | null = null;

    if (container && active && active.offsetWidth > 0) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      measured = roundBox({
        x: activeRect.left - containerRect.left,
        y: activeRect.top - containerRect.top,
        width: activeRect.width,
        height: activeRect.height,
      });
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
    for (const item of container.querySelectorAll('[data-slot="tabs-trigger"]')) {
      observer.observe(item);
    }

    return () => observer.disconnect();
  }, [measure]);

  return { containerRef, view, canAnimate };
}
