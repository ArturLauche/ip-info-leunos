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
pnpm build
```

Paketmanager: **pnpm**. Import-Alias: `@/*` → Projektroot (`tsconfig.json`).

---

## Was dieses Repo ist (und was nicht)

| Ja | Nein |
|----|------|
| Server-seitige API-Routes mit Zod, Rate-Limits, Timeouts | Statischer Export (`next export`) |
| Öffentliche IPs/Domains/URLs als Ziele | Scans gegen private/ interne Netze |
| AS-Nummer/-Name als **Feld** im IP-Lookup (`ip-api.com`) | Eigenständiges ASN-Lookup-Tool (`/asn` wurde entfernt) |
| Dark-first UI mit handgeschriebenem Tailwind in Feature-Komponenten | shadcn-Komponenten in Tool-UI (Scaffold liegt ungenutzt in `components/ui/`) |
| Locale über `Accept-Language` (Server) | Locale-Prefix-Routen (`/de/...`) |

Vor netzwerkbezogenen Änderungen: **`README.md` (Safety Model)** und **`lib/network/target.ts`** lesen.

---

## Architektur (Überblick)

```
app/                    Seiten (Server Components) + API-Routes
components/             Feature-UI: Checker, Shells, Panels
  ui/                   shadcn/Radix-Scaffold (nicht in Tools verwendet)
lib/
  api/                  response.ts, rate-limit.ts, client.ts
  network/              target.ts (SSRF-Schutz), database-probes.ts
  i18n.ts, tool-i18n.ts, seo.ts, client-ip-discovery.ts, utils.ts
hooks/                  shadcn-Helfer (Toast, Mobile) — wenig in Features
public/                 Icons, Verifikation
app/globals.css         Aktives Theme (Tailwind 4, OKLCH, dark-first)
styles/globals.css      Ungenutzt — nicht bearbeiten/verwechseln
```

**Seitenmuster** (alle Tool-Seiten außer `/`):

1. `headers()` → `resolveLocale(accept-language)`
2. `createPageMetadata({ title, description, path, keywords })`
3. `ToolPageShell` mit `locale`, `active`, Icon, Titel/Untertitel
4. Client-Checker als Kind

**Checker-Muster** (`"use client"`):

- API über `fetch` + `unwrapApiResponse()` aus `lib/api/client.ts`
- Fehler → `ErrorPanel` oder lokaler `error`-State
- Deep-Links: `router.replace('/tool?target=...', { scroll: false })`

---

## Routen

### Seiten

| Pfad | Komponente | Query-Parameter |
|------|------------|-----------------|
| `/` | `IpDisplay` | — (eigene IP aus Headers) |
| `/check` | `IpLookup` → `IpDisplay` | `ip`, `q` |
| `/ping` | `PingChecker` | `target`, `port`, `mode` |
| `/dns` | `DnsChecker` | `target` |
| `/whois` | `WhoisChecker` | `target` |
| `/cdn` | `CdnChecker` | `target` |
| `/reputation` | `ReputationChecker` | `ip` |

Navigation und `ToolKey`: `components/tool-page-shell.tsx` — `home | check | asn | ping | dns | whois | cdn | reputation` (`reputation` als kompakter Utility-Link).

### API

| Route | Methode | Rate-Limit | Runtime |
|-------|---------|------------|---------|
| `/api/ip` | GET | 80/min | Node (implizit) |
| `/api/dns` | GET | 40/min | `nodejs` |
| `/api/whois` | GET | 20/min | `nodejs` |
| `/api/cdn` | GET | 20/min | Node |
| `/api/ping` | POST (JSON) | 20/min | `nodejs` |
| `/api/reputation` | GET | 20/min | `nodejs` |

Jede Route beginnt mit `enforceRateLimit(request, routeKey, { limit, windowMs })` aus `lib/api/rate-limit.ts`.

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
- Client-IP aus `x-forwarded-for` / `x-real-ip` / Fallback
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

Client: `unwrapApiResponse<T>()` wirft bei `ok: false`.

**Fehlercodes:** `bad_request`, `invalid_target`, `target_blocked`, `rate_limited`, `upstream_error`, `timeout`, `network_error`.

---

## Neues Tool hinzufügen (Checkliste)

1. **Sicherheit:** Route nutzt `assertPublicTarget` / `assertPublicUrl` / `fetchPublicUrl` — nie rohes `fetch()` oder `socket.connect()` auf User-Input.
2. **API:** `enforceRateLimit` + zod-Schema + `apiOk`/`apiError`; bei Node-Sockets: `export const runtime = "nodejs"`.
3. **Seite:** `app/<tool>/page.tsx` mit Metadata + `ToolPageShell`.
4. **Checker:** `components/<tool>-checker.tsx` (`"use client"`), Styling wie bestehende Checker (eigene Tailwind-Klassen, kein shadcn `Button`/`Input`).
5. **Navigation:** `ToolKey` und Links in `tool-page-shell.tsx` erweitern.
6. **i18n:** Strings in `lib/tool-i18n.ts` (Englisch-Basis; `de` als Merge; andere Locales → Englisch-Fallback).
7. **SEO:** `createPageMetadata` + Eintrag in `app/sitemap.ts`.
8. **Tests:** Vitest für Logik/Sicherheit (`*.test.ts` neben Modul oder unter `app/api/...`).

---

## Internationalisierung

| Datei | Inhalt |
|-------|--------|
| `lib/i18n.ts` | Home/Check/IP-Display; `SUPPORTED_LOCALES`, `resolveLocale()`, `getTranslation()` |
| `lib/tool-i18n.ts` | Ping, DNS, WHOIS, CDN; `getToolTranslation()` |

- Server: Locale aus `Accept-Language` (Aliase wie `de-de` → `de`, Default `en`).
- Client-Checker erhalten `locale` als Prop — **kein** React Context, **kein** next-intl.
- `<html lang="de">` in `app/layout.tsx` ist fest (unabhängig von Accept-Language).

Neue UI-Strings: beide Dateien konsistent pflegen; Deutsch in `tool-i18n` per Spread über Englisch (`de: { ...en, ...de }`).

---

## SEO

- `lib/seo.ts`: `siteConfig`, `createPageMetadata()`
- `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`
- JSON-LD `WebSite` in `app/layout.tsx` (`inLanguage: de-DE`)

Bei neuen Seiten: canonical URL, OpenGraph, Keywords an bestehende Seiten anlehnen.

---

## Frontend & Styling

- **Aktives CSS:** `app/globals.css` (Tailwind 4, `@import 'tailwindcss'`, OKLCH, `.app-shell`, `.surface-panel`)
- **Fonts:** Geist Sans/Mono via `next/font` in `layout.tsx`
- **Icons:** Lucide React
- **Semantik:** `text-foreground`, `bg-card`, `border-border`, `text-primary`, Erfolg oft `emerald-*`
- **`components/ui/`:** Vollständiger shadcn-Scaffold — Feature-UI importiert diese **nicht**. `theme-provider.tsx` ist nicht in `layout.tsx` eingebunden; App ist fest dark-themed.
- **`Frontend-Skill.md`:** Externes Design-Skill (kreatives UI) — nicht mit Projekt-Konventionen verwechseln; Tool-UI bleibt beim etablierten utilitarischen Look.

---

## Tests

- **Runner:** Vitest 3, `environment: "node"` (`vitest.config.ts`)
- **Konvention:** `*.test.ts` neben Quellcode

| Bereich | Testdateien |
|---------|-------------|
| SSRF/Ziele | `lib/network/target.test.ts` |
| API-Helfer | `lib/api/response.test.ts`, `rate-limit.test.ts` |
| Client-IP | `lib/client-ip-discovery.test.ts` |
| DB-Probes | `lib/network/database-probes.test.ts` |
| Routes | `app/api/ping/route.test.ts`, `app/api/cdn/route.test.ts` |

**Nicht vorhanden:** Komponenten-E2E, jsdom, Integrationstests für `/api/ip`, `/api/dns`, `/api/whois`.

Bei Sicherheitsänderungen: Tests in `target.test.ts` erweitern oder Route-Tests mit blockierten Zielen (`localhost`, private IPs).

---

## Umgebungsvariablen

| Variable | Wirkung |
|----------|---------|
| `PUBLIC_ALLOWED_PING_PORTS` | Optional: erlaubte Ports für Ping (kommagetrennt) |
| `ABUSEIPDB_API_KEY` | Optional: aktiviert AbuseIPDB-Meldungen auf `/api/reputation` |
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
| ip-api.com | IP-Metadaten (inkl. `as`, `asname`) |
| api64.ipify.org | Client-seitige IPv6-Erkennung |
| checkip.amazonaws.com | Fallback Client-IP |
| whois.iana.org:43 | WHOIS mit RDAP-Fallback (`rdap.org`) |
| Node `dns` / `net` | DNS, TCP/UDP, DB-Probes |
| zen.spamhaus.org, bl.spamcop.net, b.barracudacentral.org | DNSBLs für IP-Reputation |
| api.abuseipdb.com | Abuse-Confidence-Score und Meldungen (optional) |

Upstream-Ausfälle: graceful degradation (z. B. `getUnknownResult()` bei IP-API; CDN `reachable: false`).

---

## Häufige Aufgaben → Dateien

| Aufgabe | Zuerst lesen |
|---------|----------------|
| Neue API-Route | `app/api/dns/route.ts` oder `app/api/ping/route.ts`, `lib/network/target.ts`, `lib/api/response.ts` |
| SSRF / neue Zieltypen | `lib/network/target.ts`, `lib/network/target.test.ts` |
| Neues Tool in Navigation | `components/tool-page-shell.tsx`, `app/sitemap.ts` |
| IP-Anzeige erweitern | `components/ip-display.tsx`, `app/api/ip/route.ts` |
| Übersetzungen | `lib/i18n.ts`, `lib/tool-i18n.ts` |
| Metadaten / SEO | `lib/seo.ts`, bestehende `app/*/page.tsx` |

---

## Anti-Patterns (nicht tun)

1. User-Targets ohne `assertPublicTarget` / `assertPublicUrl` ansprechen.
2. Neue öffentliche Endpoints ohne `enforceRateLimit`.
3. Credentials in URLs oder Lookup-Strings zulassen.
4. API-Responses cachen (`no-store` beibehalten).
5. shadcn-Komponenten in Tool-Checker einbauen (visueller Bruch).
6. `styles/globals.css` statt `app/globals.css` bearbeiten.
7. Locale-Routing (`/de/ping`) einführen ohne Architektur-Entscheidung.
8. Eigenständiges `/asn`-Tool wiederherstellen ohne explizite Anforderung (AS bleibt Teil von `/check` und `/api/ip`).
9. DB-Auth außer Redis in Ping-Probes.
10. TypeScript-Fehler ignorieren oder Build-Checks umgehen.
11. Große Response-Bodies von User-Zielen ohne bestehende Limits.
12. `ThemeProvider` / Light-Theme aktivieren ohne abgestimmtes Redesign.

---

## Scope & Commits

- **Minimale Diffs:** Nur angeforderte Änderungen; keine Drive-by-Refactors.
- **Commits:** Nur auf ausdrückliche Anfrage; keine Secrets committen.
- **Sprache:** Nutzer-Kommunikation oft Deutsch; Code und Identifiers auf Englisch (bestehende Konvention).

---

## Verwandte Dokumentation

- `README.md` — Features, Safety Model, Tech Stack
- `Frontend-Skill.md` — optionales kreatives UI-Skill (nicht Projektstandard für Tools)
- `.cursor/rules/` — optional; projektspezifische Cursor-Regeln können ergänzend angelegt werden
