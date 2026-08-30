/**
 * Timing for the shared page-transition lifecycle.
 *
 * This module deliberately has no DOM access so the timing and scroll rules
 * can be tested in Vitest's Node environment. The component publishes the
 * selected duration as a CSS custom property, keeping its swap timer and the
 * matching animation in lockstep.
 */

/** Matches the `lg` breakpoint used to switch between mobile and desktop chrome. */
export const MOBILE_BREAKPOINT_PX = 1024;

/** The outgoing page leaves quickly; mobile gets a little more time and travel. */
export const EXIT_DURATION_DESKTOP_MS = 120;
export const EXIT_DURATION_MOBILE_MS = 150;

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
