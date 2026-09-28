# Appointment–Reception–Queue workflow page content / claims register

**Status: TARGET — NOT PUBLICATION-APPROVED.** First representative workflow page, covering the clinic-side appointment → reception → queue path. Accepted sources: `docs/PRODUCT-TRUTH.md` (evidence SHA `cbf6e975eecc1009497eef861678904d49cbc304`; runtime/production NOT VERIFIED) and `docs/SEO-KEYWORD-MAP.md` (Clusters 2–3). The CPMS product repository was **not** accessed; no claim in this page required product-repo investigation, and unresolved capability points were weakened or omitted instead.

## SEO intent boundary

- Targets **clinic-side** appointment/reception/queue commercial intent: clinic appointment-scheduling software vocabulary (Cluster 2, software-intent only) and reception/queue-management vocabulary (Cluster 3), with an explicit buyer marker («برای مدیران کلینیک») in title, hero and meta description.
- **Disambiguated from patient/navigation and government appointment intent.** The observed trap phrases «سیستم نوبت دهی پزشک» and «سایت نوبت دهی پزشک» appear nowhere on the page; the hero lede, hero caption and FAQ state this is not a page where patients take appointments.
- **No cannibalization of Product Overview.** The Cluster-1 heads (نرم افزار مطب / نرم افزار مدیریت مطب / نرم افزار مدیریت کلینیک) never appear in this page's title or H1; the page links to Product Overview for the complete picture instead of restating it.
- **No public/online booking claim.** Product Truth records the appointment mechanism but does not separately verify Public Booking; the page says nothing about patients booking online. **No SMS/reminder claim** (provider-dependent). No insurance, payment gateway, national e-prescription, AI, mobile app, accounting, customer evidence, performance numbers, certification or support promises.

## Capability ceiling (PRODUCT-TRUTH §3; every item REVERIFY BEFORE PUBLIC LAUNCH, none PUBLISHABLE NOW)

| Recipe area | Accepted boundary | Deliberately not claimed |
|---|---|---|
| Hero + flow strip | §3 #1 integrated appointment → reception → visit as a connected path; evaluation language only | Availability, quantified improvement, patient booking |
| Problem band | Recognizable coordination realities framed as industry pains, not as CPMS results or fear marketing | Time/cost savings, competitor shortcomings |
| Workflow ۰۱–۰۳ | #1 (appointment mechanism), #9 (check-in/walk-in/arrival status), #12 (queue/waiting); stage ۰۲ carries the scope caveat | Complete reception lifecycle, SMS reminders, online booking |
| Reception perspective | #9 recorded mechanisms only, plus a visible «honest boundary» notice that the full reception phase was NOT closed in the snapshot | A fully closed reception lifecycle |
| Doctor continuity | #8 doctor workspace and #10 patient records/visit documents as the onward path, in evaluation language; links to Product Overview | Duplication of the Product Overview narrative, portal/other-module claims |
| Fit | Multi-doctor clinics with active reception as primary, independent practices conditional; explicitly not universal fit | Universal fit, easy setup, scale claims |
| FAQ | Bounded answers at the same claim ceiling as the destination pages | Integrations, implementation promises |
| CTA | Links to the real Demo/Consultation page; states the demo form is currently technical/non-live | Live lead capture, response-time promises |

## Media (launch blocker carried forward)

Two Elementor-editable reserved frames: (1) appointment schedule view, stage ۰۱; (2) reception arrival/queue board view. No fabricated UI, no device mockups, no generated product screenshots, no stock imagery. **Real verified CPMS media with synthetic/demo data must replace BOTH reserved frames before public launch.**

## Conversion (launch blocker carried forward)

Primary CTA links to the real Demo/Consultation page (`/demo/`); the page also links to Product Overview (`/product-overview/`). **LIVE LEAD DELIVERY = NOT CONFIGURED / NOT AUTHORIZED.** The page states truthfully that the demo form is currently in technical/non-live mode, so no visitor is misled into thinking a submission delivers a real request.

## Release gates (unchanged)

No Product Truth item is `PUBLISHABLE NOW`. The visible staging notice and `blog_public=0` keep this fixture distinct from a public launch. Before public launch: complete the eight-step Launch Truth Gate, re-verify all Persian copy against launch evidence, supply verified media, authorize live lead delivery, and perform production SEO/accessibility/performance checks. Static forbidden-phrase tests are guardrails, **not** proof that marketing text makes a product capability true.
