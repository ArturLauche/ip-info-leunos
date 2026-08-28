import { describe, expect, it } from "vitest";
import {
  INITIAL_SEGMENT_HIGHLIGHT,
  nextSegmentHighlight,
  type SegmentHighlightView,
} from "./segment-highlight";

describe("nextSegmentHighlight", () => {
  it("keeps the last box and disables sliding when the active item disappears", () => {
    const previous: SegmentHighlightView = {
      box: { x: 120, y: 0, width: 80, height: 32 },
      visible: true,
      slide: true,
    };

    expect(nextSegmentHighlight(previous, null, true)).toEqual({
      box: { x: 120, y: 0, width: 80, height: 32 },
      visible: false,
      slide: false,
    });
  });

  it("snaps onto the active item on first paint instead of sliding from the origin", () => {
    const hidden: SegmentHighlightView = {
      box: { x: 0, y: 0, width: 0, height: 0 },
      visible: false,
      slide: false,
    };

    expect(
      nextSegmentHighlight(
        hidden,
        { x: 164, y: 0, width: 88, height: 32 },
        true,
      ),
    ).toEqual({
      box: { x: 164, y: 0, width: 88, height: 32 },
      visible: true,
      slide: false,
    });
  });

  it("slides between items once the highlight is already visible", () => {
    const previous: SegmentHighlightView = {
      box: { x: 4, y: 4, width: 80, height: 32 },
      visible: true,
      slide: false,
    };

    expect(
      nextSegmentHighlight(
        previous,
        { x: 84, y: 4, width: 80, height: 32 },
        true,
      ),
    ).toEqual({
      box: { x: 84, y: 4, width: 80, height: 32 },
      visible: true,
      slide: true,
    });
  });

  it("slides on a 2x2 grid including diagonal moves", () => {
    const previous: SegmentHighlightView = {
      box: { x: 4, y: 4, width: 120, height: 32 },
      visible: true,
      slide: true,
    };

    expect(
      nextSegmentHighlight(
        previous,
        { x: 124, y: 40, width: 120, height: 32 },
        true,
      ),
    ).toEqual({
      box: { x: 124, y: 40, width: 120, height: 32 },
      visible: true,
      slide: true,
    });
  });

  it("does not slide before motion is enabled (first paint / hydration)", () => {
    const previous: SegmentHighlightView = {
      box: { x: 0, y: 0, width: 80, height: 32 },
      visible: true,
      slide: false,
    };

    expect(
      nextSegmentHighlight(
        previous,
        { x: 80, y: 0, width: 80, height: 32 },
        false,
      ),
    ).toEqual({
      box: { x: 80, y: 0, width: 80, height: 32 },
      visible: true,
      slide: false,
    });
  });

  it("returns the same object when hiding from an already hidden state", () => {
    expect(nextSegmentHighlight(INITIAL_SEGMENT_HIGHLIGHT, null, true)).toBe(
      INITIAL_SEGMENT_HIGHLIGHT,
    );
  });
});
