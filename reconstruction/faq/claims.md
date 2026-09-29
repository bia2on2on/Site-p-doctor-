# Global FAQ / buyer-objection page — content and claims register

**Status: TARGET — NOT PUBLICATION-APPROVED.** Trust + sales-conversion page for clinic decision-makers who have not yet requested a demo. It is **not** a capability, feature or workflow page: it introduces no new capability, and every answer restates a boundary already accepted on the destination pages at the same claim ceiling. Accepted sources: `docs/PRODUCT-TRUTH.md` (evidence SHA `cbf6e975eecc1009497eef861678904d49cbc304`; runtime/production **NOT VERIFIED**), `docs/SITE-ARCHITECTURE.md` §3 block H / §4.2 (FAQ is a Core-at-launch page) / §5.2–§5.3 / §6.4 / §8, `docs/SEO-KEYWORD-MAP.md` (§D ownership, §E boundary table, §I no automatic page authorization) and the merged `claims.md` of the five workflow pages. The CPMS product repository was **not** accessed: no answer required product-repo investigation, and unresolved capability points were weakened, negated or omitted instead.

## Structured data — deliberately omitted (retrieved Google guidance)

**Decision: the page emits no structured data.** Nothing in current official Google Search Central guidance justifies FAQ structured data for this site, and the project rule is stronger still: no schema merely to chase a rich result, and no structured data on a staging/no-index site.

Retrieved 2026-09-29 from Google Search Central's official update log (`https://developers.google.com/search/updates`):

- **May 2026 — «Deprecating the FAQ rich result feature»** (`#deprecating-the-faq-rich-result-feature`);
- **June 2026 — «Removing documentation for the FAQ rich result feature»** (`#removing-faq-rich-result`). The former FAQPage structured-data documentation URL now resolves to that update-log entry.

The FAQPage rich result is retired for **all** sites (the 2023 restriction to government/health sites is superseded), and Google states that unused structured data has no visible effect in Search. Google's own historic guidelines also warned against using FAQPage markup for advertising purposes — which is exactly what a sales FAQ would be doing. Corroborating entries in the same official log show the same direction of travel: September 2025 «Removing documentation for some deprecated structured data types», June 2025 «Retiring a few structured data features», January 2026 «Removing documentation for the practice problem structured data type».

This also matches repository policy: `docs/SITE-ARCHITECTURE.md` §5.3 allows structured data only in the Hardening phase, only for visible content, never fabricated, and performs no indexing setup while the site is intentionally non-indexed (`blog_public=0`). If FAQ markup is ever revisited, it must be re-argued from official documentation at that time — not from this page.

## What this page exists to do

Answer the questions a clinic decision-maker asks **before** requesting a demo, in four scannable themes (14 questions), and route every open question to the real Demo/Consultation page. Questions were selected from the accepted objection set; no question was added for search volume, and no competitor-comparison content exists anywhere on the page.

| Theme | Questions | Claim ceiling |
|---|---|---|
| شناخت CPMS و تناسب با کلینیک (۴) | چیستی CPMS و تفاوت با نوبت‌دهی ساده؛ تناسب با کلینیک‌های چندپزشکی؛ مجموعهٔ چندپزشکه؛ اتصال پذیرش و پزشک | #1 integrated appointment → reception → visit, in evaluation language; `SITE-ARCHITECTURE` §1 primary/secondary audience |
| جریان‌های کاری و محدودهٔ قابلیت‌ها (۵) | پروندهٔ بیمار؛ پورتال بیمار در برابر اپلیکیشن موبایل؛ حسابداری و درگاه پرداخت؛ بیمه و نسخهٔ الکترونیک؛ هوش مصنوعی | #10 clinic-scoped record; #7 bounded portal (profile/visits/prescriptions/files); #2 manual payment recording only; #11 recording inside CPMS; **no** national e-prescription, insurance, gateway, mobile app or AI claim |
| داده، دسترسی و ادعاهای امنیتی (۲) | نقش‌ها و دامنهٔ دسترسی؛ گواهی/انطباق | #4/#5/#6 mechanism-level wording only |
| ارزیابی، دمو و مسیر تصمیم (۳) | دیدن محیط واقعی؛ قیمت؛ مسیر درخواست | Conversion model; pricing boundary; safe non-live state |

## The eight high-risk misunderstandings, answered explicitly

