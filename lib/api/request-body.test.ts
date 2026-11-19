import { describe, expect, it } from "vitest";
import { readBoundedJsonBody } from "./request-body";

const MAX_BYTES = 64;

function requestWith(body: string | ReadableStream<Uint8Array> | null, headers?: HeadersInit) {
  return new Request("https://example.test/api/ping", {
    method: "POST",
    headers,
    body: body as BodyInit | null | undefined,
    ...(body instanceof ReadableStream ? { duplex: "half" } : {}),
  } as RequestInit);
}

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

describe("readBoundedJsonBody", () => {
  it("parses a small JSON body", async () => {
    const result = await readBoundedJsonBody(requestWith('{"target":"example.com"}'), MAX_BYTES);
    expect(result).toEqual({ ok: true, value: { target: "example.com" } });
  });

  it("rejects invalid JSON", async () => {
    const result = await readBoundedJsonBody(requestWith("{"), MAX_BYTES);
    expect(result).toEqual({ ok: false, reason: "invalid_json" });
  });

  it("rejects an empty body", async () => {
    const result = await readBoundedJsonBody(requestWith(null), MAX_BYTES);
    expect(result).toEqual({ ok: false, reason: "invalid_json" });
  });

  it("rejects a declared content-length above the cap before reading", async () => {
    const result = await readBoundedJsonBody(
      requestWith('{"a":1}', { "content-length": String(MAX_BYTES + 1) }),
      MAX_BYTES,
    );
    expect(result).toEqual({ ok: false, reason: "too_large" });
  });

  it("accepts a declared content-length at the cap", async () => {
    const body = '{"a":1}';
    const result = await readBoundedJsonBody(
      requestWith(body, { "content-length": String(MAX_BYTES) }),
      MAX_BYTES,
    );
    expect(result).toEqual({ ok: true, value: { a: 1 } });
  });

  it("caps a chunked body that exceeds the limit without a content-length", async () => {
    const result = await readBoundedJsonBody(
      requestWith(streamOf(["x".repeat(40), "y".repeat(40)])),
      MAX_BYTES,
    );
    expect(result).toEqual({ ok: false, reason: "too_large" });
  });

  it("caps a body whose content-length lies about its size", async () => {
    const result = await readBoundedJsonBody(
      requestWith(streamOf(["x".repeat(MAX_BYTES + 1)]), { "content-length": "10" }),
      MAX_BYTES,
    );
    expect(result).toEqual({ ok: false, reason: "too_large" });
  });

  it("accepts a chunked body exactly at the cap", async () => {
    const padding = " ".repeat(MAX_BYTES - '{"a":1}'.length);
    const result = await readBoundedJsonBody(
      requestWith(streamOf(['{"a":1}', padding])),
      MAX_BYTES,
    );
    expect(result).toEqual({ ok: true, value: { a: 1 } });
  });
});
