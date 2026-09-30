/**
 * Static guardrails for Koorosh Theme Settings v1 (تنظیمات کوروش).
 *
 * No WordPress runtime needed. Runtime behavior (sanitization, capabilities,
 * dual gate, status honesty) is proven in CI by tests/wp-env/assertions/
 * theme-settings.php + tests/browser/theme-settings.mjs and by the extended
 * tests/browser/demo-delivery.mjs; this file locks the structure those tests
 * rely on and the ownership boundaries (no secrets, no page-builder creep).
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const settings = read('themes/koorosh/inc/theme-settings.php');
const code = settings.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// ---- Admin UX ---------------------------------------------------------------
assert(code.includes("add_menu_page(") && code.includes("'manage_options'"), 'Admin menu page requires manage_options');
assert(settings.includes("'تنظیمات کوروش'"), 'Admin label is «تنظیمات کوروش»');
const tabLabels = ['عمومی', 'اطلاعات تماس', 'فروش و درخواست دمو', 'هدر و فوتر', 'شبکه‌های اجتماعی', 'وضعیت سایت'];
const tabsFn = settings.slice(settings.indexOf('function koorosh_settings_tabs()'), settings.indexOf('function koorosh_settings_schema()'));
const tabOrder = tabLabels.map(l => tabsFn.indexOf(`'${l}'`));
assert(tabOrder.every((p, i) => p !== -1 && (i === 0 || p > tabOrder[i - 1])), 'The six planned tabs exist, in the planned order');
assert(!/wp_enqueue_(script|style)|admin_enqueue_scripts|<script|<style\b.*>\s*[^<]*\{/i.test(code.replace(/style="max-width:52rem"/g, '')), 'Native admin UI: no custom admin JS/CSS enqueued or embedded');

// ---- Settings API, nonce, capability ---------------------------------------
assert(code.includes('register_setting('), 'Uses the WordPress Settings API');
assert(code.includes("'sanitize_callback' => 'koorosh_sanitize_settings'"), 'Every value passes through one sanitize callback');
assert(code.includes('settings_fields( KOOROSH_SETTINGS_GROUP )'), 'Form carries the Settings API nonce/option-page fields');
assert(/option_page_capability_' \. KOOROSH_SETTINGS_GROUP[\s\S]{0,120}'manage_options'/.test(code), 'Settings API save capability is manage_options');
const sanitizeBody = code.slice(code.indexOf('function koorosh_sanitize_settings('), code.indexOf('function koorosh_lead_delivery_state()'));
assert(sanitizeBody.includes("current_user_can( 'manage_options' )"), 'Sanitize callback refuses writers without manage_options (defense in depth)');
assert(code.includes('function koorosh_render_settings_page()') && /function koorosh_render_settings_page\(\) \{\s*if \( ! current_user_can\( 'manage_options' \) \)/.test(code), 'Page renderer re-checks the capability');

// ---- Security hygiene --------------------------------------------------------
assert(!/\$_(POST|REQUEST|COOKIE|FILES)\b/.test(code), 'Settings code never reads POST/REQUEST/COOKIE/FILES directly (Settings API only)');
assert((code.match(/\$_GET\[/g) || []).length === 2 && (code.match(/\$_GET\['tab'\]/g) || []).length === 2 && code.includes("sanitize_key( wp_unslash( $_GET['tab'] ) )"), 'Only the tab selector is read from GET, sanitized and allowlisted');
assert(!/\bwp_mail\s*\(|\bmail\s*\(|\beval\s*\(|base64_|unserialize\s*\(|file_put_contents|\bexec\s*\(|shell_exec|system\s*\(|passthru|curl_|wp_remote_|\$wpdb/.test(code), 'Settings code has no mail, network, code-execution, filesystem or raw-SQL capability');
assert(!/echo\s+\$[\w\[\]'>-]+\s*[;.]|<\?=\s*\$/.test(code), 'No raw variable echo: every output goes through an escaping helper or literal');
assert(!/register_rest_route|show_in_rest'\s*=>\s*true|wp_ajax_|admin_post_/.test(code), 'No REST/AJAX/admin-post surface is added');
assert(!/apply_filters\(\s*['"](?!option_page_capability_)/.test(code.replace(/apply_filters\( 'option_page_capability_/g, '')), 'No filter hook can alter stored or effective settings');
assert(settings.length < 40_000, 'Settings file stays small (no options framework)');

// ---- Schema: compact, bounded, secret-free ------------------------------------
const schemaFn = code.slice(code.indexOf('function koorosh_settings_schema()'), code.indexOf('function koorosh_settings_defaults()'));
const keys = [...schemaFn.matchAll(/'([a-z_]+)'\s*=>\s*array\(\s*'tab'/g)].map(m => m[1]).sort();
assert.deepEqual(keys, [
  'contact_address', 'contact_email', 'contact_phone', 'header_cta_label', 'header_show_cta', 'header_show_site_title',
  'lead_recipient', 'lead_site_enabled', 'social_instagram', 'social_linkedin', 'social_telegram',
].sort(), 'Schema is exactly the documented bounded key set');
for (const key of keys) {
  assert(!/pass|secret|token|api|smtp|credential|oauth|private|licen[cs]e|auth/i.test(key), `No secret-like settings key: ${key}`);
}
assert(!/'type'\s*=>\s*'(password|html|css|js|code|textarea|wysiwyg)'/.test(schemaFn), 'No unsafe/arbitrary-content field types');
assert(/'lead_site_enabled'\s*=>\s*array\([\s\S]*?'default'\s*=>\s*false/.test(schemaFn), 'Site-level lead switch defaults to OFF');
assert((settings.match(/define\( 'KOOROSH_SETTINGS_OPTION', 'koorosh_settings' \)/g) || []).length === 1, 'ONE compact option array');
assert(!/add_option\(|update_option\(\s*['"](?!blog_public)/.test(code), 'Settings code writes no other wp_options entries');
assert(!/biatoweb@gmail\.com/.test(settings), 'Authorized recipient literal stays single-sourced in demo-form.php');
assert(!/\bmailto:|\btel:|https?:\/\/[a-z0-9-]+\.[a-z]{2,}/i.test(code), 'No invented contact or social targets in code');

// ---- Status honesty --------------------------------------------------------------
const statusFn = code.slice(code.indexOf('function koorosh_get_site_status_rows()'), code.indexOf('function koorosh_status_state_labels()'));
for (const key of ['product_media', 'elementor_pro_acceptance', 'search_console']) {
  assert(new RegExp(`'key'\\s*=>\\s*'${key}',[\\s\\S]*?'state'\\s*=>\\s*'unverified'`).test(statusFn), `${key} is hard-wired unverified (no evidence source exists)`);
}
assert(statusFn.includes("get_option( 'blog_public' )"), 'Indexing status reads the standard WordPress Reading option');
assert(!/update_option\(\s*'blog_public'|add_option\(\s*'blog_public'/.test(code), 'Panel never writes blog_public (publication gate untouched)');
assert(settings.includes("'active'     => 'فعال'") && settings.includes("'unverified' => 'تأیید نشده'") && settings.includes("'review'     => 'نیازمند بررسی'"), 'Evidence-honest Persian status vocabulary');
assert(!/'pass'|'ready'|'ok'\s*=>/.test(statusFn + code.slice(code.indexOf('function koorosh_status_state_labels()'), code.indexOf('Registration + admin UI'))), 'No pass/ready/ok state exists');
for (const phrase of ['محیط اجازه ارسال نداده است', 'محیط اجازه داده، اما ارسال سایت خاموش است', 'ارسال سایت و محیط هر دو فعال‌اند']) {
  assert(settings.includes(phrase), `Dual-gate status wording present: ${phrase}`);
}

// ---- Wiring, precedence, boundaries -------------------------------------------------
const functionsPhp = read('themes/koorosh/functions.php');
assert(functionsPhp.indexOf("/inc/theme-settings.php'") !== -1 && functionsPhp.indexOf("/inc/theme-settings.php'") < functionsPhp.indexOf("/demo-form.php'"), 'Settings load before the Demo handler that reads them');
const header = read('themes/koorosh/header.php');
assert(header.includes("elementor_theme_do_location( 'header' )"), 'Elementor Pro Theme Builder header keeps precedence');
assert(header.includes("koorosh_get_setting( 'header_show_cta' )") && header.includes('$koorosh_show_title') && header.includes("koorosh_get_setting( 'header_cta_label' )"), 'Fallback header honours the three shell settings');
assert(header.includes('has_custom_logo()') && header.includes('the_custom_logo()'), 'Logo uses the WordPress Custom Logo mechanism');
assert(header.includes("'درخواست دمو / مشاوره'") && header.includes("home_url( '/demo/' )"), 'Default CTA label and /demo/ destination preserved');
const footer = read('themes/koorosh/footer.php');
assert(footer.includes("elementor_theme_do_location( 'footer' )") && !/koorosh_get_setting/.test(footer), 'Footer keeps Elementor precedence and gains no settings-driven contact/social output');
for (const file of ['header.php', 'footer.php', 'index.php', '404.php', 'page-elementor.php']) {
  const src = read(`themes/koorosh/${file}`);
  assert(!/social_(instagram|linkedin|telegram)|contact_(email|phone|address)/.test(src), `${file} does not render contact/social settings (no gratuitous output)`);
}
const legalFiles = ['reconstruction/privacy/recipe.mjs', 'reconstruction/terms/recipe.mjs'];
for (const file of legalFiles) {
  assert(!/koorosh_settings|koorosh_get_setting/.test(read(file)), `${file}: legal copy is not auto-injected from theme settings`);
}
assert(/add_theme_support\(\s*'custom-logo'/.test(code), 'Custom Logo theme support registered');
assert(!/site_icon|add_theme_support\( 'custom-favicon|favicon/i.test(code.replace(/has_site_icon\(\)/g, '').replace(/Site Icon \/ favicon/g, '').replace(/'label'[^\n]*/g, '')), 'No duplicate favicon option (WordPress Site Icon only)');

