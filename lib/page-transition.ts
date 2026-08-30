/**
 * Timing for the shared page-transition lifecycle.
 *
 * Kept free of DOM access so the rules can be unit-tested without a browser —
 * the component measures the environment and passes it in. Values mirror the
 * `--page-exit-*` custom properties in `app/globals.css`; the component pushes
 * the duration onto the element so CSS and the swap timer cannot drift apart.
 */

/**
 * Below this width the app renders the mobile top bar + navigation sheet
 * instead of the fixed sidebar (matches the `lg` breakpoint used by the shell).
 */
export const MOBILE_BREAKPOINT_PX = 1024;

/** How long the outgoing page is given to leave. */
export const EXIT_DURATION_DESKTOP_MS = 120;
export const EXIT_DURATION_MOBILE_MS = 150;

export interface PageTransitionEnvironment {
  viewportWidth: number;
  reducedMotion: boolean;
}

/**
 * Desktop stays quick and subtle; mobile gets slightly more time so the extra
 * travel reads as fluid rather than abrupt. Reduced motion swaps immediately.
 */
export function getExitDurationMs(environment: PageTransitionEnvironment): number {
  if (environment.reducedMotion) return 0;

  return environment.viewportWidth < MOBILE_BREAKPOINT_PX
    ? EXIT_DURATION_MOBILE_MS
    : EXIT_DURATION_DESKTOP_MS;
}

/**
 * Vertical shift that keeps the outgoing page visually still while the router
 * moves the scroll position underneath it.
 *
 * The App Router resets (or restores) `scrollY` in the same commit that swaps
 * the route, so holding the outgoing tree for the exit would otherwise show the
 * old page lurching to a new offset. Content that sat at document row `p` was
 * drawn at `p - scrollBefore`; after the router moves the viewport to
 * `scrollAfter`, translating the container by `scrollAfter - scrollBefore`
 * restores exactly that framing.
 */
export function exitScrollOffset(scrollBefore: number, scrollAfter: number): number {
  const offset = scrollAfter - scrollBefore;
  return Math.abs(offset) < 1 ? 0 : Math.round(offset);
}
