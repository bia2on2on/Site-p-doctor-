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

Run `36407232451`, head `0367545f042a05a96ea049350d921e3fa6c1cf57`: static and foundation runtime PASS; all native-control validation passed and Chromium reached the editor. Fixture command discovery used object lookup instead of the public `getAll()` return type, a sorted array of command names (**D**). Fixed membership with `includes()` and waited for all required user commands to be registered. Source: Elementor 4.3.2 `modules/web-cli/assets/js/core/commands.js`. No command implementation was changed or bypassed.

## First complete browser pass

Run `36407580896`, exact head `b3868092b10d040f2fb1b284e4c9febe24e667c6`: **both checks SUCCESS**. Foundation smoke **33/33**, plus real Chromium authoring/persistence and anonymous frontend checks at **390×844, 768×1024, 1366×768, 1920×1080**. Front page ID 7, `show_on_front=page`, Elementor editable true, theme `koorosh`, Free Elementor 4.3.2, `fa_IR`, `blog_public=0`; 78 native elements survived editor reload. HTTP/H1/metadata/local font/keyboard focus/CTA/overflow/network assertions passed. Artifact **10963151652**, `homepage-evidence-b3868092b10d040f2fb1b284e4c9febe24e667c6`, 1,552,225 bytes.

Visual inspection was initially **NOT RUN** despite screenshot capture: the sandbox cannot reach GitHub's Azure artifact download host (**C**), including a direct Actions API download attempt. A capped, opt-in anonymous JPEG Checks-API evidence transport was added to allow actual inspection without adding services, permissions or committing screenshot binaries. Visual findings must be recorded only after opening those images.

## Second clean pass and remaining visual-review blocker

Run `36408122593`, exact head `20e298b059df41c6495266680e0a48cd4a8f6cce`: **both checks SUCCESS**, including the same persisted native-page, four-viewport and frontend assertions. Artifact **10963885205**, `homepage-evidence-20e298b059df41c6495266680e0a48cd4a8f6cce`, 1,888,722 bytes. This proves a second fresh Free reconstruction, **not** the unrelated Pro/kit clean-import pilot.

The attempted JPEG Checks-API transport was not usable: retrieved messages were truncated to 4096 bytes and ten image notices; concatenation validation correctly refused to produce incomplete images (**C**, evidence-retrieval environment). It was removed rather than growing a custom transport subsystem. **No screenshot has been visually inspected by this agent.** Do not equate automated no-overflow/focus/RTL checks with visual design approval. The first major visual review must inspect `mobile.png`, `tablet.png`, `desktop.png` and corresponding viewport captures in the standard artifact before merge. Final-head checks/artifact ID are recorded in PR #13 after the final push.

### Milestone A handoff

- Functional implementation and native Free editability: exercised in real Chromium/WordPress, two clean successful runs above.
- Visual inspection and owner acceptance: **NOT VERIFIED / NOT RUN**; blocked only on this sandbox's artifact retrieval, not claimed complete.
- Screenshot creation: **RUN** at all four target sizes; not fabricated, not a PHP/static substitute.
- Pro host/pilot, kit/global-settings round-trip, real product media, real lead endpoint, launch approval, production performance and full accessibility audit: unchanged separate gates.
- Leave PR #13 **OPEN**. No merge or deployment authorized by these results.

## Product Owner visual revision — continuing PR #13

**Previous head:** `7c71f6c8a8be6e9b9201a2ada0a93f7a6027eeff`. Live GitHub confirmed PR OPEN on the same branch, main unchanged at `99e743596481c34447af3d8a136239dd521f9652`, no competing PR. The restored local checkout was at main with the previous PR files uncommitted; all 39 files matched the authoritative PR head byte-for-byte, with no extra untracked files. Preserved that restored snapshot in a named stash and fast-forwarded the same branch, without resetting/discarding work or creating another branch.

**Owner evidence:** actual mobile/tablet/desktop screenshots reviewed; basic hero message, natural RTL, calm palette, sequence and consultation direction accepted. **Milestone A is NOT VISUALLY ACCEPTED.** This supersedes earlier “owner review not run” context; agent image inspection remains a separate fact. The reference was described as inspiration in the task; no reference image file was present in this turn, and no factual/visual product evidence was inferred from it.

Revision: stronger native reserved-media frame (no fake UI); wider, 18px/1.9 mobile reading copy and shorter paragraphs; connected numbered workflow rail (horizontal RTL at tablet/desktop → vertical at mobile); 48px desktop section rhythm; split editorial layouts and compact bounded product/objection grouping; an emphasized but honest consultation panel. No changes to theme PHP/CSS, plugins, runtime pins, production assets or the authoring mechanism. Added browser assertions for the requested changes without dropping any existing assertions. New screenshots use the existing artifact mechanism and filenames. Exact new head/checks/artifact and any failure diagnosis are recorded in the PR report after execution. No merge.
