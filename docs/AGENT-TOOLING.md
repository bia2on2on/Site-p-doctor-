# AGENT-TOOLING.md — Agent Tooling Governance for This Repository

**Status:** Operational tooling policy — **documentation only**

**Date of this version:** 2026-09-27 (UTC)

**Related:** `AGENTS.md` (operational entry point, gates, evidence rules) · `docs/ROADMAP.md` (planning baseline, gates, DoD)

---

## 1. Purpose

This document defines the adoption status, boundaries and evidence requirements for the five approved agent tools (Context7, UI Skills, Strix, Supabase, Playwright CLI).

It **does not** authorize: website implementation, tool installation, dependency installation, MCP configuration, API key retrieval/storage, or any architecture change. Tooling readiness is **not** implementation authorization — the implementation gate (`AGENTS.md` §14) and publication gate (`AGENTS.md` §14.1) apply unchanged.

## 2. Authority hierarchy

1. Accepted project architecture/decisions (owner decisions, roadmap, gates) and **actual project versions**;
2. Authoritative official vendor documentation;
3. Agent tools (Context7, UI Skills and their outputs) as **retrieval/convenience aids**.

Rules:

- No tool output authorizes a dependency upgrade or justifies a new library by itself.
- No tool overrides actual project versions, WordPress/Elementor/vendor documentation, Product Owner decisions, or the approved design direction.
- Tool output is not project evidence: exact-SHA evidence rules (`AGENTS.md` §12) still apply to all claims.

## 3. Adoption and setup matrix

| Tool | Adoption | Setup status (environment snapshot, 2026-09-27 UTC) |
|---|---|---|
| Context7 | **CONDITIONAL** | SETUP REQUIRED |
| UI Skills | **REFERENCE ONLY** | REFERENCE retrieval currently possible; no production dependency |
| Strix | **CONDITIONAL** | SETUP REQUIRED |
| Supabase | **REFERENCE ONLY** | **NO SETUP AUTHORIZED** |
| Playwright CLI | **MANDATORY WHEN APPLICABLE** (where the execution environment permits) | SETUP REQUIRED |

Setup statuses are **environment snapshots, not permanent truths**. Future agents must verify the environment and tool versions live before setup/use. This document alone authorizes no installation, configuration, or key retrieval.

## 4. Tool boundaries

### 4.1 Context7 — CONDITIONAL

Agents must **not guess important/version-sensitive APIs from model memory** when authoritative documentation can be retrieved.

Context7 must never:

- authorize dependency upgrades;
- override the actual project version;
- override WordPress/Elementor/vendor documentation;
- justify a new library by itself.

Before using version-sensitive APIs, report: documentation consulted; targeted project/library version; compatibility conclusion. If Context7 coverage is unavailable or uncertain, use official documentation directly.

Never send secrets, credentials, PHI, patient data, or private product content to third-party documentation services.

### 4.2 UI Skills — REFERENCE ONLY

Use only as **subordinate frontend/design guidance**. It may help with: hierarchy; typography; spacing; consistency; accessibility; responsive design; UI states; motion/performance guidance.

It may **NOT** override: Product Owner decisions; approved brand direction; design system; Persian/RTL requirements; accessibility contract; conversion strategy; WordPress/Elementor constraints; performance contract.

A skill must not introduce Tailwind, GSAP, 3D libraries, frameworks, or dependencies merely because its example uses them.

Agents using UI Skills must report: skill/pattern consulted; problem it addressed; compatibility with the current design direction; important recommendations intentionally rejected.

### 4.3 Strix — CONDITIONAL (active/intrusive security testing)

**Never run it automatically.** Before a Strix scan, require:

- explicitly authorized, project-controlled target;
- non-production environment unless the Product Owner separately authorizes otherwise;
- bounded scope;
- bounded scan mode/budget;
- credential/secret handling plan;
- confirmation that generated patches/fixes will **NOT** be automatically applied or merged.

Never: scan unrelated/third-party targets; auto-apply fixes; auto-merge generated security PRs; treat a clean result as proof of complete security.

**No Strix scan in the current documentation phase.**

### 4.4 Supabase — REFERENCE ONLY

**REFERENCE ARCHITECTURE ≠ ARCHITECTURE CHANGE AUTHORIZATION.** The current direction remains **WordPress + Elementor**. Agents must check existing WordPress/native architecture first. Supabase must **NOT** be introduced merely to modernize the project.

Actual introduction of any of the following requires **explicit Product Owner approval and a separate architecture decision**: Supabase; an additional database; an additional authentication system; Supabase Storage; Realtime; Supabase API/backend; related migrations.

For routine WordPress work, agents do **NOT** need to consult Supabase. Do not install or configure Supabase now.

### 4.5 Playwright CLI — MANDATORY WHEN APPLICABLE

The preferred browser-level verification tool for visible/user-flow changes, where the execution environment permits. It applies especially to: homepage; product pages; feature pages; demo/contact flows; lead forms; navigation; responsive layout; login/register if later introduced; pricing if later introduced; checkout only if commerce is later approved.

