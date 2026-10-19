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
 * It stays a plain detail row (no nested panel) and the hash sits on a fixed
 * eight-group grid, so it never breaks mid-group or leaves a ragged last line.
 * The loading placeholder uses the same grid so the card keeps its size once
 * the hash lands.
 */
export function BrowserFingerprintView({
  value,
  ready,
  t,
}: BrowserFingerprintProps & { t: Translation }) {
  const groups = value ? splitFingerprintGroups(value) : [];

  return (
    <div className="border-b border-border/60 py-3 last:border-b-0">
      <dt className="flex items-baseline gap-2 text-sm text-muted-foreground">
        <span className="min-w-0 truncate">{t.browserFingerprint}</span>
        <span className="font-mono text-[10px] font-medium tracking-[0.08em] text-muted-foreground/60">
          {FINGERPRINT_HASH_ALGORITHM}
        </span>
      </dt>
      <dd
        aria-busy={ready ? undefined : true}
        className="mt-1.5 flex min-w-0 items-start gap-2"
      >
        {!ready ? (
          <>
            <div
              aria-hidden="true"
              className="grid flex-1 grid-cols-2 gap-x-3 gap-y-1 min-[380px]:grid-cols-4"
            >
              {PLACEHOLDER_GROUPS.map((_, index) => (
                <span key={index} className="flex h-5 items-center">
                  <Skeleton className="h-3.5 w-full" />
                </span>
              ))}
            </div>
            <Skeleton className="-me-1.5 -mt-0.5 size-8 shrink-0 rounded-md" />
          </>
        ) : value ? (
          <>
            <span className="sr-only">{value}</span>
            <div
              dir="ltr"
              aria-hidden="true"
              className="tool-section-reveal grid flex-1 grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px] leading-5 font-medium tracking-[0.04em] text-foreground select-all min-[380px]:grid-cols-4 min-[380px]:text-xs sm:text-sm"
            >
              {groups.map((group, index) => (
                <span key={index} data-fingerprint-group>
                  {group}
                </span>
              ))}
            </div>
            <CopyButton
              text={value}
              label={t.copyFingerprintLabel}
              copiedLabel={t.copiedToClipboard}
              failedLabel={t.copyFailed}
              className="-me-1.5 -mt-1 size-8"
              showLabel={false}
            />
          </>
        ) : (
          <p className="flex w-full items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{t.fingerprintUnavailable}</span>
          </p>
        )}
      </dd>
    </div>
  );
}
