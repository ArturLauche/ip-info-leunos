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
  EXIT_ANIMATION_NAME,
  PENDING_SNAPSHOT_MAX_AGE_MS,
  REVEAL_ANIMATION_NAME,
  getExitDurationMs,
  getTransitionFallbackMs,
  getRevealDurationMs,
  isExitFadeBlocked,
  isPendingSnapshotFresh,
  normalizePathname,
  shouldCaptureSnapshot,
  snapshotPlacement,
  type PageTransitionEnvironment,
} from "@/lib/page-transition";
import { cn } from "@/lib/utils";

const PREPARE_EVENT = "tool-page-transition:prepare";
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

interface PrepareEventDetail {
  pathname: string;
}

interface PendingSnapshot {
  node: HTMLDivElement;
  pathname: string;
  capturedAt: number;
}

interface ActiveTransition {
  finish: () => void;
}

const SNAPSHOT_SCROLL_TOP = "pageSnapshotScrollTop";
const SNAPSHOT_SCROLL_LEFT = "pageSnapshotScrollLeft";

/** Prepares outgoing content for navigation that is not initiated by a Link. */
export function preparePageTransition(href: string): void {
  if (typeof document === "undefined") return;

  let pathname: string;
  try {
    pathname = new URL(href, window.location.href).pathname;
  } catch {
    return;
  }

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

/**
 * Builds the inert visual copy of the page that is leaving.
 *
 * The copy is anchored to the viewport, not to the document, so a navigation
 * that resets or restores scroll cannot move it. It carries no background of
 * its own: the opaque cover under it is the page canvas, so fading the copy
 * dissolves its content into that canvas instead of revealing the new route.
 *
 * Only live state that `cloneNode` does not carry — form control values and
 * nested scroll offsets — is copied. In-flight animations are intentionally
 * not frozen: the snapshot stylesheet disables all animation inside the copy,
 * so the clone shows the settled layout instead of a half-finished sheen.
 */
function cloneContent(source: HTMLDivElement): HTMLDivElement | null {
  const rect = source.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const placement = snapshotPlacement(rect);
  const clone = source.cloneNode(true) as HTMLDivElement;

  clone.classList.remove("tool-page-current");
  clone.classList.add("tool-page-snapshot");
  clone.removeAttribute("data-phase");
  clone.setAttribute("aria-hidden", "true");
  clone.inert = true;
  clone.style.left = `${placement.left}px`;
  clone.style.width = `${placement.width}px`;
  clone.style.minHeight = `${rect.height}px`;
  clone.style.setProperty("--page-snapshot-y", `${placement.offsetY}px`);

  // The visual copy is hidden from accessibility APIs and must not duplicate
  // document targets such as #main-content while it overlaps the live route.
  clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));

  // `inert` handles modern engines; removing tab stops keeps the copy out of
  // keyboard order even where inert is unsupported.
  clone
    .querySelectorAll<HTMLElement>(
      "a[href], button, input, select, textarea, [tabindex], [contenteditable]",
    )
    .forEach((node) => {
      node.tabIndex = -1;
    });

  // cloneNode copies attributes, not the live state of form controls.
  const sourceControls = source.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");
  const cloneControls = clone.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");
  const controlCount = Math.min(sourceControls.length, cloneControls.length);
  for (let index = 0; index < controlCount; index += 1) {
    const control = sourceControls[index];
    const copy = cloneControls[index];
    if (!control || !copy) continue;
    if (control instanceof HTMLInputElement && control.type === "file") continue;
    copy.value = control.value;
    if (control instanceof HTMLInputElement && copy instanceof HTMLInputElement) {
      copy.checked = control.checked;
      copy.indeterminate = control.indeterminate;
    }
  }

  // A detached subtree has no layout, so nested scroll offsets are recorded on
  // the copy and restored once it is mounted. One pass over both trees.
  const sourceElements = source.querySelectorAll<HTMLElement>("*");
  const cloneElements = clone.querySelectorAll<HTMLElement>("*");
  const elementCount = Math.min(sourceElements.length, cloneElements.length);
  for (let index = 0; index < elementCount; index += 1) {
    const element = sourceElements[index];
    const copy = cloneElements[index];
    if (!element || !copy) continue;
    if (element.scrollTop !== 0) {
      copy.dataset[SNAPSHOT_SCROLL_TOP] = String(element.scrollTop);
    }
    if (element.scrollLeft !== 0) {
      copy.dataset[SNAPSHOT_SCROLL_LEFT] = String(element.scrollLeft);
    }
  }

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

