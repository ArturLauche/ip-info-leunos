import {
  getProxyHintSignatureMatches,
  summarizeProxyHintSignals,
  type ProxyHintAssessment,
  type ProxyHintCategory,
  type ProxyHintSignal,
} from "@/lib/connection-type";
import {
  assertPublicIpAddress,
  isIPv4Address,
  isIPv6Address,
  stripIpv6Brackets,
} from "@/lib/network/target";

export type HeaderList = {
  get(name: string): string | null;
  forEach(callbackfn: (value: string, key: string) => void): void;
};

const EXPLICIT_PROXY_HEADERS: Record<
  string,
  { label: string; category: ProxyHintCategory }
> = {
  via: { label: "Via header", category: "transparent-proxy" },
  "proxy-connection": { label: "Proxy-Connection header", category: "generic-proxy" },
  "x-cache": { label: "cache header", category: "transparent-proxy" },
  "x-cache-lookup": { label: "cache lookup header", category: "transparent-proxy" },
  "x-bluecoat-via": { label: "Blue Coat header", category: "security-gateway" },
  "x-squid-error": { label: "Squid header", category: "transparent-proxy" },
  "x-proxy-id": { label: "proxy identifier header", category: "generic-proxy" },
  "x-proxy-cache": { label: "proxy cache header", category: "transparent-proxy" },
  "x-cache-status": { label: "cache status header", category: "transparent-proxy" },
};

const FORWARDED_CHAIN_HEADERS = new Set(["forwarded", "x-forwarded-for"]);
const FORWARDED_CONTEXT_HEADERS = new Set([
  "client-ip",
  "true-client-ip",
  "x-client-ip",
  "x-cluster-client-ip",
  "x-forwarded-host",
  "x-forwarded-server",
]);

const HEADER_VALUE_PROXY_TERMS: Array<{
  keyword: string;
  label: string;
  category: ProxyHintCategory;
}> = [
  { keyword: "secure web gateway", label: "secure web gateway header", category: "security-gateway" },
  { keyword: "gateway", label: "gateway header", category: "enterprise-proxy" },
  { keyword: "proxy", label: "proxy header", category: "generic-proxy" },
  { keyword: "socks", label: "SOCKS-style proxy header", category: "local-proxy" },
  { keyword: "cache", label: "cache header", category: "transparent-proxy" },
  { keyword: "relay", label: "relay header", category: "transparent-proxy" },
  { keyword: "swg", label: "secure web gateway header", category: "security-gateway" },
];

function normalizeHeaderText(value: string) {
  return value.toLowerCase().replace(/[_-]+/g, " ");
}

function getHeaderEntries(headersList: HeaderList) {
  const entries: Array<{ name: string; value: string }> = [];
  headersList.forEach((value, key) => {
    entries.push({ name: key.toLowerCase(), value });
  });
  return entries;
}

function normalizeForwardedIpCandidate(candidate: string) {
  let normalized = candidate
    .trim()
    .replace(/^for=/i, "")
    .replace(/^"|"$/g, "")
    .trim();

  if (!normalized || normalized.toLowerCase() === "unknown" || normalized.startsWith("_")) {
    return null;
  }

  if (normalized.startsWith("[")) {
    const closingBracket = normalized.indexOf("]");
    if (closingBracket > 0) {
      normalized = normalized.slice(1, closingBracket);
    }
  } else if (normalized.includes(":") && !normalized.includes("::")) {
    const [possibleIpv4] = normalized.split(":");
    if (possibleIpv4 && isIPv4Address(possibleIpv4)) {
      normalized = possibleIpv4;
    }
  }

  const stripped = stripIpv6Brackets(normalized);
  return isIPv4Address(stripped) || isIPv6Address(stripped) ? stripped : null;
}

