/** Appointment–Reception–Queue workflow page authoring and message guardrails; not a truth certification. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { appointmentReceptionQueue, pageIdentity } from '../../reconstruction/appointment-reception-queue/recipe.mjs';
import { pageIdentity as overviewIdentity } from '../../reconstruction/product-overview/recipe.mjs';
const tokens = JSON.parse(readFileSync(new URL('../../design-system/tokens.json', import.meta.url)));
const nodes = appointmentReceptionQueue(tokens).flatMap(function walk(n) { return [n, ...n.children.flatMap(walk)]; });

// Identity, SEO boundary and anti-cannibalization.
assert.equal(pageIdentity.slug, 'appointment-reception-queue');
assert.match(pageIdentity.title, /CPMS/);
assert(pageIdentity.title.length <= 100, 'Title stays within a sane meta length');
assert(pageIdentity.description.length > 50 && pageIdentity.description.length <= 200, 'Description within meta limits');
assert(pageIdentity.description.includes('مدیران'), 'Description carries the buyer marker');
assert(pageIdentity.slug !== overviewIdentity.slug && pageIdentity.title !== overviewIdentity.title, 'Identity must not duplicate Product Overview');
assert(!/نرم\s*افزار\s*مدیریت\s*(مطب|کلینیک)/.test(pageIdentity.title), 'Cluster-1 head terms belong to Product Overview, not this page title');
const h1Nodes = nodes.filter(n => n.kind === 'heading' && n.settings.header_size === 'h1');
assert.equal(h1Nodes.length, 1);
assert(h1Nodes[0].settings.title.includes('نوبت، پذیرش و صف'), 'H1 carries the page identity');
assert(!/نرم\s*افزار\s*مدیریت\s*(مطب|کلینیک)/.test(h1Nodes[0].settings.title), 'H1 must not target Product Overview cluster heads');
const copy = nodes.map(n => n.settings.title || n.settings.editor || n.settings.text || '').join('\n');
for (const trap of [/سیستم نوبت دهی پزشک/, /سایت نوبت دهی پزشک/, /نوبت[‌ ]دهی آنلاین/]) {
  assert(!trap.test(pageIdentity.title) && !trap.test(pageIdentity.description) && !trap.test(h1Nodes[0].settings.title) && !trap.test(copy), `Patient/navigation intent trap or unverified booking claim must not be targeted: ${trap}`);
}
assert(/مدیران کلینیک/.test(copy), 'Buyer audience stated on-page');
assert(/این صفحه برای شما نیست/.test(copy), 'Patient disambiguation present');

// Native Free elements, hierarchy, ids, links.
assert(nodes.every(n => ['container', 'heading', 'text-editor', 'button'].includes(n.kind)), 'Native Free elements only');
const headings = nodes.filter(n => n.kind === 'heading');
const levels = headings.map(h => h.settings.header_size).filter(s => /^h\d$/.test(s)).map(s => Number(s.slice(1)));
assert.equal(levels[0], 1, 'H1 precedes subsection headings');
assert(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1), 'No skipped heading levels');
const ids = nodes.map(n => n.settings._element_id).filter(Boolean);
assert.equal(ids.length, new Set(ids).size);
for (const sectionId of ['introduction', 'problem', 'workflow', 'reception', 'doctor-continuity', 'fit', 'faq', 'next-step']) {
  assert(ids.includes(sectionId), `Required section ID missing: ${sectionId}`);
}
const buttons = nodes.filter(n => n.kind === 'button');
assert(buttons.length >= 4);
for (const n of buttons) {
  const url = n.settings.link.url;
  assert(url.startsWith('#') || url === '/demo/' || url === '/product-overview/', `Link must be an in-page anchor or an existing reconstructed page: ${url}`);
  if (url.startsWith('#')) assert(ids.includes(url.slice(1)), `Anchor destination missing: ${url}`);
}
assert(buttons.some(n => n.settings.link.url === '/demo/'), 'Primary CTA links to the real Demo page');
assert(buttons.some(n => n.settings.link.url === '/product-overview/'), 'Continuity links to the real Product Overview page');

// Forbidden/unapproved claims and bounded capability wording.
for (const pattern of [/درگاه پرداخت/, /حسابداری کامل/, /اتصال به بیمه/, /نسخه الکترونیک ملی/, /هوش مصنوعی/, /اپلیکیشن موبایل/, /گواهی امنیت/, /۱۰۰٪|۱۰۰ درصد|100%/, /۲۴\s*[\/×]\s*۷|24\s*[\/×]\s*7/, /تومان|ریال/, /mailto:|tel:|https?:\/\//, /پیامک|پیام کوتاه|اس‌ام‌اس/, /تضمین/, /بهترین/, /امن‌ترین/, /رایگان/]) {
  assert(!pattern.test(copy), `Forbidden claim/contact matched: ${pattern}`);
}
assert(copy.includes('فاز کامل پذیرش در سند فعلی محصول بسته نشده'), 'Reception phase limitation stays visible');
assert(copy.includes('وعدهٔ چرخهٔ کامل و بستهٔ پذیرش را نمی‌دهد'), 'No closed reception lifecycle promised');
assert(copy.includes('این قاب، تصویر محیط نرم‌افزار نیست'), 'Reserved media disclosure present');
assert(copy.includes('غیرزنده'), 'Non-live conversion mode disclosed');

// Reserved media: exactly two editable frames, no fabricated imagery.
assert(!nodes.some(n => n.kind === 'image'), 'Reserved media must not fabricate product imagery');
for (const id of ['media-appointment-surface', 'media-appointment-disclosure', 'media-reception-surface', 'media-reception-disclosure', 'product-media-appointment', 'product-media-reception']) {
  assert(ids.includes(id), `Reserved media position missing: ${id}`);
}

// Manifest / claims register integrity.
const manifest = JSON.parse(readFileSync(new URL('../../reconstruction/appointment-reception-queue/manifest.json', import.meta.url)));
assert.equal(manifest.publication, 'TARGET — NOT PUBLICATION-APPROVED');
assert(manifest.launch_blockers.some(b => /media/i.test(b)), 'Media launch blocker recorded');
assert(manifest.launch_blockers.some(b => /lead delivery/i.test(b)), 'Live lead delivery launch blocker recorded');
for (const key of ['canonical_recipe', 'claim_register', 'browser_runner']) assert(readFileSync(new URL('../../' + manifest[key], import.meta.url)).length > 0);
const claimsText = readFileSync(new URL('../../reconstruction/appointment-reception-queue/claims.md', import.meta.url));
assert(claimsText.includes('NOT CONFIGURED / NOT AUTHORIZED'), 'Claims register records the lead delivery blocker');
assert(claimsText.includes('NOT closed in the snapshot'), 'Claims register records the open reception phase');
assert(!readFileSync(new URL('../../tests/browser/appointment-reception-queue.mjs', import.meta.url), 'utf8').includes('_elementor_data'), 'No private database payload authoring');
console.log(`PASS: Appointment–Reception–Queue workflow guardrails (${nodes.length} native Elementor Free elements; claims still require human/launch review)`);