1. **«CPMS فقط نوبت‌دهی است»** → «نوبت‌دهی یک بخش از مسیر مراجعه است، نه تمام محصول.»
2. **«حسابداری کامل است»** → «این کار معادل حسابداری کامل یا دفتر کل نیست» — the bounded manual payment-recording / financial-summary scope (#2) never becomes «حسابداری کامل».
3. **«به نسخهٔ الکترونیک ملی متصل است»** → «ادعای فعلی CPMS نیست»; only recording/management inside CPMS is claimed, and the phrase is capped at three mentions so it cannot become a target term.
4. **«اتصال بیمه دارد»** → same answer; insurance integration is not a current claim.
5. **«درگاه پرداخت آنلاین دارد»** → «از ادعاهای فعلی سایت نیست».
6. **«اپلیکیشن موبایل دارد»** → «خیر»; the bounded patient-facing area is inside the same product.
7. **«از هوش مصنوعی استفاده می‌کند»** → «خیر»; no clinical decision support or automatic diagnosis suggestion is presented either.
8. **«گواهی امنیتی / انطباق دارد»** → no certificate, compliance claim or absolute guarantee; what can be evaluated is the role/access/data-separation mechanism, and a specific requirement is raised in the session.

Every one of these answers ends by pointing at what **can** be evaluated (demo, offered version, or a mechanism description). A test enforces both the redirect requirement and a negated-clause ceiling (≤ 50%), so the page cannot drift into a disclaimer wall — the objection page must stay a buyer conversation.

## Pricing boundary

Public/fixed pricing has **not** been decided or published. The answer states only: «قیمت عمومی ثابتی در سایت اعلام نشده است. مسیر فعلی فروش بر پایهٔ بررسی نیاز و مشاوره است.» No figure, no package, no tier, no subscription, no per-user model, no discount, no comparison — enforced by test.

## Conversion and the non-live disclosure

Primary CTA (hero and final panel) routes to the real `/demo/` page, which remains the site's single supported conversion route. **LIVE LEAD DELIVERY = NOT CONFIGURED / NOT AUTHORIZED.** The page states this truthfully where a visitor would otherwise assume delivery — in the request-path answer and once in the final panel — and nowhere else, so the development limitation does not dominate the page. No contact data, phone number, email address, SLA or response-time promise is invented.

## SEO intent boundary

- The page carries the **objection/evaluation intent** the architecture assigns to FAQ («مانع تصمیمم را بردار»), not the primary clinic-software cluster. The Cluster-1 heads (`نرم‌افزار مدیریت مطب` / `نرم‌افزار مدیریت کلینیک`) appear in neither title, H1, description nor copy, and the page links to Product Overview rather than restating the product picture (SEO-KEYWORD-MAP §D).
- No self-awarded «بهترین», no fabricated ranking, no invented competitor weakness and no comparison table (Cluster 9 rules). The page contains no brand comparison of any kind.
- No keyword stuffing: question wording is buyer phrasing, not search phrasing, and the question count is capped by test.
- Structured data: none (see above).

## Layout decision — open answers, no accordion

The page deliberately uses an **open question/answer layout** rather than an accordion: an FAQ is not automatically a disclosure widget. Every answer is visible without a click, content stays crawlable in raw HTML, keyboard users never meet a hidden region, and no interaction script is needed. `docs/SITE-ARCHITECTURE.md` §8 describes an accessible disclosure pattern for FAQ surfaces but does not mandate one, and no accordion/`<details>` precedent exists anywhere in this repository. Tests assert that no accordion markup, toggle or script is introduced.

Each group is separated by a single-pixel rule aligned to the reading column, answers sit in the accepted narrow container (720px) at reading size, and no card wall, decorative icon or media frame is added. No new product-media reservation exists on this page.

## Architecture / linking

- **Discovery:** FAQ is added to the **footer** navigation only — the compact trust group described in `docs/SITE-ARCHITECTURE.md` §6.4 — through the canonical `reconstruction/site-shell/menu.mjs` definition and real WordPress menu APIs. The primary navigation is unchanged (no new top-level header item).
- Outbound links are three real destinations plus two clarifying workflow references: `/product-overview/` (hero + Q1), `/demo/` (hero CTA, request-path answer, final CTA), `/appointment-reception-queue/`, `/patient-record-continuity/`, `/patient-portal/` and `/prescriptions-documents/` — each inside the answer it genuinely clarifies. No new page, hub or link farm is created.

## Accessibility / responsive

One H1; H2 per theme; H3 per question; answers as plain paragraphs; native Elementor button/heading/text controls only; visible keyboard focus from the design-system focus tokens; natural RTL; no color-only meaning. Verified at 390×844, 768×1024, 1366×768 and 1920×1080 with no overflow, and with answer width capped to a comfortable measure.

## Release gates (unchanged)

No Product Truth item is `PUBLISHABLE NOW`. The visible staging notice and `blog_public=0` keep this fixture distinct from a public launch. Before public launch: complete the eight-step Launch Truth Gate, re-verify every answer against launch evidence (especially the reception scope, the bounded portal scope and the finance boundary), authorize live lead delivery, and perform production SEO/accessibility/performance checks. Static and browser guardrails are **not** proof that any capability described here exists or works.
