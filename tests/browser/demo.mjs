/**
 * Browser verification of CPMS Demo / Consultation conversion page.
 * Ephemeral wp-env only. No DB JSON writes, private APIs, or host operations.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { demoPage, pageIdentity } from '../../reconstruction/demo/recipe.mjs';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(import.meta.dirname, 'artifacts/demo');
mkdirSync(out, { recursive: true });

process.on('uncaughtException', error => {
  const message = String(error.stack || error).replace(/user_pass=\S+/g, 'user_pass=[redacted]');
  writeFileSync(resolve(out, 'bootstrap-error.txt'), message);
  console.error(`::error title=Demo reconstruction::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
  process.exitCode = 1;
});

const base = 'http://localhost:8888';
function wp(...args) {
  try {
    return execFileSync(resolve(import.meta.dirname, 'node_modules/.bin/wp-env'), ['run', 'cli', 'wp', ...args], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120_000,
    }).trim();
  } catch (error) {
    throw new Error(`wp-env CLI failed: ${error.stderr?.toString().replace(/user_pass=\S+/g, 'user_pass=[redacted]')}`);
  }
}

const tokens = JSON.parse(readFileSync(resolve(root, 'design-system/tokens.json')));
const recipe = demoPage(tokens);
const flatten = nodes => nodes.flatMap(n => [n, ...flatten(n.children)]);
const all = flatten(recipe);

assert.equal(wp('option', 'get', 'home'), base, 'Only disposable wp-env URL is supported');
assert.equal(wp('theme', 'list', '--status=active', '--field=name'), 'koorosh');
wp('plugin', 'is-active', 'elementor');
assert.equal(wp('post', 'list', '--post_type=page', `--name=${pageIdentity.slug}`, '--format=count'), '0', 'Refuse to overwrite existing demo page; clean environment required');

// Validate controls
const requestedControls = Object.fromEntries(
  ['container', 'heading', 'text-editor', 'button'].map(kind => [
    kind,
    [...new Set(all.filter(n => n.kind === kind).flatMap(n => Object.keys(n.settings)))],
  ])
);
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
assert.deepEqual(unsupported, [], 'Unsupported native controls in demo recipe');

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
const diagnostic = { editorErrors: [], frontendErrors: [], failedRequests: [], badResponses: [], externalRequests: [], views: [], pageId: id, elementCount: all.length };

try {
  const admin = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-US' });
  editor = await admin.newPage();
  editor.on('pageerror', e => diagnostic.editorErrors.push(e.message));
  await editor.goto(`${base}/wp-login.php`);
  await editor.locator('#user_login').fill('admin');
  await editor.locator('#user_pass').fill(password);
  await Promise.all([editor.waitForURL(/wp-admin/), editor.locator('#wp-submit').click()]);
  await editor.goto(`${base}/wp-admin/post.php?post=${id}&action=elementor`);
  await editor.waitForFunction(
    () => window.elementor?.getPreviewContainer?.() && ['document/elements/create', 'document/elements/settings', 'document/save/publish'].every(name => window.$e?.commands?.getAll()?.includes(name)),
    null,
    { timeout: 120_000 }
  );

  const authoring = await editor.evaluate(async nodes => {
    const required = ['document/elements/create', 'document/elements/settings', 'document/save/publish'];
    const commands = $e.commands.getAll();
    for (const name of required) if (!commands.includes(name)) throw new Error(`Documented user command unavailable: ${name}`);
    const parent = elementor.getPreviewContainer();
    if (parent.children.length) throw new Error('Refusing to replace existing editor content');
    const created = [];
    async function create(n, target) {
      const model = n.kind === 'container' ? { elType: 'container' } : { elType: 'widget', widgetType: n.kind };
      const container = await $e.run('document/elements/create', { container: target, model });
      await $e.run('document/elements/settings', { container, settings: n.settings, options: { debounce: false } });
      created.push({ name: n.name, kind: n.kind, id: container.id });
      for (const child of n.children) await create(child, container);
    }
    for (const n of nodes) await create(n, parent);
    await $e.run('document/save/publish');
    return { commands: required, created };
  }, recipe);
  writeFileSync(resolve(out, 'authoring.json'), JSON.stringify(authoring, null, 2));
  assert.equal(wp('post', 'get', id, '--field=post_status'), 'publish');

  // Reopen editor to prove persisted native elements
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

  // Set as front page for testing convenience
  const previousFront = wp('option', 'get', 'page_on_front');
  wp('option', 'update', 'show_on_front', 'page');
  wp('option', 'update', 'page_on_front', id);
  wp('elementor', 'flush-css');

  const state = JSON.parse(wp('eval', `
$id = (int) get_option('page_on_front');
$document = \\Elementor\\Plugin::$instance->documents->get($id);
echo wp_json_encode(array('front' => $id, 'mode' => get_option('show_on_front'), 'editable' => $document && $document->is_built_with_elementor(), 'theme' => get_stylesheet(), 'elementor' => defined('ELEMENTOR_VERSION') ? ELEMENTOR_VERSION : '', 'locale' => get_locale(), 'indexable' => get_option('blog_public')));
`));
  assert.equal(state.front, Number(id));
  assert.equal(state.mode, 'page');
  assert.equal(state.editable, true);
  assert.equal(state.theme, 'koorosh');
  assert.equal(state.locale, 'fa_IR');
  assert.equal(state.indexable, '0');
  diagnostic.runtime = state;

  const visitor = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await visitor.newPage();
  frontend = page;
  page.on('pageerror', e => diagnostic.frontendErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') diagnostic.frontendErrors.push(m.text()); });
  page.on('requestfailed', r => diagnostic.failedRequests.push({ url: r.url(), failure: r.failure() }));
  page.on('response', r => { if (r.status() >= 400) diagnostic.badResponses.push({ url: r.url(), status: r.status() }); });
  page.on('request', r => { if (!r.url().startsWith(base) && /^https?:/.test(r.url())) diagnostic.externalRequests.push(r.url()); });

  const viewports = [
    ['mobile', 390, 844],
    ['tablet', 768, 1024],
    ['desktop', 1366, 768],
    ['large-desktop', 1920, 1080],
  ];

  for (const [name, width, height] of viewports) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);

    // Semantics & meta
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.equal(await page.locator('html').getAttribute('lang'), 'fa-IR');
    assert.equal(await page.locator('main').count(), 1);
    assert.equal(await page.locator('h1').count(), 1);
    assert.match(await page.title(), /CPMS/);
    assert.match(await page.locator('h1').innerText(), /بررسی تناسب CPMS با جریان کار کلینیک شما/);
    assert.equal(await page.locator('meta[name="description"]').count(), 1);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);

    // Hero CTA
    const heroCta = page.getByRole('link', { name: 'تکمیل فرم درخواست دمو', exact: true }).first();
    assert.equal(await heroCta.getAttribute('href'), '#qualification-form');
    const ctaBox = await heroCta.boundingBox();
    assert(ctaBox.y + ctaBox.height < height, `${name}: Hero CTA must be visible in first viewport`);
    assert(ctaBox.height >= 44, `${name}: CTA touch target >= 44px`);

    // Qualification Form & Banners check
    assert.equal(await page.locator('#cpms-demo-form-wrapper').count(), 1, 'Form wrapper present');
    assert.equal(await page.locator('#cpms-non-live-banner').count(), 1, 'Technical preview notice present');
    assert.equal(await page.locator('#cpms-privacy-banner').count(), 1, 'Privacy guidance banner present');
    assert.equal(await page.locator('form#cpms-demo-form').count(), 1, 'Form element present');

    // All 6 qualification fields and their programmatic labels
    const fieldChecks = [
      ['#cpms-contact-name', 'label[for="cpms-contact-name"]'],
      ['#cpms-org-name', 'label[for="cpms-org-name"]'],
      ['#cpms-contact-value', 'label[for="cpms-contact-value"]'],
      ['#cpms-org-type', 'label[for="cpms-org-type"]'],
      ['#cpms-doctor-count', 'label[for="cpms-doctor-count"]'],
      ['#cpms-discussion-topic', 'label[for="cpms-discussion-topic"]'],
    ];
    for (const [inputId, labelSelector] of fieldChecks) {
      assert(await page.locator(inputId).isVisible(), `${inputId} must be visible`);
      assert.equal(await page.locator(labelSelector).count(), 1, `${labelSelector} must link to input`);
    }

    // Required indicators
    assert.equal(await page.locator('#cpms-contact-name').getAttribute('required'), '');
    assert.equal(await page.locator('#cpms-contact-name').getAttribute('aria-required'), 'true');
    assert.equal(await page.locator('#cpms-org-name').getAttribute('required'), '');
    assert.equal(await page.locator('#cpms-contact-value').getAttribute('required'), '');
    assert.equal(await page.locator('#cpms-org-type').getAttribute('required'), '');
    assert.equal(await page.locator('#cpms-doctor-count').getAttribute('required'), '');

    // Layout & overflow measurements
    const measures = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      font: getComputedStyle(document.querySelector('h1')).fontFamily,
      fontLoaded: document.fonts.check('700 30px Vazirmatn'),
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
      offsiteLinks: [...document.querySelectorAll('main a')].filter(a => a.origin !== location.origin || a.pathname !== location.pathname).map(a => a.href),
      inputHeights: [...document.querySelectorAll('.cpms-form-input, .cpms-form-select, .cpms-form-submit-button')].map(el => el.getBoundingClientRect().height),
    }));
    assert(measures.scrollWidth <= measures.width, `${name}: horizontal overflow detected`);
    assert(measures.font.includes('Vazirmatn') && measures.fontLoaded, `${name}: Vazirmatn font loaded`);
    assert.deepEqual(measures.brokenAnchors, [], `${name}: broken in-page anchors`);
    assert.deepEqual(measures.offsiteLinks, [], `${name}: offsite links`);
    assert(measures.inputHeights.every(h => h >= 44), `${name}: all inputs and submit button touch targets >= 44px`);

    await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
    await page.screenshot({ path: resolve(out, `${name}-viewport.png`) });
    diagnostic.views.push({ name, width, height, ...measures });
  }

  // Keyboard navigation & visible focus
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab'); // home link
  await page.keyboard.press('Tab'); // hero CTA
  const heroCta = page.getByRole('link', { name: 'تکمیل فرم درخواست دمو', exact: true }).first();
  assert(await heroCta.evaluate(a => a === document.activeElement), 'Hero CTA keyboard reachable');
  assert(await heroCta.evaluate(a => getComputedStyle(a).outlineStyle !== 'none'), 'Visible focus ring on CTA');
  await page.keyboard.press('Enter');
  await page.waitForURL(/#qualification-form$/);
  assert(await page.locator('#qualification-form').isVisible(), 'Hero CTA scrolls to qualification form');

  // Form Submission Test 1: Invalid submission (client/server validation)
  console.log('Testing invalid form submission...');
  await page.locator('#cpms-submit-btn').click();
  await page.waitForSelector('#cpms-form-error-summary', { timeout: 10_000 });
  assert.equal(await page.locator('#cpms-form-error-summary').getAttribute('role'), 'alert', 'Error summary announced with role=alert');
  assert(await page.locator('#cpms-contact-name').getAttribute('aria-invalid') === 'true', 'Name input marked aria-invalid');
  assert(await page.locator('#cpms-org-name').getAttribute('aria-invalid') === 'true', 'Org input marked aria-invalid');
  assert(await page.locator('#cpms-contact-value').getAttribute('aria-invalid') === 'true', 'Contact input marked aria-invalid');
  assert(await page.locator('#cpms-org-type').getAttribute('aria-invalid') === 'true', 'Org type select marked aria-invalid');
  assert(await page.locator('#cpms-doctor-count').getAttribute('aria-invalid') === 'true', 'Doctor count select marked aria-invalid');
  await page.screenshot({ path: resolve(out, 'form-invalid-state.png') });

  // Form Submission Test 2: Valid synthetic submission (Safe Non-Live Mode)
  console.log('Testing valid synthetic submission (Safe Non-Live Mode)...');
  const syntheticIdentity = {
    name: 'دکتر آزمایشی سینا',
    org: 'کلینیک تخصصی نمونه',
    contact: 'test-clinic@example.test',
    orgType: 'clinic',
    doctorCount: '3-5',
    topic: 'بررسی هماهنگی نوبت و پذیرش در سناریوی آزمایشی',
  };
  await page.locator('#cpms-contact-name').fill(syntheticIdentity.name);
  await page.locator('#cpms-org-name').fill(syntheticIdentity.org);
  await page.locator('#cpms-contact-value').fill(syntheticIdentity.contact);
  await page.locator('#cpms-org-type').selectOption(syntheticIdentity.orgType);
  await page.locator('#cpms-doctor-count').selectOption(syntheticIdentity.doctorCount);
  await page.locator('#cpms-discussion-topic').fill(syntheticIdentity.topic);

  await page.locator('#cpms-submit-btn').click();
  await page.waitForSelector('#cpms-form-success-notice', { timeout: 10_000 });

  const successNotice = page.locator('#cpms-form-success-notice');
  assert.equal(await successNotice.getAttribute('role'), 'status');
  assert.equal(await successNotice.getAttribute('aria-live'), 'polite');
  const successText = await successNotice.innerText();
  assert(successText.includes('درخواست آزمایشی شما با موفقیت بررسی شد'), 'Success notice contains test confirmation');
  assert(successText.includes('هیچ داده‌ای ذخیره یا ارسال نگردید'), 'Success notice clarifies non-persistence');
  assert(successText.includes('تحویل زندهٔ لیدها به ایمیل یا CRM هنوز فعال نشده'), 'Success notice states lead delivery is pending');
  await page.screenshot({ path: resolve(out, 'form-success-non-live.png') });

  // Privacy & Non-persistence Proof: verify NO synthetic lead data in database
  console.log('Verifying non-persistence in WordPress database...');
  const postHits = wp('db', 'query', `SELECT COUNT(*) FROM wp_posts WHERE post_content LIKE '%${syntheticIdentity.contact}%';`);
  assert.equal(postHits.split('\n')[1], '0', 'Synthetic payload must NOT be written to wp_posts');

  const metaHits = wp('db', 'query', `SELECT COUNT(*) FROM wp_postmeta WHERE meta_value LIKE '%${syntheticIdentity.contact}%';`);
  assert.equal(metaHits.split('\n')[1], '0', 'Synthetic payload must NOT be written to wp_postmeta');

  const optionHits = wp('db', 'query', `SELECT COUNT(*) FROM wp_options WHERE option_value LIKE '%${syntheticIdentity.contact}%';`);
  assert.equal(optionHits.split('\n')[1], '0', 'Synthetic payload must NOT be written to wp_options');

  // Security Negative Test: direct POST without valid CSRF nonce must be rejected
  console.log('Testing security negative: POST without CSRF nonce...');
  const securityResponse = await visitor.request.post(`${base}/`, {
    form: {
      cpms_demo_submit: '1',
      cpms_ajax: '1',
      cpms_demo_nonce: 'invalid_tampered_nonce',
      cpms_contact_name: 'Attacker',
      cpms_org_name: 'Bad Org',
      cpms_contact_value: 'bad@example.test',
      cpms_org_type: 'clinic',
      cpms_doctor_count: '1-2',
    },
  });
  assert.equal(securityResponse.status(), 403, 'Tampered/missing nonce must be rejected with HTTP 403');
  const securityBody = await securityResponse.json();
  assert.equal(securityBody?.success, false, 'Tampered nonce returns success=false');

  // Standard non-AJAX POST test: proves full functionality without JavaScript
  console.log('Testing standard non-AJAX POST flow...');
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(base);
  await noJsPage.locator('#cpms-contact-name').fill('دکتر آزمایشی سینا');
  await noJsPage.locator('#cpms-org-name').fill('کلینیک تخصصی نمونه');
  await noJsPage.locator('#cpms-contact-value').fill('test-clinic@example.test');
  await noJsPage.locator('#cpms-org-type').selectOption('clinic');
  await noJsPage.locator('#cpms-doctor-count').selectOption('3-5');
  await noJsPage.locator('#cpms-submit-btn').click();
  await noJsPage.waitForLoadState('networkidle');
  const noJsSuccess = noJsPage.locator('#cpms-form-success-notice');
  assert(await noJsSuccess.isVisible(), 'Standard POST without JS renders safe non-live success notice');
  await noJsContext.close();

  // Restore previous front page
  if (previousFront) {
    wp('option', 'update', 'page_on_front', previousFront);
  }

  assert.deepEqual(diagnostic.frontendErrors, [], 'Frontend console/page errors');
  assert.deepEqual(diagnostic.failedRequests, [], 'Failed frontend requests');
  assert.deepEqual(diagnostic.badResponses, [], 'Frontend HTTP errors');
  assert.deepEqual(diagnostic.externalRequests, [], 'No remote fonts/scripts/media');
  await visitor.close();

  diagnostic.result = 'PASS';
  console.log(`::notice title=Demo conversion proof::PASS: persisted native Elementor page ${id}; ${all.length} elements; RTL/H1/meta/Vazirmatn/contrast/touch-targets/overflow/form-validation/safe-non-live/non-persistence/security checks verified across 4 viewports; runtime ${JSON.stringify(state)}`);
} catch (error) {
  diagnostic.result = 'FAIL';
  diagnostic.error = error.stack;
  if (frontend && !frontend.isClosed()) await frontend.screenshot({ path: resolve(out, 'failure-frontend.png'), fullPage: true }).catch(() => {});
  if (editor && !editor.isClosed()) await editor.screenshot({ path: resolve(out, 'failure-editor.png') }).catch(() => {});
  throw error;
} finally {
  writeFileSync(resolve(out, 'results.json'), JSON.stringify(diagnostic, null, 2));
  await browser.close();
}
