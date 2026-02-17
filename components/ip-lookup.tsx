"use client";

import { useState, type FormEvent } from "react";
import { IpDisplay } from "@/components/ip-display";
import { Search } from "lucide-react";
import { uiText, type SupportedLanguage } from "@/lib/i18n";

interface IpLookupProps {
  lang: SupportedLanguage;
}

export function IpLookup({ lang }: IpLookupProps) {
  const [query, setQuery] = useState("");
  const [submittedIp, setSubmittedIp] = useState<string | null>(null);
  const text = uiText[lang];

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
        className="flex w-full max-w-lg items-stretch gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={text.lookupPlaceholder}
            className="h-12 w-full rounded-lg border border-border bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {text.lookupButton}
        </button>
      </form>

      {submittedIp && <IpDisplay targetIp={submittedIp} lang={lang} />}
    </div>
  );
}
