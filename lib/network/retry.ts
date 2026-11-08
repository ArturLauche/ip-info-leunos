/**
 * Bounded retry with exponential backoff and jitter for transient failures.
 *
 * The policy is deliberately conservative: only HTTP 408/429/500/502/503/504
 * and connection-level errors are retried, only idempotent requests are
 * retried by default, and every wait is abortable. Callers with an existing
 * deadline pass its signal; a retry can never outlive that deadline.
 */

export const DEFAULT_MAX_ATTEMPTS = 4;
export const DEFAULT_BASE_DELAY_MS = 1_000;
export const DEFAULT_MAX_DELAY_MS = 8_000;
export const DEFAULT_JITTER_RATIO = 0.2;
export const DEFAULT_MAX_RETRY_AFTER_MS = 10_000;

const RETRYABLE_HTTP_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

/** Connection failures that are worth another attempt. */
const TRANSIENT_NETWORK_CODES = new Set([
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTDOWN",
  "EHOSTUNREACH",
  "ENETDOWN",
  "ENETUNREACH",
  "EPIPE",
  "ETIMEDOUT",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_CLOSED",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

export function isRetryableHttpStatus(status: number): boolean {
  return RETRYABLE_HTTP_STATUSES.has(status);
}

/**
 * True for connection-level failures (DNS hiccups, resets, unreachable
 * hosts). Abort and timeout signals are not retried: they usually represent
 * the caller's overall deadline, so another attempt would only delay the
 * error.
 */
export function isTransientNetworkError(error: unknown): boolean {
  return isTransientNetworkErrorInternal(error, new Set());
}

function isTransientNetworkErrorInternal(error: unknown, seen: Set<unknown>): boolean {
  if (error instanceof AggregateError) {
    return error.errors.some((entry) => isTransientNetworkErrorInternal(entry, seen));
  }
  if (!(error instanceof Error) || seen.has(error)) return false;
  seen.add(error);

  if (error.name === "AbortError" || error.name === "TimeoutError") return false;

  const code = (error as NodeJS.ErrnoException).code;
  if (typeof code === "string" && TRANSIENT_NETWORK_CODES.has(code)) return true;

  // Node's fetch reports connection failures as TypeError("fetch failed")
  // with the real reason on `cause`.
  if (error instanceof TypeError && /fetch failed|network|load failed/i.test(error.message)) {
    return true;
  }

  const cause = (error as { cause?: unknown }).cause;
  return cause !== undefined && isTransientNetworkErrorInternal(cause, seen);
}

/**
 * Parses a `Retry-After` header (delta-seconds or HTTP-date) into a delay.
 * Returns null for missing or malformed values.
 */
export function parseRetryAfterMs(
  value: string | null | undefined,
  nowMs = Date.now(),
): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) return Number(trimmed) * 1_000;

  const timestamp = Date.parse(trimmed);
  if (Number.isNaN(timestamp)) return null;
  return Math.max(0, timestamp - nowMs);
}

export interface BackoffOptions {
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Fraction of the exponential delay that may be added or removed. */
  jitterRatio?: number;
  random?: () => number;
}

/**
 * Delay after failed attempt `attempt` (1-based): base, 2x base, 4x base, …
 * capped at `maxDelayMs`, with symmetric jitter. With the defaults and
 * `random()` at 0.5 the sequence is approximately 1s, 2s, 4s.
 */
export function backoffDelayMs(attempt: number, options: BackoffOptions = {}): number {
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const maxDelayMs = options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  const jitterRatio = Math.min(1, Math.max(0, options.jitterRatio ?? DEFAULT_JITTER_RATIO));
  const random = options.random ?? Math.random;

  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** Math.max(0, attempt - 1));
  const jitter = exponential * jitterRatio;
  const delay = exponential - jitter + random() * jitter * 2;
  return Math.min(maxDelayMs, Math.max(0, Math.round(delay)));
}

/** Error marker for an HTTP response that should be retried. */
export class RetryableHttpError extends Error {
  readonly status: number;
  readonly retryAfterMs: number | null;
  readonly response?: Response;

  constructor(
    status: number,
    retryAfterMs: number | null = null,
    response?: Response,
    message = `HTTP ${status}`,
  ) {
    super(message);
    this.name = "RetryableHttpError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
    this.response = response;
  }
}

export interface RetryDecision {
  retry: boolean;
  retryAfterMs?: number | null;
}

export type RetryClassifier = (error: unknown) => boolean | RetryDecision;

export interface RetryEvent {
  /** Failed attempt number (1-based). */
  attempt: number;
  nextAttempt: number;
  delayMs: number;
  error: unknown;
}

