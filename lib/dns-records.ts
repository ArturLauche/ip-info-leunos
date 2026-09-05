export interface DnsRecord {
  type: string;
  value: unknown;
}

/**
 * Renders a Node `dns.resolve()` record value as a single readable line,
 * mirroring classic zone-file notation per record type.
 */
export function formatDnsRecordValue(record: DnsRecord): string {
  const value = record.value;

  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "";

  // TXT records arrive as arrays of character-string chunks.
  if (Array.isArray(value)) {
    return value.map((entry) => (Array.isArray(entry) ? entry.join("") : String(entry))).join(" ");
  }

  const fields = value as Record<string, unknown>;

  // Shape guard: Node resolver output is typed loosely, so coerce every
  // interpolated field instead of rendering literal "undefined" strings.
  const field = (key: string): string => {
    const entry = fields[key];
    if (typeof entry === "string") return entry;
    if (typeof entry === "number" || typeof entry === "boolean") return String(entry);
    return "";
  };

  switch (record.type) {
    case "MX": {
      const exchange = field("exchange").trim();
      const priority = field("priority");
      // RFC 7505 null MX: empty exchange means "no mail service", written as ".".
      return exchange ? `${priority} ${exchange}`.trim() : `${priority} .`.trim();
    }
    case "SRV": {
      const line = `${field("priority")} ${field("weight")} ${field("port")} ${field("name")}`;
      return line.replace(/\s+/g, " ").trim();
    }
    case "SOA":
      return `${field("nsname")} ${field("hostmaster")} (serial ${field("serial")}, refresh ${field("refresh")}, retry ${field("retry")}, expire ${field("expire")}, minttl ${field("minttl")})`;
    case "CAA": {
      const tag = ["issue", "issuewild", "iodef", "contactemail", "contactphone"].find(
        (key) => typeof fields[key] === "string",
      );
      return tag ? `${fields.critical ?? 0} ${tag} "${fields[tag]}"` : JSON.stringify(fields);
    }
    default:
      return JSON.stringify(fields);
  }
}
