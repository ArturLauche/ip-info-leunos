import { afterEach, expect, it, vi } from "vitest";
import { clearIpLookupCacheForTests, lookupIpApiCached } from "./ip-lookup-cache";

afterEach(() => {
  clearIpLookupCacheForTests();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it.each(["ip", "reputation"])("honors both deadlines when %s starts the shared lookup", async (firstCaller) => {
  vi.useFakeTimers();
  const head = Promise.withResolvers<Response>();
  const fetchMock = vi.fn((_url: string, init: RequestInit) => {
    init.signal!.addEventListener("abort", () => head.reject(init.signal!.reason));
    return head.promise;
  });
  vi.stubGlobal("fetch", fetchMock);

  const ipLookup = () => lookupIpApiCached("8.8.8.8", "en");
  const reputationLookup = () => lookupIpApiCached("8.8.8.8", "en", { timeoutMs: 4_000 });
  const first = firstCaller === "ip" ? ipLookup() : reputationLookup();
  const second = firstCaller === "ip" ? reputationLookup() : ipLookup();
  const ip = firstCaller === "ip" ? first : second;
  const reputation = firstCaller === "reputation" ? first : second;
  await vi.advanceTimersByTimeAsync(4_000);
  await expect(reputation).resolves.toBeNull();
  await vi.advanceTimersByTimeAsync(500);
  head.resolve(Response.json({ status: "success", query: "8.8.8.8" }));
  const data = await ip;
  expect(data?.query).toBe("8.8.8.8");
  expect(await ipLookup()).toEqual(data);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("aborts an abandoned flight when the last waiter expires", async () => {
  vi.useFakeTimers();
  const aborted = vi.fn();
  vi.stubGlobal("fetch", (_url: string, init: RequestInit) => new Promise<Response>((_resolve, reject) => {
    init.signal!.addEventListener("abort", () => {
      aborted();
      reject(init.signal!.reason);
    });
  }));
  const pending = lookupIpApiCached("1.1.1.1", "en", { timeoutMs: 4_000 });
  await vi.advanceTimersByTimeAsync(4_000);
  expect(await pending).toBeNull();
  expect(aborted).toHaveBeenCalledOnce();
});
