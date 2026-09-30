# Demo / Consultation Content & Claims Register

**Status:** TARGET — NOT PUBLICATION-APPROVED
**Reference Documents:** `docs/PRODUCT-TRUTH.md`, `docs/SITE-ARCHITECTURE.md` §13, `AGENTS.md` §6
**Commercial Intent:** Assisted-sale qualification and consultation journey. Not an e-commerce storefront; no pricing commitment, checkout, or instant account promise.

---

## 1. Commercial Boundary & Lead-Delivery Status

**LEAD DELIVERY = AUTHORIZED RECIPIENT RECORDED · DEFAULT OFF · LIVE HOST ACTIVATION NOT DONE**

The Product Owner has authorized (commercial decision recorded 2026-09-30) exactly one lead
recipient: **biatoweb@gmail.com** (business-contact evidence; no credential of any kind is
stored in this repository).

Still NOT authorized / NOT configured:

- a CRM system;
- a webhook destination;
- third-party form SaaS;
- analytics or tracking scripts;
- advertising pixels;
- a WhatsApp or phone delivery destination;
- production SMTP / form-delivery architecture (environment-owned, outside Git).

### Two explicit delivery modes

**A. DEVELOPMENT / CI (default in every context):** delivery is disabled, `wp_mail()` is
never called, nothing is persisted or logged, and valid submissions receive the honest
non-live notice. Deploying or updating the code can never enable delivery by itself.

**B. AUTHORIZED LIVE ENVIRONMENT:** delivery can be activated only by the environment owner
defining `CPMS_LEAD_DELIVERY_ENABLED` as (boolean) `true` in wp-config.php (or an equivalent
environment-owned bootstrap). The theme only reads the constant and never defines it. When
activated, delivery uses the WordPress-native mail layer (`wp_mail()`) with the single
code-bounded authorized recipient; SMTP/transport/deliverability configuration remains
environment-owned and outside Git. **Live host activation has NOT been done.**

### Delivery states (single vocabulary)

| State | Meaning | User-facing treatment |
|---|---|---|
| `validation_failure` | Server-side validation (nonce, allowlist, fields, honeypot) failed | Accessible field errors, `role=alert` |
| `delivery_disabled` | Valid submission in the default non-live mode | Honest notice: nothing sent or stored |
| `handoff_accepted` | The configured WordPress mail layer accepted the handoff | Truthful notice; explicitly no receipt/read/response-time promise |
| `handoff_failed` | The mail layer reported failure | Error notice (`role=alert`), HTTP 500 for AJAX; never shown as success |

`wp_mail()` returning true proves **mail-layer acceptance only** — inbox delivery, reading,
or any response-time promise is NOT claimed and NOT verified.

### Safe Non-Live Mode Policy (default)

The page keeps an explicit **SAFE NON-LIVE MODE**:

- While delivery is not activated, the visitor is clearly informed in Persian that live
  submission delivery is not active in this technical preview.
- Submissions are validated server-side and client-side using synthetic test data.
- No payload leaves the test environment.
- No payload is persisted in the WordPress database or logged to disk.
- No submission data is stored in Git.
- The technical non-live banner renders only while delivery is disabled; it disappears
  only in an explicitly activated environment.

---

## 2. Qualification Fields & Data Privacy Boundary

The qualification form collects the minimum sensible set of fields required to evaluate clinic fit:
1. `cpms_contact_name`: Full name of clinic coordinator, doctor, or decision-maker.
2. `cpms_org_name`: Clinic, medical center, or practice name.
3. `cpms_contact_value`: Neutral contact value (work email or phone) for scheduling the session.
4. `cpms_org_type`: Operational context (multi-specialty clinic, dispensary/polyclinic, day surgery center, solo practice, other).
5. `cpms_doctor_count`: Approximate number of cooperating doctors (1–2, 3–5, 6–10, 11+).
6. `cpms_discussion_topic`: Optional short note on current clinic workflow or focus areas.

No additional fields are collected. Requests carrying fields outside the strict server-side
allowlist are rejected outright (HTTP 400), which is also what makes the recipient
structurally non-overridable by request parameters.

### Strict Data Privacy Prohibition (No PHI)
Prominent Persian guidance is embedded:
> «لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید.»

The form strictly forbids collecting:
- patient names or identifying details;
- medical records, diagnoses, or treatment histories;
- national identification numbers (کد ملی);
- insurance policy or claim details;
- clinical documents or prescription scans;
- passwords or account credentials.

A server-side heuristic (10-consecutive-digit check) is defense-in-depth only and carries
**no guarantee** of PHI prevention.

### Data-use disclosure (minimal, pending legal review)

Beside the form (`#cpms-data-use-note`), a minimal accurate disclosure states that the
contact/organization information entered is used only to respond to the demo/consultation
request (when live delivery is activated), repeats the PHI prohibition, and provides a
direct crawlable link to `/privacy/` (`حریم خصوصی وب‌سایت`). No mandatory consent checkbox
or statutory consent wording is invented, and no retention period, legal basis, or company
registration identity is stated: `/privacy/` and `/terms/` carry
`LEGAL REVIEW REQUIRED BEFORE PUBLIC LAUNCH` and track unprovided corporate/legal facts as
`BUSINESS/LEGAL INPUT REQUIRED`.

---

## 3. Truthful Product & Capability Boundaries

Phrasing follows `docs/PRODUCT-TRUTH.md` and `docs/ROADMAP.md`:
- **Workflow Fit:** Discussion covers the integrated progression from appointment and reception to doctor workspace, medical records, and visit documentation.
- **Role Scoping:** Covers the separation of reception and doctor roles and data access scoping.
- **No Unapproved Claims:** The page contains NO promises of:
  - online payment gateways (درگاه پرداخت آنلاین);
  - full accounting replacement (حسابداری کامل);
  - national insurance connection (اتصال به بیمه);
  - national electronic prescription (نسخه الکترونیک ملی);
  - artificial intelligence (هوش مصنوعی);
  - mobile app (اپلیکیشن موبایل);
  - formal security certifications (گواهی امنیت);
  - SLAs or response-time commitments (e.g. "تماس در کمتر از ۲ ساعت" or "۲۴/۷");
  - fixed or public pricing (قیمت قطعی).
- **Pricing Policy:** Software pricing depends on clinic scale, doctor count, and operational workflow requirements, established following consultation.

---

## 4. Architecture & Editability

- Composed entirely of native Elementor Free elements (`container`, `heading`, `text-editor`, `button`).
- Headings follow strict sequential hierarchy (single H1 followed by H2 and H3).
- The qualification form is integrated via the Koorosh theme shortcode `[cpms_demo_form]`, ensuring robust server-side validation, CSRF nonce protection, a strict POST-field allowlist, a first-party hidden honeypot, accessibility attributes (`label[for]`, `aria-required`, `aria-describedby`, `aria-invalid`, `role="alert"`, `role="status"`), and progressive enhancement without brittle Elementor content coupling.
- Submission/delivery logic stays theme-owned; Elementor keeps page composition. No backend delivery logic lives in Elementor.
- CI proves the two-mode behavior with `wp_mail` interception (`pre_wp_mail`) in the ephemeral wp-env container: disabled mode sends zero mail; the activated simulation targets exactly the authorized recipient; `wp_mail` failure surfaces as `handoff_failed`; no database persistence occurs. CI never performs real delivery.
- When Elementor Pro Forms is authorized on the production host, the form container can be adapted to the authorized delivery destination.
