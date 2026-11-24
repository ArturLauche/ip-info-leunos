import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  INITIAL_NAV_HIGHLIGHT,
  nextNavHighlight,
  type NavHighlightView,
} from "./nav-highlight";
import type { ToolKey } from "./nav-config";

/**
 * Measures the active row in a nav group and returns a sliding-frame view.
 * Position comes from the DOM so item height, gap, and locale labels cannot
 * desync the indicator the way a hardcoded rem offset can.
 *
 * Only a deliberate selection change slides; a viewport resize, locale swap or
 * list mutation re-measures and snaps, so the frame follows the row instead of
 * drifting after it.
 */
export function useNavHighlight(selected: ToolKey | undefined) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<ToolKey, HTMLAnchorElement>());
  const viewRef = useRef<NavHighlightView>(INITIAL_NAV_HIGHLIGHT);
  const [view, setView] = useState<NavHighlightView>(INITIAL_NAV_HIGHLIGHT);
  const [canAnimate, setCanAnimate] = useState(false);
  const canAnimateRef = useRef(false);

  const setItemRef = useCallback(
    (key: ToolKey, node: HTMLAnchorElement | null) => {
      if (node) {
        itemRefs.current.set(key, node);
      } else {
        itemRefs.current.delete(key);
      }
    },
    [],
  );

  const measure = useCallback(
    (fromSelection: boolean) => {
      const item = selected ? itemRefs.current.get(selected) : undefined;
      const measured =
        item && item.offsetHeight > 0
          ? { y: item.offsetTop, height: item.offsetHeight }
          : null;
      const next = nextNavHighlight(
        viewRef.current,
        measured,
        canAnimateRef.current && fromSelection,
      );
      viewRef.current = next;
      setView((previous) =>
        previous.box.y === next.box.y &&
        previous.box.height === next.box.height &&
        previous.visible === next.visible &&
        previous.slide === next.slide
          ? previous
          : next,
      );
    },
    [selected],
  );

  useLayoutEffect(() => {
    measure(true);
  }, [measure]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      canAnimateRef.current = true;
      setCanAnimate(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(() => measure(false));
    observer.observe(list);
    for (const item of itemRefs.current.values()) {
      observer.observe(item);
    }

    return () => observer.disconnect();
  }, [measure]);

  return { listRef, setItemRef, view, canAnimate };
}
