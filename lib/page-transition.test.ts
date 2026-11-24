import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  EXIT_ANIMATION_NAME,
  EXIT_DURATION_DESKTOP_MS,
  EXIT_DURATION_MOBILE_MS,
  TRANSITION_FALLBACK_SLACK_MS,
  MOBILE_BREAKPOINT_PX,
  PENDING_SNAPSHOT_MAX_AGE_MS,
  REVEAL_ANIMATION_NAME,
  REVEAL_DURATION_DESKTOP_MS,
  REVEAL_DURATION_MOBILE_MS,
  getExitDurationMs,
  getTransitionFallbackMs,
  getRevealDurationMs,
  isExitFadeBlocked,
  isPendingSnapshotFresh,
  isSameDocumentPath,
  normalizePathname,
  shouldCaptureSnapshot,
  snapshotPlacement,
  type PageTransitionEnvironment,
} from "./page-transition";

const environment = (
  viewportWidth: number,
  reducedMotion = false,
): PageTransitionEnvironment => ({ viewportWidth, reducedMotion });

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

/** Reads one `--name: <n>ms` custom property out of a rule block. */
function durationFrom(block: string | undefined, name: string): number | null {
  if (!block) return null;
  const match = block.match(new RegExp(`${name}:\\s*(\\d+)ms`));
  return match?.[1] ? Number(match[1]) : null;
}

function transitionRule(): string | undefined {
  return css.match(/\.tool-page-transition\s*\{([^}]*)\}/)?.[1];
}

function mobileTransitionRule(): string | undefined {
  return css.match(
    /@media \(max-width: 1023px\)\s*\{\s*\.tool-page-transition\s*\{([^}]*)\}/,
  )?.[1];
}

describe("getExitDurationMs", () => {
  it("uses the short desktop duration at and above the lg breakpoint", () => {
    expect(getExitDurationMs(environment(MOBILE_BREAKPOINT_PX))).toBe(
      EXIT_DURATION_DESKTOP_MS,
    );
    expect(getExitDurationMs(environment(1440))).toBe(EXIT_DURATION_DESKTOP_MS);
  });

  it("uses the slightly longer mobile duration below the lg breakpoint", () => {
    expect(getExitDurationMs(environment(MOBILE_BREAKPOINT_PX - 1))).toBe(
      EXIT_DURATION_MOBILE_MS,
    );
    expect(getExitDurationMs(environment(390))).toBe(EXIT_DURATION_MOBILE_MS);
  });

  it("keeps both exit phases short", () => {
    expect(EXIT_DURATION_DESKTOP_MS).toBeLessThan(EXIT_DURATION_MOBILE_MS);
    expect(EXIT_DURATION_DESKTOP_MS).toBeGreaterThanOrEqual(100);
    expect(EXIT_DURATION_MOBILE_MS).toBeLessThanOrEqual(180);
  });

  it("swaps immediately when reduced motion is requested", () => {
    expect(getExitDurationMs(environment(1440, true))).toBe(0);
    expect(getExitDurationMs(environment(390, true))).toBe(0);
  });
});

describe("getRevealDurationMs", () => {
  it("reveals the incoming page in the visible incoming window", () => {
    expect(getRevealDurationMs(environment(1440))).toBe(
      REVEAL_DURATION_DESKTOP_MS,
    );
    expect(getRevealDurationMs(environment(390))).toBe(
      REVEAL_DURATION_MOBILE_MS,
    );
    expect(REVEAL_DURATION_DESKTOP_MS).toBeGreaterThan(EXIT_DURATION_DESKTOP_MS);
    expect(REVEAL_DURATION_MOBILE_MS).toBeGreaterThan(EXIT_DURATION_MOBILE_MS);
  });

  it("keeps the whole hand-off inside the visible transition budget", () => {
    expect(REVEAL_DURATION_DESKTOP_MS).toBeGreaterThanOrEqual(200);
    expect(REVEAL_DURATION_MOBILE_MS).toBeLessThanOrEqual(320);
  });

  it("swaps immediately when reduced motion is requested", () => {
    expect(getRevealDurationMs(environment(1440, true))).toBe(0);
    expect(getRevealDurationMs(environment(390, true))).toBe(0);
  });
});

