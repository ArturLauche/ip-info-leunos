export type WhoisSummary = {
  registrar?: string;
  created?: string;
  expires?: string;
  updated?: string;
  status: string[];
  nameservers: string[];
};

/**
 * Normalizes a WHOIS referral value into a plain hostname. Registries
 * return referrals in several shapes: `whois.nic.io`, `whois.arin.net:43`,
 * `whois://whois.ripe.net`, or `rwhois://example.net:4321/`.
 */
export function normalizeReferralHost(value: string): string | null {
  let host = value.trim().replace(/^r?whois:\/\//i, "");
  host = host.split("/")[0];

  // Strip a trailing :port unless the value is a bare IPv6 address.
  const portMatch = host.match(/^(.+):(\d{1,5})$/);
  if (portMatch && !portMatch[1].includes(":")) {
    host = portMatch[1];
  }

  host = host.trim().toLowerCase();
  return host || null;
}

export function extractReferralServer(response: string): string | null {
  const lines = response.split(/\r?\n/);
  for (const line of lines) {
    const [rawKey, ...rawValue] = line.split(":");
    if (!rawKey || rawValue.length === 0) continue;

    const key = rawKey.trim().toLowerCase();
    const value = rawValue.join(":").trim();

    if (["refer", "whois", "whois server", "referralserver"].includes(key) && value) {
      return normalizeReferralHost(value);
    }
  }

  return null;
}

function firstValue(raw: string, labels: string[]) {
  const lines = raw.split(/\r?\n/);

  for (const label of labels) {
    const match = lines.find((line) => line.toLowerCase().startsWith(`${label.toLowerCase()}:`));
    if (match) return match.split(":").slice(1).join(":").trim();
  }

  return undefined;
}

function allValues(raw: string, labels: string[]) {
  const values = new Set<string>();

  for (const line of raw.split(/\r?\n/)) {
    for (const label of labels) {
      if (line.toLowerCase().startsWith(`${label.toLowerCase()}:`)) {
        const value = line.split(":").slice(1).join(":").trim();
        if (value) values.add(value);
      }
    }
  }

  return [...values];
}

export function summarizeWhois(raw: string): WhoisSummary {
  return {
    registrar: firstValue(raw, ["Registrar", "Sponsoring Registrar", "registrarName"]),
    created: firstValue(raw, ["Creation Date", "Created", "created"]),
    expires: firstValue(raw, ["Registry Expiry Date", "Expiration Date", "expires"]),
    updated: firstValue(raw, ["Updated Date", "Last Updated", "updated"]),
    status: allValues(raw, ["Domain Status", "Status"]),
    nameservers: allValues(raw, ["Name Server", "Nameserver", "nserver"]),
  };
}

export function summarizeRdap(data: unknown): WhoisSummary {
  const record = typeof data === "object" && data ? (data as Record<string, unknown>) : {};
  const events = Array.isArray(record.events) ? record.events : [];
  const nameservers = Array.isArray(record.nameservers) ? record.nameservers : [];
  const status = Array.isArray(record.status) ? record.status : [];

  const eventDate = (actions: string[]) => {
    for (const event of events) {
      const entry = event as Record<string, unknown>;
      if (typeof entry.eventAction === "string" && actions.includes(entry.eventAction)) {
        return typeof entry.eventDate === "string" ? entry.eventDate : undefined;
      }
    }

    return undefined;
  };

  return {
    created: eventDate(["registration"]),
    expires: eventDate(["expiration"]),
    updated: eventDate(["last changed", "last update of RDAP database"]),
    status: status.filter((item): item is string => typeof item === "string"),
    nameservers: nameservers
      .map((item) => (typeof item === "object" && item ? (item as Record<string, unknown>).ldhName : null))
      .filter((item): item is string => typeof item === "string"),
  };
}
