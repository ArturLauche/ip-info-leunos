import { isIP } from "node:net";

export type ResolverPrivacy = "high" | "medium" | "low" | "unknown";
export type ResolverNetworkScope = "public" | "private" | "loopback" | "link-local" | "invalid";
export type RuntimeDnsMethod = "node-dns-getservers";
export type RuntimeDnsAccuracy = "runtime-configuration";

type ResolverProfile = {
  provider: string;
  homepage: string;
  privacy: Exclude<ResolverPrivacy, "unknown">;
  notes: string;
};

export type RuntimeDnsResolverResult = {
  address: string;
  rawAddress: string;
  provider: string;
  privacy: ResolverPrivacy;
  notes: string;
  homepage: string | null;
  networkScope: ResolverNetworkScope;
  known: boolean;
};

export type RuntimeDnsScanResult = {
  checkedAt: string;
  scope: "server-runtime";
  method: RuntimeDnsMethod;
  accuracy: RuntimeDnsAccuracy;
  leakTestComparable: false;
  resolvers: RuntimeDnsResolverResult[];
  resolverCount: number;
  knownResolverCount: number;
  unknownResolverCount: number;
  privacyScore: number | null;
  scoreReason: "all-resolvers-profiled" | "unscored-unknown-resolvers" | "unscored-no-resolvers";
  limitations: string[];
};

const KNOWN_RESOLVERS: Record<string, ResolverProfile> = {
  "1.1.1.1": {
    provider: "Cloudflare",
    homepage: "https://www.cloudflare.com/application-services/products/dns/",
    privacy: "high",
    notes: "No default end-user IP logging for standard resolver traffic beyond short operational windows.",
  },
  "1.0.0.1": {
    provider: "Cloudflare",
    homepage: "https://www.cloudflare.com/application-services/products/dns/",
    privacy: "high",
    notes: "Companion Cloudflare resolver with strong public privacy commitments.",
  },
  "2606:4700:4700::1111": {
    provider: "Cloudflare",
    homepage: "https://www.cloudflare.com/application-services/products/dns/",
    privacy: "high",
    notes: "IPv6 Cloudflare resolver with the same public resolver privacy model.",
  },
  "2606:4700:4700::1001": {
    provider: "Cloudflare",
    homepage: "https://www.cloudflare.com/application-services/products/dns/",
    privacy: "high",
    notes: "Secondary IPv6 Cloudflare resolver with the same public resolver privacy model.",
  },
  "8.8.8.8": {
    provider: "Google Public DNS",
    homepage: "https://developers.google.com/speed/public-dns",
    privacy: "medium",
    notes: "Collects resolver telemetry and may retain temporary logs for abuse prevention and performance.",
  },
  "8.8.4.4": {
    provider: "Google Public DNS",
    homepage: "https://developers.google.com/speed/public-dns",
    privacy: "medium",
    notes: "Public resolver with transparent docs but broader data ecosystem concerns.",
  },
  "2001:4860:4860::8888": {
    provider: "Google Public DNS",
    homepage: "https://developers.google.com/speed/public-dns",
    privacy: "medium",
    notes: "IPv6 Google Public DNS resolver with the same provider policy profile.",
  },
  "2001:4860:4860::8844": {
    provider: "Google Public DNS",
    homepage: "https://developers.google.com/speed/public-dns",
    privacy: "medium",
    notes: "Secondary IPv6 Google Public DNS resolver with the same provider policy profile.",
  },
  "9.9.9.9": {
    provider: "Quad9",
    homepage: "https://quad9.net/",
    privacy: "high",
    notes: "Security-focused resolver with threat blocking and no sale of personal data.",
  },
  "149.112.112.112": {
    provider: "Quad9",
    homepage: "https://quad9.net/",
    privacy: "high",
    notes: "Secondary Quad9 endpoint with same privacy model.",
  },
  "2620:fe::fe": {
    provider: "Quad9",
    homepage: "https://quad9.net/",
    privacy: "high",
    notes: "IPv6 Quad9 endpoint with the same privacy model.",
  },
  "2620:fe::9": {
    provider: "Quad9",
    homepage: "https://quad9.net/",
    privacy: "high",
    notes: "Secondary IPv6 Quad9 endpoint with the same privacy model.",
  },
  "208.67.222.222": {
    provider: "OpenDNS",
    homepage: "https://www.opendns.com/",
    privacy: "low",
    notes: "Filtering-focused resolver tied to account-based features and request logging.",
  },
  "208.67.220.220": {
    provider: "OpenDNS",
    homepage: "https://www.opendns.com/",
    privacy: "low",
    notes: "Companion OpenDNS endpoint with similar policy profile.",
  },
  "2620:119:35::35": {
    provider: "OpenDNS",
    homepage: "https://www.opendns.com/",
    privacy: "low",
    notes: "IPv6 OpenDNS endpoint with similar policy profile.",
  },
  "2620:119:53::53": {
    provider: "OpenDNS",
    homepage: "https://www.opendns.com/",
    privacy: "low",
    notes: "Secondary IPv6 OpenDNS endpoint with similar policy profile.",
  },
  "94.140.14.14": {
    provider: "AdGuard DNS",
    homepage: "https://adguard-dns.io/",
    privacy: "high",
    notes: "Privacy-oriented resolver with tracking/ad blocking options.",
  },
  "94.140.15.15": {
    provider: "AdGuard DNS",
    homepage: "https://adguard-dns.io/",
    privacy: "high",
    notes: "Secondary AdGuard resolver endpoint.",
  },
  "76.76.2.0": {
    provider: "Control D",
    homepage: "https://controld.com/",
    privacy: "medium",
    notes: "Customizable resolver with clear policies; privacy depends on selected profile.",
  },
};

