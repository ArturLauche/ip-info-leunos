import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="20" height="15"/></svg>';

function chunkedResponse(chunks: string[], status = 200): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
      controller.close();
    },
  });
  return new Response(stream, { status });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/flag/[code]", () => {
  it("rejects invalid codes with an empty 400", async () => {
    const response = await GET(new Request("http://localhost/api/flag/xx"), {
      params: Promise.resolve({ code: "xyz" }),
    });

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("");
  });

  it("proxies flag SVGs with immutable caching", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => chunkedResponse([SVG])));

    const response = await GET(new Request("http://localhost/api/flag/de"), {
      params: Promise.resolve({ code: "de" }),
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(response.headers.get("cache-control")).toContain("immutable");
    expect(body).toContain("<svg");
  });

  it("returns an empty 404 for non-SVG upstream bodies", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => chunkedResponse(["not found"])));

    const response = await GET(new Request("http://localhost/api/flag/de"), {
      params: Promise.resolve({ code: "de" }),
    });

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });

  it("returns an empty 502 for oversized chunked bodies", async () => {
    const bigChunk = "x".repeat(16_000);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => chunkedResponse([bigChunk, bigChunk, bigChunk, bigChunk, bigChunk])),
    );

    const response = await GET(new Request("http://localhost/api/flag/de"), {
      params: Promise.resolve({ code: "de" }),
    });

    expect(response.status).toBe(502);
    expect(await response.text()).toBe("");
  });
});
