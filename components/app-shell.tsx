import { headers } from "next/headers";
import { getTranslation, resolveLocale } from "@/lib/i18n";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const locale = resolveLocale(headersList.get("accept-language"));
  const t = getTranslation(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar translations={t} />
      <main className="flex flex-1 flex-col items-center px-4 py-10 md:py-16">
        {children}
      </main>
      <Footer translations={t} />
    </div>
  );
}