const LIMITATIONS = [
  "Uses node:dns.getServers(), so it reports DNS servers configured for this app runtime.",
  "Does not observe browser Secure DNS, VPN DNS, proxy DNS, router upstreams, or transparent DNS proxies.",
  "Not comparable to dnsleaktest.com without authoritative DNS infrastructure and unique test hostnames.",
];

function stripZoneId(host: string) {
  return host.split("%", 1)[0];
}

export function normalizeResolverAddress(address: string) {
  const trimmed = address.trim();

  if (trimmed.startsWith("[")) {
    const bracketEnd = trimmed.indexOf("]");
    if (bracketEnd > 0) {
      return stripZoneId(trimmed.slice(1, bracketEnd)).toLowerCase();
    }
  }

  const colonCount = (trimmed.match(/:/g) ?? []).length;
  if (colonCount === 1) {
    const [host, port] = trimmed.split(":");
    if (isIP(host) === 4 && /^\d+$/.test(port)) {
      return host;
    }
  }

  return stripZoneId(trimmed).toLowerCase();
}

function ipv4Octets(address: string) {
  const parts = address.split(".");
  if (parts.length !== 4) return null;

  const octets = parts.map((part) => Number(part));
  if (octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null;
  }

  return octets;
}

function classifyIpv4(address: string): ResolverNetworkScope {
  const octets = ipv4Octets(address);
  if (!octets) return "invalid";

  const [first, second] = octets;

  if (first === 127 || first === 0) return "loopback";
  if (first === 169 && second === 254) return "link-local";
  if (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 100 && second >= 64 && second <= 127)
  ) {
    return "private";
  }

  return "public";
}

function classifyIpv6(address: string): ResolverNetworkScope {
  const lower = address.toLowerCase();
  const mappedIpv4 = lower.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mappedIpv4) return classifyIpv4(mappedIpv4[1]);

  if (lower === "::" || lower === "::1") return "loopback";

  const firstHextet = Number.parseInt(lower.split(":", 1)[0] || "0", 16);
  if (!Number.isFinite(firstHextet)) return "invalid";

  if ((firstHextet & 0xfe00) === 0xfc00) return "private";
  if ((firstHextet & 0xffc0) === 0xfe80) return "link-local";

  return "public";
}

export function classifyResolverScope(address: string): ResolverNetworkScope {
  const version = isIP(address);
  if (version === 4) return classifyIpv4(address);
  if (version === 6) return classifyIpv6(address);
  return "invalid";
}

