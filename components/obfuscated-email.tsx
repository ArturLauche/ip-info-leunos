"use client";

import { useEffect, useState } from "react";

interface ObfuscatedEmailProps {
  /** Local part (before the "@"), passed separately from the domain. */
  user: string;
  /** Domain part (after the "@"). */
  domain: string;
  className?: string;
}

/**
 * Renders a contact email while keeping it away from naive email harvesters.
 *
 * The plain "user@domain" string and the mailto: link are assembled only in the
 * browser after hydration, so they never appear in the server-rendered HTML or
 * the RSC payload that scrapers read. Before hydration — and for visitors with
 * JavaScript disabled — a human-readable "user [at] domain [dot] tld" form is
 * shown instead: still legally accessible (GDPR Art. 13) but not a
 * regex-matchable address.
 */
export function ObfuscatedEmail({ user, domain, className }: ObfuscatedEmailProps) {
  const [revealed, setRevealed] = useState(false);

  // Runs only in the browser, so the assembled address is never part of the
  // server response. The initial (revealed === false) render matches the server
  // output, avoiding a hydration mismatch.
  useEffect(() => {
    setRevealed(true);
  }, []);

  if (!revealed) {
    return (
      <span className={className}>
        {user} [at] {domain.replace(/\./g, " [dot] ")}
      </span>
    );
  }

  const address = `${user}@${domain}`;

  return (
    <a href={`mailto:${address}`} className={className}>
      {address}
    </a>
  );
}
