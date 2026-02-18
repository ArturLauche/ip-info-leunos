"use client";

import { useState, type FormEvent } from "react";
import { IpDisplay } from "@/components/ip-display";
import { getTranslation, type Locale } from "@/lib/i18n";
import { Search } from "lucide-react";

interface IpLookupProps {
  locale: Locale;
}

export function IpLookup({ locale }: IpLookupProps) {
  const [query, setQuery] = useState("");
  const [submittedIp, setSubmittedIp] = useState<string | null>(null);
  const t = getTranslation(locale);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSubmittedIp(trimmed);
  };

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl flex-col items-stretch gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="h-12 w-full rounded-lg border border-border bg-secondary/70 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          type="submit"
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {t.searchButton}
        </button>
      </form>

      {submittedIp && <IpDisplay targetIp={submittedIp} locale={locale} />}
    </div>
  );
}
