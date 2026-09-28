/**
 * Doctor-workspace page authoring and message guardrails.
 * These checks prove composition/claim boundaries in the authored source, NOT product
 * capability truth and NOT runtime behavior (the browser runner covers runtime).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { doctorWorkspace, pageIdentity } from '../../reconstruction/doctor-workspace/recipe.mjs';
import { pageIdentity as overviewIdentity } from '../../reconstruction/product-overview/recipe.mjs';
import { pageIdentity as appointmentIdentity } from '../../reconstruction/appointment-reception-queue/recipe.mjs';
import { pageIdentity as patientIdentity } from '../../reconstruction/patient-record-continuity/recipe.mjs';
const tokens = JSON.parse(readFileSync(new URL('../../design-system/tokens.json', import.meta.url)));
const nodes = doctorWorkspace(tokens).flatMap(function walk(n) { return [n, ...n.children.flatMap(walk)]; });
const strings = nodes.map(n => n.settings.title || n.settings.editor || n.settings.text || '').filter(Boolean);
const copy = strings.join('\n');

// ---- Identity, SEO boundary and anti-cannibalization -------------------------
assert.equal(pageIdentity.slug, 'doctor-workspace');
assert.match(pageIdentity.title, /CPMS/);
assert(pageIdentity.title.length <= 100, 'Title stays within a sane meta length');
assert(pageIdentity.description.length > 50 && pageIdentity.description.length <= 200, 'Description within meta limits');
assert(pageIdentity.description.includes('مدیران'), 'Description carries the buyer marker');
for (const other of [overviewIdentity, appointmentIdentity, patientIdentity]) {
  assert(pageIdentity.slug !== other.slug && pageIdentity.title !== other.title, 'Identity must not duplicate another page');
}
const clusterOneHead = /نرم\s*افزار\s*مدیریت\s*(مطب|کلینیک)/;
assert(!clusterOneHead.test(pageIdentity.title), 'Cluster-1 head terms belong to Product Overview, not this page title');
assert(!clusterOneHead.test(pageIdentity.description), 'Cluster-1 head terms must not be targeted in the meta description');
assert(!clusterOneHead.test(copy), 'Cluster-1 head terms must not be restated in page copy');
// This is a supporting workflow page, not the owner of the primary commercial cluster.
assert(!/پرونده الکترونیک بیمار/.test(pageIdentity.title), 'The Cluster-4 head belongs to the patient-record page, not this title');
const h1Nodes = nodes.filter(n => n.kind === 'heading' && n.settings.header_size === 'h1');
assert.equal(h1Nodes.length, 1);
const h1 = h1Nodes[0].settings.title;
assert(h1.replace(/<br>/g, ' ').length <= tokens.typography.h1_policy.max_characters, 'H1 respects the token h1_policy character cap');
assert(/فضای کاری پزشک/.test(h1) && /جریان واقعی کلینیک/.test(h1), 'H1 carries the bounded workspace identity and the clinic-flow framing');
assert(!clusterOneHead.test(h1), 'H1 must not target Product Overview cluster heads');
assert(/فضای کاری پزشک/.test(pageIdentity.title), 'Title carries the page identity phrase');
assert(/برای مدیران کلینیک/.test(pageIdentity.title), 'Title carries the buyer marker');
assert(/مدیریت جریان کار پزشک در کلینیک/.test(copy), 'Natural supporting phrase about doctor-workflow management appears once in content');
assert(/مدیران کلینیک|تصمیم‌گیران کلینیک/.test(copy), 'Buyer audience stated on-page');
assert(/مسیر نوبت‌گیری بیماران نیست/.test(copy), 'Patient-navigation disambiguation present');

// ---- Native Free elements, hierarchy, ids, links ----------------------------
assert(nodes.every(n => ['container', 'heading', 'text-editor', 'button'].includes(n.kind)), 'Native Free elements only');
const headings = nodes.filter(n => n.kind === 'heading');
const levels = headings.map(h => h.settings.header_size).filter(s => /^h\d$/.test(s)).map(s => Number(s.slice(1)));
assert.equal(levels[0], 1, 'H1 precedes subsection headings');
assert(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1), 'No skipped heading levels');
const ids = nodes.map(n => n.settings._element_id).filter(Boolean);
assert.equal(ids.length, new Set(ids).size, 'Element IDs are unique');
for (const sectionId of ['introduction', 'handoff', 'workspace-context', 'patient-context', 'documents', 'access', 'multi-doctor', 'faq', 'next-step']) {
  assert(ids.includes(sectionId), `Required section ID missing: ${sectionId}`);
}
for (const boundaryId of ['workspace-boundary', 'documents-distinction']) {
  assert(ids.includes(boundaryId), `Required explicit boundary note missing: ${boundaryId}`);
}
// Compact handoff strip: station → arrow → station → … in RTL DOM order.
const strip = nodes.find(n => n.settings._element_id === 'handoff-strip');
assert(strip, 'Compact handoff strip present');
const stripSequence = strip.children.map(child => child.settings._element_id ?? child.children?.[0]?.settings?.title);
assert.deepEqual(stripSequence, ['station-reception', '←', 'station-workspace', '←', 'station-patient', '←', 'station-records'],
  'Handoff strip: four bounded positions joined by native RTL arrows, in progression order');
assert.equal(strip.settings.flex_wrap, 'wrap', 'Handoff strip wraps instead of overflowing on small screens');
assert.equal(strip.settings.flex_direction, 'row', 'Handoff strip stays horizontal at every breakpoint');
const stations = nodes.filter(n => n.settings._element_id && /^station-/.test(n.settings._element_id));
assert.deepEqual(stations.map(n => n.settings._element_id), ['station-reception', 'station-workspace', 'station-patient', 'station-records'],
  'Four handoff positions in RTL DOM order');
// Elementor containers default to `width: 100%`, which under `flex_wrap: wrap`
// would put each child on its own line (observed in CI at exact head). Stations
// and arrows therefore need explicit percentage widths at every breakpoint so
// the strip packs one row at desktop/tablet and wraps station+arrow lines on mobile.
for (const station of stations) {
  for (const key of ['width', 'width_tablet', 'width_mobile']) {
    assert.equal(station.settings[key]?.unit, '%',
      `Station ${station.settings._element_id} needs explicit ${key} in % (Elementor .e-con defaults to width: 100%)`);
  }
}
assert.equal(stations[0].settings.width.size, 20, 'Desktop station width fixed');
assert.equal(stations[0].settings.width_tablet.size, 18, 'Tablet station width fixed');
assert.equal(stations[0].settings.width_mobile.size, 44, 'Mobile station width fixed');
const stripArrows = strip.children.filter(child => !child.settings._element_id);
assert.equal(stripArrows.length, 3, 'Three arrow children in the strip');
for (const a of stripArrows) {
  for (const key of ['width', 'width_tablet', 'width_mobile']) {
    assert.equal(a.settings[key]?.unit, '%', `Arrow needs explicit ${key} in %`);
  }
}
assert.equal(stripArrows[0].settings.width.size, 3, 'Desktop arrow width fixed');
assert.equal(stripArrows[0].settings.width_tablet.size, 4, 'Tablet arrow width fixed');
assert.equal(stripArrows[0].settings.width_mobile.size, 9, 'Mobile arrow width fixed');

// Buttons: only real existing pages; contextual patient-record + demo coverage.
const existingPages = ['/demo/', '/patient-record-continuity/', '/appointment-reception-queue/', '/product-overview/'];
const buttons = nodes.filter(n => n.kind === 'button');
assert(buttons.length >= 4);
for (const n of buttons) {
  const url = n.settings.link.url;
  assert(url.startsWith('#') || existingPages.includes(url), `Link must be an in-page anchor or an existing reconstructed page: ${url}`);
  if (url.startsWith('#')) assert(ids.includes(url.slice(1)), `Anchor destination missing: ${url}`);
}
assert(buttons.some(n => n.settings.link.url === '/demo/'), 'Primary CTA links to the real Demo page');
assert(buttons.some(n => n.settings.link.url === '/patient-record-continuity/'), 'Contextual link to the real Patient Record page');
assert(buttons.some(n => n.settings.link.url === '/product-overview/'), 'Final CTA links to the real Product Overview page');
// Inline contextual links: small, real, resolvable.
const inlineLinks = [...copy.matchAll(/<a href="([^"]+)">/g)].map(m => m[1]);
assert(inlineLinks.length >= 1 && inlineLinks.length <= 2, `Keep the inline link network small: ${inlineLinks}`);
for (const href of inlineLinks) {
  assert(href.startsWith('#') ? ids.includes(href.slice(1)) : existingPages.includes(href), `Inline link must resolve in-page or to an existing page: ${href}`);
}
assert(inlineLinks.includes('/appointment-reception-queue/'), 'Reception-side workflow page is linked contextually from the handoff band');

// ---- Forbidden claims, absolute-security language, over-optimization --------
for (const pattern of [
  /درگاه پرداخت/, /حسابداری/, /بیمه/, /هوش مصنوعی/, /اپلیکیشن موبایل/, /پوش‌نوتیفیکیشن/,
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
// No sentence may turn "connection" into an availability claim.
for (const value of strings) {
  assert(!/(اتصال|متصل)[^.]{0,60}(پشتیبانی می‌شود|پشتیبانی می‌کنیم|فعال است|فراهم است|امکان‌پذیر است|آماده است)/.test(value), `Integration availability must not be asserted: ${value.slice(0, 80)}`);
}
// Bounded capability wording that must remain visible.
for (const required of [
  'پشتیبانی تصمیم بالینی، هشدار خودکار یا پیشنهاد تشخیص معرفی نمی‌شود',
  'ثبت و مدیریت در محیط CPMS',
  'با اتصال به سامانهٔ ملی نسخهٔ الکترونیک یکی نیست',
  'به‌خودی‌خود به معنای اتصال به سامانهٔ ملی',
  'نقش‌ها و دامنهٔ دسترسی',
  'تفکیک اطلاعات کلینیک/سازمان',
  'محدوده‌دار (scoped)',
  'سطح سازوکار است',
  'پیش از انتشار عمومی بازتأیید می‌شود',
  'ادعای این صفحه نیست',
  'غیرزنده',
  'داده‌های نمایشی',
  'این قاب، تصویر محیط نرم‌افزار نیست',
  'ادعای تناسب عمومی برای همهٔ مراکز یا بهبود اندازه‌گیری‌شدهٔ بهره‌وری مطرح نیست',
]) {
  assert(copy.includes(required), `Bounded wording must stay present: ${required}`);
}

// ---- Reserved media: exactly two editable frames, no fabricated imagery -----
assert(!nodes.some(n => n.kind === 'image'), 'Reserved media must not fabricate product imagery');
for (const id of ['product-media-workspace', 'media-workspace-surface', 'media-workspace-disclosure', 'product-media-context', 'media-context-surface', 'media-context-disclosure']) {
  assert(ids.includes(id), `Reserved media position missing: ${id}`);
}
const mediaWrappers = nodes.filter(n => n.settings._element_id && /^product-media-/.test(n.settings._element_id));
assert.equal(mediaWrappers.length, 2, 'At most two media reservations on this page');

// ---- Product Overview inbound link (architecture, not duplication) ----------
const overviewRecipe = readFileSync(new URL('../../reconstruction/product-overview/recipe.mjs', import.meta.url), 'utf8');
assert(overviewRecipe.includes('href="/doctor-workspace/"'), 'Product Overview carries the contextual inbound link to this page');
assert(overviewRecipe.includes('href="/appointment-reception-queue/"'), 'Product Overview keeps its existing workflow link');
assert(overviewRecipe.includes('href="/patient-record-continuity/"'), 'Product Overview keeps its existing patient-record link');

// ---- Manifest / claims register integrity -----------------------------------
const manifest = JSON.parse(readFileSync(new URL('../../reconstruction/doctor-workspace/manifest.json', import.meta.url)));
assert.equal(manifest.publication, 'TARGET — NOT PUBLICATION-APPROVED');
assert(manifest.launch_blockers.some(b => /media/i.test(b)), 'Media launch blocker recorded');
assert(manifest.launch_blockers.some(b => /lead delivery/i.test(b)), 'Live lead delivery launch blocker recorded');
assert(/supporting workflow page/i.test(manifest.seo.intent) && /Product Overview/.test(manifest.seo.intent), 'Manifest records the supporting-page SEO boundary');
assert(/NOT claimed/.test(manifest.product_truth_boundary), 'Manifest records the non-claim set');
for (const key of ['canonical_recipe', 'claim_register', 'browser_runner']) assert(readFileSync(new URL('../../' + manifest[key], import.meta.url)).length > 0);
const claimsText = readFileSync(new URL('../../reconstruction/doctor-workspace/claims.md', import.meta.url), 'utf8');
assert(claimsText.includes('NOT CONFIGURED / NOT AUTHORIZED'), 'Claims register records the lead delivery blocker');
assert(claimsText.includes('must replace BOTH reserved frames before public launch'), 'Claims register records the media blocker');
assert(/does not own the primary clinic-software/.test(claimsText), 'Claims register records the non-ownership cluster boundary');
assert(!readFileSync(new URL('../../tests/browser/doctor-workspace.mjs', import.meta.url), 'utf8').includes('_elementor_data'), 'No private database payload authoring');
console.log(`PASS: Doctor-workspace page guardrails (${nodes.length} native Elementor Free elements; claims still require human/launch review)`);
