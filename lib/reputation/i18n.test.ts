import { describe, expect, it } from "vitest";
import { getToolTranslation } from "@/lib/tool-i18n";
import { REPUTATION_SOURCES } from "./model";

/**
 * The reputation UI resolves reason codes and source ids against translation
 * records at runtime. Because `de` spreads over `en`, a missing record key
 * would silently render as undefined — this keeps both locales aligned.
 */
const REPUTATION_RECORDS = [
  "reputationCategories",
  "reputationSeverities",
  "reputationSourceStates",
  "reputationReasons",
  "reputationSourceDescriptions",
] as const;

describe("reputation translation parity", () => {
  it("keeps every reputation record aligned between English and German", () => {
    const en = getToolTranslation("en");
    const de = getToolTranslation("de");

    for (const recordKey of REPUTATION_RECORDS) {
      const enRecord: Record<string, string> = en[recordKey];
      const deRecord: Record<string, string> = de[recordKey];

      expect(Object.keys(deRecord).sort(), recordKey).toEqual(
        Object.keys(enRecord).sort(),
      );
      for (const [key, value] of Object.entries(enRecord)) {
        expect(deRecord[key], `${recordKey}.${key}`).toBeTruthy();
        expect(typeof value).toBe("string");
      }
    }
  });

  it("describes every integrated source in both locales", () => {
    const en = getToolTranslation("en");
    const de = getToolTranslation("de");

    for (const source of REPUTATION_SOURCES) {
      expect(en.reputationSourceDescriptions[source.id], source.id).toBeTruthy();
      expect(de.reputationSourceDescriptions[source.id], source.id).toBeTruthy();
    }
  });

  it("translates the reason codes emitted by the providers", () => {
    const en = getToolTranslation("en");
    const de = getToolTranslation("de");

    const reasons = [
      "sbl",
      "css",
      "xbl",
      "drop",
      "pbl_isp",
      "pbl_spamhaus",
      "bcl",
      "spamcop_listing",
      "barracuda_listing",
      "dronebl_irc_drone",
      "dronebl_ddos_drone",
      "dronebl_open_socks_proxy",
      "dronebl_dictionary",
      "dronebl_compromised_router",
      "dronebl_uncategorized",
      "bld_attack",
      "bld_counts_only",
      "feodo_c2_online",
      "feodo_c2_offline",
      "greynoise_scanner_malicious",
      "greynoise_scanner_unknown",
      "greynoise_scanner_benign",
      "greynoise_riot",
      "abuseipdb_reports",
      "abuseipdb_tor",
      "threatfox_ioc",
      "httpbl_search_engine",
      "httpbl_suspicious",
      "httpbl_harvester",
      "httpbl_comment_spammer",
      "ipapi_vpn",
      "ipapi_hosting",
      "ipapi_mobile",
      "residential_estimate",
      "corroboration",
      "mail_corroboration",
    ];

    for (const reason of reasons) {
      expect(en.reputationReasons[reason], reason).toBeTruthy();
      expect(de.reputationReasons[reason], reason).toBeTruthy();
    }
  });
});
