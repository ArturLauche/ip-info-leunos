import { headers } from "next/headers";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { ToolPageShell } from "@/components/tool-page-shell";
import { resolveLocale } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";
import {
  getPrivacyContactEmail,
  getPrivacyContent,
  getPrivacyControllerName,
} from "@/lib/privacy";

export const metadata: Metadata = createPageMetadata({
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung: Umgang mit IP-Adressen, eingebundene Dienste und deine Rechte nach DSGVO.",
  path: "/privacy-policy",
  keywords: ["Datenschutz", "DSGVO", "Privacy Policy"],
});

interface ParagraphTokens {
  email: string | null;
  emailFallback: string;
}

/**
 * Substitutes the plain-text {controller} token, then splits on {email} and
 * renders the contact address as a mailto link (or a muted fallback when unset).
 */
function renderParagraph(text: string, controller: string, tokens: ParagraphTokens) {
  const resolved = text.replace("{controller}", controller);
  const parts = resolved.split("{email}");
  if (parts.length === 1) return resolved;

  const { email, emailFallback } = tokens;

  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 &&
        (email ? (
          <a
            href={`mailto:${email}`}
            className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {email}
          </a>
        ) : (
          <span className="italic text-muted-foreground/80">{emailFallback}</span>
        ))}
    </span>
  ));
}

export default async function DatenschutzPage() {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const content = getPrivacyContent(locale);
  const email = getPrivacyContactEmail();
  const controller = getPrivacyControllerName() ?? content.controllerNotConfigured;

  return (
    <ToolPageShell
      locale={locale}
      icon={ShieldCheck}
      title={content.title}
      subtitle={content.subtitle}
    >
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
                  {renderParagraph(paragraph, controller, {
                    email,
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
