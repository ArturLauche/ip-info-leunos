export type ClientApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

/**
 * Error thrown when an API route returns `{ ok: false }`. Carries the
 * machine-readable error code so UI code can map it to a translated
 * message instead of matching on English message strings.
 */
export class ApiClientError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
  }
}

export function unwrapApiResponse<T>(payload: unknown): T {
  const response = payload as ClientApiResponse<T>;

  if (response && typeof response === "object" && "ok" in response) {
    if (response.ok) return response.data;
    throw new ApiClientError(
      response.error?.code || "unknown",
      response.error?.message || "Request failed.",
      response.error?.details,
    );
  }

  return payload as T;
}
