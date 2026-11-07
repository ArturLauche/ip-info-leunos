# SEO strategy

This document records the high-value SEO work for `ip-info.leunos.com`, what
was implemented without changing the rendered interface, and which ideas need a
product or content decision first.

The site already had a strong technical baseline: per-route canonical URLs,
Open Graph and Twitter cards, `Organization` / `WebSite` / `WebApplication` /
`Article` JSON-LD, `robots.txt`, a sitemap, `llms.txt`, semantic landmarks, and
a fast production build. The changes below close the remaining gaps that can be
fixed with metadata, headers, and structured data only.

## Implemented (invisible, no layout changes)

1. **Search-intent homepage title in every locale.** The homepage document
   title was only the brand (`IP Info`). It now targets the page's primary
   demand (`What Is My IP? Public IPv4 & IPv6 Address Lookup`, localized for all
   26 UI locales) while the visible H1 stays the brand. The description is
   composed from existing localized catalog sentences, so no new filler copy is
   introduced.
2. **Richer metadata for `/check` and `/whois`.** The snippets use the existing
   empty-state descriptions, which name the fields the tools actually return
   (location/network/ASN/reverse DNS for `/check`; registrar/dates/status/
   nameservers for `/whois`), instead of the one-line subtitles.
3. **Query-shaped ASN metadata.** `/asn` and `/asn/AS123` titles use the
   localized "ASN Lookup" wording, which matches how users search; the H1 keeps
   the descriptive "ASN Information" wording.
4. **Invalid deep links are `noindex, follow`.** `/asn/not-an-asn` still renders
   the interactive checker for users, but it is no longer an indexable
   duplicate of `/asn`; its canonical continues to point at the parent tool.
5. **Homepage `ItemList` structured data.** Every tool is listed with the same
   localized name, description, and canonical URL the navigation renders. This
   gives search engines an explicit model of the toolbox without adding a
   visible link farm.
6. **Organization description.** The site-wide `Organization` node now carries
   the same factual description as the site metadata.
7. **Sitemap freshness.** Every sitemap entry now has a `lastModified`
   timestamp, and the route reads the catalog-free `lib/site-config` module
   instead of pulling all locale catalogs into the sitemap route.
8. **API responses are explicitly non-indexable.** JSON responses now send
   `X-Robots-Tag: noindex, nofollow` in addition to `robots.txt` disallowing
   `/api/`. The API stays usable; only search indexing is suppressed.

## Recommended next, but requires a UI or architecture decision

These are ordered by expected impact. They are deliberately **not** implemented
in this change because each one alters the rendered interface, routing, or
deployment behavior.

1. **Localized URLs with `hreflang`.** Today one URL serves 26 languages based
   on `Accept-Language` and a cookie. That is good for users, but search engines
   cannot discover or rank the non-English versions separately. The clean
   solution is locale-prefixed routes (`/de/...`, `/es/...`) plus reciprocal
   `hreflang` and `x-default`. The repository currently forbids adding `/de/...`
   routes without an explicit decision, so this remains the largest open
   international-SEO opportunity.
2. **Genuine explanatory content per tool.** A short, task-focused page or
   expandable section explaining how to read a DNS, WHOIS, ASN, CDN, or
   reputation result would help users and search intent. It must be written for
   humans, not generated filler, and should not become an FAQ block. This needs
   design and editorial review.
3. **Visible breadcrumbs plus `BreadcrumbList`.** Breadcrumb rich results are
   only appropriate when the breadcrumb is visible. Adding a compact
   "Home > Diagnostics > DNS" trail would need a UI review; emitting the JSON-LD
   without a visible trail would violate structured-data quality guidelines, so
   it was intentionally not added.
4. **Server-rendered summaries for `/asn/[asn]`.** Deep links currently render
   a client-side lookup. Server-rendering the ASN holder, announced prefix
   count, and PeeringDB presence would create genuinely unique indexable pages,
   but it adds provider calls, caching rules, and rate-limit implications.
5. **Per-tool social images.** The static `og-image.png` is consistent, but a
   generated card per tool (name plus a one-line description) improves click
   through from social and chat previews. This does not directly affect
   rankings and needs an asset pipeline.
6. **Search Console, Bing Webmaster Tools, and IndexNow.** Google verification
   is already present; Bing and IndexNow need account credentials and a deploy
   hook. These are operational steps, not code-only changes.
7. **Core Web Vitals monitoring.** The app already self-hosts fonts and ships
   one locale's catalogs to the client. A field-data budget (LCP, INP, CLS) in CI
   or a dashboard would catch regressions after future UI work.

## Deliberately avoided

- Generic FAQ blocks or keyword-stuffed paragraphs that exist only for crawlers.
- Doorway pages, auto-generated city/query pages, or thin result pages.
- Fake ratings, reviews, or `aggregateRating` markup.
- Hidden text, hidden links, or structured data for content users cannot see.
- Buying links or participating in link schemes.
- Adding `HowTo`/`FAQPage` markup without matching visible, useful content.

## Guardrails for future changes

- Metadata, canonical URLs, Open Graph, and JSON-LD must continue to use
  `canonicalUrl()` / `createPageMetadata()` so they cannot drift apart.
- Every public route keeps the `enforceRateLimit` → zod → public-target guard
  order; SEO changes must not bypass it.
- Client modules must not import `lib/seo`, `lib/i18n`, or other catalog-bearing
  modules; `lib/client-bundle.test.ts` enforces this.
- UI-facing copy stays in the locale catalogs. SEO-only strings live beside the
  metadata helpers and are covered by tests.
- After changes run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
