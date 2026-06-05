import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { resolvePublicIp } from "@/lib/reputation/ip-validation";
import { aggregateRisk } from "@/lib/reputation/score";
import { ALL_PROVIDERS } from "@/lib/reputation/providers";
import { isIpAddress } from "@/lib/network/target";

export const runtime = "nodejs";

const querySchema = z.object({
  ip: z.string().trim().min(1).max(253),
});

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "reputation", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const parsedQuery = querySchema.safeParse({
    ip: searchParams.get("ip"),
  });

  if (!parsedQuery.success) {
    return apiValidationError(parsedQuery.error);
  }

  const input = parsedQuery.data.ip;

  // Resolve to a public IP (supports both raw IPs and domains)
  const resolved = await resolvePublicIp(input);

  if (!resolved.ok) {
    const code = resolved.code ?? "invalid_target";
    return apiError(code as "invalid_target" | "target_blocked" | "network_error", resolved.error, code === "target_blocked" ? 403 : 400);
  }

  const { ip, hostname } = resolved;

  const enabledProviders = ALL_PROVIDERS.filter((p) => p.isConfigured());
  const abortController = new AbortController();
  const globalTimer = setTimeout(() => abortController.abort(), 12_000);

  const results = await Promise.allSettled(
    enabledProviders.map((provider) =>
      provider.check(ip, abortController.signal),
    ),
  );

  clearTimeout(globalTimer);

  const sources = results.map((settled, index) => {
    const providerName = enabledProviders[index].name;

    if (settled.status === "fulfilled") {
      return {
        name: providerName,
        status: settled.value.status,
        score: settled.value.score,
        reason: settled.value.reason,
        checkedAt: new Date().toISOString(),
      };
    }

    return {
      name: providerName,
      status: "error" as const,
      reason: "Provider check failed unexpectedly.",
      checkedAt: new Date().toISOString(),
    };
  });

  const { risk, score } = aggregateRisk(
    sources.map((s) => ({ status: s.status, score: s.score })),
  );

  return apiOk({
    ip,
    hostname: isIpAddress(input) ? undefined : hostname,
    risk,
    score,
    sources,
    checkedAt: new Date().toISOString(),
  });
}
