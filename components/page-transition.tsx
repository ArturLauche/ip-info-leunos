"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";

import {
  exitScrollOffset,
  getExitDurationMs,
  shouldUseFallbackSnapshot,
  type PageTransitionEnvironment,
} from "@/lib/page-transition";
import { cn } from "@/lib/utils";

const PREPARE_EVENT = "tool-page-transition:prepare";
const PENDING_SNAPSHOT_TIMEOUT_MS = 2_000;
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

interface PrepareEventDetail {
  pathname: string;
}

const SNAPSHOT_SCROLL_TOP = "pageSnapshotScrollTop";
const SNAPSHOT_SCROLL_LEFT = "pageSnapshotScrollLeft";
const KEYFRAME_METADATA = new Set([
  "offset",
  "computedOffset",
  "easing",
  "composite",
]);

/** Prepares outgoing content for navigation that is not initiated by a Link. */
export function preparePageTransition(href: string): void {
  if (typeof document === "undefined") return;

  const pathname = new URL(href, window.location.href).pathname;
  document.dispatchEvent(
    new CustomEvent<PrepareEventDetail>(PREPARE_EVENT, {
      detail: { pathname },
    }),
  );
}

function readEnvironment(): PageTransitionEnvironment {
  return {
    viewportWidth: window.innerWidth,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

function toCssPropertyName(property: string): string {
  if (property.startsWith("--")) return property;
  return property.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
}

function activeAnimatedProperties(
  source: HTMLDivElement,
): Map<HTMLElement, Set<string>> {
  const propertiesByElement = new Map<HTMLElement, Set<string>>();

  source.getAnimations({ subtree: true }).forEach((animation) => {
    if (animation.playState === "idle" || animation.playState === "finished") {
      return;
    }

    const effect = animation.effect;
    if (!(effect instanceof KeyframeEffect)) return;
    const target = effect.target;
    if (!(target instanceof HTMLElement)) return;

    const properties = propertiesByElement.get(target) ?? new Set<string>();
    effect.getKeyframes().forEach((keyframe) => {
      Object.keys(keyframe).forEach((property) => {
        if (!KEYFRAME_METADATA.has(property)) properties.add(property);
      });
    });
    if (properties.size > 0) propertiesByElement.set(target, properties);
  });

  return propertiesByElement;
}

function cloneContent(source: HTMLDivElement): HTMLDivElement {
  const clone = source.cloneNode(true) as HTMLDivElement;
  clone.classList.add("tool-page-snapshot");
  clone.removeAttribute("data-phase");
  clone.setAttribute("aria-hidden", "true");
  clone.inert = true;
  clone.dataset.scrollBefore = String(window.scrollY);
  clone.style.height = `${source.getBoundingClientRect().height}px`;

  // The visual copy is hidden from accessibility APIs and must not duplicate
  // document targets such as #main-content while it overlaps the live route.
  clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));

  // cloneNode copies attributes, not the live state of form controls.
  const sourceControls = source.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");
  const cloneControls = clone.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");
  sourceControls.forEach((control, index) => {
    const copy = cloneControls[index];
    if (!copy) return;
    copy.value = control.value;
    if (
      copy instanceof HTMLInputElement &&
      control instanceof HTMLInputElement
    ) {
      copy.checked = control.checked;
    }
  });

  // Preserve live state that cloneNode does not carry. Scroll offsets are
  // restored after mounting, while in-flight animation values are fixed as
  // inline styles before clone animations are disabled by the snapshot CSS.
  const animatedProperties = activeAnimatedProperties(source);
  const sourceElements = [
    source,
    ...Array.from(source.querySelectorAll("*")).filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    ),
  ];
  const cloneElements = [
    clone,
    ...Array.from(clone.querySelectorAll("*")).filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    ),
  ];
  sourceElements.forEach((element, index) => {
    const copy = cloneElements[index];
    if (!copy) return;
    if (element.scrollTop !== 0) {
      copy.dataset[SNAPSHOT_SCROLL_TOP] = String(element.scrollTop);
    }
    if (element.scrollLeft !== 0) {
      copy.dataset[SNAPSHOT_SCROLL_LEFT] = String(element.scrollLeft);
    }

    const properties = animatedProperties.get(element);
    if (!properties) return;
    const computedStyle = getComputedStyle(element);
    properties.forEach((property) => {
      const cssProperty = toCssPropertyName(property);
      const value = computedStyle.getPropertyValue(cssProperty);
      if (value) copy.style.setProperty(cssProperty, value);
    });
  });

  return clone;
}

function restoreSnapshotScroll(snapshot: HTMLDivElement): void {
  const scrolledElements = [
    snapshot,
    ...snapshot.querySelectorAll<HTMLElement>(
      "[data-page-snapshot-scroll-top], [data-page-snapshot-scroll-left]",
    ),
  ];

  scrolledElements.forEach((element) => {
    const scrollTop = element.dataset[SNAPSHOT_SCROLL_TOP];
    const scrollLeft = element.dataset[SNAPSHOT_SCROLL_LEFT];
    if (scrollTop !== undefined) element.scrollTop = Number(scrollTop);
    if (scrollLeft !== undefined) element.scrollLeft = Number(scrollLeft);
    delete element.dataset[SNAPSHOT_SCROLL_TOP];
    delete element.dataset[SNAPSHOT_SCROLL_LEFT];
  });
}

function mountSnapshot(
  layer: HTMLDivElement,
  snapshot: HTMLDivElement,
): void {
  layer.replaceChildren(snapshot);
  restoreSnapshotScroll(snapshot);
}