export interface RetryOptions {
  /** Total attempts including the initial one. Defaults to 4. */
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitterRatio?: number;
  /**
   * A provider-requested wait longer than this is not honored; the operation
   * fails instead of making the caller wait an unreasonable amount of time.
   */
  maxRetryAfterMs?: number;
  signal?: AbortSignal | null;
  classify?: RetryClassifier;
  onRetry?: (event: RetryEvent) => void;
  random?: () => number;
  now?: () => number;
  /** Test seam; defaults to an abortable timer. */
  sleep?: (delayMs: number, signal?: AbortSignal | null) => Promise<void>;
}

function normalizeDecision(decision: boolean | RetryDecision): RetryDecision {
  return typeof decision === "boolean" ? { retry: decision } : decision;
}

function defaultClassifier(error: unknown): RetryDecision {
  if (error instanceof RetryableHttpError) {
    return {
      retry: isRetryableHttpStatus(error.status),
      retryAfterMs: error.retryAfterMs,
    };
  }
  return { retry: isTransientNetworkError(error) };
}

function abortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException("The operation was aborted.", "AbortError");
}

/** Sleeps for `delayMs`, rejecting immediately when the signal aborts. */
export function sleepWithSignal(
  delayMs: number,
  signal?: AbortSignal | null,
): Promise<void> {
  if (signal?.aborted) return Promise.reject(abortReason(signal));
  if (delayMs <= 0) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, delayMs);
    (timer as { unref?: () => void }).unref?.();

    const onAbort = () => {
      cleanup();
      reject(abortReason(signal!));
    };
    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Runs `operation` until it succeeds, a permanent error is thrown, the retry
 * budget is exhausted, or `signal` aborts. The operation receives the attempt
 * number so callers can adjust per-attempt behavior (for example, skip a body
 * read on the final attempt).
 */
export async function withRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = Math.max(1, Math.floor(options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS));
  const maxRetryAfterMs = options.maxRetryAfterMs ?? DEFAULT_MAX_RETRY_AFTER_MS;
  const classify = options.classify ?? defaultClassifier;
  const sleep = options.sleep ?? sleepWithSignal;
  const signal = options.signal ?? null;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    signal?.throwIfAborted();

    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (signal?.aborted) throw abortReason(signal);

      const decision = normalizeDecision(classify(error));
      if (!decision.retry || attempt >= maxAttempts) throw error;

      let delayMs: number;
      if (decision.retryAfterMs !== null && decision.retryAfterMs !== undefined) {
        if (decision.retryAfterMs > maxRetryAfterMs) throw error;
        delayMs = Math.max(0, decision.retryAfterMs);
      } else {
        delayMs = backoffDelayMs(attempt, options);
      }

      options.onRetry?.({ attempt, nextAttempt: attempt + 1, delayMs, error });
      await sleep(delayMs, signal);
    }
  }

  throw lastError;
}

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface FetchWithRetryOptions extends RetryOptions {
  /**
   * Retry a method that is not GET/HEAD. Only set this when the request is
   * guaranteed to be idempotent (for example, a read-only search POST).
   */
  idempotent?: boolean;
  fetchImpl?: FetchLike;
}

/**
 * Fetch wrapper that retries transient status codes and connection errors.
 * The final response (success or non-retryable/exhausted failure) is returned
 * with its body intact so callers can inspect it normally.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const method = (
    init.method ??
    (typeof Request !== "undefined" && input instanceof Request ? input.method : "GET")
  ).toUpperCase();
  const idempotent = options.idempotent ?? (method === "GET" || method === "HEAD");
  const fetchImpl = options.fetchImpl ?? fetch;
  if (!idempotent) return fetchImpl(input, init);

  const maxAttempts = Math.max(1, Math.floor(options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS));
  const maxRetryAfterMs = options.maxRetryAfterMs ?? DEFAULT_MAX_RETRY_AFTER_MS;
  const now = options.now ?? Date.now;
  const userClassify = options.classify;

  return withRetry(
    async (attempt) => {
      const response = await fetchImpl(input, init);
      if (!isRetryableHttpStatus(response.status)) return response;

      const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"), now());
      if (
        attempt >= maxAttempts ||
        (retryAfterMs !== null && retryAfterMs > maxRetryAfterMs)
      ) {
        return response;
      }

      // Release the discarded connection before waiting. The final response
      // above is returned untouched, so callers can still read its body.
      await response.body?.cancel().catch(() => {});
      throw new RetryableHttpError(response.status, retryAfterMs, response);
    },
    {
      ...options,
      maxAttempts,
      signal: options.signal ?? init.signal ?? null,
      classify: (error) => {
        if (error instanceof RetryableHttpError) {
          return {
            retry: isRetryableHttpStatus(error.status),
            retryAfterMs: error.retryAfterMs,
          };
        }
        return userClassify ? userClassify(error) : defaultClassifier(error);
      },
    },
  );
}
