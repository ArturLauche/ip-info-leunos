import type { Translation } from "@/lib/i18n";

interface FooterProps {
  translations: Translation;
}

export function Footer({ translations: t }: FooterProps) {
  return (
    <footer className="border-t border-border/60 py-6 text-center">
      <p className="text-xs text-muted-foreground">
        {t.footerDataBy}{" "}
        <a
          href="http://ip-api.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          ip-api.com
        </a>
      </p>
    </footer>
  );
}
