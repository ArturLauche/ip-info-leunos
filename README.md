# IP Auskunft – IP, DNS, Whois, CDN, and Network Checks with Next.js

IP Auskunft is a modern Next.js application that helps users inspect their own public IP address and run additional network tools (IP/domain lookup, DNS lookups, Whois queries, CDN detection, ping/port tests, and a client DNS privacy scan) from one unified interface.

## Why this project?

Many “What is my IP?” websites only display an IP number. This project goes further:

- **Context, not just raw data:** country, region, ASN, ISP, timezone, and connection type.
- **Multiple tools in one app:** diagnostics and lookups without switching services.
- **Performance and SEO focus:** structured metadata, Open Graph, sitemap, robots, and JSON-LD.

## Features

### Core tools

- **Show your own IP** (IPv4 and, when available, IPv6).
- **IP/Domain lookup** at `/check`.
- **DNS lookup** at `/dns` (multiple record types).
- **Whois lookup** at `/whois`.
- **CDN detection** at `/cdn`.
- **Ping/network checks** at `/ping`.
- **Client DNS & privacy scan** at `/client-dns`.

### SEO enhancements

- Central **SEO configuration** in `lib/seo.ts`.
- **Metadata base**, canonical URLs, keywords, and robots directives.
- Route-level metadata for major tool pages.
- **Open Graph** and **Twitter Card** defaults.
- **JSON-LD WebSite schema** in the root layout.
- Dynamic **`/sitemap.xml`**, **`/robots.txt`**, and **`/manifest.webmanifest`** using the App Router.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Runtime/UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Monitoring:** `@vercel/analytics`, `@vercel/speed-insights`
- **External data providers:**
  - `ip-api.com` (IP and network metadata)
  - `api64.ipify.org` (IPv6 detection)

## Project structure (excerpt)

```text
app/
  layout.tsx              # global layout + global SEO metadata + JSON-LD
  page.tsx                # homepage (your own IP)
  check/page.tsx          # IP/domain lookup
  ping/page.tsx           # ping/network checks
  dns/page.tsx            # DNS tool
  whois/page.tsx          # Whois tool
  cdn/page.tsx            # CDN checker
  client-dns/page.tsx     # client DNS & privacy tool
  sitemap.ts              # generates /sitemap.xml
  robots.ts               # generates /robots.txt
  manifest.ts             # generates /manifest.webmanifest
lib/
  seo.ts                  # SEO config + metadata factory
```

## Requirements

- **Node.js 20+**
- **pnpm**

## Local development

```bash
pnpm install
pnpm dev
```

Then open:

- `http://localhost:3000`

## Production build

```bash
pnpm build
pnpm start
```

## Quality checks

```bash
pnpm lint
```

## Deployment notes

This app is **not purely static**, because it relies on server-side API routes and runtime data.

Recommended targets:

- Vercel
- Railway
- Render
- Fly.io
- Docker/VPS (with `pnpm build && pnpm start`)

## Data accuracy & privacy

- Geolocation/provider details depend on external data sources and may vary.
- IPv6 is shown only if the client network supports IPv6.
- For production, add your own privacy policy if analytics are enabled.

## License

There is currently no explicit license file in this repository. If you plan to distribute this project publicly, add an appropriate `LICENSE`.
