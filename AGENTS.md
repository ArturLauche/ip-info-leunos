# AGENTS.md — ip-info-leunos

Leitfaden für KI-Agenten und Entwickler, die an **IP Auskunft** arbeiten. Dieses Projekt ist eine öffentlich deploybare Next.js-Netzwerk-Toolbox: IP-Metadaten und begrenzte Checks gegen **nur öffentliche** Internet-Ziele.

**Produktions-URL:** `https://ip-info.leunos.com` (siehe `lib/seo.ts` → `siteConfig.url`)

---

## Schnellstart

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint
pnpm typecheck    # next typegen && tsc --noEmit — Build ignoriert TS-Fehler nicht
pnpm test         # vitest run (Node-Umgebung)
pnpm build        # funktioniert offline (Fonts self-hosted via geist-Paket)
```

Paketmanager: **pnpm**. Import-Alias: `@/*` → Projektroot (`tsconfig.json`).

---

## Was dieses Repo ist (und was nicht)

| Ja | Nein |
|----|------|
| Server-seitige API-Routes mit Zod, Rate-Limits, Timeouts | Statischer Export (`next export`) |
| Öffentliche IPs/Domains/URLs als Ziele | Scans gegen private/interne Netze |
| Eigenständiges ASN-Tool (`/asn`, `/asn/AS8881`) + AS-Feld im IP-Lookup | — |
| shadcn/ui-Design-System (Radix-Primitive in `components/ui/`) + Sidebar-Shell | Ad-hoc-Styling, das die Design-Tokens umgeht |
| Light/Dark-Themes über `next-themes` (Default `dark`) | Hartkodierte Hex-Farben statt semantischer Tokens |
| Locale über `Accept-Language` (Server) | Locale-Prefix-Routen (`/de/...`) |

Vor netzwerkbezogenen Änderungen: **`README.md` (Safety Model)** und **`lib/network/target.ts`** lesen.

---

## Architektur (Überblick)

```
app/                    Seiten (Server Components) + API-Routes
components/             Feature-UI: Checker, Shells, Panels
  ui/                   shadcn/ui-Primitive (Button, Card, Table, Dialog, ...)
  shell/               App-Shell: Sidebar, Mobile-Nav, Nav-Config, Brand-Mark
  asn/                  ASN-Checker, in Sektions-Komponenten aufgeteilt
  theme-provider.tsx    next-themes-Wrapper; mode-toggle.tsx Theme-Umschalter
hooks/
  use-tool-lookup.ts    Gemeinsame Checker-State-Machine (Loading/Error/
                        Result, URL-Sync, Stale-Response-Guard)
lib/
  api/                  response.ts, rate-limit.ts, client.ts (ApiClientError)
  network/              target.ts (SSRF-Schutz), database-probes.ts
  providers/            ip-api.ts (gemeinsamer ip-api.com-Client)
  connection-type.ts    Verbindungstyp-Codes + Proxy-Heuristik (pur, getestet)
  dns-records.ts        DNS-Record-Werte lesbar formatieren
  whois.ts              WHOIS-Parsing, Referral-Normalisierung
  format.ts             getCountryFlag, formatTemplate, formatNumber, valueOrDash
  utils.ts              cn() (clsx + tailwind-merge) für shadcn-Komponenten
  i18n.ts, tool-i18n.ts, seo.ts, asn.ts, reputation.ts, client-ip-discovery.ts
public/                 Icons, Verifikation
app/globals.css         Design-Tokens (Tailwind 4, OKLCH, Light `:root` + `.dark`)
components.json         shadcn-Konfiguration (New York, Tokens, Aliases)
```

**Seitenmuster** (alle Tool-Seiten außer `/`):

1. `headers()` → `resolveLocale(accept-language)`
2. `createPageMetadata({ title, description, path, keywords })`
3. `ToolPageShell` mit `locale`, `active`, Icon, Titel/Untertitel
4. Client-Checker als Kind

**Checker-Muster** (`"use client"`):

- `useToolLookup<T>({ buildApiUrl, buildHref, mapError, initialQuery, onStart })` aus `hooks/use-tool-lookup.ts`
- Fehler-Mapping über **Error-Codes**: `getApiErrorMessage(error, t, fallback)` aus `lib/tool-i18n.ts` bzw. `ApiClientError.code` — **niemals** auf englische Message-Strings matchen
- Fehler → `ErrorPanel`
- Deep-Links: der Hook ruft `router.replace(buildHref(query), { scroll: false })`

---

## Routen

### Seiten

| Pfad | Komponente | Query-Parameter |
|------|------------|-----------------|
| `/` | `IpDisplay` | — (eigene IP aus Headers) |
| `/check` | `IpLookup` → `IpDisplay` | `ip`, `q` |
| `/asn`, `/asn/[asn]` | `AsnChecker` (`components/asn/`) | `asn`, `q`, `source-info` |
| `/ping` | `PingChecker` | `target`, `port`, `mode` |
| `/dns` | `DnsChecker` | `target` |
| `/whois` | `WhoisChecker` | `target` |
| `/cdn` | `CdnChecker` | `target` |
| `/reputation` | `ReputationChecker` | `ip` |

Navigation und `ToolKey`: `components/shell/nav-config.ts` — `home | check | asn | ping | dns | whois | cdn | reputation` (gerendert von `ToolPageShell` über Sidebar/Mobile-Nav).

### API

| Route | Methode | Rate-Limit | Runtime |
|-------|---------|------------|---------|
| `/api/ip` | GET | 80/min | Node (implizit) |
| `/api/asn/[asn]` | GET | 30/min | `nodejs` |
| `/api/dns` | GET | 40/min | `nodejs` |
| `/api/whois` | GET | 20/min | `nodejs` |
| `/api/cdn` | GET | 20/min | Node |
| `/api/ping` | POST (JSON) | 20/min | `nodejs` |
| `/api/reputation` | GET | 20/min | `nodejs` |

Jede Route beginnt mit `enforceRateLimit(request, routeKey, { limit, windowMs })` aus `lib/api/rate-limit.ts`.

`/api/ip` liefert `connectionType` als **Code** (`datacenter`, `fiber`, `dsl`, ... — siehe `lib/connection-type.ts`); die Übersetzung passiert im Client über `t.connectionTypes`. Unbekannte Felder sind **leere Strings**, niemals server-seitig übersetzte Platzhalter.

---

## Sicherheitsmodell (Pflicht)

Dieses Projekt ist für **öffentliches Hosting** gedacht. Jede neue Netzwerk-Interaktion muss durch die bestehenden Helfer laufen.

### Ziel-Validierung (`lib/network/target.ts`)

| Funktion | Verwendung |
|----------|------------|
| `assertPublicTarget(input)` | Domains/IPs vor DNS-Lookups und Sockets |
| `assertPublicIpAddress(ip)` | Einzelne aufgelöste Adressen |
| `assertPublicUrl(url)` / `fetchPublicUrl()` | HTTP-Fetches mit Redirect- und Größenlimits |
| `normalizeLookupTarget()` / `normalizeWebUrl()` | Normalisierung; lehnt Credentials in URLs ab |

Fehler: `TargetValidationError` mit `code`: `invalid_target` | `target_blocked` | `timeout` | `network_error` → in Routes als `apiError(error.code, ...)`.

**Blockiert u. a.:** `localhost`, `*.local`, `*.internal`, `10/8`, `127/8`, `172.16/12`, `192.168/16`, `169.254/16`, `::1`, `fc00::/7`, `fe80::/10`, Dokumentations- und Multicast-Bereiche (vollständige Listen in `target.ts`).

### Rate Limiting (`lib/api/rate-limit.ts`)

- In-Memory Token-Bucket pro `routeKey:clientIp`
- Client-IP aus `cf-connecting-ip` / `forwarded` / `x-forwarded-for` / `x-real-ip` / Fallback
- Bei Limit: `apiError("rate_limited", ..., 429)` mit `retry-after`, `x-ratelimit-*`

### Ping-spezifisch

- Optional: `PUBLIC_ALLOWED_PING_PORTS` (kommagetrennt, z. B. `80,443,5432`) in `app/api/ping/route.ts`
- DB-Probes: `lib/network/database-probes.ts` — Auth nur für Redis

### Request-Validierung

- **zod** `safeParse` auf allen Eingaben
- `apiValidationError(zodError)` aus `lib/api/response.ts`

---

## API-Antwortformat

Einheitlich in `lib/api/response.ts`:

```ts
// Erfolg
{ ok: true, data: T }

// Fehler
{ ok: false, error: { code: ApiErrorCode, message: string, details?: unknown } }
```

Helfer: `apiOk()`, `apiError()`, `apiValidationError()`. Standard-Header: `cache-control: no-store` — nicht ohne Grund überschreiben.

Client: `unwrapApiResponse<T>()` wirft bei `ok: false` einen **`ApiClientError`** mit `code`, `message`, `details`. UI-Fehlermeldungen werden über den Code aufgelöst (`getApiErrorMessage`), nie über den Message-Text.

**Fehlercodes:** `bad_request`, `invalid_target`, `target_blocked`, `rate_limited`, `upstream_error`, `timeout`, `network_error`.

---

## Neues Tool hinzufügen (Checkliste)

1. **Sicherheit:** Route nutzt `assertPublicTarget` / `assertPublicUrl` / `fetchPublicUrl` — nie rohes `fetch()` oder `socket.connect()` auf User-Input.
2. **API:** `enforceRateLimit` + zod-Schema + `apiOk`/`apiError`; bei Node-Sockets: `export const runtime = "nodejs"`.
3. **Seite:** `app/<tool>/page.tsx` mit Metadata + `ToolPageShell`.
4. **Checker:** `components/<tool>-checker.tsx` (`"use client"`) auf Basis von `useToolLookup`; mit shadcn-Komponenten aus `components/ui/` (Card, Button, Badge, Table, ...) und gemeinsamen Panels (`ResultPanel`, `ErrorPanel`, `ToolSearchForm`) bauen.
5. **Navigation:** `ToolKey` und Links in `components/shell/nav-config.ts` erweitern.
6. **i18n:** Strings in `lib/tool-i18n.ts` (Englisch-Basis; `de` als Merge; andere Locales → Englisch-Fallback). Fehler über die generischen `error*`-Keys mappen.
7. **SEO:** `createPageMetadata` + Eintrag in `app/sitemap.ts`.
8. **Tests:** Vitest für Logik/Sicherheit (`*.test.ts` neben Modul oder unter `app/api/...`).

---

## Internationalisierung

| Datei | Inhalt |
|-------|--------|
| `lib/i18n.ts` | Home/Check/IP-Display inkl. `connectionTypes`-Codes; `SUPPORTED_LOCALES`, `resolveLocale()`, `getTranslation()` — 8 Locales vollständig |
| `lib/tool-i18n.ts` | Alle Tools + generische `error*`-Keys; `getToolTranslation()`, `getApiErrorMessage()` — `en` vollständig, `de` als Merge, Rest → `en` |

- Server: Locale aus `Accept-Language` (Aliase wie `de-de` → `de`, Default `en`).
- Client-Checker erhalten `locale` als Prop — **kein** React Context, **kein** next-intl.
- API-Routes liefern **keine** übersetzten Texte; Daten sind Codes oder leere Strings, die UI übersetzt.
- `<html lang="de">` in `app/layout.tsx` ist fest (unabhängig von Accept-Language).

Neue UI-Strings: beide Dateien konsistent pflegen; Deutsch in `tool-i18n` per Spread über Englisch (`de: { ...en, ...de }`).

---

## SEO

- `lib/seo.ts`: `siteConfig`, `createPageMetadata()`
- `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` (Farben spiegeln `app/globals.css`)
- JSON-LD `WebSite` in `app/layout.tsx` (`inLanguage: de-DE`)

Bei neuen Seiten: canonical URL, OpenGraph, Keywords an bestehende Seiten anlehnen.

---

## Frontend & Styling

- **Design-System:** shadcn/ui (New York) auf Radix-Primitiven in `components/ui/`; Konfiguration in `components.json`. Klassen immer über `cn()` aus `lib/utils.ts` zusammenführen.
- **Tokens:** `app/globals.css` (Tailwind 4, OKLCH). Light unter `:root`, Dark unter `.dark`, gemappt im `@theme inline`-Block. Semantik: `background/foreground`, `card`, `muted`, `secondary`, `primary`, `border`, `ring`, Status `success/warning/info/destructive` und `sidebar-*`. Für Status **keine** rohen Hex-/Palettenfarben — Tokens nutzen (bewusst kategoriale Farben wie ASN-Typen als `*-600 dark:*-300`-Paare).
- **Theming:** `next-themes` (`attribute="class"`, Default `dark`) via `ThemeProvider` in `app/layout.tsx`; Umschalter `components/mode-toggle.tsx`. `<html>` trägt `suppressHydrationWarning`. `app/manifest.ts`/`viewport.themeColor` spiegeln die Token-Hintergründe.
- **Shell:** `ToolPageShell` rendert Desktop-Sidebar (`components/shell/app-sidebar.tsx`) + Mobile-Sheet (`mobile-nav.tsx`); Navigation/Labels aus `components/shell/nav-config.ts`.
- **Fonts:** Geist Sans/Mono **self-hosted** über das `geist`-Paket (kein Google-Fonts-Fetch beim Build).
- **Icons:** Lucide React. **Toasts:** `sonner` (`<Toaster>` im Layout).
- **Wiederverwendbar:** `ToolSearchForm`, `ResultPanel`, `ErrorPanel`, `EmptyState`, `components/asn/show-more-button.tsx`.
- **Command-Palette (⌘K / Strg+K, auch `/`):** Spotlight-artige Suche/Destination-Bar. `components/shell/command-menu.tsx` (Provider + Kontext + Trigger, in `ToolPageShell` montiert), `components/shell/command-palette.tsx` (Dialog-UI auf dem Radix-Dialog-Primitiv); Query-Klassifizierung + Deep-Link-Aktionen rein und getestet in `lib/command.ts`. Tippt der Nutzer eine IP/Domain/ASN, schlägt die Palette Deep-Links in die passenden Tools vor (gleiche Query-Parameter wie unter „Routen").
- **`Frontend-Skill.md`:** externes kreatives Design-Skill — nicht mit Projekt-Konventionen verwechseln; die Tool-UI folgt dem shadcn-Design-System.

---

## Tests

- **Runner:** Vitest 3, `environment: "node"` (`vitest.config.ts`)
- **Konvention:** `*.test.ts` neben Quellcode

| Bereich | Testdateien |
|---------|-------------|
| SSRF/Ziele | `lib/network/target.test.ts` |
| API-Helfer | `lib/api/response.test.ts`, `rate-limit.test.ts` |
| Verbindungstyp/Proxy | `lib/connection-type.test.ts` |
| DNS-Formatierung | `lib/dns-records.test.ts` |
| WHOIS-Parsing | `lib/whois.test.ts` |
| ASN-Normalisierung | `lib/asn.test.ts`, `app/api/asn/[asn]/route.test.ts` |
| Reputation | `lib/reputation.test.ts` |
| Client-IP | `lib/client-ip-discovery.test.ts` |
| DB-Probes | `lib/network/database-probes.test.ts` |
| Command-Palette (Query-Klassifizierung/Deep-Links) | `lib/command.test.ts` |
| Routes | `app/api/ping/route.test.ts`, `app/api/cdn/route.test.ts` |

**Nicht vorhanden:** Komponenten-E2E, jsdom, Integrationstests für `/api/ip`, `/api/dns`, `/api/whois`.

Bei Sicherheitsänderungen: Tests in `target.test.ts` erweitern oder Route-Tests mit blockierten Zielen (`localhost`, private IPs).

---

## Umgebungsvariablen

| Variable | Wirkung |
|----------|---------|
| `IPINFO_TOKEN` | Optional: aktiviert IPinfo-ASN-Daten auf `/api/asn` |
| `ABUSEIPDB_API_KEY` | Optional: aktiviert AbuseIPDB-Meldungen auf `/api/reputation` |
| `PUBLIC_ALLOWED_PING_PORTS` | Optional: erlaubte Ports für Ping (kommagetrennt) |
| `NODE_ENV` | Production im Docker-Runner |
| `PORT` | Default `3000` im Dockerfile |

Keine API-Keys im Repo. Keine `.env` committen.

---

## Deployment

- **Nicht statisch** — API-Routes brauchen Node (Vercel, Railway, Render, Fly, Docker/VPS).
- `Dockerfile`: Multi-Stage, Node 20 Alpine, `pnpm start`
- `nixpacks.toml`: Node 20 + pnpm
- `next.config.mjs`: `images.unoptimized: true`

---

## Externe Dienste

| Dienst | Verwendung |
|--------|------------|
| ip-api.com | IP-Metadaten (gemeinsamer Client: `lib/providers/ip-api.ts`) |
| ipinfo.io | Optionale ASN-Daten (`IPINFO_TOKEN`) |
| stat.ripe.net | ASN-Holder, Prefixe, RIS-Routing-Nachbarn |
| peeringdb.com | ASN-Netzwerkprofile, IX-Präsenz, Standorte |
| api64.ipify.org | Client-seitige IPv6-Erkennung |
| checkip.amazonaws.com | Fallback Client-IP |
| whois.iana.org:43 | WHOIS mit RDAP-Fallback (`rdap.org`) |
| Node `dns` / `net` | DNS (inkl. PTR/SOA/CAA), TCP/UDP, DB-Probes |
| zen.spamhaus.org, bl.spamcop.net, b.barracudacentral.org | DNSBLs für IP-Reputation |
| api.abuseipdb.com | Abuse-Confidence-Score und Meldungen (optional) |

Upstream-Ausfälle: graceful degradation (z. B. leere Felder bei IP-API; CDN `reachable: false`; ASN-Provider-Cache mit Stale-Fallback).

---

## Häufige Aufgaben → Dateien

| Aufgabe | Zuerst lesen |
|---------|----------------|
| Neue API-Route | `app/api/dns/route.ts` oder `app/api/ping/route.ts`, `lib/network/target.ts`, `lib/api/response.ts` |
| SSRF / neue Zieltypen | `lib/network/target.ts`, `lib/network/target.test.ts` |
| Neues Tool in Navigation | `components/shell/nav-config.ts`, `app/sitemap.ts` |
| Neuer Checker | `hooks/use-tool-lookup.ts`, `components/dns-checker.tsx` als Vorlage |
| IP-Anzeige erweitern | `components/ip-display.tsx`, `app/api/ip/route.ts`, `lib/connection-type.ts` |
| ASN-UI ändern | `components/asn/` (Sektions-Komponenten) |
| Übersetzungen | `lib/i18n.ts`, `lib/tool-i18n.ts` |
| Fehlertexte | `getApiErrorMessage` in `lib/tool-i18n.ts` |
| Metadaten / SEO | `lib/seo.ts`, bestehende `app/*/page.tsx` |

---

## Anti-Patterns (nicht tun)

1. User-Targets ohne `assertPublicTarget` / `assertPublicUrl` ansprechen.
2. Neue öffentliche Endpoints ohne `enforceRateLimit`.
3. Credentials in URLs oder Lookup-Strings zulassen.
4. API-Responses cachen (`no-store` beibehalten).
5. Client-seitig auf englische Server-Message-Strings matchen — immer `ApiClientError.code` verwenden.
6. Übersetzte Texte oder Locale-abhängige Daten aus API-Routes liefern (Codes/leere Strings zurückgeben, UI übersetzt).
7. Locale-Routing (`/de/ping`) einführen ohne Architektur-Entscheidung.
8. DB-Auth außer Redis in Ping-Probes.
9. TypeScript-Fehler ignorieren oder Build-Checks umgehen.
10. Große Response-Bodies von User-Zielen ohne bestehende Limits.
11. Status-/Akzentfarben hartkodieren (rohe Hex- oder Tailwind-Palettenwerte) statt der semantischen Tokens — bricht den Light-Mode; Tokens (`success`, `warning`, `info`, `destructive`, ...) verwenden.
12. `next/font/google` verwenden (bricht Offline-Builds) — Fonts kommen aus dem `geist`-Paket.

---

## Scope & Commits

- **Minimale Diffs:** Nur angeforderte Änderungen; keine Drive-by-Refactors.
- **Commits:** Nur auf ausdrückliche Anfrage; keine Secrets committen.
- **Sprache:** Nutzer-Kommunikation oft Deutsch; Code und Identifiers auf Englisch (bestehende Konvention).

---

## Verwandte Dokumentation

- `README.md` — Features, Safety Model, Tech Stack
- `design-principles.md` — Design-System: Tokens, Farb-/Theming-Regeln, Komponenten- und State-Muster
- `Frontend-Skill.md` — optionales kreatives UI-Skill (nicht Projektstandard für Tools)
