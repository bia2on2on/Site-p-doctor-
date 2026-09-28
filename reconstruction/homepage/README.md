# Milestone A — native Free homepage reconstruction

**TARGET — NOT PUBLICATION-APPROVED.** Development/CI only. No product repository access, host access, Pro installation, website kit, or database dump is involved.

## Source and supported mechanism

`recipe.mjs` is the canonical **authoring recipe**, not Elementor database JSON and not a claimed Elementor export. Its small `{kind, name, settings, children}` tree is our input format. The browser runner creates each empty element with the public editor **Create** command, applies native controls with **Settings**, and asks Elementor to **Publish**. Elementor creates identifiers, maintains editor history, serializes and persists its own document. There are no writes to private Elementor post metadata, internal REST/AJAX endpoints, internal commands, or hand-assembled template ZIPs.

Official sources retrieved 2026-09-28:

- [Commands API](https://developers.elementor.com/docs/js/commands/) — `$e.commands.getAll()` and `$e.run()`, distinction between USER and INTERNAL commands.
- [Vendor Elements component documentation](https://github.com/elementor/elementor/blob/721be1e3374140deef562933db9756641ecc2872/docs/assets/dev/js/editor/document/elements/readme.md) — documented Create and Settings commands, `elementor.getPreviewContainer()`, `Container.children`, command arguments/return value. This exact revision was retrieved, not inferred from a private database.
- [Vendor Document documentation](https://github.com/elementor/elementor/blob/721be1e3374140deef562933db9756641ecc2872/docs/assets/dev/js/editor/document/component.md) — document/container access, Save component responsibility.
- [Container data model](https://developers.elementor.com/docs/data-structure/container-element/) and [widget model](https://developers.elementor.com/docs/data-structure/widget-element/) — native element type discrimination, not a license to fabricate an export.
- [Responsive data](https://developers.elementor.com/docs/data-structure/responsive-data/) — documented `_tablet`/`_mobile` keys; validation requires a registered responsive base control and active device (newer versions create device duplicates in the editor).
- [Native Controls Stack public API](https://github.com/elementor/elementor/blob/721be1e3374140deef562933db9756641ecc2872/includes/base/controls-stack.php) — `get_controls()`; the runner validates **every setting key against the installed Free elements' controls** before creating anything. Unrecognized controls stop reconstruction instead of silently inventing schema.
- [Template library](https://elementor.com/help/template-library/) — manual export/save remains available for selective reuse. No vendor export is claimed or required by this slice.

Only Free **container, heading, text-editor and button** elements are used. There is no HTML/shortcode widget wrapping a hardcoded page, custom widget, add-on pack or Pro dependency. Text, responsive layout, colors, spacing and buttons are visible/editable through native Elementor controls. The neutral media frame is native text inside a container, not an image of invented product UI.

## Clean reconstruction

Requirements: Node **22+**, Docker, `@wordpress/env@11.16.0`, internet for pinned public packages. Run from repository root on a **fresh disposable environment**:

```sh
npm ci --prefix tests/browser
export PATH="$PWD/tests/browser/node_modules/.bin:$PATH"
wp-env start
bash tests/wp-env/smoke.sh
(cd tests/browser && npx playwright install --with-deps chromium)
node tests/browser/homepage.mjs
```

The runner accepts only the default local wp-env home URL. It refuses to overwrite an existing `cpms-home` page. Do not run against a shared/host environment. It rotates the ephemeral admin password in memory (not logged or saved), keeps the site Persian/RTL and admin UI English, sets `blog_public=0`, creates one draft page through WP-CLI, chooses the **Elementor content** theme template, authors/publishes via the real editor, sets it as the front page, flushes Elementor CSS with the official CLI, reopens the editor and validates persistence, then tests anonymously. `publish` here is a WordPress database status inside the disposable localhost fixture, **not a public deployment**. Noindex is not authentication; this runner does not provision public staging.

`wp-env destroy` can remove **that disposable runtime** when finished. It is not a source reconstruction dependency. On a changed recipe use a fresh runtime; the script intentionally does not implement destructive overwrite/migration.

## Design and ownership

- `design-system/tokens.json` supplies every authored color/type/spacing value. The recipe binds those values to native controls, including tablet/mobile overrides. No custom homepage layout CSS is used.
- **Scoped deviation from the future full-site global mapping:** this first Free fixture resolves token values into native controls, rather than claiming the Pro/site-settings kit has been applied. Existing `elementor.status` and kit/global-settings evidence remain unchanged. Changing source tokens and rebuilding updates all recipe instances; editing one widget in Elementor affects that widget. A live global Site Settings round-trip is **not proven** here and remains separate work. This tradeoff avoids writing private kit/settings metadata.
- Koorosh owns only semantic `main`, title suppression through an explicit WordPress page template, editable excerpt → description, self-hosted type, no-remote-font policy, focus and neutral fallback shell. It does not contain homepage copy/composition. The final header/footer are not built.
- Title is the WordPress page title; description is its editable excerpt. Home is brand/positioning/routing, not a second keyword-led Product Overview. Only existing page anchors are linked; Product/Demo pages are not fabricated.
- Hero CTA routes to `#demo-consultation`, with an explicit no-submission notice. It does **not** pretend to register a lead. Authorized contact/form delivery is still required before launch.
- Hero media is early and explicitly says it is not a screenshot. Later media context explains what evidence must replace it. No PHI, customer imagery, generated UI, photos or video.

## Evidence and limitations

CI extends, rather than replaces, the existing smoke job. Artifact name: `homepage-evidence-<exact PR head SHA>`; retention: 14 days. Paths inside the artifact:

- `mobile.png`, `tablet.png`, `desktop.png`, `large-desktop.png` — full page;
- corresponding `*-viewport.png` — first viewport;
- `editor.png` — reopened Elementor editor;
- `authoring.json`, `native-controls.json`, `results.json` — created native elements, installed control-key evidence, runtime/geometry/network/focus results;
- `failure-editor.png` on a browser failure when possible.

Artifacts are ignored locally, not binary additions to Git. No traces/storage state/credentials/DB dumps are uploaded. A generated screenshot is **not** automatically a visual review: the PR report must say which images were actually opened and inspected. See `docs/MILESTONE-A-HOMEPAGE.md` and PR evidence for actual run outcomes.

**Not implied:** host/Pro acceptance; authorized clean-import pilot; kit export/import; final global-settings round-trip; launch truth; final media/contact availability; production SEO/performance; full WCAG conformance or assistive-technology audit. The host pilot remains **NOT RUN**, and this runner never retries it.

### CI dependency-resolution boundary

`tests/browser/package-lock.json` locks the existing `@wordpress/env@11.16.0` plus Playwright tooling. The `@wp-playground/cli` transitive range is constrained to **3.1.54**: CI at `bc3d227153728812f8eb51d459d84f4410f2f8af` failed with npm ETARGET for the just-resolved `@php-wasm/node@3.1.56`; 3.1.55 also raises its Node engine above this tooling environment. Registry inspection confirmed 3.1.54 supports Node ≥20.10 and npm ≥10.2.3. This fixture requires Node 22+. Docker remains the only WordPress runtime; no Playground substitution, WordPress/Elementor pin change, Pro package or application dependency is introduced. Use `npm ci`, not a floating global install, for this slice.

### Visual review limitation in this sandbox

Two clean CI runs produced the requested screenshots and passed browser assertions. The reviewer sandbox cannot download the artifact blobs. A bounded alternate notice transport was tried, but the retrieved messages were truncated (4096 bytes and only ten notices), so no image could be reconstructed or honestly inspected. That unsuccessful workaround was removed; standard PNG artifacts remain the maintainable evidence path. **Visual inspection / Milestone A acceptance remain NOT VERIFIED**, distinct from passing automated browser checks. Review the artifact through GitHub or an environment with artifact-download access before merge.
