"use client";

import { Info } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { useI18n } from "@/components/i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FINGERPRINT_HASH_ALGORITHM,
  splitFingerprintGroups,
} from "@/lib/browser-info";
import type { Translation } from "@/lib/i18n";

/** SHA-256 renders as 64 hex characters, i.e. eight 8-character groups. */
const HASH_GROUP_COUNT = 8;

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
    <div className="border-b border-border/60 py-4 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{t.browserFingerprint}</dt>
      <dd className="mt-2.5 min-w-0">
        <div className="overflow-hidden rounded-lg border bg-muted/40">
          <div className="flex h-11 items-center justify-between gap-3 border-b ps-4 pe-2">
            <span className="font-mono text-xs font-medium text-muted-foreground">
              {FINGERPRINT_HASH_ALGORITHM}
            </span>
            {value ? (
              <CopyButton
                text={value}
                label={t.copyFingerprintLabel}
                visibleLabel={t.copyAction}
                copiedLabel={t.copiedToClipboard}
                failedLabel={t.copyFailed}
                className="text-foreground"
                showLabel
              />
            ) : (
              !ready && <Skeleton className="h-8 w-20 rounded-md" />
            )}
          </div>

          <div
            aria-busy={ready ? undefined : true}
            className="flex min-h-36 items-center px-4 py-3 min-[380px]:min-h-21"
          >
            {!ready ? (
              <div
                aria-hidden="true"
                className="grid w-full grid-cols-2 gap-x-3 gap-y-2 min-[380px]:grid-cols-4"
              >
                {Array.from({ length: HASH_GROUP_COUNT }, (_, index) => (
                  <span key={index} className="flex h-6 items-center">
                    <Skeleton className="h-3.5 w-full" />
                  </span>
                ))}
              </div>
            ) : value ? (
              <>
                <span className="sr-only">{value}</span>
                <div
                  dir="ltr"
                  aria-hidden="true"
                  className="tool-section-reveal grid w-full grid-cols-2 gap-x-3 gap-y-2 font-mono text-xs leading-6 font-medium tracking-[0.04em] text-foreground select-all min-[380px]:grid-cols-4 sm:text-sm"
                >
                  {groups.map((group, index) => (
                    <span key={index} data-fingerprint-group>
                      {group}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="flex w-full items-start gap-2.5 text-sm text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{t.fingerprintUnavailable}</span>
              </p>
            )}
          </div>
        </div>
      </dd>
    </div>
  );
}
