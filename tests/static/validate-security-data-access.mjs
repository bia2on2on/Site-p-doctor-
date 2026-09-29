/**
 * Static guardrails for the Security & Data Access trust page.
 * Proves authoring shape, claim boundaries, SEO ownership, media/schema omission,
 * and footer routing. Guardrails, NOT product security verification.
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { securityDataAccess, pageIdentity } from '../../reconstruction/security-data-access/recipe.mjs';
import { pageIdentity as overviewIdentity } from '../../reconstruction/product-overview/recipe.mjs';
import { pageIdentity as faqIdentity } from '../../reconstruction/faq/recipe.mjs';
import { pageIdentity as homeIdentity } from '../../reconstruction/homepage/recipe.mjs';
import * as boundary from './boundary-security-data-access.mjs';

const tokens = JSON.parse(readFileSync(new URL('../../design-system/tokens.json', import.meta.url)));
const walk = n => [n, ...n.children.flatMap(walk)];
const nodes = securityDataAccess(tokens).flatMap(walk);
const strings = nodes.map(n => n.settings.title || n.settings.editor || n.settings.text || '').filter(Boolean);
const copy = strings.join('\n');
const byId = id => nodes.find(n => n.settings._element_id === id);

const read = rel => readFileSync(new URL('../../' + rel, import.meta.url), 'utf8');

// ---- 1. Identity and SEO ownership -----------------------------------------
assert.equal(pageIdentity.slug, 'security-data-access', 'Slug must be security-data-access');
assert.match(pageIdentity.title, /CPMS/, 'Title keeps product identifier');
assert.match(pageIdentity.title, /امنیت و دسترسی/, 'Title reflects trust intent');
assert.match(pageIdentity.title, /مدیران کلینیک/, 'Title keeps buyer marker');
assert(pageIdentity.description.length > 50 && pageIdentity.description.length <= 250, 'Description within limits');
assert(pageIdentity.description.includes('مدیران کلینیک'), 'Description carries buyer marker');
assert(pageIdentity.description.includes('نقش‌ها'), 'Description mentions roles');

// No cannibalization of Product Overview Cluster-1
for (const head of [/نرم‌افزار مدیریت (?:مطب|کلینیک)/, /نرم افزار مدیریت (?:مطب|کلینیک)/]) {
  assert(!head.test(`${pageIdentity.title}\n${pageIdentity.description}\n${copy}`), `Trust page must not take Cluster-1 head: ${head}`);
}
assert(!/امن‌ترین/.test(`${pageIdentity.title}\n${pageIdentity.description}`), 'Title/description must not chase امن‌ترین');
assert(!/بهترین/.test(`${pageIdentity.title}\n${pageIdentity.description}`), 'No self-award بهترین');

// ---- 2. Native authoring shape ---------------------------------------------
assert(nodes.every(n => ['container', 'heading', 'text-editor', 'button'].includes(n.kind)), 'Native Free controls only');
const ids = nodes.map(n => n.settings._element_id).filter(Boolean);
assert.equal(ids.length, new Set(ids).size, 'Element IDs unique');
for (const sectionId of ['review-notice', 'introduction', 'why-matters', 'role-context', 'data-separation', 'not-claim', 'verify-in-demo', 'faq', 'next-step']) {
  assert(ids.includes(sectionId), `Required section ID missing: ${sectionId}`);
}
const headings = nodes.filter(n => n.kind === 'heading');
assert.equal(headings.filter(n => n.settings.header_size === 'h1').length, 1, 'Exactly one H1');
const levels = headings.map(h => Number(String(h.settings.header_size).slice(1))).filter(l => l > 0);
assert.equal(levels[0], 1, 'First heading is H1');
for (let i = 1; i < levels.length; i++) assert(levels[i] <= levels[i - 1] + 1, `No skipped heading levels: h${levels[i - 1]} then h${levels[i]}`);

// No media, no badges, no schema
assert(!nodes.some(n => n.kind === 'image'), 'No image widget — trust page works without screenshots');
const serialized = JSON.stringify(securityDataAccess(tokens));
assert(!/ld\+json|FAQPage|schema\.org|\"@type\"|itemscope|itemtype/i.test(serialized), 'No structured data');
assert(!/badge|shield|padlock/i.test(serialized), 'No fake badges');
assert(!/گواهی.*badge/i.test(serialized), 'No fake badge with گواهی');

// ---- 3. Content structure per mission --------------------------------------
assert(copy.includes('دسترسی متناسب با نقش، در چارچوب کار کلینیک'), 'Hero H1 carries requested direction');
assert(copy.includes('سازوکارهایی برای نقش‌ها'), 'Hero explains bounded mechanisms');
assert(copy.includes('پیش از انتشار عمومی بازتأیید می‌شود'), 'Hero includes launch-verification qualification');

assert(byId('why-matters'), 'Why matters band present');
assert(/نقش‌های مختلف/.test(copy), 'Why matters explains different operational views');
assert(!/هک|نفوذ|حمله/.test(copy), 'No fear marketing');

assert(byId('role-context'), 'Role context band present');
for (const roleTitle of ['زمینهٔ پزشک', 'زمینهٔ پذیرش', 'زمینهٔ مدیریت کلینیک']) {
  assert(strings.some(s => s.includes(roleTitle)), `Role context includes ${roleTitle}`);
}
assert(copy.includes('فهرست دقیق مجوزها نیست') || copy.includes('ماتریس دسترسی تفضیلی'), 'Role section states it is not a detailed permission matrix');

assert(byId('data-separation'), 'Data-separation band present');
assert(/محدوده‌دار.*scoped|scoped.*محدوده‌دار/.test(copy) || copy.includes('محدوده‌دار (scoped)'), 'Data separation mentions scoped mechanisms');
assert(copy.includes('اطلاعات هر کلینیک در محدودهٔ همان کلینیک') || copy.includes('تفکیک اطلاعات میان کلینیک‌ها'), 'Data separation explains clinic-scoped separation');
assert(!/جداسازی کامل.*تضمین|تضمین.*جداسازی کامل/.test(copy), 'No perfect isolation guarantee');
assert(copy.includes('چندکلینیکی') || copy.includes('سازمان/کلینیک/موقعیت'), 'Multi-clinic model may be discussed');

assert(byId('not-claim'), 'What this does NOT claim band present');
assert(copy.includes('وجود سازوکارهای نقش و دسترسی به‌معنای ادعای «امنیت صددرصدی»'), 'Concise clarification present');
assert(copy.includes('گواهی امنیتی') && copy.includes('انطباق با استانداردی خاص'), 'Clarification mentions no certificate/compliance');

assert(byId('verify-in-demo'), 'What to verify in demo band present');
for (const checklist of ['کدام نقش‌ها برای جریان کار شما وجود دارد', 'هر نقش در جریان کاری مرتبط چه می‌بیند', 'زمینه‌های کلینیک چگونه از هم تفکیک می‌شوند', 'رابط واقعی محصول چه چیزی را نشان می‌دهد', 'الزامات استقرار و امنیتی']) {
  assert(copy.includes(checklist), `Evaluation checklist includes: ${checklist}`);
}

assert(byId('faq'), 'FAQ band present');
for (const q of ['آیا همهٔ کاربران یک سطح دسترسی دارند؟', 'آیا می‌توان دربارهٔ نقش‌ها در دمو بررسی کرد؟', 'آیا این صفحه به‌معنی دریافت گواهی امنیتی است؟', 'صددرصد امن']) {
  assert(strings.some(s => boundary.stripTags(s).includes(boundary.stripTags(q))), `FAQ includes: ${q}`);
}

// ---- 4. Claim boundaries ----------------------------------------------------
boundary.assertNoHardForbidden([pageIdentity.title, pageIdentity.description, ...strings], 'Security page copy');
const checked = boundary.assertBoundaryTermsNegated(strings, 'Security page copy');
assert(checked >= 4, `Boundary terms must be checked and negated (${checked})`);
boundary.assertPersianTypography([pageIdentity.title, pageIdentity.description, ...strings], 'Security page copy');
boundary.assertQualificationPresent([pageIdentity.title, pageIdentity.description, ...strings], 'Security page copy');

// No encryption/backup/hosting/monitoring/audit-logging/incident claims as offered
for (const term of ['رمزنگاری', 'پشتیبان', 'میزبانی', 'پایش', 'ثبت وقایع', 'واکنش به رخداد']) {
  const occurrences = strings.filter(s => s.includes(term));
  for (const occ of occurrences) {
    assert(/نیست|نمی|مطرح نمی‌شود|ادعایی.*نیست/.test(occ), `Term ${term} must appear only negated: ${occ.slice(0, 80)}`);
  }
}

// ---- 5. Link budget ---------------------------------------------------------
const buttons = nodes.filter(n => n.kind === 'button');
assert(buttons.length >= 2, 'At least hero and final CTAs');
for (const btn of buttons) {
  assert(['/demo/', '/product-overview/', '/faq/'].includes(btn.settings.link.url), `Unexpected button destination: ${btn.settings.link.url}`);
}
assert(buttons.some(b => b.settings.link.url === '/demo/'), 'Demo CTA present');
assert(buttons.some(b => b.settings.link.url === '/product-overview/'), 'Product Overview secondary present');
assert(buttons.some(b => b.settings.link.url === '/faq/'), 'FAQ link present');

const internalLinks = [...new Set((strings.join('\n').match(/href="([^"]+)"/g) ?? []).map(m => m.slice(6, -1)))].sort();
assert(internalLinks.includes('/product-overview/'), 'Internal link to Product Overview');
assert(internalLinks.includes('/faq/'), 'Internal link to FAQ');
assert(internalLinks.includes('/demo/') || buttons.some(b => b.settings.link.url === '/demo/'), 'Demo link present');
for (const link of internalLinks) {
  assert(['/', '/product-overview/', '/faq/', '/demo/'].some(allowed => link === allowed || link.startsWith(allowed)), `Unexpected internal link: ${link}`);
}
assert(!/https?:\/\//.test(serialized.replace(/href="[^"]*"/g, '')), 'No external links');

// ---- 6. Manifest and menu wiring -------------------------------------------
const manifest = JSON.parse(read('reconstruction/security-data-access/manifest.json'));
assert.equal(manifest.publication, 'TARGET — NOT PUBLICATION-APPROVED');
assert(manifest.lead_delivery.includes('NOT CONFIGURED / NOT AUTHORIZED'));
assert(manifest.structured_data.includes('NONE'));
assert.equal(manifest.canonical_recipe, 'reconstruction/security-data-access/recipe.mjs');
for (const key of ['canonical_recipe', 'claim_register', 'browser_runner']) {
  assert(existsSync(new URL('../../' + manifest[key], import.meta.url)), `Manifest path missing: ${manifest[key]}`);
}

const menuSource = read('reconstruction/site-shell/menu.mjs');
assert(menuSource.includes('security-data-access'), 'Footer menu includes security-data-access');
assert(menuSource.includes('امنیت و دسترسی به داده'), 'Footer menu label correct');
assert(!menuSource.includes('security-data-access') || menuSource.indexOf('security-data-access') > menuSource.indexOf('faq'), 'Security page sits in trust group after FAQ');

const claims = read('reconstruction/security-data-access/claims.md');
assert(claims.includes('NOT CONFIGURED / NOT AUTHORIZED'), 'Claims register records lead delivery blocker');
assert(claims.includes('REVERIFY BEFORE PUBLIC LAUNCH'), 'Claims register keeps reverify ceiling');

console.log(`PASS: Security & Data Access trust page guardrails (${nodes.length} native elements; ${checked} boundary clauses negated; qualification present; no badges/media/schema)`);
