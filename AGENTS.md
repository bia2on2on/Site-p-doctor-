# AGENTS.md — Operational Guide for Agents Working in This Repository

This file is the **operational entry point** for any agent (engineering, design, content, review) that is asked to work in this repository. Read it before doing anything, then follow the pointers into `docs/ROADMAP.md` for planning detail.

- **Authoritative planning baseline:** [`docs/ROADMAP.md`](docs/ROADMAP.md) — the detailed roadmap, decisions, open questions and gates live there, not here.
- **Agent tooling governance:** [`docs/AGENT-TOOLING.md`](docs/AGENT-TOOLING.md) — adoption status and boundaries for approved agent tools (Context7, UI Skills, Strix, Supabase, Playwright CLI). Tooling documentation authorizes no installation, dependencies, architecture change, or website implementation.
- **This file:** short, durable rules and boundaries that rarely change. It must not duplicate the roadmap or become a second strategy document.
- **Status of this file:** operational guidance that can go stale, not a source of live truth. See *Live state overrides memory* (section 3).

---

## 1. What this repository is

This repository is **only** the CPMS marketing/sales website.

| Item | Value |
|---|---|
| Repo purpose | Marketing + sales website for **CPMS** (Clinic Practice Management System) |
| Current market | **Iran** |
| Default experience | **Persian / RTL** |
| Platform direction (not installed) | **WordPress + Elementor friendly** |
| Commercial objective | Help qualified clinic decision-makers understand the product and move toward **demo / consultation** |
| Primary launch audience | Multi-doctor clinics and treatment centers |
| Secondary audience | Independent doctors / small practices |

Detailed planning lives in [`docs/ROADMAP.md`](docs/ROADMAP.md): information architecture, page inventory, content model, SEO foundation and hardening, design direction, performance principles, approval gates, decision status and open questions.

## 2. What this repository is NOT

- It is **not** the CPMS product/plugin engineering repository.
- It does **not** contain the CPMS product source, plugin code, product roadmap, or product release artifacts.
- It is **not** an implementation repository while the project remains in planning mode (section 5).
- It is **not** a place to make product decisions, sales promises, or pricing commitments.

## 3. Live state overrides memory

Prompts, summaries, chat history, prior-session knowledge — and this file — are **historical context only**. The live repository and GitHub state are the authority.

Before any work, reconstruct live state and record it. At minimum verify:

- repository root (the correct repository, not a fork or unrelated project);
- authoritative default branch;
- exact default HEAD SHA;
- all open PRs;
- active PR head SHA and base SHA (exact);
- working tree status, including untracked files;
- the relevant docs/files, read at the live revision;
- checks / reviews / deployments when applicable.

Rules:

- If an active PR already represents the current work, **finish, review or amend that PR** rather than creating parallel or duplicate work.
- If live state materially conflicts with a task prompt or with a stored assumption, **stop and report the difference** instead of assuming the prompt is still accurate.
- Record exact SHAs in evidence; never write against stale evidence.

## 4. Strict repository isolation (website vs product)

The website repository and the CPMS product/plugin engineering repository are **separate systems**. For any agent working on the website:

- **Never write** to the product repository (no commits, branches, files, issues, PRs, settings).
- **Never** merge, tag, release, or administer it.
- The product repository may be consulted **READ-ONLY** only when a specific future task explicitly requires **factual capability verification**.
- Do **not** consult it merely because a roadmap item, a plan, or an owner desire mentions a capability.
- **Never infer a marketing claim from planned product functionality.** Planned, hinted, or desired functionality is not evidence of shipped capability.

## 5. Current project mode

> **Current recorded mode at the time this file was introduced: PLANNING / DISCOVERY ONLY.**
> Future agents must verify the live roadmap and live repository/PR state before relying on this snapshot.

While planning mode applies, none of the following is authorized:

- WordPress implementation or configuration;
- Elementor setup or template creation;
- theme or child-theme generation;
- plugin installation or configuration;
- PHP / CSS / JavaScript;
- site pages or templates;
- CI or deployment implementation;
- analytics installation;
- checkout, payments, or commerce implementation.

Planning/documentation work (roadmap, rules, discovery notes, review evidence) is allowed when explicitly directed. Implementation may begin only when the **implementation gate** in section 14 is satisfied — the existence of this file or of `docs/ROADMAP.md` does not open that gate.

**Parallel development (owner decision):** the website and the CPMS plugin are developed **in parallel**. Satisfying the implementation gate may authorize website implementation while product development continues — the website does **not** have to wait for the plugin to be fully finished first. This is **implementation** authorization only; the **publication gate** (section 14.1) remains closed until the product is launch-ready and the final Product Truth re-verification is complete. The website targets the **final marketing/sales presentation of a complete, ready-to-offer product** — it is not an early-access, beta, coming-soon, selected-customer, or pre-launch landing site.

## 6. Marketing truth

