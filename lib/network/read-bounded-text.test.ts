import { expect, it, vi } from "vitest";
import { readBoundedText } from "./read-bounded-text";

it("distinguishes a missing body from an empty payload", async () => {
  expect(await readBoundedText(new Response(null), 0)).toEqual({ kind: "missing" });
  expect(await readBoundedText(new Response(""), 0)).toEqual({ kind: "ok", text: "" });
});

it("decodes a multibyte character split across chunks exactly at the limit", async () => {
  const bytes = new TextEncoder().encode("é");
  const response = new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(bytes.subarray(0, 1));
      controller.enqueue(bytes.subarray(1));
      controller.close();
    },
  }));
  expect(await readBoundedText(response, 2)).toEqual({ kind: "ok", text: "é" });
});

it("rejects one byte over the limit without waiting for cancellation", async () => {
  const cancel = vi.fn(() => new Promise<void>(() => {}));
  const response = new Response(new ReadableStream({
    start: (controller) => controller.enqueue(Uint8Array.of(1, 2)),
    cancel,
  }));
  expect(await readBoundedText(response, 1)).toEqual({ kind: "oversized" });
  expect(cancel).toHaveBeenCalledOnce();
});
