/**
 * Shared GreyNoise community-API quota gate.
 *
 * GreyNoise advertises `X-Rl-Remaining` and `X-Rl-Reset` on every response.
 * Without reading them, a depleted quota is only discovered after a 429 has
 * already been spent, so every reputation check keeps firing requests the
 * provider will reject. This module keeps the advertised state in one place so
 * a depleted quota short-circuits before the request instead of after it.
 *
 * The state is process-wide on purpose: quota belongs to the API key, not to
 * a single lookup.
 */

const UNLIMITED = Number.POSITIVE_INFINITY;

/** Backoff used when a rejection carries no usable reset header. */
const DEFAULT_QUOTA_BACKOFF_MS = 60_000;

let remaining = UNLIMITED;
let resetAtMs = 0;

/** True while the provider advertises quota, or while no quota is known. */
export function greyNoiseQuotaAvailable(nowMs: number): boolean {
  if (nowMs >= resetAtMs) {
    // The advertised reset passed: forget the exhausted count and try again.
    remaining = UNLIMITED;
    resetAtMs = 0;
    return true;
  }
  return remaining > 0;
}

/** Milliseconds until the advertised reset, or 0 when quota is available. */
export function greyNoiseQuotaRetryAfterMs(nowMs: number): number {
  if (greyNoiseQuotaAvailable(nowMs)) return 0;
  return Math.max(0, resetAtMs - nowMs);
}

/**
 * Syncs local state with the provider. `X-Rl-Reset` is either an epoch
 * timestamp or a seconds-from-now delta, so both readings are accepted; a
 * missing header never triggers a backoff.
 */
export function observeGreyNoiseQuota(response: Response, nowMs: number): void {
  const remainingRaw = response.headers.get("x-rl-remaining");
  const reported = remainingRaw === null ? Number.NaN : Number(remainingRaw);
  if (Number.isFinite(reported) && reported >= 0) {
    // Authoritative downward sync only: never grant more than advertised.
    remaining = Math.min(remaining, Math.floor(reported));
  }

  const resetRaw = response.headers.get("x-rl-reset");
  const resetValue = resetRaw === null ? Number.NaN : Number(resetRaw);
  if (Number.isFinite(resetValue) && resetValue > 0) {
    // Values above ~2001 in seconds are epoch timestamps; smaller values are
    // a delta in seconds.
    const resetMs =
      resetValue > 1_000_000_000
        ? resetValue * 1_000
        : nowMs + resetValue * 1_000;
    resetAtMs = Math.max(resetAtMs, resetMs);
  }

  if (response.status === 429) {
    // A rejection is authoritative even without usable headers; without a
    // reset header it still has to block, otherwise the next lookup would
    // immediately spend another request the provider will reject.
    remaining = 0;
    if (resetAtMs <= nowMs) resetAtMs = nowMs + DEFAULT_QUOTA_BACKOFF_MS;
  }
}

export function clearGreyNoiseQuotaForTests(): void {
  remaining = UNLIMITED;
  resetAtMs = 0;
}
