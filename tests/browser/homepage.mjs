/** Ephemeral wp-env only. No DB JSON writes, private APIs, or host operations. */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { homepage, pageIdentity } from '../../reconstruction/homepage/recipe.mjs';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(import.meta.dirname, 'artifacts');
mkdirSync(out, { recursive: true });
// Make pre-browser fixture failures retrievable even when CI log-blob egress is unavailable.
process.on('uncaughtException', error => {
  const message = String(error.stack || error).replace(/user_pass=\S+/g, 'user_pass=[redacted]');
  writeFileSync(resolve(out, 'bootstrap-error.txt'), message);
  console.error(`::error title=Homepage reconstruction::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
  process.exitCode = 1;
});
const base = 'http://localhost:8888'; // Browser runs on the CI runner, not in a user's browser.
function wp(...args) {
  try {
    return execFileSync(resolve(import.meta.dirname, 'node_modules/.bin/wp-env'), ['run', 'cli', 'wp', ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120_000 }).trim();
  } catch (error) {
    // Do not print command arguments (an ephemeral password can be among them).
    throw new Error(`wp-env CLI failed: ${error.stderr?.toString().replace(/user_pass=\S+/g, 'user_pass=[redacted]')}`);
  }
}
const tokens = JSON.parse(readFileSync(resolve(root, 'design-system/tokens.json')));
const recipe = homepage(tokens);
const flatten = nodes => nodes.flatMap(n => [n, ...flatten(n.children)]);
const all = flatten(recipe);

assert.equal(wp('option', 'get', 'home'), base, 'Only the disposable default wp-env URL is supported');
assert.equal(wp('theme', 'list', '--status=active', '--field=name'), 'koorosh');
wp('plugin', 'is-active', 'elementor');
assert.equal(wp('post', 'list', '--post_type=page', `--name=${pageIdentity.slug}`, '--format=count'), '0', 'Refuse to overwrite an existing homepage; use a clean environment');

// Validate settings against the installed native controls before any page is created.
// get_controls() is the public Controls_Stack API, not private storage inspection.
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
    // Query individual public controls: get_controls(null) omits lazy style controls in CLI context.
    $control = $element ? $element->get_controls($key) : null;
    if ($control === null && $element && preg_match('/_(mobile|tablet)$/', $key, $match)) {
      $base = substr($key, 0, -strlen($match[0]));
      $parent = $element->get_controls($base);
      // Official responsive suffixes; newer Elementor generates these controls in the editor.
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
assert.deepEqual(unsupported, [], 'Unsupported native controls (including active responsive variants)');


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
    // Public USER command from getAll(): Elementor performs its own serialization/save.
    await $e.run('document/save/publish');
    return { commands: required, created };
  }, recipe);
  writeFileSync(resolve(out, 'authoring.json'), JSON.stringify(authoring, null, 2));
  assert.equal(wp('post', 'get', id, '--field=post_status'), 'publish');
  wp('option', 'update', 'show_on_front', 'page');
  wp('option', 'update', 'page_on_front', id);
  wp('elementor', 'flush-css');

  // Reopen to prove persisted native editable elements, not only transient editor state.
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
  for (const [name, width, height] of [['mobile', 390, 844], ['tablet', 768, 1024], ['desktop', 1366, 768], ['large-desktop', 1920, 1080]]) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.equal(await page.locator('html').getAttribute('lang'), 'fa-IR');
    assert.equal(await page.locator('main').count(), 1);
    assert.equal(await page.locator('h1').count(), 1);
    assert.match(await page.title(), /CPMS/);
    assert.equal(await page.locator('meta[name="description"]').count(), 1);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
    const cta = page.locator('main').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true });
    assert.equal(await cta.getAttribute('href'), '/demo/', 'Homepage primary demo CTA routes to the real Demo page');
    const ctaBox = await cta.boundingBox();
    assert(ctaBox.y + ctaBox.height < height, `${name}: hero CTA must be in first viewport`);
    assert(ctaBox.height >= 44, 'CTA touch size');
    assert.equal(await page.locator('form').count(), 0, 'No form without an authorized endpoint');
    assert.equal(await page.locator('#product-media img, #product-media svg, #product-media canvas').count(), 0, 'No fabricated product media');
    const measures = await page.evaluate(() => ({
      width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
      font: getComputedStyle(document.querySelector('h1')).fontFamily,
      fontLoaded: document.fonts.check('700 30px Vazirmatn'),
      headings: [...document.querySelectorAll('main h1, main h2, main h3')].map(n => ({ tag: n.tagName, text: n.textContent })),
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
      externalLinks: [...document.querySelectorAll('main a')].filter(a => a.origin !== location.origin).map(a => a.href),
      crossPageLinks: [...document.querySelectorAll('main a')].filter(a => a.origin === location.origin && a.pathname !== location.pathname).map(a => a.pathname),
    }));
    assert(measures.scrollWidth <= measures.width, `${name}: horizontal overflow`);
    assert(measures.font.includes('Vazirmatn') && measures.fontLoaded, 'Local Persian font loaded');
    assert.deepEqual(measures.brokenAnchors, []);
    assert.deepEqual(measures.externalLinks, []);
    assert(measures.crossPageLinks.length > 0 && measures.crossPageLinks.every(p => p === '/demo/'), 'Only cross-page route from Homepage content is /demo/');
    const composition = await page.evaluate(() => {
      const rect = selector => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      return {
        hero: rect('#hero-copy'), media: rect('#product-media'), surface: rect('#media-reserved-surface'),
        stages: ['appointment', 'reception', 'visit'].map(id => {
          const selector = `#stage-${id}`;
          const style = getComputedStyle(document.querySelector(selector));
          return { ...rect(selector), topBorder: parseFloat(style.borderTopWidth), startBorder: parseFloat(style.borderRightWidth) };
        }),
        reading: [...document.querySelectorAll('.cpms-reading p')].map(p => {
          const style = getComputedStyle(p);
          return { font: parseFloat(style.fontSize), line: parseFloat(style.lineHeight), width: p.getBoundingClientRect().width };
        }),
      };
    });
    assert(composition.reading.length > 0, 'Reading-copy measurements must not be vacuous');
    const levels = measures.headings.map(h => Number(h.tag.slice(1)));
    assert.equal(levels[0], 1, 'H1 precedes subsection headings');
    assert(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1), 'No skipped heading levels');
    assert(await page.locator('#media-reserved-disclosure').isVisible(), 'Reserved-media disclosure remains visible');
    assert(composition.surface.height >= (width < 768 ? 256 : 320), 'Intentional media reservation, not a collapsed empty state');
    if (width < 768) {
      assert(composition.hero.width >= width - 40, 'Comfortable mobile hero content width');
      for (const p of composition.reading) {
        assert(p.font >= 18 && p.line / p.font >= 1.85, 'Mobile reading text >=18px with Persian-friendly leading');
        assert(p.width >= 300, 'Mobile reading copy must not sit in narrow nested columns');
      }
      composition.stages.forEach((step, i, steps) => {
        assert.equal(step.topBorder, 0, 'Horizontal rail removed on mobile');
        assert.equal(step.startBorder, 2, 'Vertical RTL inline-start progression rail');
        if (i) {
          assert(Math.abs(step.x - steps[i - 1].x) < 2, 'Mobile stages align');
          assert(Math.abs(step.y - (steps[i - 1].y + steps[i - 1].height)) < 2, 'Mobile stages join vertically in DOM order');
        }
      });
    } else {
      composition.stages.forEach((step, i, steps) => {
        assert.equal(step.topBorder, 2, 'Horizontal progression rail on tablet/desktop');
        if (i) {
          assert(Math.abs(step.y - steps[i - 1].y) < 2, 'Horizontal stages share a baseline');
          assert(step.x < steps[i - 1].x, 'Native RTL progression: 01 at right, 03 at left');
          assert(Math.abs(step.x + step.width - steps[i - 1].x) < 2, 'Horizontal rail is connected');
        }
      });
      if (width > 1024) assert(composition.media.width >= composition.hero.width, 'Product media has deliberate desktop prominence');
    }
    console.log(`::notice title=Homepage composition ${name}::PASS: workflow ${width < 768 ? 'vertical' : 'RTL horizontal'}; minimum reading width ${Math.round(Math.min(...composition.reading.map(p => p.width)))}px; media ${Math.round(composition.media.width)}x${Math.round(composition.media.height)}px`);
    await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
    await page.screenshot({ path: resolve(out, `${name}-viewport.png`) });
    // Keyboard reachability through the real shell (skip link, identity, header
    // CTA, then content): bounded Tab presses until the demo CTA holds focus.
    let ctaFocused = false;
    for (let tab = 0; tab < 12 && !ctaFocused; tab++) {
      await page.keyboard.press('Tab');
      ctaFocused = await cta.evaluate(a => a === document.activeElement);
    }
    assert(ctaFocused, 'CTA reachable by keyboard in reading order');
    assert(await cta.evaluate(a => getComputedStyle(a).outlineStyle !== 'none'), 'Visible keyboard focus');
    // The CTA destination /demo/ is reconstructed by a later runner in this CI
    // sequence, so cross-page serving proof lives in tests/browser/site-shell.mjs;
    // the in-page consultation section itself stays present and honest.
    assert(await page.locator('#demo-consultation').count() >= 1, 'In-page demo/consultation section remains');
    diagnostic.views.push({ name, width, height, ...measures, ctaBox, composition });
  }
  assert.deepEqual(diagnostic.frontendErrors, [], 'Frontend console/page errors');
  assert.deepEqual(diagnostic.failedRequests, [], 'Failed frontend requests');
  assert.deepEqual(diagnostic.badResponses, [], 'Frontend HTTP errors');
  assert.deepEqual(diagnostic.externalRequests, [], 'No remote fonts/scripts/media');
  await visitor.close();
  diagnostic.result = 'PASS';
  console.log(`::notice title=Homepage proof::PASS: persisted and reopened native Elementor page ${id}; ${all.length} elements; HTTP/RTL/H1/metadata/local-font/focus/CTA/overflow/network checks at all four viewports; runtime ${JSON.stringify(state)}`);
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
