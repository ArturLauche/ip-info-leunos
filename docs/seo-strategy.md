# SEO Strategy

This document records the search strategy for the site and the rules for
extending it. The guiding constraint is that SEO work must not add visible
clutter: no FAQ walls, no keyword-stuffed filler sections, and no changes to the
tool workflow.

## Principles

- **One canonical URL per route.** Query parameters are presentation state, not
  separate pages. Every page keeps its own `<link rel="canonical">`.
- **Metadata carries the search intent; the UI stays clean.** Titles,
  descriptions, Open Graph tags, and JSON-LD do the work without adding
  on-page copy.
- **Structured data describes the real graph.** Pages are linked to the site,
  the organization, the tool application, and their breadcrumb trail. Deep
  links such as `/asn/AS13335` describe themselves, not their parent route.
- **Crawl hygiene over volume.** Thin or invalid deep links are excluded from
  the index instead of being padded with filler text.
- **No fabricated trust signals.** No invented ratings, reviews, or
  certifications in structured data.

## Implemented

### Search-intent metadata

- The home document title targets the primary "my IP" intent (`My IP | IP Info`)
  while the visible H1 remains the localized brand.
- `/check` and `/whois` use the richer, localized empty-state copy as their
  meta description; the shorter visible subtitles are unchanged.
- Every route keeps localized titles, descriptions, Open Graph/Twitter cards,
  keywords, `hreflang`-free canonical URLs (one URL per locale), and the
  `llms.txt` alternate link.

### Structured data graph

- `WebPage` nodes now describe each route with `url`, `name`, `description`,
  `inLanguage`, `isPartOf`, `primaryImageOfPage`, and `about`/`mainEntity`
  references to the matching `WebApplication`.
- `BreadcrumbList` nodes are emitted for every non-home page:
  - tool page: Home → Tool
  - deep link: Home → Tool → `AS13335`
  - legal page: Home → Page
- `WebApplication`/`SoftwareApplication` nodes now use the actual route URL,
  including `/asn/AS13335`, and link back to the `WebPage` with
  `mainEntityOfPage`. A screenshot image object is included.
- Legal pages keep their `Article` node and now point `mainEntityOfPage` at the
  shared `WebPage` node.

### Crawl hygiene

- Invalid `/asn/[asn]` inputs render the normal validation surface but send
  `noindex, follow` and canonicalize to `/asn`; their structured data is
  suppressed because they are not distinct ASN pages.
- JSON API responses send `x-robots-tag: noindex` in addition to the existing
  `/api/` disallow rule and `cache-control: no-store`.
- `robots.txt`, `sitemap.xml`, canonical URLs, and `llms.txt` remain the single
  discovery surface. No sitemap `lastmod` churn is emitted.

## Deliberately not implemented

- **FAQ blocks or filler paragraphs.** They add UI weight and rarely earn
  rich results; the tool itself is the content.
- **Locale-prefixed routes and `hreflang`.** The app intentionally negotiates
  one locale per URL. Adding `/de/...` routes would be an architecture and UI
  change, not an SEO-safe patch.
- **Fabricated ratings or review markup.** The site has no verified rating
  source.
- **Per-route generated Open Graph images.** The existing 1200×630 brand card
  is valid and lightweight; per-route images add build/runtime weight without
  affecting search ranking.
- **Keyword-stuffed meta keywords.** They are kept for compatibility with the
  existing metadata but are not used as a ranking lever.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The browser check used for this change verifies the rendered title, description,
canonical, robots meta, and JSON-LD on `/`, `/check`, `/dns`, `/whois`, `/asn`,
`/asn/AS13335`, `/asn/not-an-asn`, and `/privacy-policy`, plus the API
`x-robots-tag` header and client-side navigation.
