import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "bad_request"
  | "invalid_target"
  | "target_blocked"
  | "rate_limited"
  | "upstream_error"
  | "timeout"
  | "network_error";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

function withDefaultHeaders(init?: ResponseInit): ResponseInit {
  const headers = new Headers(init?.headers);

  if (!headers.has("cache-control")) {
    headers.set("cache-control", "no-store");
  }

  return {
    ...init,
    headers,
  };
}

export function apiOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, withDefaultHeaders(init));
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json<ApiFailure>(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details }),
      },
    },
    withDefaultHeaders({ status }),
  );
}

export function apiValidationError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError(
      "bad_request",
      "The request parameters are invalid.",
      400,
      error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  return apiError("bad_request", "The request body or query string is invalid.", 400);
}
