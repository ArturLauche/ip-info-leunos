# IP Auskunft

IP Auskunft is a public-site-safe Next.js network toolbox for inspecting public IP metadata and running bounded checks against public internet targets.

## Features

- Show the visitor's public IPv4/IPv6 metadata.
- Look up a public IP address or public domain at `/check`.
- Query DNS records at `/dns`.
- Query WHOIS/RDAP data at `/whois`.
- Detect common CDN and edge-provider signals at `/cdn`.
- Run guarded TCP, UDP, endpoint, and database reachability checks at `/ping`.
- Inspect ASN profiles with routing, peering, and IX data at `/asn`.
- Inspect DNS resolvers configured for the app runtime at `/client-dns`.

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

## Runtime DNS Resolver Scan

`/client-dns` is a server-runtime DNS resolver scan. It reports DNS resolvers configured for the Next.js runtime via `node:dns.getServers()`.

Important limitations:

- In production, the result normally describes the hosting platform, container, VM, or server runtime.
- It does not describe the visitor's browser DNS configuration, Secure DNS/DoH settings, VPN DNS, proxy DNS, router upstreams, or transparent DNS interception.
- It is not comparable to dnsleaktest.com. A browser DNS leak test requires dedicated authoritative DNS infrastructure and unique test hostnames so the service can observe which recursive resolvers actually request those names.

The API response marks this explicitly with `scope: "server-runtime"`, `method: "node-dns-getservers"`, `accuracy: "runtime-configuration"`, and `leakTestComparable: false`.

Resolver privacy scoring is intentionally conservative. Known public resolvers can receive a privacy score based on the built-in provider profile. Private, loopback, link-local, invalid, or unknown public resolvers are reported with `privacy: "unknown"`, and the overall `privacyScore` is `null` instead of guessing.

## ASN Lookup

`/asn` combines data from multiple public sources:

- **RIPEstat** for ASN identity, routing status, announced prefixes, RPKI validation, and neighbor classification (upstreams, peers, downstreams).
- **PeeringDB** for peering policy, traffic levels, Internet Exchange presence, and facility presence.
- **IPinfo** (optional) for enrichment when `IPINFO_TOKEN` is set.

PeeringDB data is public and may be incomplete depending on whether the network maintains a PeeringDB profile.

IPinfo ASN details may require an appropriate IPinfo plan. Set `IPINFO_TOKEN` to enable this source.

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
- `api64.ipify.org` for primary client-side IPv6 discovery
- `checkip.amazonaws.com` as a client-side IP discovery fallback
- `rdap.org` as WHOIS fallback

## License

No explicit license file is included. Add a `LICENSE` before public redistribution.
