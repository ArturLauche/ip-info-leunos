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
  if (payload && typeof payload === "object" && "ok" in payload) {
    if (payload.ok === true && "data" in payload && payload.data !== undefined) {
      return payload.data as T;
    }
    if (payload.ok !== false) throw invalidResponse();
    const error = "error" in payload && payload.error && typeof payload.error === "object"
      ? payload.error
      : {};
    throw new ApiClientError(
      "code" in error && typeof error.code === "string" ? error.code : "unknown",
      "message" in error && typeof error.message === "string" ? error.message : "Request failed.",
      "details" in error ? error.details : undefined,
    );
  }

  throw invalidResponse();
}

function invalidResponse() {
  return new ApiClientError("upstream_error", "The server returned an invalid response.");
}

/** Reads our API contract once, preserving structured errors and aborts. */
export async function readApiResponse<T>(response: Response): Promise<T> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw invalidResponse();
  }

  const data = unwrapApiResponse<T>(payload);
  if (!response.ok) throw invalidResponse();
  return data;
}
