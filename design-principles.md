# Design Principles — IP Auskunft

This document describes the design language of **IP Auskunft** and the rules for
extending it. It is the source of truth for visual and interaction decisions;
implementation details live in `app/globals.css` (tokens), `components/ui/`
(primitives), and `components/shell/` (app shell).

> TL;DR — A monochrome, Vercel-style console. Black-and-white chrome on a
> true-neutral grey scale, **colour reserved for meaning**, generous
> whitespace, strong typographic hierarchy, and one consistent set of
> accessible shadcn/ui components.

---

## 1. Philosophy

- **Calm and professional, not playful.** The product is a network toolbox for
  developers and operators. Clarity and readability beat decoration.
- **Monochrome by default.** The interface is black, white, and grey. The brand
  does not own a colour — emphasis comes from contrast, weight, and space.
- **Colour means something.** Any non-grey colour signals state (success,
  warning, error, info). If a colour is not communicating status, it does not
  belong.
- **Structure over ornament.** Consistent cards, borders, and spacing create a
  scannable hierarchy. Avoid gradients, glows, and shadows-as-decoration.
- **One system.** Every surface is built from the same tokens and the same
  component primitives. No bespoke one-off styling.

---

## 2. Colour & theming

### Token model

All colour is expressed through semantic CSS variables defined in
`app/globals.css`. Light values live under `:root`, dark values under `.dark`,
and both are exposed to Tailwind via the `@theme inline` block (e.g.
`bg-background`, `text-muted-foreground`, `border-border`). The palette is
true-neutral (OKLCH chroma `0`) — the shadcn "neutral" scale.

| Token | Role |
|-------|------|
| `background` / `foreground` | Page surface and primary text |
| `card` / `card-foreground` | Raised panels |
| `popover` / `popover-foreground` | Overlays (menus, selects, tooltips) |
| `primary` / `primary-foreground` | Highest-emphasis action — **black in light, white in dark** |
| `secondary`, `muted`, `accent` | Neutral fills, subdued text, hover surfaces |
| `border`, `input`, `ring` | Hairlines, field borders, focus ring |
| `sidebar-*` | The app shell surface and its accents |

### The monochrome rule

- **Chrome is grey-scale only.** Brand mark, navigation, icon tiles, buttons,
  focus rings, progress bars, and decorative badges use `background`,
  `foreground`, `muted`, `secondary`, and `primary` — never a hue.
- The primary action is the inverted neutral: a **black** button in light mode,
  a **white** button in dark mode (`bg-primary text-primary-foreground`).
- Icons are monochrome (`text-foreground` / `text-muted-foreground`, or
  `text-primary` on a subtle `bg-primary/10` tile).

### Semantic state colours

Colour is allowed **only** to communicate state, and is mapped to four tokens
with light/dark variants:

| Token | Meaning | Examples |
|-------|---------|----------|
| `success` (green) | Healthy / passing | Low risk, clean blacklist, RPKI valid, "complete" data |
| `destructive` (red) | Failure / danger | High risk, listed, RPKI invalid, source error, errors |
| `warning` (amber) | Caution / attention | Threat categories, partial data, record-lookup notes |
| `info` (blue) | Neutral information | Disclaimers, advisory notes |

Rules:

- Use the **`Badge`** and **`Alert`** variants (`success` / `warning` / `info` /
  `destructive`) rather than raw Tailwind palette classes — they adapt across
  themes automatically.
- Descriptive (non-state) labels stay neutral. A connection "Hosting" flag or an
  ASN "isp/hosting" type is `secondary`, not coloured — it describes, it does not
  warn.
- Never hardcode hex values or raw palette colours (`text-emerald-300`,
  `#2dd4bf`) for status. They break one of the two themes. Use the tokens.

### Theming mechanics

- `next-themes` drives light/dark via a `class` on `<html>`; default is **dark**.
- `ThemeProvider` wraps the app in `app/layout.tsx`; `<html>` carries
  `suppressHydrationWarning`. The theme toggle is `components/mode-toggle.tsx`
  (Light / Dark / System).
- Keep `viewport.themeColor` (in `app/layout.tsx`) and `app/manifest.ts` in sync
  with the `background` token hex.

---

## 3. Typography

- **Typeface:** Geist Sans for UI, Geist Mono for technical values. Both are
  self-hosted via the `geist` package — never import `next/font/google` (it
  breaks offline builds).
- **Monospace = data.** IP addresses, ASNs, prefixes, ports, DNS values,
  hostnames, and raw output use `font-mono`. Labels and prose use the sans.
- **Hierarchy by weight and size, not colour.**
  - Page title: `text-2xl sm:text-3xl font-semibold tracking-tight`.
  - Section heading: `text-lg font-bold` (or `font-semibold`).
  - Eyebrow / label: `text-xs font-semibold uppercase tracking-wider
    text-muted-foreground`.
  - Body: `text-sm`; supporting detail: `text-xs text-muted-foreground`.
- Numeric tables and stats use `tabular-nums` for alignment.
- Keep line length comfortable — constrain prose with `max-w-2xl`.

---

## 4. Layout, spacing & shape

- **Radius:** driven by `--radius` (`0.65rem`). Use the scale (`rounded-md`,
  `rounded-lg`, `rounded-xl`) — cards `rounded-xl`, controls `rounded-md`.
- **Content width:** the main column is centred at `max-w-6xl` with responsive
  padding (`px-4 sm:px-6 lg:px-8`).
- **Rhythm:** stack page sections with `gap-6`; group related fields with
  `gap-4`; tight clusters with `gap-2`/`gap-3`.
- **Whitespace is a feature.** Prefer breathing room over density. Let cards and
  empty space define structure.
