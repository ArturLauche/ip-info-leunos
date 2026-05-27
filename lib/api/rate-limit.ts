import { apiError } from "@/lib/api/response";
import net from "node:net";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
let lastSweepAt = 0;

export function getClientIp(request: Request) {
  const directHeaders = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("true-client-ip"),
    request.headers.get("x-real-ip"),
  ];

  for (const value of directHeaders) {
    const normalized = normalizeIpHeader(value);
    if (normalized) return normalized;
  }

  const forwarded = getForwardedFor(request.headers.get("forwarded"));
  if (forwarded) return forwarded;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    for (const entry of forwardedFor.split(",")) {
      const normalized = normalizeIpHeader(entry);
      if (normalized) return normalized;
    }
  }

  return "unknown";
}

export function enforceRateLimit(
  request: Request,
  routeKey: string,
  options: { limit?: number; windowMs?: number } = {},
) {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  sweepExpiredBuckets(now, windowMs);

  const key = `${routeKey}:${getClientIp(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    trimOldestBuckets();
    return null;
  }

  current.count += 1;

  if (current.count <= limit) {
    return null;
  }

  const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
  const response = apiError(
    "rate_limited",
    "Too many requests. Please wait before trying again.",
    429,
    { retryAfterSeconds },
  );

  response.headers.set("retry-after", String(retryAfterSeconds));
  response.headers.set("x-ratelimit-limit", String(limit));
  response.headers.set("x-ratelimit-remaining", "0");
  response.headers.set("x-ratelimit-reset", String(Math.ceil(current.resetAt / 1000)));

  return response;
}

function getForwardedFor(header: string | null) {
  if (!header) return null;

  for (const part of header.split(",")) {
    const match = part.match(/(?:^|;)\s*for=(?:"?)([^;"]+)/i);
    const normalized = normalizeIpHeader(match?.[1] || null);
    if (normalized) return normalized;
  }

  return null;
}

function normalizeIpHeader(value: string | null | undefined) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 128 || trimmed.toLowerCase() === "unknown") {
    return null;
  }

  const withoutQuotes = trimmed.replace(/^"|"$/g, "");
  const directIp = withoutQuotes.split("%", 1)[0];
  if (net.isIP(directIp)) return directIp;

  const withoutPort = withoutQuotes.startsWith("[")
    ? withoutQuotes.replace(/^\[([^\]]+)\](?::\d+)?$/, "$1")
    : withoutQuotes.replace(/:\d+$/, "");
  const withoutZone = withoutPort.split("%", 1)[0];

  return net.isIP(withoutZone) ? withoutZone : null;
}

function sweepExpiredBuckets(now: number, windowMs: number) {
  if (buckets.size < MAX_BUCKETS && now - lastSweepAt < windowMs) {
    return;
  }

  lastSweepAt = now;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  trimOldestBuckets();
}

function trimOldestBuckets() {
  while (buckets.size > MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (!oldestKey) return;
    buckets.delete(oldestKey);
  }
}
