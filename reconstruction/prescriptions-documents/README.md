# نسخه‌ها و اسناد در CPMS — native Elementor Free reconstruction

**TARGET — NOT PUBLICATION-APPROVED.** This bounded slice authorizes one further representative capability page — recording and managing prescriptions and documents **inside CPMS**, beside the patient record and the connected clinic workflow, written for clinic decision-makers — using the accepted Milestone A direction and the established Free reconstruction pattern. It does not open the publication gate, does not verify product capability, and does not satisfy the Pro/kit pilot. The page never presents in-CPMS recording as a national e-prescription, insurance, pharmacy or other external connection; the distinction is part of what the tests assert.

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
node tests/browser/doctor-workspace.mjs
node tests/browser/patient-portal.mjs
node tests/browser/prescriptions-documents.mjs
```

This last runner requires all seven preceding pages: it refuses an existing `prescriptions-documents` slug, validates every native control against the installed Elementor before creating anything, creates an empty WP draft, authors via the public Elementor Create/Settings/Publish commands, reopens the persisted editor, and verifies native editability. It re-establishes `/%postname%/` and restores the **actual Homepage** at `/`, follows the inbound native text link from Product Overview («نسخه‌ها و اسناد در CPMS»), follows this page's own contextual links by clicking them (doctor workspace, patient record) and the hero CTA by keyboard (demo), and finally re-visits **every earlier page** to confirm it still serves its own authored H1. `blog_public=0` remains set; WordPress `publish` in this localhost fixture is not public launch. Do not run against shared or production data.

Static-only (no WordPress needed): `bash tests/static/validate.sh`, which includes `tests/static/validate-prescriptions-documents.mjs` and the shared wording guard `tests/static/boundary-prescriptions-documents.mjs`.

## Editing and ownership

- `recipe.mjs` is our authoring recipe, not serialized Elementor DB data, kit ZIP or vendor export. Native containers, headings, text and buttons stay editable in Elementor Free. No PHP page copy, no new frontend JS/CSS, no Pro widget, add-on pack or extra plugin, and no native control that an earlier page had not already exercised in CI.
- Composition is deliberately distinct from the earlier pages: a full-band H1 above a copy/media hero, then a **context ledger** (doctor work → patient context → prescription/document record, plus an explicit «outside CPMS» row) rather than a stage rail, hand-off strip or two-sided model, then bounded prescriptions, documents/files, access and non-claim sections. All scope clarifications share one boundary language (tint + accent inline-start rule + text label, at reading size).
- Native controls receive canonical token values as in previous recipes; this is **not** a global Site Settings round-trip.
- WordPress title and excerpt remain the editable title/description sources through the existing Koorosh mechanism. No SEO plugin and no new keyword-demand research.
- Two explicitly disclosed media reservations, `media-prescription-surface` (prescription/document context, hero) and `media-document-context-surface` (document beside patient context), should be replaced in Elementor with verified real CPMS screenshots containing **only synthetic/demo data**, keeping meaningful captions and alt text. Neither frame is a screenshot today, and neither pretends to be a prescription, a document or a national-system screen.

## Evidence and limitations

The browser runner writes `tests/browser/artifacts/prescriptions-documents/`: editor screenshot, four full-page and first-viewport PNG pairs, native-control inventory, authoring inventory and `results.json`. Assertions cover 390×844, 768×1024, 1366×768 and 1920×1080: HTTP/metadata/RTL, one H1 with heading order and the two-line desktop H1 policy, local font loading, reading-copy geometry, the context ledger's geometry (rows in order without overlap; layer right of meaning in one RTL row above tablet, stacked below; record row emphasised; boundary row distinct), visible reading-size clarifications, the three-block non-claim row, non-fabricated reserved media, keyboard focus on the primary CTA, working destinations, no horizontal overflow, no offsite requests, no frontend console/network errors, and the rendered-text claim boundary (external-system wording only negated or asked; the internal-versus-national distinction verbatim). **Capturing images is not the same as inspecting them**; no visual inspection is claimed here.

Local runtime status for this slice: **NOT RUN** — this sandbox has Node.js but no Docker, PHP, `wp` CLI or browser (and no route to the WordPress.org, Playwright or GitHub release-asset download hosts), so only static validation, JS/shell syntax and diff checks are performed locally. Authoritative proof for this page is the exact-head CI run recorded in the PR; a green CI run is CI evidence, not host acceptance and not product capability proof. Text guardrails are not product capability verification.

**Still blocked before launch:** (1) verified real CPMS media replacing both reservations; (2) authorized, configured live lead delivery. Product launch truth, authorized host/Pro acceptance, clean kit import, production SEO/performance and full accessibility/assistive-technology audit remain separate and unproven here.
