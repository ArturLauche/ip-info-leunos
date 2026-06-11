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

  switch (record.type) {
    case "MX":
      return `${fields.priority} ${fields.exchange}`;
    case "SRV":
      return `${fields.priority} ${fields.weight} ${fields.port} ${fields.name}`;
    case "SOA":
      return `${fields.nsname} ${fields.hostmaster} (serial ${fields.serial}, refresh ${fields.refresh}, retry ${fields.retry}, expire ${fields.expire}, minttl ${fields.minttl})`;
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
