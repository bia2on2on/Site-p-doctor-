/**
 * CI proof of Koorosh Theme Settings v1 (تنظیمات کوروش).
 *
 * Runs ONLY in the ephemeral wp-env container (see
 * .github/workflows/wordpress-elementor-smoke.yml), after the page and site-shell
 * runners. Nothing here sends mail or touches a real host; all data is synthetic
 * and the settings option plus the temporary subscriber are removed at the end,
 * so the suite's safe defaults (lead delivery OFF, indexing OFF) are restored.
 *
 * Layers:
 *  1. Runtime assertions (tests/wp-env/assertions/theme-settings.php via WP-CLI):
 *     safe defaults, schema without secrets, sanitization matrix, capability
 *     enforcement, tab-scoped saves, request-never-overrides, dual-gate logic,
 *     evidence-honest status rows.
 *  2. Bounded admin browser test (Playwright, real login): menu + six sections,
 *     save + reload persistence, invalid email handling, dual-gate status text,
 *     read-only status tab.
 *  3. Front-end/integration: fallback header switches, no gratuitous social or
 *     contact output, Elementor pages unaffected, development stays non-indexed,
 *     unauthenticated/unprivileged writes refused.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const outDir = resolve(import.meta.dirname, 'artifacts/theme-settings');
mkdirSync(outDir, { recursive: true });

const base = 'http://localhost:8888';
const optionName = 'koorosh_settings';
const defaultRecipient = 'biatoweb@gmail.com';
const adminUser = 'admin'; // wp-env disposable default account name
const adminPass = randomBytes(18).toString('base64url'); // random per run, set on the disposable admin below; no credential in Git
const settingsUrl = tab => `${base}/wp-admin/admin.php?page=koorosh-settings&tab=${tab}`;
const expectedTabs = ['عمومی', 'اطلاعات تماس', 'فروش و درخواست دمو', 'هدر و فوتر', 'شبکه‌های اجتماعی', 'وضعیت سایت'];

const results = { checks: [] };
let failures = 0;

function check(name, condition, detail = '') {
  const pass = condition === true;
  results.checks.push({ name, pass, detail: pass ? undefined : String(detail) });
  if (pass) {
    console.log(`PASS: ${name}`);
  } else {
    failures += 1;
    const message = `FAIL: ${name}${detail ? ` — ${detail}` : ''}`;
    console.error(message);
    console.error(`::error title=Theme settings FAIL::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
  }
}

function wp(...args) {
  try {
    return execFileSync(resolve(import.meta.dirname, 'node_modules/.bin/wp-env'), ['run', 'cli', 'wp', ...args], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 180_000,
    }).trim();
  } catch (error) {
    throw new Error(`wp-env CLI failed: ${String(error.stderr || error.message).replace(/--user_pass=\S+/g, '--user_pass=[redacted]')}`);
  }
}
const wpEval = php => wp('eval', php);

const settingsJson = () => wpEval(`echo wp_json_encode( get_option( '${optionName}', null ) );`);
const resetSettings = () => wpEval(`delete_option( '${optionName}' ); echo 'reset';`);
const setAsAdmin = arrayLiteral => wpEval(
  `$a = get_users( array( 'role' => 'administrator', 'number' => 1, 'fields' => 'ID' ) ); wp_set_current_user( (int) $a[0] ); update_option( '${optionName}', ${arrayLiteral} ); echo 'ok';`
);

async function login(page, user, pass) {
  await page.goto(`${base}/wp-login.php`, { waitUntil: 'domcontentloaded' });
  await page.fill('#user_login', user);
  await page.fill('#user_pass', pass);
  await Promise.all([page.waitForURL(/wp-admin/, { timeout: 60_000 }), page.click('#wp-submit')]);
}

// Saving redirects (options.php -> settings page); wait for that one navigation.
// Native browser validation (type=email/url) would swallow invalid submissions before they
// reach the server, so it is switched off here: the test must prove the SERVER-side sanitizer
// is the authority, not the browser hint.
async function submit(page) {
  await page.evaluate(() => { document.querySelectorAll('#koorosh-settings form').forEach(f => { f.noValidate = true; }); });
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60_000 }), page.click('#submit')]);
}

const subscriberLogin = `koorosh_sub_${randomBytes(3).toString('hex')}`;
const subscriberPass = randomBytes(18).toString('base64url');
let subscriberId = null;
let browser = null;

try {
  // ---- Preconditions ---------------------------------------------------------
  check('precondition: active theme is koorosh', wp('theme', 'list', '--status=active', '--field=name') === 'koorosh');
  check('precondition: no PHP fixtures left from earlier runners (environment authorization OFF)', wpEval("echo defined( 'CPMS_LEAD_DELIVERY_ENABLED' ) ? 'defined' : 'undefined';") === 'undefined');
  resetSettings();
  wp('user', 'update', adminUser, `--user_pass=${adminPass}`);

  // ---- Layer 1: runtime assertions -------------------------------------------
  const assertionsPhp = readFileSync(resolve(root, 'tests/wp-env/assertions/theme-settings.php'), 'utf8').replace(/^<\?php\s*/, '');
  const raw = wpEval(assertionsPhp);
  const jsonLine = raw.split('\n').reverse().find(line => line.trim().startsWith('{'));
  let runtime = null;
  try {
    runtime = JSON.parse(jsonLine);
  } catch {
    runtime = null;
  }
  check('runtime assertions executed and returned structured results', Boolean(runtime?.checks?.length), raw.slice(0, 500));
  for (const item of runtime?.checks || []) {
    check(`runtime: ${item.name}`, item.pass === true, item.detail);
  }
  check('runtime assertions left no option row behind', settingsJson() === 'null');

  // ---- Layer 3a: development remains non-indexed, Elementor pages unaffected --
  check('development: blog_public is still 0 (Koorosh Settings never exposes an indexing toggle)', wp('option', 'get', 'blog_public') === '0', wp('option', 'get', 'blog_public'));
  const home = await fetch(`${base}/`);
  const homeHtml = await home.text();
  check('development: X-Robots-Tag noindex header still present', (home.headers.get('x-robots-tag') || '').includes('noindex'), home.headers.get('x-robots-tag'));
  check('development: meta robots noindex still present', /<meta name=['"]robots['"][^>]*noindex/i.test(homeHtml));
  const robots = await (await fetch(`${base}/robots.txt`)).text();
  check('development: robots.txt still disallows crawling', /Disallow:\s*\//.test(robots));
  check('fallback header renders by default (site-header, site-title, header-cta)', homeHtml.includes('class="site-header"') && homeHtml.includes('class="site-title"') && homeHtml.includes('class="header-cta"'));
  check('fallback footer renders by default', homeHtml.includes('class="site-footer"'));
  for (const slug of ['', 'product-overview/', 'demo/', 'privacy/', 'terms/']) {
    const response = await fetch(`${base}/${slug}`);
    const html = await response.text();
    check(`Elementor-composed page /${slug} still renders (HTTP 200, Elementor markup)`, response.status === 200 && /elementor/i.test(html), `status=${response.status}`);
  }
  const demoHtml = await (await fetch(`${base}/demo/`)).text();
  check('Demo form still renders with its honest non-live banner (environment OFF)', demoHtml.includes('id="cpms-non-live-banner"') && demoHtml.includes('name="cpms_demo_nonce"'));

  // ---- Layer 2: admin browser test -------------------------------------------
  browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: base, locale: 'fa-IR' });
  const page = await context.newPage();
  const consoleProblems = [];
  page.on('pageerror', error => consoleProblems.push(String(error)));
  await login(page, adminUser, adminPass);

  await page.goto(`${base}/wp-admin/`, { waitUntil: 'domcontentloaded' });
  const menuTexts = await page.locator('#adminmenu .wp-menu-name').allTextContents();
  check('administrator sees the «تنظیمات کوروش» admin menu entry', menuTexts.some(t => t.trim() === 'تنظیمات کوروش'), JSON.stringify(menuTexts));

  await page.goto(settingsUrl('general'), { waitUntil: 'domcontentloaded' });
  check('settings page heading is «تنظیمات کوروش»', (await page.locator('#koorosh-settings h1').innerText()).trim() === 'تنظیمات کوروش');
  const tabTexts = (await page.locator('#koorosh-settings .nav-tab').allTextContents()).map(t => t.trim());
  check('exactly the six planned sections are present, in order', JSON.stringify(tabTexts) === JSON.stringify(expectedTabs), JSON.stringify(tabTexts));
  check('general tab links to WordPress-native identity controls (no duplicate options)',
    (await page.locator('#koorosh-settings a[href*="options-general.php"]').count()) >= 1 && (await page.locator('#koorosh-settings a[href*="customize.php"]').count()) >= 1 && (await page.locator('#koorosh-settings form').count()) === 0);

  // Contact tab: invalid email is refused, harmless fields persist across reload.
  await page.goto(settingsUrl('contact'), { waitUntil: 'domcontentloaded' });
  await page.fill('#koorosh-contact_email', 'not-an-email');
  await page.fill('#koorosh-contact_phone', '+98 21 0000 0000');
  await page.fill('#koorosh-contact_address', 'آدرس آزمایشی CI');
  await submit(page);
  check('invalid email shows an error notice and is NOT stored', (await page.locator('.settings-error.notice-error').count()) >= 1 && (await page.inputValue('#koorosh-contact_email')) === '');
  await page.reload({ waitUntil: 'domcontentloaded' });
  check('harmless fields persisted after save and reload', (await page.inputValue('#koorosh-contact_phone')) === '+98 21 0000 0000' && (await page.inputValue('#koorosh-contact_address')) === 'آدرس آزمایشی CI');
  await page.fill('#koorosh-contact_email', 'owner-test@example.test');
  await submit(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  check('valid email persisted', (await page.inputValue('#koorosh-contact_email')) === 'owner-test@example.test');
  const storedAfterContact = JSON.parse(settingsJson());
  check('stored option is one versioned array with the saved contact values only (no secret keys)',
    storedAfterContact?.version === 1 && storedAfterContact.contact_email === 'owner-test@example.test' && !Object.keys(storedAfterContact).some(k => /pass|secret|token|api|smtp|credential/i.test(k)), JSON.stringify(storedAfterContact));
  await page.screenshot({ path: resolve(outDir, 'contact-tab.png'), fullPage: true });

  // Sales tab: dual-gate status, invalid recipient refused, switch alone does not authorize.
  await page.goto(settingsUrl('sales'), { waitUntil: 'domcontentloaded' });
  const salesText = await page.locator('#koorosh-settings').innerText();
  check('sales tab shows «محیط اجازه ارسال نداده است» while the environment has not authorized', salesText.includes('محیط اجازه ارسال نداده است'));
  check('sales tab: recipient shows the authorized default, site switch is OFF by default', (await page.inputValue('#koorosh-lead_recipient')) === defaultRecipient && !(await page.isChecked('#koorosh-lead_site_enabled')));
  await page.fill('#koorosh-lead_recipient', 'not-a-valid-recipient');
  await submit(page);
  check('invalid recipient shows an error and the effective recipient is unchanged', (await page.locator('.settings-error.notice-error').count()) >= 1 && wpEval('echo cpms_lead_delivery_recipient();') === defaultRecipient);
  await page.check('#koorosh-lead_site_enabled');
  await page.fill('#koorosh-lead_recipient', 'leads-test@example.test');
  await submit(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  check('recipient and site switch persisted', (await page.inputValue('#koorosh-lead_recipient')) === 'leads-test@example.test' && (await page.isChecked('#koorosh-lead_site_enabled')));
  check('site switch ON without environment authorization still reads «محیط اجازه ارسال نداده است»', (await page.locator('#koorosh-settings').innerText()).includes('محیط اجازه ارسال نداده است'));
  check('effective delivery stays OFF (environment gate missing)', wpEval("echo cpms_lead_delivery_enabled() ? 'on' : 'off';") === 'off');
  check('effective recipient reflects the administrator setting', wpEval('echo cpms_lead_delivery_recipient();') === 'leads-test@example.test');
  await page.screenshot({ path: resolve(outDir, 'sales-tab.png'), fullPage: true });

  // Header & footer tab: fallback switches drive the front-end fallback header.
  await page.goto(settingsUrl('shell'), { waitUntil: 'domcontentloaded' });
  const shellText = await page.locator('#koorosh-settings').innerText();
  check('header/footer tab links menus to the WordPress menu-locations screen', (await page.locator('#koorosh-settings a[href*="nav-menus.php"]').count()) >= 1 && shellText.includes('اختصاص داده شده'));
  await page.uncheck('#koorosh-header_show_cta');
  await submit(page);
  let html = await (await fetch(`${base}/`)).text();
  check('CTA switch OFF removes the fallback header CTA only', !html.includes('class="header-cta"') && html.includes('class="site-title"'));
  await page.check('#koorosh-header_show_cta');
  await page.uncheck('#koorosh-header_show_site_title');
  await page.fill('#koorosh-header_cta_label', 'درخواست دمو آزمایشی CI');
  await submit(page);
  html = await (await fetch(`${base}/`)).text();
  check('site-title switch OFF hides the fallback site title', !html.includes('class="site-title"') && html.includes('site-header__inner--no-title'));
  check('custom CTA label renders escaped inside the fallback header', html.includes('درخواست دمو آزمایشی CI') && html.includes('class="header-cta"'));
  check('header CTA still routes to /demo/', /class="header-cta" href="[^"]*\/demo\/"/.test(html));
  check('primary navigation still renders from the assigned WordPress menu', html.includes('id="site-primary-navigation"'));
  check('fallback footer and footer menu still render', html.includes('class="site-footer"') && html.includes('class="footer-navigation"'));
  await page.check('#koorosh-header_show_site_title');
  await page.fill('#koorosh-header_cta_label', '');
  await submit(page);
  html = await (await fetch(`${base}/`)).text();
  check('restoring defaults restores the original fallback header exactly', html.includes('class="site-title"') && html.includes('>درخواست دمو / مشاوره<') && !html.includes('site-header__inner--no-title'));

  // Social tab: invalid URL refused, valid URL stored, nothing rendered publicly.
  await page.goto(settingsUrl('social'), { waitUntil: 'domcontentloaded' });
  await page.fill('#koorosh-social_instagram', 'javascript:alert(1)');
  await page.fill('#koorosh-social_telegram', 'https://t.me/cpms_ci_test');
  await submit(page);
  check('javascript: URL is refused with an error notice and not stored', (await page.locator('.settings-error.notice-error').count()) >= 1 && (await page.inputValue('#koorosh-social_instagram')) === '');
  await page.reload({ waitUntil: 'domcontentloaded' });
  check('valid social URL persisted', (await page.inputValue('#koorosh-social_telegram')) === 'https://t.me/cpms_ci_test');
  html = await (await fetch(`${base}/`)).text();
  check('no gratuitous front-end output: social, contact and address values are not rendered',
    !html.includes('t.me/cpms_ci_test') && !html.includes('owner-test@example.test') && !html.includes('+98 21 0000 0000') && !html.includes('آدرس آزمایشی CI'));

  // Status tab: strictly read-only, evidence-honest.
  await page.goto(settingsUrl('status'), { waitUntil: 'domcontentloaded' });
  check('status tab is read-only (no form, no save button)', (await page.locator('#koorosh-settings form').count()) === 0 && (await page.locator('#submit').count()) === 0);
  const rows = await page.locator('#koorosh-status-table tbody tr').evaluateAll(trs => trs.map(tr => ({ key: tr.dataset.statusKey, state: tr.dataset.statusState, text: tr.querySelector('td strong')?.textContent.trim() })));
  const byKey = Object.fromEntries(rows.map(r => [r.key, r]));
  for (const key of ['product_media', 'elementor_pro_acceptance', 'search_console']) {
    check(`status: ${key} reads «تأیید نشده»`, byKey[key]?.state === 'unverified' && byKey[key]?.text === 'تأیید نشده', JSON.stringify(byKey[key]));
  }
  check('status: development indexing reads «غیرفعال» (blog_public=0)', byKey.indexing?.state === 'inactive' && byKey.indexing?.text === 'غیرفعال', JSON.stringify(byKey.indexing));
  check('status: environment authorization reads «غیرفعال»; site switch reads «فعال»', byKey.lead_environment?.text === 'غیرفعال' && byKey.lead_site_switch?.text === 'فعال', JSON.stringify([byKey.lead_environment, byKey.lead_site_switch]));
  check('status: privacy and terms pages reported from real page existence', byKey.page_privacy?.text === 'بله' && byKey.page_terms?.text === 'بله', JSON.stringify([byKey.page_privacy, byKey.page_terms]));
  const statusText = await page.locator('#koorosh-settings').innerText();
  check('status tab states it does NOT confirm launch readiness and links the core Reading screen', statusText.includes('آمادگی انتشار را تأیید نمی‌کند') && (await page.locator('#koorosh-settings a[href*="options-reading.php"]').count()) >= 1);
  await page.screenshot({ path: resolve(outDir, 'status-tab.png'), fullPage: true });
  check('no JavaScript errors on the settings screens', consoleProblems.length === 0, consoleProblems.join(' | '));

  // ---- Layer 3b: unprivileged / unauthenticated writes ------------------------
  const before = settingsJson();
  const anonymous = await fetch(`${base}/wp-admin/options.php`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ option_page: 'koorosh_settings_group', action: 'update', 'koorosh_settings[lead_recipient]': 'attacker@example.test', 'koorosh_settings[lead_site_enabled]': '1' }),
  });
  check('anonymous POST to options.php is refused (login redirect or 4xx)', anonymous.status >= 300 && anonymous.status < 500, `status=${anonymous.status}`);
  check('anonymous POST did not change the stored settings', settingsJson() === before);

  subscriberId = wp('user', 'create', subscriberLogin, `${subscriberLogin}@example.test`, '--role=subscriber', `--user_pass=${subscriberPass}`, '--porcelain');
  check('temporary subscriber user created', /^\d+$/.test(subscriberId), subscriberId);
  const subContext = await browser.newContext({ baseURL: base });
  const subPage = await subContext.newPage();
  await login(subPage, subscriberLogin, subscriberPass);
  const denied = await subPage.goto(settingsUrl('sales'), { waitUntil: 'domcontentloaded' });
  check('subscriber cannot open the settings page (HTTP 403)', denied?.status() === 403, `status=${denied?.status()}`);
  check('subscriber does not see the admin menu entry', !(await subPage.locator('#adminmenu .wp-menu-name').allTextContents()).some(t => t.trim() === 'تنظیمات کوروش'));
  const forged = await subContext.request.post(`${base}/wp-admin/options.php`, {
    form: { option_page: 'koorosh_settings_group', action: 'update', _wpnonce: 'forged0000', 'koorosh_settings[lead_recipient]': 'attacker@example.test', 'koorosh_settings[lead_site_enabled]': '1' },
    maxRedirects: 0,
  });
  check('subscriber POST to options.php with a forged nonce is refused', forged.status() >= 300 && forged.status() < 500, `status=${forged.status()}`);
  check('subscriber POST did not change the stored settings', settingsJson() === before);
  await subContext.close();
} catch (error) {
  failures += 1;
  results.error = String(error.stack || error).replace(/--user_pass=\S+/g, '--user_pass=[redacted]');
  console.error(`::error title=Theme settings error::${results.error.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
} finally {
  try {
    if (browser) await browser.close();
  } catch {
    // ignore
  }
  try {
    if (subscriberId && /^\d+$/.test(subscriberId)) wp('user', 'delete', subscriberId, '--yes');
    resetSettings();
  } catch {
    // Best effort: cleanup must never mask the real result.
  }
  results.passed = results.checks.filter(c => c.pass).length;
  results.failed = failures;
  results.result = failures === 0 ? 'PASS' : 'FAIL';
  writeFileSync(resolve(outDir, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`== Theme settings proof: ${results.passed} passed, ${failures} failed ==`);
  if (failures > 0) process.exitCode = 1;
}
