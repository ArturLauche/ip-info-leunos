# AGENTS.md — ip-info-leunos

Public-site-safe Next.js network toolbox for inspecting public IP/ASN/DNS/WHOIS/CDN/reputation data and running bounded checks against public internet targets only.

## Stack

- Package manager: **pnpm 10** (`pnpm-lock.yaml`, lockfile v9). Node: **20** (`Dockerfile: node:20-alpine`, CI: `setup-node node-version: 20`).
- `next 16.3.4`, `react 19.2.8`, `react-dom 19.2.8`, `typescript 5.9.3`
- `tailwindcss ^4.3.3` + `@tailwindcss/postcss ^4.3.3`, `zod ^3.24.1`, `vitest ^3.2.7`
- `eslint ^9.39.5` + `eslint-config-next 16.3.4`, `next-themes ^0.4.6`, `geist ^1.5.1`, `lucide-react ^1.39.0`, `sonner ^2.0.8`
- Import alias: `@/*` → repo root (`tsconfig.json` paths). Build is offline-safe (self-hosted Geist, no `next/font/google`).

## Commands (run from repo root)

```bash
pnpm install --frozen-lockfile  # CI install; local: pnpm install
pnpm dev                        # next dev → http://localhost:3000
pnpm lint                       # eslint .
pnpm typecheck                  # next typegen && tsc --noEmit
pnpm test                       # vitest run (node env, **/*.test.ts)
pnpm build                      # next build && node scripts/strip-client-maps.mjs
pnpm start                      # next start (PORT=3000)
```

CI (`.github/workflows/ci.yml`, on PR + push to `main`): install → lint → typecheck → test → build → fail if any `.map` remains under `.next/static`.

## Setup & test

1. `pnpm install --frozen-lockfile`, then `pnpm dev`.
2. No `.env` required to run; optional keys only enable extra providers: `IPINFO_TOKEN`, `ABUSEIPDB_API_KEY`, `GREYNOISE_API_KEY`, `HTTPBL_ACCESS_KEY`, `THREATFOX_AUTH_KEY`, `PUBLIC_ALLOWED_PING_PORTS=80,443,…`, `PRIVACY_CONTACT_EMAIL`, `PRIVACY_CONTROLLER_NAME`.
3. Before pushing: `pnpm lint && pnpm typecheck && pnpm test` (same order as CI). `pnpm build` does not ignore TS errors.
4. Tests are unit-only (`vitest.config.ts`: `environment: "node"`); colocate as `*.test.ts` next to the module (e.g. `lib/network/target.test.ts`, `app/api/ping/route.test.ts`).

## Code style (follow this pattern)

All API routes guard in this order — rate-limit → zod `safeParse` → public-target assert → `apiOk`/`apiError` (real code from `app/api/dns/route.ts:9-137`):

```ts
export const runtime = "nodejs";

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "dns", { limit: 40, windowMs: 60_000 });
  if (limited) return limited;

  const parsedQuery = dnsQuerySchema.safeParse({ target: searchParams.get("target") });
  if (!parsedQuery.success) return apiValidationError(parsedQuery.error);

  try {
    const target = await assertPublicTarget(parsedQuery.data.target);
    hostname = target.hostname;
  } catch (error) {
    if (error instanceof TargetValidationError) {
      return apiError(error.code, error.message, error.status, error.details);
    }
    return apiError("invalid_target", "Please provide a valid public domain or IP.", 400);
  }
  return apiOk(payload);
}
```

Related conventions (repo-specific, not generic):

- Response envelope is always `{ ok: true, data }` / `{ ok: false, error: { code, message, details? } }` (`lib/api/response.ts`); default header `cache-control: no-store`.
- Client maps errors by `ApiClientError.code` via `getApiErrorMessage()` (`lib/tool-i18n.ts`) — never match English message strings.
- Checkers are `"use client"` + `useToolLookup<T>({ buildApiUrl, buildHref, mapError, initialQuery })` (`hooks/use-tool-lookup.ts`); API returns codes/empty strings, UI translates (`lib/i18n.ts`, `lib/tool-i18n.ts`).
- Styling via shadcn/Radix in `components/ui/` + `cn()` (`lib/utils.ts`) and semantic tokens in `app/globals.css` (`:root` / `.dark`); no hardcoded hex for status colors.

## Structure

```text
app/                  pages (Server Components) + API routes (/api/ip, /api/asn/[asn], /api/dns, /api/whois, /api/cdn, /api/ping POST, /api/reputation, /api/flag/[code])
app/<tool>/page.tsx   headers() → resolveLocale() → createPageMetadata() → ToolPageShell + Checker
components/           *-checker.tsx, shell/ (sidebar/nav/command-palette), ui/ (shadcn), asn/
hooks/use-tool-lookup.ts  shared checker state machine (loading/error/result, URL sync, stale-guard)
lib/                  api/ (response, rate-limit, client), network/ (target SSRF-guard, database-probes), reputation/, providers/ip-api.ts, cdn-detection.ts, connection-type.ts, dns-records.ts, whois.ts, asn.ts, command.ts, seo.ts, i18n.ts, tool-i18n.ts
scripts/              strip-client-maps.mjs (runs in build), generate-icons.mjs
```

Entry points for common tasks: new route → `app/api/dns/route.ts` + `lib/network/target.ts`; new checker → `components/dns-checker.tsx`; nav → `components/shell/nav-config.ts`; SEO → `lib/seo.ts` + `app/sitemap.ts`.

## Git & PR workflow

- Branch: `main` is deployable. Create `fix/<slug>`, `feat/<slug>`, `chore/<slug>`, or `polish/<slug>` from `main`.
- Commits use prefix style seen in history: `fix(scope): …`, `feat(scope): …`, `chore(deps): …` (e.g. `fix(dns,ip-display): …`).
- Open PR to `main`; CI must pass (lint, typecheck, test, build, no client maps). Keep diffs minimal, no drive-by refactors.
- Commit + push only when asked.

## Boundaries

Always do:

- Route every user-supplied host/IP/URL through `assertPublicTarget` / `assertPublicUrl` / `fetchPublicUrl` (`lib/network/target.ts`) and start every public route with `enforceRateLimit`.
- Validate all inputs with zod `safeParse` → `apiValidationError`; return `apiError` with the existing `ApiErrorCode` set.
- Keep `cache-control: no-store` on API responses and `export const runtime = "nodejs"` on Node-socket routes.

Ask first:

- Adding dependencies, env vars, external providers, or new public endpoints/tools.
- Changing rate limits, SSRF blocklists, timeouts, redirect/size caps, or caching behavior.
- Touching `Dockerfile`, `nixpacks.toml`, `next.config.mjs`, security headers, or SEO/robots/sitemap behavior.

Never do:

- Commit secrets, tokens, or `.env` files (keys stay in env only; no key is hardcoded).
- Bypass target validation, rate limiting, or zod validation for network input; allow credentials in URLs.
- Edit generated output: `.next/`, `node_modules/`, `tsconfig.tsbuildinfo`, `next-env.d.ts`, `*.map`.
- Translate in API routes, match on English error messages client-side, add `/de/...` locale routes, use `next/font/google`, or hardcode status colors instead of tokens.
