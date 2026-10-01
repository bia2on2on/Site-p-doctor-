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

const requestedBase = process.env.VISUAL_PREVIEW_BASE_URL;
let server = null;
let base;
if (!requestedBase) server = createServer((request, response) => {
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
const diagnostics = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [], externalRequests: [], outOfBaseRequests: [] };

function watch(page) {
  page.on('console', (message) => { if (message.type() === 'error') diagnostics.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  page.on('requestfailed', (request) => diagnostics.failedRequests.push(`${request.url()}: ${request.failure()?.errorText || 'failed'}`));
  page.on('response', (response) => {
    const responseUrl = new URL(response.url());
    if (response.status() >= 400 && responseUrl.pathname !== '/favicon.ico') diagnostics.badResponses.push(`${response.status()} ${response.url()}`);
  });
  page.on('request', (request) => {
    if (!/^https?:/i.test(request.url())) return;
    const requestUrl = new URL(request.url());
    if (requestUrl.origin !== baseUrl.origin) diagnostics.externalRequests.push(request.url());
    else if (!requestUrl.pathname.startsWith(basePath) && requestUrl.pathname !== '/favicon.ico') diagnostics.outOfBaseRequests.push(request.url());
  });
}

async function assertNoOverflow(page, label) {
  const metrics = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert(metrics.document <= metrics.viewport + 1, `${label}: document overflows horizontally (${JSON.stringify(metrics)})`);
  assert(metrics.body <= metrics.viewport + 1, `${label}: body overflows horizontally (${JSON.stringify(metrics)})`);
}

function visualFingerprint() {
  const round = (value) => Math.round(value * 10) / 10;
  const box = (element) => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return { x: round(rect.x + scrollX), y: round(rect.y + scrollY), width: round(rect.width), height: round(rect.height) };
  };
  const visualStyle = (element) => {
    if (!element) return null;
    const style = getComputedStyle(element);
    return {
      display: style.display,
      position: style.position,
      background: style.backgroundColor,
      color: style.color,
      font: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      padding: style.padding,
      gap: style.gap,
      radius: style.borderRadius,
      border: `${style.borderWidth} ${style.borderStyle} ${style.borderColor}`,
      shadow: style.boxShadow,
      backdrop: style.backdropFilter,
      transition: style.transitionDuration,
      animation: style.animationDuration,
    };
  };
  const describe = (element) => ({ tag: element.tagName.toLowerCase(), className: typeof element.className === 'string' ? element.className.slice(0, 90) : element.getAttribute('class')?.slice(0, 90) || '', box: box(element), style: visualStyle(element) });
  const main = document.querySelector('main');
  const sections = [...(main || document).querySelectorAll('section')].filter((element) => !element.parentElement?.closest('section'));
  const h1 = document.querySelector('h1');
  const hero = h1?.closest('section') || h1?.parentElement;
  let heroGrid = null;
  for (let node = h1?.parentElement; node && node !== hero; node = node.parentElement) {
    const display = getComputedStyle(node).display;
    if (node.children.length >= 2 && [...node.children].some((child) => !child.contains(h1)) && (display === 'grid' || display === 'flex')) {
      heroGrid = node;
      break;
    }
  }
  const copyColumn = heroGrid ? [...heroGrid.children].find((child) => child.contains(h1)) : h1?.parentElement;
  const mediaColumn = heroGrid ? [...heroGrid.children].filter((child) => child !== copyColumn).sort((a, b) => (b.getBoundingClientRect().width * b.getBoundingClientRect().height) - (a.getBoundingClientRect().width * a.getBoundingClientRect().height))[0] : null;
  const heroCta = hero ? [...hero.querySelectorAll('a,button')].find((element) => /demo|دمو|درخواست|مشاوره/i.test(element.innerText || element.getAttribute('aria-label') || '')) || hero.querySelector('a,button') : null;
  const cardCandidates = [...document.querySelectorAll('article,figure,[class*="card"],[class*="feature"],[class*="stat"],[class*="panel"]')].filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 90 && rect.height > 42;
  }).slice(0, 8);
  const topSections = sections.map((section) => {
    const heading = section.querySelector('h2,h3');
    return { box: box(section), background: getComputedStyle(section).backgroundColor, paddingBlock: `${getComputedStyle(section).paddingBlockStart}/${getComputedStyle(section).paddingBlockEnd}`, headingTag: heading?.tagName.toLowerCase() || null };
  });
  return {
    viewport: { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight },
    page: { background: getComputedStyle(document.body).backgroundColor, font: getComputedStyle(document.body).fontFamily, fontSize: getComputedStyle(document.body).fontSize, lineHeight: getComputedStyle(document.body).lineHeight },
    header: describe(document.querySelector('header')),
    nav: describe(document.querySelector('header nav')),
    hero: describe(hero),
    heroGrid: describe(heroGrid),
    heroCopy: describe(copyColumn),
    heroMedia: describe(mediaColumn),
    h1: describe(h1),
    heroCta: describe(heroCta),
    sectionCount: sections.length,
    sections: topSections,
    cards: cardCandidates.map(describe),
    footer: describe(document.querySelector('footer')),
    interaction: { details: document.querySelectorAll('details').length, navDetails: document.querySelectorAll('header details').length, buttons: document.querySelectorAll('button').length, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches },
  };
}

