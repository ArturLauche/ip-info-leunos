export interface SegmentHighlightBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SegmentHighlightView {
  box: SegmentHighlightBox;
  visible: boolean;
  /** Slide only when the indicator is already on-screen. */
  slide: boolean;
}

export const INITIAL_SEGMENT_HIGHLIGHT: SegmentHighlightView = {
  box: { x: 0, y: 0, width: 0, height: 0 },
  visible: false,
  slide: false,
};

function sameBox(a: SegmentHighlightBox, b: SegmentHighlightBox) {
  return (
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  );
}

/**
 * Next frame for a sliding segmented-control indicator.
 *
 * - First paint snaps into place (no slide from the origin).
 * - Later moves slide once motion is enabled.
 * - Losing the active item keeps the last box and only fades out.
 */
export function nextSegmentHighlight(
  previous: SegmentHighlightView,
  measured: SegmentHighlightBox | null,
  canAnimate: boolean,
): SegmentHighlightView {
  if (!measured) {
    if (!previous.visible && !previous.slide) {
      return previous;
    }

    return {
      box: previous.box,
      visible: false,
      slide: false,
    };
  }

  if (
    previous.visible &&
    sameBox(previous.box, measured) &&
    previous.slide === (canAnimate && previous.visible)
  ) {
    return previous;
  }

  return {
    box: measured,
    visible: true,
    slide: canAnimate && previous.visible,
  };
}
