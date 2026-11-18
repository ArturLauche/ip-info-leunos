/**
 * Settles with `promise`, or rejects with `createError()` once `timeoutMs`
 * elapses — whichever happens first. The timer is cleared on settlement and
 * unref'd so it never keeps the process alive.
 *
 * The underlying work is not cancelled (Node's resolver APIs have no abort
 * hook); callers use this to bound how long a request waits for it.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  createError: () => Error,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(createError()), timeoutMs);
    timer.unref?.();
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Stop waiting when a caller's overall deadline expires, even if the underlying work is shared. */
export function withAbort<T>(promise: Promise<T>, signal?: AbortSignal | null): Promise<T> {
  if (!signal) return promise;
  let onAbort: () => void;
  const aborted = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(signal.reason);
    if (signal.aborted) onAbort();
    else signal.addEventListener("abort", onAbort, { once: true });
  });
  return Promise.race([promise, aborted]).finally(() => signal.removeEventListener("abort", onAbort));
}
