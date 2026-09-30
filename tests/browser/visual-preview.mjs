/** Direct Playwright review of the isolated HTML design preview (no WordPress runtime). */
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
  '.zip': 'application/zip',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const server = createServer((request, response) => {
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

await new Promise((resolveListen, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolveListen);
});
const address = server.address();
const base = `http://127.0.0.1:${address.port}`;
let browser;
const diagnostics = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [], externalRequests: [] };

function watch(page) {
  page.on('console', (message) => { if (message.type() === 'error') diagnostics.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  page.on('requestfailed', (request) => diagnostics.failedRequests.push(`${request.url()}: ${request.failure()?.errorText || 'failed'}`));
  page.on('response', (response) => { if (response.status() >= 400) diagnostics.badResponses.push(`${response.status()} ${response.url()}`); });
  page.on('request', (request) => {
    if (/^https?:/i.test(request.url()) && !request.url().startsWith(base)) diagnostics.externalRequests.push(request.url());
  });
}

async function assertNoOverflow(page, label) {
  const metrics = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert(metrics.document <= metrics.viewport + 1, `${label}: document overflows horizontally (${JSON.stringify(metrics)})`);
  assert(metrics.body <= metrics.viewport + 1, `${label}: body overflows horizontally (${JSON.stringify(metrics)})`);
}

try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  watch(page);
  let response = await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, 'homepage preview returns HTTP 200');
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('html').getAttribute('lang'), 'fa');
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
  assert.equal(await page.locator('h1').count(), 1, 'homepage has one H1');
  assert.match(await page.locator('h1').innerText(), /مدیریت کلینیک/);
  assert.equal(await page.locator('form').count(), 0, 'homepage has no real form');
  assert.equal(await page.locator('.media-frame').isVisible(), true, 'reserved product-media frame is visible');
  assert.match(await page.locator('.media-frame').innerText(), /این تصویرسازی، نمای محصول نیست/);
  assert.equal(await page.evaluate(() => document.fonts.check('16px Vazirmatn')), true, 'local Vazirmatn font loads');

  await page.locator('#desktop-workflows > summary').click();
  assert.equal(await page.locator('#desktop-workflows').evaluate((node) => node.open), true, 'desktop workflow submenu opens');
  assert.equal(await page.locator('#desktop-workflows .nav-dropdown a').count(), 4, 'desktop workflow submenu contains its four routes');
  await page.waitForTimeout(220);
  diagnostics.desktopMenuState = await page.locator('#desktop-workflows').evaluate((node) => {
    const panel = node.querySelector('.nav-dropdown');
    const link = panel?.querySelector('a[href="#stage-appointment"]');
    const panelStyle = panel ? getComputedStyle(panel) : null;
    const linkStyle = link ? getComputedStyle(link) : null;
    const panelRect = panel?.getBoundingClientRect();
    const linkRect = link?.getBoundingClientRect();
    const hit = linkRect ? document.elementFromPoint(linkRect.x + linkRect.width / 2, linkRect.y + linkRect.height / 2) : null;
    return {
      open: node.open,
      panel: panel && panelStyle ? { display: panelStyle.display, visibility: panelStyle.visibility, opacity: panelStyle.opacity, pointerEvents: panelStyle.pointerEvents, rect: [panelRect.x, panelRect.y, panelRect.width, panelRect.height] } : null,
      link: link && linkStyle ? { display: linkStyle.display, visibility: linkStyle.visibility, opacity: linkStyle.opacity, rect: [linkRect.x, linkRect.y, linkRect.width, linkRect.height], hit: hit?.tagName || null } : null,
    };
  });
  await page.locator('#desktop-workflows .nav-dropdown a[href="#stage-appointment"]').click({ timeout: 5000 });
  assert.equal(new URL(page.url()).hash, '#stage-appointment', 'desktop submenu route safely targets the workflow preview');
  assert.equal(await page.locator('#desktop-workflows').evaluate((node) => node.open), false, 'desktop submenu closes after choosing a route');

  await page.locator('.hero-actions [data-demo-cta]').click();
  assert.equal(new URL(page.url()).hash, '#demo', 'primary Demo CTA navigates to the preview CTA section');
  await page.locator('#preview-toast').waitFor({ state: 'visible' });
  assert.match(await page.locator('#preview-toast').innerText(), /هیچ درخواستی ثبت یا ارسال نمی‌شود/);
  await page.locator('#workflow').scrollIntoViewIfNeeded();
  await page.locator('.workflow-track').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('.workflow-track')?.classList.contains('is-visible'));
  await page.locator('.question-item').nth(1).locator('summary').click();
  assert.equal(await page.locator('.question-item').nth(1).evaluate((node) => node.open), true, 'objection details disclosure opens');

  for (const width of [320, 390, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await assertNoOverflow(page, `homepage ${width}px`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  response = await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await page.locator('#mobile-navigation > summary').click();
  assert.equal(await page.locator('#mobile-navigation').evaluate((node) => node.open), true, 'mobile navigation opens');
  await page.locator('#mobile-workflows > summary').click();
  assert.equal(await page.locator('#mobile-workflows').evaluate((node) => node.open), true, 'mobile workflow submenu opens');
  await page.locator('#mobile-workflows a[href="#stage-visit"]').click();
  assert.equal(new URL(page.url()).hash, '#stage-visit', 'mobile submenu safely targets a workflow stage');
  assert.equal(await page.locator('#mobile-navigation').evaluate((node) => node.open), false, 'mobile navigation closes after selecting a route');

  await page.locator('#mobile-navigation > summary').click();
  await page.locator('#mobile-workflows > summary').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#mobile-workflows').evaluate((node) => node.open), false, 'Escape closes the mobile submenu first');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#mobile-navigation').evaluate((node) => node.open), false, 'Escape closes the mobile menu');

  for (const width of [320, 390, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await assertNoOverflow(page, `homepage responsive check ${width}px`);
  }

  response = await page.goto(`${base}/theme-settings.html`, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, 'Theme Settings preview returns HTTP 200');
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
  assert.equal(await page.locator('h1').count(), 1, 'Theme Settings preview has one H1');
  assert.equal(await page.locator('[role="tab"]').count(), 6, 'Theme Settings preview has six sections');
  assert.equal(await page.locator('#panel-general').isVisible(), true, 'general panel starts selected');
  assert.equal(await page.locator('#panel-contact').isVisible(), false, 'inactive tab panel is hidden after enhancement');
  await page.locator('#tab-contact').click();
  assert.equal(await page.locator('#tab-contact').getAttribute('aria-selected'), 'true', 'contact tab becomes selected');
  assert.equal(await page.locator('#panel-contact').isVisible(), true, 'contact panel becomes visible');
  assert.equal(await page.locator('#panel-general').isVisible(), false, 'previous panel is hidden');
  await page.locator('#tab-contact').focus();
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('#tab-sales').getAttribute('aria-selected'), 'true', 'tab arrow-key navigation changes the selected panel');
  assert.equal(await page.locator('#panel-sales').isVisible(), true);
  assert.match(await page.locator('#panel-sales').innerText(), /غیرفعال/);
  assert.match(await page.locator('#panel-sales').innerText(), /نیازمند بررسی/);
  assert.match(await page.locator('#panel-sales').innerText(), /هیچ درخواستی دریافت یا ارسال نمی‌شود/);
  await page.locator('#tab-shell').click();
  assert.equal(await page.locator('#panel-shell').isVisible(), true, 'header/footer settings tab switches');
  await page.locator('#tab-social').click();
  assert.equal(await page.locator('#panel-social').isVisible(), true, 'social settings tab switches');
  assert.equal(await page.locator('#social-instagram').inputValue(), '', 'no invented social profile is present');
  await page.locator('#tab-status').click();
  const statusText = await page.locator('#panel-status').innerText();
  for (const honestState of ['فعال', 'غیرفعال', 'نیازمند بررسی', 'تأیید نشده']) assert(statusText.includes(honestState), `status panel includes the honest label ${honestState}`);
  assert.match(statusText, /پذیرش Elementor Pro روی میزبان/);
  assert.match(statusText, /تأیید نشده/);
  assert.equal(await page.locator('.settings-save-bar button').isDisabled(), true, 'prototype cannot save settings');
  assert.equal(await page.locator('form').count(), 0, 'Theme Settings preview has no form or real write endpoint');
  for (const width of [320, 390, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await assertNoOverflow(page, `Theme Settings ${width}px`);
  }

  const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  watch(reducedPage);
  await reducedPage.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  assert.equal(await reducedPage.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
  assert.equal(await reducedPage.locator('html').evaluate((node) => node.classList.contains('has-motion')), false, 'reduced motion avoids adding reveal animations');
  assert.equal(await reducedPage.locator('.workflow-track').evaluate((node) => getComputedStyle(node).opacity), '1', 'content remains visible with reduced motion');
  await reducedContext.close();

  const noJsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false, reducedMotion: 'reduce' });
  const noJsPage = await noJsContext.newPage();
  watch(noJsPage);
  await noJsPage.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  assert.equal(await noJsPage.locator('#mobile-navigation').evaluate((node) => node.open), false);
  await noJsPage.locator('#mobile-navigation > summary').click();
  assert.equal(await noJsPage.locator('#mobile-navigation').evaluate((node) => node.open), true, 'native mobile disclosure works without JavaScript');
  await noJsPage.goto(`${base}/theme-settings.html`, { waitUntil: 'networkidle' });
  assert.equal(await noJsPage.locator('#panel-general').isVisible(), true, 'no-JavaScript Settings fallback shows the first section');
  assert.equal(await noJsPage.locator('#panel-status').isVisible(), true, 'no-JavaScript Settings fallback keeps every panel readable');
  await noJsPage.locator('#tab-sales').click();
  assert.equal(new URL(noJsPage.url()).hash, '#panel-sales', 'no-JavaScript tab links still navigate to their section');
  await noJsContext.close();

  assert.deepEqual(diagnostics.externalRequests, [], `no external requests: ${diagnostics.externalRequests.join(', ')}`);
  assert.deepEqual(diagnostics.failedRequests, [], `no failed requests: ${diagnostics.failedRequests.join(', ')}`);
  assert.deepEqual(diagnostics.badResponses, [], `no broken local responses: ${diagnostics.badResponses.join(', ')}`);
  assert.deepEqual(diagnostics.consoleErrors, [], `no browser console errors: ${diagnostics.consoleErrors.join(' | ')}`);
  assert.deepEqual(diagnostics.pageErrors, [], `no browser page errors: ${diagnostics.pageErrors.join(' | ')}`);

  console.log('PASS: interactive visual preview (responsive widths, mobile/desktop navigation, CTA, scroll motion, reduced motion, Settings tabs, no-JavaScript fallback, no external requests/errors)');
} catch (error) {
  const detail = String(error?.stack || error).replaceAll(process.cwd(), "<workspace>");
  const report = `${detail}\n\nDiagnostics: ${JSON.stringify(diagnostics, null, 2)}`.slice(0, 6000);
  const artifactDir = resolve(import.meta.dirname, "artifacts/visual-preview");
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(resolve(artifactDir, "failure.txt"), `${report}\n`, "utf8");
  const annotation = report.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  console.error(`::error title=Interactive visual preview::${annotation}`);
  console.error(detail);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()));
}
