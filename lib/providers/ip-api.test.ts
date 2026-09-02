import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearIpApiBudgetForTests, lookupIpApi } from "./ip-api";

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

beforeEach(() => {
  clearIpApiBudgetForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
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

  it("stops fetching once the per-minute upstream budget is spent", async () => {
    const fetchMock = vi.fn(async () => chunkedResponse([SUCCESS_BODY]));
    vi.stubGlobal("fetch", fetchMock);

    for (let i = 0; i < 40; i += 1) {
      await expect(lookupIpApi(`8.8.8.${i % 250}`)).resolves.toMatchObject({ status: "success" });
    }
    await expect(lookupIpApi("8.8.8.8")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(40);
  });

  it("backs off while the provider reports no remaining quota", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async () => {
      const response = chunkedResponse([SUCCESS_BODY]);
      return new Response(response.body, {
        status: 200,
        headers: { "x-rl": "0", "x-ttl": "30" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(lookupIpApi("8.8.8.8")).resolves.toMatchObject({ status: "success" });
    // Still inside the provider-advertised wait: no second fetch happens.
    await expect(lookupIpApi("8.8.8.8")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(31_000);
    await expect(lookupIpApi("8.8.8.8")).resolves.toMatchObject({ status: "success" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("backs off after an upstream 429", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(lookupIpApi("8.8.8.8")).resolves.toBeNull();
    await expect(lookupIpApi("8.8.8.8")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
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
