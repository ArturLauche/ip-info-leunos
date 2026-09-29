/**
 * Shares one in-flight promise per key, so identical concurrent requests wait
 * for the same upstream work instead of repeating it. Nothing is retained after
 * settlement: results are cached (or not) by the caller's own policy.
 */
export function createSingleFlight<T>() {
  const inflight = new Map<string, Promise<T>>();

  return {
    run(key: string, work: () => Promise<T>): Promise<T> {
      const existing = inflight.get(key);
      if (existing) return existing;

      const shared: Promise<T> = (async () => work())().finally(() => {
        if (inflight.get(key) === shared) inflight.delete(key);
      });
      inflight.set(key, shared);
      return shared;
    },

    get size() {
      return inflight.size;
    },
  };
}
