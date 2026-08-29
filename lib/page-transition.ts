import { activeToolFromPathname } from "@/components/shell/nav-config";

/**
 * Coordinates page motion with overlays (the mobile nav sheet).
 *
 * View Transitions snapshot the live DOM, so an open sheet would freeze into
 * the outgoing frame and fight Radix's close animation. Marking the document
 * root lets CSS skip only the view-transition snapshots for a short window;
 * the staged CSS enter still runs so the destination lifts in as the drawer
 * reveals it.
 */
export const PAGE_REVEAL_ATTR = "data-page-reveal";
export const PAGE_REVEAL_SHEET = "sheet";
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

export function markSheetPageReveal() {
  document.documentElement.setAttribute(PAGE_REVEAL_ATTR, PAGE_REVEAL_SHEET);
}

export function clearPageReveal() {
  document.documentElement.removeAttribute(PAGE_REVEAL_ATTR);
}

export function hasSheetPageReveal() {
  return (
    document.documentElement.getAttribute(PAGE_REVEAL_ATTR) ===
    PAGE_REVEAL_SHEET
  );
}
