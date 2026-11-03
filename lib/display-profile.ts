/**
 * Display-capability detection for foldables and smartwatches.
 *
 * CSS owns the actual layout. This module only supplies the two facts CSS
 * cannot reliably express today: whether a watch display is round, and which
 * fold posture / viewport-segment layout the browser reports. The result is
 * published as data attributes on <html> by components/display-profile.tsx.
 */

export const DISPLAY_SHAPES = ["round", "rect", "unknown"] as const;
export type DisplayShape = (typeof DISPLAY_SHAPES)[number];

export const DEVICE_POSTURES = ["continuous", "folded", "unknown"] as const;
export type DevicePosture = (typeof DEVICE_POSTURES)[number];

export interface DisplayProfileInput {
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  shapeRound?: boolean;
  shapeRect?: boolean;
  posture?: string | null;
  horizontalSegments?: number;
  verticalSegments?: number;
}

export interface DisplayProfile {
  shape: DisplayShape;
  posture: DevicePosture;
  horizontalSegments: number;
  verticalSegments: number;
  isWatch: boolean;
  isFoldable: boolean;
}

/** Media queries the shell listens to so the attributes follow posture changes. */
export const DISPLAY_PROFILE_MEDIA_QUERIES = [
  "(shape: round)",
  "(shape: rect)",
  "(device-posture: folded)",
  "(device-posture: continuous)",
  "(horizontal-viewport-segments: 2)",
  "(vertical-viewport-segments: 2)",
] as const;

const WEAR_OS =
  /Wear OS|Android Wear|WearOS|Pixel Watch|Galaxy Watch|TicWatch|SmartWatch|SM-R\d/i;
const APPLE_WATCH = /Watch OS|watchOS|Apple Watch/i;
const WATCH =
  /Watch OS|watchOS|Apple Watch|Wear OS|Android Wear|WearOS|Pixel Watch|Galaxy Watch|TicWatch|SmartWatch|SM-R\d|\bWatch\b/i;

/**
 * A few Wear OS watches have a rectangular display. They are rare, but they
 * must not receive the circular safe-area treatment just because they report
 * a square screen.
 */
const SQUARE_WEAR_OS_MODELS = [
  /SmartWatch 3/i,
  /\bG Watch\b/i,
  /\bGear Live\b/i,
  /\bZenWatch\b/i,
];

/** Upper bound for a square screen that is plausibly a watch, not a small phone. */
const MAX_WATCH_SCREEN_EDGE = 480;

function positiveDimension(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

function segmentCount(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 1
    ? Math.floor(value)
    : 1;
}

function isSquareWatchScreen(input: DisplayProfileInput): boolean {
  const isSquare = (width: number, height: number) =>
    width > 0 &&
    height > 0 &&
    Math.abs(width - height) <= 1 &&
    Math.max(width, height) <= MAX_WATCH_SCREEN_EDGE;

  return (
    isSquare(
      positiveDimension(input.screenWidth),
      positiveDimension(input.screenHeight),
    ) ||
    isSquare(
      positiveDimension(input.viewportWidth),
      positiveDimension(input.viewportHeight),
    )
  );
}

/**
 * Wear OS does not expose the CSS `shape` media feature in current WebViews.
 * Most Wear OS watches are round, so a square Wear OS screen is treated as
 * round unless the UA names a known rectangular model. Apple Watch is
 * explicitly rectangular and never falls into this branch.
 */
export function looksLikeRoundWearOs(input: DisplayProfileInput = {}): boolean {
  const userAgent = input.userAgent ?? "";
  if (!WEAR_OS.test(userAgent) || APPLE_WATCH.test(userAgent)) return false;
  if (SQUARE_WEAR_OS_MODELS.some((pattern) => pattern.test(userAgent))) {
    return false;
  }
  return isSquareWatchScreen(input);
}

export function detectDisplayShape(
  input: DisplayProfileInput = {},
): DisplayShape {
  if (input.shapeRound) return "round";
  if (input.shapeRect) return "rect";

  const userAgent = input.userAgent ?? "";
  if (APPLE_WATCH.test(userAgent)) return "rect";
  if (looksLikeRoundWearOs(input)) return "round";
  if (WATCH.test(userAgent)) return "rect";

  return "unknown";
}

export function detectDisplayProfile(
  input: DisplayProfileInput = {},
): DisplayProfile {
  const horizontalSegments = segmentCount(input.horizontalSegments);
  const verticalSegments = segmentCount(input.verticalSegments);
  const posture: DevicePosture =
    input.posture === "folded" || input.posture === "continuous"
      ? input.posture
      : "unknown";

  return {
    shape: detectDisplayShape(input),
    posture,
    horizontalSegments,
    verticalSegments,
    isWatch: WATCH.test(input.userAgent ?? ""),
    isFoldable:
      posture === "folded" ||
      horizontalSegments > 1 ||
      verticalSegments > 1,
  };
}

function mediaMatches(query: string): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

/** Reads the current browser state. Safe to call only on the client. */
export function collectDisplayProfileInput(): DisplayProfileInput {
  if (typeof window === "undefined") return {};

  const posture = mediaMatches("(device-posture: folded)")
    ? "folded"
    : mediaMatches("(device-posture: continuous)")
      ? "continuous"
      : null;

  return {
    userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent,
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    shapeRound: mediaMatches("(shape: round)"),
    shapeRect: mediaMatches("(shape: rect)"),
    posture,
    horizontalSegments: mediaMatches("(horizontal-viewport-segments: 2)")
      ? 2
      : 1,
    verticalSegments: mediaMatches("(vertical-viewport-segments: 2)") ? 2 : 1,
  };
}

export function readDisplayProfile(): DisplayProfile {
  return detectDisplayProfile(collectDisplayProfileInput());
}
