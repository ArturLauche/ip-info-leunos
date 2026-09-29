# Codebase audit and implementation plan

Baseline: `61ba4a9` (main), 2026-09-08. Overall assessment: **7/10**.

The application has a coherent purpose, good server/client separation, consistent
API envelopes, centralized target validation, bilingual tool copy, semantic theme
tokens, and meaningful provider normalization tests. Lint, typecheck, 290 tests
across 34 files, and the production build all passed before changes.

Roast: This toolbox checks every visitor at the door, then lets DNS pick a
different back entrance—and orders the same lookup twice for good measure.

## Findings

| Priority | Finding and evidence | Consequence | Planned treatment |
| --- | --- | --- | --- |
| P1 | `fetchPublicUrl` validates DNS, then calls `fetch` with the hostname; WHOIS similarly validates a server, then connects by hostname. | The connection can resolve to an address other than those validated, including on referrals/redirects. | Pin connections to validated addresses while preserving HTTP Host and TLS certificate/SNI checks. |
| P1 | HTTP size enforcement checks only `Content-Length`; its timer stops at response headers. | Missing/incorrect lengths and slow bodies evade the advertised limits. | Enforce existing byte and time budgets through body completion/cancellation. |
| P1 | `/check?q=1.1.1.1&q=8.8.8.8` renders the error boundary in Chromium. Page search parameters are typed only as strings. | A valid URL shape can crash a tool. | Normalize repeated query values consistently before they reach checkers. |
| P1 | One DNS submission issues two identical API requests, measured in the production browser. `run()` changes the URL; the resulting prop change calls `run()` again. | Wasted API quota, restarted loading, and unnecessary server work. ASN pathname changes can additionally remount the checker. | Make URL synchronization an explicit part of the request lifecycle; run pathname lookups only after navigation mounts the destination. |
| P2 | Client unwrapping passes through arbitrary JSON and can accept success envelopes on error HTTP statuses. IP and Ping duplicate response parsing. | Malformed responses reach rendering code or appear successful. | One strict envelope/HTTP reader used by every checker. |
| P2 | Search forms have no cancel action; IP lookup cannot rerun an unchanged target. | Recovery from slow or failed lookups is awkward. | Abortable searches, an explicit cancellation path, and repeat submission support. |
| P2 | Ping guesses whether a port was edited by checking if it matches any preset. Auth fields are serialized even when authentication is disabled. | Mode changes overwrite intentional values; inactive credentials unnecessarily leave the browser. | Track port ownership explicitly and omit inactive credentials. |
| P2 | DNS character-string chunks are joined with spaces. | Split TXT records can be displayed with bytes that were never in the record. | Concatenate TXT chunks and test split SPF/DKIM records. |
| P2 | Results expose raw data but lack consistent copy/download actions. WHOIS notes arrive as English prose. | Common diagnostic handoffs require manual selection; localization is incomplete. | Shared result actions, clipboard feedback, JSON downloads, and localized WHOIS note codes. |
| P2 | Command palette has no explicit input name or visible mobile close control; long result headings lack wrapping rules. | Weaker assistive navigation and mobile recovery. | Name the combobox, provide a close control, and fix long-content layout. |
| P2 | Page transitions clone the entire route even with reduced motion, then immediately discard the clone. Command palette logic is eagerly imported by the shell. | Avoidable DOM work and JavaScript for unused interactions. | Skip snapshots when motion is disabled and load the palette on demand; measure the effect. |

The threat scoring model already separates policy/network context from threat
evidence, preserves independent source states, and has useful regression tests.
The ASN aggregator already bounds parallel provider work and normalizes partial
data. Those behaviors should be preserved rather than rewritten for appearance.

## Implementation sequence

### 1. Outbound transport integrity

- Separate transport mechanics from target normalization and policy.
- Keep the current address blocklists, rate limits, timeouts, redirect counts,
  response size constants, and cache policies, except for the explicitly approved
  RDAP alignment described below.
- Use Node HTTP/HTTPS with a lookup function restricted to the validated address
  set. Keep normal hostname certificate verification and support IPv4/IPv6.
