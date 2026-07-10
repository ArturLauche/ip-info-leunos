import {
  createProxyHintAssessment,
  findProxyHintProducts,
  type ProxyHintAssessment,
  type ProxyHintLabel,
  type ProxyHintReason,
} from "@/lib/connection-type";
import {
  assertPublicIpAddress,
  isIPv4Address,
  isIPv6Address,
  TargetValidationError,
} from "@/lib/network/target";

const PROXY_HINT_HEADER_NAMES = [
  "via",
  "forwarded",
  "proxy-connection",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-server",
  "x-cache",
  "x-cache-lookup",
  "x-bluecoat-via",
  "x-squid-error",
  "x-proxy-id",
  "x-proxy-cache",
  "x-cache-status",
  "client-ip",
  "x-client-ip",
  "true-client-ip",
  "x-cluster-client-ip",
  "x-real-ip",
  "x-vercel-forwarded-for",
] as const;

const EXPLICIT_PROXY_HEADER_LABELS: Partial<
  Record<(typeof PROXY_HINT_HEADER_NAMES)[number], ProxyHintLabel>
> = {
  via: "via-header",
  "proxy-connection": "proxy-header",
  "x-cache": "cache-header",
  "x-cache-lookup": "cache-header",
  "x-bluecoat-via": "via-header",
  "x-squid-error": "proxy-header",
  "x-proxy-id": "proxy-header",
  "x-proxy-cache": "cache-header",
  "x-cache-status": "cache-header",
};

const PRIVATE_FORWARDED_RANGES = new Set([
  "private",
  "loopback",
  "link-local",
  "unique-local",
  "carrier-grade-nat",
]);

export function normalizeForwardedIp(value: string) {
  let candidate = value.trim().replace(/^for=/i, "").replace(/^"|"$/g, "");
  if (!candidate || candidate.toLowerCase() === "unknown" || candidate.startsWith("_")) {
    return null;
  }

  if (candidate.startsWith("[")) {
    candidate = candidate.replace(/^\[([^\]]+)\](?::\d+)?$/, "$1");
  }

  candidate = candidate.split("%", 1)[0];
  if (isIPv4Address(candidate) || isIPv6Address(candidate)) return candidate;

  const withoutPort = candidate.replace(/:\d+$/, "");
  return isIPv4Address(withoutPort) ? withoutPort : null;
}

function getForwardedChain(headersList: Headers, headerName: string) {
  const value = headersList.get(headerName);
  if (!value) return [];

  if (headerName === "forwarded") {
    return value.split(",").flatMap((entry) => {
      const forPart = entry
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.toLowerCase().startsWith("for="));
      const ip = forPart ? normalizeForwardedIp(forPart) : null;
      return ip ? [ip] : [];
    });
  }

  return value
    .split(",")
    .map(normalizeForwardedIp)
    .filter((ip): ip is string => Boolean(ip));
}

function isPrivateForwardedIp(ip: string) {
  try {
    assertPublicIpAddress(ip);
    return false;
  } catch (error) {
    if (!(error instanceof TargetValidationError)) return false;
    const range = (error.details as { range?: unknown } | undefined)?.range;
    return typeof range === "string" && PRIVATE_FORWARDED_RANGES.has(range);
  }
}

function hasForwardedChainAnomaly(headersList: Headers) {
  return ["x-forwarded-for", "forwarded", "x-cluster-client-ip"].some((headerName) => {
    const chain = getForwardedChain(headersList, headerName);
    const publicIps = new Set<string>();
    let hasPrivateIp = false;

    for (const ip of chain) {
      try {
        assertPublicIpAddress(ip);
        publicIps.add(ip);
      } catch {
        if (isPrivateForwardedIp(ip)) hasPrivateIp = true;
      }
    }

    return publicIps.size >= 2 || (publicIps.size >= 1 && hasPrivateIp);
  });
}

function includesHeaderTerm(value: string, terms: readonly string[]) {
  const normalized = value.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

export function assessRequestProxyHints(headersList: Headers): ProxyHintAssessment {
  const reasons: ProxyHintReason[] = [];
  const labels: ProxyHintLabel[] = [];
  const products = new Set<ReturnType<typeof findProxyHintProducts>[number]>();
  let hasExplicitProxyHeader = false;

  for (const headerName of PROXY_HINT_HEADER_NAMES) {
    const headerValue = headersList.get(headerName);
    if (!headerValue) continue;

    if (
      headerName === "x-forwarded-host" &&
      headerValue.trim().toLowerCase() === headersList.get("host")?.trim().toLowerCase()
    ) {
      continue;
    }

    const explicitLabel = EXPLICIT_PROXY_HEADER_LABELS[headerName];
    if (explicitLabel) {
      hasExplicitProxyHeader = true;
      labels.push(explicitLabel);
    }

    const inspectableValue = `${headerName} ${headerValue.slice(0, 1_024)}`;
    findProxyHintProducts(inspectableValue).forEach((product) => products.add(product));

    if (includesHeaderTerm(inspectableValue, ["socks"])) {
      hasExplicitProxyHeader = true;
      labels.push("socks-signature");
    } else if (
      includesHeaderTerm(inspectableValue, [
        "gateway",
        "firewall",
        "webfilter",
        "web filter",
        "content filter",
        "secure web",
        " swg",
      ])
    ) {
      hasExplicitProxyHeader = true;
      labels.push("gateway-signature");
    } else if (includesHeaderTerm(inspectableValue, ["proxy", "relay"])) {
      hasExplicitProxyHeader = true;
      labels.push("proxy-header");
    }
  }

  if (products.size > 0) {
    reasons.push("enterprise-product-header");
    labels.push(...[...products].map((product) => `product-header:${product}` as const));
  }
  if (hasExplicitProxyHeader) reasons.push("explicit-proxy-header");
  if (hasForwardedChainAnomaly(headersList)) {
    reasons.push("forwarded-chain-anomaly");
    labels.push("forwarded-chain");
  }

  return createProxyHintAssessment({ reasons, labels });
}
