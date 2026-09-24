import { describe, expect, it } from "vitest";
import { BoundedBodyError, readBoundedJson, readBoundedText } from "./bounded-body";

describe("readBoundedJson", () => {
  it("parses a small chunked JSON body", async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"hello":'));
        controller.enqueue(new TextEncoder().encode('"world"}'));
        controller.close();
      },
    });

    await expect(readBoundedJson(new Response(body), 1024)).resolves.toEqual({ hello: "world" });
  });

  it("counts UTF-8 bytes and cancels a streamed body on overflow", async () => {
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"symbol":"€€€€€"}'));
      },
      cancel() {
        cancelled = true;
      },
    });

    await expect(readBoundedJson(new Response(body), 10)).rejects.toBeInstanceOf(BoundedBodyError);
    expect(cancelled).toBe(true);
  });

  it("rejects an overstated content length before parsing", async () => {
    const response = new Response('{"ok":true}', {
      headers: { "content-length": "1000" },
    });

    await expect(readBoundedJson(response, 10)).rejects.toBeInstanceOf(BoundedBodyError);
  });

  it("rejects a body-less response", async () => {
    await expect(readBoundedJson(new Response(null), 1024)).rejects.toThrow(/no body/);
  });

  it("reads bounded text without a full response.text() buffer", async () => {
    await expect(readBoundedText(new Response("feed payload"), 32)).resolves.toBe("feed payload");
    await expect(readBoundedText(new Response("too large"), 4)).rejects.toBeInstanceOf(BoundedBodyError);
  });
});
