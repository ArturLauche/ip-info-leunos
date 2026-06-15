"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 country code (e.g. "DE"). Case-insensitive. */
  countryCode: string | null | undefined;
  className?: string;
}

/**
 * Renders a country flag as a crisp SVG image rather than a Unicode emoji.
 *
 * Flag emoji silently fail to render on Windows (and several Linux font setups)
 * — the browser shows the bare letters instead — so emoji can't be relied on to
 * display "everywhere". An image guarantees the flag appears on every platform.
 *
 * The image is served same-origin via /api/flag/[code] (which proxies the
 * upstream) so no visitor data leaks to a third party and it works under a
 * strict CSP. It is purely decorative: every call site renders the country name
 * or code right next to it, so the image carries no extra meaning and uses an
 * empty alt to stay out of the accessibility tree. If the code is invalid or
 * the image fails to load it renders nothing.
 */
export function CountryFlag({ countryCode, className }: CountryFlagProps) {
  const code = countryCode?.trim().toLowerCase();
  const isValid = !!code && /^[a-z]{2}$/.test(code);
  const [failed, setFailed] = useState(false);

  // Reset the error state if the code changes (e.g. a new lookup).
  useEffect(() => {
    setFailed(false);
  }, [code]);

  if (!isValid || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny same-origin flag thumbnail; next/image adds nothing here (images run unoptimized) and we need the onError fallback.
    <img
      src={`/api/flag/${code}`}
      alt=""
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
