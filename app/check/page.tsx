import { IpLookup } from "@/components/ip-lookup";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckPage() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-16 md:py-24">
      {/* Header */}
      <header className="mb-12 flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Search className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg font-semibold text-foreground">
            IP Abfrage
          </h2>
          <p className="text-sm text-muted-foreground">
            Beliebige IP-Adresse oder Domain nachschlagen
          </p>
        </div>
      </header>

      {/* Lookup Component */}
      <IpLookup />

      {/* Back to Home */}
      <div className="mt-12">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-border hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurueck zur eigenen IP
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-xs text-muted-foreground">
        <p>
          Daten bereitgestellt von{" "}
          <a
            href="http://ip-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary transition-colors hover:text-primary/80"
          >
            ip-api.com
          </a>
        </p>
      </footer>
    </main>
  );
}
