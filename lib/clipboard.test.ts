import { describe, expect, it, vi } from "vitest";
import { writeClipboardText, type ClipboardEnvironment } from "./clipboard";

function createDocument(copied: boolean) {
  const field = {
    value: "",
    style: { cssText: "" },
    setAttribute: vi.fn(),
    select: vi.fn(),
    setSelectionRange: vi.fn(),
    remove: vi.fn(),
  };
  const previous = { focus: vi.fn() };
  const doc = {
    activeElement: previous,
    body: { append: vi.fn() },
    createElement: vi.fn(() => field),
    execCommand: vi.fn(() => copied),
  };
  return { doc: doc as unknown as ClipboardEnvironment["document"], field, previous, raw: doc };
}

describe("writeClipboardText", () => {
  it("prefers the async Clipboard API", async () => {
    const writeText = vi.fn(async () => {});
    const { doc, raw } = createDocument(true);

    await writeClipboardText("203.0.113.7", { clipboard: { writeText }, document: doc });

    expect(writeText).toHaveBeenCalledWith("203.0.113.7");
    expect(raw.execCommand).not.toHaveBeenCalled();
  });

  it("falls back to a hidden selection when the API is unavailable", async () => {
    const { doc, field, previous, raw } = createDocument(true);

    await writeClipboardText("2001:db8::1", { document: doc });

    expect(field.value).toBe("2001:db8::1");
    expect(raw.execCommand).toHaveBeenCalledWith("copy");
    expect(field.remove).toHaveBeenCalled();
    expect(previous.focus).toHaveBeenCalled();
  });

  it("falls back when the API rejects, e.g. permission denied", async () => {
    const writeText = vi.fn(async () => {
      throw new DOMException("denied", "NotAllowedError");
    });
    const { doc, raw } = createDocument(true);

    await expect(
      writeClipboardText("example.com", { clipboard: { writeText }, document: doc }),
    ).resolves.toBeUndefined();
    expect(raw.execCommand).toHaveBeenCalledWith("copy");
  });

  it("rejects when no mechanism can copy, and cleans up the field", async () => {
    const { doc, field } = createDocument(false);

    await expect(writeClipboardText("x", { document: doc })).rejects.toThrow();
    expect(field.remove).toHaveBeenCalled();
    await expect(writeClipboardText("x", {})).rejects.toThrow();
  });

  it("re-throws the original API error when there is no document to fall back to", async () => {
    const failure = new Error("denied");
    const writeText = vi.fn(async () => {
      throw failure;
    });

    await expect(writeClipboardText("x", { clipboard: { writeText } })).rejects.toBe(failure);
  });
});
