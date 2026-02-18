"use client";

import { useState, type FormEvent } from "react";
import { IpDisplay } from "@/components/ip-display";
import { getTranslation, type Locale } from "@/lib/i18n";
import { Search, Loader2 } from "lucide-react";

interface IpLookupProps {
  locale: Locale;
}

export function IpLookup({ locale }: IpLookupProps) {
  const [query, setQuery] = useState("");
  const [submittedIp, setSubmittedIp] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const t = getTranslation(locale);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsSearching(true);
    setSubmittedIp(trimmed);
    // Reset searching state after a brief delay to allow IpDisplay to take over
    setTimeout(() => setIsSearching(false), 300);
  };

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {t.searchButton}
        </button>
      </form>

      {submittedIp && (
        <div className="animate-fade-in w-full">
          <IpDisplay targetIp={submittedIp} locale={locale} />
        </div>
      )}
    </div>
  );
}
