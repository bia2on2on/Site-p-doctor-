/** Guardrails, not a claim audit substitute. Human claim-to-evidence map accompanies the recipe. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homepage } from '../../reconstruction/homepage/recipe.mjs';
const tokens = JSON.parse(readFileSync(new URL('../../design-system/tokens.json', import.meta.url)));
const flatten = nodes => nodes.flatMap(n => [n, ...flatten(n.children)]);
const nodes = flatten(homepage(tokens));
assert(nodes.every(n => ['container', 'heading', 'text-editor', 'button'].includes(n.kind)), 'Native Free elements only');
assert.equal(nodes.filter(n => n.kind === 'heading' && n.settings.header_size === 'h1').length, 1);
const ids = nodes.map(n => n.settings._element_id).filter(Boolean);
assert.equal(ids.length, new Set(ids).size);
for (const n of nodes.filter(n => n.kind === 'button')) {
  assert(n.settings.link.url.startsWith('#'));
  assert(ids.includes(n.settings.link.url.slice(1)), 'Every CTA has a real in-page destination');
}
const copy = nodes.map(n => n.settings.title || n.settings.editor || n.settings.text || '').join('\n');
for (const pattern of [/۱۰۰٪/, /۱۰۰ درصد/, /100%/, /۲۴\s*[\/×]\s*۷/, /24\s*[\/×]\s*7/, /درگاه پرداخت/, /حسابداری کامل/, /اتصال به بیمه/, /نسخه الکترونیک ملی/, /هوش مصنوعی/, /اپلیکیشن موبایل/, /گواهی امنیت/, /تضمین/, /بهترین/, /امن‌ترین/, /mailto:|tel:|https?:\/\//, /تومان|ریال/]) {
  assert(!pattern.test(copy), `Forbidden/unapproved claim or contact matched: ${pattern}`);
}
assert(copy.includes('این قاب، تصویر محیط نرم‌افزار نیست'));
assert(copy.includes('اطلاعاتی دریافت یا ارسال نمی‌شود'));
assert(copy.includes('درخواست دمو / مشاوره'));
assert(!readFileSync(new URL('../../tests/browser/homepage.mjs', import.meta.url), 'utf8').includes('_elementor_data'), 'No private database payload authoring');
console.log(`PASS: homepage guardrails (${nodes.length} native elements; claims still require human/launch review)`);
