# نوبت، پذیرش و صف — native Elementor Free reconstruction

**TARGET — NOT PUBLICATION-APPROVED.** The current task explicitly authorizes this bounded workflow slice using the accepted Milestone A direction and Free reconstruction pattern; it does not open the publication gate, complete Reception, or satisfy the Pro/kit pilot. Older planning/pilot and visual-acceptance snapshots are not upgraded by this work.

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
```

This runner requires the three preceding pages; the later patient-record/continuity slice (`../patient-record-continuity/README.md`) now runs after it in CI. It refuses an existing workflow slug, validates every native control, creates an empty WP draft, authors via public Elementor Create/Settings/Publish commands, reopens the persisted editor, and verifies native editability. It establishes `/%postname%/` URLs and restores the **actual Homepage** at `/` after the older per-page runners. Product Overview supplies the inbound native text link. The integrated fixture verifies that link, `/demo/`, `/product-overview/` and `/` by browser navigation and page identity. `blog_public=0` remains set; WordPress `publish` in this localhost fixture is not public launch. Do not run against shared or production data.

## Editing and ownership

- `recipe.mjs` is our authoring recipe, not serialized Elementor DB data, kit ZIP or vendor export. Native containers, headings, text and buttons remain editable in Elementor Free. No PHP page copy, new frontend JS/CSS, Pro widget or extra plugin.
- Native controls receive canonical token values as in previous recipes; this is **not** a global Site Settings round-trip.
- WordPress title and excerpt are the editable title/description sources through the existing Koorosh mechanism. No SEO plugin or new keyword-demand research.
- Two explicitly disclosed media reservations, `media-appointment-surface` and `media-reception-surface`, should be replaced in Elementor with verified real CPMS screenshots containing **only synthetic/demo data**, retaining meaningful captions/alt text. Neither current frame is a screenshot.
- Reception scope, onward doctor context and all other copy remain bounded by `claims.md`. Tests check website composition/guardrails, never product capability truth.

## Evidence and limitations

CI captures `tests/browser/artifacts/appointment-reception-queue/`: editor screenshot, four full-page and first-viewport PNG pairs, native-control inventory, authoring inventory and `results.json`. The shared Actions artifact is `page-evidence-<exact head SHA>`; retention 14 days. Browser assertions cover 390×844, 768×1024, 1366×768 and 1920×1080, heading hierarchy, font/reading geometry, RTL horizontal-to-vertical rail, non-fabricated reserved media, focus/keyboard CTA, working destinations, overflow and frontend console/network errors. Capturing images is not the same as inspecting them.

Failure history for PR #16: first run at `5de245de5361ee8ab1cd7f2b8c6687cf31420e37` exposed a mobile CTA below the first viewport (**A**); moving actions before the flow strip fixed it. Run at `9aec02dd41123be6b8df843144dc40266d2be723` passed all four viewport/geometry checks, then hit lowercase Playwright `tab` (**D**); corrected to `Tab` without weakening the keyboard assertions. Log-blob download was unavailable (**C**); exact-SHA annotations supplied the diagnosis. Final-head results belong in the PR report.

**Still blocked before launch:** (1) verified real CPMS media replacing both reservations; (2) authorized, configured live lead delivery. Product launch truth, authorized host/Pro acceptance, clean kit import, production SEO/performance and full accessibility/assistive-technology audit remain separate and unproven here.
