import { describe, expect, it } from "vitest";

import {
  EXIT_DURATION_DESKTOP_MS,
  EXIT_DURATION_MOBILE_MS,
  MOBILE_BREAKPOINT_PX,
  exitScrollOffset,
  getExitDurationMs,
  type PageTransitionEnvironment,
} from "./page-transition";

const environment = (
  viewportWidth: number,
  reducedMotion = false,
): PageTransitionEnvironment => ({ viewportWidth, reducedMotion });

describe("getExitDurationMs", () => {
  it("uses the short desktop duration at and above the lg breakpoint", () => {
    expect(getExitDurationMs(environment(MOBILE_BREAKPOINT_PX))).toBe(
      EXIT_DURATION_DESKTOP_MS,
    );
    expect(getExitDurationMs(environment(1440))).toBe(EXIT_DURATION_DESKTOP_MS);
  });

  it("uses the longer mobile duration below the lg breakpoint", () => {
    expect(getExitDurationMs(environment(MOBILE_BREAKPOINT_PX - 1))).toBe(
      EXIT_DURATION_MOBILE_MS,
    );
    expect(getExitDurationMs(environment(390))).toBe(EXIT_DURATION_MOBILE_MS);
  });

  it("keeps the desktop duration the quicker of the two", () => {
    expect(EXIT_DURATION_DESKTOP_MS).toBeLessThan(EXIT_DURATION_MOBILE_MS);
    // Both must stay short enough that navigation never feels slow.
    expect(EXIT_DURATION_MOBILE_MS).toBeLessThanOrEqual(200);
  });

  it("swaps immediately when the user prefers reduced motion", () => {
    expect(getExitDurationMs(environment(1440, true))).toBe(0);
    expect(getExitDurationMs(environment(390, true))).toBe(0);
  });
});

describe("exitScrollOffset", () => {
  it("is zero when the scroll position did not move", () => {
    expect(exitScrollOffset(0, 0)).toBe(0);
    expect(exitScrollOffset(640, 640)).toBe(0);
  });

  it("cancels a scroll-to-top by shifting the content back down", () => {
    // Router moved 1192 -> 0, so the container must sit at -1192.
    expect(exitScrollOffset(1192, 0)).toBe(-1192);
  });

  it("cancels a restored scroll position in either direction", () => {
    // Back navigation restoring 0 -> 480: content shifts down by 480…
    expect(exitScrollOffset(0, 480)).toBe(480);
    // …and a shallower restore shifts it up.
    expect(exitScrollOffset(900, 300)).toBe(-600);
  });

  it("ignores sub-pixel drift so it never animates a rounding artefact", () => {
    expect(exitScrollOffset(100, 100.4)).toBe(0);
  });
});
