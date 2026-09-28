# Doctor-workspace page — content and claims register

**Status: TARGET — NOT PUBLICATION-APPROVED.** Third representative workflow page: the bounded doctor-side workspace as a continuation of the real clinic flow. Accepted sources: `docs/PRODUCT-TRUTH.md` (evidence SHA `cbf6e975eecc1009497eef861678904d49cbc304`; runtime/production **NOT VERIFIED**), `docs/SEO-KEYWORD-MAP.md` (§D ownership; Cluster 1 stays with Product Overview) and `docs/SITE-ARCHITECTURE.md` §4.3 («Doctor Workspace | #8»)/§5.4/§11/§12. The CPMS product repository was **not** accessed: no statement on this page required product-repo investigation, and unresolved capability points were weakened or omitted instead.

## SEO intent boundary

- This is a **supporting workflow page**. It **does not own the primary clinic-software commercial cluster** (SEO-KEYWORD-MAP Cluster 1, `CANDIDATE OWNER — Product Overview`); the Cluster-1 heads (`نرم افزار مدیریت مطب` / `نرم افزار مدیریت کلینیک`) appear in neither the title, H1 nor copy, and the page links to Product Overview for the complete product picture instead of restating it.
- Natural supporting phrasing around `فضای کاری پزشک` (title, H1, section vocabulary) and `مدیریت جریان کار پزشک در کلینیک` (one section eyebrow) — no keyword stuffing, no chase of broad physician/patient informational terms.
- The Cluster-4 head `پرونده الکترونیک بیمار` is **not** targeted in the title or H1; the page links contextually to the patient-record page, which keeps its own narrative and claim ceiling.
- Buyer marker (`برای مدیران کلینیک`) in the title; audience stated on-page for clinic decision-makers and evaluating doctors. Patient navigation intent is disambiguated in the hero caption («مسیر نوبت‌گیری بیماران نیست»).
- **No forbidden claims.** No clinical decision support, AI assistant, diagnosis recommendation, automated diagnosis, national Iranian e-prescription integration, insurance, telemedicine/video consultation, mobile app, guaranteed medical-history completeness, certification/compliance, «medical-grade security», absolute security wording, SMS, pricing, customer evidence, or performance/uptime numbers.

## Capability ceiling (PRODUCT-TRUTH §3; every item REVERIFY BEFORE PUBLIC LAUNCH, none PUBLISHABLE NOW)

| Recipe area | Accepted boundary | Deliberately not claimed |
|---|---|---|
| Hero + reserved workspace media | #8 doctor workspace framed as the continuation of the clinic flow (#1), evaluation language only | Isolated-screen framing as a product defect claim, availability, quantified improvement |
| Handoff strip (4 positions + RTL arrows) | #1/#9/#12 reception-side context → #8 workspace → #10 patient context → #11 record/document continuation as one bounded progression; scope caveat in the band | Workflow stages beyond recorded evidence, closed reception lifecycle, automated handoff guarantees |
| Workspace context band | #8 bounded purpose: an organized operational context for relevant clinic/patient work; explicit statement that decision support, automatic alerts and diagnosis suggestions are **not** presented; boundary note that exact controls/actions are verified in the offered version | Clinical decision support, AI, diagnosis, invented controls/actions |
| Patient-context panel | #10 relationship only, linked to the existing patient-record page; explicitly does not replace it | A second patient-record narrative, national record sharing |
| Documents / prescriptions | #11 bounded evidence: recording/management **inside CPMS**, plus an explicit distinction that in-CPMS recording does not by itself establish connection to national external systems | Iranian national e-prescription connection, insurance/e-prescription integration |
| Access / role context | #4/#5/#6 mechanism-level wording only (`نقش‌ها`, `دامنهٔ دسترسی`, `تفکیک اطلاعات`, `محدوده‌دار (scoped)`), labelled mechanism level and subject to pre-launch re-verification | Compliance, certification, medical-grade security, absolute privacy/security guarantees |
| Multi-doctor fit | Reception and doctors within one connected clinic context; explicitly no universal fit and no measured productivity improvement | Universal suitability, measured productivity/throughput claims |
| FAQ | Four bounded questions answered at the same ceiling as the destination pages, including the explicit «not a connection to national e-prescription» answer and the honest «see the real interface via demo» path | Integrations, implementation promises, live response commitments |
| CTA | Links to the real Demo/Consultation page (`/demo/`), stating the demo form is currently technical/non-live | Live lead capture, response-time promises |

## Architecture / linking

- One contextual inbound link added to **Product Overview** («ادامهٔ جریان کار پزشک در کلینیک … فضای کاری پزشک») inside its bounded review-topics column; no new navigation, hub or menu (SITE-ARCHITECTURE §6, §5.4.3).
- This page links outward only to real existing pages: `/demo/`, `/patient-record-continuity/` (hero secondary + linked panel), one inline `/appointment-reception-queue/` reference in the handoff band, and `/product-overview/` in the final CTA. No dead navigation, no offsite links.

## Media (launch blocker carried forward)

Two Elementor-editable reserved frames: (1) doctor workspace view in the hero (`media-workspace-surface`); (2) doctor + patient-context/detail view in the linked panel (`media-context-surface`). Both carry visible disclosure — **not** product UI, no fabricated screen, no device mockup, no generated product screenshot, no stock doctor photo used as evidence. **Verified real CPMS media containing only synthetic/demo records must replace BOTH reserved frames before public launch.**

## Conversion (launch blocker carried forward)

Primary CTA links to the real Demo/Consultation page (`/demo/`). **LIVE LEAD DELIVERY = NOT CONFIGURED / NOT AUTHORIZED.** The page states truthfully that the demo form is currently in technical/non-live mode, so no visitor is misled into thinking a submission delivers a real request.

## Release gates (unchanged)

No Product Truth item is `PUBLISHABLE NOW`. The visible staging notice and `blog_public=0` keep this fixture distinct from a public launch. Before public launch: complete the eight-step Launch Truth Gate, re-verify all Persian copy against launch evidence, supply verified media, authorize live lead delivery, and perform production SEO/accessibility/performance checks. Static forbidden-phrase tests are guardrails, **not** proof that marketing text makes a product capability true.
