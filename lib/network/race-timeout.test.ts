import { describe, expect, it } from "vitest";
import { raceResolve, raceWithTimeout } from "./race-timeout";

describe("raceWithTimeout", () => {
  it("resolves with the promise value when fast", async () => {
    await expect(raceWithTimeout(Promise.resolve("ok"), 50, () => new Error("late"))).resolves.toBe("ok");
  });

  it("rejects with the factory error on timeout", async () => {
    const slow = new Promise<string>(() => {});
    await expect(raceWithTimeout(slow, 10, () => new Error("timed out"))).rejects.toThrow("timed out");
  });

  it("propagates the original rejection when fast", async () => {
    await expect(
      raceWithTimeout(Promise.reject(new Error("boom")), 50, () => new Error("late")),
    ).rejects.toThrow("boom");
  });
});

describe("raceResolve", () => {
  it("uses the default DNS timeout message", async () => {
    const slow = new Promise<string>(() => {});
    await expect(raceResolve(slow, 10)).rejects.toThrow("DNS query timed out.");
  });
});
