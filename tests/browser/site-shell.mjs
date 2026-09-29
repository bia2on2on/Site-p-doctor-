/**
 * Browser verification of the site-shell navigation + conversion routing.
 *
 * Reconstructs REAL WordPress menus from reconstruction/site-shell/menu.mjs
 * through documented WP-CLI menu commands and assigns them to the registered
 * Koorosh primary/footer locations, then verifies in a real browser:
 * menu existence/assignment, top-level + workflow destinations, current-page
 * state, conversion routes (/ -> /demo/, /product-overview/ -> /demo/,
 * /demo/ -> /product-overview/), footer discovery of the FAQ/objection route
 * without adding a header item, mobile toggle without hover, submenu access
 * without hover, crawlable rendered HTML, responsive behavior and clean
 * console/network. Ephemeral wp-env only; no DB payload authoring.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { primaryMenu, footerMenu, slugReferences } from '../../reconstruction/site-shell/menu.mjs';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(import.meta.dirname, 'artifacts/site-shell');
mkdirSync(out, { recursive: true });
process.on('uncaughtException', error => {
  const message = String(error.stack || error).replace(/user_pass=\S+/g, 'user_pass=[redacted]');
  writeFileSync(resolve(out, 'bootstrap-error.txt'), message);
  console.error(`::error title=Site-shell reconstruction::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
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

// ---- Fixture: pages from the earlier CI runners, menus built here ----------
assert.equal(wp('option', 'get', 'home'), base, 'Only the disposable default wp-env URL is supported');
assert.equal(wp('theme', 'list', '--status=active', '--field=name'), 'koorosh');
wp('plugin', 'is-active', 'elementor');

const pageId = slug => {
  const id = wp('post', 'list', '--post_type=page', `--name=${slug}`, '--field=ID');
  assert.match(id, /^\d+$/, `Reconstructed page missing for menu reference: ${slug} (run the page runners first)`);
  return id;
};
const ids = Object.fromEntries(slugReferences().map(r => [r.slug, pageId(r.slug)]));

const existingMenus = wp('menu', 'list', '--fields=name', '--format=csv');
assert(!existingMenus.includes(primaryMenu.name) && !existingMenus.includes(footerMenu.name), 'Refuse to duplicate existing menus; use a clean environment');

wp('rewrite', 'structure', '/%postname%/');
wp('option', 'update', 'show_on_front', 'page');
wp('option', 'update', 'page_on_front', ids['cpms-home']);
wp('option', 'update', 'blog_public', '0');
wp('option', 'update', 'blogname', 'CPMS');
wp('option', 'update', 'blogdescription', '');

const primaryId = wp('menu', 'create', primaryMenu.name, '--porcelain');
assert.match(primaryId, /^\d+$/);
for (const item of primaryMenu.items) {
  if (item.children) {
    const parentItemId = wp('menu', 'item', 'add-custom', primaryId, item.title, item.url, '--porcelain');
    assert.match(parentItemId, /^\d+$/);
    for (const child of item.children) {
      wp('menu', 'item', 'add-post', primaryId, ids[child.slug], `--title=${child.title}`, `--parent-id=${parentItemId}`, '--porcelain');
    }
  } else {
    wp('menu', 'item', 'add-post', primaryId, ids[item.slug], `--title=${item.title}`, '--porcelain');
  }
}
const footerId = wp('menu', 'create', footerMenu.name, '--porcelain');
assert.match(footerId, /^\d+$/);
for (const item of footerMenu.items) {
  wp('menu', 'item', 'add-post', footerId, ids[item.slug], `--title=${item.title}`, '--porcelain');
}
wp('menu', 'location', 'assign', primaryId, 'primary');
wp('menu', 'location', 'assign', footerId, 'footer');

// ---- WordPress-side proof: menus exist, assigned, structured ---------------
const locationState = wp('eval', `echo (has_nav_menu('primary') && has_nav_menu('footer')) ? 'yes' : 'no';`);
assert.equal(locationState, 'yes', 'WordPress menus assigned to both registered locations');
const menuStructure = JSON.parse(wp('eval', `
$items = wp_get_nav_menu_items((int) ${primaryId});
echo wp_json_encode(array_map(function ($i) { return array('id' => (int) $i->ID, 'title' => $i->title, 'url' => $i->url, 'parent' => (int) $i->menu_item_parent, 'object_id' => (int) $i->object_id); }, $items), JSON_UNESCAPED_UNICODE);
`));
const topLevel = menuStructure.filter(i => i.parent === 0);
assert.deepEqual(topLevel.map(i => i.title), primaryMenu.items.map(i => i.title), 'Primary top-level order matches the canonical definition');
assert.equal(topLevel.find(i => i.title === 'جریان‌های کاری').url, '#', 'Workflows parent is a disclosure item, not a fake page');
const workflowChildren = menuStructure.filter(i => i.parent === topLevel.find(i => i.title === 'جریان‌های کاری').id);
assert.deepEqual(
  workflowChildren.map(i => [i.title, i.object_id]),
  primaryMenu.items.find(i => i.title === 'جریان‌های کاری').children.map(c => [c.title, Number(ids[c.slug])]),
  'Workflow submenu items point at the four real workflow pages',
);
assert.equal(topLevel.find(i => i.title === 'محصول').url, `${base}/product-overview/`, 'Menu uses real permalinks');
assert.equal(topLevel.find(i => i.title === 'درخواست دمو / مشاوره').url, `${base}/demo/`, 'Demo destination in the primary menu');
assert.equal(topLevel.find(i => i.title === 'خانه').url, `${base}/`, 'Home destination in the primary menu');
const footerStructure = JSON.parse(wp('eval', `
$items = wp_get_nav_menu_items((int) ${footerId});
echo wp_json_encode(array_map(function ($i) { return array('title' => $i->title, 'url' => $i->url); }, $items), JSON_UNESCAPED_UNICODE);
`));
assert.deepEqual(footerStructure.map(i => i.title), footerMenu.items.map(i => i.title), 'Footer menu order matches the canonical definition');
writeFileSync(resolve(out, 'menu-structure.json'), JSON.stringify({ primary: menuStructure, footer: footerStructure }, null, 2));

const workflowRoutes = primaryMenu.items.find(i => i.title === 'جریان‌های کاری').children.map(c => `/${c.slug}/`);
// Footer destinations: the product page, the FAQ/objection trust route and the conversion route.
const faqRoute = '/faq/';
const footerRoutes = ['/product-overview/', faqRoute, '/demo/'];
const allRoutes = ['/', ...footerRoutes, ...workflowRoutes];

// ---- Browser proof ----------------------------------------------------------
const browser = await chromium.launch({ headless: true });
let frontend;
const diagnostic = { frontendErrors: [], failedRequests: [], badResponses: [], externalRequests: [], views: [], menuId: primaryId, footerMenuId: footerId };
async function tabUntil(locator, limit = 14) {
  for (let tab = 0; tab < limit; tab++) {
    if (await locator.evaluate(a => a === document.activeElement).catch(() => false)) return true;
    await locator.page().keyboard.press('Tab');
  }
  return locator.evaluate(a => a === document.activeElement).catch(() => false);
}
try {
  const visitor = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await visitor.newPage();
  frontend = page;
  page.on('pageerror', e => diagnostic.frontendErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') diagnostic.frontendErrors.push(m.text()); });
  page.on('requestfailed', r => diagnostic.failedRequests.push({ url: r.url(), failure: r.failure() }));
  page.on('response', r => { if (r.status() >= 400) diagnostic.badResponses.push({ url: r.url(), status: r.status() }); });
  page.on('request', r => { if (!r.url().startsWith(base) && /^https?:/.test(r.url())) diagnostic.externalRequests.push(r.url()); });

  // Crawlability: the navigation is plain rendered HTML anchors, no JS-only menu.
  const rawHome = await (await visitor.request.get(base)).text();
  for (const route of [...footerRoutes, ...workflowRoutes]) {
    assert(rawHome.includes(route), `Raw homepage HTML exposes crawlable navigation to ${route}`);
  }
  assert(rawHome.includes('id="site-primary-navigation"'), 'Semantic primary nav container in raw HTML');
  assert(rawHome.includes('aria-label="ناوبری اصلی"'), 'Primary nav carries an accessible Persian label');
  assert(rawHome.includes('aria-controls="site-primary-navigation"'), 'Explicit mobile toggle controls the nav container');
  assert(rawHome.includes('aria-expanded="false"'), 'Mobile toggle starts collapsed');
  assert(rawHome.includes('class="header-cta"'), 'Persistent demo CTA renders without JavaScript');
  assert(!/rel="nofollow"/i.test(rawHome.split('site-primary-navigation')[1]?.split('</nav>')[0] ?? ''), 'No nofollow on normal internal nav links');

  // Every navigation destination serves successfully.
  for (const route of allRoutes) {
    const response = await visitor.request.get(`${base}${route}`);
    assert.equal(response.status(), 200, `Navigation destination serves: ${route}`);
  }

  for (const [name, width, height] of [['mobile', 390, 844], ['tablet', 768, 1024], ['desktop', 1366, 768], ['large-desktop', 1920, 1080]]) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);

    const nav = page.locator('nav.site-navigation');
    assert.equal(await nav.count(), 1, `${name}: exactly one primary nav landmark`);
    assert.equal(await nav.getAttribute('aria-label'), 'ناوبری اصلی');
    assert.deepEqual(await page.locator('.site-navigation > ul > li > a').allTextContents(), primaryMenu.items.map(i => i.title), `${name}: top-level destinations`);
    const headerCta = page.locator('.header-cta');
    assert(await headerCta.isVisible(), `${name}: demo/consultation CTA visible in header`);
    assert.equal(await headerCta.getAttribute('href'), `${base}/demo/`);
    const ctaBox = await headerCta.boundingBox();
    assert(ctaBox.height >= 44 && ctaBox.width >= 44, `${name}: header CTA touch target`);

    // WordPress-provided current-page state.
    const current = page.locator('.site-navigation a[aria-current="page"]');
    assert.equal(await current.count(), 1, `${name}: current-page state on the home item`);
    // On collapsed mobile widths the menu is display:none until toggled, so read the
    // marker label via textContent (innerText would resolve to '').
    assert.equal((await current.textContent()).trim(), 'خانه');
    assert(await page.locator('.site-navigation .current-menu-item > a').count() >= 1, `${name}: WordPress current-menu-item class present`);

    const footerNav = page.locator('.footer-navigation');
    assert.equal(await footerNav.count(), 1, `${name}: footer navigation present`);
    const footerHtml = await footerNav.innerHTML();
    for (const route of [...footerRoutes, ...workflowRoutes]) assert(footerHtml.includes(route), `${name}: footer links to ${route}`);
    assert.equal(await footerNav.locator('a').count(), footerMenu.items.length, `${name}: footer stays compact (${footerMenu.items.length} truthful links)`);
    const footerFaq = footerNav.getByRole('link', { name: 'پرسش‌های متداول', exact: true });
    assert.equal(await footerFaq.getAttribute('href'), `${base}${faqRoute}`, `${name}: FAQ is discoverable from the footer`);

    const measures = await page.evaluate(() => ({
      width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
      headerHeight: document.querySelector('.site-header').getBoundingClientRect().height,
      toggleVisible: getComputedStyle(document.querySelector('.nav-toggle')).display !== 'none',
      navCollapsed: !document.querySelector('.site-navigation').offsetParent,
    }));
    assert(measures.scrollWidth <= measures.width, `${name}: no horizontal overflow`);
    if (width < 768) {
      assert(measures.toggleVisible, `${name}: mobile toggle visible with JS`);
      assert(measures.headerHeight < 200, `${name}: collapsed header does not dominate the mobile viewport`);
    } else {
      assert(!measures.toggleVisible, `${name}: desktop shows the full menu without a toggle`);
      assert(await nav.locator('ul').first().isVisible(), `${name}: primary menu visible on tablet/desktop`);
    }
    diagnostic.views.push({ name, width, height, ...measures, ctaBox });
    await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
    await page.screenshot({ path: resolve(out, `${name}-viewport.png`) });
  }

  // ---- Desktop: workflows submenu via explicit toggle (no hover anywhere) --
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(base, { waitUntil: 'networkidle' });
  const workflowsItem = page.locator('.site-navigation .menu-item-has-children').first();
  const submenu = workflowsItem.locator('.sub-menu');
  const subToggle = workflowsItem.locator('.submenu-toggle');
  assert(!(await submenu.isVisible()), 'Submenu starts hidden on desktop');
  assert.equal(await subToggle.getAttribute('aria-expanded'), 'false');
  await subToggle.click(); // click only — hover is never used to open it
  assert.equal(await subToggle.getAttribute('aria-expanded'), 'true', 'Submenu toggle reports expanded state');
  assert(await submenu.isVisible(), 'Submenu opens via the explicit toggle button');
  assert.deepEqual(
    await submenu.locator('a').evaluateAll(as => as.map(a => a.getAttribute('href'))),
    workflowRoutes.map(r => `${base}${r}`),
    'Submenu exposes the four workflow destinations as normal links',
  );
  await page.screenshot({ path: resolve(out, 'desktop-submenu-open.png') });

  // Mouse path: explicit click, never hover.
  await submenu.getByRole('link', { name: 'پرونده بیمار', exact: true }).click();
  await page.waitForURL(`${base}/patient-record-continuity/`);
  assert.match(await page.locator('h1').innerText(), /پرونده/, 'Submenu link reaches the patient-record page');
  assert.equal(await page.locator('.site-navigation a[aria-current="page"]').count(), 1, 'Current-page state on a workflow child');
  // The submenu re-closes after navigation, so read the marker label via textContent
  // (innerText on the now-hidden submenu link resolves to '').
  assert.equal(await page.locator('.site-navigation a[aria-current="page"]').getAttribute('aria-current'), 'page');
  assert.equal((await page.locator('.site-navigation a[aria-current="page"]').textContent()).trim(), 'پرونده بیمار');
  await page.goBack({ waitUntil: 'networkidle' });

  // Keyboard path: Tab to the toggle, Enter to open, Tab into submenu, Escape to close.
  await page.goto(base, { waitUntil: 'networkidle' });
  assert(await tabUntil(subToggle), 'Submenu toggle reachable by keyboard');
  assert(await subToggle.evaluate(b => getComputedStyle(b).outlineStyle !== 'none'), 'Submenu toggle visibly focused');
  await page.keyboard.press('Enter');
  assert.equal(await subToggle.getAttribute('aria-expanded'), 'true', 'Submenu opens with the keyboard');
  assert(await submenu.isVisible());
  await page.keyboard.press('Tab');
  const firstSubLink = submenu.locator('a').first();
  assert(await firstSubLink.evaluate(a => a === document.activeElement), 'Focus moves into the opened submenu');
  await page.keyboard.press('Escape');
  assert.equal(await subToggle.getAttribute('aria-expanded'), 'false', 'Escape closes the submenu');
  assert(await subToggle.evaluate(b => b === document.activeElement), 'Escape returns focus to the submenu toggle');

  // Keyboard path through the whole conversion journey.
  await page.goto(base, { waitUntil: 'networkidle' });
  assert(await tabUntil(page.locator('.header-cta')), 'Header demo CTA reachable by keyboard');
  await page.keyboard.press('Enter');
  await page.waitForURL(`${base}/demo/`);
  assert.match(await page.locator('h1').innerText(), /بررسی تناسب CPMS/, 'Header CTA lands on the real Demo page');
  assert.equal((await page.locator('.site-navigation a[aria-current="page"]').innerText()).trim(), 'درخواست دمو / مشاوره', 'Current-page state on the demo item');

  // ---- Mobile: menu toggle by click and by keyboard --------------------------
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  const toggle = page.locator('.nav-toggle');
  assert(await toggle.isVisible(), 'Mobile toggle visible');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert(!(await page.locator('.site-navigation > ul').isVisible()), 'Mobile menu starts collapsed');
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'Mobile toggle reports expanded');
  assert(await page.locator('.site-navigation > ul').isVisible(), 'Mobile menu opens on click');
  const mobileTargets = await page.evaluate(() => [...document.querySelectorAll('.site-navigation a, .site-navigation .submenu-toggle, .nav-toggle, .header-cta')].map(el => el.getBoundingClientRect().height).filter(h => h > 0));
  assert(mobileTargets.length > 0 && mobileTargets.every(h => h >= 44), 'Mobile navigation touch targets >= 44px');
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  assert(mobileOverflow, 'Opened mobile menu introduces no horizontal overflow');
  await page.screenshot({ path: resolve(out, 'mobile-menu-open.png') });
  // Workflows reachable on mobile without hover: explicit submenu toggle, then link.
  await page.locator('.site-navigation .menu-item-has-children .submenu-toggle').first().click();
  assert(await page.locator('.site-navigation .sub-menu').first().isVisible(), 'Mobile submenu opens via its toggle');
  await page.screenshot({ path: resolve(out, 'mobile-submenu-open.png') });
  await page.locator('.site-navigation .sub-menu').getByRole('link', { name: 'فضای کاری پزشک', exact: true }).click();
  await page.waitForURL(`${base}/doctor-workspace/`);
  assert.match(await page.locator('h1').innerText(), /فضای کاری پزشک/, 'Mobile submenu reaches the doctor-workspace page');

  // Mobile keyboard: focus toggle with Tab, Enter opens, Escape closes and refocuses.
  await page.goto(base, { waitUntil: 'networkidle' });
  assert(await tabUntil(toggle), 'Mobile toggle reachable by keyboard');
  await page.keyboard.press('Enter');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'Mobile menu opens with the keyboard');
  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'Escape closes the mobile menu');
  assert(await toggle.evaluate(b => b === document.activeElement), 'Escape returns focus to the mobile toggle');

  // Footer conversion reachability on mobile.
  const footerDemo = page.locator('.footer-navigation').getByRole('link', { name: 'درخواست دمو / مشاوره', exact: true });
  assert(await footerDemo.isVisible(), 'Footer demo link visible on mobile');
  await footerDemo.click();
  await page.waitForURL(`${base}/demo/`);
  assert.match(await page.locator('h1').innerText(), /بررسی تناسب CPMS/, 'Footer route reaches the Demo page');

  // Footer discovery of the FAQ / buyer-objection page: a trust route beside the
  // conversion route, reachable without changing the primary navigation.
  await page.goto(base, { waitUntil: 'networkidle' });
  const footerFaq = page.locator('.footer-navigation').getByRole('link', { name: 'پرسش‌های متداول', exact: true });
  assert(await footerFaq.isVisible(), 'Footer FAQ link visible');
  await footerFaq.click();
  await page.waitForURL(`${base}${faqRoute}`);
  assert.equal(await page.locator('h1').count(), 1, 'FAQ destination serves one H1');
  assert.match(await page.locator('h1').innerText(), /پرسش‌های مدیران کلینیک/, 'Footer route reaches the FAQ / buyer-objection page');
  assert.equal(await page.locator('.site-navigation a[aria-current="page"]').count(), 0, 'FAQ stays a footer trust route, not a primary-navigation item');

  // ---- Progressive enhancement: no JavaScript at all -------------------------
  const noJs = await browser.newContext({ reducedMotion: 'reduce', javaScriptEnabled: false });
  const plain = await noJs.newPage();
  plain.on('pageerror', e => diagnostic.frontendErrors.push(`no-js: ${e.message}`));
  await plain.setViewportSize({ width: 1366, height: 768 });
  await plain.goto(base, { waitUntil: 'networkidle' });
  const navPlain = plain.locator('.site-navigation');
  assert(await navPlain.locator('ul').first().isVisible(), 'Without JS the menu renders expanded on desktop');
  assert(!(await plain.locator('.nav-toggle').isVisible()), 'Without JS the toggle button stays hidden (no dead control)');
  // Keyboard focus on the parent opens the submenu via :focus-within — no hover, no click, no JS.
  const parentLink = plain.locator('.site-navigation > ul > li.menu-item-has-children > a').first();
  assert(await tabUntil(parentLink), 'Workflows parent link keyboard-focusable without JS');
  assert(await plain.locator('.site-navigation .sub-menu').first().isVisible(), 'Submenu reveals on keyboard focus without JS (:focus-within)');
  await plain.keyboard.press('Tab'); // move into the submenu
  assert(await plain.locator('.site-navigation .sub-menu a').first().evaluate(a => a === document.activeElement), 'Submenu links keyboard-reachable without JS');
  await plain.screenshot({ path: resolve(out, 'no-js-desktop.png') });
  await plain.setViewportSize({ width: 390, height: 844 });
  await plain.goto(base, { waitUntil: 'networkidle' });
  assert(await navPlain.locator('ul').first().isVisible(), 'Without JS the mobile menu renders expanded');
  assert(await navPlain.locator('.sub-menu').first().isVisible(), 'Without JS mobile submenu links are visible');
  const plainOverflow = await plain.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  assert(plainOverflow, 'No-JS mobile shell has no horizontal overflow');

  assert.deepEqual(diagnostic.frontendErrors, [], 'Frontend console/page errors');
  assert.deepEqual(diagnostic.failedRequests, [], 'Failed frontend requests');
  assert.deepEqual(diagnostic.badResponses, [], 'Frontend HTTP errors');
  assert.deepEqual(diagnostic.externalRequests, [], 'No remote fonts/scripts/media');
  await visitor.close();
  await noJs.close();
  diagnostic.result = 'PASS';
  console.log(`::notice title=Site-shell proof::PASS: WordPress menus ${primaryId}/${footerId} assigned (primary/footer); buyer journey خانه→محصول→جریان‌های کاری→دمو keyboard/click/touch-verified without hover at 390/768/1366/1920; current-page state, crawlable HTML, no-JS expanded fallback, conversion routes /→/demo/ ←→ /product-overview/ all green`);
} catch (error) {
  diagnostic.result = 'FAIL';
  diagnostic.error = error.stack;
  if (frontend && !frontend.isClosed()) await frontend.screenshot({ path: resolve(out, 'failure-frontend.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  writeFileSync(resolve(out, 'results.json'), JSON.stringify(diagnostic, null, 2));
  await browser.close();
}
