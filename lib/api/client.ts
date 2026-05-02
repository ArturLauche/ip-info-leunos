export type ClientApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

export function unwrapApiResponse<T>(payload: unknown): T {
  const response = payload as ClientApiResponse<T>;

  if (response && typeof response === "object" && "ok" in response) {
    if (response.ok) return response.data;
    throw new Error(response.error?.message || "Request failed.");
  }

  return payload as T;
}
