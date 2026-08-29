import { describe, expect, it } from "vitest";

import {
  PAGE_REVEAL_ATTR,
  PAGE_REVEAL_SHEET,
  SHEET_CLOSE_MS,
  SHEET_NAV_CLOSE_DELAY_MS,
  SHEET_PAGE_REVEAL_MS,
  SUPPORTS_VIEW_TRANSITIONS_CLASS,
  getPageTransitionKey,
} from "./page-transition";

describe("getPageTransitionKey", () => {
  it("groups tool roots and nested routes so deep links do not replay", () => {
    expect(getPageTransitionKey("/")).toBe("tool:home");
    expect(getPageTransitionKey("/check")).toBe("tool:check");
    expect(getPageTransitionKey("/asn")).toBe("tool:asn");
    expect(getPageTransitionKey("/asn/AS8881")).toBe("tool:asn");
    expect(getPageTransitionKey("/ping/")).toBe("tool:ping");
  });

  it("keeps standalone routes distinct from tools", () => {
    expect(getPageTransitionKey("/privacy-policy")).toBe(
      "route:/privacy-policy",
    );
    expect(getPageTransitionKey("/terms-of-use/")).toBe("route:/terms-of-use");
    expect(getPageTransitionKey("/does-not-exist")).toBe(
      "route:/does-not-exist",
    );
  });
});

describe("sheet / page motion timing", () => {
  it("closes the sheet after the highlight can paint, but before the enter peaks", () => {
    expect(SHEET_NAV_CLOSE_DELAY_MS).toBeGreaterThan(0);
    expect(SHEET_NAV_CLOSE_DELAY_MS).toBeLessThan(SHEET_CLOSE_MS);
    expect(SHEET_CLOSE_MS).toBe(220);
  });

  it("keeps the view-transition skip window short enough not to feel idle", () => {
    expect(SHEET_PAGE_REVEAL_MS).toBeGreaterThanOrEqual(
      SHEET_NAV_CLOSE_DELAY_MS + SHEET_CLOSE_MS,
    );
    expect(SHEET_PAGE_REVEAL_MS).toBeLessThan(400);
  });

  it("uses a stable document attribute for CSS hooks", () => {
    expect(PAGE_REVEAL_ATTR).toBe("data-page-reveal");
    expect(PAGE_REVEAL_SHEET).toBe("sheet");
    expect(SUPPORTS_VIEW_TRANSITIONS_CLASS).toBe("supports-view-transitions");
  });
});
