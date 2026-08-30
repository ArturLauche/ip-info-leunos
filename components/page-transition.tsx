"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  exitScrollOffset,
  getExitDurationMs,
  type PageTransitionEnvironment,
} from "@/lib/page-transition";

/**
 * Layout effects are what let the exit mask the router's scroll move before the
 * browser paints, but they do not run during server rendering — falling back to
 * a passive effect keeps SSR quiet without changing client behaviour.
 */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/** Reads the parts of the environment that decide the exit duration. */
function readEnvironment(): PageTransitionEnvironment {
  if (typeof window === "undefined") {
    return { viewportWidth: Number.POSITIVE_INFINITY, reducedMotion: false };
  }

  return {
    viewportWidth: window.innerWidth,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

/**
 * Wraps the changing page content and gives it a real transition lifecycle:
 * the outgoing route stays on screen and animates out before the incoming route
 * is swapped in and staged back in by the rules in `globals.css`.
 *
 * This has to live in the app shell rather than in a page-level component: the
 * App Router wraps every route segment in a fragment keyed by the segment, so
 * any component inside the page is remounted on navigation and would lose the
 * state the exit phase depends on. Mounted around `{children}` in `AppShell`
 * (which never remounts) it can hold the outgoing tree in place.
 *
 * Because the wrapper element itself persists, only the page content inside it
 * is replaced — the sidebar and mobile top bar around it stay visually stable.
 *
 * Holding the outgoing tree does expose one thing: the App Router resets the
 * scroll position when the navigation commits. Two guards cover it:
 *
 * 1. The router's own scroll handler sits below this component in the tree, so
 *    it runs first and the scroll position is already reset by the time any
 *    effect here can read it. The last position the `scroll` listener saw is
 *    therefore the only surviving record of where the page was, and it is what
 *    the exit animation is offset against (see `exitScrollOffset`) — for a
 *    scroll-to-top and for a restored back/forward position alike.
 * 2. That offset is re-measured every frame until the swap, because the reset
 *    is not always a single jump. Whatever it does, the outgoing page tracks it
 *    and holds still, and the only movement left is the intended lift.
 * 3. When there is no scroll move at all the offset stays at zero, the guard is
 *    a no-op, and the scroll lands while the content is transparent.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();

  const [rendered, setRendered] = useState(() => ({ pathname, children }));
  const containerRef = useRef<HTMLDivElement>(null);
  const exitTimer = useRef<number | null>(null);
  const holdFrame = useRef<number | null>(null);

  // The newest tree, kept outside state: the layout effect below decides when
  // it becomes visible, and a pending swap must pick up the latest route even
  // if navigation moved on while the outgoing page was still leaving.
  const latest = useRef({ pathname, children });
  useIsomorphicLayoutEffect(() => {
    latest.current = { pathname, children };
  });

  const isStale = rendered.pathname !== pathname;

  /*
   * The router's scroll handler sits *below* this component in the tree, so it
   * runs first and the scroll position is already reset by the time any effect
   * here runs. Scroll events are dispatched asynchronously, though, so the last
   * position this listener saw is still where the page was when navigation
   * started — the only place the outgoing page's true offset survives.
   */
  const scrollBeforeNavigation = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      scrollBeforeNavigation.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cancelExit = useRef(() => {
    if (exitTimer.current !== null) {
      window.clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
    if (holdFrame.current !== null) {
      cancelAnimationFrame(holdFrame.current);
      holdFrame.current = null;
    }
  });

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;

    // Back on the rendered route (e.g. A -> B -> A): drop the pending exit so
    // the page can never be left faded out.
    if (!isStale) {
      cancelExit.current();
      container?.style.removeProperty("--page-exit-offset");
      return;
    }

    // Already leaving. The pending swap reads `latest` when it fires, so rapid
    // navigation must not push the deadline further out and leave the page
    // sitting at zero opacity.
    if (exitTimer.current !== null) return;

    const duration = getExitDurationMs(readEnvironment());

    const swap = () => {
      exitTimer.current = null;
      setRendered({
        pathname: latest.current.pathname,
        children: latest.current.children,
      });
    };

    if (duration === 0) {
      swap();
      return;
    }

    const scrollBefore = scrollBeforeNavigation.current;

    // Publish the duration so the CSS animation and the swap timer cannot
    // drift apart.
    container?.style.setProperty("--page-exit-duration", `${duration}ms`);

    /*
     * Hold the outgoing page still: every frame, shift it by exactly how far
     * the router has moved the scroll position so far, so `scrollY - translateY`
     * (where the content sits in the viewport) stays put.
     *
     * Re-measuring each frame rather than once is the point. The reset is not
     * always a single jump — it can be animated or land across two frames — and
     * a one-shot measurement would pick a mid-flight value and paint the page
     * a few pixels off. Tracking it means the offset settles the moment the
     * scroll does, and the only movement left is the intended lift.
     */
    let applied: number | null = null;
    const hold = () => {
      const offset = exitScrollOffset(scrollBefore, window.scrollY);
      if (offset !== applied) {
        applied = offset;
        container?.style.setProperty("--page-exit-offset", `${offset}px`);
      }
      holdFrame.current = requestAnimationFrame(hold);
    };
    hold();

    exitTimer.current = window.setTimeout(swap, duration);
  }, [isStale, pathname, rendered.pathname]);

  useIsomorphicLayoutEffect(() => cancelExit.current, []);

  return (
    <div
      ref={containerRef}
      data-phase={isStale ? "exiting" : "entering"}
      className={cn("tool-page-transition", className)}
    >
      {rendered.children}
    </div>
  );
}
