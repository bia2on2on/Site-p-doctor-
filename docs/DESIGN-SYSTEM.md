# CPMS Design System — Foundation Slice

**Status:** design-system foundation, **not** a homepage and **not** an applied Elementor configuration. Decided **2026-09-28 UTC** at main `e00cc812f48579c0328bd667d269e81ff98a134f`. Values are engineering-complete (contrast math verified by test) but **PROVISIONAL** until Milestone A owner visual acceptance (`docs/SITE-ARCHITECTURE.md` §16). **Real-host WordPress/Elementor/Elementor Pro/PHP/DB versions remain NOT VERIFIED.** `reconstruction` `clean_import_pilot` and `authorized_pro_host_acceptance` remain **NOT RUN**. No Elementor kit or settings export exists or is simulated by this slice.

**Canonical representation:** [`design-system/tokens.json`](../design-system/tokens.json) — machine-readable, diffable, and sufficient to compare against a future Elementor settings/kit export. This document is the human spec and rationale; if the two ever disagree, `tokens.json` wins and the discrepancy is a defect.

**Authority:** `docs/SITE-ARCHITECTURE.md` §7–§11 (design direction + design-system/RTL/responsive contracts) and `docs/ROADMAP.md` §13–§14. Product identifier remains **CPMS**; final commercial branding is an open business decision (`docs/ROADMAP.md` §21) and is **not** invented here.

---

## 1. Slice scope

| This slice delivers | Explicitly not delivered |
|---|---|
| Canonical design tokens (color, type, spacing, containers, radius/border, shadows, focus, motion, breakpoints) | Homepage or any page (blocks A–I application = next slice) |
| Persian/RTL typography strategy + committed, licensed font assets | Header/footer/navigation, forms, pricing, blog, legal, customer proof |
| Precise Elementor Global Colors / Global Fonts / Site Settings mapping (spec only) | Any Elementor export/import, kit ZIP, or applied WordPress configuration |
| Accessibility foundation (WCAG 2.2 AA-targeted defaults) | Accessibility audit of rendered pages (nothing rendered yet) |
| Responsive foundation with representative targets | Playwright/browser verification — **NOT RUN** (no page exists to verify) |
| Enforceable performance foundation (structural rules + font budget) | Production performance measurements or numeric payload budgets (see §7) |
| Reconstruction metadata + static tests (contrast math, schema, integrity) | Marketing claims, brand identity, analytics, add-on packs |

Coverage of the `docs/SITE-ARCHITECTURE.md` §8 checklist: color roles ✓, typography ✓, spacing ✓, containers ✓, heading hierarchy (policy) ✓, buttons/links/cards/badges/forms/accordions/tabs/media frames/trust/CTA/alerts/icons (token binding + state policy) ✓ at policy level — **full visual component specs and Home-block application remain the next slice (Milestone A)**, as do final owner-endorsed color/font choices.

---

## 2. Design tokens

All values live in `design-system/tokens.json`; summary tables below. Policy: **role-based use only** — arbitrary per-page hex values are prohibited (`docs/SITE-ARCHITECTURE.md` §8).

### 2.1 Color roles (18 — exactly the contract role set)

| Role | Value | Use |
|---|---|---|
| `background/base` | `#F6F8F9` | Default page background |
| `background/subtle` | `#ECF1F3` | Alternate section band |
| `surface/card` | `#FFFFFF` | Cards, panels, fields |
| `surface/raised` | `#FFFFFF` | Menus/popovers — separated by `shadow/raised`, not fill |
| `ink/primary` | `#14212B` | Headings, primary text |
| `ink/secondary` | `#41545F` | Secondary text |
| `ink/muted` | `#556874` | Captions, meta, helper text |
| `accent/primary` | `#0F6F66` | Primary CTA, links, focus ring, active state |
| `accent/hover` | `#0B5B54` | Hover of accent fills |
| `accent/active` | `#084B45` | Pressed of accent fills |
| `accent/contrast-on-accent` | `#FFFFFF` | Text/icons on accent fills |
| `link` | `#0F6F66` | Inline links (shares accent family by policy; separate role for future divergence) |
| `border/subtle` | `#DDE5E9` | Decorative dividers only |
| `border/strong` | `#788B95` | Control/input boundaries (SC 1.4.11) |
| `success` | `#0E7048` | Status text/icon on light surfaces |
| `warning` | `#8A5A00` | Status text/icon on light surfaces |
| `danger` | `#B3261E` | Status text/icon on light surfaces |
| `info` | `#1B5FA8` | Status text/icon on light surfaces |

