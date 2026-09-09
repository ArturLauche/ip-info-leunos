import { describe, expect, it } from "vitest";
import { ApiClientError, readApiResponse, unwrapApiResponse } from "./client";

describe("unwrapApiResponse", () => {
  it("returns data for successful payloads", () => {
    expect(unwrapApiResponse({ ok: true, data: { ip: "8.8.8.8" } })).toEqual({
      ip: "8.8.8.8",
    });
  });

  it("throws ApiClientError with code for API errors", () => {
    try {
      unwrapApiResponse({ ok: false, error: { code: "rate_limited", message: "Slow down." } });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError);
      expect((error as ApiClientError).code).toBe("rate_limited");
    }
  });

  it("defaults to unknown code for malformed errors", () => {
    try {
      unwrapApiResponse({ ok: false });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError);
      expect((error as ApiClientError).code).toBe("unknown");
    }
  });

  it.each([null, [1, 2, 3], {}, "gateway error", { ok: "true", data: {} }, { ok: true }])("rejects malformed envelopes: %j", (payload) => {
    expect(() => unwrapApiResponse(payload)).toThrow(ApiClientError);
  });
});

describe("readApiResponse", () => {
  it("preserves a structured rate-limit error and its retry details", async () => {
    const response = Response.json({ ok: false, error: { code: "rate_limited", message: "Slow down.", details: { retryAfterSeconds: 17 } } }, { status: 429 });
    await expect(readApiResponse(response)).rejects.toMatchObject({ code: "rate_limited", details: { retryAfterSeconds: 17 } });
  });

  it("rejects a success envelope on an error HTTP status", async () => {
    await expect(readApiResponse(Response.json({ ok: true, data: {} }, { status: 502 }))).rejects.toMatchObject({ code: "upstream_error" });
  });

  it("turns non-JSON gateway responses into a code the UI can translate", async () => {
    await expect(readApiResponse(new Response("<html>Bad gateway</html>", { status: 502 }))).rejects.toMatchObject({ code: "upstream_error" });
  });

  it("returns valid data and keeps explicit null data valid", async () => {
    await expect(readApiResponse(Response.json({ ok: true, data: { target: "example.com" } }))).resolves.toEqual({ target: "example.com" });
    await expect(readApiResponse(Response.json({ ok: true, data: null }))).resolves.toBeNull();
  });

  it("does not turn cancellation during body reading into a server error", async () => {
    const response = new Response(new ReadableStream({ start(controller) { controller.error(new DOMException("Aborted", "AbortError")); } }));
    await expect(readApiResponse(response)).rejects.toMatchObject({ name: "AbortError" });
  });
});
