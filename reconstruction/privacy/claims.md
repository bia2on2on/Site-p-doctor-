# Claims Register — Privacy Utility Page (`/privacy/`)

**Status:** TARGET — NOT PUBLICATION-APPROVED.
**Legal Review Status:** `LEGAL REVIEW REQUIRED BEFORE PUBLIC LAUNCH`
**Business & Legal Input Status:** `BUSINESS/LEGAL INPUT REQUIRED`

Every factual statement on `/privacy/` is traced below to the current actual behavior of the CPMS marketing/sales website repository (`themes/koorosh/demo-form.php`, `themes/koorosh/functions.php`, `reconstruction/demo/claims.md`, and `docs/TECHNICAL-FOUNDATION.md`). No legal, regulatory, or operational fact is invented.

| Section | Copy claim | Source | Classification |
| --- | --- | --- | --- |
| `#review-notice`, `#introduction` | The page is a design preview describing only the current behavior of the CPMS marketing/sales website and requires legal review and formal business details before public launch | Project governance (`AGENTS.md`, `docs/ROADMAP.md`) | `LEGAL REVIEW REQUIRED BEFORE PUBLIC LAUNCH` |
| `#collected-data` | The marketing website has no public user accounts, online checkout, or payment gateway; the only visitor submission route is the Demo / Consultation form (`/demo/`) | `docs/SITE-ARCHITECTURE.md` §10; `reconstruction/demo/claims.md` | Confirmed website architecture |
| `#collected-data` | The Demo form requests six qualification fields: `cpms_contact_name` (required), `cpms_org_name` (required), `cpms_contact_value` (required), `cpms_org_type` (required enum), `cpms_doctor_count` (required enum), and `cpms_discussion_topic` (optional, max 400 chars), plus internal form controls (`cpms_demo_submit`, `_cpms_demo_nonce`, `cpms_website_url` honeypot) | `themes/koorosh/demo-form.php` (`cpms_demo_form_allowed_post_keys()`, `cpms_demo_form_validate()`) | Confirmed code behavior |
| `#collected-data` | Requests containing POST keys outside the allowed form field list are rejected by the server (`unexpected_fields`), and the requested fields are used solely to evaluate fit and respond to the demo/consultation inquiry when live delivery is enabled | `themes/koorosh/demo-form.php` (`cpms_demo_form_validate()`, `cpms_demo_form_deliver()`) | Confirmed code behavior |
| `#no-patient-data` | Visitors must not submit patient or medical data (names, national IDs, chart numbers, clinical notes, diagnoses, prescriptions, scans, or insurance records); a server-side 10-digit heuristic helps catch national-ID-like sequences as a precaution, while responsibility for not entering patient data remains with the submitter | `themes/koorosh/demo-form.php` (`cpms_demo_form_looks_like_national_id()`); `reconstruction/demo/claims.md` | Confirmed code behavior & explicit boundary |
| `#delivery-and-storage` | Submitted Demo form payloads are not stored in the WordPress database (posts, meta, options, or custom tables) and are not written to application log files; in default development/preview mode, live delivery is disabled (`CPMS_DEMO_DELIVERY_ENABLED` is off by default) | `themes/koorosh/demo-form.php` (`cpms_demo_form_is_delivery_enabled()`, `cpms_demo_form_handle_post()`) | Confirmed code behavior |
| `#delivery-and-storage` | When live delivery is explicitly enabled in an operating environment, validated form fields are formatted as a plain-text message and handed to WordPress's configured `wp_mail()` transport toward the single authorized recipient (`biatoweb@gmail.com`), with `Reply-To` set only when `cpms_contact_value` is a valid email address | `themes/koorosh/demo-form.php` (`CPMS_DEMO_AUTHORIZED_RECIPIENT`, `cpms_demo_form_deliver()`); `reconstruction/demo/claims.md` | Confirmed Product Owner decision & code behavior |
| `#delivery-and-storage` | Absence of WordPress DB storage does not mean data never touches infrastructure or inboxes: web hosting, mail transport infrastructure, and the recipient mailbox may process or retain message data in the course of providing web/email service, and mail-layer acceptance does not guarantee inbox delivery or response time | `themes/koorosh/demo-form.php`; honest technical disclosure | Explicit technical & operational boundary |
| `#tracking-and-scripts` | No analytics, tag manager, or advertising/remarketing pixel is currently authorized or installed on the website; the Vazirmatn Persian font is self-hosted locally; anti-spam protection uses only an internal honeypot field (`cpms_website_url`) and no external CAPTCHA service | `themes/koorosh/functions.php`; `themes/koorosh/demo-form.php`; `docs/TECHNICAL-FOUNDATION.md` §7 | Confirmed code behavior |
| `#retention-and-contact` | No specific email inbox retention period or automatic deletion timeline has been approved yet; no absolute security, guaranteed confidentiality, or statutory compliance claim is made; `biatoweb@gmail.com` is the authorized demo-inquiry recipient and channel for questions about submitted demo-form data when active | Product Owner decision (`reconstruction/demo/claims.md`); honest governance boundary | `BUSINESS/LEGAL INPUT REQUIRED` for formal retention policy and legal entity details |

## Required Business & Legal Inputs Not Yet Provided (`BUSINESS/LEGAL INPUT REQUIRED`)

The following items are intentionally **not** invented on `/privacy/` and require formal Product Owner / legal counsel input before public launch:

- Registered legal entity / company name: `BUSINESS/LEGAL INPUT REQUIRED`
- Company registration number: `BUSINESS/LEGAL INPUT REQUIRED`
- Physical/postal address: `BUSINESS/LEGAL INPUT REQUIRED`
- Governing jurisdiction / competent court: `BUSINESS/LEGAL INPUT REQUIRED`
- Authorized legal representative: `BUSINESS/LEGAL INPUT REQUIRED`
- Tax / national legal identifier: `BUSINESS/LEGAL INPUT REQUIRED`
- Data Protection Officer (DPO) or formal privacy officer role: `BUSINESS/LEGAL INPUT REQUIRED`
- Approved email inbox retention period and deletion schedule: `BUSINESS/LEGAL INPUT REQUIRED`
- Statutory legal basis citation or regulatory compliance representation: `BUSINESS/LEGAL INPUT REQUIRED`
- Official business telephone number: `BUSINESS/LEGAL INPUT REQUIRED`
- Support or response SLA: `BUSINESS/LEGAL INPUT REQUIRED`

## Explicitly Excluded Fabrications

- No claim that "we never store data anywhere" (mail transport and email inboxes can retain messages).
- No invented retention period (e.g. 30 days, 90 days, 1 year) or deletion-timeline promise.
- No claim of absolute security, guaranteed confidentiality, or encryption-at-rest of external email inboxes.
- No GDPR, HIPAA, ISO 27001, SOC 2, or Iranian statutory/regulatory compliance claim.
- No invented hosting provider, SMTP vendor, CRM, or third-party processor names.
