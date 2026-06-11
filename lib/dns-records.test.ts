import { describe, expect, it } from "vitest";
import { formatDnsRecordValue } from "@/lib/dns-records";

describe("formatDnsRecordValue", () => {
  it("returns plain strings for A/AAAA/CNAME/NS/PTR records", () => {
    expect(formatDnsRecordValue({ type: "A", value: "93.184.215.14" })).toBe("93.184.215.14");
    expect(formatDnsRecordValue({ type: "PTR", value: "dns.google" })).toBe("dns.google");
  });

  it("joins TXT chunk arrays", () => {
    expect(formatDnsRecordValue({ type: "TXT", value: [["v=spf1 ", "-all"]] })).toBe("v=spf1 -all");
    expect(formatDnsRecordValue({ type: "TXT", value: ["a", "b"] })).toBe("a b");
  });

  it("formats MX records as priority exchange", () => {
    expect(formatDnsRecordValue({ type: "MX", value: { priority: 10, exchange: "mail.example.com" } })).toBe(
      "10 mail.example.com",
    );
  });

  it("formats SRV records in zone-file order", () => {
    expect(
      formatDnsRecordValue({
        type: "SRV",
        value: { priority: 0, weight: 5, port: 5060, name: "sip.example.com" },
      }),
    ).toBe("0 5 5060 sip.example.com");
  });

  it("formats SOA records with timing fields", () => {
    const value = {
      nsname: "ns.example.com",
      hostmaster: "hostmaster.example.com",
      serial: 2024010101,
      refresh: 7200,
      retry: 3600,
      expire: 1209600,
      minttl: 300,
    };
    expect(formatDnsRecordValue({ type: "SOA", value })).toBe(
      "ns.example.com hostmaster.example.com (serial 2024010101, refresh 7200, retry 3600, expire 1209600, minttl 300)",
    );
  });

  it("formats CAA records with their property tag", () => {
    expect(formatDnsRecordValue({ type: "CAA", value: { critical: 0, issue: "letsencrypt.org" } })).toBe(
      '0 issue "letsencrypt.org"',
    );
    expect(formatDnsRecordValue({ type: "CAA", value: { critical: 128, iodef: "mailto:sec@example.com" } })).toBe(
      '128 iodef "mailto:sec@example.com"',
    );
  });

  it("falls back to JSON for unknown shapes", () => {
    expect(formatDnsRecordValue({ type: "NAPTR", value: { order: 1 } })).toBe('{"order":1}');
  });
});
