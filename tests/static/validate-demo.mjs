/**
 * Static validation of Demo / Consultation conversion page recipe,
 * manifest, claims, security/privacy boundaries, and the two-mode
 * lead-delivery model (default OFF; environment-owned activation;
 * administrator-configured recipient with the authorized default as fallback; dual gate).
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
assert(copy.includes('href="/product-overview/"'), 'Demo page keeps a real contextual route back to /product-overview/');
assert(copy.includes('لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید'), 'Explicit PHI warning in copy');

// 7. No fabricated image UI
assert(!nodes.some(n => n.kind === 'image'), 'No fabricated product screenshots or decorative image widgets');

// 8. Manifest validation
const manifestPath = new URL('../../reconstruction/demo/manifest.json', import.meta.url);
assert(existsSync(manifestPath), 'reconstruction/demo/manifest.json must exist');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
assert.equal(manifest.publication, 'TARGET — NOT PUBLICATION-APPROVED');
assert.equal(manifest.conversion, 'Assisted-sale qualification; delivery default OFF with environment-owned activation; live host activation NOT DONE');
const lead = manifest.lead_delivery;
assert(lead, 'manifest.lead_delivery block required');
assert.equal(lead.authorized_recipient, 'biatoweb@gmail.com', 'Authorized recipient recorded as project configuration evidence');
assert.equal(lead.default_state, 'OFF — safe non-live mode (no mail, no persistence, no logging)');
assert(lead.activation.startsWith('DUAL GATE') && lead.activation.includes('CPMS_LEAD_DELIVERY_ENABLED (boolean true; theme never defines it)') && lead.activation.includes('site-level switch'), 'Activation = environment constant AND administrator site-level switch (dual gate)');
assert.equal(lead.transport, 'WordPress-native wp_mail only; SMTP/deliverability configuration is environment-owned and outside Git');
assert.deepEqual(lead.states, ['validation_failure', 'delivery_disabled', 'handoff_accepted', 'handoff_failed']);
assert.equal(lead.persistence, 'none — submissions are never stored in the WordPress database or logs');
assert(lead.inbox_delivery.startsWith('NOT VERIFIED'), 'Inbox delivery must stay explicitly NOT VERIFIED');
assert(lead.live_host_activation.startsWith('NOT DONE'), 'Live host activation must stay explicitly NOT DONE');
assert.deepEqual(manifest.form_fields, [
  'cpms_contact_name',
  'cpms_org_name',
  'cpms_contact_value',
  'cpms_org_type',
  'cpms_doctor_count',
  'cpms_discussion_topic',
]);

for (const key of ['canonical_recipe', 'claim_register', 'browser_runner', 'delivery_runner']) {
  assert(existsSync(new URL('../../' + manifest[key], import.meta.url)), `Manifest path missing: ${manifest[key]}`);
}

// 9. Claims register validation
const claimsText = readFileSync(new URL('../../reconstruction/demo/claims.md', import.meta.url), 'utf8');
assert(claimsText.includes('LEAD DELIVERY = AUTHORIZED RECIPIENT RECORDED · DEFAULT OFF · LIVE HOST ACTIVATION NOT DONE'), 'Claims register must record the delivery status sentinel');
assert(claimsText.includes('biatoweb@gmail.com'), 'Claims register records the authorized recipient as business-contact evidence');
assert(claimsText.includes('CPMS_LEAD_DELIVERY_ENABLED'), 'Claims register documents the activation mechanism');
assert(claimsText.includes('SAFE NON-LIVE MODE'), 'Claims register must document safe non-live default mode');
assert(claimsText.includes('لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید'), 'Claims register must include PHI prohibition');

// 10. Form handler security & delivery-state guardrails
const formPhp = readFileSync(new URL('../../themes/koorosh/demo-form.php', import.meta.url), 'utf8');
assert(formPhp.includes('wp_verify_nonce'), 'Form handler must verify CSRF nonces');
assert(formPhp.includes('sanitize_text_field'), 'Form handler must sanitize text fields');
assert(formPhp.includes('sanitize_key'), 'Form handler must sanitize enum keys');
assert(formPhp.includes('sanitize_textarea_field'), 'Form handler must sanitize textarea');

// Delivery activation is environment-owned and default OFF
assert(formPhp.includes('function cpms_lead_delivery_enabled()'), 'Explicit activation control function required');
assert(formPhp.includes("defined( 'CPMS_LEAD_DELIVERY_ENABLED' ) && true === CPMS_LEAD_DELIVERY_ENABLED"), 'Activation must require the environment-owned boolean constant');
assert(formPhp.includes('function cpms_lead_delivery_environment_authorized()') && formPhp.includes('function cpms_lead_delivery_site_switch_enabled()'), 'Dual gate: environment authorization and site switch are separate functions');
assert(/function cpms_lead_delivery_enabled\(\) \{\s*return cpms_lead_delivery_environment_authorized\(\) && cpms_lead_delivery_site_switch_enabled\(\);\s*\}/.test(formPhp), 'Effective delivery requires BOTH the environment gate AND the site switch');
// Comment-stripped source: the theme may DOCUMENT the wp-config mechanism, but its
// executable code must never define the activation constant.
const executablePhp = formPhp.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
assert(!executablePhp.includes("define( 'CPMS_LEAD_DELIVERY_ENABLED'"), 'Theme code must NEVER define the activation constant (deployment alone can never enable delivery)');

// wp_mail is called exactly once, only behind the delivery-enabled guard
assert.equal(executablePhp.split('wp_mail(').length - 1, 1, 'Exactly one wp_mail call allowed in executable code');
const deliveryGuardPos = executablePhp.indexOf('if ( ! cpms_lead_delivery_enabled() )');
const wpMailPos = executablePhp.indexOf('wp_mail(');
assert(deliveryGuardPos !== -1 && wpMailPos > deliveryGuardPos, 'The single wp_mail call must sit after the delivery-disabled guard');

// Recipient: authorized default lives in ONE dedicated function; the effective recipient is the
// administrator setting (manage_options) with that default as fallback — never request-derived or filter-overridable
assert.equal((formPhp.match(/biatoweb@gmail\.com/g) || []).length, 1, 'Authorized recipient must appear exactly once in the Demo handler');
const defaultRecipientFn = formPhp.indexOf('function cpms_lead_delivery_default_recipient()');
assert(defaultRecipientFn !== -1 && formPhp.indexOf('biatoweb@gmail.com') > defaultRecipientFn && formPhp.indexOf('biatoweb@gmail.com') < formPhp.indexOf('function cpms_lead_delivery_recipient()'), 'Recipient literal must live inside the dedicated default-recipient function');
const recipientFnBody = formPhp.slice(formPhp.indexOf('function cpms_lead_delivery_recipient()'), formPhp.indexOf('The strict allowlist of POST field names'));
assert(recipientFnBody.includes("koorosh_get_setting( 'lead_recipient' )") && recipientFnBody.includes('cpms_lead_delivery_default_recipient()'), 'Effective recipient = validated admin setting with the authorized default as fallback');
assert(!/\$_(GET|POST|REQUEST|COOKIE|SERVER)/.test(recipientFnBody), 'Recipient resolution must not touch any request superglobal');
assert(!/\$_(POST|GET|REQUEST|COOKIE)\[[^\]]*(recipient|to|email)/i.test(formPhp), 'Recipient must never be read from the request');
assert(!formPhp.includes('apply_filters'), 'Delivery-relevant values must not be filter-overridable');

// Strict expected fields (POST allowlist)
assert(formPhp.includes('function cpms_get_demo_form_allowed_fields()'), 'Strict POST field allowlist required');
const allowlistMatch = formPhp.match(/function cpms_get_demo_form_allowed_fields\(\) \{[\s\S]*?return array\(([\s\S]*?)\);/);
assert(allowlistMatch, 'Allowlist must return an array');
const allowlisted = [...allowlistMatch[1].matchAll(/'([a-z_]+)'/g)].map(m => m[1]);
assert.deepEqual([...allowlisted].sort(), [
  '_wp_http_referer', 'cpms_ajax', 'cpms_contact_name', 'cpms_contact_value', 'cpms_demo_nonce', 'cpms_demo_submit',
  'cpms_discussion_topic', 'cpms_doctor_count', 'cpms_org_name', 'cpms_org_type', 'cpms_submit_btn', 'cpms_website_url',
].sort(), 'Allowlist must be exactly the expected bounded field set (including the _wp_http_referer field wp_nonce_field emits)');

// No persistence, no payload logging, no redirects
assert(!formPhp.includes('wp_insert_post('), 'Form handler must NOT persist payloads to posts');
assert(!formPhp.includes('$wpdb->insert('), 'Form handler must NOT persist payloads to custom tables');
assert(!formPhp.includes('error_log('), 'Form handler must NOT log submitted payloads');
assert(!formPhp.includes('wp_redirect(') && !formPhp.includes('wp_safe_redirect('), 'Form handler must not redirect');

// Safe Reply-To only from a validated, sanitized email contact value
const replyToPos = formPhp.indexOf("'Reply-To: '");
const replyGuardPos = formPhp.indexOf('if ( $reply_to && is_email( $reply_to ) )');
assert(replyGuardPos !== -1 && replyToPos > replyGuardPos, 'Reply-To header must only be built inside the validated-email guard');
assert(formPhp.includes('sanitize_email('), 'Contact value must be sanitized before any header use');

// Plain-text, minimal email only
assert(!formPhp.includes('text/html'), 'No HTML email content type');
assert(!formPhp.includes('Content-Type'), 'No hand-built Content-Type headers');

// Separate delivery states
for (const state of ['CPMS_FORM_STATE_VALIDATION_FAILURE', 'CPMS_FORM_STATE_DELIVERY_DISABLED', 'CPMS_FORM_STATE_HANDOFF_ACCEPTED', 'CPMS_FORM_STATE_HANDOFF_FAILED']) {
  assert(formPhp.includes(state), `Delivery state constant missing: ${state}`);
}

// Anti-spam decoy, data-use disclosure, crawlable privacy link, and conditional non-live banner
assert(formPhp.includes('cpms_website_url'), 'First-party honeypot field required');
assert(formPhp.includes('id="cpms-data-use-note"'), 'Minimal data-use disclosure required beside the form');
assert(formPhp.includes('اطلاعات بیماران یا داده‌های پزشکی وارد نکنید'), 'Data-use disclosure repeats the PHI prohibition');
assert(formPhp.includes('href="/privacy/"') && formPhp.includes('حریم خصوصی وب‌سایت'), 'Data-use disclosure beside the Demo form must include a crawlable link to /privacy/');
assert(!/type=["']checkbox["']/i.test(formPhp), 'Demo form must not add a mandatory consent checkbox without approved legal basis');
assert(!/موافقت با پردازش طبق قانون|رضایت قانونی صریح/u.test(formPhp), 'Demo form must not invent statutory consent wording');
const bannerPos = formPhp.indexOf('cpms-non-live-banner');
assert(bannerPos > deliveryGuardPos, 'Non-live banner must render only while delivery is disabled');
assert(formPhp.includes('SAFE NON-LIVE MODE'), 'Form handler must document the safe non-live default');

// 10b. CI delivery fixtures and runner integrity
const interceptFixture = readFileSync(new URL('../../tests/wp-env/fixtures/cpms-ci-mail-intercept.php', import.meta.url), 'utf8');
assert(interceptFixture.includes('pre_wp_mail'), 'Interception fixture must hook pre_wp_mail');
assert(!interceptFixture.includes('CPMS_LEAD_DELIVERY_ENABLED'), 'Interception fixture must NOT activate delivery (separation of concerns)');
const enableFixture = readFileSync(new URL('../../tests/wp-env/fixtures/cpms-ci-enable-delivery.php', import.meta.url), 'utf8');
assert(enableFixture.includes("define( 'CPMS_LEAD_DELIVERY_ENABLED', true )"), 'Activation fixture must only simulate the environment-owned constant');
assert(!enableFixture.includes('@'), 'Activation fixture must contain no email address / recipient');
const deliveryRunnerText = readFileSync(new URL('../../tests/browser/demo-delivery.mjs', import.meta.url), 'utf8');
assert(!/smtp|phpmailer|mail_transport/i.test(deliveryRunnerText), 'Delivery runner must not configure any mail transport');
assert(deliveryRunnerText.includes('cpms-ci-mail-intercept.php'), 'Delivery runner must install the interception fixture before any activation');
assert(deliveryRunnerText.includes('cpms-ci-enable-delivery.php'), 'Delivery runner must simulate activation via the dedicated fixture');

// 11. Browser test integrity
const browserTestText = readFileSync(new URL('../../tests/browser/demo.mjs', import.meta.url), 'utf8');
assert(!browserTestText.includes('_elementor_data'), 'Browser test must author via official Editor commands, not _elementor_data JSON');

console.log(`PASS: Demo consultation native authoring, qualification and two-mode lead-delivery guardrails (${nodes.length} native Elementor Free elements)`);
