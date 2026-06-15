// Same-origin proxy for country flag SVGs.
//
// Flags are served through the application instead of letting the browser hit a
// third-party flag CDN directly: that would expose every visitor's IP address,
// origin and requested country to the third party, and would break for users
// behind a strict CSP or a network/privacy blocker. Here only the server talks
// to the upstream, and the result is cached aggressively (flags are immutable).

export const runtime = "nodejs";

const UPSTREAM_TIMEOUT_MS = 5_000;
// One year, immutable — a country's flag asset never changes under its code.
const CACHE_CONTROL = "public, max-age=31536000, immutable";

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { code } = await context.params;
  const normalized = code?.trim().toLowerCase();

  if (!normalized || !/^[a-z]{2}$/.test(normalized)) {
    return new Response("Invalid country code", { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`https://flagcdn.com/${normalized}.svg`, {
      signal: controller.signal,
      // Flags are effectively immutable, so let the runtime cache them.
      cache: "force-cache",
    });

    if (!upstream.ok) {
      return new Response("Flag not found", { status: 404 });
    }

    const svg = await upstream.text();
    // Defend against the upstream ever returning a non-SVG error body.
    if (!svg.includes("<svg")) {
      return new Response("Flag not found", { status: 404 });
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
    return new Response("Flag upstream error", { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
