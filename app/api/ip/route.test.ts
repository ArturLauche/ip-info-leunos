import { describe, expect, it } from "vitest";
import { assessRequestProxyHints } from "@/lib/request-proxy-hints";

describe("request proxy hint assessment", () => {
  it("does not treat x-forwarded-for alone as proxy evidence", () => {
    const result = assessRequestProxyHints(
      new Headers({
        "x-forwarded-for": "8.8.8.8, 1.1.1.1",
      }),
    );

    expect(result.detected).toBe(false);
  });

  it("detects explicit enterprise proxy product headers", () => {
    const result = assessRequestProxyHints(
      new Headers({
        "x-zscaler-client": "secure web gateway",
      }),
    );

    expect(result.detected).toBe(true);
    expect(result.confidence).toBe("high");
    expect(result.category).toBe("security-gateway");
    expect(result.labels).toContain("Zscaler header");
  });

  it("combines via headers with forwarded chains", () => {
    const result = assessRequestProxyHints(
      new Headers({
        via: "1.1 edge.example",
        "x-forwarded-for": "8.8.8.8, 1.1.1.1",
      }),
    );

    expect(result.detected).toBe(true);
    expect(result.confidence).toBe("medium");
    expect(result.labels).toContain("Via header");
    expect(result.labels).toContain("forwarded public IP chain");
  });
});