- Retain manual redirect validation and close discarded response bodies.
- Bound received bytes and body lifetime, propagate cancellation, and clean up
  sockets/listeners/timers on success, timeout, rejection, and cancellation.
- Pin WHOIS referral sockets to validated IPs.
- Test rebinding attempts, mixed public/private answers, redirects, absent and
  excessive content lengths, slow bodies, cancellation, and TLS request options.

Acceptance: no second unrestricted DNS lookup between validation and connection;
existing limits remain numerically identical except for the approved RDAP caps;
normal CDN and endpoint checks work.

### 2. Lookup state, input, and response contracts

- Share strict response parsing across GET tools, IP display, and Ping.
- Distinguish self-submitted URL updates from external navigation; suppress only
  the former and preserve deep links, clearing, reloads, and history navigation.
- Invalidate superseded responses even when a transport ignores cancellation.
- Normalize array-valued page query parameters before rendering.
- Allow repeat IP submissions and cancellation of pending searches.
- Respect explicit Ping ports and exclude inactive auth fields from requests.

Acceptance: one API request per submission; a late response cannot replace the
current result; repeated parameters never crash a checker; disabled credentials
are absent from the request body.

### 3. Useful result actions and UI polish

- Extract the existing clipboard interaction into a shared component.
- Add copy and JSON download actions to DNS and WHOIS, using the currently shown
  data/filter and existing localized feedback.
- Correct TXT chunk rendering and localize WHOIS fallback/referral notes.
- Add named, keyboard-accessible disclosures and palette close controls.
- Verify mobile/desktop, dark/light, long values, errors, loading, empty states,
  keyboard selection, and cancellation in Chromium.

Acceptance: copied/downloaded data matches the visible result; long content fits
at 390px and 320px; primary actions and palette remain keyboard accessible.

### 4. Performance and release evidence

- First remove confirmed duplicate network work.
- Defer the palette module until requested without losing shortcuts or focus.
- Avoid creating transition snapshots when reduced motion is enabled.
- Measure request counts and JavaScript transfer/module changes on production
  builds. Do not equate development timings or mocked upstream latency with
  production performance.
- Add reproducible browser regression coverage using tooling installed outside
  the project; keep unit tests in Vitest's existing Node environment.
- Run frozen install, lint, typecheck, unit tests, production build, and the
  no-client-source-maps check under Node 20 / pnpm 10.
- Review the final diff, commit, push the branch, open a PR to main, and inspect CI.

## Deployment decisions outside this implementation

The existing rate limiter trusts proxy headers and stores buckets per process.
Shared limiting/trusted-proxy configuration requires deployment context and the
repository's explicit approval for new configuration/dependencies. This remains
an operational follow-up; a passing local test run cannot establish the trust
boundary of every deployment.

The user explicitly approved the prepared RDAP hardening patch on 2026-09-09.
It is implemented: every redirect is validated and pinned, at most three redirects
are followed, and bodies are capped at the existing WHOIS limit of **256,000
bytes**. The **six-second overall deadline** is retained, including DNS validation
and body consumption. Other security policy constants were preserved.

## References

