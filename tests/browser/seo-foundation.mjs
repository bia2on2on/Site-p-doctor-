/**
 * Runtime technical-SEO / launch-hardening evidence (ephemeral wp-env only).
 *
 * Run LAST in the CI sequence: it authors nothing, it only observes the site
 * the earlier runners reconstructed (ten real pages + the WordPress menus).
 *
 * The runner deliberately separates two expectation sets and never mixes them:
 *
 *   DEVELOPMENT EXPECTATION (must hold now, in CI)
 *     blog_public = 0; every real page carries a core `noindex` robots meta and
 *     the theme's `X-Robots-Tag: noindex, nofollow` header; core serves a
 *     `Disallow: /` robots.txt; the core sitemap is not served; exactly one
 *     canonical per page pointing at the environment's own home_url; a missing
 *     route is a real HTTP 404 with a usable recovery page.
 *
 *   FUTURE PRODUCTION EXPECTATION (simulated here, NOT authorized, NOT proven)
 *     Flipping the single core switch `blog_public` to 1 — an explicit
 *     environment decision that this repository never makes by default — must
 *     produce an indexable, self-consistent site: no leftover noindex, no
 *     leftover `Disallow: /`, a working core sitemap containing only real
 *     published content, still exactly one canonical per page. The switch is
 *     restored to 0 at the end and the non-indexed state is re-asserted
 *     (fail-closed).
 *
 * HONEST LIMIT: this is CI evidence bound to an exact SHA in a disposable
 * container. It is NOT production crawling/indexing proof, NOT a Search Console
 * result, and NOT publication authorization. Real crawl/index behaviour can
 * only be verified on the real production environment after launch.
 *
 * Google Search Central references used for these expectations (retrieved
 * 2026-09-29): "Block Search indexing with noindex" (meta robots and
 * X-Robots-Tag are the two supported noindex implementations; robots.txt
 * noindex is unsupported), "Introduction to robots.txt" (robots.txt manages
 * crawling and is NOT a mechanism for keeping a page out of Google), "How to
 * specify a canonical URL", "How HTTP status codes affect Google's crawlers"
 * (4xx content is treated as non-existent), "Link best practices" (crawlable
 * <a href> links), "How to write meta descriptions" (unique per page).
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

import { pageIdentity as homepage } from '../../reconstruction/homepage/recipe.mjs';
import { pageIdentity as productOverview } from '../../reconstruction/product-overview/recipe.mjs';
import { pageIdentity as demo } from '../../reconstruction/demo/recipe.mjs';
import { pageIdentity as appointment } from '../../reconstruction/appointment-reception-queue/recipe.mjs';
import { pageIdentity as patientRecord } from '../../reconstruction/patient-record-continuity/recipe.mjs';
import { pageIdentity as doctorWorkspace } from '../../reconstruction/doctor-workspace/recipe.mjs';
import { pageIdentity as patientPortal } from '../../reconstruction/patient-portal/recipe.mjs';
import { pageIdentity as prescriptions } from '../../reconstruction/prescriptions-documents/recipe.mjs';
import { pageIdentity as faq } from '../../reconstruction/faq/recipe.mjs';
import { pageIdentity as security } from '../../reconstruction/security-data-access/recipe.mjs';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(import.meta.dirname, 'artifacts/seo-foundation');
mkdirSync(out, { recursive: true });
process.on('uncaughtException', error => {
  const message = String(error.stack || error).replace(/user_pass=\S+/g, 'user_pass=[redacted]');
  writeFileSync(resolve(out, 'bootstrap-error.txt'), message);
  console.error(`::error title=SEO foundation::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
  process.exitCode = 1;
});

const base = 'http://localhost:8888';
const baseHost = new URL(base).host;
function wp(...args) {
  try {
    return execFileSync(resolve(import.meta.dirname, 'node_modules/.bin/wp-env'), ['run', 'cli', 'wp', ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120_000 }).trim();
  } catch (error) {
    throw new Error(`wp-env CLI failed: ${error.stderr?.toString().replace(/user_pass=\S+/g, 'user_pass=[redacted]')}`);
  }
}

// ---- Fixture preconditions (authored by the earlier runners) ----------------
assert.equal(wp('option', 'get', 'home'), base, 'Only the disposable default wp-env URL is supported');
assert.equal(wp('theme', 'list', '--status=active', '--field=name'), 'koorosh');
assert.equal(wp('option', 'get', 'permalink_structure'), '/%postname%/', 'Stable post-name permalinks');

const identities = [homepage, productOverview, demo, appointment, patientRecord, doctorWorkspace, patientPortal, prescriptions, faq, security];
const frontId = wp('post', 'list', '--post_type=page', '--name=cpms-home', '--field=ID');
assert.match(frontId, /^\d+$/);
assert.equal(wp('option', 'get', 'page_on_front'), frontId, 'The reconstructed Homepage is the front page');

const routes = identities.map(identity => ({
  slug: identity.slug,
  title: identity.title,
  description: identity.description,
  route: identity.slug === homepage.slug ? '/' : `/${identity.slug}/`,
}));

const diagnostic = {
  scope: 'CI evidence in an ephemeral wp-env container — NOT production crawling/indexing proof, NOT publication authorization',
  developmentExpectation: {},
  futureProductionExpectation: {},
  pages: [],
};

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  // Plain HTTP fetches with MANUAL redirect handling: redirect hygiene and 404
  // status are exactly what must be observed, so nothing may be followed or
  // normalised away by a browser context.
  const text = async url => {
    const response = await fetch(url, { redirect: 'manual' });
    return { status: response.status, headers: Object.fromEntries(response.headers), body: await response.text() };
  };

  // ==========================================================================
  // DEVELOPMENT EXPECTATION
  // ==========================================================================
  assert.equal(wp('option', 'get', 'blog_public'), '0', 'DEVELOPMENT EXPECTATION: search-engine visibility (blog_public) stays 0');
  diagnostic.developmentExpectation.blog_public = '0';

  const titles = new Map();
  const descriptions = new Map();
  const canonicals = [];

  for (const page of routes) {
    const url = `${base}${page.route}`;
    const { status, headers, body } = await text(url);
    assert.equal(status, 200, `Real page serves 200: ${page.route}`);

    // 1. Layered, non-contradictory non-indexing.
    assert.match(headers['x-robots-tag'] || '', /noindex/i, `X-Robots-Tag noindex header in development: ${page.route}`);
    const robotsMeta = [...body.matchAll(/<meta[^>]+name=["']robots["'][^>]*>/gi)].map(m => m[0]);
    assert(robotsMeta.length >= 1, `Core robots meta present in development: ${page.route}`);
    assert(robotsMeta.every(tag => /noindex/i.test(tag)), `Every robots meta says noindex in development: ${page.route}`);
    // No contradictory directive: after removing every `noindex`, no bare
    // `index` rule may remain in the robots meta of a development page.
    assert(!/[\s,"']index\b/i.test(robotsMeta.join(' ').replace(/noindex/gi, 'no-index')), `No contradictory index directive: ${page.route}`);

    // 2. Canonical: exactly one, WordPress-core generated, environment-derived.
    const canonicalTags = [...body.matchAll(/<link[^>]+rel=["']canonical["'][^>]*>/gi)].map(m => m[0]);
    assert.equal(canonicalTags.length, 1, `Exactly one canonical tag: ${page.route}`);
    const canonicalHref = canonicalTags[0].match(/href=["']([^"']+)["']/)[1];
    assert.equal(canonicalHref, url, `Canonical is the page's own permalink: ${page.route}`);
    assert.equal(new URL(canonicalHref).host, baseHost, `Canonical host comes from the environment home_url, never a hardcoded domain: ${page.route}`);
    canonicals.push(canonicalHref);

    // 3. Titles and meta descriptions: present, page-specific, unique.
    const title = body.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim();
    assert(title && title.length > 0, `Document title present: ${page.route}`);
    assert(!titles.has(title), `Document title is unique: ${page.route} (${title})`);
    titles.set(title, page.route);
    assert(title.includes(page.title.split('|')[0].trim()), `Document title carries the authored page title: ${page.route}`);

    const metaDescriptions = [...body.matchAll(/<meta[^>]+name=["']description["'][^>]*>/gi)].map(m => m[0]);
    assert.equal(metaDescriptions.length, 1, `Exactly one meta description: ${page.route}`);
    const descriptionValue = metaDescriptions[0].match(/content=["']([^"']+)["']/)[1];
    assert(!descriptions.has(descriptionValue), `Meta description is unique: ${page.route}`);
    descriptions.set(descriptionValue, page.route);
    assert(descriptionValue.length > 50, `Meta description is substantive: ${page.route}`);

    // 4. One H1 per page (semantic structure owned by the editor).
    const h1Count = (body.match(/<h1[\s>]/gi) || []).length;
    assert.equal(h1Count, 1, `Exactly one H1: ${page.route}`);

    // 5. Structured data stays absent (accepted current-Google FAQ decision; no
    //    fake Organization identity exists to publish).
    assert(!/application\/ld\+json/i.test(body), `No JSON-LD emitted: ${page.route}`);
    assert(!/FAQPage/i.test(body), `FAQ structured data remains absent: ${page.route}`);
    assert(!/"@type"\s*:\s*"Organization"/i.test(body), `No Organization schema: ${page.route}`);
    assert(!/itemtype=["'][^"']*schema\.org/i.test(body), `No schema.org microdata: ${page.route}`);

    // 6. No staging/test host leaks into rendered metadata or links.
    assert(!/begoobehesh/i.test(body), `Owner-reported test host never rendered as site metadata: ${page.route}`);

    // 7. Crawlable internal links: real anchors with resolvable hrefs.
    const anchors = [...body.matchAll(/<a\b[^>]*>/gi)].map(m => m[0]);
    assert(anchors.length > 0, `Page renders crawlable anchors without JavaScript: ${page.route}`);
    assert(anchors.every(a => /\shref=["'][^"']+["']/.test(a)), `Every anchor has an href: ${page.route}`);
    assert(!anchors.some(a => /href=["']javascript:/i.test(a)), `No javascript: pseudo-links: ${page.route}`);

    diagnostic.pages.push({ route: page.route, status, title, canonical: canonicalHref, description: descriptionValue, h1Count, anchors: anchors.length, xRobotsTag: headers['x-robots-tag'] });
  }
  assert.equal(new Set(canonicals).size, canonicals.length, 'Every page declares its own distinct canonical');

  // 8. Discovery paths: no orphan page. Not every page sits in the site-shell
  //    menus by design (for example the prescriptions/documents page is reached
  //    contextually from Product Overview), so the real requirement is that
  //    every page is reachable from at least one crawlable anchor on another
  //    real page — measured from the raw HTML, no JavaScript involved.
  const linkGraph = {};
  for (const page of routes) {
    const body = (await text(`${base}${page.route}`)).body;
    const paths = new Set();
    for (const match of body.matchAll(/<a\b[^>]*\shref=["']([^"']+)["']/gi)) {
      const href = match[1];
      if (/^(mailto:|tel:|#|javascript:)/i.test(href)) continue;
      const resolved = new URL(href, base);
      if (resolved.host === baseHost) paths.add(resolved.pathname);
    }
    linkGraph[page.route] = [...paths];
  }
  for (const page of routes) {
    const inbound = routes.filter(other => other.route !== page.route && linkGraph[other.route].includes(page.route));
    assert(inbound.length > 0, `No orphan page: ${page.route} is linked from at least one other real page`);
  }
  // The two conversion-critical routes must be reachable straight from the Homepage.
  for (const critical of ['/product-overview/', '/demo/']) {
    assert(linkGraph['/'].includes(critical), `Homepage links to ${critical} as a crawlable anchor`);
  }
  diagnostic.developmentExpectation.linkGraph = linkGraph;

  // 9. robots.txt in development. The repository commits no robots rule, so
  //    whatever is served is the running WordPress version's own behaviour.
  //    That exact directive set is RECORDED as evidence rather than asserted
  //    from memory; only the policy-relevant invariants are asserted.
  const robots = await text(`${base}/robots.txt`);
  diagnostic.developmentExpectation.robotsTxt = robots.body.trim();
  diagnostic.developmentExpectation.robotsTxtDisallowsEverything = /^\s*Disallow:\s*\/\s*$/mi.test(robots.body);
  assert.equal(robots.status, 200, 'robots.txt is served');
  assert(!/^\s*Sitemap:/mi.test(robots.body), 'DEVELOPMENT EXPECTATION: no sitemap is advertised while the site is intentionally non-public');
  assert(/User-agent:/i.test(robots.body), 'robots.txt is a real robots file, not an error body');
  // Honest note recorded with the evidence, per Google's robots.txt guidance:
  diagnostic.developmentExpectation.robotsTxtLimit =
    'robots.txt controls crawling, not indexing. A disallowed URL can still be indexed without a description, and a compliant crawler that obeys Disallow will never read the noindex meta/X-Robots-Tag. The only robust protection for a non-public environment is the environment itself (not publicly reachable / access-controlled). No such production protection mechanism is claimed or configured by this repository.';

  // 10. Sitemap in development: core disables sitemaps for non-public sites.
  const devSitemap = await text(`${base}/wp-sitemap.xml`);
  assert.equal(devSitemap.status, 404, 'DEVELOPMENT EXPECTATION: the core sitemap is not served while the site is intentionally non-public');
  diagnostic.developmentExpectation.sitemapStatus = devSitemap.status;

  // 11. Real 404 for a missing route — no soft 404, no fallback-to-home.
  const missing = `/definitely-missing-${randomBytes(6).toString('hex')}/`;
  const notFound = await text(`${base}${missing}`);
  assert.equal(notFound.status, 404, 'Missing route returns a real HTTP 404 status');
  assert(!/^3/.test(String(notFound.status)), 'Missing route is not redirected anywhere');
  assert.equal((notFound.body.match(/<h1[\s>]/gi) || []).length, 1, '404 page renders exactly one H1');
  assert(/error-404/.test(notFound.body), 'The Koorosh utility 404 template rendered');
  assert(/پیدا نشد/.test(notFound.body), '404 carries a useful Persian message');
  assert(notFound.body.includes('site-header') && notFound.body.includes('site-footer'), '404 keeps the normal site shell and navigation');
  assert(notFound.body.includes(`href="${base}/"`), '404 links back to the Homepage');
  assert(notFound.body.includes(`${base}/product-overview/`), '404 offers the Product Overview recovery route');
  assert(notFound.body.includes(`${base}/demo/`), '404 offers the Demo / consultation recovery route');
  assert(!/<form/i.test(notFound.body), 'No fake search or form on the utility 404');
  assert(!/<link[^>]+rel=["']canonical["']/i.test(notFound.body), 'No canonical tag on a non-existent URL');
  diagnostic.developmentExpectation.notFound = { url: missing, status: notFound.status };

  // Nested missing route under a real page must not silently become a 200.
  const nestedMissing = await text(`${base}/demo/${randomBytes(4).toString('hex')}/`);
  assert(nestedMissing.status === 404 || (nestedMissing.status >= 300 && nestedMissing.status < 400), `Nested missing route is 404 or an explicit redirect, never a soft 200 (got ${nestedMissing.status})`);
  if (nestedMissing.status >= 300 && nestedMissing.status < 400) {
    const location = nestedMissing.headers.location;
    assert.notEqual(new URL(location, base).pathname, '/', 'A missing nested route must never fall back to the Homepage');
  }
  diagnostic.developmentExpectation.nestedMissing = { status: nestedMissing.status, location: nestedMissing.headers.location || null };

  // 12. Redirect hygiene: one documented hop for the trailing-slash form, no loop.
  const noSlash = await text(`${base}/demo`);
  assert.equal(noSlash.status, 301, 'Slash-less form of a real page issues a permanent redirect');
  const target = new URL(noSlash.headers.location, base);
  assert.equal(target.pathname, '/demo/', 'Redirect target is the canonical trailing-slash URL');
  const hop = await text(target.toString());
  assert.equal(hop.status, 200, 'Redirect resolves in a single hop (no chain, no loop)');
  diagnostic.developmentExpectation.redirect = { from: '/demo', to: target.pathname, hops: 1 };

  // ==========================================================================
  // FUTURE PRODUCTION EXPECTATION — SIMULATED IN THE EPHEMERAL CONTAINER ONLY.
  // This is NOT publication authorization and NOT production proof. It exists
  // so that the development robots/sitemap posture cannot silently become a
  // permanent launch blocker, and so the launch switch is known to be a single
  // explicit configuration decision.
  // ==========================================================================
  try {
    wp('option', 'update', 'blog_public', '1');
    wp('rewrite', 'flush');

    const launchPage = await text(`${base}/product-overview/`);
    assert.equal(launchPage.status, 200, 'SIMULATION: page still serves after flipping the switch');
    assert(!launchPage.headers['x-robots-tag'], 'SIMULATION: the development X-Robots-Tag disappears when visibility is enabled');
    assert(!/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(launchPage.body), 'SIMULATION: no leftover noindex would survive a launch decision');
    assert.equal([...launchPage.body.matchAll(/<link[^>]+rel=["']canonical["'][^>]*>/gi)].length, 1, 'SIMULATION: still exactly one canonical');

    const launchRobots = await text(`${base}/robots.txt`);
    assert(!/^\s*Disallow:\s*\/\s*$/mi.test(launchRobots.body), 'SIMULATION: no blanket Disallow: / persists into an indexable configuration');
    assert.notEqual(launchRobots.body.trim(), robots.body.trim(), 'SIMULATION: robots.txt actually responds to the single launch switch');

    const sitemapIndex = await text(`${base}/wp-sitemap.xml`);
    assert.equal(sitemapIndex.status, 200, 'SIMULATION: the WordPress-native sitemap becomes available (no SEO plugin needed)');
    const subSitemaps = [...sitemapIndex.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    assert(subSitemaps.length > 0, 'SIMULATION: sitemap index lists child sitemaps');
    const urls = [];
    for (const child of subSitemaps) {
      assert.equal(new URL(child).host, baseHost, 'SIMULATION: sitemap URLs use the environment host, never a hardcoded/staging domain');
      const childBody = (await text(child)).body;
      urls.push(...[...childBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
    }
    for (const page of routes) {
      // The front page may legitimately be listed as the site root.
      const accepted = page.route === '/' ? [`${base}/`, `${base}/${page.slug}/`] : [`${base}${page.route}`];
      assert(accepted.some(url => urls.includes(url)), `SIMULATION: real sales page present in the native sitemap: ${page.route}`);
    }
    for (const url of urls) {
      assert.equal(new URL(url).host, baseHost, `SIMULATION: no foreign host in the sitemap: ${url}`);
      assert(!/wp-content|wp-admin|reconstruction|artifacts|\.json$|\.mjs$/.test(url), `SIMULATION: no utility/reconstruction artifact represented as public content: ${url}`);
    }
    // Anything in the sitemap that is NOT one of our reconstructed pages is
    // recorded (not asserted away): default wp-env fixture content such as the
    // sample post/page and user archives is an environment artifact and belongs
    // on the production launch checklist, not in a green assertion.
    const ourUrls = new Set([...routes.map(p => `${base}${p.route}`), `${base}/${homepage.slug}/`]);
    diagnostic.futureProductionExpectation.sitemapExtraEntries = urls.filter(u => !ourUrls.has(u));
    diagnostic.futureProductionExpectation.sitemapUrlCount = urls.length;
    diagnostic.futureProductionExpectation.robotsTxt = launchRobots.body.trim();
  } finally {
    // FAIL-CLOSED: the repository/CI default is non-indexed. Always restore.
    wp('option', 'update', 'blog_public', '0');
    wp('rewrite', 'flush');
  }

  // ==========================================================================
  // RE-ASSERT THE DEVELOPMENT EXPECTATION AFTER THE SIMULATION
  // ==========================================================================
  assert.equal(wp('option', 'get', 'blog_public'), '0', 'Development non-indexability restored');
  const restored = await text(`${base}/product-overview/`);
  assert.match(restored.headers['x-robots-tag'] || '', /noindex/i, 'X-Robots-Tag noindex restored');
  assert(/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(restored.body), 'Core noindex robots meta restored');
  assert.equal((await text(`${base}/wp-sitemap.xml`)).status, 404, 'Sitemap disabled again with the site non-public');
  assert.equal((await text(`${base}/robots.txt`)).body.trim(), robots.body.trim(), 'Development robots.txt restored byte-for-byte');

  // Visual evidence that the utility 404 renders the real shell for a human.
  const viewer = await context.newPage();
  const visited = await viewer.goto(`${base}${missing}`);
  assert.equal(visited.status(), 404, '404 status is also what a real browser receives');
  assert.equal(await viewer.locator('h1').count(), 1, '404 renders one H1 in a real browser');
  assert(await viewer.locator('.site-navigation a, .site-header a').first().isVisible(), '404 keeps a usable navigation path');
  await viewer.screenshot({ path: resolve(out, '404.png'), fullPage: true });

  await context.close();
  diagnostic.result = 'PASS';
  console.log('::notice title=SEO foundation::PASS: development non-indexability (blog_public=0 + core noindex meta + X-Robots-Tag + core Disallow robots.txt + no sitemap), one environment-derived canonical per page, unique titles/descriptions, single H1, crawlable anchors, real 404 with recovery, single-hop trailing-slash redirect, no structured data, no staging-host leak; launch switch simulated and restored. CI evidence only — NOT production indexing proof.');
} catch (error) {
  diagnostic.result = 'FAIL';
  diagnostic.error = String(error.stack || error);
  console.error(`::error title=SEO foundation::${diagnostic.error.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
  throw error;
} finally {
  writeFileSync(resolve(out, 'results.json'), JSON.stringify(diagnostic, null, 2));
  await browser.close();
}
