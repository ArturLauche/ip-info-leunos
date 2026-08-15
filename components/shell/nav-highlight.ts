export interface NavHighlightBox {
  y: number;
  height: number;
}

export interface NavHighlightView {
  box: NavHighlightBox;
  visible: boolean;
  /** Slide the frame only when it is already on-screen in this group. */
  slide: boolean;
}

export const INITIAL_NAV_HIGHLIGHT: NavHighlightView = {
  box: { y: 0, height: 40 },
  visible: false,
  slide: false,
};

/**
 * Next frame for the sliding nav selection.
 *
 * - Leaving a group keeps the last box and only fades out (no snap-to-top).
 * - Entering a group snaps to the active row, then fades in.
 * - Moving within a group slides once motion is enabled.
 */
export function nextNavHighlight(
  previous: NavHighlightView,
  measured: NavHighlightBox | null,
  canAnimate: boolean,
): NavHighlightView {
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

  const sameBox =
    previous.box.y === measured.y && previous.box.height === measured.height;

  if (
    previous.visible &&
    sameBox &&
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
