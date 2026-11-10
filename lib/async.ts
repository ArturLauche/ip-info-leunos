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