Accent discipline (calm, restrained): teal is a decision of this slice consistent with “Premium Medical Technology + Professional SaaS + Trust” (`docs/ROADMAP.md` §13); it is **not** final commercial branding. Status colors always ship **icon + text**, never color alone; status fills are low-alpha tints of the same token. Gradients/glassmorphism remain prohibited (§7.1 of the architecture contract).

### 2.2 Contrast (WCAG 2.2 AA — computed, enforced by test)

Standard adopted for the project (per `docs/SITE-ARCHITECTURE.md` §8 “numeric threshold determined in the Design System on the accepted standard”): **4.5:1** normal text (SC 1.4.3), **3:1** large text and non-text UI (SC 1.4.11). Every text role passes 4.5:1 on `background/base`, `surface/card` and `background/subtle` (lowest measured 5.10:1); `accent/contrast-on-accent` passes on all three accent fills (lowest 6.02:1); `border/strong` and `accent/primary` pass 3:1 as UI boundaries (lowest 3.33:1). Ratios are computed by `tests/static/validate-tokens.mjs` on every validation run — a value change that breaks a threshold fails CI.

### 2.3 Typography scale

| Role | Size (desktop) | Size (mobile) | Line height | Weight |
|---|---|---|---|---|
| `caption` | 13px | — | 1.7 | 400 |
| `body-sm` | 15px | — | 1.85 | 400 |
| `body` | 17px | — | 1.9 | 400 |
| `lede` | 20px | 18px | 1.85 | 400 |
| `h3` | 22px | 20px | 1.6 | 700 |
| `h2` | 28px | 24px | 1.55 | 700 |
| `h1` | 40px | 30px | 1.45 | 700 |

Line heights are deliberately Persian-friendly (higher than Latin defaults). `letter-spacing` is **0 everywhere** — spacing breaks the Persian joined script. Measure ≤ 66 characters via `content-narrow`; H1 ≤ 60 characters and ≤ 2 lines on desktop.

### 2.4 Spacing, containers, borders, shadows, focus, motion

