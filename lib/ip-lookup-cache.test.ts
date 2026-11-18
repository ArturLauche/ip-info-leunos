import { afterEach, expect, it, vi } from "vitest";
import { clearIpLookupCacheForTests, lookupIpApiCached } from "./ip-lookup-cache";

afterEach(() => {
  clearIpLookupCacheForTests();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("lets a shorter waiter leave a shared lookup while the original caller gets the answer", async () => {
  vi.useFakeTimers();
  const head = Promise.withResolvers<Response>();
  const fetchMock = vi.fn(() => head.promise);
  vi.stubGlobal("fetch", fetchMock);
  const first = lookupIpApiCached("8.8.8.8", "en");
  const shorter = lookupIpApiCached("8.8.8.8", "en", { timeoutMs: 4_000 });
  await vi.advanceTimersByTimeAsync(4_000);
  await expect(shorter).resolves.toBeNull();
  head.resolve(Response.json({ status: "success", query: "8.8.8.8" }));
  const data = await first;
  expect(data?.query).toBe("8.8.8.8");
  expect(await lookupIpApiCached("8.8.8.8", "en")).toEqual(data);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
