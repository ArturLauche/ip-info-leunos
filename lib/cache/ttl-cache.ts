/**
 * Shared TTL memo helper for server-side public-data caches.
 *
 * Extracted from three copy-pasted implementations (`app/api/dns/route.ts`,
 * `lib/ip-lookup-cache.ts`, `app/api/reputation/route.ts`) that all had the
 * same semantics: TTL expiry on read, FIFO eviction of the oldest entry while
 * over capacity. Response headers stay `no-store` at the HTTP layer; this
 * only avoids hammering resolvers/upstreams with repeat work for popular
 * public lookups within a short window.
 *
 * Semantics are intentionally preserved exactly (no MRU refresh on `get`)
 * so migrating callers is behavior-neutral.
 */

export interface TtlCacheOptions {
  ttlMs: number;
  maxEntries: number;
}

export class TtlCache<V> {
  private readonly ttlMs: number;
  private readonly maxEntries: number;
  private readonly entries = new Map<string, { storedAt: number; value: V }>();

  constructor(options: TtlCacheOptions) {
    this.ttlMs = options.ttlMs;
    this.maxEntries = options.maxEntries;
  }

  get(key: string): V | null {
    const cached = this.entries.get(key);
    if (!cached) return null;
    if (Date.now() - cached.storedAt >= this.ttlMs) {
      this.entries.delete(key);
      return null;
    }
    return cached.value;
  }

  set(key: string, value: V): void {
    this.entries.set(key, { storedAt: Date.now(), value });
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.entries.delete(oldest);
    }
  }

  delete(key: string): void {
    this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }
}

export function createTtlCache<V>(options: TtlCacheOptions): TtlCache<V> {
  return new TtlCache<V>(options);
}
