# Contact Page («تماس با ما» /contact/) Content & Claims Register

**Status:** TARGET — NOT PUBLICATION-APPROVED
**Reference Documents:** `docs/PRODUCT-TRUTH.md`, `docs/SITE-ARCHITECTURE.md` §6.3–6.4, `AGENTS.md` §6
**Page role:** utility / trust page — no commercial keyword optimization, no structured data.

---

## 1. Page purpose (exactly two routes)

1. **درخواست دمو / مشاوره** → `/demo/` — the dedicated demo/consultation evaluation page keeps
   its qualification form and its documented two-mode lead-delivery model. This Contact page
   contains **no form** and is explicitly **not a second lead form**.
2. **ارتباط عمومی** — the public contact details rendered at runtime from Koorosh Theme Settings
   (see §3).

Nothing else is claimed here: no About content, no Support content, no features, no pricing.

## 2. Truth boundaries

- **NO SUPPORT CLAIM.** The words «پشتیبانی»، «پاسخگویی ۲۴ ساعته» and «تیم پشتیبانی» do not
  appear anywhere in this page's copy. **The support model remains UNVERIFIED / UNDEFINED**;
  this page is a general contact route only and must never be described as a support channel.
- **NO DELIVERY OR RESPONSE-TIME PROMISE.** The demo-route copy states plainly that submitting
  the demo form guarantees neither message delivery nor a response time (consistent with the
  Demo page's honesty contract: `wp_mail()` acceptance is mail-layer handoff only; delivery is
  dual-gated and default OFF).
- **NO INVENTED FACTS.** No phone, address, office, company name, business hours, response
  time, WhatsApp, Telegram or social profile is invented anywhere. Phone/address rows appear
  only if an administrator configures them; empty optional fields render no row at all.
- **NO PHI CHANNEL.** A short, explicit clarification asks visitors not to send patient or
  medical information through public contact channels.
- **NO SECOND FORM, NO CONSENT CHECKBOX.** The page has no form element and adds no consent
  UI. The privacy disclosure is a small crawlable link to `/privacy/`.

## 3. Contact values are settings-driven (not page copy)

The page embeds exactly one theme-owned shortcode, `[cpms_contact_details]`
(`themes/koorosh/contact-details.php`). It is narrowly scoped on purpose:

- it exists so the Elementor layout stays editable while the **values** remain global
  operational settings (تنظیمات کوروش → اطلاعات تماس), changeable by an administrator with
  `manage_options` and **no page rebuild and no code edit**;
- it accepts **no attributes** and interprets none; its output is a fixed template of at most
  three rows (email / phone / address), every fragment escaped (`esc_html` / `esc_attr` /
  `esc_url`), built only from `koorosh_get_setting()` reads (which re-sanitize on every read);
- the Elementor marketing content never freezes the email address as authored copy.

### Public contact email vs lead recipient (separate roles)

| Role | Setting | Resolver / default source | Current authorized value |
| --- | --- | --- | --- |
| Public/general contact (visible on `/contact/`) | `contact_email` | `cpms_contact_public_email()` / `cpms_contact_public_default_email()` | `biatoweb@gmail.com` |
| Lead recipient (sales/demo mail delivery) | `lead_recipient` | `cpms_lead_delivery_recipient()` / `cpms_lead_delivery_default_recipient()` (`demo-form.php`) | `biatoweb@gmail.com` |

- **Product Owner decision (2026-09-30):** the currently authorized public/general contact
  email is **biatoweb@gmail.com**. Project configuration evidence only — **not** a
  registered-company identity, **not** a support channel.
- The two roles may currently equal the same address but are **independent settings with
  independent defaults**: changing one must NOT silently change the other. Empty/invalid
  `contact_email` falls back to the authorized **public** default (never to `lead_recipient`).
- The Demo lead-delivery logic and its dual gate are untouched by this slice.

## 4. Accessibility & rendering contract

- Exactly one H1 («تماس با ما»); meaningful H2 sections; RTL Persian layout.
- Email/phone links carry understandable labels (visible field label + accessible name) and
  normal `mailto:` / `tel:` destinations; the `tel:` destination is normalized safely
  (Persian/Arabic digits → ASCII, separators dropped, one leading `+` preserved).
- Phone and address rows render **only when configured**; empty optional fields produce **no**
  empty rows, cards or placeholders.
- Keyboard focus is visible on the CTA and contact links; no horizontal overflow at
  390×844, 768×1024, 1366×768 and 1920×1080.

## 5. SEO & schema

- Utility/trust page with a unique title («تماس با ما | CPMS») and unique meta description.
- **No commercial keyword stuffing. No Organization schema. No LocalBusiness schema.**
  No structured data of any kind is emitted.
- Development indexing stays non-indexed (`blog_public = 0` layer unchanged).

## 6. Navigation integration

- Footer menu gains «تماس با ما» → `/contact/` (SITE-ARCHITECTURE §6.4 utility placement).
  Primary header navigation is **unchanged**.
- The Demo page gains one small alternative-contact line linking to `/contact/` — truthful
  wording only, with no implication about delivery or response.
