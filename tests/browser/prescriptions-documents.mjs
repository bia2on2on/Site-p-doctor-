/**
 * Browser verification of the CPMS prescriptions-and-documents page («نسخه‌ها و اسناد در CPMS»).
 * Ephemeral wp-env only. No DB JSON writes, private APIs, or host operations.
 * Run in the CI sequence AFTER the homepage / Product Overview / Demo /
 * appointment-reception-queue / patient-record-continuity / doctor-workspace /
 * patient-portal runners: it proves those pages still reconstruct and that the
 * inbound Product Overview link and every outbound destination resolve to real pages.
 * The wording guard is shared with the static validator, so authored and rendered
 * text are held to the same claim boundary. Text checks are not product capability
 * verification.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { prescriptionsDocuments, pageIdentity } from '../../reconstruction/prescriptions-documents/recipe.mjs';
import { homepage } from '../../reconstruction/homepage/recipe.mjs';
import { productOverview } from '../../reconstruction/product-overview/recipe.mjs';
import { demoPage } from '../../reconstruction/demo/recipe.mjs';
import { appointmentReceptionQueue } from '../../reconstruction/appointment-reception-queue/recipe.mjs';
import { patientRecordContinuity } from '../../reconstruction/patient-record-continuity/recipe.mjs';
import { doctorWorkspace } from '../../reconstruction/doctor-workspace/recipe.mjs';
import { patientPortal } from '../../reconstruction/patient-portal/recipe.mjs';
import * as boundary from '../static/boundary-prescriptions-documents.mjs';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(import.meta.dirname, 'artifacts/prescriptions-documents');
mkdirSync(out, { recursive: true });
// Make pre-browser fixture failures retrievable even when CI log-blob egress is unavailable.
process.on('uncaughtException', error => {
  const message = String(error.stack || error).replace(/user_pass=\S+/g, 'user_pass=[redacted]');
  writeFileSync(resolve(out, 'bootstrap-error.txt'), message);
  console.error(`::error title=Prescriptions-documents reconstruction::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
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
const recipe = prescriptionsDocuments(tokens);
const flatten = nodes => nodes.flatMap(n => [n, ...flatten(n.children)]);
const all = flatten(recipe);
// Text compared after removing markup and collapsing whitespace (a <br> renders as a line break).
const normalize = value => value.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const authoredH1 = authored => normalize(flatten(authored(tokens)).find(n => n.kind === 'heading' && n.settings.header_size === 'h1').settings.title);
const expectedH1 = authoredH1(prescriptionsDocuments);

assert.equal(wp('option', 'get', 'home'), base, 'Only the disposable default wp-env URL is supported');
assert.equal(wp('theme', 'list', '--status=active', '--field=name'), 'koorosh');
wp('plugin', 'is-active', 'elementor');
assert.equal(wp('post', 'list', '--post_type=page', `--name=${pageIdentity.slug}`, '--format=count'), '0', 'Refuse to overwrite existing page; use a clean environment');

// Regression guard: the seven previously reconstructed pages remain published and
// Elementor-editable in this shared fixture and are the real link destinations.
const precedingPages = ['cpms-home', 'product-overview', 'demo', 'appointment-reception-queue', 'patient-record-continuity', 'doctor-workspace', 'patient-portal'];
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
  // so links to /demo/, /doctor-workspace/ and /patient-record-continuity/ are real.
  wp('rewrite', 'structure', '/%postname%/');
  // Earlier standalone runners temporarily use Product Overview as the front page.
  // Keep the actual Homepage at / for this integrated eight-page reconstruction.
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
    assert.equal(response.status(), 200, `${name}: prescriptions-documents page serves successfully`);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.equal(await page.locator('html').getAttribute('lang'), 'fa-IR');
    assert.equal(await page.locator('main').count(), 1);
    assert.equal(await page.locator('h1').count(), 1, 'Exactly one H1');
    const documentTitle = await page.title();
    assert.match(documentTitle, /CPMS/);
    assert(documentTitle.includes(pageIdentity.title.split(' | ')[0]), 'Document title carries the authored title through the existing mechanism');
    assert.equal(normalize(await page.locator('h1').innerText()), expectedH1, 'Rendered H1 is the authored H1');
    assert.equal(await page.locator('meta[name="description"]').count(), 1);
    assert.equal((await page.locator('meta[name="description"]').getAttribute('content')).trim(), pageIdentity.description, 'The excerpt renders as the meta description through the existing mechanism');
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
    assert.equal(await page.locator('form').count(), 0, 'No form without an authorized endpoint');
    // The internal-versus-national distinction and the honest scope statements must be
    // readable in the rendered page at every viewport, not merely present in the recipe.
    const mainText = boundary.stripTags(await page.locator('main').innerText());
    for (const phrase of [
      ...boundary.distinctionPhrases, 'غیرزنده', 'این قاب، تصویر محیط نرم‌افزار نیست', 'سطح سازوکار است', 'ادعایی ندارد',
      'راهنمای بیماران برای دریافت یا پیگیری نسخه نیست', 'نمایان‌بودن همهٔ نسخه‌ها و اسناد فرض نمی‌شود', 'توضیحی مفهومی است',
    ]) assert(mainText.includes(phrase), `${name}: bounded wording rendered on the page: ${phrase}`);
    // The page's own hero CTA lives inside <main>; scope the lookup so the global site-shell
    // header CTA (present after the site-shell merge) cannot create a strict-mode duplicate match.
    const cta = page.locator('main').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true });
    assert.equal(await cta.getAttribute('href'), '/demo/');
    const ctaBox = await cta.boundingBox();
    assert(ctaBox.y + ctaBox.height < height, `${name}: hero CTA must be in first viewport`);
    assert(ctaBox.height >= 44, 'CTA touch size');
    assert.equal(await page.locator('#product-media-prescription img, #product-media-prescription svg, #product-media-prescription canvas, #product-media-document-context img, #product-media-document-context svg, #product-media-document-context canvas').count(), 0, 'No fabricated product media');
    const measures = await page.evaluate(() => ({
      width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
      font: getComputedStyle(document.querySelector('h1')).fontFamily,
      fontLoaded: document.fonts.check('700 30px Vazirmatn'),
      headings: [...document.querySelectorAll('main h1, main h2, main h3')].map(n => ({ tag: n.tagName, text: n.textContent })),
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
      offsiteLinks: [...document.querySelectorAll('main a')].filter(a => a.origin !== location.origin).map(a => a.href),
      crossPageLinks: [...document.querySelectorAll('main a')].filter(a => a.origin === location.origin && a.pathname !== location.pathname && !a.hash).map(a => a.pathname),
      reservations: [...document.querySelectorAll('[id^="product-media-"]')].length,
      // Claim boundary is checked on the rendered text, not only in the authored source.
      renderedStrings: [...document.querySelectorAll('main h1, main h2, main h3, main p, main a')].map(n => n.innerText.trim()).filter(Boolean),
    }));
    assert(measures.scrollWidth <= measures.width, `${name}: horizontal overflow`);
    assert(measures.font.includes('Vazirmatn') && measures.fontLoaded, 'Local Persian font loaded');
    assert.deepEqual(measures.brokenAnchors, []);
    assert.deepEqual(measures.offsiteLinks, [], 'No offsite links');
    assert.deepEqual([...new Set(measures.crossPageLinks)].sort(), ['/demo/', '/doctor-workspace/', '/patient-record-continuity/'], `Only the three intended reconstructed pages are linked: ${measures.crossPageLinks}`);
    assert.equal(measures.reservations, 2, 'Exactly two media reservations on the page');
    boundary.assertNoHardForbidden(measures.renderedStrings, `${name}: rendered copy`);
    const renderedClauses = boundary.assertExternalTermsNegated(measures.renderedStrings, `${name}: rendered copy`);
    assert(renderedClauses >= 10, `${name}: the rendered negation check must not be vacuous (${renderedClauses} clauses)`);
    boundary.assertElectronicPrescriptionBoundary(measures.renderedStrings, `${name}: rendered copy`, 4);
    boundary.assertPersianTypography(measures.renderedStrings, `${name}: rendered copy`);
    const levels = measures.headings.map(h => Number(h.tag.slice(1)));
    assert.equal(levels[0], 1, 'H1 precedes subsection headings');
    assert(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1), 'No skipped heading levels');
    const composition = await page.evaluate(() => {
      const box = el => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      const h1 = document.querySelector('h1');
      return {
        h1: { ...box(h1), lineHeight: parseFloat(getComputedStyle(h1).lineHeight) },
        hero: box(document.querySelector('#hero-copy')),
        media: box(document.querySelector('#product-media-prescription')),
        surfaces: ['prescription', 'document-context'].map(slot => ({ slot, surface: box(document.querySelector(`#media-${slot}-surface`)), wrapper: box(document.querySelector(`#product-media-${slot}`)) })),
        // Context ledger rows in DOM order; each row is exactly «layer | meaning».
        ledger: [...document.querySelectorAll('#context-ledger > *')].map(row => {
          const style = getComputedStyle(row);
          const [layer, meaning] = [...row.children].map(box);
          return { id: row.id, ...box(row), children: row.children.length, background: style.backgroundColor, startRule: parseFloat(style.borderRightWidth), layer, meaning };
        }),
        nonClaims: [...document.querySelectorAll('#not-national, #not-insurance-pharmacy, #not-clinical-support')].map(el => ({ id: el.id, ...box(el) })),
        boundaries: ['hero-scope', 'prescriptions-distinction', 'not-national', 'not-insurance-pharmacy', 'not-clinical-support'].map(id => {
          const el = document.getElementById(id);
          return { id, visible: !!el && el.getBoundingClientRect().height > 0, fonts: el ? [...el.querySelectorAll('.cpms-reading p')].map(p => parseFloat(getComputedStyle(p).fontSize)) : [] };
        }),
        reading: [...document.querySelectorAll('.cpms-reading p')].map(p => {
          const style = getComputedStyle(p);
          return { font: parseFloat(style.fontSize), line: parseFloat(style.lineHeight), width: p.getBoundingClientRect().width };
        }),
      };
    });
    assert(composition.reading.length > 0, 'Reading-copy measurements must not be vacuous');
    assert(await page.locator('#media-prescription-disclosure').isVisible() && await page.locator('#media-document-context-disclosure').isVisible(), 'Reserved-media disclosures remain visible');
    for (const media of composition.surfaces) {
      assert(media.surface.height >= (width < 768 ? 256 : 320), `${media.slot}: intentional media reservation, not a collapsed empty state`);
    }

    // Hero: the H1 spans the band; the token policy allows at most two desktop lines.
    const h1Lines = Math.round(composition.h1.height / composition.h1.lineHeight);
    if (width > 1024) {
      assert(h1Lines <= tokens.typography.h1_policy.max_lines_desktop, `${name}: H1 renders in ${h1Lines} lines; token policy allows ${tokens.typography.h1_policy.max_lines_desktop}`);
      assert(composition.h1.width > composition.hero.width, `${name}: desktop H1 spans the hero band, not only the copy column`);
      assert(composition.h1.y + composition.h1.height <= composition.hero.y + 1, `${name}: H1 sits above the copy/media row`);
      assert(composition.media.x < composition.hero.x, `${name}: RTL hero keeps copy at the inline start (right) and reserved media at the left`);
    } else {
      assert(composition.media.y >= composition.hero.y + composition.hero.height - 1, `${name}: stacked hero puts the copy before the reserved media`);
    }

    // Context ledger: reading order, one column, no overlap; only the layer/meaning pair reflows.
    assert.deepEqual(composition.ledger.map(r => r.id), ['ledger-doctor', 'ledger-patient', 'ledger-record', 'ledger-boundary'], 'Ledger keeps reading order');
    for (const [i, row] of composition.ledger.entries()) {
      assert.equal(row.children, 2, `Ledger row is exactly layer + meaning: ${row.id}`);
      if (i) {
        const prev = composition.ledger[i - 1];
        assert(Math.abs(row.x - prev.x) < 3 && Math.abs(row.width - prev.width) < 3, `Ledger rows share one column: ${row.id}`);
        const seam = row.y - (prev.y + prev.height);
        assert(seam >= -1 && seam <= 3, `Ledger rows join top to bottom without overlap or gaps: ${row.id} (seam ${Math.round(seam)}px)`);
      }
      if (width <= 1024) {
        assert(Math.abs(row.layer.x - row.meaning.x) < 3, `Stacked ledger row aligns layer and meaning: ${row.id}`);
        assert(row.meaning.y >= row.layer.y + row.layer.height - 1, `Stacked ledger row: meaning follows layer: ${row.id}`);
      } else {
        assert(Math.abs(row.layer.y - row.meaning.y) < 3, `Side-by-side ledger row shares a top edge: ${row.id}`);
        assert(row.layer.x > row.meaning.x, `RTL ledger row: layer at the right, meaning at the left: ${row.id}`);
        assert(row.layer.width < row.meaning.width, `Layer column is narrower than the meaning column: ${row.id}`);
      }
    }
    const [ledgerDoctor, , ledgerRecord, ledgerBoundary] = composition.ledger;
    assert(ledgerRecord.startRule >= 3, 'The record row is emphasised by an accent inline-start rule');
    assert(ledgerBoundary.background !== ledgerRecord.background && ledgerBoundary.background !== ledgerDoctor.background, 'The outside-CPMS row is visually distinct from the other rows');

    // Compact non-claim row: three short clarifications, one RTL row above tablet, stacked below.
    assert.deepEqual(composition.nonClaims.map(c => c.id), ['not-national', 'not-insurance-pharmacy', 'not-clinical-support'], 'Non-claims keep DOM order');
    for (const [i, claim] of composition.nonClaims.entries()) {
      if (!i) continue;
      const prev = composition.nonClaims[i - 1];
      if (width <= 1024) {
        assert(Math.abs(claim.x - prev.x) < 3, `Stacked non-claims align: ${claim.id}`);
        assert(claim.y >= prev.y + prev.height - 1, `Stacked non-claims follow DOM order: ${claim.id}`);
      } else {
        assert(Math.abs(claim.y - composition.nonClaims[0].y) < 3, `Single-row non-claims share a top edge: ${claim.id}`);
        assert(claim.x < prev.x, `RTL non-claim order: ${claim.id} sits to the left of ${prev.id}`);
        const gapPx = prev.x - (claim.x + claim.width);
        assert(gapPx >= 0 && gapPx <= 90, `Non-claims do not overlap and stay adjacent: ${claim.id} (gap ${Math.round(gapPx)}px)`);
      }
    }

    // Every scope clarification stays visible and at reading size: a boundary is not fine print.
    for (const item of composition.boundaries) {
      assert(item.visible, `${name}: explicit boundary stays visible: ${item.id}`);
      assert(item.fonts.length >= 1, `${name}: boundary carries reading text: ${item.id}`);
      for (const font of item.fonts) assert(font >= (width < 768 ? 18 : 15), `${name}: clarification is reading-size, not fine print: ${item.id} (${font}px)`);
    }
    if (width < 768) {
      for (const p of composition.reading) {
        assert(p.font >= 18 && p.line / p.font >= 1.85, 'Mobile reading text >=18px with Persian-friendly leading');
        assert(p.width >= 300, 'Mobile reading copy must not sit in narrow nested columns');
      }
    }
    console.log(`::notice title=Prescriptions-documents composition ${name}::PASS: H1 ${h1Lines} line(s); ledger ${width <= 1024 ? 'stacked pairs' : 'RTL layer|meaning rows'} (${composition.ledger.length} rows); non-claims ${width <= 1024 ? 'stacked' : 'RTL row'} (${composition.nonClaims.length}); minimum reading width ${Math.round(Math.min(...composition.reading.map(p => p.width)))}px; prescription media ${Math.round(composition.surfaces[0].wrapper.width)}x${Math.round(composition.surfaces[0].wrapper.height)}px; reservations ${measures.reservations}; external-term clauses ${renderedClauses}`);
    await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
    await page.screenshot({ path: resolve(out, `${name}-viewport.png`) });
    await page.locator('#context-ledger').screenshot({ path: resolve(out, `${name}-ledger.png`) });
    diagnostic.views.push({ name, width, height, ...measures, renderedStrings: undefined, ctaBox, h1Lines, composition });
  }

  // Keyboard reachability and visible focus; no programmatic focus shortcut.
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab'); // neutral shell home link
  // The merged site shell adds a header CTA before the nav, so traverse tabbable items
  // (bounded) until focus lands on the first link inside the page's own <main> content;
  // that link must remain this page's authored consultation CTA (found by accessible name,
  // scoped to main so the shell header CTA cannot create a strict-mode duplicate match).
  const cta = page.locator('main').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true });
  let focus = null;
  for (let i = 0; i < 14; i += 1) {
    await page.keyboard.press('Tab');
    focus = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el.tagName !== 'A' || !el.closest('main')) return null;
      return { href: el.getAttribute('href'), text: el.textContent.trim(), outline: getComputedStyle(el).outlineStyle };
    });
    if (focus) break;
  }
  assert(focus, 'First page-content link takes focus after the neutral shell');
  assert.equal(focus.href, await cta.getAttribute('href'), 'First content link remains the consultation CTA');
  assert.match(focus.text, /درخواست دمو/);
  assert.notEqual(focus.outline, 'none', 'Visible keyboard focus');
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/demo\/?$/);
  assert.equal(await page.locator('h1').count(), 1, 'Demo CTA destination serves one H1');
  assert.match(await page.locator('h1').innerText(), /بررسی تناسب CPMS/, 'CTA destination is the real Demo/Consultation page');

  // Contextual destinations are reached by clicking this page's own links, not by guessing URLs.
  async function followFromPage(scope, linkName, destination, expectedTitle) {
    await page.goto(pageUrl, { waitUntil: 'networkidle' });
    await page.locator(scope).getByRole('link', { name: linkName, exact: true }).click();
    await page.waitForURL(new RegExp(`${destination}/?$`));
    assert.equal(await page.locator('h1').count(), 1, `${destination} serves one H1`);
    assert.equal(normalize(await page.locator('h1').innerText()), expectedTitle, `${linkName}: the link reaches the real ${destination} page`);
  }
  await followFromPage('#introduction', 'دیدن صفحهٔ پروندهٔ بیمار', '/patient-record-continuity', authoredH1(patientRecordContinuity));
  await followFromPage('#ledger-doctor', 'دیدن صفحهٔ فضای کاری پزشک', '/doctor-workspace', authoredH1(doctorWorkspace));
  await followFromPage('#ledger-patient', 'دیدن صفحهٔ پروندهٔ بیمار', '/patient-record-continuity', authoredH1(patientRecordContinuity));
  await followFromPage('#next-step', 'رفتن به صفحهٔ دمو و مشاوره', '/demo', authoredH1(demoPage));

  // Inbound architecture link: Product Overview must reach this page by a native text link.
  const overview = await page.goto(`${base}/product-overview/`, { waitUntil: 'networkidle' });
  assert.equal(overview.status(), 200);
  assert.match(await page.locator('h1').innerText(), /نرم‌افزار مدیریت مطب و کلینیک/, 'Product Overview identity intact');
  await page.getByRole('link', { name: 'نسخه‌ها و اسناد در CPMS', exact: true }).click();
  await page.waitForURL(pageUrl);
  assert.equal(normalize(await page.locator('h1').innerText()), expectedH1, 'Inbound native link reaches the prescriptions-documents page');

  // Every earlier page (including the actual Homepage at the root) still serves its own authored H1.
  const sweep = [];
  for (const [slug, path, authored] of [
    ['cpms-home', '/', homepage], ['product-overview', '/product-overview/', productOverview], ['demo', '/demo/', demoPage],
    ['appointment-reception-queue', '/appointment-reception-queue/', appointmentReceptionQueue],
    ['patient-record-continuity', '/patient-record-continuity/', patientRecordContinuity],
    ['doctor-workspace', '/doctor-workspace/', doctorWorkspace], ['patient-portal', '/patient-portal/', patientPortal],
  ]) {
    const earlier = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    assert.equal(earlier.status(), 200, `${slug} still serves`);
    assert.equal(await page.locator('h1').count(), 1, `${slug} still serves one H1`);
    assert.equal(normalize(await page.locator('h1').innerText()), authoredH1(authored), `${slug} still serves its own authored H1`);
    sweep.push({ slug, path, status: earlier.status() });
  }
  diagnostic.earlierPages = sweep;

  assert.deepEqual(diagnostic.frontendErrors, [], 'Frontend console/page errors');
  assert.deepEqual(diagnostic.failedRequests, [], 'Failed frontend requests');
  assert.deepEqual(diagnostic.badResponses, [], 'Frontend HTTP errors');
  assert.deepEqual(diagnostic.externalRequests, [], 'No remote fonts/scripts/media');
  await visitor.close();
  diagnostic.result = 'PASS';
  console.log(`::notice title=Prescriptions-documents page proof::PASS: persisted and reopened native Elementor page ${id}; ${all.length} elements; HTTP/RTL/H1/metadata/local-font/focus/CTA/overflow/reservation/claim-boundary/network checks at all four viewports; inbound Product Overview link, this page's own contextual links (clicked) and all seven earlier pages verified; runtime ${JSON.stringify(state)}`);
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
