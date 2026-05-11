export type ClientIpProviderId = "ipify" | "aws-check-ip";

export type ClientIpDiscoveryResult = {
  ip: string;
  version: 4 | 6;
  source: ClientIpProviderId;
};

type ClientIpProvider = {
  id: ClientIpProviderId;
  url: string;
  parse: (response: Response) => Promise<string | null>;
};

type DiscoverClientIpOptions = {
  preferredVersion?: 4 | 6;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export type LocalIpCheck = {
  ip: string | null;
  source: string;
  version?: 4 | 6;
};

export type IpDisplayInput = {
  ipv4: string | null;
  ipv6: string | null;
  ipSources?: {
    ipv4?: string;
    ipv6?: string;
  };
  localIpChecks?: LocalIpCheck[];
};

export type ResolvedIpDisplay = {
  ipv4: { ip: string; source: string; isFallback: boolean } | null;
  ipv6: { ip: string; source: string; isFallback: boolean } | null;
};

const CLIENT_IP_PROVIDERS: ClientIpProvider[] = [
  {
    id: "ipify",
    url: "https://api64.ipify.org?format=json",
    parse: async (response) => {
      const json = (await response.json()) as { ip?: unknown };
      return typeof json.ip === "string" ? json.ip.trim() : null;
    },
  },
  {
    id: "aws-check-ip",
    url: "https://checkip.amazonaws.com",
    parse: async (response) => (await response.text()).trim(),
  },
];

export function getIpVersion(ip: string | null | undefined): 4 | 6 | null {
  if (!ip) return null;
  const normalized = ip.trim();

  if (isPlausibleIpv4(normalized)) return 4;
  if (isPlausibleIpv6(normalized)) return 6;

  return null;
}

export function resolveDisplayIps(
  data: IpDisplayInput,
  externalIpv4: ClientIpDiscoveryResult | null = null,
  externalIpv6: ClientIpDiscoveryResult | null = null,
): ResolvedIpDisplay {
  const primaryIpv4 = normalizeIp(data.ipv4, 4);
  const localIpv4 = data.localIpChecks?.find(
    (check) => normalizeIp(check.ip, 4) !== null,
  );
  const fallbackLocalIpv4 = normalizeIp(localIpv4?.ip, 4);
  const fallbackExternalIpv4 = normalizeIp(externalIpv4?.ip, 4);

  const primaryIpv6 = normalizeIp(data.ipv6, 6);
  const fallbackExternalIpv6 = normalizeIp(externalIpv6?.ip, 6);

  return {
    ipv4: primaryIpv4
      ? {
          ip: primaryIpv4,
          source: data.ipSources?.ipv4 || "api-ip-primary",
          isFallback: false,
        }
      : fallbackLocalIpv4
        ? {
            ip: fallbackLocalIpv4,
            source: localIpv4?.source || "local-ip-check",
            isFallback: true,
          }
        : fallbackExternalIpv4 && externalIpv4
          ? {
              ip: fallbackExternalIpv4,
              source: externalIpv4.source,
              isFallback: true,
            }
          : null,
    ipv6: primaryIpv6
      ? {
          ip: primaryIpv6,
          source: data.ipSources?.ipv6 || "api-ip-primary",
          isFallback: false,
        }
      : fallbackExternalIpv6 && externalIpv6
        ? {
            ip: fallbackExternalIpv6,
            source: externalIpv6.source,
            isFallback: true,
          }
        : null,
  };
}

export async function discoverClientIp({
  preferredVersion,
  timeoutMs = 2_800,
  fetchImpl = fetch,
}: DiscoverClientIpOptions = {}): Promise<ClientIpDiscoveryResult | null> {
  for (const provider of CLIENT_IP_PROVIDERS) {
    const result = await tryProvider(provider, timeoutMs, fetchImpl);

    if (!result) continue;
    if (preferredVersion && result.version !== preferredVersion) continue;

    return result;
  }

  return null;
}

async function tryProvider(
  provider: ClientIpProvider,
  timeoutMs: number,
  fetchImpl: typeof fetch,
): Promise<ClientIpDiscoveryResult | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(provider.url, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const ip = await provider.parse(response);
    const version = getIpVersion(ip);
    if (!ip || !version) return null;

    return { ip: ip.trim(), version, source: provider.id };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeIp(ip: string | null | undefined, version: 4 | 6) {
  const normalized = ip?.trim();
  return normalized && getIpVersion(normalized) === version ? normalized : null;
}

function isPlausibleIpv4(ip: string) {
  const parts = ip.split(".");
  return (
    parts.length === 4 &&
    parts.every((part) => {
      if (!/^\d{1,3}$/.test(part)) return false;
      const value = Number(part);
      return value >= 0 && value <= 255 && String(value) === part;
    })
  );
}

function isPlausibleIpv6(ip: string) {
  if (!ip.includes(":")) return false;
  if (!/^[0-9a-fA-F:.]+$/.test(ip)) return false;

  const withoutIpv4Tail = ip.replace(/:\d{1,3}(?:\.\d{1,3}){3}$/, ":0:0");
  if (withoutIpv4Tail.includes(":::")) return false;

  const doubleColonCount = (withoutIpv4Tail.match(/::/g) || []).length;
  if (doubleColonCount > 1) return false;

  const groups = withoutIpv4Tail.split(":").filter(Boolean);
  if (groups.length === 0 || groups.length > 8) return false;
  if (doubleColonCount === 0 && groups.length !== 8) return false;

  return groups.every((group) => /^[0-9a-fA-F]{1,4}$/.test(group));
}