- **Elevation is restrained:** a hairline `border` plus `shadow-sm` is the
  default for cards. Avoid heavy shadows and glassmorphism. The page background
  is flat.

---

## 5. Components

- The component library is **shadcn/ui (New York)** on Radix primitives, in
  `components/ui/`. Compose from these — do not re-create buttons, inputs,
  tables, dialogs, etc.
- Merge classes with `cn()` from `lib/utils.ts` so token overrides resolve
  predictably.
- **Button hierarchy:** one `default` (primary) action per view; `outline` or
  `secondary` for secondary actions; `ghost` for low-emphasis/icon actions;
  `link` for inline navigation. Destructive actions use the `destructive`
  variant.
- **Cards** are the primary container. Headings sit on a `border-b` with a
  `bg-muted/30` tint when a panel needs a titled header (see `ResultPanel`).
- **Tables** (`components/ui/table.tsx`) for tabular data on desktop; on mobile,
  collapse wide tables into stacked cards (see the ASN IX / facility sections).
- **Forms:** every input has a `Label`; use `Select`, `Switch`, `Tabs`, and
  `ToggleGroup` instead of bespoke controls. Inputs are full-width within their
  grid cell.
- Shared building blocks: `ToolSearchForm`, `ResultPanel`, `ErrorPanel`,
  `EmptyState`, and `components/asn/show-more-button.tsx`.

---

## 6. Navigation & shell

- `ToolPageShell` provides the frame for every tool page: a fixed **sidebar** on
  desktop and a sticky top bar with a slide-out **Sheet** on mobile.
- Navigation is data-driven from `components/shell/nav-config.ts`, grouped into
  **Overview** and **Diagnostics**. Add a tool by extending the config — never
  hardcode links in pages.
- The active item is marked with a neutral fill, a high-contrast icon, and a
  short accent indicator bar (`aria-current="page"`).
- A page header pattern (eyebrow → title → subtitle, with a leading icon tile)
  appears at the top of every tool for consistent orientation.

---

## 7. States

Every data view designs for four states explicitly:

- **Loading:** `Skeleton` placeholders that mirror the real layout — never a
  bare spinner for whole-page loads. Inline actions show a spinner + label.
- **Empty:** a centred `Card` with the `bg-grid` texture, an icon tile, a title,
  and a one-line hint (see the ASN and reputation empty states).
- **Error:** `ErrorPanel` (an `Alert` with the `destructive` variant). Messages
  are resolved from API **error codes** via i18n — never from raw English
  strings.
- **Success / result:** results animate in subtly and lead with a clear summary
  (e.g. `ResultPanel` with a success check, or a risk header).

---

## 8. Interaction & motion

- Motion is **functional and quick**: `transition-colors`, gentle
  `animate-in fade-in slide-in-from-bottom-2` reveals for results, and the
  theme-toggle icon swap. No long or attention-seeking animation.
- Hover states are subtle (`hover:border-primary/40`, `hover:bg-muted/40`).
- Provide feedback for actions: copy-to-clipboard confirms with a `sonner` toast
  and a momentary check icon.
- Respect the platform — keep durations short and avoid motion that blocks
  reading.

---

## 9. Accessibility

- Use semantic, accessible primitives (Radix) — they ship correct roles, focus
  management, and keyboard support. Keep `Label`↔control associations.
- Every interactive element shows a visible focus ring (`focus-visible:ring`).
  Do not remove it.
- Icon-only controls require an `aria-label`; decorative icons are `aria-hidden`.
- Maintain contrast: body text on `background`, secondary text on
  `muted-foreground`. Verify both themes when introducing a surface.
- Overlays (Dialog, Sheet, Select) must have an accessible title.

---

## 10. Iconography

- **Lucide React**, monochrome, typically `size-4`–`size-5`. One icon set, one
  visual weight.
- Icons clarify, they don't decorate. Pair an icon with a label where meaning
  isn't obvious.
- The brand mark (`components/shell/brand-mark.tsx`) is a solid inverted tile
  (black-on-white / white-on-black) — a logo, not an accent.

---

## 11. Responsiveness

- Mobile-first. Layouts reflow from multi-column grids to single column; the
  sidebar becomes a sheet.
- Wide data (tables) gets a dedicated mobile presentation (stacked cards) rather
  than horizontal scroll where practical.
- Tap targets stay comfortable; primary actions go full-width on small screens.

---

## 12. Internationalisation

- The UI is translated (8 locales) and must never assume English string length.
  Allow labels to wrap/truncate gracefully.
- UI strings live in `lib/i18n.ts` and `lib/tool-i18n.ts`; never hardcode
  user-facing copy in components. API responses return codes, the UI translates.

---

## 13. Do / Don't

**Do**
- Build from tokens and `components/ui/` primitives.
- Reserve colour for `success` / `warning` / `info` / `destructive` state.
- Verify both light and dark themes for every change.
- Lead views with a clear summary and design all four states.

**Don't**
- Hardcode hex or raw Tailwind palette colours for status (breaks a theme).
- Reintroduce a brand accent colour into chrome (buttons, nav, icons, mark).
- Hand-roll controls that a shadcn/Radix primitive already provides.
- Use `next/font/google`, heavy shadows, decorative gradients, or noisy motion.

---

## 14. Extending the system

When adding a tool or surface:

1. Reuse `ToolPageShell` and register navigation in
   `components/shell/nav-config.ts`.
2. Compose from `components/ui/` primitives and the shared panels; style only
   with semantic tokens via `cn()`.
3. Design loading, empty, error, and result states.
4. Add a new shadcn primitive only if one is genuinely missing — match the
   existing token usage and `data-slot` conventions, and confirm it works in
   both themes.
5. Run `pnpm lint && pnpm typecheck && pnpm build` and review the change in both
   themes before committing.
