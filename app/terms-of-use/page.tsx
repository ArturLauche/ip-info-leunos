import { headers } from "next/headers";
import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";
import { getPrivacyContactEmail } from "@/lib/privacy";
import { getTermsContent } from "@/lib/terms";
import { splitEmail, type EmailParts } from "@/lib/email";
import { ObfuscatedEmail } from "@/components/obfuscated-email";
import { StructuredData } from "@/components/structured-data";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Nutzungsbedingungen",
  description:
    "Nutzungsbedingungen: Bedingungen für die Nutzung der IP-, Domain- und Netzwerk-Werkzeuge dieser Seite.",
  path: "/terms-of-use",
  keywords: ["Nutzungsbedingungen", "Terms of Use", "AGB"],
});

interface ParagraphTokens {
  emailParts: EmailParts | null;
  emailFallback: string;
}

/**
 * Splits on {email} and renders the contact address via a client component that
 * assembles it in the browser (keeping it out of the HTML), or a muted fallback
 * when no contact address is configured.
 */
function renderParagraph(text: string, tokens: ParagraphTokens) {
  const parts = text.split("{email}");
  if (parts.length === 1) return text;

  const { emailParts, emailFallback } = tokens;

  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 &&
        (emailParts ? (
          <ObfuscatedEmail
            user={emailParts.user}
            domain={emailParts.domain}
            className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
          />
        ) : (
          <span className="italic text-muted-foreground/80">{emailFallback}</span>
        ))}
    </span>
  ));
}

export default async function TermsOfUsePage() {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const content = getTermsContent(locale);
  const emailParts = splitEmail(getPrivacyContactEmail() ?? "");

  return (
    <ToolPageShell
      locale={locale}
      icon={ScrollText}
      title={content.title}
      subtitle={content.subtitle}
    >
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${siteConfig.url}/terms-of-use#article`,
          headline: content.title,
          description: content.subtitle,
          dateModified: content.lastUpdated,
          inLanguage: locale === "de" ? "de-DE" : locale,
          mainEntityOfPage: `${siteConfig.url}/terms-of-use`,
          author: { "@id": `${siteConfig.url}/#organization` },
          publisher: { "@id": `${siteConfig.url}/#organization` },
          isPartOf: { "@id": `${siteConfig.url}/#website` },
        }}
      />
      <article className="mx-auto w-full max-w-3xl">
        <p className="text-xs text-muted-foreground">
          {content.lastUpdatedLabel}: {content.lastUpdated}
        </p>

        <div className="mt-6 space-y-8">
          {content.sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {renderParagraph(paragraph, {
                    emailParts,
                    emailFallback: content.contactNotConfigured,
                  })}
                </p>
              ))}
              {section.bullets && (
                <ul className="space-y-2 pl-5">
                  {section.bullets.map((bullet, index) => (
                    <li
                      key={index}
                      className="list-disc text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground/60"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </ToolPageShell>
  );
}