function extractForwardedIpCandidates(headerName: string, value: string) {
  if (headerName === "forwarded") {
    return value
      .split(",")
      .flatMap((entry) => entry.split(";"))
      .map((part) => part.trim())
      .filter((part) => part.toLowerCase().startsWith("for="))
      .map(normalizeForwardedIpCandidate)
      .filter((ip): ip is string => Boolean(ip));
  }

  return value
    .split(",")
    .map(normalizeForwardedIpCandidate)
    .filter((ip): ip is string => Boolean(ip));
}

function isPublicHeaderIp(ip: string) {
  try {
    assertPublicIpAddress(ip);
    return true;
  } catch {
    return false;
  }
}

function getForwardedChainSignals(
  headerName: string,
  value: string,
  hasPairedProxyEvidence: boolean,
): ProxyHintSignal[] {
  const candidates = extractForwardedIpCandidates(headerName, value);
  if (candidates.length === 0) return [];

  const uniqueCandidates = [...new Set(candidates)];
  const publicCount = uniqueCandidates.filter(isPublicHeaderIp).length;
  const blockedCount = uniqueCandidates.length - publicCount;

  if (publicCount >= 2) {
    return [
      {
        points: 20,
        reason: `${headerName}-multiple-public-chain`,
        label: "forwarded public IP chain",
        category: "transparent-proxy",
      },
    ];
  }

  if (publicCount >= 1 && blockedCount >= 1) {
    return [
      {
        points: 20,
        reason: `${headerName}-mixed-public-private-chain`,
        label: "mixed forwarded IP chain",
        category: "transparent-proxy",
      },
    ];
  }

  if (hasPairedProxyEvidence && publicCount >= 1) {
    return [
      {
        points: 20,
        reason: `${headerName}-paired-forwarding-header`,
        label: "forwarded header paired with proxy signal",
        category: "transparent-proxy",
      },
    ];
  }

  return [];
}

export function getRequestProxyHintSignals(headersList: HeaderList): ProxyHintSignal[] {
  const entries = getHeaderEntries(headersList);
  const productSignals: ProxyHintSignal[] = entries.flatMap(({ name, value }) =>
    getProxyHintSignatureMatches(`${name} ${value}`).map((signature) => ({
      points: 40,
      reason: `request-header-product:${signature.keywords[0]}`,
      label: `${signature.label} header`,
      category: signature.category,
    })),
  );
  const explicitHeaderSignals: ProxyHintSignal[] = entries.flatMap(({ name }) => {
    const header = EXPLICIT_PROXY_HEADERS[name];
    return header
      ? [
          {
            points: 30,
            reason: `request-header:${name}`,
            label: header.label,
            category: header.category,
          },
        ]
      : [];
  });
  const valueTermSignals: ProxyHintSignal[] = entries.flatMap(({ name, value }) => {
    const normalizedValue = normalizeHeaderText(value);
    return HEADER_VALUE_PROXY_TERMS.filter((term) => normalizedValue.includes(term.keyword)).map(
      (term) => ({
        points: 30,
        reason: `request-header-value:${name}:${term.keyword}`,
        label: term.label,
        category: term.category,
      }),
    );
  });
  const hasPairedProxyEvidence =
    productSignals.length > 0 || explicitHeaderSignals.length > 0 || valueTermSignals.length > 0;
  const forwardedSignals: ProxyHintSignal[] = entries.flatMap(({ name, value }) => {
    if (FORWARDED_CHAIN_HEADERS.has(name)) {
      return getForwardedChainSignals(name, value, hasPairedProxyEvidence);
    }

    if (FORWARDED_CONTEXT_HEADERS.has(name) && hasPairedProxyEvidence) {
      return [
        {
          points: 20,
          reason: `request-header:${name}:paired-forwarding-context`,
          label: "forwarding context header",
          category: "transparent-proxy",
        },
      ];
    }

    return [];
  });

  return [
    ...productSignals,
    ...explicitHeaderSignals,
    ...valueTermSignals,
    ...forwardedSignals,
  ];
}

export function assessRequestProxyHints(headersList: HeaderList): ProxyHintAssessment {
  return summarizeProxyHintSignals(getRequestProxyHintSignals(headersList));
}
