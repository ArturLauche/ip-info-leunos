# IP Auskunft

Eine kleine Next.js-Webanwendung zur Anzeige von IP- und Netzwerk-Informationen.

## Features

- Zeigt deine erkannte **IPv4** und – wenn verfuegbar – **IPv6**.
- Zeigt Standort-/Netzwerkdaten wie Land, Region, Stadt, ISP, AS und Zeitzone.
- Erkennt Verbindungstyp heuristisch (z. B. Glasfaser, DSL, Kabel, Mobilfunk, Hosting/VPN).
- Separate Suchseite (`/check`) zum Nachschlagen beliebiger IP-Adressen oder Domains.
- Ping-/Port-Tester unter `/ping` fuer TCP, UDP, EB-Endpunkte und Datenbank-Checks (inkl. optionalem Auth-Check fuer Redis).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react
- **Analytics:** @vercel/analytics
- **Datenquelle:** `ip-api.com` (Server-seitig) und `api64.ipify.org` (Client-seitig fuer IPv6-Erkennung)

## Ist die Seite statisch?

Kurz: **Nein, nicht rein statisch.**

Warum:

- Es gibt eine API-Route unter `app/api/ip/route.ts`, die zur Laufzeit Request-Header ausliest (`x-forwarded-for`, `x-real-ip`) und externe Daten abruft.
- Diese Route nutzt `fetch(..., { cache: "no-store" })` fuer Live-Abfragen.
- Das Frontend ruft diese API client-seitig per `fetch("/api/ip")` auf und rendert die Ergebnisse dynamisch.

Damit ist das Projekt eine **dynamische Next.js-Anwendung** (mit Client- und Server-Logik), keine rein statisch exportierte Seite.

## Hosting: statisch oder Server?

**Aktueller Stand:** Du brauchst einen **Node/Next.js-Server** (oder eine Plattform mit Serverless Functions).

- **Nicht ausreichend:** reines Static Hosting (nur HTML/CSS/JS, z. B. klassisches Netlify Static, GitHub Pages, S3 ohne Functions).
- **Geeignet:** Vercel, Railway, Render, Fly.io, Docker/VPS mit `pnpm build && pnpm start`.

Grund: Die API-Route `app/api/ip/route.ts` laeuft serverseitig und wird vom Frontend zur Laufzeit aufgerufen.

### Wenn du unbedingt statisch hosten willst

Dann musst du die App umbauen und `app/api/ip/route.ts` entfernen/ersetzen, z. B. indem das Frontend direkt einen externen API-Dienst aufruft (inkl. CORS-/Rate-Limit-Handling). Das ist ein Architekturwechsel und nicht der aktuelle Stand dieses Repos.

## Projektstruktur (Auszug)

- `app/page.tsx` – Startseite (eigene IP anzeigen)
- `app/check/page.tsx` – Suchseite fuer fremde IP/Domain
- `app/api/ip/route.ts` – Server-API fuer IP-Lookup und Aufbereitung
- `components/ip-display.tsx` – Anzeige der IP- und Metadaten
- `components/ip-lookup.tsx` – Eingabeformular fuer manuelle Abfrage

## Lokale Entwicklung

Voraussetzungen:

- Node.js 20+
- pnpm

Installation & Start:

```bash
pnpm install
pnpm dev
```

Danach unter `http://localhost:3000` aufrufen.

## Build & Produktion

```bash
pnpm build
pnpm start
```

## Hinweise

- Die Genauigkeit von Standort/Provider-Daten haengt vom Upstream-Dienst (`ip-api.com`) ab.
- Wenn keine IPv6-Adresse verfuegbar ist, wird das in der UI entsprechend angezeigt.