function findAnimation(node: HTMLElement, name: string): Animation | undefined {
  if (typeof node.getAnimations !== "function") return undefined;
  return node.getAnimations().find((animation) => {
    return (animation as CSSAnimation).animationName === name;
  });
}

/**
 * Persistent route-content boundary.
 *
 * A same-origin pathname change captures one detached, inert copy of the page
 * just before the App Router replaces it. At commit the copy is mounted in a
 * fixed, clipped layer below the shell chrome, above an opaque page-colored
 * cover. The copy's content dissolves into the cover (100–115 ms) while the
 * incoming route is already mounted underneath; the cover then lifts and the
 * new page fades in from the background (240–260 ms). The two page layouts are
 * never visible at once, so there is no double exposure, and the incoming
 * route needs no animated layer of its own.
 *
 * Search-parameter and hash-only updates keep the same pathname and never
 * capture or replay a transition. The copy is detached until the commit, so an
 * aborted, failed or slow navigation can never leave a frozen page covering
 * the app. It is dropped after PENDING_SNAPSHOT_MAX_AGE_MS.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const currentRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const committedPathname = useRef(pathname);
  const pendingSnapshot = useRef<PendingSnapshot | null>(null);
  const pendingTimer = useRef<number | null>(null);
  const activeTransition = useRef<ActiveTransition | null>(null);

  const clearPendingTimer = useCallback(() => {
    if (pendingTimer.current !== null) {
      window.clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
  }, []);

  const dropPendingSnapshot = useCallback(() => {
    clearPendingTimer();
    pendingSnapshot.current = null;
  }, [clearPendingTimer]);

  const resetLayer = useCallback(() => {
    const layer = layerRef.current;
    const cover = coverRef.current;
    const slot = slotRef.current;
    if (layer) {
      // Remove a superseded copy or stale node appended outside the slot while
      // leaving the React-owned cover and slot in place.
      for (const child of Array.from(layer.children)) {
        if (child !== cover && child !== slot) child.remove();
      }
    }
    slot?.replaceChildren();
    cover?.removeAttribute("data-phase");
    cover?.style.removeProperty("--page-reveal-duration");
    if (layer) delete layer.dataset.active;
  }, []);

  const finishActiveTransition = useCallback(() => {
    activeTransition.current?.finish();
  }, []);

  const capturePathname = useCallback(
    (nextPathname: string) => {
      if (typeof window === "undefined") return;

      const environment = readEnvironment();
      if (
        !shouldCaptureSnapshot(
          committedPathname.current,
          nextPathname,
          environment,
        )
      ) {
        // Same-route (search/hash) navigation keeps the current page mounted,
        // so any copy captured for an earlier, superseded navigation is stale.
        dropPendingSnapshot();
        return;
      }

      const source = currentRef.current;
      if (!source) return;

      const capturedAt = performance.now();
      const node = cloneContent(source);
      if (!node) return;

      dropPendingSnapshot();
      pendingSnapshot.current = { node, pathname: nextPathname, capturedAt };
      // Bound retained DOM even when a navigation never commits (prevented
      // link, cancelled click, failed route resolution).
      pendingTimer.current = window.setTimeout(() => {
        pendingSnapshot.current = null;
        pendingTimer.current = null;
      }, PENDING_SNAPSHOT_MAX_AGE_MS);
    },
    [dropPendingSnapshot],
  );

  const startTransition = useCallback(
    (snapshot: HTMLDivElement) => {
      const layer = layerRef.current;
      const cover = coverRef.current;
      if (!layer || !cover) return;

      const environment = readEnvironment();
      const exitDuration = getExitDurationMs(environment);
      const revealDuration = getRevealDurationMs(environment);
      if (exitDuration === 0 || revealDuration === 0) {
        resetLayer();
        return;
      }

      layer.dataset.active = "true";
      snapshot.style.setProperty("--page-exit-duration", `${exitDuration}ms`);
      snapshot.dataset.phase = "exiting";
      cover.style.setProperty("--page-reveal-duration", `${revealDuration}ms`);
      cover.dataset.phase = "revealing";

      // getAnimations() resolves style first. A fade CSS does not run (a user
      // stylesheet or extension that disables or pauses animations) never
      // settles, so the layer is removed now instead of covering the new route.
      const exitFade = findAnimation(snapshot, EXIT_ANIMATION_NAME);
      if (
        !exitFade ||
        isExitFadeBlocked([
          { name: EXIT_ANIMATION_NAME, state: exitFade.playState },
        ])
      ) {
        resetLayer();
        return;
      }
      const reveal = findAnimation(cover, REVEAL_ANIMATION_NAME);

      let settled = false;
      let timer: number | null = null;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (timer !== null) window.clearTimeout(timer);
        // Removing the nodes cancels the animations; cancel explicitly first so
        // cleanup does not depend on paint timing.
        try {
          exitFade.cancel();
          reveal?.cancel();
        } catch {
          /* already detached */
        }
        resetLayer();
        if (activeTransition.current?.finish === finish) {
          activeTransition.current = null;
        }
      };

      timer = window.setTimeout(
        finish,
        Math.max(getTransitionFallbackMs(exitDuration), getTransitionFallbackMs(revealDuration)),
      );
      activeTransition.current = { finish };

      const animations = [exitFade, reveal].filter(
        (animation): animation is Animation => Boolean(animation),
      );
      Promise.all(animations.map((animation) => animation.finished)).then(
        finish,
        finish,
      );
    },
    [resetLayer],
  );

  useIsomorphicLayoutEffect(() => {
    if (
      normalizePathname(committedPathname.current) ===
      normalizePathname(pathname)
    ) {
      return;
    }

    committedPathname.current = pathname;

    const candidate = pendingSnapshot.current;
    pendingSnapshot.current = null;
    clearPendingTimer();

    finishActiveTransition();
    resetLayer();

    if (!candidate) return;
    if (!isPendingSnapshotFresh(candidate.capturedAt, performance.now())) return;
    if (
      normalizePathname(candidate.pathname) !== normalizePathname(pathname)
    ) {
      return;
    }
    if (readEnvironment().reducedMotion) return;

    slotRef.current?.append(candidate.node);
    restoreSnapshotScroll(candidate.node);
    startTransition(candidate.node);
  }, [
    clearPendingTimer,
    finishActiveTransition,
    pathname,
    resetLayer,
    startTransition,
  ]);

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
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      const anchorTarget = anchor.getAttribute("target");
      if (anchorTarget && anchorTarget !== "_self") return;
      if (anchor.rel.split(/\s+/).includes("external")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.protocol !== "http:" && url.protocol !== "https:") return;

      capturePathname(url.pathname);
    };

    const onPrepare = (event: Event) => {
      const detail = (event as CustomEvent<PrepareEventDetail>).detail;
      if (detail?.pathname) capturePathname(detail.pathname);
    };

    // history.back()/forward() fire popstate before the App Router commits, so
    // the DOM still shows the outgoing page here.
    const onPopState = () => {
      const nextPathname = window.location.pathname;
      if (
        normalizePathname(nextPathname) ===
        normalizePathname(committedPathname.current)
      ) {
        return;
      }
      capturePathname(nextPathname);
    };

    document.addEventListener("click", onDocumentClick, true);
    document.addEventListener(PREPARE_EVENT, onPrepare);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      document.removeEventListener(PREPARE_EVENT, onPrepare);
      window.removeEventListener("popstate", onPopState);
    };
  }, [capturePathname]);

  // A preference change mid-transition must resolve immediately; this listener
  // also drops the copy without waiting for animation events.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (!query.matches) return;
      dropPendingSnapshot();
      finishActiveTransition();
      resetLayer();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [dropPendingSnapshot, finishActiveTransition, resetLayer]);

  useEffect(
    () => () => {
      dropPendingSnapshot();
      finishActiveTransition();
    },
    [dropPendingSnapshot, finishActiveTransition],
  );

  return (
    <div className={cn("tool-page-transition isolate min-w-0", className)}>
      <div
        ref={layerRef}
        className="tool-page-snapshot-layer"
        aria-hidden="true"
        inert
      >
        <div ref={coverRef} className="tool-page-cover" />
        <div ref={slotRef} className="tool-page-snapshot-slot" />
      </div>
      <div
        key={pathname}
        ref={currentRef}
        className="tool-page-current flex min-w-0 flex-1 flex-col"
      >
        {children}
      </div>
    </div>
  );
}
