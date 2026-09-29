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
const buttons = nodes.filter(n => n.kind === 'button');
for (const n of buttons) {
  const url = n.settings.link.url;
  assert(url.startsWith('#') || url === '/demo/', `CTA destinations are in-page anchors or the real Demo page: ${url}`);
  if (url.startsWith('#')) assert(ids.includes(url.slice(1)), 'Every in-page CTA has a real destination');
}
assert(buttons.some(n => n.settings.link.url === '/demo/'), 'Primary demo CTA routes to /demo/ (no informational dead end)');
const copy = nodes.map(n => n.settings.title || n.settings.editor || n.settings.text || '').join('\n');
for (const pattern of [/۱۰۰٪/, /۱۰۰ درصد/, /100%/, /۲۴\s*[\/×]\s*۷/, /24\s*[\/×]\s*7/, /درگاه پرداخت/, /حسابداری کامل/, /اتصال به بیمه/, /نسخه الکترونیک ملی/, /هوش مصنوعی/, /اپلیکیشن موبایل/, /گواهی امنیت/, /تضمین/, /بهترین/, /امن‌ترین/, /mailto:|tel:|https?:\/\//, /تومان|ریال/]) {
  assert(!pattern.test(copy), `Forbidden/unapproved claim or contact matched: ${pattern}`);
}
assert(copy.includes('این قاب، تصویر محیط نرم‌افزار نیست'));
assert(copy.includes('اطلاعاتی دریافت یا ارسال نمی‌شود'));
assert(copy.includes('درخواست دمو / مشاوره'));
assert(!readFileSync(new URL('../../tests/browser/homepage.mjs', import.meta.url), 'utf8').includes('_elementor_data'), 'No private database payload authoring');
console.log(`PASS: homepage guardrails (${nodes.length} native elements; claims still require human/launch review)`);

const manifest = JSON.parse(readFileSync(new URL('../../reconstruction/homepage/manifest.json', import.meta.url)));
assert.equal(manifest.publication, 'TARGET — NOT PUBLICATION-APPROVED');
assert.equal(manifest.owner_visual_acceptance, 'NOT ACCEPTED — owner revision requested');
for (const field of ['canonical_recipe', 'reconstruction', 'claim_register', 'browser_runner']) {
  assert(readFileSync(new URL('../../' + manifest[field], import.meta.url)).length > 0);
}

// The reserved frame introduces white text on ink/primary; validate that exact token pair.
const luminance = hex => {
  const rgb = hex.slice(1).match(/../g).map(x => parseInt(x, 16) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
const frameContrast = (luminance(tokens.color.roles['accent/contrast-on-accent'].value) + .05) / (luminance(tokens.color.roles['ink/primary'].value) + .05);
assert(frameContrast >= 4.5, 'Reserved-media text contrast must meet AA');
console.log(`PASS: reserved-frame contrast ${frameContrast.toFixed(2)}:1; acceptance remains pending`);