describe("transition stylesheet", () => {
  it("keeps the CSS page durations in sync with the timing module", () => {
    expect(durationFrom(transitionRule(), "--page-exit-duration")).toBe(
      EXIT_DURATION_DESKTOP_MS,
    );
    expect(durationFrom(transitionRule(), "--page-reveal-duration")).toBe(
      REVEAL_DURATION_DESKTOP_MS,
    );
    expect(durationFrom(mobileTransitionRule(), "--page-exit-duration")).toBe(
      EXIT_DURATION_MOBILE_MS,
    );
    expect(durationFrom(mobileTransitionRule(), "--page-reveal-duration")).toBe(
      REVEAL_DURATION_MOBILE_MS,
    );
  });

  it("names the keyframes the component probes for", () => {
    expect(css).toMatch(
      new RegExp(`@keyframes\\s+${EXIT_ANIMATION_NAME}\\s*\\{`),
    );
    expect(css).toMatch(
      new RegExp(`@keyframes\\s+${REVEAL_ANIMATION_NAME}\\s*\\{`),
    );
  });

  it("is the animation the exiting copy plays, with the fast-decay exit curve", () => {
    const rule = css.match(
      /\.tool-page-snapshot\[data-phase='exiting'\]\s*\{([^}]*)\}/,
    );
    expect(rule?.[1]).toMatch(
      new RegExp(`animation:\\s*${EXIT_ANIMATION_NAME}(?![\\w-])`),
    );
    expect(rule?.[1]).toContain("var(--ease-exit)");
  });

  it("holds the page canvas before it reveals the incoming route", () => {
    const rule = css.match(
      /\.tool-page-cover\[data-phase='revealing'\]\s*\{([^}]*)\}/,
    );
    expect(rule?.[1]).toMatch(
      new RegExp(`animation:\\s*${REVEAL_ANIMATION_NAME}(?![\\w-])`),
    );
    expect(css).toMatch(
      /@keyframes tool-page-reveal\s*\{[^}]*0%,?\s*18%\s*\{[^}]*opacity:\s*1/,
    );
  });

  it("anchors the outgoing copy to the viewport below the shell chrome", () => {
    const rule = css.match(/\.tool-page-snapshot-layer\s*\{([^}]*)\}/);
    expect(rule?.[1]).toContain("position: fixed");
    expect(rule?.[1]).toContain("inset: 0");
    expect(rule?.[1]).toContain("overflow: clip");
    expect(rule?.[1]).toContain("pointer-events: none");
    // The sidebar and mobile bar sit at z-30.
    expect(rule?.[1]).toContain("z-index: 20");
    expect(rule?.[1]).toContain("display: none");
    expect(css).toMatch(
      /\.tool-page-snapshot-layer\[data-active='true'\]\s*\{[^}]*display:\s*block/,
    );
  });

  it("fades the outgoing content through the page canvas, not the new route", () => {
    // The copy is transparent so the opaque cover, not the new page, shows
    // through as its content dissolves.
    const snapshotRule = css.match(/\.tool-page-snapshot\s*\{([^}]*)\}/);
    expect(snapshotRule?.[1]).not.toContain("background-color");
    const coverRule = css.match(/\.tool-page-cover\s*\{([^}]*)\}/);
    expect(coverRule?.[1]).toContain("background-color: var(--background)");
  });

  it("does not animate the incoming route", () => {
    expect(css).not.toContain("@keyframes tool-page-enter");
    expect(css).not.toContain("--page-enter");
    expect(css).not.toContain("--page-delay-");
    expect(css).not.toContain("data-transition-stage");
  });
});

describe("getTransitionFallbackMs", () => {
  it("outlasts the animation it guards", () => {
    for (const duration of [
      EXIT_DURATION_DESKTOP_MS,
      EXIT_DURATION_MOBILE_MS,
    ]) {
      expect(getTransitionFallbackMs(duration)).toBe(
        duration + TRANSITION_FALLBACK_SLACK_MS,
      );
      expect(getTransitionFallbackMs(duration)).toBeGreaterThan(duration);
    }
  });

  it("keeps a margin of several frames past the nominal end", () => {
    expect(TRANSITION_FALLBACK_SLACK_MS).toBeGreaterThanOrEqual(100);
  });
});

