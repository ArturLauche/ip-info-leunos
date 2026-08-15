import { describe, expect, it } from "vitest";

import {
  PAGE_REVEAL_ATTR,
  PAGE_REVEAL_SHEET,
  SHEET_NAV_CLOSE_DELAY_MS,
  SHEET_PAGE_REVEAL_MS,
} from "./page-reveal";

describe("page-reveal timing", () => {
  it("keeps the sheet close delay shorter than the reveal window", () => {
    expect(SHEET_NAV_CLOSE_DELAY_MS).toBeGreaterThan(0);
    expect(SHEET_PAGE_REVEAL_MS).toBeGreaterThan(SHEET_NAV_CLOSE_DELAY_MS);
  });

  it("uses a stable document attribute for CSS hooks", () => {
    expect(PAGE_REVEAL_ATTR).toBe("data-page-reveal");
    expect(PAGE_REVEAL_SHEET).toBe("sheet");
  });
});
