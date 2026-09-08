/**
 * Shared bounded-resolver helper.
 *
 * Replaces three copy-pasted timeout races (`app/api/dns/route.ts`,
 * `app/api/cdn/route.ts`, `lib/network/target.ts` style) with one tested
 * implementation. Timeout values stay at the call sites — this helper only
 * deduplicates the race + timer cleanup, it never picks a deadline.
 */

/** Races `promise` against `timeoutMs`; rejects with `createError()` on timeout. */
export function raceWithTimeout<T>(
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
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** Convenience for resolver calls with a plain `Error` timeout. */
export function raceResolve<T>(promise: Promise<T>, timeoutMs: number, message = "DNS query timed out."): Promise<T> {
  return raceWithTimeout(promise, timeoutMs, () => new Error(message));
}
