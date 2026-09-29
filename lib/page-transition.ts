/**
 * Timing for the shared page-transition lifecycle.
 *
 * This module deliberately has no DOM access so the timing and scroll rules
 * can be tested in Vitest's Node environment. The component publishes the
 * selected duration as a CSS custom property so the exit animation and its
 * fallback timer share one source; the outgoing copy is removed when that
 * animation ends (see EXIT_FALLBACK_SLACK_MS).
 */

/** Matches the `lg` breakpoint used to switch between mobile and desktop chrome. */
export const MOBILE_BREAKPOINT_PX = 1024;

/** The outgoing page leaves quickly; mobile gets a little more time and travel. */
export const EXIT_DURATION_DESKTOP_MS = 120;
export const EXIT_DURATION_MOBILE_MS = 150;

/**
 * The outgoing copy is removed when its exit animation ends or is cancelled.
 * These bounds only guard against neither event being delivered. A busy main
 * thread can delay the first animation frame well past the route commit, so a
 * timer started at commit would cut the fade short: the tighter bound is armed
 * by `animationstart`, and the looser one only covers an exit that never
 * starts.
 */
export const EXIT_FALLBACK_SLACK_MS = 200;
export const EXIT_START_TIMEOUT_MS = 3_000;

export interface PageTransitionEnvironment {
  viewportWidth: number;
  reducedMotion: boolean;
}

export function getExitDurationMs(
  environment: PageTransitionEnvironment,
): number {
  if (environment.reducedMotion) return 0;

  return environment.viewportWidth < MOBILE_BREAKPOINT_PX
    ? EXIT_DURATION_MOBILE_MS
    : EXIT_DURATION_DESKTOP_MS;
}

export function getExitFallbackMs(exitDurationMs: number): number {
  return exitDurationMs + EXIT_FALLBACK_SLACK_MS;
}

/**
 * Keeps retained outgoing content visually anchored while Next.js resets or
 * restores the document scroll position for a navigation.
 */
export function exitScrollOffset(
  scrollBefore: number,
  scrollAfter: number,
): number {
  const offset = scrollAfter - scrollBefore;
  return Math.abs(offset) < 1 ? 0 : Math.round(offset);
}

/**
 * A timed-out preflight deliberately removes its visual copy. If that exact
 * navigation eventually commits, using the detached fallback would revive an
 * older view of the route and cause a flash over the incoming page.
 */
export function shouldUseFallbackSnapshot(
  nextPathname: string,
  expiredPreflightPathname: string | null,
): boolean {
  return nextPathname !== expiredPreflightPathname;
}