function emitVisualMeasurement(label, viewport, fingerprint) {
  const geometry = ({ box, style }) => ({ box, display: style?.display, background: style?.background, color: style?.color, font: style?.font, fontSize: style?.fontSize, lineHeight: style?.lineHeight, padding: style?.padding, gap: style?.gap, radius: style?.radius, shadow: style?.shadow, backdrop: style?.backdrop });
  const measurement = {
    viewport: fingerprint.viewport,
    page: fingerprint.page,
    header: geometry(fingerprint.header),
    nav: geometry(fingerprint.nav),
    hero: geometry(fingerprint.hero),
    heroGrid: geometry(fingerprint.heroGrid),
    heroCopy: geometry(fingerprint.heroCopy),
    heroMedia: geometry(fingerprint.heroMedia),
    h1: geometry(fingerprint.h1),
    cta: geometry(fingerprint.heroCta),
    sections: fingerprint.sections,
    cards: fingerprint.cards.slice(0, 4).map(geometry),
  };
  const safeMessage = JSON.stringify(measurement).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
  console.log(`::notice title=${label}-${viewport.width}x${viewport.height}::${safeMessage}`);
}

async function captureReferenceParity(browser, screenshotDir) {
  const referenceUrl = process.env.VISUAL_REFERENCE_URL;
  if (!referenceUrl) return;
  const viewports = [
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ];
  const referencePage = await browser.newPage({ reducedMotion: 'reduce' });
  referencePage.setDefaultNavigationTimeout(30000);
  try {
    for (const viewport of viewports) {
      await referencePage.setViewportSize(viewport);
      try {
        const response = await referencePage.goto(referenceUrl, { waitUntil: 'domcontentloaded' });
        if (!response || response.status() >= 400) throw new Error(`reference returned HTTP ${response?.status() ?? 'no response'}`);
        await referencePage.waitForTimeout(650);
        const fingerprint = await referencePage.evaluate(visualFingerprint);
        console.log(`[REFERENCE-PARITY ${viewport.width}x${viewport.height}] ${JSON.stringify(fingerprint)}`);
        emitVisualMeasurement('REFERENCE', viewport, fingerprint);
        await referencePage.evaluate(async () => {
          const step = Math.max(300, Math.floor(innerHeight * 0.72));
          for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
            scrollTo(0, y);
            await new Promise((resolveFrame) => requestAnimationFrame(resolveFrame));
          }
          scrollTo(0, 0);
          await new Promise((resolveFrame) => requestAnimationFrame(resolveFrame));
        });
        const path = resolve(screenshotDir, `reference-${viewport.width}x${viewport.height}.jpg`);
        await referencePage.screenshot({ path, type: 'jpeg', quality: 88, fullPage: true, animations: 'disabled', caret: 'hide' });
        console.log(`[REFERENCE-SCREENSHOT] ${viewport.width}×${viewport.height}: ${path}`);
      } catch (error) {
        console.warn(`[REFERENCE-INSPECTION-UNAVAILABLE ${viewport.width}x${viewport.height}] ${String(error?.message || error).slice(0, 350)}`);
        break;
      }
    }
  } finally {
    await referencePage.close();
  }
}

