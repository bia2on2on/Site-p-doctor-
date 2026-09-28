# Patient-record / information-continuity page — content and claims register

**Status: TARGET — NOT PUBLICATION-APPROVED.** Second representative workflow page: the bounded, clinic-scoped patient-record and information-continuity path. Accepted sources: `docs/PRODUCT-TRUTH.md` (evidence SHA `cbf6e975eecc1009497eef861678904d49cbc304`; runtime/production **NOT VERIFIED**), `docs/SEO-KEYWORD-MAP.md` (Cluster 4 + §D ownership + §E boundaries) and `docs/SITE-ARCHITECTURE.md` §4.3/§5.4/§11/§12. The CPMS product repository was **not** accessed: no statement on this page required product-repo investigation, and unresolved capability points were weakened or omitted instead.

## SEO intent boundary

- Supports bounded **commercial/informational** intent around `پرونده الکترونیک بیمار` (Cluster 4, `CONDITIONAL ON PRODUCT TRUTH`, `REQUIRES PRODUCT VERIFICATION`). The phrase appears in the WordPress title and once as a section heading, each time bound to **clinic scope in the same sentence/heading** (`در محدودهٔ کلینیک` / `در همین کلینیک`), as Cluster 4 requires.
- **Bare `پرونده بیمار` is never the commercial head.** The page H1 carries the page identity plus the clinic-scope qualifier; the title carries the clinic qualifier and buyer marker. The reserved institutional term `پرونده الکترونیک سلامت` appears **only inside explicit negations**, never as a target.
- **Patient navigation intent is not targeted and is disambiguated** in the hero caption: this page is written for clinic decision-makers, not as a route for patients to their own information.
- **No cannibalization of Product Overview.** The Cluster-1 heads (`نرم افزار مدیریت مطب` / `نرم افزار مدیریت کلینیک`) appear in neither this page's title, H1 nor copy; the page links to Product Overview for the complete product picture. Product Overview gains one contextual link here (see below).
- **No forbidden claims.** No national/shared record network, no Iranian government health-system or national e-prescription connection, no insurance, no AI, no automatic clinical diagnosis, no universal interoperability, no certification/compliance, no “100% secure”, no guaranteed confidentiality, no mobile app, no unsupported integration, no SMS, no pricing, no customer evidence, no performance/uptime numbers.

## Capability ceiling (PRODUCT-TRUTH §3; every item REVERIFY BEFORE PUBLIC LAUNCH, none PUBLISHABLE NOW)

| Recipe area | Accepted boundary | Deliberately not claimed |
|---|---|---|
| Hero + scope note | Clinic/organization-scoped patient record and continuity, stated as intended scope inside recorded evidence | National record sharing, government health systems, shared record network |
| Problem band | Recognizable clinic realities about disconnected context, framed as industry description — explicitly **not** clinical-safety evidence or a measured product result | Fear marketing, clinical-safety claims, time/cost savings |
| Flow ۰۱–۰۴ | #10 patient records, #8 doctor workspace, #11 prescriptions/documents and operations as a connected path; stage ۰۲ and ۰۳ carry scope caveats | Complete closed lifecycle, national e-prescription, interoperability |
| Record context | #10 clinic-scoped record; visible explicit boundary that no national/institutional system claim is made | Institutional/national EHR meaning |
| Doctor workspace | #8 doctor workspace and #10 records, in evaluation language; explicit statement that decision support, automatic alerts and diagnosis suggestions are **not** presented | Clinical decision support, AI, diagnosis |
| Documents / prescriptions | #11 bounded evidence: recording/management **inside CPMS**, with an explicit distinction panel separating it from connecting to the national e-prescription system | Iranian national e-prescription connection |
| Patient portal | #7 bounded evidence: profile, visits, prescriptions, files only, in the recorded bounded scope; visible boundary that mobile app, push notification and external services are not claimed | Mobile app, push, external integrations |
| Access / data separation | #4/#5/#6 mechanism-level description only (`نقش‌ها`, `دامنهٔ دسترسی`, `تفکیک اطلاعات`, `محدوده‌دار (scoped)`), explicitly labelled as mechanism level and subject to re-verification before launch | Compliance, certification, medical-grade security, “fully secure”, guaranteed privacy, any absolute security language |
| Fit | Multi-doctor clinic with continuous visits as primary, independent/small practice conditional; explicitly not universal fit | Universal fit, easy setup, scale claims |
| FAQ | Bounded answers at the same ceiling as the destination pages, including the explicit “connection to national e-prescription / national health record is NOT a current claim” answer | Integrations, implementation promises |
| CTA | Links to the real Demo/Consultation page (`/demo/`), Product Overview and the appointment/reception/queue page; states the demo form is currently technical/non-live | Live lead capture, response-time promises |

## Architecture / linking

- One contextual inbound link was added to **Product Overview** near its bounded `پرونده و مستندات ویزیت` topic; the page adds no new navigation, hub or menu (SITE-ARCHITECTURE §6, §5.4.3).
- This page links outward only to real existing pages: `/demo/`, `/product-overview/`, `/appointment-reception-queue/`, plus one in-page anchor (`#access`). No dead navigation, no offsite links.

## Media (launch blocker carried forward)

Two Elementor-editable reserved frames: (1) patient record / doctor context inside `#record-context`; (2) document/workflow context inside `#documents`. Both are clearly labelled reservations with visible disclosure — **not** product UI, no fabricated screen, no device mockup, no generated product screenshot, no stock medical imagery used as evidence. **Verified real CPMS media containing only synthetic/demo records must replace BOTH reserved frames before public launch.**

## Conversion (launch blocker carried forward)

Primary CTA links to the real Demo/Consultation page (`/demo/`). **LIVE LEAD DELIVERY = NOT CONFIGURED / NOT AUTHORIZED.** The page states truthfully that the demo form is currently in technical/non-live mode, so no visitor is misled into thinking a submission delivers a real request.

## Release gates (unchanged)

No Product Truth item is `PUBLISHABLE NOW`. The visible staging notice and `blog_public=0` keep this fixture distinct from a public launch. Before public launch: complete the eight-step Launch Truth Gate, re-verify all Persian copy against launch evidence, supply verified media, authorize live lead delivery, and perform production SEO/accessibility/performance checks. Static forbidden-phrase tests are guardrails, **not** proof that marketing text makes a product capability true.
