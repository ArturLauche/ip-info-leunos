import { describe, expect, it } from "vitest";
import { readBoundedJson } from "./bounded-body";

describe("readBoundedJson", () => {
  it("parses a small JSON body", async () => {
    const data = await readBoundedJson(
      new Response(JSON.stringify({ hello: "world" })),
      1024,
    );

    expect(data).toEqual({ hello: "world" });
  });

  it("rejects an oversized body without buffering it fully", async () => {
    const oversized = "x".repeat(2048);

    await expect(
      readBoundedJson(new Response(JSON.stringify({ data: oversized })), 1024),
    ).rejects.toThrow(/exceeded the 1024 byte limit/);
  });

  it("counts bytes, not string code units", async () => {
    // "€" is 3 bytes in UTF-8 but a single UTF-16 code unit.
    const body = JSON.stringify({ symbol: "€".repeat(400) });
    expect(body.length).toBeLessThan(1024);

    await expect(readBoundedJson(new Response(body), 1024)).rejects.toThrow(
      /exceeded the 1024 byte limit/,
    );
  });

  it("rejects a body-less response", async () => {
    const response = new Response(null, { status: 204 });

    await expect(readBoundedJson(response, 1024)).rejects.toThrow(/no body/);
  });
});
