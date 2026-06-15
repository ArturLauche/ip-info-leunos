# IP Auskunft

IP Auskunft is a public-site-safe Next.js network toolbox for inspecting public IP metadata and running bounded checks against public internet targets.

## Features

- Show the visitor's public IPv4/IPv6 metadata, detected connection type, and reverse DNS.
- Look up a public IP address or public domain at `/check`.
- Look up ASN profiles at `/asn` and `/asn/AS8881`, combining optional IPinfo ASN data, public RIPEstat routing data, and public PeeringDB peering data.
- Query DNS records (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) at `/dns`, including reverse (PTR) lookups for IP addresses.
- Query WHOIS/RDAP data at `/whois`.
- Detect common CDN and edge-provider signals at `/cdn`.
- Run guarded TCP, UDP, endpoint, and database reachability checks at `/ping`.
- Check IP reputation against DNS blacklists, proxy/hosting heuristics, and optional AbuseIPDB reports at `/reputation`.
- Jump between tools or deep-link a typed IP, domain, or ASN into the right tool from a Spotlight-style command palette (⌘K / Ctrl+K, or `/`).

## Public-Site Safety Model

The API routes are designed for public deployment. They validate inputs with `zod`, rate-limit requests in memory, enforce timeouts, and block targets that resolve to private, loopback, link-local, multicast, reserved, documentation, and cloud-metadata address ranges.

Blocked examples include:

- `localhost`, `*.local`, and other internal-looking hostnames
- `127.0.0.0/8`
- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`
- `169.254.169.254`
- `::1`, `fc00::/7`, and `fe80::/10`

Set `PUBLIC_ALLOWED_PING_PORTS` to a comma-separated list such as `80,443,5432` if a deployment should restrict the ping tool to specific ports.

Set `IPINFO_TOKEN` to enable IPinfo ASN details on `/asn`. Without a token, ASN lookups still use public PeeringDB data when available.

Set `ABUSEIPDB_API_KEY` to enable AbuseIPDB abuse reports on `/reputation`. Without the key, the reputation tool still uses DNS blacklists and ip-api.com data.

Set `PRIVACY_CONTACT_EMAIL` to the controller's contact address shown on the privacy page (`/privacy-policy`). No address is hardcoded in the repository; when the variable is unset the page renders a neutral "not configured" note instead of an email.

## Datenschutz / GDPR

The app ships a bilingual (German/English) privacy policy at `/privacy-policy`, linked from the footer on every page. It documents the processing of IP addresses, the in-memory rate limiting, the external services that requests are forwarded to (including third-country transfers), the functional theme storage, and data-subject rights under the GDPR. The app sets no tracking cookies, runs no analytics, and stores no persistent request logs of its own.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4 with a token-based design system (light/dark via `next-themes`)
- shadcn/ui components on Radix primitives, Lucide icons, `sonner` toasts
- zod for request validation
- Vitest for focused unit tests

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The build does not ignore TypeScript errors, and fonts are self-hosted via the `geist` package, so production builds work without network access.

## Deployment

This app is not purely static because the tools use server-side API routes. Deploy it to a Node-capable target such as Vercel, Railway, Render, Fly.io, or Docker/VPS.

## External Providers

- `ip-api.com` for IP metadata
- `ipinfo.io` ASN API for optional ASN identity, prefix, RPKI, peer, upstream, and downstream data when `IPINFO_TOKEN` is configured
- `stat.ripe.net` public API for free ASN holder, announced prefix, and RIS routing-neighbour data
- `peeringdb.com` public API for ASN network profiles, IX presence, facilities, and peering policy data
- `api64.ipify.org` for primary client-side IPv6 discovery
- `checkip.amazonaws.com` as a client-side IP discovery fallback
- `rdap.org` as WHOIS fallback
- `zen.spamhaus.org`, `bl.spamcop.net`, and `b.barracudacentral.org` DNSBLs for IP reputation
- `api.abuseipdb.com` for abuse confidence scores and report counts (optional key)

PeeringDB data is public and user-maintained, so it may be incomplete when a network does not maintain a PeeringDB profile. IPinfo ASN details may require an appropriate IPinfo plan for the configured token.
PeeringDB describes network peering policy and presence; BGP-style routing neighbours are sourced from RIPEstat RIS data and may be directional observations rather than contractual peer/upstream/customer records.

## License

MIT — see `LICENSE.txt`.