**No unsupported product claims.** Any significant public capability claim requires Product Truth verification before it can be published. The website's **living Product Truth reference** is [`docs/PRODUCT-TRUTH.md`](docs/PRODUCT-TRUTH.md) — the claim-control document separating verified current product evidence, target launch presentation and publication permission, and carrying the **Launch Truth Gate** that must pass before public launch. Website architecture or intended design is **never** evidence of product capability.

Capability status vocabulary (defined in the roadmap's Product Truth Gate):

- `AVAILABLE NOW` — **only assignable from verified evidence**;
- `COMING / ROADMAP`;
- `CUSTOM / CONTACT SALES`;
- `NOT CURRENTLY AVAILABLE`.

Rules:

- **Owner-desired marketing themes are not product evidence.** Owner intent, strategic interest, or roadmap ambitions must never be converted into a claim that something is available today.
- Do not fabricate or assume: capabilities, customers, testimonials, customer logos, usage/customer counts, pricing, integrations, certifications, compliance or regulatory claims, security certifications, uptime/performance numbers, or contact information.
- Real product screenshots/videos must use **synthetic/demo data only — never real patient information (PHI)**.
- Do not mark Product Truth verification as complete without reviewed evidence.

## 7. Business direction already decided (summary only)

Decisions recorded in the roadmap; consult it for wording, rationale and status labels:

- **Primary CTA:** request demo / consultation.
- **Initial sales journey:** assisted sale (the site is not an ecommerce storefront).
- **Public fixed pricing:** not the initial focus; proposals follow a sales conversation. This is direction, **not** permission to invent packages or prices.
- **Positioning intention:** CPMS understood as an integrated professional clinic-management product — **subject to product-truth verification**.
- **Homepage story order:** recognizable real problem → introduce CPMS quickly → show the real product early → demonstrate verified integrated workflows → resolve fit/trust concerns → demo/consultation.
- **Avoid fear marketing** and exaggeration; problem framing stays short and realistic.
- **Qualified leads matter more than raw traffic.**
- **Trust is evidence-led, not slogan-led**; the trust hierarchy starts with "does this fit how a real clinic operates?".

## 8. Product Owner escalation

Do **not** take the Product Owner's time for: debugging, file choices, Git commands, CI diagnosis, implementation internals, or routine UX/design/SEO decisions. The **Website Director** owns routine decisions.

Escalate only genuine major business/product forks that evidence cannot resolve, such as:

- material target-market change;
- material sales-model change;
- final commercial brand decision;
- making pricing fixed or public;
- enabling direct ecommerce/purchase;
- comparable major commercial-direction changes.

When escalation is genuinely required:

- ask **one smallest decision at a time**;
- offer **2–3 options maximum**;
- explain consequences simply;
- recommend one.

## 9. Git discipline

- Verify live repo root, branch, HEAD, working tree, authoritative `main`, and the active PR **before any write**.
- **Forward-only history.** No history rewrite.
- **No destructive reset.**
- **No `git clean` on unknown work.**
- **No rebase of shared history.**
- **No force-push.**
- **No empty CI commits** (or commits whose only purpose is to poke CI).
- **One bounded task per PR** where practical.
- **Do not duplicate active work** — if an open PR already represents the current work, continue/finish/review that work instead of creating a parallel PR.
- **Merge commits** unless repository policy later establishes otherwise.
- **Do not delete source branches** unless policy changes.
- **No merge without accepted evidence.**
- Exact-SHA evidence for anything claimed; after a merge, verify the resulting **merge SHA** rather than reusing PR-head evidence.

## 10. Writer retirement

State of an agent's write authority is determined **only** as follows:

- A **WRITE agent is NOT retired** merely because it creates a commit, pushes changes, updates a PR, or finishes a requested amendment.
- A write agent becomes **permanently retired from future write operations only after that agent successfully MERGES a PR**.
- After successfully merging a PR, that agent may still provide **read-only merge evidence/reporting**, but must **never perform another write operation**.
- Until it merges a PR, the same active writer may continue **bounded write work on that active PR** when directed.
- **A new session or token does not restore write authority to a retired writer.**

**Writer numbering:** website write agents may be referred to by the PR they own: **"Write Agent #N"** = the active writer responsible for PR #N. This naming does **not** change authority — retirement remains only after that writer successfully merges a PR (rules above). Read-only agents must not be renamed as writers.

## 11. Agent-type clarity

| Role | May do | Must not do |
|---|---|---|
| **WEBSITE WRITE AGENT** | Perform explicitly authorized, bounded writes in this website repository only | Write outside the authorized scope; touch the product repository |
| **WEBSITE READ-ONLY REVIEWER** | Inspect, review, and produce evidence | Modify repository or GitHub state |
| **PRODUCT READ-ONLY VERIFICATION AGENT** | Verify factual CPMS product capabilities **only when specifically directed** | Write to either repository (product or website) as part of verification |

Task prompts should state clearly which role the agent is acting under. If the role is unstated and the task would require writes, ask before writing.

## 12. Evidence rules

Never convert:

| Observed | Must not be reported as |
|---|---|
| NOT RUN | PASS |
| NOT RETRIEVED | PASS |
| IN PROGRESS | PASS |
| Artifact exists | Artifact inspected |
| Code reading | Runtime proof |
| PR-head proof | Merge-SHA proof |
| Localhost measurement | Production measurement |

Bind important GitHub evidence to an **exact SHA**. After a merge, verify the resulting merge SHA.

## 13. Failure classes

When reporting failures, use only these classes:

- **A** = current-work regression
- **B** = pre-existing product defect
- **C** = infrastructure / environment
- **D** = test / harness / fixture defect

(These remain the **only** failure classes. Security finding dispositions — `CONFIRMED` / `FALSE POSITIVE` / `NEEDS INVESTIGATION` / `ACCEPTED RISK` / `OUT OF SCOPE` — are a separate vocabulary, defined in [`docs/AGENT-TOOLING.md`](docs/AGENT-TOOLING.md); a finding may carry one A/B/C/D class and one disposition.)

## 13.1 Bounded diagnosis (no infinite debug loops)

Agents must **not** enter indefinite debug/retry loops. When blocked:

- perform a bounded diagnosis appropriate to the slice;
- classify the failure A/B/C/D;
- preserve evidence;
- fix only if within authorized scope;
- otherwise report the blocker and the smallest next action.

Repeated retries without new evidence are prohibited. Do not weaken correctness requirements to save time.

## 14. Implementation gate

Implementation must **not** begin merely because `AGENTS.md` or `docs/ROADMAP.md` exists.

Before implementation begins, the roadmap's required planning gates must be satisfied. At minimum, verify from live planning state:

- accepted business positioning;
- target audience;
- conversion strategy;
- information architecture / sitemap;
- SEO foundation;
- design direction;
- performance principles;
- content and claim rules;
- required **Product Truth** verification state.

Do **not** falsely mark the Product Truth Inventory complete — it is only complete when actual product evidence has been reviewed.

## 14.1 Publication gate

The implementation gate and the publication gate are **separate gates**:

- The **implementation gate** (section 14) may open website implementation while the product is still being completed (parallel development); it does not require the full plugin to be finished first.
- The **publication gate** stays closed until the product is launch-ready and a **fresh Product Truth verification against the exact launch candidate** has passed the **Launch Truth Gate** in [`docs/PRODUCT-TRUTH.md`](docs/PRODUCT-TRUTH.md).

Until the publication gate passes:

- the site remains **development/staging only**;
- it must not be intentionally publicly launched;
- it must not be intentionally indexed by search engines;
- it must not be marketed as a publicly available product;
- unfinished product claims must not leak into a public environment.

A finished website does **not** by itself authorize publication. Only the verified launch state may become public marketing truth. The technical means (e.g. noindex, authentication) are deliberately **not** prescribed here; implementation details belong to the later environment/deployment phase.

## 15. Change governance

`AGENTS.md` is guidance that can go stale. If it conflicts with live authoritative repository policy or with a later accepted/merged planning decision:

- do **not** silently choose one;
- identify and state the conflict explicitly;
- rely on the **most authoritative current repository evidence** (merged planning decisions, live PR state, live roadmap);
- amend documentation through a **bounded, reviewed change** where an amendment is needed.

`AGENTS.md` must not become unquestioned truth.

## 16. Before-work checklist (copy into task reports)

- [ ] Repo root verified; correct repository.
- [ ] Authoritative default branch and exact default HEAD SHA recorded.
- [ ] Open PRs listed; the active PR identified.
- [ ] Active PR head/base SHA recorded (exact).
- [ ] Working tree status checked, including untracked files.
- [ ] Relevant docs/files read at the live revision.
- [ ] Checks / reviews / deployments checked where applicable.
- [ ] No duplicate in-flight work for the same task.
- [ ] Acting role confirmed (write / read-only review / product read-only verification).
- [ ] Planning-mode and implementation-gate status confirmed before any non-documentation work.
- [ ] Publication-gate status confirmed before any public-launch, indexing, or public-marketing work.

## 17. Authorization windows and report quality

Agent GitHub authorization windows may be short-lived. When an assigned token/session has an approximately one-hour lifetime (recorded as an **operating constraint when applicable** — not a hard assumption that every future platform token lasts exactly one hour):

- tasks must be bounded to fit;
- the agent should target completion/reporting before expiry;
- reserve time for evidence retrieval;
- if completion becomes unlikely, stop safely and report the exact current state before expiry;
- never rush an unsafe merge/commit merely because a token is expiring;
- a new Product Owner message/session may provide a new authorization window, but does not override writer-retirement rules.

**Report quality:** keep reports concise but evidence-bound. Prefer exact SHA + action + result + limitation/blocker over long execution narration. Do not remove necessary evidence.
