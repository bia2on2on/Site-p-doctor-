# Site shell — navigation & conversion routing reconstruction

**TARGET — NOT PUBLICATION-APPROVED.** Development/CI only.

## What this slice is

The P0 sales-shell slice that unifies the already-implemented pages
(`/`, `/product-overview/`, `/demo/`, the five workflow/capability pages and the
global FAQ / buyer-objection page) into one coherent site:

- a real WordPress **primary menu** (`menu.mjs` → WP-CLI `wp menu` commands in
  `tests/browser/site-shell.mjs`) assigned to the Koorosh `primary` location;
- a compact truthful **footer menu** assigned to the `footer` location. The FAQ
  (`/faq/`), Security & Data Access (`/security-data-access/`), Privacy
  (`/privacy/`), and Website Terms (`/terms/`) pages are discovered from the
  footer menu alongside the primary conversion routes (`SITE-ARCHITECTURE §6.4`);
  they are deliberately **not** top-level header items;
- a Koorosh fallback **header** (identity + primary nav + persistent
  `/demo/` CTA) with an accessible, progressively-enhanced mobile toggle and a
  compact accessible workflows submenu (`themes/koorosh/header.php`,
  `themes/koorosh/nav.js`, `themes/koorosh/foundation.css`);
- conversion-routing corrections in the canonical page recipes: Homepage and
  Product Overview demo CTAs now route to `/demo/`; the Demo page links back
  to `/product-overview/`. Workflow pages already routed to `/demo/` and are
  unchanged narratively.

`menu.mjs` is the canonical structure. CI reconstructs it via documented
WP-CLI menu commands (`wp menu create`, `wp menu item add-post`,
`wp menu item add-custom`, `wp menu location assign`) — no hand-written menu
HTML, no database payload. The theme never hardcodes menu destinations except
the shell-level `/demo/` CTA.

## Progressive enhancement contract

- Without JavaScript the full menu renders expanded and desktop submenus open
  via CSS `:hover` / `:focus-within`; the toggle button stays hidden.
- With JavaScript (`html.koorosh-js`, set by `nav.js` before paint) the mobile
  menu collapses behind an explicit `aria-expanded` toggle and each
  `.menu-item-has-children` gains an explicit `.submenu-toggle` button.
  Escape closes and returns focus; submenu links are plain crawlable anchors.

## Elementor Pro boundary

`elementor_theme_do_location('header'|'footer')` keeps precedence: when
Elementor Pro Theme Builder renders those locations, this entire fallback
(shell nav, toggle, CTA) is not emitted. The WordPress menus and their
location assignments remain valid reusable data for any later header.

## Honesty boundaries

- Live lead delivery remains **NOT CONFIGURED / NOT AUTHORIZED**; navigation
  to `/demo/` never implies a request reaches Sales, and the demo page keeps
  its non-live disclosure.
- No contact data, address, company registration numbers, social links, logo
  artwork, or phone numbers are invented anywhere in this slice.
