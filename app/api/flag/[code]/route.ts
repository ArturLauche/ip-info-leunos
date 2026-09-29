// Same-origin proxy for country flag SVGs.
//
// Flags are served through the application instead of letting the browser hit a
// third-party flag CDN directly: that would expose every visitor's IP address,
// origin and requested country to the third party, and would break for users
// behind a strict CSP or a network/privacy blocker. Here only the server talks
// to the upstream, and the result is cached aggressively (flags are immutable).

import { enforceRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

const UPSTREAM_TIMEOUT_MS = 5_000;
// Flag SVGs are a few kilobytes; anything larger is an upstream anomaly.
const MAX_FLAG_BYTES = 64_000;
// Limiter headers forwarded on a 429 so this route speaks the same contract as
// every other public route.
const RATE_LIMIT_HEADERS = [
  "retry-after",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset",
] as const;
// One year, immutable — a country's flag asset never changes under its code.
const CACHE_CONTROL = "public, max-age=31536000, immutable";

/** Bounded upstream read: counts response bytes and cancels past the cap. */
async function readBoundedSvg(response: Response): Promise<string | null> {
  const body = response.body;
  if (!body) return null;

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.byteLength;
    if (receivedBytes > MAX_FLAG_BYTES) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  // Browsers cache each flag for a year, so a normal visitor makes a handful
  // of requests. Without a trusted proxy header every visitor resolves to the
  // same "unknown" bucket, and one shared budget on an <img> endpoint would
  // starve everyone's flags, so only identifiable clients are limited.
  const limited =
    getClientIp(request) === "unknown"
      ? null
      : enforceRateLimit(request, "flag", { limit: 120, windowMs: 60_000 });
  if (limited) {
    // Consumers are <img> tags: keep the body empty like the other error responses.
    const headers = new Headers({ "cache-control": "no-store" });
    for (const name of RATE_LIMIT_HEADERS) {
      const value = limited.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(null, { status: 429, headers });
  }

  const { code } = await context.params;
  const normalized = code?.trim().toLowerCase();

  if (!normalized || !/^[a-z]{2}$/.test(normalized)) {
    // Image endpoint: locale-neutral contract, so error bodies stay empty.
    // Consumers are <img> tags; only the status code is observable.
    return new Response(null, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  timer.unref?.();

  try {
    const upstream = await fetch(`https://flagcdn.com/${normalized}.svg`, {
      signal: controller.signal,
      // Flags are effectively immutable, so let the runtime cache them.
      cache: "force-cache",
    });

    if (!upstream.ok) {
      return new Response(null, { status: 404 });
    }

    const svg = await readBoundedSvg(upstream);
    // Defend against the upstream ever returning a non-SVG (or absurdly
    // large) body.
    if (svg === null || !svg.includes("<svg")) {
      return new Response(null, { status: svg === null ? 502 : 404 });
    }

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": CACHE_CONTROL,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
