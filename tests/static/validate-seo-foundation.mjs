/**
 * Static guardrails for the technical-SEO / launch-hardening foundation.
 *
 * SCOPE AND LIMITS (read before trusting any PASS here):
 * these are REPOSITORY-CONTENT checks. They prove what is committed, not how a
 * production host behaves. Real crawling/indexing behaviour can only be proven
 * on the real production environment after launch (docs/TECHNICAL-FOUNDATION
 * §9). Runtime behaviour in the ephemeral wp-env is covered separately by
 * tests/browser/seo-foundation.mjs, and that too is CI evidence only.
 *
 * Checked here:
 *  1. Page metadata audit: unique, meaningful titles and meta descriptions for
 *     every implemented sales page; anti-cannibalization ownership of the
 *     primary clinic/practice-management head cluster by Product Overview.
 *  2. No staging/test/localhost host committed as site metadata anywhere in the
 *     theme or the page recipes (staging-URL leak prevention).
 *  3. Canonical strategy stays WordPress-native and single-sourced: the theme
 *     neither prints its own canonical nor removes core `rel_canonical`.
 *  4. Indexability stays environment-driven: the theme's noindex layer is
 *     conditional on the core `blog_public` option and the repository never
 *     forces an indexable default.
 *  5. No SEO plugin is introduced (wp-env plugin pin unchanged) and the core
 *     sitemap provider is not disabled/forced by theme code.
 *  6. Utility 404 template exists with real recovery links, no fake search and
 *     no marketing claim.
 *  7. Structured data stays absent: no JSON-LD, no FAQPage, no Organization.
 *  8. CI actually runs the runtime SEO evidence runner.
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

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
import { pageIdentity as privacy } from '../../reconstruction/privacy/recipe.mjs';
import { pageIdentity as terms } from '../../reconstruction/terms/recipe.mjs';

const root = resolve(import.meta.dirname, '../..');
const read = rel => readFileSync(resolve(root, rel), 'utf8');

/** Every implemented, publicly routable sales and utility page in the current site. */
export const implementedPages = [
  homepage, productOverview, demo, appointment, patientRecord,
  doctorWorkspace, patientPortal, prescriptions, faq, security,
  privacy, terms,
];

// ---- 1. Title / meta-description audit --------------------------------------
assert.equal(implementedPages.length, 12, 'The audit must cover every implemented sales and utility page');

for (const page of implementedPages) {
  assert(typeof page.title === 'string' && page.title.trim().length > 0, `Title present: ${page.slug}`);
  assert(typeof page.slug === 'string' && /^[a-z0-9-]+$/.test(page.slug), `ASCII-stable slug: ${page.slug}`);
  assert(typeof page.description === 'string', `Meta description present: ${page.slug}`);
  // Google's snippet guidance: unique, human-readable, page-specific descriptions.
  // Length is a legibility guardrail only — Google documents no fixed limit.
  assert(page.description.length > 50 && page.description.length <= 220, `Meta description legible length: ${page.slug} (${page.description.length})`);
  assert(page.title.length <= 110, `Title stays legible: ${page.slug} (${page.title.length})`);
  assert(!/\b(lorem|todo|tbd|placeholder|xxx)\b/i.test(`${page.title} ${page.description}`), `No placeholder metadata: ${page.slug}`);
  // No unsupported claim inserted purely for SEO.
  for (const banned of [/بهترین/, /شماره\s*یک/, /تضمین/, /۱۰۰\s*٪/, /100\s*%/, /رایگان برای همیشه/]) {
    assert(!banned.test(`${page.title} ${page.description}`), `No superlative/guarantee claim in metadata: ${page.slug} (${banned})`);
  }
  // Keyword stuffing guard: no token repeated excessively inside one description.
  const counts = new Map();
  for (const word of page.description.split(/[\s,،.؛:()«»]+/).filter(w => w.length > 3)) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  const worst = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  assert(!worst || worst[1] <= 3, `No keyword stuffing in description: ${page.slug} (${worst && worst.join(' x')})`);
}

