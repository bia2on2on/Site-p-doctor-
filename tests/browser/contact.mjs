/**
 * Browser verification of the CPMS Contact utility page (/contact/).
 * «تماس با ما»
 * Ephemeral wp-env only. No DB JSON writes, private APIs, or host operations.
 * Runs after the Terms runner and before the site-shell runner (the footer
 * menu that references /contact/ is built by the site-shell runner).
 *
 * Proves: the page reconstructs as native, persisted, Elementor-editable
 * content; the public contact email renders from Koorosh Theme Settings at
 * runtime (never frozen in Elementor copy) with the authorized default
 * biatoweb@gmail.com; changing contact_email changes the rendered email with
 * no page rebuild; changing lead_recipient alone does NOT change it; phone
 * and address render only when configured (tel: safely normalized) and
 * produce no empty rows when cleared; unsafe tampered settings never render;
 * the Demo CTA resolves to /demo/, the privacy link resolves, the Demo page
 * keeps its alternative /contact/ route; no support/SLA claims; no schema;
 * development stays non-indexed; all earlier pages still serve; clean
 * console/network at 390×844, 768×1024, 1366×768, 1920×1080. No mail sent.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { contactPage, pageIdentity } from '../../reconstruction/contact/recipe.mjs';
import { homepage } from '../../reconstruction/homepage/recipe.mjs';
import { productOverview } from '../../reconstruction/product-overview/recipe.mjs';
import { demoPage } from '../../reconstruction/demo/recipe.mjs';
import { appointmentReceptionQueue } from '../../reconstruction/appointment-reception-queue/recipe.mjs';
import { patientRecordContinuity } from '../../reconstruction/patient-record-continuity/recipe.mjs';
import { doctorWorkspace } from '../../reconstruction/doctor-workspace/recipe.mjs';
import { patientPortal } from '../../reconstruction/patient-portal/recipe.mjs';
import { prescriptionsDocuments } from '../../reconstruction/prescriptions-documents/recipe.mjs';
import { faqPage } from '../../reconstruction/faq/recipe.mjs';
import { securityDataAccess } from '../../reconstruction/security-data-access/recipe.mjs';
import { privacyPage } from '../../reconstruction/privacy/recipe.mjs';
import { termsPage } from '../../reconstruction/terms/recipe.mjs';
import { footerMenu } from '../../reconstruction/site-shell/menu.mjs';
import {
  assertPersianTypography,
  assertLegalBoundary,
} from '../static/boundary-legal.mjs';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(import.meta.dirname, 'artifacts/contact');
mkdirSync(out, { recursive: true });
process.on('uncaughtException', error => {
  const message = String(error.stack || error).replace(/user_pass=\S+/g, 'user_pass=[redacted]');
  writeFileSync(resolve(out, 'bootstrap-error.txt'), message);
  console.error(`::error title=Contact page reconstruction::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
  process.exitCode = 1;
});
const base = 'http://localhost:8888';
function wp(...args) {
  try {
    return execFileSync(resolve(import.meta.dirname, 'node_modules/.bin/wp-env'), ['run', 'cli', 'wp', ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120_000 }).trim();
  } catch (error) {
    throw new Error(`wp-env CLI failed: ${error.stderr?.toString().replace(/user_pass=\S+/g, 'user_pass=[redacted]')}`);
  }
}
const tokens = JSON.parse(readFileSync(resolve(root, 'design-system/tokens.json')));
const recipe = contactPage(tokens);
const flatten = nodes => nodes.flatMap(n => [n, ...flatten(n.children || [])]);
const all = flatten(recipe);
const normalize = value => String(value).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const authoredH1 = authored => normalize(flatten(authored(tokens)).find(n => n.kind === 'heading' && n.settings.header_size === 'h1').settings.title);
const DEFAULT_EMAIL = 'biatoweb@gmail.com';

assert.equal(wp('option', 'get', 'home'), base, 'Only disposable default wp-env URL supported');
assert.equal(wp('theme', 'list', '--status=active', '--field=name'), 'koorosh');
wp('plugin', 'is-active', 'elementor');
assert.equal(wp('post', 'list', '--post_type=page', `--name=${pageIdentity.slug}`, '--format=count'), '0', 'Refuse to overwrite existing page; use clean env');

// Deterministic settings state for the default-email proof.
wp('eval', 'delete_option( \'koorosh_settings\' ); echo "cleaned";');

const precedingPages = [
  ['cpms-home', '/', homepage],
  ['product-overview', '/product-overview/', productOverview],
  ['demo', '/demo/', demoPage],
  ['appointment-reception-queue', '/appointment-reception-queue/', appointmentReceptionQueue],
  ['patient-record-continuity', '/patient-record-continuity/', patientRecordContinuity],
  ['doctor-workspace', '/doctor-workspace/', doctorWorkspace],
  ['patient-portal', '/patient-portal/', patientPortal],
  ['prescriptions-documents', '/prescriptions-documents/', prescriptionsDocuments],
  ['faq', '/faq/', faqPage],
  ['security-data-access', '/security-data-access/', securityDataAccess],
  ['privacy', '/privacy/', privacyPage],
  ['terms', '/terms/', termsPage],
];
for (const [slug] of precedingPages) {
  assert.equal(wp('post', 'list', '--post_type=page', `--name=${slug}`, '--field=post_status'), 'publish', `${slug} must already be reconstructed`);
  assert.equal(wp('eval', `$p = get_page_by_path('${slug}'); $d = $p ? \\Elementor\\Plugin::$instance->documents->get($p->ID) : null; echo $d && $d->is_built_with_elementor() ? '1' : '0';`), '1', `${slug} must remain Elementor-editable`);
}

// Validate native controls
const requestedControls = Object.fromEntries(['container', 'heading', 'text-editor', 'button'].map(kind => [kind, [...new Set(all.filter(n => n.kind === kind).flatMap(n => Object.keys(n.settings)))]]));
const requestedBase64 = Buffer.from(JSON.stringify(requestedControls)).toString('base64');
const schemas = JSON.parse(wp('eval', `
$p = \\Elementor\\Plugin::$instance;
$result = array();
$requested = json_decode(base64_decode('${requestedBase64}'), true);
foreach ($requested as $kind => $keys) {
  $element = $kind === 'container' ? $p->elements_manager->get_element_types($kind) : $p->widgets_manager->get_widget_types($kind);
  $result[$kind] = array();
  foreach ($keys as $key) {
    $control = $element ? $element->get_controls($key) : null;
    if ($control === null && $element && preg_match('/_(mobile|tablet)$/', $key, $match)) {
      $base = substr($key, 0, -strlen($match[0]));
      $parent = $element->get_controls($base);
      $active = $p->breakpoints->get_active_breakpoints();
      if (isset($active[$match[1]]) && is_array($parent) && (!empty($parent['is_responsive']) || array_key_exists('responsive', $parent))) { $control = $parent; }
    }
    if ($control !== null) { $result[$kind][] = $key; }
  }
}
echo wp_json_encode($result);
`));
writeFileSync(resolve(out, 'native-controls.json'), JSON.stringify(schemas, null, 2));
const unsupported = [...new Set(all.flatMap(n => Object.keys(n.settings).filter(key => !schemas[n.kind]?.includes(key)).map(key => `${n.kind}.${key}`)))];
assert.deepEqual(unsupported, [], 'Unsupported native controls');

wp('option', 'update', 'blog_public', '0');
wp('option', 'update', 'blogname', 'CPMS');
wp('option', 'update', 'blogdescription', '');
const adminId = wp('user', 'get', 'admin', '--field=ID');
wp('user', 'meta', 'update', adminId, 'locale', 'en_US');
const password = randomBytes(24).toString('hex');
wp('user', 'update', 'admin', `--user_pass=${password}`);
const id = wp('post', 'create', '--post_type=page', '--post_status=draft', `--post_title=${pageIdentity.title}`, `--post_name=${pageIdentity.slug}`, `--post_excerpt=${pageIdentity.description}`, '--porcelain');
assert.match(id, /^\d+$/);
wp('post', 'meta', 'update', id, '_wp_page_template', 'page-elementor.php');

const browser = await chromium.launch({ headless: true });
let editor;
let frontend;
const diagnostic = { editorErrors: [], frontendErrors: [], failedRequests: [], badResponses: [], externalRequests: [], views: [], pageId: id, elementCount: all.length, settingsProofs: [] };
try {
  const admin = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-US' });
  editor = await admin.newPage();
  editor.on('pageerror', e => diagnostic.editorErrors.push(e.message));
  await editor.goto(`${base}/wp-login.php`);
  await editor.locator('#user_login').fill('admin');
  await editor.locator('#user_pass').fill(password);
  await Promise.all([editor.waitForURL(/wp-admin/), editor.locator('#wp-submit').click()]);
  await editor.goto(`${base}/wp-admin/post.php?post=${id}&action=elementor`);
  await editor.waitForFunction(() => window.elementor?.getPreviewContainer?.() && ['document/elements/create', 'document/elements/settings', 'document/save/publish'].every(name => window.$e?.commands?.getAll()?.includes(name)), null, { timeout: 120_000 });

  const authoring = await editor.evaluate(async nodes => {
    const required = ['document/elements/create', 'document/elements/settings', 'document/save/publish'];
    const commands = $e.commands.getAll();
    for (const name of required) if (!commands.includes(name)) throw new Error(`Missing command: ${name}`);
    const parent = elementor.getPreviewContainer();
    if (parent.children.length) throw new Error('Refusing to replace existing content');
    const created = [];
    async function create(n, target) {
      const model = n.kind === 'container' ? { elType: 'container' } : { elType: 'widget', widgetType: n.kind };
      const container = await $e.run('document/elements/create', { container: target, model });
      await $e.run('document/elements/settings', { container, settings: n.settings, options: { debounce: false } });
      created.push({ name: n.name, kind: n.kind, id: container.id });
      for (const child of n.children || []) await create(child, container);
    }
    for (const n of nodes) await create(n, parent);
    await $e.run('document/save/publish');
    return { commands: required, created };
  }, recipe);
  writeFileSync(resolve(out, 'authoring.json'), JSON.stringify(authoring, null, 2));
  assert.equal(wp('post', 'get', id, '--field=post_status'), 'publish');
  wp('rewrite', 'structure', '/%postname%/');
  const homeId = wp('post', 'list', '--post_type=page', '--name=cpms-home', '--field=ID');
  assert.match(homeId, /^\d+$/);
  wp('option', 'update', 'show_on_front', 'page');
  wp('option', 'update', 'page_on_front', homeId);
  wp('elementor', 'flush-css');

  await editor.reload();
  await editor.waitForFunction(() => window.elementor?.getPreviewContainer?.()?.children?.length > 0, null, { timeout: 120_000 });
  const reloaded = await editor.evaluate(() => {
    const visit = c => [c.model.get('widgetType') || c.model.get('elType'), ...c.children.flatMap(visit)];
    return elementor.getPreviewContainer().children.flatMap(visit);
  });
  assert.equal(reloaded.length, all.length);
  assert.equal(reloaded.filter(k => k === 'heading').length, all.filter(n => n.kind === 'heading').length);
  assert(reloaded.every(k => ['container', 'heading', 'text-editor', 'button'].includes(k)));
  await editor.screenshot({ path: resolve(out, 'editor.png') });
  await admin.close();

  const state = JSON.parse(wp('eval', `
$id = ${id};
$document = \\Elementor\\Plugin::$instance->documents->get($id);
echo wp_json_encode(array('id' => $id, 'status' => get_post_status($id), 'editable' => $document && $document->is_built_with_elementor(), 'theme' => get_stylesheet(), 'elementor' => defined('ELEMENTOR_VERSION') ? ELEMENTOR_VERSION : '', 'locale' => get_locale(), 'indexable' => get_option('blog_public'), 'permalinks' => get_option('permalink_structure')));
`));
  assert.equal(state.status, 'publish');
  assert.equal(state.editable, true);
  assert.equal(state.theme, 'koorosh');
  assert.equal(state.locale, 'fa_IR');
  assert.equal(state.indexable, '0', 'Development remains non-indexed');
  assert.equal(state.permalinks, '/%postname%/');
  diagnostic.runtime = state;

  // The Elementor page copy must NEVER contain a frozen contact email (test 7).
  const elementorData = wp('post', 'meta', 'get', id, '_elementor_data');
  assert(!/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(elementorData), 'No email address is frozen in the Elementor page copy');
  const elementorDataBefore = elementorData;

  const pageUrl = `${base}/${pageIdentity.slug}/`;
  const visitor = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await visitor.newPage();
  frontend = page;
  page.on('pageerror', e => diagnostic.frontendErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') diagnostic.frontendErrors.push(m.text()); });
  page.on('requestfailed', r => diagnostic.failedRequests.push({ url: r.url(), failure: r.failure() }));
  page.on('response', r => { if (r.status() >= 400) diagnostic.badResponses.push({ url: r.url(), status: r.status() }); });
  page.on('request', r => { if (!r.url().startsWith(base) && /^https?:/.test(r.url())) diagnostic.externalRequests.push(r.url()); });

  for (const [name, width, height] of [['mobile', 390, 844], ['tablet', 768, 1024], ['desktop', 1366, 768], ['large-desktop', 1920, 1080]]) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(pageUrl, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `${name}: Contact page serves`);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.equal(await page.locator('html').getAttribute('lang'), 'fa-IR');
    assert.equal(await page.locator('main').count(), 1);
    assert.equal(await page.locator('h1').count(), 1, 'Exactly one H1');
    assert.match(await page.title(), /CPMS/);
    assert.equal(normalize(await page.locator('h1').innerText()), 'تماس با ما');
    assert.equal(await page.locator('meta[name="description"]').count(), 1);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
    assert.equal(await page.locator('main form').count(), 0, 'Contact page has no form (not a second lead form)');
    assert.equal(await page.locator('main img, main canvas, main video').count(), 0, 'No fabricated media');

    const html = await page.content();
    assert(!/application\/ld\+json|FAQPage|"@type"\s*:\s*"(Organization|LocalBusiness)"|schema\.org|itemscope|itemtype/i.test(html), 'No structured data (no Organization/LocalBusiness schema)');
    assert(!html.includes('[cpms_contact_details]'), 'Shortcode renders; never shown raw');

    // Demo / consultation CTA (mission route 1)
    const cta = page.locator('main').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true }).first();
    assert.equal(await cta.getAttribute('href'), '/demo/', 'Demo CTA resolves to /demo/');
    const ctaBox = await cta.boundingBox();
    assert(ctaBox.y + ctaBox.height < height + 220, `${name}: Demo CTA near first viewport`);
    assert(ctaBox.height >= 44, 'CTA touch size');

    // Settings-driven general contact (mission route 2) — default state (tests 8, 11)
    const emailLink = page.locator('main .cpms-contact-details .cpms-contact-email a');
    assert.equal(await emailLink.count(), 1, 'Exactly one public email row (default state)');
    assert.equal((await emailLink.innerText()).trim(), DEFAULT_EMAIL, 'Default public contact email resolves to the authorized address');
    assert.equal(await emailLink.getAttribute('href'), `mailto:${DEFAULT_EMAIL}`, 'Email renders as a normal mailto: link');
    assert((await emailLink.getAttribute('aria-label') || '').includes(DEFAULT_EMAIL), 'Email link carries an understandable label');
    assert.equal(await page.locator('main .cpms-contact-details .cpms-contact-phone').count(), 0, 'No phone row when phone is not configured');
    assert.equal(await page.locator('main .cpms-contact-details .cpms-contact-address').count(), 0, 'No address row when address is not configured');
    assert.equal(await page.locator('main .cpms-contact-details li').count(), 1, 'Empty optional fields produce no empty rows/placeholders');

    // Privacy link + short no-PHI clarification (mission items 4–5)
    const privacyLink = page.locator('main a[href="/privacy/"]');
    assert.equal(await privacyLink.count(), 1, 'Small privacy link present');
    assert((await page.locator('main').innerText()).includes('اطلاعات بیماران یا هرگونه دادهٔ پزشکی'), 'Short no-PHI clarification present');
    assert((await page.locator('main').innerText()).includes('به‌معنی تضمین تحویل پیام یا تعهد زمان پاسخ نیست'), 'No delivery/response-time guarantee implied');

    const measures = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      font: getComputedStyle(document.querySelector('h1')).fontFamily,
      fontLoaded: document.fonts.check('700 30px Vazirmatn'),
      headings: [...document.querySelectorAll('main h1, main h2, main h3')].map(n => ({ tag: n.tagName, text: n.textContent })),
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
      // Only remote WEB resources are external here: the settings-rendered
      // mailto:/tel: contact links have opaque origins ("null") by URL-spec
      // design and are the intended contact mechanism, not remote assets.
      offsiteLinks: [...document.querySelectorAll('main a')].filter(a => /^https?:$/.test(a.protocol) && a.origin !== location.origin).map(a => a.href),
      contactLinks: [...document.querySelectorAll('main a')].filter(a => /^(mailto|tel):$/.test(a.protocol)).map(a => a.getAttribute('href')),
      crossPageLinks: [...document.querySelectorAll('main a')].filter(a => a.origin === location.origin && a.pathname !== location.pathname && !a.hash).map(a => a.pathname),
      renderedStrings: [...document.querySelectorAll('main h1, main h2, main h3, main p')].map(n => n.textContent.trim()).filter(Boolean),
    }));
    assert(measures.scrollWidth <= measures.width, `${name}: no horizontal overflow`);
    assert(measures.font.includes('Vazirmatn') && measures.fontLoaded, 'Local Persian font loaded');
    assert.deepEqual(measures.brokenAnchors, []);
    assert.deepEqual(measures.offsiteLinks, [], 'No external web resources (mailto/tel contact links excluded by design)');
    assert.deepEqual([...measures.crossPageLinks].sort(), ['/demo/', '/privacy/'], `${name}: only the Demo and privacy destinations`);
    const levels = measures.headings.map(h => Number(h.tag.slice(1)));
    assert.equal(levels[0], 1, 'H1 precedes');
    assert(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1), 'No skipped heading levels');

    diagnostic.views.push({ name, width, height, ...measures, renderedStrings: undefined });

    const copyText = measures.renderedStrings.join('\n');
    assert(!/پشتیبانی|پاسخ\u200c?گویی\s*۲۴|تیم پشتیبانی|۲۴\s*ساعتته|پاسخ\u200c?گویی فوری|SLA|تماس در کمتر از/u.test(copyText), `${name}: no support/SLA claims`);
    assertPersianTypography(measures.renderedStrings, `Contact rendered copy (${name})`);
    assertLegalBoundary(measures.renderedStrings, `Contact rendered copy (${name})`);

    console.log(`::notice title=Contact composition ${name}::PASS: H1 ok, ${Math.round(measures.scrollWidth)}px width, no overflow, no schema, settings-driven email, no support claims`);
    await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
    await page.screenshot({ path: resolve(out, `${name}-viewport.png`) });

    let ctaFocused = false;
    for (let tab = 0; tab < 16 && !ctaFocused; tab++) {
      await page.keyboard.press('Tab');
      ctaFocused = await cta.evaluate(a => a === document.activeElement);
    }
    assert(ctaFocused, 'Demo CTA reachable by keyboard');
    assert(await cta.evaluate(a => getComputedStyle(a).outlineStyle !== 'none'), 'Visible focus on CTA');
    let emailFocused = false;
    for (let tab = 0; tab < 16 && !emailFocused; tab++) {
      await page.keyboard.press('Tab');
      emailFocused = await emailLink.evaluate(a => a === document.activeElement);
    }
    assert(emailFocused, 'Email link reachable by keyboard');
  }

  await page.setViewportSize({ width: 1366, height: 768 });

  // ---- Test 9: updating contact_email changes the rendered email at runtime,
  // with no page rebuild (page ID and Elementor copy untouched).
  wp('option', 'update', 'koorosh_settings', JSON.stringify({ contact_email: 'new-contact@example.test' }), '--format=json', '--user=admin');
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  assert.equal((await page.locator('main .cpms-contact-details .cpms-contact-email a').innerText()).trim(), 'new-contact@example.test', 'Rendered contact email follows Theme Settings at runtime');
  assert.equal(await page.locator('main .cpms-contact-details .cpms-contact-email a').getAttribute('href'), 'mailto:new-contact@example.test');
  assert.equal(wp('post', 'get', id, '--field=ID'), id, 'Same page (no rebuild)');
  assert.equal(wp('post', 'meta', 'get', id, '_elementor_data'), elementorDataBefore, 'Elementor page copy unchanged by the settings edit');
  diagnostic.settingsProofs.push('contact_email update re-renders without page rebuild');

  // ---- Test 10: changing lead_recipient ALONE must NOT change the public email.
  wp('option', 'update', 'koorosh_settings', JSON.stringify({ lead_recipient: 'sales-leads@example.test' }), '--format=json', '--user=admin');
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  assert.equal((await page.locator('main .cpms-contact-details .cpms-contact-email a').innerText()).trim(), 'new-contact@example.test', 'lead_recipient change leaves the public contact email untouched');
  assert.equal(wp('eval', "echo cpms_lead_delivery_recipient();"), 'sales-leads@example.test', 'Lead recipient resolves independently');
  diagnostic.settingsProofs.push('lead_recipient change does not affect public contact email');

  // ---- Tests 12: phone/address appear when configured; tel: normalized.
  wp('option', 'update', 'koorosh_settings', JSON.stringify({ contact_phone: '۰۹۱۲ ۳۴۵ ۶۷۸۹', contact_address: 'تهران، خیابان نمونه' }), '--format=json', '--user=admin');
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  const phoneLink = page.locator('main .cpms-contact-details .cpms-contact-phone a');
  assert.equal(await phoneLink.count(), 1, 'Phone row appears when configured');
  assert.equal(await phoneLink.getAttribute('href'), 'tel:09123456789', 'tel: destination safely normalized to ASCII digits');
  assert.equal((await phoneLink.innerText()).trim(), '۰۹۱۲ ۳۴۵ ۶۷۸۹', 'Phone displays as configured');
  assert((await phoneLink.getAttribute('aria-label') || '').includes('تلفن'), 'Phone link carries an understandable label');
  assert.equal(await page.locator('main .cpms-contact-details .cpms-contact-address').count(), 1, 'Address row appears when configured');
  assert((await page.locator('main .cpms-contact-details .cpms-contact-address').innerText()).includes('تهران'), 'Address displays as configured');
  assert.equal(await page.locator('main .cpms-contact-details li').count(), 3, 'Three configured rows, no extra placeholders');
  diagnostic.settingsProofs.push('phone/address render only when configured with safe tel: normalization');

  // ---- Test 11: clearing optional fields removes rows entirely.
  wp('option', 'update', 'koorosh_settings', JSON.stringify({ contact_phone: '', contact_address: '' }), '--format=json', '--user=admin');
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('main .cpms-contact-details .cpms-contact-phone').count(), 0, 'Phone row disappears when cleared');
  assert.equal(await page.locator('main .cpms-contact-details .cpms-contact-address').count(), 0, 'Address row disappears when cleared');
  assert.equal(await page.locator('main .cpms-contact-details li').count(), 1, 'No empty rows remain');
  diagnostic.settingsProofs.push('cleared optional fields leave no empty rows');

  // ---- Test 13: unsafe tampered settings never render (read path re-sanitizes).
  wp('eval', `
global $wpdb;
$poison = array(
  'version' => 1,
  'contact_email' => '<script>bad</script>evil',
  'contact_phone' => '123<script>',
  'contact_address' => '<img src=x onerror=1>',
);
$wpdb->update( $wpdb->options, array( 'option_value' => maybe_serialize( $poison ) ), array( 'option_name' => 'koorosh_settings' ) );
wp_cache_delete( 'koorosh_settings', 'options' );
echo 'tampered';
`);
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  const tamperedHtml = await page.content();
  assert(!/<script>bad<\/script>evil|123<script>|onerror=1/.test(tamperedHtml), 'Tampered unsafe values never render');
  assert.equal((await page.locator('main .cpms-contact-details .cpms-contact-email a').innerText()).trim(), DEFAULT_EMAIL, 'Tampered email falls back to the authorized public default');
  assert.equal(await page.locator('main .cpms-contact-details .cpms-contact-phone').count(), 0, 'Tampered phone renders no row');
  assert.equal(await page.locator('main .cpms-contact-details .cpms-contact-address').count(), 0, 'Tampered address renders no row');
  diagnostic.settingsProofs.push('tampered unsafe settings fall back safely');

  // ---- Test 3/4: destinations resolve by clicking.
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  await page.locator('main').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true }).first().click();
  await page.waitForURL(/\/demo\/?$/);
  assert.equal(await page.locator('h1').count(), 1, 'Demo serves one H1');
  assert.equal(normalize(await page.locator('h1').innerText()), authoredH1(demoPage), 'Demo CTA reaches the real Demo page');
  assert.equal(await page.locator('form').count(), 1, 'Demo keeps its form (Contact adds none)');

  // ---- Test 6: the Demo page keeps its alternative /contact/ route.
  assert.equal(await page.locator('main a[href="/contact/"]').count(), 1, 'Demo page links to /contact/ exactly once (alternative to the form path)');
  assert((await page.locator('main').innerText()).includes('اگر مسیر فرم برای شما مناسب نیست'), 'Demo alternative-contact wording present');
  await page.locator('main a[href="/contact/"]').first().click();
  await page.waitForURL(/\/contact\/?$/);
  assert.equal(normalize(await page.locator('h1').innerText()), 'تماس با ما', 'Demo alternative route reaches Contact');

  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  await page.locator('main a[href="/privacy/"]').first().click();
  await page.waitForURL(/\/privacy\/?$/);
  assert.equal(await page.locator('h1').count(), 1, 'Privacy serves one H1');
  assert.equal(normalize(await page.locator('h1').innerText()), authoredH1(privacyPage), 'Privacy link reaches the real Privacy page');

  // ---- Test 5: footer route definition (rendered footer proof runs in the
  // site-shell runner, which builds the WordPress menus after this page).
  const footerContact = footerMenu.items.find(i => i.slug === 'contact');
  assert.equal(footerContact?.title, 'تماس با ما', 'Canonical footer menu gains تماس با ما → /contact/');

  // ---- Test 17: all previous pages still reconstruct and serve.
  const sweep = [];
  for (const [slug, path, authored] of precedingPages) {
    const earlier = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    assert.equal(earlier.status(), 200, `${slug} still serves`);
    assert.equal(await page.locator('h1').count(), 1, `${slug} still serves one H1`);
    assert.equal(normalize(await page.locator('h1').innerText()), authoredH1(authored), `${slug} still serves its own H1`);
    sweep.push({ slug, path, status: earlier.status() });
  }
  diagnostic.earlierPages = sweep;

  assert.deepEqual(diagnostic.frontendErrors, [], 'Frontend console errors');
  assert.deepEqual(diagnostic.failedRequests, [], 'Failed requests');
  assert.deepEqual(diagnostic.badResponses, [], 'HTTP errors');
  assert.deepEqual(diagnostic.externalRequests, [], 'No remote assets');
  await visitor.close();

  // Leave the environment clean for the later runners.
  wp('eval', 'delete_option( \'koorosh_settings\' ); echo "cleaned";');

  diagnostic.result = 'PASS';
  console.log(`::notice title=Contact page proof::PASS: persisted native page ${id}; ${all.length} elements; settings-driven email (default ${DEFAULT_EMAIL}, live update, lead-recipient isolation, tel normalization, empty-row absence, tamper fallback); /demo/ + /privacy/ + demo /contact/ routes clicked; 12 earlier pages verified; no mail sent`);
} catch (error) {
  diagnostic.result = 'FAIL';
  diagnostic.error = error.stack;
  if (frontend && !frontend.isClosed()) await frontend.screenshot({ path: resolve(out, 'failure-frontend.png'), fullPage: true }).catch(() => {});
  if (editor && !editor.isClosed()) await editor.screenshot({ path: resolve(out, 'failure-editor.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  writeFileSync(resolve(out, 'results.json'), JSON.stringify(diagnostic, null, 2));
  await browser.close();
}
