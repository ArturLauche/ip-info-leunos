"use client";

import { Building2, TriangleAlert } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { AsnProfile } from "@/lib/asn";
import { formatTemplate } from "@/lib/format";
import type { Locale } from "@/lib/locale-config";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { formatWarning } from "./helpers";

/**
 * The Peering tab when PeeringDB has nothing to show. A provider failure (rate
 * limit, timeout) and a network that simply has no record are different
 * answers: a failure says what went wrong using the API's structured warnings
 * (never the raw provider prose) and never claims the record does not exist.
 */
export function PeeringUnavailable({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const { ui } = useI18n();
  const failed = result.sources.peeringdb !== "available";
  const notes = [
    ...new Set(
      (result.warningDetails ?? [])
        .filter((warning) => warning.provider === "PeeringDB" && warning.code !== "truncated")
        .map((warning) => formatWarning(warning, t, ui, locale)),
    ),
  ];
  const [lead, ...rest] = failed
    ? notes.length > 0
      ? notes
      : [formatTemplate(t.asnWarningProviderUnavailable, { provider: "PeeringDB" })]
    : [t.asnWarningNoPeeringDbProfile];
  const Icon = failed ? TriangleAlert : Building2;

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/80 px-6 py-10 text-center">
      <Icon
        className={failed ? "size-5 text-warning" : "size-5 text-muted-foreground/60"}
        aria-hidden
      />
      <p className="max-w-md text-sm text-muted-foreground">{lead}</p>
      {rest.length > 0 && (
        <ul className="flex max-w-md flex-col gap-0.5 text-xs text-muted-foreground/90">
          {rest.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
