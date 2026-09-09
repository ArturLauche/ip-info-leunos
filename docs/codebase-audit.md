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
  transport with the approved limits. WHOIS notes use locale-neutral codes.
- Every checker uses the shared API envelope/status reader. URL synchronization
  no longer duplicates requests; pathname navigation lets the destination own
  its lookup. Cancellation invalidates late results even when a transport ignores
  abort. Repeated page query parameters use their first value consistently.
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

## Verification and measurements

Verification ran under Node **20.20.2**, pnpm **10.34.5**, and Chromium **152**.
Frozen installation, lint, typecheck, **327 tests across 37 files**, production
build, and the absence of client source maps all passed. The baseline had 290
tests across 34 files. New coverage exercises transport pinning, mixed DNS answers,
redirect cleanup, declared/streamed/expanded size limits, slow bodies, cancellation
during DNS/body reading, malformed API envelopes, Ping payloads, and repeated
query parameters.

The production browser suite passed all **16 checks**, covering empty forms, one-request submissions,
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
| Initial `/dns` script bytes | 876,740 | 876,893 | Essentially unchanged (+153 bytes). |
| Initial `/dns` gzip estimate | 274,445 | 277,205 | +2,760 bytes (+1.01%); no bundle-size reduction claim. |
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
