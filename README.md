# IP Auskunft – IP-, DNS-, Whois-, CDN- und Netzwerk-Checks mit Next.js

IP Auskunft ist eine moderne Next.js-Anwendung, mit der du deine eigene öffentliche IP-Adresse analysierst und zusätzliche Netzwerk-Tools (IP/Domain-Check, DNS-Lookups, Whois-Abfragen, CDN-Erkennung, Ping/Port-Tests, Client-DNS-Scan) über eine einheitliche Oberfläche nutzen kannst.

## Warum dieses Projekt?

Viele „What is my IP?“-Seiten zeigen nur eine Zahl. Dieses Projekt geht deutlich weiter:

- **Kontext statt Rohdaten:** Standort, ASN, Provider, Zeitzone und Verbindungstyp.
- **Mehrere Werkzeuge in einer App:** Diagnose, Lookup und Netzwerkprüfung ohne Toolwechsel.
- **Fokus auf Performance + SEO:** strukturierte Metadaten, Open Graph, Sitemap, Robots und strukturierte Daten.

## Feature-Überblick

### Kernfunktionen

- **Eigene IP erkennen** (IPv4 + wenn verfügbar IPv6).
- **IP/Domain Lookup** über `/check`.
- **DNS Lookup** über `/dns` (mehrere Record-Typen).
- **Whois Lookup** über `/whois`.
- **CDN Erkennung** über `/cdn`.
- **Ping/Netzwerk-Checks** über `/ping`.
- **Client DNS & Privacy Scan** über `/client-dns`.

### SEO-Optimierungen (aktualisiert)

- Zentrale **Site-SEO-Konfiguration** (`lib/seo.ts`).
- **Metadata Base**, kanonische URLs, Keywords und Robots-Direktiven.
- Seitenbezogene Metadaten für die wichtigsten Tool-Seiten.
- **Open Graph** + **Twitter Card** Defaults.
- **JSON-LD WebSite-Schema** im Root-Layout.
- Dynamische **`/sitemap.xml`**, **`/robots.txt`** und **`/manifest.webmanifest`** via App Router.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime/UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Monitoring:** `@vercel/analytics`, `@vercel/speed-insights`
- **Externe Datenquellen:**
  - `ip-api.com` (IP- und Netzwerk-Metadaten)
  - `api64.ipify.org` (IPv6-Erkennung)

## Projektstruktur (gekürzt)

```text
app/
  layout.tsx              # globales Layout + globale SEO-Metadaten + JSON-LD
  page.tsx                # Startseite (eigene IP)
  check/page.tsx          # IP/Domain-Check
  ping/page.tsx           # Netzwerk-/Ping-Checks
  dns/page.tsx            # DNS-Tool
  whois/page.tsx          # Whois-Tool
  cdn/page.tsx            # CDN-Check
  client-dns/page.tsx     # Client DNS & Privacy
  sitemap.ts              # generiert /sitemap.xml
  robots.ts               # generiert /robots.txt
  manifest.ts             # generiert /manifest.webmanifest
lib/
  seo.ts                  # SEO-Konfiguration + Metadata-Factory
```

## Voraussetzungen

- **Node.js 20+**
- **pnpm**

## Lokale Entwicklung

```bash
pnpm install
pnpm dev
```

Danach im Browser öffnen:

- `http://localhost:3000`

## Build & Produktion

```bash
pnpm build
pnpm start
```

## Qualitätssicherung

```bash
pnpm lint
```

## Deployment-Hinweise

Die App ist **nicht rein statisch**, da serverseitige API-Routen und Laufzeitdaten genutzt werden.

Geeignet sind z. B.:

- Vercel
- Railway
- Render
- Fly.io
- Docker/VPS (mit `pnpm build && pnpm start`)

## Datenschutz & Genauigkeit

- Standort-/Providerdaten hängen von externen Quellen ab und können variieren.
- IPv6 wird nur angezeigt, wenn das Client-Netzwerk IPv6 bereitstellt.
- Für produktive Nutzung bitte eine eigene Datenschutzerklärung bereitstellen, wenn Analytics aktiviert ist.

## Lizenz

Aktuell ist in diesem Repository keine explizite Lizenzdatei enthalten. Wenn das Projekt öffentlich genutzt werden soll, ergänze bitte eine passende `LICENSE`.
