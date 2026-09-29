/**
 * Patient-portal page authoring and message guardrails.
 * These checks prove composition/claim boundaries in the authored source, NOT product
 * capability truth and NOT runtime behavior (the browser runner covers runtime).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { patientPortal, pageIdentity } from '../../reconstruction/patient-portal/recipe.mjs';
import { pageIdentity as overviewIdentity } from '../../reconstruction/product-overview/recipe.mjs';
import { pageIdentity as appointmentIdentity } from '../../reconstruction/appointment-reception-queue/recipe.mjs';
import { pageIdentity as patientIdentity } from '../../reconstruction/patient-record-continuity/recipe.mjs';
import { pageIdentity as doctorIdentity } from '../../reconstruction/doctor-workspace/recipe.mjs';
const tokens = JSON.parse(readFileSync(new URL('../../design-system/tokens.json', import.meta.url)));
const nodes = patientPortal(tokens).flatMap(function walk(n) { return [n, ...n.children.flatMap(walk)]; });
const strings = nodes.map(n => n.settings.title || n.settings.editor || n.settings.text || '').filter(Boolean);
const copy = strings.join('\n');

// ---- Identity, SEO boundary and anti-cannibalization -------------------------
assert.equal(pageIdentity.slug, 'patient-portal');
assert.match(pageIdentity.title, /CPMS/);
assert(pageIdentity.title.length <= 100, 'Title stays within a sane meta length');
assert(pageIdentity.description.length > 50 && pageIdentity.description.length <= 200, 'Description within meta limits');
assert(pageIdentity.description.includes('مدیران'), 'Description carries the buyer marker');
for (const other of [overviewIdentity, appointmentIdentity, patientIdentity, doctorIdentity]) {
  assert(pageIdentity.slug !== other.slug && pageIdentity.title !== other.title, 'Identity must not duplicate another page');
}
const clusterOneHead = /نرم\s*افزار\s*مدیریت\s*(مطب|کلینیک)/;
assert(!clusterOneHead.test(pageIdentity.title), 'Cluster-1 head terms belong to Product Overview, not this page title');
assert(!clusterOneHead.test(pageIdentity.description), 'Cluster-1 head terms must not be targeted in the meta description');
assert(!clusterOneHead.test(copy), 'Cluster-1 head terms must not be restated in page copy');
// This is a supporting capability page, not the owner of the electronic-record cluster.
assert(!/پرونده الکترونیک بیمار/.test(pageIdentity.title), 'The Cluster-4 head belongs to the patient-record page, not this title');
assert(!/پرونده الکترونیک بیمار/.test(pageIdentity.description), 'The Cluster-4 head belongs to the patient-record page, not this description');
assert(!/پرونده الکترونیک بیمار/.test(copy), 'The Cluster-4 head belongs to the patient-record page, not this copy');
const h1Nodes = nodes.filter(n => n.kind === 'heading' && n.settings.header_size === 'h1');
assert.equal(h1Nodes.length, 1);
const h1 = h1Nodes[0].settings.title;
assert(h1.replace(/<br>/g, ' ').length <= tokens.typography.h1_policy.max_characters, 'H1 respects the token h1_policy character cap');
assert(/پورتال بیمار/.test(h1) && /جریان کار کلینیک/.test(h1), 'H1 carries the bounded portal identity and the clinic-workflow framing');
assert(!clusterOneHead.test(h1), 'H1 must not target Product Overview cluster heads');
assert(!/پرونده الکترونیک بیمار/.test(h1), 'H1 must not target the patient-record cluster head');
assert(/پورتال بیمار/.test(pageIdentity.title), 'Title carries the page identity phrase');
assert(/برای مدیران کلینیک/.test(pageIdentity.title), 'Title carries the buyer marker');
assert(/مدیران کلینیک|تصمیم‌گیران کلینیک/.test(copy), 'Buyer audience stated on-page');
// Broad patient navigation/search intent is disambiguated, never targeted.
for (const disambiguation of ['جذب بیمار', 'جست‌وجوی پزشک', 'نوبت‌گیری بیماران']) {
  assert(copy.includes(disambiguation), `Patient-navigation disambiguation present: ${disambiguation}`);
}
assert(!/جست‌وجوی پزشک[^.]{0,40}(بیابید|پیدا کنید|انتخاب کنید)/.test(copy), 'Doctor-search must stay a disambiguation, never an invitation');

// ---- Native Free elements, hierarchy, ids, links ----------------------------
assert(nodes.every(n => ['container', 'heading', 'text-editor', 'button'].includes(n.kind)), 'Native Free elements only');
const headings = nodes.filter(n => n.kind === 'heading');
const levels = headings.map(h => h.settings.header_size).filter(s => /^h\d$/.test(s)).map(s => Number(s.slice(1)));
assert.equal(levels[0], 1, 'H1 precedes subsection headings');
assert(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1), 'No skipped heading levels');
const ids = nodes.map(n => n.settings._element_id).filter(Boolean);
assert.equal(ids.length, new Set(ids).size, 'Element IDs are unique');
for (const sectionId of ['introduction', 'patient-side', 'connection', 'record-continuity', 'documents', 'access', 'not-this', 'fit', 'faq', 'next-step']) {
  assert(ids.includes(sectionId), `Required section ID missing: ${sectionId}`);
}
for (const boundaryId of ['patient-side-boundary', 'documents-distinction']) {
  assert(ids.includes(boundaryId), `Required explicit boundary note missing: ${boundaryId}`);
}
// Two-sides-of-the-experience model: patient side, neutral bridge, clinic side.
// Deliberately not the doctor-workspace handoff strip: no arrows, no stations,
// no synchronization implication — a neutral side-by-side composition instead.
assert(!/←|→/.test(copy), 'This page must not reuse the arrow-strip visual language of the doctor-workspace page');
const model = nodes.find(n => n.settings._element_id === 'connection-model');
assert(model, 'Two-sided connection model present');
assert.deepEqual(model.children.map(child => child.settings._element_id),
  ['side-patient', 'bridge-workflow', 'side-clinic'], 'Connection model: patient side, neutral bridge, clinic side in RTL DOM order');
assert.equal(model.children.length, 3, 'Exactly three positions in the connection model');
assert.equal(model.settings.flex_direction, 'row', 'Connection model stays horizontal on desktop');
assert.equal(model.settings.flex_direction_tablet, 'column', 'Connection model stacks on tablet/mobile');
const bridge = nodes.find(n => n.settings._element_id === 'bridge-workflow');
const sides = ['side-patient', 'side-clinic'].map(id => nodes.find(n => n.settings._element_id === id));
assert.equal(bridge.settings.background_color, tokens.color.roles['background/subtle'].value, 'Neutral bridge carries the subtle tint');
for (const side of sides) {
  assert.equal(side.settings.background_color, tokens.color.roles['surface/card'].value, `Side panel stays on card surface: ${side.settings._element_id}`);
  assert.equal(side.settings.html_tag, 'article', `Side panel is an article landmark: ${side.settings._element_id}`);
}
assert(!bridge.settings.html_tag, 'The neutral bridge is not a second article landmark');

// Buttons: only real existing pages; contextual patient-record + demo coverage.
const existingPages = ['/demo/', '/patient-record-continuity/'];
const buttons = nodes.filter(n => n.kind === 'button');
assert(buttons.length >= 4);
for (const n of buttons) {
  const url = n.settings.link.url;
  assert(url.startsWith('#') || existingPages.includes(url), `Link must be an in-page anchor or an existing reconstructed page: ${url}`);
  if (url.startsWith('#')) assert(ids.includes(url.slice(1)), `Anchor destination missing: ${url}`);
}
assert(buttons.some(n => n.settings.link.url === '/demo/'), 'Primary CTA links to the real Demo page');
assert(buttons.some(n => n.settings.link.url === '/patient-record-continuity/'), 'Contextual links to the real Patient Record page');
assert(buttons.filter(n => n.settings.link.url === '/patient-record-continuity/').length >= 2, 'Patient Record stays reachable from hero and body');
// Inline links: this page keeps navigation in buttons; at most a tiny inline network.
const inlineLinks = [...copy.matchAll(/<a href="([^"]+)">/g)].map(m => m[1]);
assert(inlineLinks.length <= 2, `Keep the inline link network small: ${inlineLinks}`);
for (const href of inlineLinks) {
  assert(href.startsWith('#') ? ids.includes(href.slice(1)) : existingPages.includes(href), `Inline link must resolve in-page or to an existing page: ${href}`);
}

// ---- Forbidden claims, absolute-security language, over-optimization --------
for (const pattern of [
  /درگاه پرداخت/, /حسابداری/, /بیمه/, /هوش مصنوعی/, /پوش‌نوتیفیکیشن/,
  /گواهی/, /انطباق قانونی/, /کاملاً امن/, /امن‌ترین/, /۱۰۰٪|۱۰۰ درصد|100%/, /تضمین/, /محفوظ/,
  /۲۴\s*[\/×]\s*۷|24\s*[\/×]\s*7/, /تومان|ریال/, /mailto:|tel:|https?:\/\//, /پیامک|پیام کوتاه|اس‌ام‌اس/,
  /بهترین/, /رایگان/, /یکپارچگی کامل|interoperability/i, /تشخیص خودکار|تشخیص بیماری/,
  /ویدیوکال|ویدیو مشاوره|تماس تصویری/, /تله‌مدیسین|طب از راه دور/,
  /کامل‌ترین/, /بدون رقیب/,
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
// The mobile-app term exists ONLY to deny the claim: every occurrence must be a
// negation or a question. A positive assertion would be an unsupported claim.
const mobileTerms = [/اپلیکیشن موبایل/];
assert(strings.some(value => mobileTerms[0].test(value)), 'The mobile-app objection must be addressed explicitly on this page');
for (const value of strings) {
  for (const term of mobileTerms) {
    if (term.test(value)) {
      assert(/نیست|نمی‌شود|نمی‌دهد|نمی‌دهند|ندارد|ندارند|خیر|بدون/.test(value) || isQuestion(value), `Mobile-app wording must stay negated or asked, never asserted: ${value.slice(0, 80)}`);
    }
  }
}
// No sentence may turn "connection" into an availability claim, and no sentence
// may present synchronization as offered behavior.
for (const value of strings) {
  assert(!/(اتصال|متصل)[^.]{0,60}(پشتیبانی می‌شود|پشتیبانی می‌کنیم|فعال است|فراهم است|امکان‌پذیر است|آماده است)/.test(value), `Integration availability must not be asserted: ${value.slice(0, 80)}`);
  assert(!/همگام‌سازی[^.]{0,40}(می‌شود|می‌کند|انجام می‌شود|فعال است|فراهم است)/.test(value), `Synchronization must not be presented as offered behavior: ${value.slice(0, 80)}`);
}
// Bounded capability wording that must remain visible.
for (const required of [
  'پروفایل، مراجعه‌ها، نسخه‌ها و فایل‌ها',
  'ادعای اپلیکیشن موبایل',
  'ثبت و مدیریت در محیط CPMS',
  'به‌خودی‌خود به معنای اتصال',
  'با اتصال به سامانهٔ ملی نسخهٔ الکترونیک یکی نیست',
  'نقش‌ها و دامنهٔ دسترسی',
  'تفکیک اطلاعات کلینیک/سازمان',
  'محدوده‌دار (scoped)',
  'سطح سازوکار است',
  'پیش از انتشار عمومی بازتأیید می‌شود',
  'ادعای این صفحه نیست',
  'فهرست عمومی بیماران',
  'نه ادعای همگام‌سازی خودکار',
  'مدل ارتباط خنثی',
  'بهبود اندازه‌گیری‌شده',
  'مطرح نیست',
  'غیرزنده',
  'داده‌های نمایشی',
  'این قاب، تصویر محیط نرم‌افزار نیست',
]) {
  assert(copy.includes(required), `Bounded wording must stay present: ${required}`);
}

// ---- Reserved media: exactly two editable frames, no fabricated imagery -----
assert(!nodes.some(n => n.kind === 'image'), 'Reserved media must not fabricate product imagery');
assert(!/phone|mobile-frame|mockup/i.test(JSON.stringify(nodes.map(n => n.settings._element_id))), 'No phone-frame or mockup reservations');
for (const id of ['product-media-portal', 'media-portal-surface', 'media-portal-disclosure', 'product-media-documents', 'media-documents-surface', 'media-documents-disclosure']) {
  assert(ids.includes(id), `Reserved media position missing: ${id}`);
}
const mediaWrappers = nodes.filter(n => n.settings._element_id && /^product-media-/.test(n.settings._element_id));
assert.equal(mediaWrappers.length, 2, 'At most two media reservations on this page');

// ---- Product Overview inbound link (architecture, not duplication) ----------
const overviewRecipe = readFileSync(new URL('../../reconstruction/product-overview/recipe.mjs', import.meta.url), 'utf8');
assert(overviewRecipe.includes('href="/patient-portal/"'), 'Product Overview carries the contextual inbound link to this page');
assert(overviewRecipe.includes('href="/appointment-reception-queue/"'), 'Product Overview keeps its existing workflow link');
assert(overviewRecipe.includes('href="/patient-record-continuity/"'), 'Product Overview keeps its existing patient-record link');
assert(overviewRecipe.includes('href="/doctor-workspace/"'), 'Product Overview keeps its existing doctor-workspace link');

// ---- Manifest / claims register integrity -----------------------------------
const manifest = JSON.parse(readFileSync(new URL('../../reconstruction/patient-portal/manifest.json', import.meta.url)));
assert.equal(manifest.publication, 'TARGET — NOT PUBLICATION-APPROVED');
assert(manifest.launch_blockers.some(b => /media/i.test(b)), 'Media launch blocker recorded');
assert(manifest.launch_blockers.some(b => /lead delivery/i.test(b)), 'Live lead delivery launch blocker recorded');
assert(/supporting (product\/capability|workflow) page/i.test(manifest.seo.intent) && /Product Overview/.test(manifest.seo.intent), 'Manifest records the supporting-page SEO boundary');
assert(/NOT claimed/.test(manifest.product_truth_boundary), 'Manifest records the non-claim set');
for (const key of ['canonical_recipe', 'claim_register', 'browser_runner']) assert(readFileSync(new URL('../../' + manifest[key], import.meta.url)).length > 0);
const claimsText = readFileSync(new URL('../../reconstruction/patient-portal/claims.md', import.meta.url), 'utf8');
assert(claimsText.includes('NOT CONFIGURED / NOT AUTHORIZED'), 'Claims register records the lead delivery blocker');
assert(claimsText.includes('must replace BOTH reserved frames before public launch'), 'Claims register records the media blocker');
assert(/does not own the primary clinic-software/.test(claimsText), 'Claims register records the non-ownership cluster boundary');
assert(!readFileSync(new URL('../../tests/browser/patient-portal.mjs', import.meta.url), 'utf8').includes('_elementor_data'), 'No private database payload authoring');
console.log(`PASS: Patient-portal page guardrails (${nodes.length} native Elementor Free elements; claims still require human/launch review)`);
