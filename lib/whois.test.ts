import { describe, expect, it } from "vitest";
import { extractReferralServer, normalizeReferralHost, summarizeWhois } from "@/lib/whois";

describe("normalizeReferralHost", () => {
  it("passes plain hostnames through", () => {
    expect(normalizeReferralHost("whois.nic.io")).toBe("whois.nic.io");
  });

  it("strips whois:// and rwhois:// schemes", () => {
    expect(normalizeReferralHost("whois://whois.ripe.net")).toBe("whois.ripe.net");
    expect(normalizeReferralHost("rwhois://rwhois.example.net:4321/")).toBe("rwhois.example.net");
  });

  it("strips trailing ports and paths", () => {
    expect(normalizeReferralHost("whois.arin.net:43")).toBe("whois.arin.net");
    expect(normalizeReferralHost("whois.example.com/path")).toBe("whois.example.com");
  });

  it("lowercases and returns null for empty values", () => {
    expect(normalizeReferralHost("WHOIS.IANA.ORG")).toBe("whois.iana.org");
    expect(normalizeReferralHost("   ")).toBeNull();
  });
});

describe("extractReferralServer", () => {
  it("finds the refer field from IANA responses", () => {
    const response = ["domain:       EXAMPLE", "refer:        whois.verisign-grs.com", ""].join("\n");
    expect(extractReferralServer(response)).toBe("whois.verisign-grs.com");
  });

  it("normalizes ReferralServer values with scheme and port", () => {
    const response = "ReferralServer: whois://whois.arin.net:43";
    expect(extractReferralServer(response)).toBe("whois.arin.net");
  });

  it("returns null when no referral is present", () => {
    expect(extractReferralServer("domain: example.com\nstatus: active")).toBeNull();
  });
});

describe("summarizeWhois", () => {
  it("extracts registrar, dates, status, and nameservers", () => {
    const raw = [
      "Domain Name: EXAMPLE.COM",
      "Registrar: Example Registrar, Inc.",
      "Creation Date: 1995-08-14T04:00:00Z",
      "Updated Date: 2023-08-14T07:01:31Z",
      "Registry Expiry Date: 2024-08-13T04:00:00Z",
      "Domain Status: clientDeleteProhibited",
      "Domain Status: clientTransferProhibited",
      "Name Server: A.IANA-SERVERS.NET",
      "Name Server: B.IANA-SERVERS.NET",
    ].join("\r\n");

    const summary = summarizeWhois(raw);
    expect(summary.registrar).toBe("Example Registrar, Inc.");
    expect(summary.created).toBe("1995-08-14T04:00:00Z");
    expect(summary.updated).toBe("2023-08-14T07:01:31Z");
    expect(summary.expires).toBe("2024-08-13T04:00:00Z");
    expect(summary.status).toEqual(["clientDeleteProhibited", "clientTransferProhibited"]);
    expect(summary.nameservers).toEqual(["A.IANA-SERVERS.NET", "B.IANA-SERVERS.NET"]);
  });
});
