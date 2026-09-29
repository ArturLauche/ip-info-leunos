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
 * The outgoing copy is removed when its exit animation ends or is cancelled;
 * the two bounds below only guard against neither event arriving. A busy main
 * thread can delay the first animation frame well past the route commit, so
 * the bound that follows the fade is armed by `animationstart`, not the commit.
 */

/** Margin past the nominal end of a fade that has started (a few frames). */
export const EXIT_FALLBACK_SLACK_MS = 200;

/**
 * Bound for a fade that exists but has not started. A fade CSS never creates
 * is detected directly (`getAnimations()`), so this only covers a document
 * that is not being rendered.
 */
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

/** Keyframes of the outgoing copy's fade; must match `app/globals.css`. */
export const EXIT_ANIMATION_NAME = "tool-page-exit";

export interface AnimationProbe {
  name: string;
  state: string;
}

/**
 * Whether the outgoing copy's fade is already known not to play, judged from
 * the animations read right after it is created. A healthy fade reports
 * `running`, even before its first frame. No animation at all, or a fade that
 * is paused or otherwise not running (a user stylesheet or extension),
 * dispatches no event that would end it. Only the animation named
 * EXIT_ANIMATION_NAME counts: if none carries it, the copy is left to the
 * animation events and the bounds above, so a stale name degrades to the event
 * path instead of dropping every fade.
 */
export function isExitFadeBlocked(
  animations: readonly AnimationProbe[],
): boolean {
  if (animations.length === 0) return true;
  const fades = animations.filter(
    (animation) => animation.name === EXIT_ANIMATION_NAME,
  );
  return fades.length > 0 && fades.every((fade) => fade.state !== "running");
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
