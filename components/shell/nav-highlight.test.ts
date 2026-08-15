import { describe, expect, it } from "vitest";
import {
  INITIAL_NAV_HIGHLIGHT,
  nextNavHighlight,
  type NavHighlightView,
} from "./nav-highlight";

describe("nextNavHighlight", () => {
  it("keeps the last box and disables sliding when the selection leaves the group", () => {
    const previous: NavHighlightView = {
      box: { y: 88, height: 40 },
      visible: true,
      slide: true,
    };

    expect(nextNavHighlight(previous, null, true)).toEqual({
      box: { y: 88, height: 40 },
      visible: false,
      slide: false,
    });
  });

  it("snaps onto the active row when entering a group instead of sliding from the top", () => {
    const hidden: NavHighlightView = {
      box: { y: 0, height: 40 },
      visible: false,
      slide: false,
    };

    expect(
      nextNavHighlight(hidden, { y: 132, height: 40 }, true),
    ).toEqual({
      box: { y: 132, height: 40 },
      visible: true,
      slide: false,
    });
  });

  it("slides between rows once the highlight is already visible in the group", () => {
    const previous: NavHighlightView = {
      box: { y: 44, height: 40 },
      visible: true,
      slide: false,
    };

    expect(
      nextNavHighlight(previous, { y: 132, height: 40 }, true),
    ).toEqual({
      box: { y: 132, height: 40 },
      visible: true,
      slide: true,
    });
  });

  it("does not slide before motion is enabled (first paint / hydration)", () => {
    const previous: NavHighlightView = {
      box: { y: 0, height: 40 },
      visible: true,
      slide: false,
    };

    expect(
      nextNavHighlight(previous, { y: 88, height: 40 }, false),
    ).toEqual({
      box: { y: 88, height: 40 },
      visible: true,
      slide: false,
    });
  });

  it("returns the same object when hiding from an already hidden state", () => {
    expect(nextNavHighlight(INITIAL_NAV_HIGHLIGHT, null, true)).toBe(
      INITIAL_NAV_HIGHLIGHT,
    );
  });
});
