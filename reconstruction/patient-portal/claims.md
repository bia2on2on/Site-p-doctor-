# Patient-portal page — content and claims register

**Status: TARGET — NOT PUBLICATION-APPROVED.** Fourth representative workflow/capability page: the bounded patient-facing portal as part of the connected clinic workflow, written for clinic decision-makers. Accepted sources: `docs/PRODUCT-TRUTH.md` (evidence SHA `cbf6e975eecc1009497eef861678904d49cbc304`; runtime/production **NOT VERIFIED**), `docs/SEO-KEYWORD-MAP.md` (§D ownership; Cluster 1 stays with Product Overview) and `docs/SITE-ARCHITECTURE.md` §4.3 («Patient Portal | #7»)/§5.4/§11/§12. The CPMS product repository was **not** accessed: no statement on this page required product-repo investigation, and unresolved capability points were weakened or omitted instead.

## SEO intent boundary

- This is a **supporting product/capability page**. It **does not own the primary clinic-software commercial cluster** (SEO-KEYWORD-MAP Cluster 1, `CANDIDATE OWNER — Product Overview`); the Cluster-1 heads (`نرم افزار مدیریت مطب` / `نرم افزار مدیریت کلینیک`) appear in neither the title, H1, description nor copy, and the page links to the patient-record and demo destinations instead of restating the product picture.
- Natural supporting phrasing around `پورتال بیمار` (title, H1, section vocabulary) with clinic/buyer context — no keyword stuffing, no chase of generic patient-portal/institutional terms without buyer relevance.
- The Cluster-4 head `پرونده الکترونیک بیمار` is **not** targeted anywhere on this page (title, H1, description, copy); the page links contextually to the patient-record page, which keeps its own narrative and claim ceiling.
- **Broad patient navigation/search intent is not targeted and is disambiguated** in the hero caption (not a patient-acquisition route, not a doctor-search directory, not patient appointment-taking) and in the what-this-is-not band (not a public patient directory).
- **No forbidden claims.** No mobile app, no iOS/Android app, no national Iranian e-prescription integration, no insurance integration, no online payment gateway, no telemedicine/video visits, no AI, no automatic diagnosis, no universal patient access, no certification/compliance, no «medical-grade security», no absolute security wording, no SMS, no pricing, no customer evidence, no performance/uptime numbers.

## Capability ceiling (PRODUCT-TRUTH §3; every item REVERIFY BEFORE PUBLIC LAUNCH, none PUBLISHABLE NOW)

| Recipe area | Accepted boundary | Deliberately not claimed |
|---|---|---|
| Hero + reserved portal media | #7 patient-facing area framed as existing beside the clinic workflow (#1), evaluation language only | Consumer-app framing, availability, quantified improvement |
| Patient-side context band | #7 bounded scope named once at the recorded level (profile, visits, prescriptions, files); explicit statement that no online action/service beyond it is presented; boundary note that exact presentation is verified in the offered version | Enumerated portal actions/features beyond recorded evidence, online services |
| Connection model (two sides + neutral bridge) | #7 patient context, #1 clinic workflow and #10/#11 information/documents as one neutral side-by-side composition; scope caveat plus an explicit neutral-model caption (no automatic-synchronization claim) | Bidirectional sync behavior, automated exchange, workflow stages beyond recorded evidence |
| Linked record-continuity band | #10 relationship only, linked to the existing patient-record page; explicitly does not replace it | A second patient-record narrative, national record sharing |
| Documents / prescriptions | #11 bounded evidence: recording/management **inside CPMS**, plus an explicit distinction that in-CPMS recording does not by itself establish connection to national external systems | Iranian national e-prescription connection, insurance/e-prescription integration |
| Access / role context | #4/#5/#6 mechanism-level wording only (`نقش‌ها`, `دامنهٔ دسترسی`, `تفکیک اطلاعات`, `محدوده‌دار (scoped)`), labelled mechanism level and subject to pre-launch re-verification | Compliance, certification, medical-grade security, absolute privacy/security guarantees |
| What-this-is-not band | Concise positive non-claims: portal ≠ mobile-app claim, in-CPMS documents ≠ national connection, portal ≠ public patient directory | Defensive disclaimer wall, new capability promises |
| Fit / buyer value | Why a connected patient-facing component can matter to an evaluating clinic; explicit statement that no measured improvement is claimed | Universal suitability, measured satisfaction/efficiency gains |
| FAQ | Four bounded questions answered at the same ceiling as the destination pages, including the explicit mobile-app and national e-prescription negations and the honest «see the real interface via demo» path | Integrations, implementation promises, live response commitments |
| CTA | Links to the real Demo/Consultation page (`/demo/`), stating the demo form is currently technical/non-live | Live lead capture, response-time promises |

## Architecture / linking

- One contextual inbound link added to **Product Overview** («جایگاه بخش رو به بیمار در کنار جریان کار کلینیک … پورتال بیمار») inside its bounded review-topics column; no new navigation, hub or menu (SITE-ARCHITECTURE §6, §5.4.3).
- This page links outward only to real existing pages: `/demo/` (hero primary + final CTA) and `/patient-record-continuity/` (hero secondary + linked band + final CTA secondary). No dead navigation, no inline-link network, no offsite links.

## Media (launch blocker carried forward)

Two Elementor-editable reserved frames: (1) patient-facing portal view in the hero (`media-portal-surface`); (2) patient information/documents view in the documents band (`media-documents-surface`). Both carry visible disclosure — **not** product UI, no fabricated screen, no fake phone screen, no generated mobile UI, no device mockup, no generated product screenshot, no stock patient photography used as evidence. **Verified real CPMS media containing only synthetic/demo records must replace BOTH reserved frames before public launch.**

## Conversion (launch blocker carried forward)

Primary CTA links to the real Demo/Consultation page (`/demo/`). **LIVE LEAD DELIVERY = NOT CONFIGURED / NOT AUTHORIZED.** The page states truthfully that the demo form is currently in technical/non-live mode, so no visitor is misled into thinking a submission delivers a real request.

## Release gates (unchanged)

No Product Truth item is `PUBLISHABLE NOW`. The visible staging notice and `blog_public=0` keep this fixture distinct from a public launch. Before public launch: complete the eight-step Launch Truth Gate, re-verify all Persian copy against launch evidence, supply verified media, authorize live lead delivery, and perform production SEO/accessibility/performance checks. Static forbidden-phrase tests are guardrails, **not** proof that marketing text makes a product capability true.
