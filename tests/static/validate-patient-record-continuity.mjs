/**
 * Patient-record / information-continuity page authoring and message guardrails.
 * These checks prove composition/claim boundaries in the authored source, NOT product
 * capability truth and NOT runtime behavior (the browser runner covers runtime).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { patientRecordContinuity, pageIdentity } from '../../reconstruction/patient-record-continuity/recipe.mjs';
import { pageIdentity as overviewIdentity } from '../../reconstruction/product-overview/recipe.mjs';
import { pageIdentity as appointmentIdentity } from '../../reconstruction/appointment-reception-queue/recipe.mjs';
const tokens = JSON.parse(readFileSync(new URL('../../design-system/tokens.json', import.meta.url)));
const nodes = patientRecordContinuity(tokens).flatMap(function walk(n) { return [n, ...n.children.flatMap(walk)]; });
const strings = nodes.map(n => n.settings.title || n.settings.editor || n.settings.text || '').filter(Boolean);
const copy = strings.join('\n');

// ---- Identity, SEO boundary and anti-cannibalization -------------------------
assert.equal(pageIdentity.slug, 'patient-record-continuity');
assert.match(pageIdentity.title, /CPMS/);
assert(pageIdentity.title.length <= 100, 'Title stays within a sane meta length');
assert(pageIdentity.description.length > 50 && pageIdentity.description.length <= 200, 'Description within meta limits');
assert(pageIdentity.description.includes('مدیران'), 'Description carries the buyer marker');
assert.equal(pageIdentity.slug, 'patient-record-continuity');
for (const other of [overviewIdentity, appointmentIdentity]) {
  assert(pageIdentity.slug !== other.slug && pageIdentity.title !== other.title, 'Identity must not duplicate another page');
}
const clusterOneHead = /نرم\s*افزار\s*مدیریت\s*(مطب|کلینیک)/;
assert(!clusterOneHead.test(pageIdentity.title), 'Cluster-1 head terms belong to Product Overview, not this page title');
assert(!clusterOneHead.test(pageIdentity.description), 'Cluster-1 head terms must not be targeted in the meta description');
assert(!clusterOneHead.test(copy), 'Cluster-1 head terms must not be restated in page copy');
const h1Nodes = nodes.filter(n => n.kind === 'heading' && n.settings.header_size === 'h1');
assert.equal(h1Nodes.length, 1);
const h1 = h1Nodes[0].settings.title;
assert(h1.replace(/<br>/g, ' ').length <= tokens.typography.h1_policy.max_characters, 'H1 respects the token h1_policy character cap');
// Cluster-4 rule: bounded phrasing and explicit clinic scope, never the bare head.
assert(/پروندهٔ بیمار و تداوم اطلاعات/.test(h1) && /محدودهٔ کلینیک/.test(h1), 'H1 carries the page identity and the clinic-scope qualifier');
assert(!clusterOneHead.test(h1), 'H1 must not target Product Overview cluster heads');
assert(/پرونده الکترونیک بیمار/.test(pageIdentity.title), 'Title targets the bounded Cluster-4 phrase');
assert(/محدودهٔ کلینیک/.test(pageIdentity.title), 'Title states the clinic scope (institutional-ambiguity guard)');
assert(/پروندهٔ? الکترونیک بیمار/.test(copy) && /همین کلینیک/.test(copy), 'Bounded electronic-record phrase is used with explicit clinic scope in content');
assert(/مدیران کلینیک|تصمیم‌گیران کلینیک/.test(copy), 'Buyer audience stated on-page');
assert(/مسیر دسترسی خود بیمار به اطلاعاتش نیست/.test(copy), 'Patient-navigation disambiguation present');

// ---- Native Free elements, hierarchy, ids, links ----------------------------
assert(nodes.every(n => ['container', 'heading', 'text-editor', 'button'].includes(n.kind)), 'Native Free elements only');
const headings = nodes.filter(n => n.kind === 'heading');
const levels = headings.map(h => h.settings.header_size).filter(s => /^h\d$/.test(s)).map(s => Number(s.slice(1)));
assert.equal(levels[0], 1, 'H1 precedes subsection headings');
assert(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1), 'No skipped heading levels');
const ids = nodes.map(n => n.settings._element_id).filter(Boolean);
assert.equal(ids.length, new Set(ids).size, 'Element IDs are unique');
for (const sectionId of ['introduction', 'problem', 'information-flow', 'record-context', 'doctor-workspace', 'documents', 'patient-portal', 'access', 'fit', 'faq', 'next-step']) {
  assert(ids.includes(sectionId), `Required section ID missing: ${sectionId}`);
}
for (const boundaryId of ['scope-boundary', 'record-boundary', 'documents-distinction', 'patient-portal-boundary']) {
  assert(ids.includes(boundaryId), `Required explicit boundary note missing: ${boundaryId}`);
}
const stages = nodes.filter(n => n.settings._element_id && /^stage-/.test(n.settings._element_id));
assert.deepEqual(stages.map(n => n.settings._element_id), ['stage-context', 'stage-workspace', 'stage-document', 'stage-follow-up'], 'Four continuity stages in RTL DOM order');
assert(ids.includes('continuity-stages'), 'Continuity stage row has an anchorable id');
const existingPages = ['/demo/', '/product-overview/', '/appointment-reception-queue/'];
const buttons = nodes.filter(n => n.kind === 'button');
assert(buttons.length >= 4);
for (const n of buttons) {
  const url = n.settings.link.url;
  assert(url.startsWith('#') || existingPages.includes(url), `Link must be an in-page anchor or an existing reconstructed page: ${url}`);
  if (url.startsWith('#')) assert(ids.includes(url.slice(1)), `Anchor destination missing: ${url}`);
}
assert(buttons.some(n => n.settings.link.url === '/demo/'), 'Primary CTA links to the real Demo page');
assert(buttons.some(n => n.settings.link.url === '#information-flow'), 'Secondary hero CTA links to the on-page flow');
assert(buttons.some(n => n.settings.link.url === '/product-overview/'), 'Continuity links to the real Product Overview page');
// Inline contextual links: only real anchors or existing pages, and both directions documented.
const inlineLinks = [...copy.matchAll(/<a href="([^"]+)">/g)].map(m => m[1]);
assert(inlineLinks.length >= 2, 'Contextual inline links present');
for (const href of inlineLinks) {
  assert(href.startsWith('#') ? ids.includes(href.slice(1)) : existingPages.includes(href), `Inline link must resolve in-page or to an existing page: ${href}`);
}
assert(inlineLinks.includes('#access'), 'Access/data-separation section is linked contextually');
assert(inlineLinks.includes('/appointment-reception-queue/'), 'Related real workflow page is linked contextually');

// ---- Forbidden claims, absolute-security language, over-optimization --------
for (const pattern of [
  /درگاه پرداخت/, /حسابداری/, /بیمه/, /هوش مصنوعی/, /اپلیکیشن موبایل/, /پوش‌نوتیفیکیشن/,
  /گواهی/, /انطباق قانونی/, /کاملاً امن/, /امن‌ترین/, /۱۰۰٪|۱۰۰ درصد|100%/, /تضمین/, /محفوظ/,
  /۲۴\s*[\/×]\s*۷|24\s*[\/×]\s*7/, /تومان|ریال/, /mailto:|tel:|https?:\/\//, /پیامک|پیام کوتاه|اس‌ام‌اس/,
  /بهترین/, /رایگان/, /یکپارچگی کامل|interoperability/i, /تشخیص خودکار|تشخیص بیماری/,
]) {
  assert(!pattern.test(copy), `Forbidden claim/contact matched: ${pattern}`);
}
// The reserved institutional terms may appear ONLY as negated statements or as questions.
const nationalTerms = [/سامانهٔ ملی/, /نسخهٔ الکترونیک ملی/, /پروندهٔ الکترونیک سلامت/, /کشوری/];
const isQuestion = value => /؟\s*$/.test(value.trim());
for (const value of strings) {
  for (const term of nationalTerms) {
    if (term.test(value)) {
      assert(/نیست|نمی‌شود|نمی‌دهد|نمی‌دهند|ندارد|ندارند|خیر|بدون/.test(value) || isQuestion(value), `National/institutional term must stay negated or asked, never asserted: ${value.slice(0, 80)}`);
    }
  }
}
// No sentence may turn "connection" into an availability claim.
for (const value of strings) {
  assert(!/(اتصال|متصل)[^.]{0,60}(پشتیبانی می‌شود|پشتیبانی می‌کنیم|فعال است|فراهم است|امکان‌پذیر است|آماده است)/.test(value), `Integration availability must not be asserted: ${value.slice(0, 80)}`);
}
assert(/ادعای این صفحه نیست/.test(copy), 'Hero scope note states the non-claim explicitly');
assert(/ادعای فعلی این سایت نیست/.test(copy), 'Documents/FAQ state the national e-prescription non-claim explicitly');
assert(/ثبت و مدیریت در محیط CPMS/.test(copy) && /سامانهٔ ملی نسخهٔ الکترونیک/.test(copy), 'Recording-in-CPMS versus national e-prescription distinction is explicit');
assert(/نه سامانهٔ ملی/.test(copy), 'National e-prescription cannot be conflated with in-CPMS recording');
// Mechanism-level access language, no absolute security claim.
for (const allowed of ['نقش‌ها و دامنهٔ دسترسی', 'تفکیک اطلاعات کلینیک/سازمان', 'محدوده‌دار (scoped)', 'سطح سازوکار است']) {
  assert(copy.includes(allowed), `Access section must keep mechanism-level wording: ${allowed}`);
}
assert(/پشتیبانی تصمیم بالینی، هشدار خودکار یا پیشنهاد تشخیص معرفی نمی‌شود/.test(copy), 'No clinical decision support invented');
assert(/داده‌های نمایشی/.test(copy), 'Reserved media captions name synthetic/demo data');
assert(/این قاب، تصویر محیط نرم‌افزار نیست/.test(copy), 'Reserved media disclosure present');
assert(/غیرزنده/.test(copy), 'Non-live conversion mode disclosed');
assert(/پیش از انتشار عمومی بازتأیید می‌شود/.test(copy), 'Access wording carries the pre-launch re-verification caveat');

// ---- Reserved media: exactly two editable frames, no fabricated imagery -----
assert(!nodes.some(n => n.kind === 'image'), 'Reserved media must not fabricate product imagery');
for (const id of ['product-media-record', 'media-record-surface', 'media-record-disclosure', 'product-media-document', 'media-document-surface', 'media-document-disclosure']) {
  assert(ids.includes(id), `Reserved media position missing: ${id}`);
}
const mediaWrappers = nodes.filter(n => n.settings._element_id && /^product-media-/.test(n.settings._element_id));
assert.equal(mediaWrappers.length, 2, 'At most two media reservations on this page');

// ---- Product Overview inbound link (architecture, not duplication) ----------
const overviewNodes = readFileSync(new URL('../../reconstruction/product-overview/recipe.mjs', import.meta.url), 'utf8');
assert(overviewNodes.includes('href="/patient-record-continuity/"'), 'Product Overview carries the contextual inbound link to this page');
assert(overviewNodes.includes('href="/appointment-reception-queue/"'), 'Product Overview keeps its existing workflow link');

// ---- Manifest / claims register integrity ----------------------------------
const manifest = JSON.parse(readFileSync(new URL('../../reconstruction/patient-record-continuity/manifest.json', import.meta.url)));
assert.equal(manifest.publication, 'TARGET — NOT PUBLICATION-APPROVED');
assert(manifest.launch_blockers.some(b => /media/i.test(b)), 'Media launch blocker recorded');
assert(manifest.launch_blockers.some(b => /lead delivery/i.test(b)), 'Live lead delivery launch blocker recorded');
assert(/Cluster 4/.test(manifest.seo.intent), 'Manifest records the Cluster-4 intent boundary');
assert(/NOT claimed/.test(manifest.product_truth_boundary), 'Manifest records the non-claim set');
for (const key of ['canonical_recipe', 'claim_register', 'browser_runner']) assert(readFileSync(new URL('../../' + manifest[key], import.meta.url)).length > 0);
const claimsText = readFileSync(new URL('../../reconstruction/patient-record-continuity/claims.md', import.meta.url), 'utf8');
assert(claimsText.includes('NOT CONFIGURED / NOT AUTHORIZED'), 'Claims register records the lead delivery blocker');
assert(claimsText.includes('must replace BOTH reserved frames before public launch'), 'Claims register records the media blocker');
assert(/not the commercial head/.test(claimsText) || /never the commercial head/.test(claimsText), 'Claims register records the bare-head boundary');
assert(!readFileSync(new URL('../../tests/browser/patient-record-continuity.mjs', import.meta.url), 'utf8').includes('_elementor_data'), 'No private database payload authoring');
console.log(`PASS: Patient-record / continuity page guardrails (${nodes.length} native Elementor Free elements; claims still require human/launch review)`);
