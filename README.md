# IP Info

A small Next.js web application that displays IP and network information for the current visitor, and also lets you look up any public IP address or domain.

## Features

- Detects and shows your current **IPv4** and (when available) **IPv6**.
- Displays geolocation/network metadata such as country, region, city, ISP, AS, and timezone.
- Provides a heuristic connection-type label (for example fiber, DSL, cable, mobile, hosting/VPN).
- Includes a dedicated lookup page at `/check` for searching custom IPs or domains.
- Includes an extensive reputation checker for IPs/domains (DNSBL, RDAP age, TLS, SPF/DMARC, PTR, and proxy/hosting heuristics).
- Includes a network testing page at `/ping` for TCP, UDP, EB endpoints, and database checks (including optional Redis auth checks).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react
- **Analytics:** `@vercel/analytics`
- **Data sources:**
  - `ip-api.com` (server-side IP metadata)
  - `api64.ipify.org` (client-side IPv6 detection)

## Is this a static site?

Short answer: **No, this is not purely static.**

Why:

- The API route `app/api/ip/route.ts` reads runtime request headers (`x-forwarded-for`, `x-real-ip`) and fetches external data.
- That route uses `fetch(..., { cache: "no-store" })` for live lookups.
- The frontend calls `fetch("/api/ip")` at runtime and renders dynamic results.

So this repository is a **dynamic Next.js application** with both client and server logic.

## Hosting requirements

**Current architecture:** requires a **Node/Next.js runtime** (or serverless functions).

- **Not enough:** pure static hosting only (HTML/CSS/JS with no server runtime).
- **Works well:** Vercel, Railway, Render, Fly.io, or Docker/VPS using `pnpm build && pnpm start`.

Reason: `app/api/ip/route.ts` is executed server-side and is required by the frontend.

### If you must deploy statically

You would need to redesign the app and remove/replace `app/api/ip/route.ts` (for example by calling an external API directly from the browser and handling CORS/rate limits). That is an architectural change and not the current state of this project.

## Project structure (excerpt)

- `app/page.tsx` — Home page (shows your own IP)
- `app/check/page.tsx` — Lookup page for external IP/domain
- `app/api/ip/route.ts` — Server API for IP lookup and normalization
- `components/ip-display.tsx` — IP and metadata presentation UI
- `components/ip-lookup.tsx` — Manual lookup input form

## Local development

### Requirements

- Node.js 20+
- pnpm

### Install and run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Production build

```bash
pnpm build
pnpm start
```

## Notes

- Geolocation and ISP accuracy depends on the upstream provider (`ip-api.com`).
- If IPv6 is not available for the client network, the UI will show that accordingly.
