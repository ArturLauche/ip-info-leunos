export interface TtlCacheOptions {
  ttlMs: number;
  maxEntries: number;
}

type Entry<V> = { storedAt: number; value: V };

/** Small process-local FIFO cache with lazy expiry and a hard entry count. */
export class TtlCache<V> {
  private readonly entries = new Map<string, Entry<V>>();
  private lastSweepAt = 0;

  constructor(private readonly options: TtlCacheOptions) {
    if (options.ttlMs < 0 || options.maxEntries < 1) {
      throw new RangeError("TTL cache limits must be non-negative and maxEntries must be positive.");
    }
  }

  get(key: string): V | null {
    const now = Date.now();
    this.sweepExpired(now);
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (Date.now() - entry.storedAt >= this.options.ttlMs) {
      this.entries.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: V): void {
    this.sweepExpired(Date.now());
    this.entries.delete(key);
    this.entries.set(key, { storedAt: Date.now(), value });
    while (this.entries.size > this.options.maxEntries) {
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

  private sweepExpired(now: number): void {
    if (now - this.lastSweepAt < this.options.ttlMs) return;
    this.lastSweepAt = now;
    for (const [key, entry] of this.entries) {
      if (now - entry.storedAt >= this.options.ttlMs) this.entries.delete(key);
    }
  }

  get size(): number {
    return this.entries.size;
  }
}

/** Coalesces concurrent work for the same key without changing error semantics. */
export class SingleFlight<T> {
  private readonly pending = new Map<string, Promise<T>>();

  run(key: string, work: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing) return existing;
    return this.track(key, work());
  }

  getPending(key: string): Promise<T> | undefined {
    return this.pending.get(key);
  }

  track(key: string, promise: Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing) return existing;

    const tracked = promise.finally(() => {
      if (this.pending.get(key) === tracked) this.pending.delete(key);
    });
    this.pending.set(key, tracked);
    return tracked;
  }

  clear(): void {
    this.pending.clear();
  }

  get size(): number {
    return this.pending.size;
  }
}
