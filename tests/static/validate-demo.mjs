/**
 * Static validation of Demo / Consultation conversion page recipe,
 * manifest, claims, security/privacy boundaries, and non-live qualification model.
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { demoPage, pageIdentity } from '../../reconstruction/demo/recipe.mjs';

const root = new URL('../..', import.meta.url).pathname;
const tokens = JSON.parse(readFileSync(new URL('../../design-system/tokens.json', import.meta.url), 'utf8'));
const walk = n => [n, ...n.children.flatMap(walk)];
const nodes = demoPage(tokens).flatMap(walk);

// 1. Identity & SEO bounds
assert.equal(pageIdentity.slug, 'demo', 'Page slug must be "demo"');
assert.match(pageIdentity.title, /CPMS/, 'Title must contain CPMS product identifier');
assert.match(pageIdentity.title, /دمو|مشاوره/, 'Title must reflect demo/consultation intent');
assert(pageIdentity.description.length > 50 && pageIdentity.description.length <= 200, 'Page description within meta limits');

// 2. Element kinds & hierarchy
assert(nodes.every(n => ['container', 'heading', 'text-editor', 'button'].includes(n.kind)), 'Native Free Elementor controls only');
const h1s = nodes.filter(n => n.kind === 'heading' && n.settings.header_size === 'h1');
assert.equal(h1s.length, 1, 'Exactly one H1 allowed on page');
assert.match(h1s[0].settings.title, /بررسی تناسب CPMS/, 'H1 states clinic fit assessment');

const headings = nodes.filter(n => n.kind === 'heading');
const levels = headings.map(h => {
  const s = h.settings.header_size;
  return s.startsWith('h') ? parseInt(s.slice(1), 10) : 0;
}).filter(l => l > 0);
assert.equal(levels[0], 1, 'First heading is H1');
for (let i = 1; i < levels.length; i++) {
  assert(levels[i] <= levels[i - 1] + 1, `No skipped heading levels: h${levels[i - 1]} followed by h${levels[i]}`);
}

// 3. Unique Element IDs & in-page anchors
const ids = nodes.map(n => n.settings._element_id).filter(Boolean);
assert.equal(ids.length, new Set(ids).size, 'All _element_id values must be unique');

const requiredSections = [
  'hero',
  'who-is-this-for',
  'what-we-discuss',
  'qualification-form',
  'privacy-guidance',
  'faq',
  'return-path',
];
for (const sectionId of requiredSections) {
  assert(ids.includes(sectionId), `Required section ID missing: ${sectionId}`);
}

const buttons = nodes.filter(n => n.kind === 'button');
assert(buttons.length >= 2, 'Must contain hero and return action buttons');
for (const btn of buttons) {
  const url = btn.settings.link.url;
  assert(url.startsWith('#'), `Button link must be an in-page anchor: ${url}`);
  assert(ids.includes(url.slice(1)), `Button destination anchor does not exist on page: ${url}`);
}

// 4. Form shortcode presence
const formWidgets = nodes.filter(n => n.kind === 'text-editor' && (n.settings.editor || '').includes('[cpms_demo_form]'));
assert.equal(formWidgets.length, 1, 'Exactly one qualification form shortcode widget required');

// 5. Forbidden claim patterns
const copy = nodes.map(n => n.settings.title || n.settings.editor || n.settings.text || '').join('\n');
const forbiddenPatterns = [
  /درگاه پرداخت/,
  /حسابداری کامل/,
  /اتصال به بیمه/,
  /نسخه الکترونیک ملی/,
  /هوش مصنوعی/,
  /اپلیکیشن موبایل/,
  /گواهی امنیت/,
  /۱۰۰٪|۱۰۰ درصد|100%/,
  /۲۴\s*[\/×]\s*۷|24\s*[\/×]\s*7/,
  /تومان|ریال/,
  /mailto:|tel:/,
  /تماس در کمتر از/,
  /پشتیبانی ۲۴ ساعته/,
  /بهترین نرم‌افزار/,
  /امن‌ترین/,
  /تضمین بازگشت/,
];
for (const pattern of forbiddenPatterns) {
  assert(!pattern.test(copy), `Forbidden commercial/capability claim or contact pattern matched: ${pattern}`);
}

// 6. Mandatory Persian guidance phrasing
assert(copy.includes('بررسی تناسب CPMS با جریان کار کلینیک شما'), 'H1 wording exact');
assert(copy.includes('این جلسه برای چه مراکزی بیشترین ارزش را دارد؟'), 'Section 2 fit guidance present');
assert(copy.includes('در جلسهٔ دمو و مشاوره چه مواردی بررسی می‌شود؟'), 'Section 3 discussion topics present');
assert(copy.includes('اطلاعات لازم برای هماهنگی جلسهٔ دمو'), 'Section 4 qualification form header present');
assert(copy.includes('عدم دریافت اطلاعات بیماران و پرونده‌های درمانی'), 'Section 5 privacy guidance header present');
assert(copy.includes('پاسخ به سؤالات متداول پیش از ثبت درخواست'), 'Section 6 FAQ header present');
assert(copy.includes('بررسی بیشتر پیش از تصمیم‌گیری'), 'Section 7 return path header present');
assert(copy.includes('لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید'), 'Explicit PHI warning in copy');

// 7. No fabricated image UI
assert(!nodes.some(n => n.kind === 'image'), 'No fabricated product screenshots or decorative image widgets');

// 8. Manifest validation
const manifestPath = new URL('../../reconstruction/demo/manifest.json', import.meta.url);
assert(existsSync(manifestPath), 'reconstruction/demo/manifest.json must exist');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
assert.equal(manifest.publication, 'TARGET — NOT PUBLICATION-APPROVED');
assert.equal(manifest.conversion, 'Assisted-sale qualification; safe non-live test mode; delivery destination NOT AUTHORIZED');
assert.equal(manifest.delivery_destination, 'NOT CONFIGURED / NOT AUTHORIZED — launch blocker');
assert.deepEqual(manifest.form_fields, [
  'cpms_contact_name',
  'cpms_org_name',
  'cpms_contact_value',
  'cpms_org_type',
  'cpms_doctor_count',
  'cpms_discussion_topic',
]);

for (const key of ['canonical_recipe', 'claim_register', 'browser_runner']) {
  assert(existsSync(new URL('../../' + manifest[key], import.meta.url)), `Manifest path missing: ${manifest[key]}`);
}

// 9. Claims register validation
const claimsText = readFileSync(new URL('../../reconstruction/demo/claims.md', import.meta.url), 'utf8');
assert(claimsText.includes('LIVE LEAD DELIVERY = NOT CONFIGURED / NOT AUTHORIZED'), 'Claims register must document lead delivery launch blocker');
assert(claimsText.includes('SAFE NON-LIVE MODE'), 'Claims register must document safe non-live mode');
assert(claimsText.includes('لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید'), 'Claims register must include PHI prohibition');

// 10. Form handler security & non-live checks
const formPhp = readFileSync(new URL('../../themes/koorosh/demo-form.php', import.meta.url), 'utf8');
assert(formPhp.includes('wp_verify_nonce'), 'Form handler must verify CSRF nonces');
assert(formPhp.includes('sanitize_text_field'), 'Form handler must sanitize text fields');
assert(formPhp.includes('sanitize_key'), 'Form handler must sanitize enum keys');
assert(formPhp.includes('sanitize_textarea_field'), 'Form handler must sanitize textarea');
assert(!formPhp.includes('wp_mail('), 'Form handler must NOT send live email');
assert(!formPhp.includes('wp_insert_post('), 'Form handler must NOT persist payloads to posts');
assert(!formPhp.includes('$wpdb->insert('), 'Form handler must NOT persist payloads to custom tables');
assert(!formPhp.includes('error_log('), 'Form handler must NOT log submitted payloads');
assert(formPhp.includes('SAFE NON-LIVE MODE'), 'Form handler must document safe non-live mode');

// 11. Browser test integrity
const browserTestText = readFileSync(new URL('../../tests/browser/demo.mjs', import.meta.url), 'utf8');
assert(!browserTestText.includes('_elementor_data'), 'Browser test must author via official Editor commands, not _elementor_data JSON');

console.log(`PASS: Demo consultation native authoring, qualification and safe non-live guardrails (${nodes.length} native Elementor Free elements)`);
