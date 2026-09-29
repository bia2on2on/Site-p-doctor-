/**
 * Browser verification of the CPMS Security & Data Access trust page.
 * «امنیت و دسترسی به داده»
 * Ephemeral wp-env only. No DB JSON writes, private APIs, or host operations.
 * Run in CI after the FAQ runner and before site-shell: it proves the page
 * reconstructs as native, persisted, Elementor-editable content, that the
 * trust-boundary wording survives rendering, that outbound destinations resolve,
 * and that earlier sales pages still serve.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { securityDataAccess, pageIdentity } from '../../reconstruction/security-data-access/recipe.mjs';
import { homepage } from '../../reconstruction/homepage/recipe.mjs';
import { productOverview } from '../../reconstruction/product-overview/recipe.mjs';
import { demoPage } from '../../reconstruction/demo/recipe.mjs';
import { appointmentReceptionQueue } from '../../reconstruction/appointment-reception-queue/recipe.mjs';
import { patientRecordContinuity } from '../../reconstruction/patient-record-continuity/recipe.mjs';
import { doctorWorkspace } from '../../reconstruction/doctor-workspace/recipe.mjs';
import { patientPortal } from '../../reconstruction/patient-portal/recipe.mjs';
import { prescriptionsDocuments } from '../../reconstruction/prescriptions-documents/recipe.mjs';
import { faqPage } from '../../reconstruction/faq/recipe.mjs';
import {
  assertNoHardForbidden,
  assertBoundaryTermsNegated,
  assertPersianTypography,
  assertQualificationPresent,
  stripTags,
} from '../static/boundary-security-data-access.mjs';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(import.meta.dirname, 'artifacts/security-data-access');
mkdirSync(out, { recursive: true });
process.on('uncaughtException', error => {
  const message = String(error.stack || error).replace(/user_pass=\S+/g, 'user_pass=[redacted]');
  writeFileSync(resolve(out, 'bootstrap-error.txt'), message);
  console.error(`::error title=Security Data Access reconstruction::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
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
const recipe = securityDataAccess(tokens);
const flatten = nodes => nodes.flatMap(n => [n, ...flatten(n.children)]);
const all = flatten(recipe);
const normalize = value => String(value).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const authoredH1 = authored => normalize(flatten(authored(tokens)).find(n => n.kind === 'heading' && n.settings.header_size === 'h1').settings.title);

assert.equal(wp('option', 'get', 'home'), base, 'Only disposable default wp-env URL supported');
assert.equal(wp('theme', 'list', '--status=active', '--field=name'), 'koorosh');
wp('plugin', 'is-active', 'elementor');
assert.equal(wp('post', 'list', '--post_type=page', `--name=${pageIdentity.slug}`, '--format=count'), '0', 'Refuse to overwrite existing page; use clean env');

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
      for (const child of n.children) await create(child, container);
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
  assert.equal(state.indexable, '0');
  assert.equal(state.permalinks, '/%postname%/');
  diagnostic.runtime = state;

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
    assert.equal(response.status(), 200, `${name}: Security page serves`);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.equal(await page.locator('html').getAttribute('lang'), 'fa-IR');
    assert.equal(await page.locator('main').count(), 1);
    assert.equal(await page.locator('h1').count(), 1, 'Exactly one H1');
    assert.match(await page.title(), /CPMS/);
    assert.match(normalize(await page.locator('h1').innerText()), /دسترسی متناسب با نقش/);
    assert.equal(await page.locator('meta[name="description"]').count(), 1);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
    assert.equal(await page.locator('form').count(), 0, 'No form without authorized endpoint');

    // No badges, no images, no schema
    assert.equal(await page.locator('main img, main canvas, main video').count(), 0, 'No fabricated media');
    const html = await page.content();
    assert(!/FAQPage|\"@type\"|schema\.org|ld\+json|itemscope|itemtype/i.test(html), 'No structured data');
    assert(!/badge|shield|padlock/i.test(html), 'No fake badge markup');

    // Honesty and qualification wording
    assert(await page.getByText('سازوکارهایی برای نقش‌ها', { exact: false }).count() >= 1, 'Mechanism wording visible');
    assert(await page.getByText('پیش از انتشار عمومی بازتأیید می‌شود', { exact: false }).count() >= 1, 'Qualification wording visible');
    assert(await page.getByText('امنیت صددرصدی', { exact: false }).count() >= 1, 'Clarification about no absolute security visible');
    assert(await page.getByText('گواهی امنیتی', { exact: false }).count() >= 1, 'No-certificate clarification visible');

    const cta = page.locator('main').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true }).first();
    assert.equal(await cta.getAttribute('href'), '/demo/', 'Primary CTA routes to Demo');
    const ctaBox = await cta.boundingBox();
    assert(ctaBox.y + ctaBox.height < height + 200, `${name}: hero CTA near first viewport`);
    assert(ctaBox.height >= 44, 'CTA touch size');

    const measures = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      font: getComputedStyle(document.querySelector('h1')).fontFamily,
      fontLoaded: document.fonts.check('700 30px Vazirmatn'),
      headings: [...document.querySelectorAll('main h1, main h2, main h3')].map(n => ({ tag: n.tagName, text: n.textContent })),
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
      offsiteLinks: [...document.querySelectorAll('main a')].filter(a => a.origin !== location.origin).map(a => a.href),
      crossPageLinks: [...document.querySelectorAll('main a')].filter(a => a.origin === location.origin && a.pathname !== location.pathname && !a.hash).map(a => a.pathname),
      renderedStrings: [...document.querySelectorAll('main h1, main h2, main h3, main p')].map(n => n.textContent.trim()).filter(Boolean),
      readingWidth: (() => {
        const p = document.querySelector('main .cpms-reading p');
        return p ? p.getBoundingClientRect().width : 0;
      })(),
    }));
    assert(measures.scrollWidth <= measures.width, `${name}: no horizontal overflow`);
    assert(measures.font.includes('Vazirmatn') && measures.fontLoaded, 'Local Persian font loaded');
    assert.deepEqual(measures.brokenAnchors, []);
    assert.deepEqual(measures.offsiteLinks, [], 'No external links');
    const crossRoutes = new Set(measures.crossPageLinks);
    const allowedRoutes = new Set(['/demo/', '/product-overview/', '/faq/']);
    for (const route of crossRoutes) assert(allowedRoutes.has(route), `Unexpected cross-page link: ${route}`);
    for (const route of ['/demo/', '/product-overview/', '/faq/']) assert(crossRoutes.has(route) || measures.crossPageLinks.includes(route) || (await page.locator(`main a[href="${route}"]`).count()) >= 1, `Expected route present: ${route}`);

    const levels = measures.headings.map(h => Number(h.tag.slice(1)));
    assert.equal(levels[0], 1, 'H1 precedes');
    assert(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1), 'No skipped heading levels');

    // Reading measure
    if (width < 768) {
      assert(measures.readingWidth >= 300, `${name}: mobile reading width not narrow`);
    } else {
      assert(measures.readingWidth <= 760 && measures.readingWidth >= 500, `${name}: desktop reading measure capped`);
    }

    diagnostic.views.push({ name, width, height, ...measures, renderedStrings: undefined });

    // Boundary guardrails on rendered text
    assertNoHardForbidden(measures.renderedStrings, `Security rendered copy (${name})`);
    assertBoundaryTermsNegated(measures.renderedStrings, `Security rendered copy (${name})`);
    assertPersianTypography(measures.renderedStrings, `Security rendered copy (${name})`);
    assertQualificationPresent(measures.renderedStrings, `Security rendered copy (${name})`);

    console.log(`::notice title=Security composition ${name}::PASS: H1 ok, measure ${Math.round(measures.readingWidth)}px, no overflow, no badges/media/schema, qualification present`);
    await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
    await page.screenshot({ path: resolve(out, `${name}-viewport.png`) });

    let ctaFocused = false;
    for (let tab = 0; tab < 16 && !ctaFocused; tab++) {
      await page.keyboard.press('Tab');
      ctaFocused = await cta.evaluate(a => a === document.activeElement);
    }
    assert(ctaFocused, 'CTA reachable by keyboard');
    assert(await cta.evaluate(a => getComputedStyle(a).outlineStyle !== 'none'), 'Visible focus');
  }

  // CTA destination
  await page.locator('main').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true }).first().click();
  await page.waitForURL(/\/demo\/?$/);
  assert.match(await page.locator('h1').innerText(), /بررسی تناسب CPMS/, 'CTA reaches Demo');
  assert.equal(await page.locator('form').count(), 1, 'Demo keeps its form');

  async function followFromSecurity(linkName, destination, authored) {
    await page.goto(pageUrl, { waitUntil: 'networkidle' });
    await page.locator('main').getByRole('link', { name: linkName, exact: true }).first().click();
    await page.waitForURL(new RegExp(`${destination}/?$`));
    assert.equal(await page.locator('h1').count(), 1, `${destination} serves one H1`);
    assert.equal(normalize(await page.locator('h1').innerText()), authoredH1(authored), `${linkName}: reaches real ${destination}`);
  }
  await followFromSecurity('مرور معرفی محصول', '/product-overview', productOverview);
  await followFromSecurity('مرور پرسش‌های متداول', '/faq', faqPage);

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
  diagnostic.result = 'PASS';
  console.log(`::notice title=Security page proof::PASS: persisted native page ${id}; ${all.length} elements; HTTP/RTL/H1/metadata/font/focus/measure/overflow/no-schema/claim-boundary/network at 4 viewports; outbound routes clicked; 9 earlier pages verified`);
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
