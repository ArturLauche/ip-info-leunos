import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupIpApi } from "./ip-api";

const SUCCESS_BODY = JSON.stringify({
  status: "success",
  country: "United States",
  countryCode: "US",
  query: "8.8.8.8",
});

function chunkedResponse(chunks: string[]): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
      controller.close();
    },
  });
  // Deliberately no Content-Length: chunked-style delivery.
  return new Response(stream, { status: 200 });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lookupIpApi bounded reads", () => {
  it("parses a normal chunked response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => chunkedResponse([SUCCESS_BODY])));
    const data = await lookupIpApi("8.8.8.8");

    expect(data).toMatchObject({ status: "success", query: "8.8.8.8" });
  });

  it("rejects an oversized body without a Content-Length header", async () => {
    const bigChunk = "x".repeat(16_000);
    vi.stubGlobal("fetch", vi.fn(async () => chunkedResponse([bigChunk, bigChunk, bigChunk, bigChunk, bigChunk])));

    await expect(lookupIpApi("8.8.8.8")).resolves.toBeNull();
  });

  it("rejects an overstated Content-Length without reading the body", async () => {
    const fetchMock = vi.fn(async () => chunkedResponse([SUCCESS_BODY]));
    vi.stubGlobal("fetch", fetchMock);
    const oversized = new Response(SUCCESS_BODY, {
      status: 200,
      headers: { "content-length": String(10_000_000) },
    });
    fetchMock.mockResolvedValueOnce(oversized);

    await expect(lookupIpApi("8.8.8.8")).resolves.toBeNull();
  });
});
