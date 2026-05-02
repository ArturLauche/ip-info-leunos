import { apiError } from "@/lib/api/response";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function enforceRateLimit(
  request: Request,
  routeKey: string,
  options: { limit?: number; windowMs?: number } = {},
) {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  const key = `${routeKey}:${getClientIp(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;

  if (current.count <= limit) {
    return null;
  }

  const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);

  return apiError(
    "rate_limited",
    "Too many requests. Please wait before trying again.",
    429,
    { retryAfterSeconds },
  );
}