function startSnapshotExit(snapshot: HTMLDivElement, duration: number): void {
  snapshot.style.setProperty("--page-exit-duration", `${duration}ms`);
  snapshot.dataset.phase = "exiting";
}

/**
 * Persistent route-content boundary. Navigation preflights capture a visual,
 * inert DOM copy of the current page before the App Router replaces it. The
 * copy then exits above the newly mounted route while its existing staged
 * header/panel/footer entrance runs underneath.
 *
 * A detached fallback snapshot is refreshed after commits so browser history
 * and direct router changes still get continuity even without a click event.
 * Search-param changes keep the same pathname key, so checker state and live
 * server children update without replaying the page transition.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const currentRef = useRef<HTMLDivElement>(null);
  const snapshotLayerRef = useRef<HTMLDivElement>(null);
  const committedPathname = useRef(pathname);
  const pendingSnapshot = useRef<HTMLDivElement | null>(null);
  const fallbackSnapshot = useRef<HTMLDivElement | null>(null);
  const expiredPreflightPathname = useRef<string | null>(null);
  const pendingTimer = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);
  const holdFrame = useRef<number | null>(null);

  const cancelAnimation = useCallback(() => {
    if (exitTimer.current !== null) {
      window.clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
    if (holdFrame.current !== null) {
      cancelAnimationFrame(holdFrame.current);
      holdFrame.current = null;
    }
  }, []);

  const removeSnapshot = useCallback((snapshot: HTMLDivElement) => {
    if (snapshot.parentElement === snapshotLayerRef.current) {
      snapshot.remove();
    }
    if (pendingSnapshot.current === snapshot) {
      pendingSnapshot.current = null;
    }
  }, []);

  const captureSnapshot = useCallback(
    (nextPathname: string) => {
      if (nextPathname === committedPathname.current) return;

      const source = currentRef.current;
      const layer = snapshotLayerRef.current;
      if (!source || !layer) return;

      cancelAnimation();
      if (pendingTimer.current !== null) {
        window.clearTimeout(pendingTimer.current);
      }

      const snapshot = cloneContent(source);
      mountSnapshot(layer, snapshot);
      pendingSnapshot.current = snapshot;
      expiredPreflightPathname.current = null;

      // A cancelled or failed navigation must not leave a stale visual copy
      // covering later client-side updates indefinitely.
      pendingTimer.current = window.setTimeout(() => {
        expiredPreflightPathname.current = nextPathname;
        removeSnapshot(snapshot);
        pendingTimer.current = null;
      }, PENDING_SNAPSHOT_TIMEOUT_MS);
    },
    [cancelAnimation, removeSnapshot],
  );

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      const anchor =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (
        !anchor ||
        anchor.download ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin === window.location.origin) {
        captureSnapshot(url.pathname);
      }
    };

    const onPrepare = (event: Event) => {
      const detail = (event as CustomEvent<PrepareEventDetail>).detail;
      if (detail?.pathname) captureSnapshot(detail.pathname);
    };

    const onPopState = () => captureSnapshot(window.location.pathname);

    document.addEventListener("click", onDocumentClick, true);
    document.addEventListener(PREPARE_EVENT, onPrepare);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      document.removeEventListener(PREPARE_EVENT, onPrepare);
      window.removeEventListener("popstate", onPopState);
    };
  }, [captureSnapshot]);

  useIsomorphicLayoutEffect(() => {
    if (committedPathname.current === pathname) return;

    cancelAnimation();
    const layer = snapshotLayerRef.current;
    const snapshot =
      pendingSnapshot.current ??
      (shouldUseFallbackSnapshot(pathname, expiredPreflightPathname.current)
        ? fallbackSnapshot.current
        : null);
    committedPathname.current = pathname;
    expiredPreflightPathname.current = null;

    if (pendingTimer.current !== null) {
      window.clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
    if (!layer || !snapshot) return;

    if (snapshot.parentElement !== layer) {
      mountSnapshot(layer, snapshot);
    }
    pendingSnapshot.current = null;

    const duration = getExitDurationMs(readEnvironment());
    if (duration === 0) {
      removeSnapshot(snapshot);
      return;
    }

    startSnapshotExit(snapshot, duration);

    const scrollBefore = Number(snapshot.dataset.scrollBefore || window.scrollY);
    let applied: number | null = null;
    const holdPosition = () => {
      const offset = exitScrollOffset(scrollBefore, window.scrollY);
      if (offset !== applied) {
        applied = offset;
        snapshot.style.setProperty("--page-exit-offset", `${offset}px`);
      }
      holdFrame.current = requestAnimationFrame(holdPosition);
    };
    holdPosition();

    exitTimer.current = window.setTimeout(() => {
      cancelAnimation();
      removeSnapshot(snapshot);
    }, duration);
  }, [cancelAnimation, pathname, removeSnapshot]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const current = currentRef.current;
      if (current && committedPathname.current === pathname) {
        fallbackSnapshot.current = cloneContent(current);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [children, pathname]);

  useEffect(
    () => () => {
      cancelAnimation();
      if (pendingTimer.current !== null) {
        window.clearTimeout(pendingTimer.current);
      }
    },
    [cancelAnimation],
  );

  return (
    <div
      className={cn(
        "tool-page-transition isolate min-w-0 overflow-x-clip",
        className,
      )}
    >
      <div
        ref={snapshotLayerRef}
        className="tool-page-snapshot-layer"
        aria-hidden="true"
        inert
      />
      <div
        key={pathname}
        ref={currentRef}
        className="tool-page-current flex min-w-0 flex-1 flex-col"
        data-phase="entering"
      >
        {children}
      </div>
    </div>
  );
}
