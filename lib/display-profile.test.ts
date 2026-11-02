import { describe, expect, it } from "vitest";

import {
  detectDisplayProfile,
  detectDisplayShape,
  looksLikeRoundWearOs,
} from "./display-profile";

const PIXEL_WATCH_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel Watch) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const APPLE_WATCH_UA =
  "Mozilla/5.0 (Apple Watch; CPU Watch OS 11_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

describe("display-profile", () => {
  it("treats a square Wear OS screen as a round Pixel Watch", () => {
    expect(
      detectDisplayShape({
        userAgent: PIXEL_WATCH_UA,
        screenWidth: 450,
        screenHeight: 450,
        viewportWidth: 192,
        viewportHeight: 192,
      }),
    ).toBe("round");
    expect(
      looksLikeRoundWearOs({
        userAgent: PIXEL_WATCH_UA,
        screenWidth: 450,
        screenHeight: 450,
      }),
    ).toBe(true);
  });

  it("falls back to the CSS viewport when the screen reports physical pixels", () => {
    expect(
      detectDisplayShape({
        userAgent: PIXEL_WATCH_UA,
        screenWidth: 1080,
        screenHeight: 1080,
        viewportWidth: 192,
        viewportHeight: 192,
      }),
    ).toBe("round");
  });

  it("recognizes a Samsung Wear OS watch by its model number", () => {
    expect(
      detectDisplayShape({
        userAgent:
          "Mozilla/5.0 (Linux; Android 13; SM-R915U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        screenWidth: 450,
        screenHeight: 450,
      }),
    ).toBe("round");
  });

  it("keeps Apple Watch rectangular even when its screen is square", () => {
    expect(
      detectDisplayShape({
        userAgent: APPLE_WATCH_UA,
        screenWidth: 396,
        screenHeight: 484,
        viewportWidth: 184,
        viewportHeight: 224,
      }),
    ).toBe("rect");
    expect(
      looksLikeRoundWearOs({
        userAgent: APPLE_WATCH_UA,
        screenWidth: 396,
        screenHeight: 396,
      }),
    ).toBe(false);
  });

  it("lets the CSS shape media feature win over the UA fallback", () => {
    expect(
      detectDisplayShape({
        userAgent: PIXEL_WATCH_UA,
        screenWidth: 450,
        screenHeight: 450,
        shapeRound: true,
      }),
    ).toBe("round");
    expect(
      detectDisplayShape({
        userAgent: PIXEL_WATCH_UA,
        screenWidth: 450,
        screenHeight: 450,
        shapeRect: true,
      }),
    ).toBe("rect");
  });

  it("does not turn a rectangular Wear OS watch into a round one", () => {
    expect(
      detectDisplayShape({
        userAgent:
          "Mozilla/5.0 (Linux; Android 9; Sony SmartWatch 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Mobile Safari/537.36",
        screenWidth: 320,
        screenHeight: 320,
      }),
    ).toBe("rect");
    expect(
      detectDisplayShape({
        userAgent: PIXEL_WATCH_UA,
        screenWidth: 450,
        screenHeight: 400,
      }),
    ).toBe("rect");
  });

  it("classifies folded posture and viewport segments as foldable", () => {
    expect(
      detectDisplayProfile({
        posture: "folded",
        horizontalSegments: 2,
        verticalSegments: 1,
      }),
    ).toMatchObject({
      posture: "folded",
      horizontalSegments: 2,
      verticalSegments: 1,
      isFoldable: true,
    });

    expect(
      detectDisplayProfile({
        posture: "continuous",
        horizontalSegments: 1,
        verticalSegments: 2,
      }),
    ).toMatchObject({
      posture: "continuous",
      verticalSegments: 2,
      isFoldable: true,
    });
  });

  it("normalizes missing, invalid and fractional segment counts", () => {
    expect(
      detectDisplayProfile({
        horizontalSegments: 0,
        verticalSegments: Number.NaN,
      }),
    ).toMatchObject({
      horizontalSegments: 1,
      verticalSegments: 1,
      isFoldable: false,
    });

    expect(detectDisplayProfile({ horizontalSegments: 2.9 })).toMatchObject({
      horizontalSegments: 2,
      isFoldable: true,
    });
  });

  it("keeps desktop and ordinary phones free of watch/fold flags", () => {
    expect(
      detectDisplayProfile({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        screenWidth: 1920,
        screenHeight: 1080,
        viewportWidth: 1440,
        viewportHeight: 900,
      }),
    ).toMatchObject({
      shape: "unknown",
      posture: "unknown",
      isWatch: false,
      isFoldable: false,
    });
  });
});
