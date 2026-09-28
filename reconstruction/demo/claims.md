# Demo / Consultation Content & Claims Register

**Status:** TARGET — NOT PUBLICATION-APPROVED
**Reference Documents:** `docs/PRODUCT-TRUTH.md`, `docs/SITE-ARCHITECTURE.md` §13, `AGENTS.md` §6
**Commercial Intent:** Assisted-sale qualification and consultation journey. Not an e-commerce storefront; no pricing commitment, checkout, or instant account promise.

---

## 1. Commercial Boundary & Launch Blocker

The Product Owner has **NOT yet authorized**:
- a production recipient email address;
- a CRM system;
- a webhook destination;
- third-party form SaaS;
- analytics or tracking scripts;
- advertising pixels;
- a WhatsApp or phone delivery destination;
- production SMTP / form-delivery architecture.

**LIVE LEAD DELIVERY = NOT CONFIGURED / NOT AUTHORIZED**
This is a **launch blocker** for the conversion path.

### Safe Non-Live Mode Policy
The page implements an explicit **SAFE NON-LIVE MODE**:
- The visitor/evaluator is clearly informed in Persian that live submission delivery is not yet active in this technical preview.
- Submissions are validated server-side and client-side using synthetic test data.
- No payload leaves the test environment.
- No payload is persisted in the WordPress database or logged to disk.
- No submission data is stored in Git.

---

## 2. Qualification Fields & Data Privacy Boundary

The qualification form collects the minimum sensible set of fields required to evaluate clinic fit:
1. `cpms_contact_name`: Full name of clinic coordinator, doctor, or decision-maker.
2. `cpms_org_name`: Clinic, medical center, or practice name.
3. `cpms_contact_value`: Neutral contact value (work email or phone) for scheduling the session.
4. `cpms_org_type`: Operational context (multi-specialty clinic, dispensary/polyclinic, day surgery center, solo practice, other).
5. `cpms_doctor_count`: Approximate number of cooperating doctors (1–2, 3–5, 6–10, 11+).
6. `cpms_discussion_topic`: Optional short note on current clinic workflow or focus areas.

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
- The qualification form is integrated via the Koorosh theme shortcode `[cpms_demo_form]`, ensuring robust server-side validation, CSRF nonce protection, accessibility attributes (`label[for]`, `aria-required`, `aria-describedby`, `aria-invalid`, `role="alert"`, `role="status"`), and progressive enhancement without brittle Elementor content coupling.
- When Elementor Pro Forms is authorized on the production host, the form container can be adapted to the authorized delivery destination.
