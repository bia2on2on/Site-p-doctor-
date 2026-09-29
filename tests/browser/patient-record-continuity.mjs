/**
 * Browser verification of the CPMS patient-record / information-continuity page
 * («پرونده بیمار و تداوم اطلاعات»). Ephemeral wp-env only. No DB JSON writes,
 * private APIs, or host operations. Run in the CI sequence AFTER the
 * homepage / Product Overview / Demo / appointment-reception-queue runners:
 * it proves those pages still reconstruct and that the inbound Product Overview
 * link and every outbound destination resolve to real pages.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { patientRecordContinuity, pageIdentity } from '../../reconstruction/patient-record-continuity/recipe.mjs';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(import.meta.dirname, 'artifacts/patient-record-continuity');
mkdirSync(out, { recursive: true });
// Make pre-browser fixture failures retrievable even when CI log-blob egress is unavailable.
process.on('uncaughtException', error => {
  const message = String(error.stack || error).replace(/user_pass=\S+/g, 'user_pass=[redacted]');
  writeFileSync(resolve(out, 'bootstrap-error.txt'), message);
  console.error(`::error title=Patient-record continuity reconstruction::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
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
const recipe = patientRecordContinuity(tokens);
const flatten = nodes => nodes.flatMap(n => [n, ...flatten(n.children)]);
const all = flatten(recipe);

assert.equal(wp('option', 'get', 'home'), base, 'Only the disposable default wp-env URL is supported');
assert.equal(wp('theme', 'list', '--status=active', '--field=name'), 'koorosh');
wp('plugin', 'is-active', 'elementor');
assert.equal(wp('post', 'list', '--post_type=page', `--name=${pageIdentity.slug}`, '--format=count'), '0', 'Refuse to overwrite existing page; use a clean environment');

// Regression guard: the four previously reconstructed pages remain published and
// Elementor-editable in this shared fixture and are the real link destinations.
const precedingPages = ['cpms-home', 'product-overview', 'demo', 'appointment-reception-queue'];
for (const slug of precedingPages) {
  assert.equal(wp('post', 'list', '--post_type=page', `--name=${slug}`, '--field=post_status'), 'publish', `${slug} must already be reconstructed and published by its own runner`);
  assert.equal(wp('eval', `$p = get_page_by_path('${slug}'); $d = $p ? \\Elementor\\Plugin::$instance->documents->get($p->ID) : null; echo $d && $d->is_built_with_elementor() ? '1' : '0';`), '1', `${slug} must remain Elementor-editable`);
}

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
  // Stable post-name URLs (documented structural pattern, SITE-ARCHITECTURE §5.1)
  // so links to /demo/, /product-overview/ and /appointment-reception-queue/ are real.
  wp('rewrite', 'structure', '/%postname%/');
  // Earlier standalone runners temporarily use Product Overview as the front page.
  // Keep the actual Homepage at / for this integrated five-page reconstruction.
  const homeId = wp('post', 'list', '--post_type=page', '--name=cpms-home', '--field=ID');
  assert.match(homeId, /^\d+$/);
  wp('option', 'update', 'page_on_front', homeId);
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
    assert.equal(response.status(), 200, `${name}: patient-record page serves successfully`);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.equal(await page.locator('html').getAttribute('lang'), 'fa-IR');
    assert.equal(await page.locator('main').count(), 1);
    assert.equal(await page.locator('h1').count(), 1, 'Exactly one H1');
    assert.match(await page.title(), /CPMS/);
    assert.match(await page.locator('h1').innerText(), /پروندهٔ بیمار و تداوم اطلاعات/);
    assert.equal(await page.locator('meta[name="description"]').count(), 1);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
    assert.equal(await page.locator('form').count(), 0, 'No form without an authorized endpoint');
    // Explicit bounded claims must stay visible at every viewport.
    assert(await page.getByText('ادعای این صفحه نیست', { exact: false }).count() >= 1, 'Hero scope note visible');
    assert(await page.getByText('مرز صریح', { exact: false }).count() >= 1, 'Record boundary visible');
    assert(await page.getByText('ثبت و مدیریت در محیط CPMS', { exact: false }).count() >= 1, 'In-CPMS recording wording visible');
    assert(await page.getByText('تمایز صریح', { exact: false }).count() >= 1, 'National-system distinction visible');
    assert(await page.getByText('پشتیبانی تصمیم بالینی، هشدار خودکار یا پیشنهاد تشخیص', { exact: false }).count() >= 1, 'No clinical decision support invented');
    assert(await page.getByText('دسترسی و تفکیک داده', { exact: false }).count() >= 1, 'Mechanism-level access section visible');
    assert(await page.getByText('غیرزنده', { exact: false }).count() >= 1, 'Non-live conversion reality stated');
    const cta = page.locator('main').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true });
    assert.equal(await cta.getAttribute('href'), '/demo/');
    const ctaBox = await cta.boundingBox();
    assert(ctaBox.y + ctaBox.height < height, `${name}: hero CTA must be in first viewport`);
    assert(ctaBox.height >= 44, 'CTA touch size');
    assert.equal(await page.locator('#product-media-record img, #product-media-record svg, #product-media-record canvas, #product-media-document img, #product-media-document svg, #product-media-document canvas').count(), 0, 'No fabricated product media');
    const measures = await page.evaluate(() => ({
      width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
      font: getComputedStyle(document.querySelector('h1')).fontFamily,
      fontLoaded: document.fonts.check('700 30px Vazirmatn'),
      headings: [...document.querySelectorAll('main h1, main h2, main h3')].map(n => ({ tag: n.tagName, text: n.textContent })),
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
      offsiteLinks: [...document.querySelectorAll('main a')].filter(a => a.origin !== location.origin).map(a => a.href),
      crossPageLinks: [...document.querySelectorAll('main a')].filter(a => a.origin === location.origin && a.pathname !== location.pathname && !a.hash).map(a => a.pathname),
      reservations: [...document.querySelectorAll('[id^="product-media-"]')].length,
      // Claim boundary checked on the rendered text, not only in the authored source.
      renderedStrings: [...document.querySelectorAll('main h1, main h2, main h3, main p')].map(n => n.textContent.trim()).filter(Boolean),
    }));
    assert(measures.scrollWidth <= measures.width, `${name}: horizontal overflow`);
    assert(measures.font.includes('Vazirmatn') && measures.fontLoaded, 'Local Persian font loaded');
    assert.deepEqual(measures.brokenAnchors, []);
    assert.deepEqual(measures.offsiteLinks, [], 'No offsite links');
    assert.deepEqual([...new Set(measures.crossPageLinks)].sort(), ['/appointment-reception-queue/', '/demo/', '/product-overview/'], `Only existing reconstructed pages are linked: ${measures.crossPageLinks}`);
    assert.equal(measures.reservations, 2, 'Exactly two media reservations on the page');
    const nationalTerms = [/سامانهٔ ملی/, /نسخهٔ الکترونیک ملی/, /پروندهٔ الکترونیک سلامت/, /کشوری/];
    for (const value of measures.renderedStrings) {
      for (const term of nationalTerms) {
        if (term.test(value)) assert(/نیست|نمی‌شود|نمی‌دهد|نمی‌دهند|ندارد|ندارند|خیر|بدون/.test(value) || /؟\s*$/.test(value), `Rendered national-system wording must stay negated: ${value.slice(0, 90)}`);
      }
    }
    const rendered = measures.renderedStrings.join('\n');
    for (const pattern of [/کاملاً امن/, /گواهی/, /انطباق قانونی/, /۱۰۰٪|100%/, /تضمین/, /بهترین/, /رایگان/, /درگاه پرداخت/, /اپلیکیشن موبایل/, /هوش مصنوعی/, /تشخیص خودکار/, /بیمه/]) {
      assert(!pattern.test(rendered), `Forbidden rendered claim: ${pattern}`);
    }
    const levels = measures.headings.map(h => Number(h.tag.slice(1)));
    assert.equal(levels[0], 1, 'H1 precedes subsection headings');
    assert(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1), 'No skipped heading levels');
    const composition = await page.evaluate(() => {
      const rect = selector => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      return {
        surfaces: ['record', 'document'].map(slot => ({ slot, surface: rect(`#media-${slot}-surface`), wrapper: rect(`#product-media-${slot}`) })),
        stages: ['context', 'workspace', 'document', 'follow-up'].map(id => {
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
    assert(await page.locator('#media-record-disclosure').isVisible() && await page.locator('#media-document-disclosure').isVisible(), 'Reserved-media disclosures remain visible');
    assert(await page.locator('#patient-portal-boundary').isVisible(), 'Bounded patient-portal note stays visible');
    for (const media of composition.surfaces) {
      assert(media.surface.height >= (width < 768 ? 256 : 320), `${media.slot}: intentional media reservation, not a collapsed empty state`);
    }
    if (width < 768) {
      for (const p of composition.reading) {
        assert(p.font >= 18 && p.line / p.font >= 1.85, 'Mobile reading text >=18px with Persian-friendly leading');
        assert(p.width >= 300, 'Mobile reading copy must not sit in narrow nested columns');
      }
      composition.stages.forEach((step, i, steps) => {
        assert.equal(step.topBorder, 0, 'Shared horizontal rail removed on mobile');
        assert.equal(step.startBorder, 2, 'Vertical RTL inline-start continuity rail');
        if (i) {
          assert(Math.abs(step.x - steps[i - 1].x) < 2, 'Mobile stages align');
          assert(Math.abs(step.y - (steps[i - 1].y + steps[i - 1].height)) < 2, 'Mobile stages join vertically in DOM order');
        }
      });
    } else {
      composition.stages.forEach((step, i, steps) => {
        assert.equal(step.topBorder, 2, 'Continuous continuity rail on tablet/desktop');
        if (i) {
          assert(Math.abs(step.y - steps[i - 1].y) < 2, 'Horizontal stages share a baseline');
          assert(step.x < steps[i - 1].x, 'Native RTL continuity: 01 at right, 04 at left');
          assert(Math.abs(step.x + step.width - steps[i - 1].x) < 2, 'Horizontal rail is connected');
        }
      });
    }
    console.log(`::notice title=Patient-record composition ${name}::PASS: continuity ${width < 768 ? 'vertical' : 'RTL horizontal'}; minimum reading width ${Math.round(Math.min(...composition.reading.map(p => p.width)))}px; record media ${Math.round(composition.surfaces[0].wrapper.width)}x${Math.round(composition.surfaces[0].wrapper.height)}px; reservations ${measures.reservations}`);
    await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
    await page.screenshot({ path: resolve(out, `${name}-viewport.png`) });
    diagnostic.views.push({ name, width, height, ...measures, renderedStrings: undefined, ctaBox, composition });
  }

  // Keyboard reachability and visible focus; no programmatic focus shortcut.
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  // Keyboard reachability through the real shell (skip link, identity, header
  // CTA, then content): bounded Tab presses until the demo CTA holds focus.
  const cta = page.locator('main').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true });
  let ctaFocused = false;
  for (let tab = 0; tab < 12 && !ctaFocused; tab++) {
    await page.keyboard.press('Tab');
    ctaFocused = await cta.evaluate(a => a === document.activeElement);
  }
  assert(ctaFocused, 'CTA reachable by keyboard in reading order');
  assert(await cta.evaluate(a => getComputedStyle(a).outlineStyle !== 'none'), 'Visible keyboard focus');
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/demo\/?$/);
  assert.equal(await page.locator('h1').count(), 1, 'Demo CTA destination serves one H1');
  assert.match(await page.locator('h1').innerText(), /بررسی تناسب CPMS/, 'CTA destination is the real Demo/Consultation page');

  // Inbound architecture link: Product Overview must reach this page by a native text link.
  const overview = await page.goto(`${base}/product-overview/`, { waitUntil: 'networkidle' });
  assert.equal(overview.status(), 200);
  assert.match(await page.locator('h1').innerText(), /نرم‌افزار مدیریت مطب و کلینیک/, 'Product Overview identity intact');
  await page.getByRole('link', { name: 'پرونده بیمار و تداوم اطلاعات', exact: true }).click();
  await page.waitForURL(pageUrl);
  assert.match(await page.locator('h1').innerText(), /پروندهٔ بیمار و تداوم اطلاعات/, 'Inbound native link reaches the patient-record page');

  // The related workflow page and the actual Homepage still serve their own identities.
  const workflow = await page.goto(`${base}/appointment-reception-queue/`, { waitUntil: 'networkidle' });
  assert.equal(workflow.status(), 200);
  assert.match(await page.locator('h1').innerText(), /نوبت، پذیرش و صف/, 'Existing workflow page still serves its identity');
  const home = await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  assert.equal(home.status(), 200);
  assert.equal(await page.locator('h1').count(), 1, 'Homepage still serves one H1');
  assert.match(await page.locator('h1').innerText(), /مدیریت کلینیک،\s*با نگاهی یکپارچه/, 'Actual Homepage identity at root, not another page');

  assert.deepEqual(diagnostic.frontendErrors, [], 'Frontend console/page errors');
  assert.deepEqual(diagnostic.failedRequests, [], 'Failed frontend requests');
  assert.deepEqual(diagnostic.badResponses, [], 'Frontend HTTP errors');
  assert.deepEqual(diagnostic.externalRequests, [], 'No remote fonts/scripts/media');
  await visitor.close();
  diagnostic.result = 'PASS';
  console.log(`::notice title=Patient-record page proof::PASS: persisted and reopened native Elementor page ${id}; ${all.length} elements; HTTP/RTL/H1/metadata/local-font/focus/CTA/overflow/reservation/claim-boundary/network checks at all four viewports; inbound Product Overview link and all outbound destinations resolve; runtime ${JSON.stringify(state)}`);
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
