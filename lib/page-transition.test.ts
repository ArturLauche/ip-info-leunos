import { describe, expect, it } from "vitest";

import {
  EXIT_DURATION_DESKTOP_MS,
  EXIT_DURATION_MOBILE_MS,
  MOBILE_BREAKPOINT_PX,
  exitScrollOffset,
  getExitDurationMs,
  shouldUseFallbackSnapshot,
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

  it("uses the fluid mobile duration below the lg breakpoint", () => {
    expect(getExitDurationMs(environment(MOBILE_BREAKPOINT_PX - 1))).toBe(
      EXIT_DURATION_MOBILE_MS,
    );
    expect(getExitDurationMs(environment(390))).toBe(EXIT_DURATION_MOBILE_MS);
  });

  it("keeps both exit phases short", () => {
    expect(EXIT_DURATION_DESKTOP_MS).toBeLessThan(EXIT_DURATION_MOBILE_MS);
    expect(EXIT_DURATION_MOBILE_MS).toBeLessThanOrEqual(200);
  });

  it("swaps immediately when reduced motion is requested", () => {
    expect(getExitDurationMs(environment(1440, true))).toBe(0);
    expect(getExitDurationMs(environment(390, true))).toBe(0);
  });
});

describe("exitScrollOffset", () => {
  it("is zero when the scroll position did not move", () => {
    expect(exitScrollOffset(0, 0)).toBe(0);
    expect(exitScrollOffset(640, 640)).toBe(0);
  });

  it("cancels a scroll-to-top", () => {
    expect(exitScrollOffset(1192, 0)).toBe(-1192);
  });

  it("cancels restored history positions in either direction", () => {
    expect(exitScrollOffset(0, 480)).toBe(480);
    expect(exitScrollOffset(900, 300)).toBe(-600);
  });

  it("ignores sub-pixel drift", () => {
    expect(exitScrollOffset(100, 100.4)).toBe(0);
  });
});

describe("shouldUseFallbackSnapshot", () => {
  it("allows fallback continuity when no preflight expired", () => {
    expect(shouldUseFallbackSnapshot("/dns", null)).toBe(true);
  });

  it("does not revive a fallback for the navigation that timed out", () => {
    expect(shouldUseFallbackSnapshot("/whois", "/whois")).toBe(false);
  });

  it("still allows a fallback for an unrelated direct route change", () => {
    expect(shouldUseFallbackSnapshot("/ping", "/whois")).toBe(true);
  });
});
