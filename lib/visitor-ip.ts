import { normalizeForwardedIp } from "@/lib/request-proxy-hints";
import {
  assertPublicIpAddress,
  isIPv4Address,
  isIPv6Address,
} from "@/lib/network/target";

/** Server-only: derives the visitor's public addresses from request headers. */

export type VisitorIpCheck = { ip: string; source: string; version: 4 | 6 };

export interface VisitorIps {
  ipv4: string | null;
  ipv6: string | null;
  /** Every distinct public address seen, with the header it came from. */
  localIpChecks: VisitorIpCheck[];
}

/**
 * Forwarding headers in priority order. Vercel's header is set by the edge and
 * cannot be supplied by the client; the generic ones depend on the deployment's
 * proxy overwriting them (see lib/api/rate-limit.ts for the trust boundary).
 */
const VISITOR_IP_HEADERS = ["x-vercel-forwarded-for", "x-forwarded-for", "x-real-ip"] as const;

export function extractVisitorIps(headersList: Pick<Headers, "get">): VisitorIps {
  const candidates: Array<{ ip: string; source: string }> = [];

  for (const headerName of VISITOR_IP_HEADERS) {
    const value = headersList.get(headerName);
    if (!value) continue;

    value.split(",").forEach((part, index) => {
      const ip = normalizeForwardedIp(part);
      if (!ip) return;
      candidates.push({
        ip,
        source: value.includes(",") ? `${headerName}[${index}]` : headerName,
      });
    });
  }

  const seenIps = new Set<string>();
  const localIpChecks: VisitorIpCheck[] = candidates.flatMap((candidate) => {
    const version: 4 | 6 | null = isIPv4Address(candidate.ip)
      ? 4
      : isIPv6Address(candidate.ip)
        ? 6
        : null;
    if (!version || seenIps.has(candidate.ip)) return [];

    try {
      assertPublicIpAddress(candidate.ip);
    } catch {
      return [];
    }

    seenIps.add(candidate.ip);
    return [{ ...candidate, version }];
  });

  let ipv4: string | null = null;
  let ipv6: string | null = null;
  for (const candidate of localIpChecks) {
    if (!ipv4 && candidate.version === 4) ipv4 = candidate.ip;
    if (!ipv6 && candidate.version === 6) ipv6 = candidate.ip;
    if (ipv4 && ipv6) break;
  }

  return { ipv4, ipv6, localIpChecks };
}
