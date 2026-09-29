/**
 * Browser verification of the CPMS global FAQ / buyer-objection page.
 * Ephemeral wp-env only. No DB JSON writes, private APIs, or host operations.
 * Run in the CI sequence AFTER the eight page runners and BEFORE the site-shell
 * runner: it proves the page reconstructs as native, persisted, Elementor-editable
 * content, that the page's own boundary wording survives rendering, that every
 * outbound destination resolves, and that the earlier sales pages still serve.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { faqPage, faqGroups, faqQuestions, faqAnswers, pageIdentity } from '../../reconstruction/faq/recipe.mjs';
import {
  assertNoHardForbidden, assertBoundaryTermsNegated, assertPersianTypography, assertObjectionPageShape, stripTags,
} from '../static/boundary-faq.mjs';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(import.meta.dirname, 'artifacts/faq');
mkdirSync(out, { recursive: true });
// Make pre-browser fixture failures retrievable even when CI log-blob egress is unavailable.
process.on('uncaughtException', error => {
  const message = String(error.stack || error).replace(/user_pass=\S+/g, 'user_pass=[redacted]');
  writeFileSync(resolve(out, 'bootstrap-error.txt'), message);
  console.error(`::error title=FAQ reconstruction::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
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
const recipe = faqPage(tokens);
const flatten = nodes => nodes.flatMap(n => [n, ...flatten(n.children)]);
const all = flatten(recipe);
const normalize = value => String(value).replace(/\s+/g, ' ').trim();

assert.equal(wp('option', 'get', 'home'), base, 'Only the disposable default wp-env URL is supported');
assert.equal(wp('theme', 'list', '--status=active', '--field=name'), 'koorosh');
wp('plugin', 'is-active', 'elementor');
assert.equal(wp('post', 'list', '--post_type=page', `--name=${pageIdentity.slug}`, '--format=count'), '0', 'Refuse to overwrite existing page; use a clean environment');

// Regression guard: the eight previously reconstructed pages remain published and
// Elementor-editable in this shared fixture, and are this page's real link targets.
const precedingPages = [
  ['cpms-home', '/', /نرم‌افزار مدیریت مطب و کلینیک/],
  ['product-overview', '/product-overview/', /مدیریت مطب و کلینیک/],
  ['demo', '/demo/', /بررسی تناسب CPMS/],
  ['appointment-reception-queue', '/appointment-reception-queue/', /نوبت/],
  ['patient-record-continuity', '/patient-record-continuity/', /پرونده/],
  ['doctor-workspace', '/doctor-workspace/', /فضای کاری پزشک/],
  ['patient-portal', '/patient-portal/', /پورتال بیمار/],
  ['prescriptions-documents', '/prescriptions-documents/', /نسخه/],
];
for (const [slug] of precedingPages) {
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
  // so the page serves at /faq/ and every outbound route is real.
  wp('rewrite', 'structure', '/%postname%/');
  // Earlier standalone runners temporarily used other pages as the front page.
  // Keep the actual Homepage at / and this page at its own URL.
  const homeId = wp('post', 'list', '--post_type=page', '--name=cpms-home', '--field=ID');
  assert.match(homeId, /^\d+$/);
  wp('option', 'update', 'show_on_front', 'page');
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
    assert.equal(response.status(), 200, `${name}: FAQ page serves successfully`);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.equal(await page.locator('html').getAttribute('lang'), 'fa-IR');
    assert.equal(await page.locator('main').count(), 1);
    assert.equal(await page.locator('h1').count(), 1, 'Exactly one H1');
    assert.match(await page.title(), /CPMS/);
    assert.match(normalize(await page.locator('h1').innerText()), /پرسش‌های مدیران کلینیک/);
    assert.equal(await page.locator('meta[name="description"]').count(), 1);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
    assert.equal(await page.locator('form').count(), 0, 'No form without an authorized endpoint');

    // The bounded question set renders as real headings at every viewport, in order.
    const renderedQuestions = (await page.locator('main h3').allTextContents()).map(normalize);
    assert.equal(renderedQuestions.length, faqQuestions.length, `${name}: every authored question renders as an H3`);
    assert.deepEqual(renderedQuestions, faqQuestions.map(normalize), `${name}: no filler or hidden question appears`);
    for (const question of renderedQuestions) assert(/؟$/.test(question), `${name}: question carries the Persian question mark: ${question}`);
    const groupHeadings = (await page.locator('main h2').allTextContents()).map(normalize);
    assert.deepEqual(groupHeadings, faqGroups.map(g => normalize(g.title)).concat(['پرسش‌های خود را در جلسه مطرح کنید']), `${name}: themes render as H2 in order`);

    // Open layout: no disclosure widget, no interaction script, no fabricated media.
    assert.equal(await page.locator('main details, main summary').count(), 0, 'Answers render open, not collapsed');
    assert.equal(await page.locator('main [aria-expanded]:not(.elementor-button)').count(), 0, 'No disclosure control is added to the FAQ content');
    assert.equal(await page.locator('main .elementor-accordion, main .elementor-toggle').count(), 0, 'No accordion/toggle widget');
    assert.equal(await page.locator('main script').count(), 0, 'No interaction script inside the FAQ content');
    assert.equal(await page.locator('main img, main canvas, main video').count(), 0, 'No fabricated product media');

    // Structured data is deliberately omitted (Google deprecated the FAQ rich result).
    const html = await page.content();
    assert(!/FAQPage|"@type"\s*:\s*"Question"|itemtype="[^"]*FAQPage/i.test(html), 'No FAQ structured data is emitted anywhere on this page');
    assert.equal(await page.locator('main script[type="application/ld+json"], main [itemscope], main [itemtype]').count(), 0, 'No structured data inside the FAQ content');

    // Honesty statements must reach the reader, not only the authored file.
    assert(await page.getByText('قیمت عمومی ثابتی در سایت اعلام نشده است', { exact: false }).count() >= 1, 'Pricing boundary visible');
    assert(await page.getByText('مسیر ثبت درخواست به فروش متصل نشده است', { exact: false }).count() >= 1, 'Non-live request path stated');
    assert(await page.getByText('نوبت‌دهی یک بخش از مسیر مراجعه است، نه تمام محصول', { exact: false }).count() >= 1, 'Not-merely-booking identity stated');
    assert(await page.getByText('معادل حسابداری کامل یا دفتر کل نیست', { exact: false }).count() >= 1, 'Accounting boundary visible');
    assert(await page.getByText('ادعای فعلی CPMS نیست', { exact: false }).count() >= 1, 'National e-prescription / insurance non-claim visible');
    assert(await page.getByText('گواهی امنیتی', { exact: false }).count() >= 1, 'Certification boundary visible');

    const cta = page.locator('main').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true }).first();
    assert.equal(await cta.getAttribute('href'), '/demo/', 'Primary CTA routes to the real Demo page');
    const ctaBox = await cta.boundingBox();
    assert(ctaBox.y + ctaBox.height < height, `${name}: hero CTA must be in first viewport`);
    assert(ctaBox.height >= 44, 'CTA touch size');

    const measures = await page.evaluate(() => ({
      width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
      font: getComputedStyle(document.querySelector('h1')).fontFamily,
      fontLoaded: document.fonts.check('700 30px Vazirmatn'),
      headings: [...document.querySelectorAll('main h1, main h2, main h3')].map(n => ({ tag: n.tagName, text: n.textContent })),
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
      offsiteLinks: [...document.querySelectorAll('main a')].filter(a => a.origin !== location.origin).map(a => a.href),
      crossPageLinks: [...document.querySelectorAll('main a')].filter(a => a.origin === location.origin && a.pathname !== location.pathname && !a.hash).map(a => a.pathname),
      // Claim boundary is checked on rendered text, not only in the authored source.
      renderedStrings: [...document.querySelectorAll('main h1, main h2, main h3, main p')].map(n => n.textContent.trim()).filter(Boolean),
      // Answer measure: a scanning/decision page needs a comfortable, capped line length.
      answers: [...document.querySelectorAll('main .cpms-reading p')].map(p => {
        const style = getComputedStyle(p);
        const box = p.getBoundingClientRect();
        return { font: parseFloat(style.fontSize), line: parseFloat(style.lineHeight), width: box.width, left: box.left, right: box.right };
      }),
      // Theme separator + per-theme reading measure, measured without assuming any
      // particular Elementor container DOM shape (optimized markup may drop wrappers).
      groupRules: [...document.querySelectorAll('#group-understanding, #group-capabilities, #group-data-access, #group-evaluation')].map(section => {
        const ruled = [...section.querySelectorAll('*')].filter(el => parseFloat(getComputedStyle(el).borderTopWidth) >= 1).length;
        const answer = section.querySelector('.cpms-reading p');
        return { id: section.id, ruled, answerWidth: answer ? answer.getBoundingClientRect().width : 0 };
      }),
    }));
    assert(measures.scrollWidth <= measures.width, `${name}: horizontal overflow`);
    assert(measures.font.includes('Vazirmatn') && measures.fontLoaded, 'Local Persian font loaded');
    assert.deepEqual(measures.brokenAnchors, []);
    assert.deepEqual(measures.offsiteLinks, [], 'No external links');
    const crossRoutes = new Set(measures.crossPageLinks);
    const allowedRoutes = new Set(['/demo/', '/product-overview/', '/appointment-reception-queue/', '/patient-record-continuity/', '/patient-portal/', '/prescriptions-documents/']);
    for (const route of crossRoutes) assert(allowedRoutes.has(route), `Unexpected cross-page link: ${route}`);
    for (const route of ['/demo/', '/product-overview/']) assert(crossRoutes.has(route), `Expected conversion route missing: ${route}`);

    // Heading order: one H1, then grouped H2s with their H3 questions, no skipped level.
    const levels = measures.headings.map(h => Number(h.tag.slice(1)));
    assert.equal(levels[0], 1, 'H1 precedes subsection headings');
    assert(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1), 'No skipped heading levels');

    // Comfortable, capped answer measure at every viewport.
    assert(measures.answers.length >= faqAnswers.length, `Answer paragraphs must be measurable (${measures.answers.length})`);
    const readingAnswers = measures.answers.filter(a => a.width > 0);
    assert(readingAnswers.length > 0, 'Reading measurements must not be vacuous');
    const minAnswerWidth = Math.min(...readingAnswers.map(a => a.width));
    const maxAnswerWidth = Math.max(...readingAnswers.map(a => a.width));
    if (width < 768) {
      assert(minAnswerWidth >= 300, `${name}: mobile answers must not sit in narrow nested columns (${Math.round(minAnswerWidth)}px)`);
      for (const answer of readingAnswers) {
        assert(answer.font >= 17, 'Answers stay at reading size on mobile');
        assert(answer.line / answer.font >= 1.85, 'Answers keep Persian-friendly leading on mobile');
      }
    } else {
      assert(maxAnswerWidth <= 760, `${name}: answer measure must stay capped (${Math.round(maxAnswerWidth)}px)`);
      assert(minAnswerWidth >= 600, `${name}: answers must use the accepted reading column (${Math.round(minAnswerWidth)}px)`);
    }
    assert.equal(measures.groupRules.length, faqGroups.length, 'Every theme renders as its own band');
    for (const rule of measures.groupRules) {
      assert(rule.ruled >= 1, `${name}: each theme keeps its restrained separator (${rule.id})`);
      assert(rule.answerWidth > 0 && rule.answerWidth <= 760, `${name}: every theme's answer stays in a readable measure (${rule.id}: ${Math.round(rule.answerWidth)}px)`);
    }
    diagnostic.views.push({ name, width, height, ...measures, renderedStrings: undefined, minAnswerWidth, maxAnswerWidth, ctaBox });

    // Boundary guardrails run against what WordPress actually rendered.
    assertNoHardForbidden(measures.renderedStrings, `FAQ rendered copy (${name})`);
    assertBoundaryTermsNegated(measures.renderedStrings, `FAQ rendered copy (${name})`);
    assertPersianTypography(measures.renderedStrings, `FAQ rendered copy (${name})`);

    console.log(`::notice title=FAQ composition ${name}::PASS: ${renderedQuestions.length} open questions in ${measures.groupRules.length} themes; answer measure ${Math.round(minAnswerWidth)}–${Math.round(maxAnswerWidth)}px; no disclosure widget, no structured data, no fabricated media`);
    await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
    await page.screenshot({ path: resolve(out, `${name}-viewport.png`) });
    // Keyboard reachability through the real shell, then visible focus on the CTA.
    let ctaFocused = false;
    for (let tab = 0; tab < 14 && !ctaFocused; tab++) {
      await page.keyboard.press('Tab');
      ctaFocused = await cta.evaluate(a => a === document.activeElement);
    }
    assert(ctaFocused, 'CTA reachable by keyboard in reading order');
    assert(await cta.evaluate(a => getComputedStyle(a).outlineStyle !== 'none'), 'Visible keyboard focus');
  }

  // Every bound answer renders as open, readable text (the layout must not hide or truncate content).
  const readingParagraphs = await page.evaluate(() => [...document.querySelectorAll('main .cpms-reading p')].map(p => p.textContent.trim()));
  const renderedAnswers = faqAnswers.map(answer => {
    const needle = stripTags(answer).replace(/\s+/g, ' ').slice(0, 60);
    const hit = readingParagraphs.map(t => t.replace(/\s+/g, ' ')).find(text => text.includes(needle));
    assert(hit, `Every answer renders openly and in full: ${needle}…`);
    return hit;
  });
  assert.equal(new Set(renderedAnswers).size, faqAnswers.length, 'Each question carries its own open answer');
  assertObjectionPageShape(renderedAnswers, 'FAQ rendered answers');
  assertBoundaryTermsNegated(renderedAnswers, 'FAQ rendered answers');
  assertNoHardForbidden(readingParagraphs, 'FAQ rendered reading copy');

  // CTA destination is the real Demo page.
  await page.locator('main').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true }).first().click();
  await page.waitForURL(/\/demo\/?$/);
  assert.match(await page.locator('h1').innerText(), /بررسی تناسب CPMS/, 'CTA destination is the real Demo/Consultation page');
  assert.equal(await page.locator('form').count(), 1, 'Demo page keeps its own qualification form (non-live, unchanged)');

  // Contextual destinations are reached by clicking this page's own links.
  async function followFromFaq(linkName, destination, expectedTitle) {
    await page.goto(pageUrl, { waitUntil: 'networkidle' });
    await page.locator('main').getByRole('link', { name: linkName, exact: true }).first().click();
    await page.waitForURL(new RegExp(`${destination}/?$`));
    assert.equal(await page.locator('h1').count(), 1, `${destination} serves one H1`);
    assert.match(normalize(await page.locator('h1').innerText()), expectedTitle, `${linkName}: the link reaches the real ${destination} page`);
  }
  await followFromFaq('معرفی محصول', '/product-overview', /مدیریت مطب و کلینیک/);
  await followFromFaq('نوبت، پذیرش و صف', '/appointment-reception-queue', /نوبت/);
  await followFromFaq('پروندهٔ بیمار و تداوم اطلاعات', '/patient-record-continuity', /پرونده/);
  await followFromFaq('پورتال بیمار', '/patient-portal', /پورتال بیمار/);
  await followFromFaq('نسخه‌ها و اسناد در CPMS', '/prescriptions-documents', /نسخه/);
  await followFromFaq('صفحهٔ دمو و مشاوره', '/demo', /بررسی تناسب CPMS/);

  // Every earlier page (including the actual Homepage at the root) still serves its own authored H1.
  const sweep = [];
  for (const [slug, path, expected] of precedingPages) {
    const earlier = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    assert.equal(earlier.status(), 200, `${slug} still serves`);
    assert.equal(await page.locator('h1').count(), 1, `${slug} still serves one H1`);
    assert.match(normalize(await page.locator('h1').innerText()), expected, `${slug} still serves its own authored H1`);
    sweep.push({ slug, path, status: earlier.status() });
  }
  diagnostic.earlierPages = sweep;

  assert.deepEqual(diagnostic.frontendErrors, [], 'Frontend console/page errors');
  assert.deepEqual(diagnostic.failedRequests, [], 'Failed frontend requests');
  assert.deepEqual(diagnostic.badResponses, [], 'Frontend HTTP errors');
  assert.deepEqual(diagnostic.externalRequests, [], 'No remote fonts/scripts/media');
  await visitor.close();
  diagnostic.result = 'PASS';
  console.log(`::notice title=FAQ page proof::PASS: persisted and reopened native Elementor page ${id}; ${all.length} elements; ${faqQuestions.length} open questions in ${faqGroups.length} themes; HTTP/RTL/H1/metadata/local-font/focus/CTA/measure/overflow/no-structured-data/claim-boundary/network checks at all four viewports; every outbound route clicked; all eight earlier pages verified; runtime ${JSON.stringify(state)}`);
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
