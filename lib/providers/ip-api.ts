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

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${IP_API_FIELDS}&lang=${encodeURIComponent(language)}`,
      { cache: "no-store", signal: controller.signal },
    );
    if (!response.ok) return null;
    // Bounded read: ip-api.com answers are a few hundred bytes; refuse to
    // buffer an unexpectedly large body into memory. Streamed chunk by chunk
    // (byte-counted, not UTF-16 length) so a missing or lying Content-Length
    // cannot force the whole body into memory first.
    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_IP_API_BYTES) return null;
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
