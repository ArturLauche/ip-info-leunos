import { IpLookup } from "@/components/ip-lookup";
import { getTranslation, resolveLocale } from "@/lib/i18n";
import { headers } from "next/headers";

export default async function CheckPage() {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getTranslation(locale);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <header className="animate-fade-in flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t.checkTitle}
        </h1>
        <p className="max-w-md text-sm text-muted-foreground text-balance">
          {t.checkSubtitle}
        </p>
      </header>
      <IpLookup locale={locale} />
    </div>
  );
}
