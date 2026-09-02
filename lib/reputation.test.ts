import { describe, expect, it } from "vitest";
import {
  aggregateReputation,
  interpretDnsblResponse,
  ipv6ToNibbleFormat,
  reverseIpv4ForDnsbl,
  type BlacklistStatus,
} from "./reputation";

function blacklist(partial: Partial<BlacklistStatus>): BlacklistStatus {
  return {
    id: "test",
    name: "Test",
    listed: false,
    checked: true,
    categories: [],
    ...partial,
  };
}

describe("DNSBL query encoding", () => {
  it("reverses IPv4 octets", () => {
    expect(reverseIpv4ForDnsbl("203.0.113.7")).toBe("7.113.0.203");
  });

  it("expands and reverses IPv6 nibbles", () => {
    expect(ipv6ToNibbleFormat("2001:db8::1")).toBe(
      "1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2",
    );
  });

  it("handles embedded IPv4 tails", () => {
    expect(ipv6ToNibbleFormat("::ffff:1.2.3.4")).toBe(
      "4.0.3.0.2.0.1.0.f.f.f.f.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0",
    );
  });

  it("rejects invalid input", () => {
    expect(ipv6ToNibbleFormat("not-an-ip")).toBeNull();
    expect(ipv6ToNibbleFormat("203.0.113.7")).toBeNull();
  });
});

describe("DNSBL response interpretation", () => {
  it("classifies Spamhaus SBL answers as spam sources", () => {
    const result = interpretDnsblResponse("zen.spamhaus.org", ["127.0.0.2"]);
    expect(result).toEqual({ listed: true, blocked: false, categories: ["spam_source"] });
  });

  it("classifies Spamhaus XBL answers as botnet activity", () => {
    const result = interpretDnsblResponse("zen.spamhaus.org", ["127.0.0.4"]);
    expect(result).toEqual({ listed: true, blocked: false, categories: ["botnet"] });
  });

  it("does not treat PBL-only answers as listings", () => {
    const result = interpretDnsblResponse("zen.spamhaus.org", ["127.0.0.10"]);
    expect(result.listed).toBe(false);
    expect(result.blocked).toBe(false);
  });

  it("detects blocked Spamhaus queries", () => {
    const result = interpretDnsblResponse("zen.spamhaus.org", ["127.255.255.254"]);
    expect(result.listed).toBe(false);
    expect(result.blocked).toBe(true);
  });

  it("treats any 127/8 answer from generic zones as a listing", () => {
    const result = interpretDnsblResponse("bl.spamcop.net", ["127.0.0.2"]);
    expect(result).toEqual({ listed: true, blocked: false, categories: ["spam_source"] });
  });

  it("does not trust non-127/8 answers", () => {
    const result = interpretDnsblResponse("bl.spamcop.net", ["10.0.0.1"]);
    expect(result.listed).toBe(false);
    expect(result.blocked).toBe(true);
  });
});

describe("reputation aggregation", () => {
  it("scores a clean IP as low risk", () => {
    const result = aggregateReputation({
      blacklists: [blacklist({})],
      abuseConfidence: 0,
      abuseReports: 0,
      proxy: false,
      hosting: false,
      tor: false,
    });

    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.categories).toEqual([]);
  });

  it("scores blacklist listings and abuse reports as high risk", () => {
    const result = aggregateReputation({
      blacklists: [
        blacklist({ listed: true, categories: ["spam_source"] }),
        blacklist({ listed: true, categories: ["botnet"] }),
      ],
      abuseConfidence: 100,
      abuseReports: 50,
      proxy: false,
      hosting: false,
      tor: false,
    });

    expect(result.score).toBe(90);
    expect(result.level).toBe("high");
    expect(result.categories).toContain("spam_source");
    expect(result.categories).toContain("botnet");
    expect(result.categories).toContain("abuse_reported");
  });

  it("scores proxy and hosting flags as medium risk", () => {
    const result = aggregateReputation({
      blacklists: [],
      abuseConfidence: null,
      abuseReports: null,
      proxy: true,
      hosting: true,
      tor: false,
    });

    expect(result.score).toBe(20);
    expect(result.level).toBe("low");
    expect(result.categories).toContain("proxy_vpn");
    expect(result.categories).toContain("hosting");
  });

  it("weights Tor exits above plain proxies and caps the score", () => {
    const tor = aggregateReputation({
      blacklists: [
        blacklist({ listed: true, categories: ["spam_source"] }),
        blacklist({ listed: true, categories: ["spam_source"] }),
        blacklist({ listed: true, categories: ["spam_source"] }),
      ],
      abuseConfidence: 100,
      abuseReports: 10,
      proxy: true,
      hosting: true,
      tor: true,
    });

    expect(tor.score).toBe(100);
    expect(tor.level).toBe("high");
    expect(tor.categories).toContain("tor");
    expect(tor.categories).not.toContain("proxy_vpn");
  });
});
