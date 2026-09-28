# پرونده بیمار و تداوم اطلاعات — native Elementor Free reconstruction

**TARGET — NOT PUBLICATION-APPROVED.** This bounded slice authorizes one further representative workflow page using the accepted Milestone A direction and the established Free reconstruction pattern; it does not open the publication gate, does not verify product capability, and does not satisfy the Pro/kit pilot.

## Rebuild

Follow the tool/runtime prerequisites in `../homepage/README.md`. On a **fresh disposable** default wp-env install, from repository root:

```sh
npm ci --prefix tests/browser
export PATH="$PWD/tests/browser/node_modules/.bin:$PATH"
wp-env start
bash tests/wp-env/smoke.sh
(cd tests/browser && npx playwright install --with-deps chromium)
node tests/browser/homepage.mjs
node tests/browser/product-overview.mjs
node tests/browser/demo.mjs
node tests/browser/appointment-reception-queue.mjs
node tests/browser/patient-record-continuity.mjs
```

This last runner requires all four preceding pages: it refuses an existing workflow slug, validates every native control, creates an empty WP draft, authors via the public Elementor Create/Settings/Publish commands, reopens the persisted editor, and verifies native editability. It re-establishes `/%postname%/` and restores the **actual Homepage** at `/`, then proves the inbound native text link from Product Overview to this page, and this page's outbound links to `/demo/`, `/product-overview/` and `/appointment-reception-queue/` by browser navigation and page identity. `blog_public=0` remains set; WordPress `publish` in this localhost fixture is not public launch. Do not run against shared or production data.

## Editing and ownership

- `recipe.mjs` is our authoring recipe, not serialized Elementor DB data, kit ZIP or vendor export. Native containers, headings, text and buttons stay editable in Elementor Free. No PHP page copy, new frontend JS/CSS, Pro widget, add-on pack or extra plugin.
- Native controls receive canonical token values as in previous recipes; this is **not** a global Site Settings round-trip.
- WordPress title and excerpt remain the editable title/description sources through the existing Koorosh mechanism. No SEO plugin and no new keyword-demand research.
- Two explicitly disclosed media reservations, `media-record-surface` (patient record / doctor context) and `media-document-surface` (document and workflow context), should be replaced in Elementor with verified real CPMS screenshots containing **only synthetic/demo records**, keeping meaningful captions and alt text. Neither frame is a screenshot today.

## Evidence and limitations

The browser runner writes `tests/browser/artifacts/patient-record-continuity/`: editor screenshot, four full-page and first-viewport PNG pairs, native-control inventory, authoring inventory and `results.json`. Assertions cover 390×844, 768×1024, 1366×768 and 1920×1080, HTTP/metadata/RTL, one H1 with heading order, local font loading, reading-copy geometry, the RTL horizontal-to-vertical continuity rail, non-fabricated reserved media, keyboard focus on the primary CTA, working destinations, no horizontal overflow, no offsite requests and no frontend console/network errors. **Capturing images is not the same as inspecting them**; no visual inspection is claimed here.

Local runtime status for this slice: **NOT RUN** — this sandbox has Node.js 22.22.3 but no Docker, PHP, `wp` CLI or browser, so only static validation, JS/shell syntax and diff checks are performed locally. Authoritative proof for this page is the exact-head CI run recorded in the PR; a green CI run is CI evidence, not host acceptance and not product capability proof.

**Still blocked before launch:** (1) verified real CPMS media replacing both reservations; (2) authorized, configured live lead delivery. Product launch truth, authorized host/Pro acceptance, clean kit import, production SEO/performance and full accessibility/assistive-technology audit remain separate and unproven here.
