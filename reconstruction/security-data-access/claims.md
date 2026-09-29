# Security & Data Access trust page — content and claims register

**Status: TARGET — NOT PUBLICATION-APPROVED.** Trust page that helps a clinic decision-maker evaluate CPMS's access/data model honestly before requesting a demo. It is **not** a capability/workflow page and introduces no new capability.

Accepted sources: `docs/PRODUCT-TRUTH.md` (evidence SHA `cbf6e975eecc1009497eef861678904d49cbc304`; runtime/production **NOT VERIFIED**; §§3 #4 Roles/Access, #5 Clinic/Organization Data Separation, #6 Medical-Data Access Controls — all mechanism-level, all **REVERIFY BEFORE PUBLIC LAUNCH**, none `PUBLISHABLE NOW`), `docs/SITE-ARCHITECTURE.md` §4.2 (Security & Data Access is a Core-at-launch page), §5.2 (Security & Data Access row: informational/trust intent), §6.4 (footer trust group), §12 (trust architecture), `docs/SEO-KEYWORD-MAP.md` (§D ownership — this page does NOT own Cluster-1, §E boundary table — no certification/compliance claim), `docs/TECHNICAL-FOUNDATION.md` (Elementor reconstruction contract). The CPMS product repository was **not** accessed: no statement required product-repo investigation, and unresolved points were weakened or omitted.

## Purpose (buyer question)

«چه کسی به چه بخشی از اطلاعات دسترسی دارد و CPMS چگونه نقش‌ها و محدوده‌های کاری را از هم تفکیک می‌کند؟» — understandable to a clinic manager, not a security whitepaper.

## SEO intent boundary

- This is a **trust page**, not a high-volume keyword landing page. It does NOT chase «امن‌ترین نرم افزار مطب», compliance/certification phrases, or fear-based security terms.
- Does NOT cannibalize Product Overview: Cluster-1 heads (`نرم افزار مدیریت مطب` / `نرم افزار مدیریت کلینیک`) appear in neither title, H1 nor copy; page links to Product Overview for the complete picture.
- Metadata reflects honest buyer intent around «امنیت، نقش‌ها و دسترسی به داده در CPMS» without certification claim. Title: «امنیت و دسترسی به داده در CPMS | برای مدیران کلینیک». Description: clinic decision-maker phrasing about who accesses what and how roles/contexts are separated, with explicit no-certificate boundary.
- No SEO plugin. No FAQ structured data, no security-related structured data — follows existing project policy (Google deprecated FAQ rich result May 2026).

## Capability ceiling (PRODUCT-TRUTH §§3 #4/#5/#6 — all REVERIFY BEFORE PUBLIC LAUNCH)

| Recipe area | Accepted boundary | Deliberately not claimed |
|---|---|---|
| Hero — «دسترسی متناسب با نقش، در چارچوب کار کلینیک» | Bounded role/access/data-separation mechanisms, subject to launch verification; mechanism-level wording only | Absolute security, certification, compliance, availability, quantified improvement |
| Why access model matters | Doctor, reception, clinic-management roles do not necessarily need same operational view — commercial/operational framing only | Fear marketing, unsupported threats, clinical-safety claims |
| Role-based context | Role/access mechanisms at level accepted Product Truth permits; examples only when supported: doctor context, reception context, clinic/management context; explicit statement that this is NOT a detailed permission matrix | Detailed permission matrix, exact per-role action lists, invented controls, role counts, custom-role configuration promises |
| Data-separation context | Bounded data-separation mechanisms; clinic/organization-scoped data separation; multi-clinic model support discussed as architecture (Organization/Clinic/Location, Memberships, Context with Scope) if accepted evidence supports it, but without promising perfect tenant isolation | Perfect tenant isolation, guaranteed data isolation, guaranteed privacy/confidentiality, certification-level isolation, hosting/region guarantees |
| What this does NOT claim | One concise buyer-friendly clarification: وجود سازوکارهای نقش و دسترسی به‌معنای ادعای «امنیت صددرصدی»، دریافت گواهی امنیتی یا انطباق با استانداردی خاص نیست. Explicitly states page describes mechanisms at mechanism level, not as certificate/guarantee. Also states no encryption, backup, hosting, monitoring, audit logging, incident-response claim is made here. | Dominating disclaimer wall, absolute security wording, certification marks |
| What to verify in a demo | Evaluation checklist: which roles exist, what each role sees in relevant workflow, how clinic contexts are separated, what real product interface shows, what deployment/security requirements organization needs. No configuration options promised beyond evidence. | Configuration promises, custom roles, SSO, audit-log viewer, encryption toggles |
| FAQ / Objections (4) | آیا همه کاربران یک سطح دسترسی دارند؟ — No, role-based; آیا می‌توان درباره نقش‌ها در دمو بررسی کرد؟ — Yes; آیا این صفحه به معنی دریافت گواهی امنیتی است؟ — No; آیا CPMS را می‌توان «صددرصد امن» دانست؟ — No, absolute claim not made. All answers stay inside mechanism-level ceiling and end by pointing to demo/real interface. | Duplication of global FAQ (14 questions), certification, compliance, absolute security answers |
| CTA | Links to real /demo/, /product-overview/, /faq/. States non-live form state. | Live lead capture, response-time promises |

## Forbidden absolute/certification/compliance claims — absent by design

The page contains **none** of: 100% secure, completely secure, most secure, medical-grade security, certified, compliant, HIPAA compliant, GDPR compliant, ISO certified, penetration tested, encrypted everywhere, zero-trust, audited, guaranteed privacy, guaranteed confidentiality, guaranteed data isolation, امن‌ترین, صددرصد امن as a positive claim (only inside negations/questions), گواهی امنیتی as a positive claim, انطباق با استاندارد as a positive claim, رمزنگاری, پشتیبان, میزبانی, پایش, ثبت وقایع, واکنش به رخداد as offered capabilities.

Tests enforce absence of these phrases (case-insensitive for Latin, Persian forms for absolute security). Mechanism-level qualification wording is enforced as present: «سطح سازوکار», «سازوکارهای نقش», «پیش از انتشار عمومی بازتأیید می‌شود» or equivalent.

## Media — deliberately none

This page works without product screenshots. No reserved media placeholders, no padlock/shield cliché wall, no fake compliance badges, no fake certification marks, no fear imagery, no excessive cards, no stock security photography, no giant decorative gradients. If useful, links to existing product/workflow pages instead (Product Overview, FAQ).

## Architecture / linking

- Discovery: added to **footer** trust/discovery area only, through canonical `reconstruction/site-shell/menu.mjs` (compact, existing site-shell architecture supports it cleanly). **Not** added to primary top navigation automatically.
- Outbound links: small useful set — `/demo/` (primary CTA hero + final), `/product-overview/` (hero secondary, verification checklist caption, final caption), `/faq/` (final secondary, checklist caption). No new page, hub or link farm. All resolve to real reconstructed pages.
- No external links, no contact data invention.

## Accessibility / responsive

One H1; H2 per major section; H3 per role/context/checklist/FAQ item; logical heading order (H1 → H2 → H3, no skipped levels); native Elementor button/heading/text controls only; visible keyboard focus from design-system focus tokens; natural RTL; readable Persian; accessible links/CTA; sufficient contrast (tokens); no color-only meaning. Verified at 390×844, 768×1024, 1366×768, 1920×1080 with no overflow and comfortable mobile reading width.

## Conversion and non-live disclosure

Primary CTA routes to real `/demo/` page. **LIVE LEAD DELIVERY = NOT CONFIGURED / NOT AUTHORIZED.** Page states truthfully where a visitor would assume delivery — final panel caption and hero caption context — that no information is sent/stored in this preview. No contact data, phone, email, SLA or response-time promise invented.

## Release gates (unchanged)

No Product Truth item is `PUBLISHABLE NOW`. Visible staging notice and `blog_public=0` keep this fixture distinct from public launch. Before public launch: complete eight-step Launch Truth Gate, re-verify all copy against launch evidence (especially roles #4, data separation #5, medical-data access #6, multi-clinic #3), authorize live lead delivery, perform production SEO/accessibility/performance checks. Static/boundary tests are guardrails, **not** product security verification.
