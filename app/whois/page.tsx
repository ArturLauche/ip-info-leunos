import { WhoisChecker } from "@/components/whois-checker";
import { Search } from "lucide-react";

export default function WhoisPage() {
  return (
    <main className="app-shell">
      <div className="app-gradient" aria-hidden />

      <div className="z-10 flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-10 md:py-16">
        <header className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
            <Search className="h-7 w-7 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">WHOIS Lookup</h1>
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">
              Query WHOIS records for domains and IP addresses directly from this app.
            </p>
          </div>
        </header>

        <section className="surface-panel w-full">
          <WhoisChecker />
        </section>
      </div>
    </main>
  );
}
