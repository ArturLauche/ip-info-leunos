"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 country code (e.g. "DE"). Case-insensitive. */
  countryCode: string | null | undefined;
  /** Human-readable country name, used for the accessible label. */
  countryName?: string;
  className?: string;
}

/**
 * Renders a country flag as a crisp SVG image rather than a Unicode emoji.
 *
 * Flag emoji silently fail to render on Windows (and several Linux font setups)
 * — the browser shows the bare letters instead — so emoji can't be relied on to
 * display "everywhere". An image guarantees the flag appears on every platform.
 *
 * If the code is invalid or the image fails to load it renders nothing; the
 * adjacent country name/code still carries the meaning.
 */
export function CountryFlag({
  countryCode,
  countryName,
  className,
}: CountryFlagProps) {
  const code = countryCode?.trim().toLowerCase();
  const isValid = !!code && /^[a-z]{2}$/.test(code);
  const [failed, setFailed] = useState(false);

  // Reset the error state if the code changes (e.g. a new lookup).
  useEffect(() => {
    setFailed(false);
  }, [code]);

  if (!isValid || failed) return null;

  const label = countryName
    ? `${countryName} flag`
    : `${code!.toUpperCase()} flag`;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny external flag thumbnail; next/image adds nothing here (images run unoptimized) and we need the onError fallback.
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={label}
      width={20}
      height={15}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(
        "inline-block h-3.5 w-5 shrink-0 rounded-[3px] object-cover align-[-0.15em] ring-1 ring-black/10 dark:ring-white/15",
        className,
      )}
    />
  );
}
