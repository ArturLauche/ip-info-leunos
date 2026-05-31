# IP Auskunft

IP Auskunft is a public-site-safe Next.js network toolbox for inspecting public IP metadata and running bounded checks against public internet targets.

## Features

- Show the visitor's public IPv4/IPv6 metadata.
- Look up a public IP address or public domain at `/check`.
- Look up ASN profiles at `/asn` and `/asn/AS8881`, combining optional IPinfo ASN data, public RIPEstat routing data, and public PeeringDB peering data.
- Query DNS records at `/dns`.
- Query WHOIS/RDAP data at `/whois`.
- Detect common CDN and edge-provider signals at `/cdn`.
- Run guarded TCP, UDP, endpoint, and database reachability checks at `/ping`.

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

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
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

The build no longer ignores TypeScript errors.

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

PeeringDB data is public and user-maintained, so it may be incomplete when a network does not maintain a PeeringDB profile. IPinfo ASN details may require an appropriate IPinfo plan for the configured token.
PeeringDB describes network peering policy and presence; BGP-style routing neighbours are sourced from RIPEstat RIS data and may be directional observations rather than contractual peer/upstream/customer records.

## License

No explicit license file is included. Add a `LICENSE` before public redistribution.
