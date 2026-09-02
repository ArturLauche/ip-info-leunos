import { z } from "zod";

/**
 * Shared client for the ip-api.com metadata service, used by /api/ip and
 * /api/reputation. The free tier only serves plain HTTP; no secrets are
 * ever sent, only the queried IP.
 */

const IP_API_FIELDS =
  "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query";

const ipApiPayloadSchema = z
  .object({
    status: z.enum(["success", "fail"]),
    message: z.string().optional(),
    country: z.string().optional(),
    countryCode: z.string().optional(),
    region: z.string().optional(),
    regionName: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
    lat: z.number().optional(),
    lon: z.number().optional(),
    timezone: z.string().optional(),
    isp: z.string().optional(),
    org: z.string().optional(),
    as: z.string().optional(),
    asname: z.string().optional(),
    reverse: z.string().optional(),
    mobile: z.boolean().optional(),
    proxy: z.boolean().optional(),
    hosting: z.boolean().optional(),
    query: z.string().optional(),
  })
  .passthrough();

export type IpApiData = z.infer<typeof ipApiPayloadSchema>;

/**
 * Provider-level upstream budget for the free ip-api.com endpoint, shared by
 * every caller (/api/ip explicit + auto-detect branches, /api/reputation).
 * The free tier allows 45 requests/minute per source IP; this process-wide
 * fixed window stays conservatively below that so unique misses from many
 * clients cannot exhaust the shared server-egress quota on their own.
 * Provider backpressure is honored too: when ip-api.com reports `X-Rl: 0`
 * (or answers 429), lookups pause until the `X-Ttl` interval elapses.
 * In-memory only — like the route rate limiter, it does not span instances.
 */
const UPSTREAM_BUDGET_CAPACITY = 40;
const UPSTREAM_BUDGET_WINDOW_MS = 60_000;

let budgetTokens = UPSTREAM_BUDGET_CAPACITY;
let budgetWindowEndsAt = 0;
let backoffUntilMs = 0;

function takeUpstreamBudget(nowMs: number): boolean {
  if (nowMs < backoffUntilMs) return false;
  if (nowMs >= budgetWindowEndsAt) {
    budgetTokens = UPSTREAM_BUDGET_CAPACITY;
    budgetWindowEndsAt = nowMs + UPSTREAM_BUDGET_WINDOW_MS;
  }
  if (budgetTokens <= 0) return false;
  budgetTokens -= 1;
  return true;
}

function noteUpstreamBackpressure(response: Response, nowMs: number): void {
  // NB: a missing header must not trigger backoff (Number(null) is 0).
  const remainingRaw = response.headers.get("x-rl");
  const remaining = remainingRaw === null ? Number.NaN : Number(remainingRaw);
  if (response.status === 429 || remaining === 0) {
    const ttlSeconds = Number(response.headers.get("x-ttl"));
    const waitMs =
      Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds * 1_000 : UPSTREAM_BUDGET_WINDOW_MS;
    backoffUntilMs = Math.max(backoffUntilMs, nowMs + waitMs);
  }
}

/** Test hook: resets budget and backoff state between cases. */
export function clearIpApiBudgetForTests() {
  budgetTokens = UPSTREAM_BUDGET_CAPACITY;
  budgetWindowEndsAt = 0;
  backoffUntilMs = 0;
}

const MAX_IP_API_BYTES = 64_000;

async function readBoundedText(response: Response): Promise<string | null> {
  const body = response.body;
  if (!body) return null;

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.byteLength;
    if (receivedBytes > MAX_IP_API_BYTES) {
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

export async function lookupIpApi(
  ip: string,
  options: { language?: string; timeoutMs?: number } = {},
): Promise<IpApiData | null> {
  const timeoutMs = options.timeoutMs ?? 5_000;
  const language = options.language ?? "en";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  timer.unref?.();

  if (!takeUpstreamBudget(Date.now())) return null;

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${IP_API_FIELDS}&lang=${encodeURIComponent(language)}`,
      { cache: "no-store", signal: controller.signal },
    );
    noteUpstreamBackpressure(response, Date.now());
    if (!response.ok) return null;
    // Bounded read: ip-api.com answers are a few hundred bytes; refuse to
    // buffer an unexpectedly large body into memory. Streamed chunk by chunk
    // (byte-counted, not UTF-16 length) so a missing or lying Content-Length
    // cannot force the whole body into memory first.
    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_IP_API_BYTES) {
      await response.body?.cancel().catch(() => {});
      return null;
    }
    const text = await readBoundedText(response);
    if (text === null) return null;
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return null;
    }
    const parsed = ipApiPayloadSchema.safeParse(json);
    if (!parsed.success || parsed.data.status === "fail") return null;

    return parsed.data;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
