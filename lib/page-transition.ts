/**
 * Timing, eligibility and geometry for the shared page transition.
 *
 * This module deliberately has no DOM access so the rules can be tested in
 * Vitest's Node environment. The component keeps the CSS custom properties in
 * `app/globals.css` and the values below in sync; the tests assert that.
 *
 * The transition is a fade *through* the shared page background, not a
 * cross-fade between two page states. The outgoing copy dissolves into an
 * opaque page-colored cover while the incoming route is already mounted and
 * interactive underneath; the cover then lifts and the new page fades in from
 * the same background. Two different page layouts are therefore never visible
 * at the same time, which removes the double-exposure ghost of a cross-fade,
 * and the incoming route never needs a full-page animated layer of its own.
 */

/** Matches the `lg` breakpoint used to switch between mobile and desktop chrome. */
export const MOBILE_BREAKPOINT_PX = 1024;

/** Outgoing content: dissolves into the page background. */
export const EXIT_DURATION_DESKTOP_MS = 100;
export const EXIT_DURATION_MOBILE_MS = 115;

/**
 * Cover reveal: holds the background until the outgoing content is gone, then
 * fades to the established incoming page. This is the visible incoming phase.
 */
export const REVEAL_DURATION_DESKTOP_MS = 200;
export const REVEAL_DURATION_MOBILE_MS = 220;

/**
 * The layer is removed when its longest animation finishes. This bound only
 * guards against an animation that never resolves (a paused animation created
 * by a user stylesheet or an extension); it is a safety net, not the normal
 * path.
 */
export const TRANSITION_FALLBACK_SLACK_MS = 180;

/**
 * A snapshot captured before navigation is only used while it still describes
 * what the visitor is looking at. A route that takes longer than this to
 * resolve has already shown its old page for long enough; fading a frozen copy
 * afterwards would show stale form values and stale results.
 */
export const PENDING_SNAPSHOT_MAX_AGE_MS = 600;

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

export function getRevealDurationMs(
  environment: PageTransitionEnvironment,
): number {
  if (environment.reducedMotion) return 0;

  return environment.viewportWidth < MOBILE_BREAKPOINT_PX
    ? REVEAL_DURATION_MOBILE_MS
    : REVEAL_DURATION_DESKTOP_MS;
}

export function getTransitionFallbackMs(durationMs: number): number {
  return durationMs + TRANSITION_FALLBACK_SLACK_MS;
}

/** Keyframes of the outgoing copy's fade; must match `app/globals.css`. */
export const EXIT_ANIMATION_NAME = "tool-page-exit";

/** Keyframes of the cover reveal; must match `app/globals.css`. */
export const REVEAL_ANIMATION_NAME = "tool-page-reveal";

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
 * safety bound instead of dropping every fade.
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
 * Pathnames from `Link` hrefs and `usePathname()` differ only by trailing
 * slashes (Next normalizes them with redirects). Compare them in one form so a
 * snapshot captured for `/dns/` is still used by the committed `/dns` route.
 */
export function normalizePathname(pathname: string): string {
  if (pathname.length <= 1) return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * Search-parameter and hash updates keep the route component mounted, so they
 * must not replay a page transition. Only a pathname change is a page change.
 */
export function isSameDocumentPath(
  currentPathname: string,
  nextPathname: string,
): boolean {
  return normalizePathname(currentPathname) === normalizePathname(nextPathname);
}

/**
 * Whether a navigation should capture an outgoing snapshot at all.
 *
 * Skipped when the pathname does not change (search/hash-only navigation) and
 * when reduced motion is requested.
 */
export function shouldCaptureSnapshot(
  currentPathname: string,
  nextPathname: string,
  environment: PageTransitionEnvironment,
): boolean {
  if (environment.reducedMotion) return false;
  return !isSameDocumentPath(currentPathname, nextPathname);
}

export function isPendingSnapshotFresh(
  capturedAt: number,
  now: number,
  maxAgeMs: number = PENDING_SNAPSHOT_MAX_AGE_MS,
): boolean {
  const age = now - capturedAt;
  return Number.isFinite(age) && age >= 0 && age <= maxAgeMs;
}

export interface SnapshotRect {
  left: number;
  top: number;
  width: number;
}

export interface SnapshotPlacement {
  /** Physical viewport x of the content column's start. */
  left: number;
  /** Width of the cloned content column. */
  width: number;
  /** Viewport y the clone's document origin was displayed at capture time. */
  offsetY: number;
}

/**
 * Geometry for the viewport-anchored outgoing copy.
 *
 * The copy lives in a fixed, clipped layer that covers the viewport while the
 * shell paints above it. Its document origin must sit where the live content
 * column's origin was on screen when the snapshot was taken — including a
 * negative offset for a scrolled page — so it shows exactly the slice the
 * visitor was looking at. Keeping the layer fixed means Next.js resetting or
 * restoring the document scroll can never move the copy, which removes the
 * per-frame scroll compensation entirely.
 */
export function snapshotPlacement(rect: SnapshotRect): SnapshotPlacement {
  return {
    left: rect.left,
    width: rect.width,
    offsetY: rect.top,
  };
}