async function captureVisualReviewScreenshots(browser) {
  const screenshotDir = resolve(import.meta.dirname, "artifacts/visual-preview/screenshots");
  mkdirSync(screenshotDir, { recursive: true });
  const capturePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  watch(capturePage);

  const viewports = [
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ];

  const exposeReveals = async () => {
    const override = await capturePage.addStyleTag({ content: "html, body { scroll-behavior: auto !important; }" });
    await capturePage.evaluate(async () => {
      const step = Math.max(240, Math.floor(window.innerHeight * 0.72));
      const bottom = document.documentElement.scrollHeight;
      for (let y = 0; y < bottom; y += step) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
    });
    await override.evaluate((style) => style.remove());
  };

  for (const viewport of viewports) {
    await capturePage.setViewportSize(viewport);
    const response = await capturePage.goto(pageUrl(""), { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200, `homepage screenshot source returns HTTP 200 at ${viewport.width}px`);
    await capturePage.evaluate(() => document.fonts.ready);
    await exposeReveals();
    const reveals = await capturePage.evaluate(() => ({ total: document.querySelectorAll("[data-reveal]").length, visible: document.querySelectorAll("[data-reveal].is-visible").length }));
    assert.equal(reveals.visible, reveals.total, `all homepage sections are revealed before ${viewport.width}px screenshot (${JSON.stringify(reveals)})`);
    const fingerprint = await capturePage.evaluate(visualFingerprint);
    console.log(`[CPMS-PARITY ${viewport.width}x${viewport.height}] ${JSON.stringify(fingerprint)}`);
    emitVisualMeasurement('CPMS', viewport, fingerprint);
    await capturePage.waitForTimeout(850);
    const path = resolve(screenshotDir, `homepage-${viewport.width}x${viewport.height}.jpg`);
    await capturePage.screenshot({ path, type: "jpeg", quality: 88, fullPage: true, animations: "disabled", caret: "hide" });
    console.log(`[SCREENSHOT] homepage ${viewport.width}×${viewport.height}: ${path}`);
  }

  for (const viewport of viewports) {
    await capturePage.setViewportSize(viewport);
    const response = await capturePage.goto(pageUrl("theme-settings.html"), { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200, `Theme Settings screenshot source returns HTTP 200 at ${viewport.width}px`);
    await capturePage.evaluate(() => document.fonts.ready);
    const path = resolve(screenshotDir, `theme-settings-${viewport.width}x${viewport.height}.jpg`);
    await capturePage.screenshot({ path, type: "jpeg", quality: 88, fullPage: true, animations: "disabled", caret: "hide" });
    console.log(`[SCREENSHOT] Theme Settings ${viewport.width}×${viewport.height}: ${path}`);
  }

  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await capturePage.setViewportSize(viewport);
    await capturePage.goto(pageUrl("theme-settings.html"), { waitUntil: "networkidle" });
    await capturePage.locator("#tab-status").click();
    assert.equal(await capturePage.locator("#panel-status").isVisible(), true, "status overview opens for screenshot evidence");
    const path = resolve(screenshotDir, `theme-settings-status-${viewport.width}x${viewport.height}.jpg`);
    await capturePage.screenshot({ path, type: "jpeg", quality: 88, fullPage: true, animations: "disabled", caret: "hide" });
    console.log(`[SCREENSHOT] Theme Settings status ${viewport.width}×${viewport.height}: ${path}`);
  }

  await capturePage.setViewportSize({ width: 390, height: 844 });
  await capturePage.goto(pageUrl(""), { waitUntil: "networkidle" });
  await capturePage.locator("#mobile-navigation > summary").click();
  assert.equal(await capturePage.locator("#mobile-navigation").evaluate((node) => node.open), true, "mobile disclosure opens for screenshot evidence");
  await capturePage.locator("#mobile-workflows > summary").click();
  assert.equal(await capturePage.locator(".mobile-workflows__links a").count(), 5, "mobile screenshot evidence includes all five workflow destinations");
  const menuPath = resolve(screenshotDir, "homepage-390x844-menu-open.jpg");
  await capturePage.screenshot({ path: menuPath, type: "jpeg", quality: 88, fullPage: false, animations: "disabled", caret: "hide" });
  console.log(`[SCREENSHOT] mobile menu 390×844: ${menuPath}`);
  await capturePage.close();
  await captureReferenceParity(browser, screenshotDir);
}

async function assertFontSize(page, selector, minimum, label) {
  const sizes = await page.locator(selector).evaluateAll((nodes) => nodes.map((node) => Number.parseFloat(getComputedStyle(node).fontSize)));
  assert(sizes.length > 0, `${label}: selector matched at least one element (${selector})`);
  for (const size of sizes) assert(size >= minimum, `${label}: ${selector} is at least ${minimum}px (got ${size}px)`);
}

function luminance(hex) {
  const match = /^#([\da-f]{6})$/i.exec(hex.trim());
  assert(match, `expected a six-digit hex color, got ${hex}`);
  const channels = [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function assertContrast(foreground, background, label) {
  const first = luminance(foreground);
  const second = luminance(background);
  const ratio = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  assert(ratio >= 4.5, `${label}: WCAG AA normal-text contrast is ${ratio.toFixed(2)}:1`);
}

try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  watch(page);
  let response = await page.goto(pageUrl(''), { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, 'homepage preview returns HTTP 200');
  if (requestedBase) {
    assert.equal(await page.locator('a[href$=".zip"]').count(), 0, 'published homepage has no offline package link');
  } else {
    assert.equal(await page.locator('a[href$=".zip"]').count(), 1, 'downloadable source exposes exactly one homepage bundle link');
  }
  const requiredAssets = ['preview.css', 'preview.js', 'assets/fonts/Vazirmatn-Regular.woff2', 'assets/fonts/Vazirmatn-Bold.woff2', 'assets/fonts/OFL.txt'];
  if (!requestedBase) requiredAssets.push('koorosh-design-preview.zip');
  else {
    const packageResponse = await page.request.get(pageUrl('koorosh-design-preview.zip'));
    assert.equal(packageResponse.status(), 404, 'published Pages site does not expose the offline ZIP package');
  }
  for (const asset of requiredAssets) {
    const assetResponse = await page.request.get(pageUrl(asset));
    assert.equal(assetResponse.status(), 200, `published preview asset returns HTTP 200: ${asset}`);
  }
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('html').getAttribute('lang'), 'fa');
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
  assert.match(await page.locator('#preview-notice').innerText(), /پیش‌نمایش طراحی — نسخه نهایی سایت نیست/);
  assert.equal(await page.locator('h1').count(), 1, 'homepage has one H1');
  assert.match(await page.locator('h1').innerText(), /مدیریت یکپارچهٔ کلینیک/);
  assert.equal(await page.locator('form').count(), 0, 'homepage has no real form');
  assert.equal(await page.locator('.media-reservation').count(), 2, 'hero and role showcase each reserve a large replaceable media frame');
  assert.equal(await page.locator('.media-reservation--hero').isVisible(), true, 'the hero media frame is visible');
  assert.equal(await page.locator('#product-proof .media-reservation').count(), 0, 'the feature grid stays clear of an unrelated media frame');
  assert.equal(await page.locator('#roles .media-reservation--proof').count(), 1, 'the secondary abstract-media slot is composed with the role section');
  assert.deepEqual(await page.locator('main > section').evaluateAll((nodes) => nodes.map((node) => node.id || node.classList[0])), ['home', 'value-strip', 'product-proof', 'roles', 'workflow', 'questions', 'demo'], 'section sequence follows the reference composition where CPMS has a truthful equivalent');
  assert.deepEqual(await page.locator('.product-feature-grid h3').allInnerTexts(), ['نوبت', 'پذیرش', 'صف', 'ویزیت', 'پرونده', 'ثبت دستی پرداخت و خلاصهٔ مالی'], 'feature cards contain only the five truthful journey stages plus the existing manual-finance boundary');
  assert.deepEqual(await page.locator('.media-disclosure').allInnerTexts(), ['تصویر واقعی محصول در این جایگاه قرار می‌گیرد.', 'تصویر واقعی محصول در این جایگاه قرار می‌گیرد.'], 'each reserved composition has exactly one concise Persian disclosure');
  assert.match(await page.locator('.media-reservation--hero').getAttribute('aria-labelledby'), /hero-media-disclosure/);
  assert.match(await page.locator('.media-reservation--proof').getAttribute('aria-labelledby'), /proof-media-disclosure/);
  assert.match(await page.locator('.role-fit-note').innerText(), /کلینیک‌های چندپزشکی و مراکز درمانی/);
  assert.match(await page.locator('.role-fit-note').innerText(), /مطب مستقل یا مجموعهٔ کوچک‌تر/);
  assert.equal(await page.locator('.media-reservation button, .media-reservation input, .media-reservation select, .media-reservation textarea, .media-reservation table, .media-reservation canvas, .media-reservation iframe, .media-reservation img').count(), 0, 'reserved media uses abstract geometry only, with no fabricated product UI or photography');
  assert.equal(await page.locator('.media-stage__chrome, .media-glass-accent, .media-glass-orb').count(), 0, 'abstract compositions do not imitate browser chrome or floating product controls');
  const glassMotion = await page.evaluate(() => {
    const heroCard = getComputedStyle(document.querySelector('.hero-copy'));
    const mediaStage = getComputedStyle(document.querySelector('.media-stage'));
    const repeatedCardFilters = ['.value-item', '.workflow-step', '.media-disclosure'].map((selector) => getComputedStyle(document.querySelector(selector)).backdropFilter);
    const durations = mediaStage.transitionDuration.split(',').map((value) => {
      const trimmed = value.trim();
      const number = Number.parseFloat(trimmed);
      return trimmed.endsWith('ms') ? number : number * 1000;
    });
    return { backdropFilter: heroCard.backdropFilter, repeatedCardFilters, maxTransitionMs: Math.max(...durations) };
  });
  assert.match(glassMotion.backdropFilter, /blur\(/, 'copy is presented on a true frosted-glass card');
  assert(glassMotion.repeatedCardFilters.every((filter) => filter === 'none'), 'repeated cards avoid costly backdrop filters');
  assert(glassMotion.maxTransitionMs <= 400, `glass micro-interactions remain short (${glassMotion.maxTransitionMs}ms max)`);
  const workflowLabels = await page.locator('.workflow-step h3').allInnerTexts();
  assert.deepEqual(workflowLabels, ['نوبت', 'پذیرش', 'صف', 'ویزیت', 'پرونده'], 'the clinic journey is shown as five distinct evaluation steps');
  assert.equal(await page.evaluate(() => document.fonts.check('16px Vazirmatn')), true, 'local Vazirmatn font loads');

  const palette = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return Object.fromEntries(['--color-ink', '--color-copy', '--color-muted', '--color-canvas', '--color-surface', '--color-primary', '--color-primary-hover', '--color-blue-soft', '--color-success', '--color-success-soft', '--color-warning', '--color-info', '--color-warm-soft', '--color-night'].map((name) => [name, styles.getPropertyValue(name).trim()]));
  });
  for (const [foreground, background, label] of [
    [palette['--color-ink'], palette['--color-canvas'], 'body text on cool canvas'],
    [palette['--color-copy'], palette['--color-canvas'], 'supporting copy on cool canvas'],
    [palette['--color-muted'], palette['--color-surface'], 'muted text on white surface'],
    [palette['--color-primary-hover'], palette['--color-canvas'], 'blue links on cool canvas'],
    [palette['--color-primary-hover'], palette['--color-blue-soft'], 'active tab on soft blue'],
    [palette['--color-success'], palette['--color-success-soft'], 'active status on soft blue'],
    [palette['--color-copy'], '#EEF2F9', 'inactive status on soft blue-gray'],
    [palette['--color-warning'], palette['--color-warm-soft'], 'review status on soft amber'],
    [palette['--color-info'], palette['--color-blue-soft'], 'unverified status on soft blue'],
    ['#FFFFFF', '#315CFA', 'white CTA text on the first bright-blue gradient stop'],
    ['#FFFFFF', '#1261BD', 'white CTA text on the mid-blue gradient stop'],
    ['#FFFFFF', '#0875A3', 'white CTA text on the blue-cyan gradient stop'],
    ['#F2F6FF', '#315CFA', 'light CTA body text on bright blue'],
    ['#F2F6FF', '#1261BD', 'light CTA body text on mid-blue'],
    ['#F2F6FF', '#0875A3', 'light CTA body text on blue-cyan'],
    ['#EAF0FF', '#315CFA', 'light CTA eyebrow on bright blue'],
    ['#EAF0FF', '#1261BD', 'light CTA eyebrow on mid-blue'],
    ['#EAF0FF', '#0875A3', 'light CTA eyebrow on blue-cyan'],
    ['#D5D9E2', palette['--color-night'], 'footer copy on navy'],
    ['#BDC7E1', palette['--color-night'], 'footer link on navy'],
  ]) assertContrast(foreground, background, label);

  if (process.env.VISUAL_REVIEW_SCREENSHOTS === "1") await captureVisualReviewScreenshots(browser);

  await page.locator('#desktop-workflows > summary').click();
  assert.equal(await page.locator('#desktop-workflows').evaluate((node) => node.open), true, 'desktop workflow submenu opens');
  assert.equal(await page.locator('#desktop-workflows .nav-dropdown a').count(), 5, 'desktop workflow submenu lists the five review stages');
  for (const [target, label] of [['#stage-appointment', 'نوبت'], ['#stage-reception', 'پذیرش'], ['#stage-queue', 'صف'], ['#stage-visit', 'ویزیت'], ['#stage-record', 'پرونده']]) {
    const link = page.locator(`#desktop-workflows .nav-dropdown a[href="${target}"]`);
    assert((await link.innerText()).includes(label), `workflow navigation label matches ${target}`);
    assert.equal(await page.locator(target).count(), 1, `workflow destination exists: ${target}`);
  }
  assert.equal(await page.locator('.desktop-nav a').filter({ hasText: 'پورتال بیمار' }).count(), 0, 'preview nav omits the mismatched patient-portal destination');
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
  await page.waitForFunction(() => document.querySelector('#workflow .section-heading')?.classList.contains('is-visible'));
  await page.waitForFunction(() => document.querySelector('.workflow-track')?.classList.contains('is-active'));
  await page.locator('.question-item').nth(1).locator('summary').click();
  assert.equal(await page.locator('.question-item').nth(1).evaluate((node) => node.open), true, 'objection details disclosure opens');

  const viewportMatrix = [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ];
  for (const viewport of viewportMatrix) {
    await page.setViewportSize(viewport);
    await assertNoOverflow(page, `homepage ${viewport.width}×${viewport.height}`);
    const featureColumns = await page.locator('.product-feature-grid').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    const expectedFeatureColumns = viewport.width <= 520 ? 1 : viewport.width <= 960 ? 2 : 3;
    assert.equal(featureColumns, expectedFeatureColumns, `truthful feature grid adapts at ${viewport.width}px`);
    const roleShowcaseColumns = await page.locator('.role-showcase').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    assert.equal(roleShowcaseColumns, viewport.width <= 960 ? 1 : 2, `role/media showcase adapts at ${viewport.width}px`);
    if (viewport.width === 768 || viewport.width === 1024) {
      const headerHeight = await page.locator('#site-header').evaluate((node) => node.getBoundingClientRect().height);
      assert(headerHeight >= 60 && headerHeight <= 64, `tablet compact header is 60–64px tall (got ${headerHeight}px)`);
      const heroColumns = await page.locator('.hero-grid').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
      assert.equal(heroColumns, 1, 'tablet hero uses its own single-column composition');
      const workflowColumns = await page.locator('.workflow-track').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
      assert.equal(workflowColumns, 1, 'tablet workflow uses open editorial timeline rows');
    }
    if (viewport.width === 1366 || viewport.width === 1440 || viewport.width === 1920) {
      const headerHeight = await page.locator('#site-header').evaluate((node) => node.getBoundingClientRect().height);
      assert(headerHeight >= 68 && headerHeight <= 72, `desktop header is 68–72px tall (got ${headerHeight}px)`);
      const workflowColumns = await page.locator('.workflow-track').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
      assert.equal(workflowColumns, 5, 'desktop workflow uses five connected stages');
      const heroColumns = await page.locator('.hero-grid').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
      assert.equal(heroColumns, 2, 'desktop hero uses a balanced two-column composition');
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  response = await page.goto(pageUrl(''), { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  const mobileHeaderHeight = await page.locator('#site-header').evaluate((node) => node.getBoundingClientRect().height);
  assert(mobileHeaderHeight >= 60 && mobileHeaderHeight <= 64, `mobile header is 60–64px tall (got ${mobileHeaderHeight}px)`);
  assert.equal(await page.locator('.header-cta').isVisible(), true, 'mobile header retains the Demo CTA');
  assert.equal(await page.locator('.mobile-navigation').isVisible(), true, 'mobile header exposes its disclosure menu');
  const mobileHeroOrder = await page.evaluate(() => {
    const box = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    };
    return { actions: box('.hero-actions'), visual: box('.media-reservation--hero') };
  });
  assert(mobileHeroOrder.visual.top >= mobileHeroOrder.actions.bottom, 'mobile hero places its visual after the CTA and secondary link');
  for (const selector of ['.hero-lede', '.section-heading > p', '.workflow-step p', '.product-copy__lede', '.product-points p', '.role-item__body p', '.role-fit-note p', '.questions-intro > p:not(.eyebrow)', '.question-item p', '.demo-panel__copy > p:last-child', '.footer-brand > p']) await assertFontSize(page, selector, 16, 'mobile body copy');
  await page.locator('#mobile-navigation > summary').click();
  assert.equal(await page.locator('#mobile-navigation').evaluate((node) => node.open), true, 'mobile navigation opens');
  await page.locator('#mobile-workflows > summary').click();
  assert.equal(await page.locator('#mobile-workflows').evaluate((node) => node.open), true, 'mobile workflow submenu opens');
  assert.equal(await page.locator('.mobile-workflows__links a').count(), 5, 'mobile workflow submenu exposes all five steps');
  await page.locator('#mobile-workflows a[href="#stage-visit"]').click();
  assert.equal(new URL(page.url()).hash, '#stage-visit', 'mobile submenu safely targets a workflow stage');
  assert.equal(await page.locator('#mobile-navigation').evaluate((node) => node.open), false, 'mobile navigation closes after selecting a route');

  await page.locator('#mobile-navigation > summary').click();
  await page.locator('#mobile-workflows > summary').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#mobile-workflows').evaluate((node) => node.open), false, 'Escape closes the mobile submenu first');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#mobile-navigation').evaluate((node) => node.open), false, 'Escape closes the mobile menu');

  for (const viewport of viewportMatrix) {
    await page.setViewportSize(viewport);
    await assertNoOverflow(page, `homepage responsive check ${viewport.width}×${viewport.height}`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  response = await page.goto(pageUrl('theme-settings.html'), { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, 'Theme Settings preview returns HTTP 200');
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
  assert.equal(await page.locator('html').getAttribute('lang'), 'fa');
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.match(await page.locator('.admin-review-banner').innerText(), /پیش‌نمایش طراحی — نسخه نهایی سایت نیست/);
  assert.equal(await page.locator('a[href$=".zip"]').count(), 0, 'Theme Settings page has no offline package link');
  assert.equal(await page.locator('h1').count(), 1, 'Theme Settings preview has one H1');
  assert.equal(await page.locator('[role="tab"]').count(), 6, 'Theme Settings preview has six sections');
  const settingsCardFilters = await page.locator('.settings-card').evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backdropFilter));
  assert(settingsCardFilters.length > 0 && settingsCardFilters.every((filter) => filter === 'none'), 'repeated Settings cards avoid costly backdrop filters');
  assert.equal(await page.locator('[role="tablist"]').getAttribute('aria-orientation'), 'horizontal', 'mobile Settings navigation uses a horizontal scroll rail');
  assert.equal(await page.locator('#panel-general').isVisible(), true, 'general panel starts selected');
  assert.equal(await page.locator('#panel-contact').isVisible(), false, 'inactive tab panel is hidden after enhancement');
  await page.locator('#tab-contact').click();
  assert.equal(await page.locator('#tab-contact').getAttribute('aria-selected'), 'true', 'contact tab becomes selected');
  assert.equal(await page.locator('#panel-contact').isVisible(), true, 'contact panel becomes visible');
  assert.equal(await page.locator('#panel-general').isVisible(), false, 'previous panel is hidden');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#tab-contact').focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#tab-sales').getAttribute('aria-selected'), 'true', 'RTL horizontal tab rail responds to ArrowLeft on mobile');
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForFunction(() => document.querySelector('[role="tablist"]')?.getAttribute('aria-orientation') === 'horizontal');
  assert.equal(await page.locator('[role="tablist"]').getAttribute('aria-orientation'), 'horizontal', 'tablet Settings navigation remains horizontally scrollable');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForFunction(() => document.querySelector('[role="tablist"]')?.getAttribute('aria-orientation') === 'vertical');
  assert.equal(await page.locator('[role="tablist"]').getAttribute('aria-orientation'), 'vertical', 'desktop Settings navigation uses a vertical sidebar');
  await page.locator('#tab-sales').focus();
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('#tab-shell').getAttribute('aria-selected'), 'true', 'vertical settings sidebar responds to ArrowDown on desktop');
  assert.equal(await page.locator('#panel-shell').isVisible(), true);
  await page.locator('#tab-sales').click();
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
  await page.setViewportSize({ width: 390, height: 844 });
  for (const selector of ['.settings-page-heading > div > p:last-child', '.settings-panel__heading p']) await assertFontSize(page, selector, 16, 'Settings explanatory copy');
  for (const selector of ['.admin-review-banner strong', '.settings-sidebar__note p', '.settings-callout p', '.preview-field small', '.status-summary-card small']) await assertFontSize(page, selector, 13, 'Settings notice/help/disclosure text');
  await assertFontSize(page, '.settings-tab', 12, 'Settings control labels');
  for (const viewport of viewportMatrix) {
    await page.setViewportSize(viewport);
    await assertNoOverflow(page, `Theme Settings ${viewport.width}×${viewport.height}`);
  }

  const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  watch(reducedPage);
  await reducedPage.goto(pageUrl(''), { waitUntil: 'networkidle' });
  assert.equal(await reducedPage.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
  assert.equal(await reducedPage.locator('html').evaluate((node) => node.classList.contains('has-motion')), false, 'reduced motion avoids adding reveal animations');
  assert.equal(await reducedPage.locator('.workflow-track').evaluate((node) => getComputedStyle(node).opacity), '1', 'content remains visible with reduced motion');
  await reducedContext.close();

  const noJsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false, reducedMotion: 'reduce' });
  const noJsPage = await noJsContext.newPage();
  watch(noJsPage);
  await noJsPage.goto(pageUrl(''), { waitUntil: 'networkidle' });
  assert.equal(await noJsPage.locator('#mobile-navigation').evaluate((node) => node.open), false);
  await noJsPage.locator('#mobile-navigation > summary').click();
  assert.equal(await noJsPage.locator('#mobile-navigation').evaluate((node) => node.open), true, 'native mobile disclosure works without JavaScript');
  await noJsPage.goto(pageUrl('theme-settings.html'), { waitUntil: 'networkidle' });
  assert.equal(await noJsPage.locator('#panel-general').isVisible(), true, 'no-JavaScript Settings fallback shows the first section');
  assert.equal(await noJsPage.locator('#panel-status').isVisible(), true, 'no-JavaScript Settings fallback keeps every panel readable');
  await noJsPage.locator('#tab-sales').click();
  assert.equal(new URL(noJsPage.url()).hash, '#panel-sales', 'no-JavaScript tab links still navigate to their section');
  await noJsContext.close();

  assert.deepEqual(diagnostics.externalRequests, [], `no external requests: ${diagnostics.externalRequests.join(', ')}`);
  assert.deepEqual(diagnostics.failedRequests, [], `no failed requests: ${diagnostics.failedRequests.join(', ')}`);
  assert.deepEqual(diagnostics.badResponses, [], `no broken local responses: ${diagnostics.badResponses.join(', ')}`);
  assert.deepEqual(diagnostics.outOfBaseRequests, [], `no same-origin requests escape the Pages base path: ${diagnostics.outOfBaseRequests.join(', ')}`);
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
  if (server?.listening) await new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()));
}
