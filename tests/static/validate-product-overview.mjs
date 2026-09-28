/** Product Overview authoring and message guardrails; not a truth certification. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productOverview, pageIdentity } from '../../reconstruction/product-overview/recipe.mjs';
const tokens = JSON.parse(readFileSync(new URL('../../design-system/tokens.json', import.meta.url)));
const nodes = productOverview(tokens).flatMap(function walk(n) { return [n, ...n.children.flatMap(walk)]; });
assert.equal(pageIdentity.slug, 'product-overview');
assert.equal(nodes.filter(n => n.kind === 'heading' && n.settings.header_size === 'h1').length, 1);
assert(nodes.every(n => ['container', 'heading', 'text-editor', 'button'].includes(n.kind)));
const ids = nodes.map(n => n.settings._element_id).filter(Boolean);
assert.equal(ids.length, new Set(ids).size);
for (const n of nodes.filter(n => n.kind === 'button')) {
  assert(n.settings.link.url.startsWith('#'));
  assert(ids.includes(n.settings.link.url.slice(1)));
}
const text = nodes.map(n => n.settings.title || n.settings.editor || n.settings.text || '').join('\n');
for (const pattern of [/درگاه پرداخت آنلاین/, /اتصال به بیمه/, /نسخه الکترونیک ملی/, /هوش مصنوعی/, /اپلیکیشن موبایل/, /گواهی امنیت/, /۱۰۰٪|۱۰۰ درصد|100%/, /۲۴\s*[\/×]\s*۷|24\s*[\/×]\s*7/, /تومان|ریال/, /mailto:|tel:/]) assert(!pattern.test(text), `Forbidden claim/contact: ${pattern}`);
for (const phrase of ['نرم‌افزار مدیریت مطب', 'نرم‌افزار مدیریت کلینیک', 'فقط نرم‌افزار نوبت‌دهی است؟', 'جایگزین حسابداری کامل است؟', 'نمای واقعی نرم‌افزار CPMS', 'تصویر محیط نرم‌افزار نیست']) assert(text.includes(phrase), `Missing bounded page identity: ${phrase}`);
assert(!nodes.some(n => n.kind === 'image'), 'Reserved media must not fabricate product imagery');
assert(!readFileSync(new URL('../../tests/browser/product-overview.mjs', import.meta.url), 'utf8').includes('_elementor_data'));
const manifest = JSON.parse(readFileSync(new URL('../../reconstruction/product-overview/manifest.json', import.meta.url)));
for (const key of ['canonical_recipe', 'claim_register', 'browser_runner']) assert(readFileSync(new URL('../../' + manifest[key], import.meta.url)).length > 0);
console.log(`PASS: Product Overview authoring guardrails (${nodes.length} native Elementor Free elements)`);
