/**
 * Static guardrails for the global FAQ / buyer-objection page.
 *
 * Proves authoring shape (native Free elements, one H1, bounded question set),
 * the objection-answer boundaries against PRODUCT-TRUTH, the pricing and
 * live-lead-delivery wording, the deliberate open (non-accordion) layout, the
 * structured-data omission decision, and the internal-link budget.
 *
 * These are guardrails, NOT product capability verification, and NOT proof that
 * every sentence is truthful: docs/PRODUCT-TRUTH.md remains the claim ceiling and
 * all copy stays REVERIFY BEFORE PUBLIC LAUNCH.
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { faqPage, faqGroups, faqCopy, faqAnswers, faqQuestions, pageIdentity } from '../../reconstruction/faq/recipe.mjs';
import {
  assertNoHardForbidden, assertBoundaryTermsNegated, assertPersianTypography, assertObjectionPageShape,
  requiredQuestions, pricingPhrase, nonLiveTerms, stripTags,
} from './boundary-faq.mjs';

const read = rel => readFileSync(new URL('../../' + rel, import.meta.url), 'utf8');
const tokens = JSON.parse(read('design-system/tokens.json'));
const walk = n => [n, ...n.children.flatMap(walk)];
const nodes = faqPage(tokens).flatMap(walk);

// ---- 1. Identity and SEO ownership -----------------------------------------
assert.equal(pageIdentity.slug, 'faq', 'Page slug must be "faq"');
assert.match(pageIdentity.title, /CPMS/, 'Title keeps the product identifier');
assert.match(pageIdentity.title, /پرسش/, 'Title reflects the question-answering intent');
assert.match(pageIdentity.title, /مدیران کلینیک/, 'Title keeps the clinic buyer marker');
assert(pageIdentity.description.length > 50 && pageIdentity.description.length <= 200, 'Meta description within limits');
const titleAndH1 = `${pageIdentity.title}\n${pageIdentity.description}\n${nodes.filter(n => n.settings.header_size === 'h1').map(n => n.settings.title).join('\n')}`;
for (const head of [/نرم‌افزار مدیریت (?:مطب|کلینیک)/, /نرم افزار مدیریت (?:مطب|کلینیک)/, /مدیریت مطب/]) {
  assert(!head.test(titleAndH1), `FAQ must not take the Cluster-1 head term: ${head}`);
}
assert(!/بهترین/.test(titleAndH1), 'No self-awarded «بهترین» wording');

// ---- 2. Native authoring shape ---------------------------------------------
assert(nodes.every(n => ['container', 'heading', 'text-editor', 'button'].includes(n.kind)), 'Native Free Elementor controls only');
const ids = nodes.map(n => n.settings._element_id).filter(Boolean);
assert.equal(ids.length, new Set(ids).size, 'All _element_id values must be unique');
for (const sectionId of ['review-notice', 'introduction', ...faqGroups.map(g => g.id), 'next-step']) {
  assert(ids.includes(sectionId), `Required section ID missing: ${sectionId}`);
}
const headings = nodes.filter(n => n.kind === 'heading');
assert.equal(headings.filter(n => n.settings.header_size === 'h1').length, 1, 'Exactly one H1');
const levels = headings.map(h => Number(String(h.settings.header_size).slice(1))).filter(level => level > 0);
assert.equal(levels[0], 1, 'First heading is the H1');
for (let i = 1; i < levels.length; i++) assert(levels[i] <= levels[i - 1] + 1, `No skipped heading levels: h${levels[i - 1]} then h${levels[i]}`);
assert(!nodes.some(n => n.kind === 'image'), 'No fabricated product imagery');
assert(!/MEDIA REQUIRED|رسانهٔ تأییدشده/.test(JSON.stringify(nodes)), 'No new product-media reservation on this page');

// ---- 3. Bounded, grouped, scannable question set ---------------------------
assert(faqGroups.length >= 3 && faqGroups.length <= 4, 'Between 3 and 4 themes');
assert(faqCopy.length >= 10 && faqCopy.length <= 14, `Question set stays bounded and useful (${faqCopy.length})`);
assert.equal(new Set(faqQuestions).size, faqQuestions.length, 'Questions are unique (no filler duplicates)');
for (const group of faqGroups) {
  assert(group.questions.length >= 2 && group.questions.length <= 6, `Group ${group.id} stays scannable`);
  for (const item of group.questions) {
    assert(/؟$/.test(item.q), `Question must be an actual question: ${item.q}`);
    assert(item.a.length > 80 && item.a.length < 420, `Answer stays concise: ${item.q}`);
  }
}
const questionHeadings = headings.filter(h => h.settings.header_size === 'h3').map(h => h.settings.title);
assert.deepEqual(questionHeadings, faqQuestions, 'Every question is an H3 in order, and no other H3 exists');
for (const q of requiredQuestions) assert(faqQuestions.includes(q), `High-risk buyer question missing: ${q}`);

// ---- 4. Claim boundaries ----------------------------------------------------
const rendered = nodes.map(n => n.settings.title || n.settings.editor || n.settings.text || '').filter(Boolean);
assertNoHardForbidden([...rendered, pageIdentity.title, pageIdentity.description], 'FAQ copy');
const checkedClauses = assertBoundaryTermsNegated(rendered, 'FAQ copy');
assert(checkedClauses >= 8, `Boundary wording must actually be present and checked (${checkedClauses})`);
assertPersianTypography([...rendered, pageIdentity.title, pageIdentity.description], 'FAQ copy');
const shape = assertObjectionPageShape(faqAnswers, 'FAQ answers');
// The eight high-risk misunderstandings land as negations, not as claims.
for (const [question, expectation] of [
  ['CPMS چیست و چه تفاوتی با یک سیستم نوبت‌دهی ساده دارد؟', /نوبت‌دهی یک بخش از مسیر مراجعه است، نه تمام محصول/],
  ['آیا CPMS نرم‌افزار حسابداری کامل است یا درگاه پرداخت آنلاین دارد؟', /معادل حسابداری کامل یا دفتر کل نیست/],
  ['آیا CPMS به بیمه یا نسخهٔ الکترونیک ملی متصل است؟', /ادعای فعلی CPMS نیست/],
  ['پورتال بیمار یعنی اپلیکیشن موبایل؟', /خیر/],
  ['آیا CPMS از هوش مصنوعی استفاده می‌کند؟', /ادعاهای فعلی CPMS نیست/],
  ['آیا CPMS گواهی امنیتی یا تأییدیهٔ انطباق دارد؟', /ادعا نمی‌شود/],
]) {
  const answer = stripTags(faqCopy.find(item => item.q === question).a);
  assert(expectation.test(answer), `Boundary answer must stay explicit: ${question}`);
}
const mentions = (faqCopy.map(i => `${i.q} ${i.a}`).join(' ').match(/نسخهٔ?\s*الکترونیک/gu) ?? []).length;
assert(mentions <= 3, `National e-prescription is answered, not targeted (${mentions} mentions)`);
assert(!/کاملاً امن|امنیت مطلق(?!ی)/.test(faqAnswers.join(' ').replace(/نیست و نه تضمین مطلق/, '')), 'No absolute security wording');

// ---- 5. Pricing, demo and live-lead-delivery honesty -----------------------
assert(faqAnswers.some(a => a.includes(pricingPhrase)), 'Pricing answer uses the accepted boundary sentence');
const pricingAnswer = stripTags(faqAnswers.find(a => a.includes(pricingPhrase)));
assert(!/بسته|اشتراک|کاربر|لایسنس|تخفیف|عدد/.test(pricingAnswer), 'Pricing answer implies no package, subscription, per-user model or discount');
assert(!/[\d۰-۹]/.test(pricingAnswer), 'Pricing answer carries no figure');
assert(nonLiveTerms.some(term => term.test(faqAnswers.join('\n'))), 'The current non-live lead-delivery state is stated once, honestly');

// ---- 6. Structured data is deliberately omitted -----------------------------
// Google deprecated the FAQ rich result (May 2026) and removed its documentation
// (June 2026); the FAQPage documentation URL now redirects to that update log.
// Unused structured data has no visible Search effect, so no schema is emitted
// here — never add schema only to chase a rich result.
const serialized = JSON.stringify(faqPage(tokens));
for (const pattern of [/ld\+json/, /FAQPage/i, /schema\.org/i, /"@type"/, /itemscope|itemtype/i, /application\/ld/]) {
  assert(!pattern.test(serialized), `No structured data on the FAQ page: ${pattern}`);
}
const recipeSource = read('reconstruction/faq/recipe.mjs');
assert(!/ld\+json|FAQPage|schema\.org/.test(recipeSource), 'Recipe must not emit structured data');
const claims = read('reconstruction/faq/claims.md');
for (const marker of ['FAQ rich result', 'Deprecating the FAQ rich result feature', 'Removing documentation for the FAQ rich result feature', 'developers.google.com/search/updates']) {
  assert(claims.includes(marker), `claims.md must record the structured-data decision and its official source: ${marker}`);
}

// ---- 7. Deliberate open layout (no accordion, no interaction script) --------
for (const pattern of [/<details/i, /<summary/i, /accordion/i, /aria-expanded/i, /toggle/i, /<script/i]) {
  assert(!pattern.test(serialized), `FAQ stays an open, script-free disclosure layout: ${pattern}`);
}

// ---- 8. Link budget ---------------------------------------------------------
const buttons = nodes.filter(n => n.kind === 'button');
assert(buttons.length > 0, 'A conversion route must exist');
for (const btn of buttons) {
  assert(['/demo/', '/product-overview/'].includes(btn.settings.link.url), `Unexpected button destination: ${btn.settings.link.url}`);
  assert.equal(btn.settings.align, 'right', 'RTL button alignment stays native');
}
assert(buttons.some(b => b.settings.link.url === '/demo/'), 'Primary demo CTA routes to the real /demo/ page');
const internalLinks = [...new Set((rendered.join('\n').match(/href="([^"]+)"/g) ?? []).map(m => m.slice(6, -1)))].sort();
assert.deepEqual(internalLinks, [
  '/appointment-reception-queue/', '/demo/', '/patient-portal/', '/patient-record-continuity/', '/prescriptions-documents/', '/product-overview/',
], 'Internal links stay a small, real set (Product Overview, four clarifying workflow pages, Demo)');
assert(!/https?:\/\/(?!developers\.google)/.test(serialized.replace(/href="[^"]*"/g, '')), 'No external links are introduced');

// ---- 9. Manifest + claim register wiring ------------------------------------
const manifest = JSON.parse(read('reconstruction/faq/manifest.json'));
assert.equal(manifest.publication, 'TARGET — NOT PUBLICATION-APPROVED');
assert(manifest.lead_delivery.includes('NOT CONFIGURED / NOT AUTHORIZED'), 'Lead-delivery blocker stays recorded');
assert(manifest.structured_data.includes('NONE'), 'Manifest records the structured-data omission');
for (const key of ['canonical_recipe', 'claim_register', 'browser_runner']) {
  assert(manifest[key] && existsSync(new URL('../../' + manifest[key], import.meta.url)), `Manifest path missing: ${manifest[key]}`);
}

console.log(
  `PASS: FAQ authoring + objection boundaries (${nodes.length} native Elementor Free elements; ${faqGroups.length} themes / ${faqCopy.length} questions; ` +
  `${checkedClauses} boundary clauses negated-or-asked; redirects ${shape.redirects}; negated-clause share ${shape.negatedShare}; structured data omitted)`,
);
