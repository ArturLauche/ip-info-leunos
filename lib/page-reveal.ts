/**
 * Coordinates mobile sheet navigation with page enter/exit motion.
 *
 * When a tool is chosen from the mobile nav sheet, the drawer close *is* the
 * transition — the new page should already be painted underneath. Marking the
 * document root lets CSS skip the page animation (and any View Transition)
 * until the sheet has finished revealing the destination.
 */
export const PAGE_REVEAL_ATTR = "data-page-reveal";
export const PAGE_REVEAL_SHEET = "sheet";

/** Let the selection highlight register before the sheet starts closing. */
export const SHEET_NAV_CLOSE_DELAY_MS = 90;

/** Covers close delay + sheet slide/overlay so page motion stays suppressed. */
export const SHEET_PAGE_REVEAL_MS = 720;

export function markSheetPageReveal() {
  document.documentElement.setAttribute(PAGE_REVEAL_ATTR, PAGE_REVEAL_SHEET);
}

export function clearPageReveal() {
  document.documentElement.removeAttribute(PAGE_REVEAL_ATTR);
}