describe("isExitFadeBlocked", () => {
  const fade = (state: string, name = EXIT_ANIMATION_NAME) => ({ name, state });

  it("is blocked when CSS created no animation at all", () => {
    expect(isExitFadeBlocked([])).toBe(true);
  });

  it("is blocked when the exit fade is paused", () => {
    expect(isExitFadeBlocked([fade("paused")])).toBe(true);
  });

  it("is not blocked while the exit fade runs, even before its first frame", () => {
    expect(isExitFadeBlocked([fade("running")])).toBe(false);
  });

  it("is blocked once the exit fade can no longer run or settle", () => {
    expect(isExitFadeBlocked([fade("finished")])).toBe(true);
    expect(isExitFadeBlocked([fade("idle")])).toBe(true);
  });

  it("judges the exit fade alone, whatever else runs on the copy", () => {
    expect(isExitFadeBlocked([fade("paused"), fade("running", "other")])).toBe(
      true,
    );
    expect(isExitFadeBlocked([fade("running"), fade("paused", "other")])).toBe(
      false,
    );
  });

  it("leaves the copy to the safety bound when no animation has the exit name", () => {
    expect(isExitFadeBlocked([fade("running", "renamed-fade")])).toBe(false);
  });
});

describe("normalizePathname", () => {
  it("keeps the root distinct", () => {
    expect(normalizePathname("/")).toBe("/");
    expect(normalizePathname("")).toBe("/");
  });

  it("drops trailing slashes so redirected routes still match", () => {
    expect(normalizePathname("/dns/")).toBe("/dns");
    expect(normalizePathname("/asn/AS13335/")).toBe("/asn/AS13335");
  });
});

describe("isSameDocumentPath", () => {
  it("treats only search and hash updates as the same document", () => {
    expect(isSameDocumentPath("/dns", "/dns/")).toBe(true);
    expect(isSameDocumentPath("/", "/")).toBe(true);
    expect(isSameDocumentPath("/dns", "/whois")).toBe(false);
    expect(isSameDocumentPath("/asn", "/asn/AS13335")).toBe(false);
  });
});

describe("shouldCaptureSnapshot", () => {
  it("captures only real pathname changes", () => {
    expect(shouldCaptureSnapshot("/dns", "/dns", environment(1440))).toBe(false);
    expect(shouldCaptureSnapshot("/dns", "/whois", environment(1440))).toBe(
      true,
    );
  });

  it("never captures under reduced motion", () => {
    expect(shouldCaptureSnapshot("/dns", "/whois", environment(390, true))).toBe(
      false,
    );
  });
});

describe("isPendingSnapshotFresh", () => {
  it("uses a copy only while it still describes what is on screen", () => {
    expect(isPendingSnapshotFresh(1000, 1000)).toBe(true);
    expect(isPendingSnapshotFresh(1000, 1600)).toBe(true);
    expect(isPendingSnapshotFresh(1000, 1601)).toBe(false);
    expect(PENDING_SNAPSHOT_MAX_AGE_MS).toBeLessThanOrEqual(1000);
  });

  it("rejects impossible clocks instead of animating stale content", () => {
    expect(isPendingSnapshotFresh(1000, 900)).toBe(false);
    expect(isPendingSnapshotFresh(Number.NaN, 1000)).toBe(false);
  });
});

describe("snapshotPlacement", () => {
  it("anchors the copy where the content column was on screen", () => {
    expect(snapshotPlacement({ left: 256, top: 0, width: 1184 })).toEqual({
      left: 256,
      width: 1184,
      offsetY: 0,
    });
  });

  it("keeps a scrolled page showing the same slice", () => {
    expect(snapshotPlacement({ left: 256, top: -844, width: 1184 })).toEqual({
      left: 256,
      width: 1184,
      offsetY: -844,
    });
  });

  it("keeps the mobile top-bar offset without rounding the width", () => {
    expect(snapshotPlacement({ left: 0, top: 56, width: 390.5 })).toEqual({
      left: 0,
      width: 390.5,
      offsetY: 56,
    });
  });
});
