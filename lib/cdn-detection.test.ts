import { describe, expect, it } from "vitest";
import { detectCdn } from "./cdn-detection";

describe("CDN detection", () => {
  it("detects Cloudflare from headers", () => {
    const detection = detectCdn(
      new Headers({
        "cf-ray": "abc",
        "cf-cache-status": "HIT",
      }),
      [],
      "example.com",
    );

    expect(detection).toMatchObject({
      provider: "Cloudflare",
      confidence: "high",
    });
  });

  it("detects CloudFront from CNAME and headers", () => {
    const detection = detectCdn(
      new Headers({
        "x-amz-cf-id": "abc",
      }),
      ["example.cloudfront.net"],
      "example.com",
    );

    expect(detection).toMatchObject({
      provider: "Amazon CloudFront",
      confidence: "high",
    });
  });

  it("returns null when no CDN signals are present", () => {
    const detection = detectCdn(new Headers({ server: "nginx" }), [], "example.com");

    expect(detection).toBeNull();
  });
});
