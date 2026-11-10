/**
 * Bounded in-memory memo with a time-to-live, shared by the API routes'
 * upstream-protection caches (DNS answers, ip-api data, reputation summaries,
 * ASN provider results, WHOIS answers …).
 *
 * - Entries older than `ttlMs` are never returned by `get` and are dropped on
 *   access, so a cached value can never outlive its policy.
 * - At most `maxEntries` are kept. A Map iterates in insertion order, so the
 *   first key is always the least recently written (or, with `touchOnGet`,
 *   least recently used) entry and is evicted first.
 * - `peek` exposes the stored timestamp for callers that implement their own
 *   fresh/stale windows (e.g. serve-stale-on-error), within the same TTL.
 *
 * Per-process only: instances do not share state across server replicas.
 */
export interface TtlCacheEntry<V> {
  value: V;
  storedAt: number;
}

export interface TtlCache<V> {
  /** Returns a live (non-expired) value, or undefined. */
  get(key: string, now?: number): V | undefined;
  /** Returns a live entry with its timestamp, or undefined. */
  peek(key: string, now?: number): TtlCacheEntry<V> | undefined;
  set(key: string, value: V, now?: number): void;
  delete(key: string): boolean;
  clear(): void;
  readonly size: number;
}

export interface TtlCacheOptions {
  ttlMs: number;
  maxEntries: number;
  /** Refresh recency on every hit (LRU instead of FIFO-by-write eviction). */
  touchOnGet?: boolean;
}

export function createTtlCache<V>({
  ttlMs,
  maxEntries,
  touchOnGet = true,
}: TtlCacheOptions): TtlCache<V> {
  if (!(ttlMs > 0) || !Number.isInteger(maxEntries) || maxEntries < 1) {
    throw new RangeError("createTtlCache needs a positive ttlMs and maxEntries.");
  }

  const entries = new Map<string, TtlCacheEntry<V>>();

  const peek = (key: string, now = Date.now()) => {
    const entry = entries.get(key);
    if (!entry) return undefined;
    if (now - entry.storedAt >= ttlMs) {
      entries.delete(key);
      return undefined;
    }
    if (touchOnGet) {
      entries.delete(key);
      entries.set(key, entry);
    }
    return entry;
  };

  return {
    get: (key, now) => peek(key, now)?.value,
    peek,
    set(key, value, now = Date.now()) {
      // Re-inserting moves the key to the newest position, so a refreshed
      // entry is not evicted as if it were the oldest.
      entries.delete(key);
      entries.set(key, { value, storedAt: now });
      while (entries.size > maxEntries) {
        const oldest = entries.keys().next().value;
        if (oldest === undefined) break;
        entries.delete(oldest);
      }
    },
    delete: (key) => entries.delete(key),
    clear: () => entries.clear(),
    get size() {
      return entries.size;
    },
  };
}
