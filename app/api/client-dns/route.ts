import dns from "node:dns";
import { apiOk } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { buildRuntimeDnsScan } from "@/lib/runtime-dns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "runtime-dns", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  return apiOk(buildRuntimeDnsScan(dns.getServers()));
}