| Group | Values |
|---|---|
| Spacing | base 4px; `space-1..10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 (ad-hoc values prohibited) |
| Containers | `content-narrow` 720px (long text/forms), `content-default` 1120px (sections), `content-wide` 1280px (media-rich); media may bleed edge-to-edge, text never exceeds `content-default` |
| Border/radius | 1px default border; radius `sm` 6px (fields/buttons), `md` 10px (cards/frames); no pill radius; borders calmer than surfaces |
| Shadows | exactly two: `subtle` `0 1px 2px rgba(20,33,43,.06)`, `raised` `0 8px 24px rgba(20,33,43,.10)`; no decorative blur |
| Focus | 2px ring + 2px offset, `accent/primary` (`accent/contrast-on-accent` on accent fills), `:focus-visible`, never removed |
| Motion | 120ms (fast) / 200ms (base), `ease-out`, hard cap 200ms; `prefers-reduced-motion: reduce` → durations 0, no parallax/auto-animation, affordances kept |

---

## 3. Persian / RTL typography strategy

**Chosen family: Vazirmatn** — modern Persian UI family with full Persian + Latin coverage, **SIL OFL 1.1** (redistributable), self-hosted.

| Decision | Value | Rationale |
|---|---|---|
| Family count | 1 (`Vazirmatn`) + system fallback | Minimal families; one family carries headings and body |
| Weights | **2** (400, 700) | Within the 2–3 contract; emphasis via size/color, not extra weights; a third weight is committed only on demonstrated need with tokens+manifest update |
| Files | `design-system/fonts/vazirmatn/Vazirmatn-Regular.woff2` (50,684 B), `Vazirmatn-Bold.woff2` (51,020 B) | WOFF2 only; ≈99 KB committed total (file sizes, not a load-time measurement) |
| Loading | self-hosted, `font-display: swap` | No third-party runtime font request — avoids CDN availability risk from Iran, keeps payload controllable |
| Fallback stack | `Tahoma, "Segoe UI", system-ui, sans-serif` | Persian-capable system fallback before generic sans |
| Licensing | OFL-1.1, `OFL.txt` committed alongside files | Honest, auditable; upstream https://github.com/rastikerdar/vazirmatn tag `v33.003`; byte-identity to the tag proven by matching git blob SHAs (see `design-system/fonts/vazirmatn/README.md`) |

**Missing-artifact policy:** if a future decision requires a font that cannot be legally committed, **no unlicensed binary is added** — record the gap as a missing artifact and keep the fallback stack. (Not currently applicable: Vazirmatn is legally committed.)

**Persian text rules** (enforced at content/QA time; full contract `docs/SITE-ARCHITECTURE.md` §9): ZWNJ half-spaces (می‌شود), glued commas/periods, «…» quotes, Persian «؟», Persian digits (۰–۹) in narrative text vs Latin digits for technical/communicative values (phone, email, URL, versions) inside `direction: ltr; unicode-bidi: isolate`, Latin product names stay Latin.

**Fallback-only environment:** before the font files are served (not yet applied anywhere), the site renders with the fallback stack; no layout decision may depend solely on Vazirmatn-specific metrics.

---

## 4. Elementor mapping (spec only — nothing applied)

Sources: official *View and edit global colors* (updated 2026-09-10), *View and edit global fonts* (2026-09-15), *Responsive editing for mobile and tablets* (2026-09-15) — see §10.

### 4.1 Global Colors

Elementor keeps four non-deletable **system colors** (Primary, Secondary, Text, Accent); everything else is an addable **custom color**. Mapping (complete — every role appears exactly once; enforced by test):

| Elementor slot | Token role | Elementor slot | Token role |
|---|---|---|---|
| System **Primary** | `accent/primary` | Custom `background/base` | `background/base` |
| System **Secondary** | `ink/secondary` | Custom `background/subtle` | `background/subtle` |
| System **Text** | `ink/primary` | Custom `surface/card` | `surface/card` |
| System **Accent** | `link` | Custom `surface/raised` | `surface/raised` |
| | | Custom `ink/muted` | `ink/muted` |
| | | Custom `accent/hover` | `accent/hover` |
| | | Custom `accent/active` | `accent/active` |
| | | Custom `accent/contrast-on-accent` | `accent/contrast-on-accent` |
| | | Custom `border/subtle` | `border/subtle` |
| | | Custom `border/strong` | `border/strong` |
| | | Custom `success` / `warning` / `danger` / `info` | same-named roles |

Custom swatches are named after their role (e.g. `accent/hover`) so a future export diff against `tokens.json` is mechanical.

### 4.2 Global Fonts

Elementor keeps four non-deletable **system fonts** (Primary, Secondary, Body Text, Accent Text) plus addable **custom styles** (each carries one size):

| Elementor style | Type role | Notes |
|---|---|---|
| System **Primary** | `h2` | Heading baseline (family Vazirmatn, weight 700); per-level sizes come from the scale |
| System **Secondary** | `h3` | |
| System **Body Text** | `body` | |
| System **Accent Text** | `lede` | |
| Custom **Display** | `h1` | |
| Custom **Body Small** | `body-sm` | |
| Custom **Caption** | `caption` | |

An Elementor global font style carries a single size; the `h1`/`h2`/`h3` distinction is applied per widget from the scale, using the global style for family/weight/line-height. All seven scale roles have exactly one Elementor representation (enforced by test).

### 4.3 Site Settings

| Setting | Value |
|---|---|
| Layout → Content Width | 1120px (`content-default`) |
| Layout → Breakpoints | defaults Mobile 767 / Tablet 1024 kept (non-deletable per official docs); **activate the optional Laptop breakpoint and set it to 1365px** so Desktop starts at 1366px (matches `docs/SITE-ARCHITECTURE.md` §10 exactly). Mobile Extra / Tablet Extra / Widescreen intentionally not activated |
| Theme Style | Non-Elementor HTML (headings, links, buttons, forms, images) binds to the same tokens |
| Elementor → Settings | Disable default fonts and colors so globals/Theme Style govern typography and color |

### 4.4 Fonts inside Elementor

**Preferred:** Elementor → **Custom Fonts** — upload `Vazirmatn` 400/700 (woff2), native font picker, editable by normal Elementor editing. Official Elementor documentation describes this workflow; secondary sources attribute it to **Elementor Pro** — the free-vs-Pro boundary on the installed real-host version is **NOT VERIFIED**. If the feature is unavailable on the installed edition, the **fallback** is a minimal `@font-face` CSS layer — justified as a required capability (self-hosted Persian font; third-party font CDNs are not acceptable here), not a preference for custom code.

### 4.5 Minimal CSS/JS support — declared needs (not shipped yet)

Elementor cannot express three foundation behaviors; each is justified (behavior/a11y/RTL) and deferred to the theme/child-phase (Phase 4), where it stays **small and documented** — not buried in widgets:

1. `:focus-visible` ring + offset (WCAG 2.2 SC 2.4.7) — no Elementor global control.
2. `prefers-reduced-motion` handling — no Elementor global control.
3. Logical properties (`margin-inline`, `padding-inline`) in any custom CSS — RTL-native flow (`docs/SITE-ARCHITECTURE.md` §9.1/§9.10).

No custom JS is required by this foundation. **Elementor add-on packs are prohibited** unless separately justified and approved. Normal marketing content/components must remain genuinely editable in Elementor (owner direction).

---

## 5. Accessibility foundation

Target: **WCAG 2.2 Level AA** (current W3C Recommendation, 2023-10-05, editorial update 2024-12-12; also ISO/IEC 40500:2025). Concrete defaults:

| Concern | Rule |
|---|---|
| Visible focus | 2px `accent/primary` ring, 2px offset, on every interactive element via `:focus-visible` (white ring on accent fills); never removed without equivalent (SC 2.4.7) |
| Contrast | 4.5:1 normal text / 3:1 large text & non-text UI (SC 1.4.3 / 1.4.11) — token-enforced (§2.2) |
| Headings | One H1 per page; H2 starts each block; H3 intra-block; visual hierarchy = DOM hierarchy (no fake headings for size) |
| Keyboard | Every interactive element reachable and operable; correct focus order = RTL reading order; accordions/tabs use disclosure/tab semantics with `aria-expanded`/`aria-controls`; no keyboard traps; skip-to-content link (header phase) |
| Reduced motion | Motion tokens collapse to 0 under `prefers-reduced-motion`; removing animation never removes affordance |
| Touch targets | WCAG 2.2 SC 2.5.8 minimum **24×24 CSS px**; project policy **≥44×44 px** for primary CTA and nav controls (44 is beyond AA — recorded as project policy, not as a WCAG requirement) |
| Forms | Visible label above field (RTL start-aligned); helper and error text below with **icon + text**; errors linked via `aria-describedby`, invalid fields via `aria-invalid`; required state textual, not color-only |
| RTL reading/order | `dir="rtl"` + `lang="fa"` at document level; logical properties only; visual order = DOM order = tab order; LTR isolation for phones/emails/URLs; no physical left/right hacks, no global `scaleX(-1)` |

Conformance of *rendered pages* is **NOT TESTED** in this slice (no pages exist) — these are the defaults every later slice must build to; verification happens at the first visible slice (Playwright MANDATORY WHEN APPLICABLE per `docs/AGENT-TOOLING.md` §4.5).

---

## 6. Responsive foundation

**Breakpoint contract** (tokens + Elementor): Mobile **320–767**, Tablet **768–1024**, Laptop **1025–1365**, Desktop **1366+**. Elementor’s documented defaults are exactly 767/1024 (non-deletable); the optional Laptop breakpoint at 1365px completes the mapping without touching the defaults. Elementor values cascade top-down (wider → narrower).

**Representative review targets** (per `docs/SITE-ARCHITECTURE.md` §10.1 — review checklist for every future visible slice):

| Target | Viewport | Token behavior |
|---|---|---|
| Mobile | **390×844** | `size_mobile_px` values; content priority A→B→C; no horizontal overflow (`scrollWidth ≤ clientWidth`) |
| Tablet | **768** (portrait) | Tablet layout; independent review, not shrunk desktop |
| Desktop reference | **1366×768** | Desktop layout begins here |
| Large desktop sanity | **≥1920** wide | Content stays within `content-wide`; no stretched text lines |

Principles carried from the contract: mobile-first content prioritization (removal = removing content, not chaotic collapse), no horizontal overflow anywhere, readable measure at every size, media fluid within frames, tables get card-stack/scroll fallbacks, RTL reviewed independently per breakpoint. Browser verification of these targets is **NOT RUN** in this slice (no rendered page) — recorded as a limitation, not a pass.

---

## 7. Performance foundation

Enforceable now (structural; validated or reviewable):

1. **Font budget:** exactly 1 self-hosted family, exactly **2 weights** (400/700), WOFF2 only, `font-display: swap`, zero third-party font requests; committed payload 2 files / 101,704 bytes total (deterministic file size — not a runtime measurement). Enforced by test (≤3 files, weights match files).
2. **No icon font** — one stroke SVG icon family (inline/optimized), semantic and directional only; family choice deferred to first component use.
3. **No autoplay/background video heroes**; video (later) is poster-first, click-to-load (`docs/SITE-ARCHITECTURE.md` §11.4).
4. **Images (later):** responsive `srcset`/dimensions + lazy loading outside first view; WebP/AVIF where compatible.
5. **Minimal third-party scripts:** none in foundation; analytics prohibited until its authorized phase (`docs/ROADMAP.md` §15).
6. **Constrained custom CSS/JS:** only the three declared needs (§4.5); no custom JS in foundation; no Elementor add-on packs.
7. **Elementor weight discipline:** no inline per-page styles (globals only), avoid DOM-heavy widget stacks (`docs/ROADMAP.md` §12).

**Explicitly NOT done:** no production or localhost performance measurements are claimed. Per `docs/ROADMAP.md` §21 (Open Question — Performance Budget), **numeric** payload/font/JS/CWV thresholds remain **Unknown** and must not be guessed until a representative environment and baseline measurement exist (Phase 10). The KB figures above are committed-asset inventory facts, not budget thresholds or load-time claims.

---

## 8. Component token-binding & state policy

Policy-level binding so the next slice designs components on the same substrate (full visual specs = next slice):

| Component area (`docs/SITE-ARCHITECTURE.md` §8) | Binding | States |
|---|---|---|
| Buttons (primary / secondary / tertiary-text) | primary = `accent/primary` fill + `accent/contrast-on-accent` text, radius `sm`, min-height ≥44px; secondary = `surface/card` + `border/strong` + `ink/primary`; tertiary = text/`link` | default, hover (`accent/hover`), active (`accent/active`), focus-visible (ring), disabled (muted, no contrast drop below 3:1 for affordance), loading (in-place) |
| Links | `link` token; underline in body copy; card-link = whole-card pattern | default, hover (`accent/hover`), focus-visible, visited (no playful styling) |
| Cards | `surface/card`, `border/subtle` 1px, radius `md`, optional `shadow/subtle`; variants media-top / content-only | rest, hover (border→`border/strong`; shadow stays subtle) |
| Badges | ≤2 uses (status label only when permitted; grouping); radius `sm`, `caption` type | status variants from success/warning/danger/info + always text |
| Forms | fields `surface/card` + `border/strong`, radius `sm`; labels above (RTL start); helper `ink/muted`; errors `danger` icon+text | default, focus-visible, error, success, disabled |
| Accordions/FAQ | accessible disclosure (button + `aria-expanded`), 1px `border/subtle` separators | collapsed, expanded, focus-visible |
| Tabs | **only** on real content justification; else prohibited as page layout | active (`accent/primary` indicator), focus-visible |
| Media frames | `surface/card` frame + `border/subtle`, radius `md`; caption `caption`/`ink/muted`; ratios 16:10 / 4:3 / 9:16-crop per §11.8 | — |
| Trust/evidence blocks | claim → mechanism → evidence pattern; no fake logos/numbers | — |
| CTA blocks | fit-sentence + primary button + one trust reference; no popups/flying banners | button states as above |
| Alerts | success/warning/danger/info; **icon + text always**; tint fill (low alpha) + matching text color | per status |
| Icons | one stroke family, 24px grid, RTL-mirrored only when directional; no icon font; color from tokens | — |

---

## 9. Version control & reconstruction

- **Canonical:** `design-system/tokens.json` (schema_revision 1) + this spec + font assets with license/checksums. This is sufficient to diff against a future Elementor settings/kit export (global colors/fonts/layout/breakpoints are all named in the `elementor` block).
- **`reconstruction/manifest.json` updated honestly** (schema_revision 2): `design_system` block points at the tokens/spec, records owner acceptance **NOT RUN** and Elementor representation **NOT AVAILABLE**; `artifacts` records the two font files + `OFL.txt` with SHA-256; `expected_inventory.global_settings` now states the canonical expectation. **`clean_import_pilot` and `authorized_pro_host_acceptance` remain `NOT RUN`** (enforced by test — any flip to PASS fails validation).
- **Comparison procedure (future):** export Site Settings via the documented Website Templates settings path (`docs/TECHNICAL-FOUNDATION.md` §1), then diff exported global colors (hex), global fonts (family/weight/size/line-height), content width and breakpoints against `tokens.json` role-by-role. Divergence = drift.
- No Elementor export ZIP is fabricated; raw imports belong in ignored `reconstruction/incoming/` per the reconstruction contract.

---

## 10. Evidence & sources (retrieved 2026-09-28 UTC)

| Source | Used for |
|---|---|
| Elementor Help — *View and edit global colors* (updated 2026-09-10), *View and edit global fonts* (2026-09-15) | System vs custom global colors/fonts; add/rename/delete behavior (full page content retrieved) |
| Elementor Help — *Responsive editing for mobile and tablets* (updated 2026-09-15) | Default breakpoints 1024/767; Site Settings → Layout → Breakpoints; Active Breakpoints options; editable Breakpoint (px); non-deletable defaults; top-down cascade (full page content retrieved) |
| Elementor Blog — *How to Add Custom Fonts to Your WordPress Website* | Custom Fonts upload workflow (Elementor → Custom Fonts). **Free-vs-Pro boundary on the installed version: NOT VERIFIED** (secondary sources say Pro) |
| W3C — WCAG 2.2 (W3C Recommendation 2023-10-05, edited 2024-12-12; ISO/IEC 40500:2025) | Contrast 4.5:1/3:1 (SC 1.4.3/1.4.11), focus visible (2.4.7), target size 24×24 (2.5.8), focus not obscured (2.4.11) |
| https://github.com/rastikerdar/vazirmatn tag `v33.003` (git tree API) | Font files + OFL 1.1; byte-identity via matching blob SHAs |
| `docs/SITE-ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/TECHNICAL-FOUNDATION.md` | All contract-level constraints |

**NOT VERIFIED / NOT RETRIEVED:** real-host WordPress/Elementor/Pro/PHP/DB versions; Elementor Pro capabilities on the installed edition (Custom Fonts, Custom Code); applied Elementor configuration of any kind; rendered-page accessibility, RTL, responsive and performance behavior (Playwright **NOT RUN** — no visible change exists yet); upstream release ZIP vs repo-tree byte-identity (tag tree equality used instead); anything requiring the authorized host.

---

## 11. Change log

| Date (UTC) | Change |
|---|---|
| 2026-09-28 | First version: canonical tokens (18 color roles, 7 type roles, spacing/containers/border/shadow/focus/motion/breakpoints), Vazirmatn 400/700 committed (OFL-1.1), Elementor mapping spec, WCAG 2.2 AA accessibility foundation, responsive targets, performance foundation, reconstruction metadata (manifest schema_revision 2), static validation with WCAG contrast math + integrity checks |