// No framework/vendor creep inside the theme.
const themeEntries = readdirSync(new URL('../../themes/koorosh/', import.meta.url));
for (const banned of ['package.json', 'composer.json', 'vendor', 'node_modules', 'redux', 'acf']) {
  assert(!themeEntries.includes(banned), `Theme must not contain ${banned}`);
}
assert.deepEqual(readdirSync(new URL('../../themes/koorosh/inc/', import.meta.url)).sort(), ['theme-settings.php'], 'inc/ holds only the settings file');
assert(!/react|vue|redux|acf_add|redux_framework|cmb2|carbon_fields/i.test(code), 'No options-framework dependency');

// ---- CI wiring + test artifacts --------------------------------------------------
const workflow = read('.github/workflows/wordpress-elementor-smoke.yml');
assert(workflow.includes('node tests/browser/theme-settings.mjs'), 'CI runs the Theme Settings proof');
assert(read('tests/wp-env/smoke.sh').includes('inc/theme-settings.php'), 'Runtime smoke PHP-lints the settings file in the container');
const assertions = read('tests/wp-env/assertions/theme-settings.php');
for (const marker of ['defaults: site-level lead switch is OFF', 'schema: no secret-like field exists', 'subscriber cannot change the lead recipient', 'effective recipient ignores GET/POST/REQUEST parameters', 'dual gate: site switch ON alone never authorizes delivery', 'status: product_media']) {
  assert(assertions.includes(marker) || assertions.includes(marker.replace('product_media', '$unknown')), `Runtime assertion present: ${marker}`);
}
const browser = read('tests/browser/theme-settings.mjs');
for (const marker of ['تنظیمات کوروش', 'settings-error', 'not-an-email', 'subscriber cannot open the settings page']) {
  assert(browser.includes(marker), `Admin browser proof covers: ${marker}`);
}
const delivery = read('tests/browser/demo-delivery.mjs');
for (const marker of ['environment ON + site switch OFF', 'disabling the site switch stops mail', 'administrator-configured recipient', 'query-string recipient parameters are ignored', 'koorosh_settings[lead_recipient]']) {
  assert(delivery.includes(marker), `Delivery proof covers the dual gate / recipient: ${marker}`);
}
assert(!/(passw|secret|token|api.?key)/i.test(read('tests/wp-env/fixtures/cpms-ci-enable-delivery.php')) , 'Activation fixture stays credential-free');

// ---- Documentation -----------------------------------------------------------------
const docs = read('docs/TECHNICAL-FOUNDATION.md');
for (const phrase of ['Koorosh Theme Settings v1', 'koorosh_settings', 'DUAL GATE', 'Elementor-owned', 'environment-owned']) {
  assert(docs.includes(phrase), `TECHNICAL-FOUNDATION documents: ${phrase}`);
}

console.log('PASS: Koorosh Theme Settings guardrails (compact option, Settings API + manage_options, no secrets, dual-gate delivery, evidence-honest read-only status, Elementor precedence)');