- [OWASP SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Node 20 HTTP request options](https://nodejs.org/docs/latest-v20.x/api/http.html#httprequesturl-options-callback)
- [Next.js navigation and history integration](https://nextjs.org/docs/app/getting-started/linking-and-navigating)
- [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading)

## Delivered implementation

All four implementation workstreams are complete. The resulting assessment is
**8.5/10**, a subjective engineering judgment rather than a security certification.
The largest improvement is correctness at the transport and request-lifecycle
boundaries, with useful result actions and repeatable browser coverage.

- `lib/network/public-http.ts` owns the pinned HTTP transport, stream limits,
  decompression, cancellation, and cleanup. `target.ts` retains normalization,
  public-address policy, and redirect orchestration. A shared error module avoids
  a runtime circular dependency.
- WHOIS sockets pin both IANA and referral connections. RDAP uses the guarded HTTP
  transport with the approved limits. A shared pinned lookup retains the full
  validated address pool, and Node's family selection can try later addresses
  within one six-second connection/body deadline. WHOIS notes use locale-neutral codes.
- Every checker uses the shared API envelope/status reader. URL synchronization
  no longer duplicates requests; pathname navigation lets the destination own
  its lookup. Cancellation invalidates late results even when a transport ignores
  abort. `useToolQuery` synchronizes lookups and form fields only for external
  navigation, preserving a locally edited draft when a submission's delayed URL
  update arrives. Repeated page query parameters use their first value consistently.
- DNS TXT chunks retain their original concatenation. DNS and WHOIS have reusable
  copy/download actions and accessible raw-data disclosures. Search cancellation,
  repeated IP submissions, long-result wrapping, and command-palette naming and
  close controls are implemented. Palette hover selection requires actual mouse
  movement so a stationary pointer cannot hijack the keyboard selection when
  suggestions appear beneath it.
- Ping defaults and request construction are shared in a client-safe module.
  Explicit port edits survive mode changes, mode deep links choose the correct
  defaults, and disabled database credentials never enter the request body.
- The palette loads on first use, reduced-motion navigation skips route cloning,
  and JSON serialization/Blob allocation occurs only when a download is requested.
- Compatible lockfile updates refresh Browserslist to 4.28.9, brace-expansion 5.x
  to 5.0.9, and baseline-browser-mapping to 2.11.21, with their required browser
  datasets. Direct dependency declarations and unrelated optional peer resolutions
  remain intact.

The [WHOIS fallback review](https://github.com/ArturLauche/ip-info-leunos/pull/88#discussion_r3971549428)
and [draft-preservation review](https://github.com/ArturLauche/ip-info-leunos/pull/88#discussion_r3971549436)
are addressed. A real local socket test refuses the first pinned address and
succeeds on the second; a separate route test verifies the shared deadline.
Browser tests preserve drafts through delayed DNS/IP URL echoes and verify that
clearing the query and navigating Back still restore the correct form state.

## Verification and measurements

Verification ran under Node **20.20.2**, pnpm **10.34.5**, and Chromium **152**.
Frozen installation, lint, typecheck, **330 tests across 38 files**, production
build, and the absence of client source maps all passed. The baseline had 290
tests across 34 files. New coverage exercises transport pinning, mixed DNS answers,
redirect cleanup, declared/streamed/expanded size limits, slow bodies, cancellation
during DNS/body reading, malformed API envelopes, Ping payloads, and repeated
query parameters.

The production browser suite passed all **17 checks**, covering empty forms, one-request submissions,
same-target retry, late/cancelled responses, delayed URL updates, malformed gateway
responses, navigation/history, ASN route changes, repeated IP parameters, Ping
ports/auth, filtered DNS exports, German WHOIS exports, keyboard palette controls,
and mobile navigation. Desktop, 390px, and 320px layouts were checked, with dark
and light screenshots inspected. Browser fixtures are deliberately deterministic;
they do not establish external provider availability or real-world network latency.

Separate live smoke checks returned successful DNS, CDN, and WHOIS responses for
public targets. Requests to loopback, localhost, and metadata addresses were blocked
with HTTP 403 and retained `cache-control: no-store` across DNS/CDN/WHOIS/Ping.

| Production measurement | Baseline | Implemented | Interpretation |
| --- | ---: | ---: | --- |
| DNS API requests per form submission | 2 | 1 | 50% less duplicated API work for this flow. |
| Route clones with reduced motion | Snapshot created, then discarded | 0 | Avoids cloning the result DOM for a disabled animation. |
| Initial `/dns` script bytes | 876,740 | 877,324 | Essentially unchanged (+584 bytes). |
| Initial `/dns` gzip estimate | 274,445 | 277,384 | +2,939 bytes (+1.07%); no bundle-size reduction claim. |
| Initial script chunks | 14 | 17 | More chunks after splitting; palette code is deferred. |

The size comparison uses unique script URLs in production `/dns` HTML, reads their
actual response bodies, and sums Node's default `gzipSync` output per file. It
does not include CSS, RSC payloads, browser cache effects, or scripts loaded after
interaction, and it is not a page-speed score. Reproduce the final measurement with
`node scripts/measure-client-js.mjs http://localhost:3001/dns`. The added controls
and chunk splitting slightly increase compressed initial bytes; the network
request and reduced-motion improvements remain directly measured wins.

## Remaining limits

- Rate limiting is per process and depends on trusted proxy headers. A shared
  limiter and explicit proxy policy need deployment-specific decisions.
- Automated UI coverage is Chromium-based; Safari, Firefox, physical devices,
  and a dedicated screen-reader session remain unverified.
- Client cancellation stops waiting and prevents stale updates; it does not
  guarantee every already-started provider operation is cancelled server-side.
- API envelope validation is strict, but TypeScript result types do not replace
  runtime schemas for every provider payload. Provider normalization tests cover
  known formats, not every future upstream change.
- External providers can be unavailable, rate-limited, or return partial data.
  Existing source-state and fallback handling is retained. Deployment testing
  with optional credentials remains the operator's responsibility.
- `pnpm audit` reports **zero high/critical findings and two moderate entries** for
  the same [Vitest development-server advisory](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9)
  in `vitest` and `@vitest/mocker`. This repository uses Node-only `vitest run` and
  does not enable the affected browser mode or standalone mocker/interceptor
  plugins. A Vitest 4 migration remains a maintenance follow-up; these findings
  are documented rather than suppressed.

## Round 2 — 2026-09-29

Baseline: `6e55f2a` (main). Assessment before: **7.5/10** — careful transport and
scoring code, weakened by what the 26-language expansion did to delivery, a few
crash and correctness edges, and a regression script that no longer ran. After
this round: **8/10** (subjective). Three read-only audits (server, client,
i18n/tooling) supplied the findings; every fix below was reproduced or traced
before it was changed.

### Delivered

| Priority | Finding | Treatment |
| --- | --- | --- |
| P1 (perf) | Every `"use client"` module imported `getToolTranslation` / `getTranslation` / `getUiCopy`, so one 779 KB (199 KB gzip) chunk holding all 26 catalogs loaded on every route. | The root layout resolves one locale and serves it through `I18nProvider`; client code uses `useI18n()`. `lib/client-bundle.test.ts` walks the client import graph and fails on any catalog import. `global-error.tsx` uses a compact table kept identical to the catalogs by a test. |
| P1 | `/asn?asn=A&asn=B` (and repeated `q`) returned HTTP 500: the page typed the values as `string` and `AsnChecker` called `.trim()` on an array. | `firstSearchParam`, like every other page, plus a page test. |
| P1 | Redis probe without credentials never succeeded (CRLF test ran after `trim()`); MySQL accepted error packets as a handshake; probe timeouts were idle timers and the Redis-auth buffer was unbounded. | One socket lifecycle with an absolute deadline, the existing 64,000-byte response cap, at most AUTH + PING, protocol-version-10 check, and 40 tests against local servers. |
| P2 | CDN detection: bare `x-cache` scored CloudFront, CSP/Link values matched providers, CNAMEs matched by substring (`oci` in `social-…`). | Generic headers only support provider evidence, values are read from infrastructure headers only, CNAMEs match on label boundaries. Verified identical on 89 canonical inputs and by a differential fuzz against the old code. |
| P2 | Deep links (`/dns?target=x`) painted the empty state before the lookup started. | `useToolLookup` starts in the loading state when an initial query exists; server and client agree. |
| P2 | Results were not announced to assistive technology; the search field inherited RTL bidi rules (`::1` reorders). | Persistent live region in `ToolSearchForm`; the field is `dir="ltr"`. |
| P2 | A DNS lookup that found nothing was shown under a green success mark. | `ResultPanel` takes a `status`; DNS passes `warning`. |
| P2 | `scroll-behavior: smooth` without `data-scroll-behavior` animates route changes. | Attribute added to `<html>`. |
| P2 | Concurrent identical DNS and reputation lookups each repeated the upstream fan-out (10 and ~12 queries). | `createSingleFlight`; nothing is retained after settlement. |
| P2 | `/api/flag/[code]` was the only public route without `enforceRateLimit`. | 120 requests/minute per client, empty 429. |
| P3 | IPv6 discovery asked the IPv4-only `checkip.amazonaws.com` for an IPv6 address; third-party fetches sent a referrer. | That provider is skipped for IPv6; `referrerPolicy: "no-referrer"`. |
| P3 | Copy failed on plain-HTTP deployments (`navigator.clipboard` undefined). | Selection-based fallback in `lib/clipboard.ts`. |
| Feature | Copy / JSON export existed only for DNS and WHOIS. | `ResultActions` on IP, ASN, CDN, Ping and Reputation results. |
| Tooling | `scripts/verify-browser.mjs` targeted a removed `#tool-query` id and a stale ASN fixture, so it could not run. | Selectors and fixture updated; see the verification note. |

### Measurements

Production build, Node 24, `scripts/measure-client-js.mjs`-style accounting
(unique `<script src>` bodies, gzip level default). Dictionary payload is one
locale: 31–58 KB raw, 10.6–14.2 KB gzip depending on the language.

| Route | Client JS raw | Client JS gzip | HTML gzip |
| --- | ---: | ---: | ---: |
| `/` before → after | 1,779,105 → 832,606 | 510,893 → 264,187 | 10,026 → 21,390 |
| `/dns` before → after | 1,770,105 → 822,619 | 508,036 → 260,972 | 10,218 → 21,636 |
| `/asn` before → after | 1,825,169 → 878,721 | 521,583 → 274,945 | 10,563 → 21,925 |
| `/reputation` before → after | 1,775,192 → 829,811 | 508,839 → 262,534 | 10,251 → 21,670 |
| `/privacy-policy` before → after | 1,743,934 → 794,009 | 499,581 → 251,613 | 14,458 → 28,203 |

Net first-load transfer on `/` drops by about 236 KB gzip (−45%). The catalog is
inlined once per full page load and not re-sent on client-side navigation.

### Needs a decision (not changed; `AGENTS.md` says ask first)

- **Target validation.** `assertPublicTarget` rejects `_` labels and names with
  no A/AAAA record, so `_dmarc.x`, `_sip._tcp.x` and mail-only domains cannot be
  queried, and single-label names act as an internal-DNS existence oracle that
  echoes private addresses in error details.
- **Resolver.** Target validation uses `dns.lookup` (libuv threadpool of 4); a
  slow-DNS domain can starve it. A shared c-ares `Resolver` avoids that.
- **Rate limiting.** Buckets are per full IPv6 address, honor client-writable
  headers first, and sweep on every request; `/api/ip` auto-detect is uncached
  against a shared 40/minute upstream budget.
- **Caching.** Reputation stores degraded summaries for 10 minutes; WHOIS has no
  cache and accepts empty or throttled answers as success; provider bodies in
  `lib/reputation/query.ts` are read outside their timeout.
- **Other behavior.** UDP ping cannot see ICMP unreachable on an unconnected
  socket; the CDN check returns 413 for pages over 1 MB although it needs only
  headers; AbuseIPDB entries with 0% confidence score as medium risk.
- **Deployment.** `Dockerfile` (root user, Node 20 end-of-life, no health check),
  CI (`permissions`, `concurrency`, audit step), CSP `script-src`, immutable cache
  headers for `public/` assets, `/api/health`, `sandbox` CSP on the flag proxy.
- **Follow-ups.** Per-route dictionary scoping would shrink the +11 KB gzip HTML
  payload; light-theme `--warning`/`--success` fall below WCAG AA on white;
  shadcn dialog/sheet/select animations ignore `prefers-reduced-motion`.

### Verification note

`pnpm lint`, `pnpm typecheck`, `pnpm test` (53 files) and `pnpm build` pass, and
no client `.map` remains. `scripts/verify-browser.mjs` was run with
agent-browser 0.31.1 (the README pins 0.37.1); 15 of its 17 checks pass. The
last two (phone-width theme/navigation and the German WHOIS fallback with a
download comparison) did not complete on this CLI version, so those flows were
replayed by hand against the same build: theme switch, sheet navigation, and the
German WHOIS result with its announcement and export buttons all behaved
correctly.
