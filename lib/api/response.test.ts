import { describe, expect, it } from "vitest";
import { apiError, apiOk } from "./response";

describe("API response helpers", () => {
  it("marks success responses as non-cacheable by default", () => {
    const response = apiOk({ value: 1 });

    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("marks error responses as non-cacheable by default", async () => {
    const response = apiError("bad_request", "Invalid input.", 400);
    const body = await response.json();

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toMatchObject({
      ok: false,
      error: { code: "bad_request" },
    });
  });
});