Use the project's browser evidence contract: approximately **390x844 mobile**; approximately **768 tablet**; **1366x768 desktop**; RTL; horizontal overflow; navigation; forms; responsive media; UI states; console/network errors where retrievable.

**Do not invent CLI capabilities.** RTL is visually/browser verified; do not claim Playwright CLI has a dedicated RTL validator unless authoritative documentation establishes one.

Authentication/storage-state files are **sensitive and must never be committed**.

Playwright evidence should report: target URL/environment; relevant viewport(s); actions/flows tested; screenshots/evidence inspected; console/network result where retrievable; explicit **NOT RUN** if the environment prevented execution.

**No Playwright execution in the current documentation phase.**

## 5. Security finding classification and disposition

Failure classes remain **exactly** (`AGENTS.md` §13):

- **A** = current-work regression
- **B** = pre-existing product defect
- **C** = infrastructure / environment
- **D** = test / harness / fixture defect

Do **NOT** add false-positive or investigation states as failure classes.

**Security Finding Disposition** — a separate vocabulary:

- **CONFIRMED**
- **FALSE POSITIVE**
- **NEEDS INVESTIGATION**
- **ACCEPTED RISK**
- **OUT OF SCOPE**

Where relevant, a security finding may carry **one** A/B/C/D failure class **and** **one** disposition. For confirmed vulnerabilities report: severity; location; impact; verification method; remediation verification/re-scan status.

## 6. Standard workflow

1. Reconstruct live repository state.
2. Read `AGENTS.md` and accepted relevant docs.
3. Define bounded task scope.
4. Version-sensitive API/library work: consult authoritative documentation; use Context7 when useful/available.
5. Significant UI work: optionally consult UI Skills as subordinate guidance.
6. Implement only the authorized slice.
7. Run project-relevant tests.
8. Visible/user-flow change: perform Playwright/browser verification when the environment permits.
9. Security-sensitive surface: perform the proportionate authorized security review; Strix **only when explicitly authorized**.
10. Report exact evidence and limitations.

Supabase must **NOT** be a routine workflow step. Avoid duplicated browser-verification steps — one browser verification per slice, reported once.

## 7. Environment failure rule

If a relevant tool cannot run:

- report **NOT RUN**;
- explain why;
- do not convert it to PASS;
- do not enter indefinite environment debugging;
- classify infrastructure/environment failures as **C** when applicable;
- stop after a bounded diagnosis unless the slice specifically authorizes environment repair.

## 8. Evidence contract

For applicable tools, future reports should capture concisely:

- tool used;
- reason;
- tool/version/revision;
- documentation/source consulted;
- targeted dependency/library version;
- command/test/scan executed;
- result;
- browser verification performed or **NOT RUN**;
- security verification performed or **NOT RUN**;
- remaining findings;
- limitations / **NOT RETRIEVED**;
- relevant out-of-scope observations.

Keep: **NOT RUN ≠ PASS** · **NOT RETRIEVED ≠ PASS**.

## 9. Credential and privacy rules

- Never send secrets, credentials, PHI, patient data, or private product content to third-party documentation/retrieval services.
- Authentication/storage-state files (e.g., Playwright) are sensitive: never commit them.
- No tool setup may obtain or store API keys without explicit task authorization.
- Real product screenshots/videos use synthetic/demo data only (`AGENTS.md` §6).

## 10. Anti-scope-creep and dependency rules

- No agent may add a new project dependency merely to satisfy a tooling recommendation.
- A tooling setup must not silently become a production dependency.
- If a task genuinely requires a new project dependency or architectural change: escalate according to project governance (`AGENTS.md` §8).
- Documentation alone authorizes no tool installation, configuration, or setup.
- Tooling readiness does not authorize website implementation (`AGENTS.md` §14).

## 11. Setup/environment caveat

The setup statuses in section 3 are **environment snapshots as of 2026-09-27 (UTC)**, not permanent truths. Tooling ecosystems change quickly. Future agents must verify the environment and tool versions live before setup/use.

## 12. Upstream research provenance (read-only)

The initial read-only tooling assessment consulted:

- Context7: https://github.com/upstash/context7
- UI Skills: https://github.com/ibelick/ui-skills
- Strix: https://github.com/usestrix/strix
- Supabase: https://github.com/supabase/supabase
- Playwright CLI: https://github.com/microsoft/playwright-cli

Do **NOT** freeze rapidly changing upstream versions as permanent policy. If observed versions/revisions are recorded, label them as historical assessment evidence requiring live re-verification before setup/use.

## 13. Change log

| Date (UTC) | Trigger | Summary |
|---|---|---|
| 2026-09-27 | Approved agent-tooling governance (PR #2 amendment) | Initial version: adoption/setup matrix, five bounded tool sections, standard workflow, security finding classification/disposition distinction, evidence contract, credential/privacy rules, anti-scope-creep rules, upstream provenance |
