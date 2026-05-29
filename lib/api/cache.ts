type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const DEFAULT_MAX_ENTRIES = 500;
const SWEEP_INTERVAL_MS = 60 * 1000;

export function createCache<T>(options: { ttlMs?: number; maxEntries?: number } = {}) {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  const store = new Map<string, CacheEntry<T>>();
  const inflight = new Map<string, Promise<T>>();
  let lastSweep = 0;

  function sweep(now: number) {
    if (now - lastSweep < SWEEP_INTERVAL_MS && store.size < maxEntries) return;
    lastSweep = now;

    for (const [key, entry] of store) {
      if (entry.expiresAt <= now) store.delete(key);
    }

    while (store.size > maxEntries) {
      const oldest = store.keys().next().value;
      if (!oldest) break;
      store.delete(oldest);
    }
  }

  function get(key: string): T | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  function set(key: string, value: T) {
    sweep(Date.now());
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async function getOrFetch(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = get(key);
    if (cached !== undefined) return cached;

    const existing = inflight.get(key);
    if (existing) return existing;

    const promise = fetcher().then(
      (value) => {
        set(key, value);
        inflight.delete(key);
        return value;
      },
      (error) => {
        inflight.delete(key);
        throw error;
      },
    );

    inflight.set(key, promise);
    return promise;
  }

  return { get, set, getOrFetch };
}