function fallbackProfile(scope: ResolverNetworkScope): Omit<RuntimeDnsResolverResult, "address" | "rawAddress"> {
  if (scope === "loopback") {
    return {
      provider: "Local runtime resolver",
      privacy: "unknown",
      networkScope: scope,
      known: false,
      homepage: null,
      notes:
        "The runtime is configured to query a loopback resolver. This is usually a local DNS stub or cache, so the upstream recursive resolver is not observable from this API.",
    };
  }

  if (scope === "private" || scope === "link-local") {
    return {
      provider: "Private/network runtime resolver",
      privacy: "unknown",
      networkScope: scope,
      known: false,
      homepage: null,
      notes:
        "The runtime is configured to query a private or link-local resolver. It may be a router, VPN, enterprise DNS, container DNS, or hosting platform resolver; the upstream recursive resolver is not observable from this API.",
    };
  }

  if (scope === "invalid") {
    return {
      provider: "Unparsed runtime resolver",
      privacy: "unknown",
      networkScope: scope,
      known: false,
      homepage: null,
      notes:
        "This resolver entry could not be parsed as an IP address, so the app cannot classify its provider or privacy posture.",
    };
  }

  return {
    provider: "Unknown public runtime resolver",
    privacy: "unknown",
    networkScope: scope,
    known: false,
    homepage: null,
    notes:
      "This public resolver is not in the built-in provider list. The app cannot infer its logging policy or whether it represents the final recursive resolver.",
  };
}

export function inspectRuntimeResolver(rawAddress: string): RuntimeDnsResolverResult {
  const address = normalizeResolverAddress(rawAddress);
  const profile = KNOWN_RESOLVERS[address];

  if (profile) {
    return {
      address,
      rawAddress,
      provider: profile.provider,
      privacy: profile.privacy,
      notes: profile.notes,
      homepage: profile.homepage,
      networkScope: "public",
      known: true,
    };
  }

  return {
    address,
    rawAddress,
    ...fallbackProfile(classifyResolverScope(address)),
  };
}

function scorePrivacy(level: Exclude<ResolverPrivacy, "unknown">) {
  if (level === "high") return 100;
  if (level === "medium") return 65;
  return 30;
}

function calculatePrivacyScore(resolvers: RuntimeDnsResolverResult[]) {
  if (resolvers.length === 0) return null;
  const profiledResolvers = resolvers.filter(
    (
      resolver,
    ): resolver is RuntimeDnsResolverResult & {
      privacy: Exclude<ResolverPrivacy, "unknown">;
    } => resolver.privacy !== "unknown",
  );

  if (profiledResolvers.length !== resolvers.length) return null;

  const score = profiledResolvers.reduce(
    (acc, resolver) => acc + scorePrivacy(resolver.privacy),
    0,
  );

  return Math.round(score / profiledResolvers.length);
}

export function buildRuntimeDnsScan(
  rawResolvers: string[],
  checkedAt = new Date(),
): RuntimeDnsScanResult {
  const resolversByAddress = new Map<string, RuntimeDnsResolverResult>();

  for (const rawResolver of rawResolvers) {
    const resolver = inspectRuntimeResolver(rawResolver);
    if (!resolversByAddress.has(resolver.address)) {
      resolversByAddress.set(resolver.address, resolver);
    }
  }

  const resolvers = [...resolversByAddress.values()];
  const privacyScore = calculatePrivacyScore(resolvers);
  const knownResolverCount = resolvers.filter((resolver) => resolver.known).length;
  const unknownResolverCount = resolvers.length - knownResolverCount;

  return {
    checkedAt: checkedAt.toISOString(),
    scope: "server-runtime",
    method: "node-dns-getservers",
    accuracy: "runtime-configuration",
    leakTestComparable: false,
    resolvers,
    resolverCount: resolvers.length,
    knownResolverCount,
    unknownResolverCount,
    privacyScore,
    scoreReason:
      resolvers.length === 0
        ? "unscored-no-resolvers"
        : privacyScore === null
          ? "unscored-unknown-resolvers"
          : "all-resolvers-profiled",
    limitations: LIMITATIONS,
  };
}
