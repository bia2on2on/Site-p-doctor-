# PR #32 — reference-to-CPMS truth map

Reference: `https://01a0f849-cd20-76e1-a6de-cd79f231f369.arena.site/` (the owner-provided URL).

## Inspection boundary

The reference was fetched directly as two text chunks. This confirms its content/order, not its rendered design: local Chromium/Playwright is unavailable, direct shell requests to the Arena host close during TLS, and the CI reference screenshot was not available for visual review. No reference CSS, source HTML, computed styles, viewport measurements, or inspected screenshot has been recovered. Do not use this map as pixel measurements or claim visual parity from it.

The reference page labels its content user-generated and unverified. Its copy, numerical metrics, mocked interface, role access, capabilities, testimonials, promises, and lead form are not Product Truth and must not be copied or implied.

## Element → truthful preview equivalent

| Reference composition | CPMS preview equivalent | Truth and implementation boundary |
| --- | --- | --- |
| Header, navigation, primary CTA | Existing CPMS preview header and same-page destinations | Keep the existing preview notice; link only to sections that exist. No invented product destination. |
| Hero statement and CTA | Existing bounded CPMS copy and non-live demo CTA | Preserve current Product Truth. CTA only navigates within the preview and discloses that no request is sent. |
| Four numeric trust/stat tiles | Three nonnumeric evaluation topics in `.value-strip` | Do not reproduce reference metrics, outcomes, or quantified claims. |
| Dashboard, queue, appointment, and notification mockup | `.media-reservation--hero` | Abstract, nonfunctional geometry only. No patient data, dashboard controls, queue state, or reference/stock imagery. |
| Eight feature cards | A compact grid of six evaluation topics sourced from the current CPMS page: the five required journey stages plus the existing manual-payment/financial-summary boundary | Phrase as items to assess in the offered version, not as verified functionality. Do not add SMS, online booking, prescriptions, branches, security, integrations, or other reference-only claims. |
| Four role portals (doctor, receptionist, patient, finance) | Three existing roles: reception, doctor, clinic management | Do not imply a patient or finance portal, role permissions, or server-side access guarantees. The second media reservation remains abstract and nonfunctional. |
| Four-step workflow | The required five-step flow: `نوبت → پذیرش → صف → ویزیت → پرونده` | Keep these five steps and their existing evaluation wording; do not replace them with the reference's four-step process or settlement promise. |
| Clinic-fit claims | Existing bounded `.role-fit-note` | Keep the current qualification; do not add claims about specialty coverage, branches, scale, or universal suitability. |
| Backup, security, engineering, and comparison sections | No equivalent section | Omit until each claim is supported by current-repository Product Truth. No backup, encryption, uptime, compliance, testing, or competitor comparison claims. |
| FAQ | Existing bounded questions | Retain the current caveats; do not copy reference answers or promises. |
| Demo form and delivery promises | Existing non-live CTA plus disclosure | No fields, lead submission, free/30-minute claim, response-time promise, or customer-data collection. |
| Footer | Existing CPMS preview footer and authorized public contact fact | Keep preview disclosure and only verified destinations/contact facts. |
| Reference Settings page | No reference equivalent | Keep the existing six Settings sections and behavior unchanged; carry over only the preview's shared design language. |

## Review gate

Required widths remain 390×844, 430×932, 768×1024, 1024-class, 1366×768, 1440×900, and 1920 sanity. Screenshot inspection at 390, 768, 1366, and 1440 is still required before visual scores or acceptance can be stated. Until then, `VISUAL ACCEPTANCE = NOT VERIFIED` and all category scores are `N/A`.
