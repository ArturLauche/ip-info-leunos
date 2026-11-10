import { describe, expect, it, vi } from "vitest";

const { success } = vi.hoisted(() => ({ success: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success, error: vi.fn() } }));

import { markToasterMounted, notify, onToasterRequested } from "./notify";

describe("notify", () => {
  it("requests the toaster and waits until it is mounted before toasting", async () => {
    const requested = vi.fn();
    const unsubscribe = onToasterRequested(requested);

    const pending = notify("success", "Copied");
    expect(requested).toHaveBeenCalledOnce();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(success).not.toHaveBeenCalled();

    markToasterMounted();
    await pending;
    expect(success).toHaveBeenCalledWith("Copied");
    unsubscribe();
  });
});
