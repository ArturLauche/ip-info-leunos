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
    // buffer an unexpectedly large body into memory.
    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_IP_API_BYTES) return null;
    const text = await response.text();
    if (text.length > MAX_IP_API_BYTES) return null;
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
