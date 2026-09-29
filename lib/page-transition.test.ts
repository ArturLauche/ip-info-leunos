import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  EXIT_ANIMATION_NAME,
  EXIT_DURATION_DESKTOP_MS,
  EXIT_DURATION_MOBILE_MS,
  EXIT_FALLBACK_SLACK_MS,
  EXIT_START_TIMEOUT_MS,
  MOBILE_BREAKPOINT_PX,
  exitScrollOffset,
  exitFadeCanRun,
  getExitDurationMs,
  getExitFallbackMs,
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

describe("getExitFallbackMs", () => {
  it("outlasts the exit animation it guards", () => {
    for (const duration of [EXIT_DURATION_DESKTOP_MS, EXIT_DURATION_MOBILE_MS]) {
      expect(getExitFallbackMs(duration)).toBe(duration + EXIT_FALLBACK_SLACK_MS);
      expect(getExitFallbackMs(duration)).toBeGreaterThan(duration);
    }
  });

  it("keeps a margin of several frames past the nominal end", () => {
    expect(EXIT_FALLBACK_SLACK_MS).toBeGreaterThanOrEqual(100);
  });

  it("waits longer for an exit that has not started than for one that has", () => {
    expect(EXIT_START_TIMEOUT_MS).toBeGreaterThan(
      getExitFallbackMs(EXIT_DURATION_MOBILE_MS),
    );
  });
});

describe("exitFadeCanRun", () => {
  it("is false when CSS produced no fade", () => {
    expect(exitFadeCanRun([])).toBe(false);
  });

  it("is false when the fade is paused", () => {
    expect(exitFadeCanRun(["paused"])).toBe(false);
  });

  it("is true for a running fade, including one waiting for its first frame", () => {
    expect(exitFadeCanRun(["running"])).toBe(true);
  });
});

describe("EXIT_ANIMATION_NAME", () => {
  it("names the keyframes the stylesheet plays on the outgoing copy", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
    expect(css).toContain(`@keyframes ${EXIT_ANIMATION_NAME}`);
    expect(css).toMatch(new RegExp(`animation:\\s*${EXIT_ANIMATION_NAME}\\b`));
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
