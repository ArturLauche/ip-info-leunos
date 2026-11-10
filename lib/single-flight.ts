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

/** Shares abortable work until it settles or its last caller releases it. */
export function createAbortableSingleFlight<T>() {
  type Flight = {
    controller: AbortController;
    promise: Promise<T>;
    callers: number;
  };
  const inflight = new Map<string, Flight>();

  return {
    acquire(key: string, work: (signal: AbortSignal) => Promise<T>) {
      let flight = inflight.get(key);
      if (!flight) {
        const controller = new AbortController();
        const created: Flight = {
          controller,
          callers: 0,
          promise: Promise.resolve().then(() => work(controller.signal)).finally(() => {
            if (inflight.get(key) === created) inflight.delete(key);
          }),
        };
        inflight.set(key, created);
        flight = created;
      }
      const shared = flight;
      shared.callers += 1;
      let released = false;
      return {
        promise: shared.promise,
        release() {
          if (released) return;
          released = true;
          shared.callers -= 1;
          if (shared.callers === 0 && inflight.get(key) === shared) {
            // Remove first so a new caller never joins an aborted flight.
            inflight.delete(key);
            shared.controller.abort();
          }
        },
      };
    },
  };
}
