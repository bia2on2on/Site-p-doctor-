/** Playwright checks for the ZIP-derived React homepage and retained Theme Settings prototype. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../visual-preview/', import.meta.url)));
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const requestedBase = process.env.VISUAL_PREVIEW_BASE_URL;
let server = null;
let base;
if (!requestedBase) {
  server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    if (pathname === '/favicon.ico') {
      response.writeHead(204);
      response.end();
      return;
    }
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filename = resolve(root, relative);
    if (filename !== root && !filename.startsWith(`${root}${sep}`)) {
      response.writeHead(403);
      response.end('forbidden');
      return;
    }
    if (!existsSync(filename) || !statSync(filename).isFile()) {
      response.writeHead(404);
      response.end('not found');
      return;
    }
    response.writeHead(200, {
      'content-type': mime[extname(filename)] || 'application/octet-stream',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    });
    createReadStream(filename).pipe(response);
  });
}

if (requestedBase) {
  const configuredUrl = new URL(requestedBase);
  assert(['http:', 'https:'].includes(configuredUrl.protocol), 'published preview URL must use HTTP(S)');
  assert.equal(configuredUrl.username, '', 'published preview URL has no embedded credentials');
  assert.equal(configuredUrl.password, '', 'published preview URL has no embedded credentials');
  assert.equal(configuredUrl.search, '', 'published preview URL has no query string');
  assert.equal(configuredUrl.hash, '', 'published preview URL has no fragment');
  base = `${configuredUrl.origin}${configuredUrl.pathname.replace(/\/+$/, '')}`;
} else {
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  base = `http://127.0.0.1:${address.port}`;
}
const baseUrl = new URL(base);
const basePath = `${baseUrl.pathname.replace(/\/+$/, '')}/`;
const pageUrl = (path) => new URL(path.replace(/^\/+/, ''), `${base}/`).href;
let browser;
const diagnostics = {
  consoleErrors: [],
  pageErrors: [],
  failedRequests: [],
  badResponses: [],
  externalRequests: [],
  outOfBaseRequests: [],
  requests: [],
};

function watch(page) {
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  page.on('requestfailed', (request) => diagnostics.failedRequests.push(`${request.url()}: ${request.failure()?.errorText || 'failed'}`));
  page.on('response', (response) => {
    const responseUrl = new URL(response.url());
    if (response.status() >= 400 && responseUrl.pathname !== '/favicon.ico') diagnostics.badResponses.push(`${response.status()} ${response.url()}`);
  });
  page.on('request', (request) => {
    if (!/^https?:/i.test(request.url())) return;
    diagnostics.requests.push(request.url());
    const requestUrl = new URL(request.url());
    if (requestUrl.origin !== baseUrl.origin) diagnostics.externalRequests.push(request.url());
    else if (!requestUrl.pathname.startsWith(basePath) && requestUrl.pathname !== '/favicon.ico') diagnostics.outOfBaseRequests.push(request.url());
  });
}

async function assertNoOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert(metrics.document <= metrics.viewport + 1, `${label}: viewport has horizontal page scroll (${JSON.stringify(metrics)})`);
}

const viewportMatrix = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

async function waitForHome(page) {
  await page.locator('main h1').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
}

async function revealPage(page) {
  await page.evaluate(async () => {
    const step = Math.max(260, Math.floor(innerHeight * 0.72));
    const bottom = document.documentElement.scrollHeight;
    for (let y = 0; y < bottom; y += step) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
    }
    scrollTo({ top: 0, behavior: 'instant' });
    await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
  });
}

async function captureReviewScreenshots() {
  const screenshotDir = resolve(import.meta.dirname, 'artifacts/visual-preview/screenshots');
  mkdirSync(screenshotDir, { recursive: true });
  const capture = await browser.newPage({ reducedMotion: 'reduce' });
  watch(capture);

  for (const viewport of viewportMatrix) {
    await capture.setViewportSize(viewport);
    const response = await capture.goto(pageUrl(''), { waitUntil: 'domcontentloaded' });
    assert.equal(response?.status(), 200, `homepage screenshot source returns HTTP 200 at ${viewport.width}px`);
    await waitForHome(capture);
    await revealPage(capture);
    await assertNoOverflow(capture, `homepage screenshot ${viewport.width}×${viewport.height}`);
    const path = resolve(screenshotDir, `homepage-${viewport.width}x${viewport.height}.jpg`);
    await capture.screenshot({ path, type: 'jpeg', quality: 88, fullPage: true, animations: 'disabled', caret: 'hide' });
    console.log(`[SCREENSHOT] ZIP-derived homepage ${viewport.width}×${viewport.height}: ${path}`);
  }

  for (const viewport of viewportMatrix) {
    await capture.setViewportSize(viewport);
    const response = await capture.goto(pageUrl('theme-settings.html'), { waitUntil: 'domcontentloaded' });
    assert.equal(response?.status(), 200, `Theme Settings screenshot source returns HTTP 200 at ${viewport.width}px`);
    await capture.evaluate(() => document.fonts.ready);
    await assertNoOverflow(capture, `Theme Settings screenshot ${viewport.width}×${viewport.height}`);
    const path = resolve(screenshotDir, `theme-settings-${viewport.width}x${viewport.height}.jpg`);
    await capture.screenshot({ path, type: 'jpeg', quality: 88, fullPage: true, animations: 'disabled', caret: 'hide' });
    console.log(`[SCREENSHOT] Theme Settings ${viewport.width}×${viewport.height}: ${path}`);
  }
  await capture.close();
}

try {
  const launchOptions = { headless: true };
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  watch(page);

  let response = await page.goto(pageUrl(''), { waitUntil: 'domcontentloaded' });
  assert.equal(response?.status(), 200, 'homepage returns HTTP 200');
  await waitForHome(page);
  assert.match(await page.title(), /CPMS.*مدیریت مطب و کلینیک/);
  assert.equal(await page.locator('html').getAttribute('lang'), 'fa');
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
  assert.equal(await page.locator('main h1').count(), 1, 'React homepage has one visible H1');
  assert.match(await page.locator('#preview-notice').innerText(), /پیش‌نمایش طراحی — نسخه نهایی سایت نیست/);
  for (const id of ['top', 'features', 'portals', 'workflow', 'scenarios', 'backups', 'architecture', 'compare', 'story', 'faq', 'demo']) {
    assert.equal(await page.locator(`main section#${id}`).count(), 1, `ZIP-derived section #${id} renders once`);
  }
  assert.equal(await page.locator('main section').count(), 11, 'the ZIP homepage keeps its eleven main sections');
  assert.equal(await page.locator('img, iframe, video').count(), 0, 'the ZIP mock UI is rendered without external or real-media assets');
  assert.equal(await page.locator('a[href^="#"]').evaluateAll((links) => links.every((link) => document.getElementById(link.hash.slice(1)))), true, 'all in-page links have rendered targets');

  const fontFamilies = await page.locator('body').evaluate((node) => getComputedStyle(node).fontFamily);
  assert.match(fontFamilies, /Vazirmatn/);
  assert.equal(await page.evaluate(() => document.fonts.check('400 16px Vazirmatn')), true, 'local Vazirmatn variable face covers regular weight');
  assert.equal(await page.evaluate(() => document.fonts.check('700 16px Vazirmatn')), true, 'local Vazirmatn variable face covers bold weight');
  assert.equal(await page.evaluate(() => document.fonts.check('900 16px Vazirmatn')), true, 'local Vazirmatn variable face preserves the ZIP heading weight');
  assert.deepEqual(await page.locator('form').count(), 1, 'the source ZIP CTA remains a local-only interactive form');
  assert.equal(await page.locator('#demo form').getAttribute('action'), null, 'demo form has no submission endpoint');

  // Mobile navigation retains the source ZIP's disclosure interaction.
  const menu = page.locator('header button[aria-label="فهرست"]');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'true', 'mobile navigation opens');
  assert.equal(await page.locator('header a[href="#faq"]').last().isVisible(), true, 'mobile navigation exposes section links');
  await page.locator('header a[href="#faq"]').last().click();
  await page.waitForFunction(() => location.hash === '#faq');
  await assertNoOverflow(page, 'mobile navigation');

  // The interactive portal showcase changes its active role without a network call.
  const portalControls = page.locator('#portals button');
  assert.equal(await portalControls.count(), 4, 'four ZIP-provided portal selectors render');
  await page.locator('#portals').hover();
  await portalControls.nth(1).click();
  assert.match(await page.locator('#portals').innerText(), /صف شلوغ، کنترل آرام/);

  // FAQ controls expand answers, and the CTA only changes local UI state.
  const faqButton = page.locator('#faq button').nth(1);
  await faqButton.click();
  assert.equal(await faqButton.locator('xpath=..').locator('div.grid').evaluate((node) => node.style.gridTemplateRows), '1fr', 'FAQ answer expands on click');
  const requestCountBeforeSubmit = diagnostics.requests.length;
  await page.locator('#demo input').nth(0).fill('نمونه آزمایشی');
  await page.locator('#demo input').nth(1).fill('09120000000');
  await page.locator('#demo button[type="submit"]').click();
  assert.match(await page.locator('#demo').innerText(), /درخواست واقعی ارسال یا ذخیره نشده است/);
  assert.equal(diagnostics.requests.length, requestCountBeforeSubmit, 'submitting the demo form makes no HTTP request');
  assert.deepEqual(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookies: document.cookie })), { local: [], session: [], cookies: '' }, 'demo values are not persisted in browser storage');
  await page.locator('#demo button').click();
  assert.equal(await page.locator('#demo form').count(), 1, 'local demo form can be reopened without sending data');

  // Back-to-top control is keyboard-labelled and scrolls back to the hero.
  await page.evaluate(() => scrollTo({ top: 600, behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelector('button[aria-label="بازگشت به بالای صفحه"]')?.tabIndex === 0);
  await page.locator('button[aria-label="بازگشت به بالای صفحه"]').click();
  await page.waitForFunction(() => scrollY < 10);

  for (const viewport of viewportMatrix) {
    await page.setViewportSize(viewport);
    await assertNoOverflow(page, `homepage responsive check ${viewport.width}×${viewport.height}`);
  }

  // Preserve and exercise all six settings sections and their RTL keyboard behavior.
  await page.setViewportSize({ width: 390, height: 844 });
  response = await page.goto(pageUrl('theme-settings.html'), { waitUntil: 'domcontentloaded' });
  assert.equal(response?.status(), 200, 'Theme Settings returns HTTP 200');
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
  assert.equal(await page.locator('html').getAttribute('lang'), 'fa');
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.match(await page.locator('.admin-review-banner').innerText(), /پیش‌نمایش طراحی — نسخه نهایی سایت نیست/);
  assert.equal(await page.locator('h1').count(), 1, 'Theme Settings has one H1');
  assert.equal(await page.locator('[role="tab"]').count(), 6, 'Theme Settings retains six sections');
  assert.equal(await page.locator('[role="tablist"]').getAttribute('aria-orientation'), 'horizontal', 'mobile Settings navigation uses a horizontal rail');
  assert.equal(await page.locator('#panel-general').isVisible(), true, 'general panel starts selected');
  assert.equal(await page.locator('#panel-contact').isVisible(), false, 'inactive panel is hidden after enhancement');
  await page.locator('#tab-contact').click();
  assert.equal(await page.locator('#tab-contact').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#panel-contact').isVisible(), true);
  await page.locator('#tab-contact').focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#tab-sales').getAttribute('aria-selected'), 'true', 'RTL horizontal tabs respond to ArrowLeft');

  await page.setViewportSize({ width: 1024, height: 768 });
  assert.equal(await page.locator('[role="tablist"]').getAttribute('aria-orientation'), 'horizontal', '1024px Settings retains horizontal tabs');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForFunction(() => document.querySelector('[role="tablist"]')?.getAttribute('aria-orientation') === 'vertical');
  await page.locator('#tab-sales').focus();
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('#tab-shell').getAttribute('aria-selected'), 'true', 'desktop Settings responds to ArrowDown');
  await page.locator('#tab-status').click();
  assert.equal(await page.locator('#tab-status').getAttribute('aria-selected'), 'true', 'status tab is selected after click');
  const statusText = await page.locator('#panel-status').innerText();
  for (const label of ['فعال', 'غیرفعال', 'نیازمند بررسی', 'تأیید نشده']) assert(statusText.includes(label), `status section retains ${label}`);
  assert.match(statusText, /پذیرش Elementor Pro روی میزبان/);
  assert.match(statusText, /رسانهٔ واقعی محصول/);
  assert.equal(await page.locator('.settings-save-bar button').isDisabled(), true, 'Settings prototype cannot save');
  assert.equal(await page.locator('form').count(), 0, 'Settings prototype has no form endpoint');
  const settingsFilters = await page.locator('.settings-card').evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backdropFilter));
  assert(settingsFilters.length > 0 && settingsFilters.every((filter) => filter === 'none'), 'repeated Settings cards avoid costly backdrop blur');
  await page.waitForFunction(() => {
    const color = getComputedStyle(document.querySelector('#tab-status')).color.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\)/);
    return color && Number(color[2]) > Number(color[1]) * 2 && Number(color[2]) > Number(color[3]) * 1.2;
  });
  const activeTabColor = await page.locator('#tab-status').evaluate((node) => getComputedStyle(node).color);
  assert.match(activeTabColor, /^rgb\(/, `active Settings tab uses the ZIP-aligned mint palette (${activeTabColor})`);

  for (const viewport of viewportMatrix) {
    await page.setViewportSize(viewport);
    await assertNoOverflow(page, `Theme Settings responsive check ${viewport.width}×${viewport.height}`);
  }

  const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  watch(reducedPage);
  await reducedPage.goto(pageUrl(''), { waitUntil: 'domcontentloaded' });
  await waitForHome(reducedPage);
  assert.equal(await reducedPage.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
  const animationDuration = await reducedPage.locator('.animate-floaty').first().evaluate((node) => getComputedStyle(node).animationDuration);
  assert(parseFloat(animationDuration) <= 0.00002, `reduced-motion preference limits animation (${animationDuration})`);
  await reducedContext.close();

  const noJsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false, reducedMotion: 'reduce' });
  const noJsPage = await noJsContext.newPage();
  watch(noJsPage);
  await noJsPage.goto(pageUrl(''), { waitUntil: 'domcontentloaded' });
  assert.equal(await noJsPage.locator('noscript h1').count(), 1, 'no-JavaScript fallback stays readable and labelled');
  assert.match(await noJsPage.locator('noscript').innerText(), /پیش‌نمایش طراحی — نسخه نهایی سایت نیست/);
  await noJsPage.goto(pageUrl('theme-settings.html'), { waitUntil: 'domcontentloaded' });
  assert.equal(await noJsPage.locator('#panel-general').isVisible(), true, 'no-JavaScript Settings retains the first section');
  assert.equal(await noJsPage.locator('#panel-status').isVisible(), true, 'no-JavaScript Settings leaves all sections readable');
  await noJsPage.locator('#tab-sales').click();
  assert.equal(new URL(noJsPage.url()).hash, '#panel-sales', 'no-JavaScript Settings anchors remain usable');
  await noJsContext.close();

  await page.close();
  await captureReviewScreenshots();

  assert.deepEqual(diagnostics.externalRequests, [], `no external requests: ${diagnostics.externalRequests.join(', ')}`);
  assert.deepEqual(diagnostics.failedRequests, [], `no failed requests: ${diagnostics.failedRequests.join(', ')}`);
  assert.deepEqual(diagnostics.badResponses, [], `no broken local responses: ${diagnostics.badResponses.join(', ')}`);
  assert.deepEqual(diagnostics.outOfBaseRequests, [], `no same-origin requests escape the Pages project path: ${diagnostics.outOfBaseRequests.join(', ')}`);
  assert.deepEqual(diagnostics.consoleErrors, [], `no browser console errors: ${diagnostics.consoleErrors.join(' | ')}`);
  assert.deepEqual(diagnostics.pageErrors, [], `no browser page errors: ${diagnostics.pageErrors.join(' | ')}`);

  console.log('PASS: ZIP-derived homepage and six-section Theme Settings (navigation, FAQ/portal interactions, non-submitting CTA, reduced motion, no-JS fallback, seven responsive widths, local assets only)');
} catch (error) {
  const detail = String(error?.stack || error).replaceAll(process.cwd(), '<workspace>');
  const report = `${detail}\n\nDiagnostics: ${JSON.stringify(diagnostics, null, 2)}`.slice(0, 7000);
  const artifactDir = resolve(import.meta.dirname, 'artifacts/visual-preview');
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(resolve(artifactDir, 'failure.txt'), `${report}\n`, 'utf8');
  const annotation = report.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  console.error(`::error title=ZIP-derived visual preview::${annotation}`);
  console.error(detail);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (server?.listening) await new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()));
}
