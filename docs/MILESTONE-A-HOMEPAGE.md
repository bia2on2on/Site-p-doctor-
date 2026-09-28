# Milestone A — homepage direction (2026-09-28)

## Starting live state

- Repository: `bia2on2on/Site-p-doctor-`; verified root `/home/user/Site-p-doctor-`.
- Authoritative default `main`, fetched SHA `99e743596481c34447af3d8a136239dd521f9652`.
- Working branch: `arena/01a0e763-site-p-doctor`; initial worktree clean including untracked; open PRs: **none**.
- Existing main smoke run `36404515836`: **success** (historical foundation evidence, not evidence for this page).
- Current task explicitly authorizes this homepage implementation. It supersedes the historical “pilot gates normal page work” statement **only for this Free/version-insensitive slice**. The inaccessible authorized Pro pilot is not retried. Publication remains closed.

## Deliverable

Persian/RTL homepage authored with native Elementor Free elements through the official public editor Commands API. Reproducible source, ownership details, cited vendor documentation and exact commands: [`reconstruction/homepage/README.md`](../reconstruction/homepage/README.md). Copy evidence: [`claims.md`](../reconstruction/homepage/claims.md).

Story: compact hero + honest early product-media frame → recognizable clinic coordination problem → bounded connected workflow → media/evaluation context → primary/secondary audience fit → operational objections → safe demo/consultation anchor. Calm token-bound teal, local Vazirmatn, open section rhythm instead of a decorative hero/card wall. No other page, final shell, Pro widget, form, SEO plugin, analytics or product change.

Koorosh remains a semantic/performance/accessibility shell. The WordPress title/excerpt are metadata sources; the page's H1 and all marketing layout/copy live in Elementor. A dedicated selectable template prevents duplicate theme/editor H1s without hiding headings with CSS.

## Validation contract and actual local evidence

- `node tests/static/validate-homepage.mjs`: PASS when authored (78 native elements; one H1; anchored links; forbidden-copy guardrails). This is not a semantic claim audit substitute.
- JS syntax and shell syntax: run before push; exact PR checks supersede this local note.
- Local full WordPress/PHP/browser runtime: **NOT RUN**. No PHP/Docker initially; a single bounded package-install attempt failed because OS package mirrors were unreachable. No private host attempt made.
- Independent YAML parsing with `yaml@2.8.1`: PASS; tokens 70/70 and host manifest 38/38 checks: PASS.
- Local static suite initially reached a missing PyYAML parser (class C environment), not a homepage regression. Configuration/token/manifest/homepage checks ran; workflow parsing must be checked separately or in CI.
- CI uses existing pinned WordPress/Free Elementor, validates native controls before authoring, persists/reopens the document, checks configured front page and theme/plugin state, HTTP, H1/metadata/RTL, local font loading, no endpoint/media fabrication, keyboard/focus/anchor behavior, overflow, external/failed requests and JS errors at 390×844, 768×1024, 1366×768 and 1920×1080.
- Actual CI conclusions and inspected screenshot evidence must be bound to the final PR head/run in the PR report. A pending test or screenshot file is never a PASS.

## Still NOT RUN / NOT VERIFIED

Authorized host/Pro acceptance and clean-import pilot, vendor kit export/import, Site Settings globals/breakpoint round-trip, launch truth, real product media, authorized lead delivery, production CWV/SEO, manual screen-reader audit, Safari/Firefox. Design tokens and direction remain provisional until Milestone A visual acceptance. This PR must remain **OPEN**, not auto-merged.

## First CI diagnosis

Run `36405743853`, head `743f0435ff1ac313e98743163987f67dc2743a53`: existing runtime smoke **33 passed / 0 failed**, including PHP lint. Static failure **D**: the homepage record extended a closed host-manifest schema. Fixed by keeping a separate `reconstruction/homepage/manifest.json`; the existing host schema and honesty checks remain untouched. Browser reconstruction failed before screenshot generation; no visual PASS claimed. Log-blob retrieval is unavailable from the sandbox (**C**); early-error artifact/annotation reporting added for bounded diagnosis, not to suppress failures.

Run `36406080475`, head `6d538d6dbc3eceed3da9325dde90ff58cf0489c1`: static PASS; existing smoke 33/33 PASS. Reconstruction stopped on `container.flex_direction` validation (**D**, fixture): Elementor 4.3.2's documented public `get_controls(null)` omits lazy style controls in CLI context, while `get_controls($key)` explicitly resolves both regular and style controls. Corrected validation to query each requested control individually, preserving fail-closed behavior. Source evidence: versioned `includes/base/controls-stack.php` and `includes/controls/groups/flex-container.php`; no private schema was written or bypassed.

Run `36406453044`, head `a75520ca786fa05a76927f612700711ff7572424`: static PASS; runtime stopped during the unchanged `@wordpress/env` package bootstrap before WordPress/browser work (**C**, infrastructure; detailed log blob unavailable). One failed-job rerun request was rejected by GitHub (“cannot be rerun”); no repeated rerun loop. Added bounded package-bootstrap annotations for actionable evidence. This is unrelated to the private-host pilot, which remains untouched.

Run `36406578641`, head `bc3d227153728812f8eb51d459d84f4410f2f8af`: static PASS; bootstrap annotation identifies npm **ETARGET** for transitive `@php-wasm/node@3.1.56` (**C**). Bounded correction: keep wp-env 11.16.0, lock tooling and constrain its existing Playground CLI transitive range to published/Node-compatible 3.1.54. `npm ci` and `wp-env --version` then ran locally; no WordPress/plugin/runtime pins changed. Package-lock presence is not browser proof.

Run `36406804714`, head `9e43dda8dc39803d8f294d7cdbc62ead7be259e3`: dependency bootstrap fixed; static and existing 33-check runtime smoke PASS. Responsive control validation stopped before page creation (**D**): recent Elementor creates device duplicates in JavaScript, not CLI. Validator now accepts only the officially documented `_mobile`/`_tablet` suffix when its base control is registered as responsive and the device is active; unknown settings still fail together in one report. No private metadata writes or feature-flag changes.
