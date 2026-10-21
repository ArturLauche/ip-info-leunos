"use client";

import { Info } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { useI18n } from "@/components/i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FINGERPRINT_DIGEST_HEX_LENGTH,
  FINGERPRINT_HASH_ALGORITHM,
  splitFingerprintGroups,
} from "@/lib/browser-info";
import type { Translation } from "@/lib/i18n";

/** Loading cells mirror the groups of a full digest, so the placeholder matches a loaded hash. */
const PLACEHOLDER_GROUPS = splitFingerprintGroups(
  "0".repeat(FINGERPRINT_DIGEST_HEX_LENGTH),
);

interface BrowserFingerprintProps {
  /** Lowercase SHA-256 hex, or `null` when the browser cannot hash it. */
  value: string | null;
  /** `false` while the hash is still being calculated. */
  ready: boolean;
}

export function BrowserFingerprint(props: BrowserFingerprintProps) {
  const { core: t } = useI18n();
  return <BrowserFingerprintView {...props} t={t} />;
}

/**
 * Hash-only view of the visitor fingerprint, rendered inside the Browser card.
 * The hash sits on a fixed eight-group grid, so it never breaks mid-group or
 * leaves a ragged last line, and the loading placeholder uses the same grid so
 * the card keeps its size once the hash lands.
 */
export function BrowserFingerprintView({
  value,
  ready,
  t,
}: BrowserFingerprintProps & { t: Translation }) {
  const groups = value ? splitFingerprintGroups(value) : [];

  return (
    <div className="relative border-b border-border/60 py-3 last:border-b-0">
      <dt className="flex min-h-8 flex-wrap items-center gap-x-2 gap-y-1 pe-10 text-sm text-muted-foreground">
        <span>{t.browserFingerprint}</span>
        <span className="font-mono text-[11px]">{FINGERPRINT_HASH_ALGORITHM}</span>
      </dt>
      <dd className="mt-1 min-w-0">
        {value ? (
          <CopyButton
            text={value}
            label={t.copyFingerprintLabel}
            copiedLabel={t.copiedToClipboard}
            failedLabel={t.copyFailed}
            className="absolute -end-1 top-2.5"
          />
        ) : (
          !ready && <Skeleton className="absolute -end-1 top-2.5 size-9 rounded-md" />
        )}
        <div
          aria-busy={ready ? undefined : true}
          className="flex min-h-23 items-center min-[380px]:min-h-11"
        >
          {!ready ? (
            <div
              aria-hidden="true"
              className="grid w-full grid-cols-2 gap-x-3 gap-y-1 min-[380px]:grid-cols-4"
            >
              {PLACEHOLDER_GROUPS.map((_, index) => (
                <span key={index} className="flex h-5 items-center">
                  <Skeleton className="h-3 w-16" />
                </span>
              ))}
            </div>
          ) : value ? (
            <>
              <span className="sr-only">{value}</span>
              <div
                dir="ltr"
                aria-hidden="true"
                className="tool-section-reveal grid w-full grid-cols-2 gap-x-3 gap-y-1 font-mono text-sm leading-5 text-muted-foreground select-all min-[380px]:grid-cols-4"
              >
                {groups.map((group, index) => (
                  <span key={index} data-fingerprint-group>
                    {group}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="flex w-full items-start gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{t.fingerprintUnavailable}</span>
            </p>
          )}
        </div>
      </dd>
    </div>
  );
}
