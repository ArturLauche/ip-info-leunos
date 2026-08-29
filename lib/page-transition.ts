import { activeToolFromPathname } from "@/components/shell/nav-config";

/**
 * Coordinates page motion with overlays (the mobile nav sheet and the
 * command palette). View Transitions snapshot the live DOM, so an open overlay
 * would freeze into the outgoing frame and fight Radix's close animation.
 * Marking the document root lets CSS skip only the view-transition snapshots
 * for a short window; the staged CSS enter still runs so the destination
 * lifts in as the overlay reveals it.
 */
export const PAGE_REVEAL_ATTR = "data-page-reveal";
export const PAGE_REVEAL_SHEET = "sheet";
export const PAGE_REVEAL_OVERLAY = "overlay";
export const SUPPORTS_VIEW_TRANSITIONS_CLASS = "supports-view-transitions";

/** Lets the selection highlight paint before the sheet starts closing. */
export const SHEET_NAV_CLOSE_DELAY_MS = 80;

/** Must match the mobile SheetContent close duration in `mobile-nav.tsx`. */
export const SHEET_CLOSE_MS = 220;

/**
 * Covers close-delay + sheet slide with a short tail. Kept well under 400ms so
 * sheet navigation never feels like it is waiting on a second animation.
 */
export const SHEET_PAGE_REVEAL_MS =
  SHEET_NAV_CLOSE_DELAY_MS + SHEET_CLOSE_MS + 20;

/** Matches the command-palette Radix dialog close (`duration-200`). */
export const OVERLAY_CLOSE_MS = 200;

/**
 * Hold overlay reveal long enough for the staged CSS enter to finish.
 * Navigation itself is not delayed; this only keeps snapshots skipped.
 */
export const OVERLAY_PAGE_REVEAL_MS = 450;

let revealClearTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Identity for page-level enter/exit. Tool roots and their nested routes (for
 * example `/asn` and `/asn/AS8881`) share a key so query/deep-link updates do
 * not replay the route transition. Standalone routes (legal, 404) use the path.
 */
export function getPageTransitionKey(pathname: string): string {
  const tool = activeToolFromPathname(pathname);
  if (tool) return `tool:${tool}`;

  const normalized = pathname.replace(/\/+$/, "") || "/";
  return `route:${normalized}`;
}

export function markViewTransitionSupport() {
  if (typeof document === "undefined") return;
  if ("startViewTransition" in document) {
    document.documentElement.classList.add(SUPPORTS_VIEW_TRANSITIONS_CLASS);
  }
}

function schedulePageRevealClear(holdMs: number) {
  clearTimeout(revealClearTimer);
  revealClearTimer = setTimeout(() => {
    revealClearTimer = undefined;
    clearPageReveal();
  }, holdMs);
}

/** Marks the document so CSS skips View Transition snapshots for `holdMs`. */
export function markPageReveal(reason: string, holdMs: number) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(PAGE_REVEAL_ATTR, reason);
  schedulePageRevealClear(holdMs);
}

export function markSheetPageReveal(holdMs: number = SHEET_PAGE_REVEAL_MS) {
  markPageReveal(PAGE_REVEAL_SHEET, holdMs);
}

export function markOverlayPageReveal(
  holdMs: number = OVERLAY_PAGE_REVEAL_MS,
) {
  markPageReveal(PAGE_REVEAL_OVERLAY, holdMs);
}

export function clearPageReveal() {
  clearTimeout(revealClearTimer);
  revealClearTimer = undefined;
  if (typeof document === "undefined") return;
  document.documentElement.removeAttribute(PAGE_REVEAL_ATTR);
}

export function hasSheetPageReveal() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.getAttribute(PAGE_REVEAL_ATTR) ===
      PAGE_REVEAL_SHEET
  );
}
