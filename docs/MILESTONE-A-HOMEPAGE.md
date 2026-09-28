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
- Local static suite initially reached a missing PyYAML parser (class C environment), not a homepage regression. Configuration/token/manifest/homepage checks ran; workflow parsing must be checked separately or in CI.
- CI uses existing pinned WordPress/Free Elementor, validates native controls before authoring, persists/reopens the document, checks configured front page and theme/plugin state, HTTP, H1/metadata/RTL, local font loading, no endpoint/media fabrication, keyboard/focus/anchor behavior, overflow, external/failed requests and JS errors at 390×844, 768×1024, 1366×768 and 1920×1080.
- Actual CI conclusions and inspected screenshot evidence must be bound to the final PR head/run in the PR report. A pending test or screenshot file is never a PASS.

## Still NOT RUN / NOT VERIFIED

Authorized host/Pro acceptance and clean-import pilot, vendor kit export/import, Site Settings globals/breakpoint round-trip, launch truth, real product media, authorized lead delivery, production CWV/SEO, manual screen-reader audit, Safari/Firefox. Design tokens and direction remain provisional until Milestone A visual acceptance. This PR must remain **OPEN**, not auto-merged.