const titles = implementedPages.map(p => p.title);
const descriptions = implementedPages.map(p => p.description);
const slugs = implementedPages.map(p => p.slug);
assert.equal(new Set(titles).size, titles.length, 'All page titles are unique');
assert.equal(new Set(descriptions).size, descriptions.length, 'All meta descriptions are unique');
assert.equal(new Set(slugs).size, slugs.length, 'All page slugs are unique');

// Anti-cannibalization: exactly one page may own the head cluster in its title.
const headCluster = /نرم\s?افزار\s+مدیریت\s+(?:مطب|کلینیک)|نرم‌افزار\s+مدیریت\s+(?:مطب|کلینیک)/;
const headOwners = implementedPages.filter(p => headCluster.test(p.title));
assert.deepEqual(headOwners.map(p => p.slug), ['product-overview'], 'Product Overview solely owns the head cluster in titles');

// ---- 2. Staging / development URL leak prevention ---------------------------
const scanned = [];
const walk = dir => {
  for (const entry of readdirSync(resolve(root, dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(resolve(root, rel)).isDirectory()) {
      walk(rel);
    // Documentation (*.md) legitimately discusses the ephemeral CI host and the
    // owner-reported test host as EVIDENCE; only files that shape real site
    // output or committed page metadata are leak-scanned.
    } else if (/\.(php|css|js|mjs|json)$/.test(entry)) {
      scanned.push(rel);
    }
  }
};
walk('themes');
walk('reconstruction');
assert(scanned.length > 20, 'Leak scan actually walked the theme and recipe tree');

// Any host that is evidence about a TEST/DEV environment must never be committed
// as site metadata. begoobehesh.ir is an owner-reported TEST host, not an
// accepted production canonical domain (no production domain is established).
const forbiddenHosts = [
  /begoobehesh/i,                                            // owner-reported TEST host
  /(?:https?:)?\/\/localhost(?::\d+)?/i,                     // wp-env / local dev origin
  /(?:https?:)?\/\/127\.0\.0\.1(?::\d+)?/,
  /(?:https?:)?\/\/[^\s"'`)>\]]*\.(?:local|test)\b/i,
  /(?:https?:)?\/\/staging\./i,
  /ngrok/i,
];
for (const rel of scanned) {
  const body = read(rel);
  for (const host of forbiddenHosts) {
    assert(!host.test(body), `No staging/dev host committed in site metadata/composition: ${rel} (${host})`);
  }
  // Nothing in the site composition may hardcode an absolute site origin.
  for (const url of body.match(/https?:\/\/[^\s"'`)>\]]+/g) || []) {
    const host = new URL(url).host;
    const allowed = ['github.com', 'www.gnu.org', 'scripts.sil.org', 'elementor.com', 'developers.elementor.com', 'developers.google.com', 'schemas.wp.org', 'wordpress.org', 'developer.wordpress.org', 'downloads.wordpress.org'];
    assert(allowed.includes(host), `Only documentation/licence hosts may appear in committed files: ${rel} → ${url}`);
  }
}

// ---- 3. Canonical strategy: WordPress-native, exactly one source ------------
const functions = read('themes/koorosh/functions.php');
const themePhp = ['functions.php', 'header.php', 'footer.php', 'index.php', 'page-elementor.php', '404.php', 'demo-form.php']
  .map(f => read(`themes/koorosh/${f}`)).join('\n');
assert(!/rel=["']canonical["']/i.test(themePhp), 'The theme must not print its own canonical tag (core rel_canonical owns it)');
assert(!/remove_action\(\s*['"]wp_head['"]\s*,\s*['"]rel_canonical['"]/.test(themePhp), 'The theme must not remove the core canonical');
assert(/rel_canonical/.test(functions), 'The canonical decision is documented in functions.php');
assert(!/home_url\(\s*['"]https?:/.test(themePhp), 'No hardcoded absolute origin in theme link building');

// ---- 4. Indexability stays environment-driven -------------------------------
assert(/X-Robots-Tag/.test(functions), 'Development noindex HTTP header layer exists');
assert(/koorosh_search_engine_visible/.test(functions), 'Indexability is resolved through the documented blog_public helper');
assert(/get_option\(\s*'blog_public'\s*\)/.test(functions), 'The indexability switch is the core blog_public option');
assert(!/update_option\(\s*['"]blog_public['"]/.test(themePhp), 'Theme code must never flip the indexability switch itself');
assert(/Google Search Central/.test(functions), 'The honest robots.txt-versus-noindex limit is recorded next to the code');
// No unconditional indexing directives anywhere in the theme.
assert(!/content=["']\s*index/i.test(themePhp), 'No hardcoded index directive in the theme');
assert(!/__return_true/.test(functions.match(/wp_robots[\s\S]{0,200}/)?.[0] || ''), 'No forced-visible robots override');

// ---- 5. No SEO plugin, no sitemap override ----------------------------------
const wpEnv = JSON.parse(read('.wp-env.json'));
assert.equal(wpEnv.plugins.length, 1, 'No plugin added for SEO purposes');
assert(/elementor\./.test(wpEnv.plugins[0]), 'The only pinned plugin remains Elementor');
assert(!/wp_sitemaps_enabled/.test(themePhp), 'Core sitemap behaviour is neither disabled nor forced by the theme');
assert(!/do_robotstxt|robots_txt/.test(themePhp), 'Core robots.txt behaviour is not overridden by the theme');

// ---- 6. Utility 404 ----------------------------------------------------------
assert(existsSync(resolve(root, 'themes/koorosh/404.php')), 'A theme 404 template exists');
const notFound = read('themes/koorosh/404.php');
assert(/get_header\(\s*\)/.test(notFound) && /get_footer\(\s*\)/.test(notFound), '404 keeps the normal site shell (header/nav/footer)');
assert(/<h1/.test(notFound), '404 has a single semantic H1');
assert.equal((notFound.match(/<h1/g) || []).length, 1, 'Exactly one H1 on the 404 template');
assert(/home_url\(\s*'\/'\s*\)/.test(notFound), '404 links back to the homepage');
assert(/product-overview/.test(notFound) && /'demo'/.test(notFound), '404 offers the product and demo recovery routes');
assert(/get_page_by_path/.test(notFound), '404 recovery links resolve real existing pages only (never a link into another 404)');
assert(!/get_search_form|type=["']search["']|<form/.test(notFound), 'No fake search functionality on the 404');
assert(!/status_header|wp_redirect|wp_safe_redirect/.test(notFound), 'No status override and no redirect: the 404 must stay a real 404');
for (const claim of [/بهترین/, /تضمین/, /رایگان/, /سریع‌ترین/, /قدرتمند/]) {
  assert(!claim.test(notFound), `No marketing claim on the utility 404 (${claim})`);
}

// ---- 7. Structured data stays absent ----------------------------------------
for (const rel of scanned.filter(f => /^(themes|reconstruction)\/.*\.(php|mjs|js)$/.test(f))) {
  const body = read(rel);
  assert(!/application\/ld\+json/i.test(body), `No JSON-LD emitted: ${rel}`);
  assert(!/"@context"|'@context'/.test(body), `No schema.org context emitted: ${rel}`);
  assert(!/itemtype\s*=/.test(body), `No microdata emitted: ${rel}`);
  assert(!/FAQPage/.test(body), `FAQ structured data stays omitted (accepted current-Google decision): ${rel}`);
  assert(!/"@type"\s*:\s*"Organization"/.test(body), `No Organization schema (no verified business identity facts exist): ${rel}`);
}

// ---- 8. CI wiring -------------------------------------------------------------
const workflow = read('.github/workflows/wordpress-elementor-smoke.yml');
assert(/tests\/browser\/seo-foundation\.mjs/.test(workflow), 'CI runs the runtime SEO/indexability evidence runner');
assert(/tests\/static\/validate\.sh/.test(workflow), 'CI runs the static suite');
const validateSh = read('tests/static/validate.sh');
assert(/validate-seo-foundation\.mjs/.test(validateSh), 'The static suite runs these guardrails');

console.log(`PASS: SEO foundation static guardrails (${implementedPages.length} pages audited, ${scanned.length} files leak-scanned)`);
