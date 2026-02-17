import Link from "next/link";
import { languageLabels, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n";

interface LanguageSwitcherProps {
  current: SupportedLanguage;
  path: "/" | "/check";
}

export function LanguageSwitcher({ current, path }: LanguageSwitcherProps) {
  return (
    <nav className="mb-8 flex flex-wrap items-center justify-center gap-2" aria-label="Language selector">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <Link
          key={lang}
          href={`${path}?lang=${lang}`}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
            current === lang
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {languageLabels[lang]}
        </Link>
      ))}
    </nav>
  );
}
