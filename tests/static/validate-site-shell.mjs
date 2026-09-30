/**
 * Static guardrails for the site-shell navigation slice: canonical menu
 * definition, Koorosh shell markers, progressive-enhancement assets and
 * honesty boundaries. Navigation-route checks are link/structure facts, not
 * marketing-truth proof.
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { primaryMenu, footerMenu, slugReferences } from '../../reconstruction/site-shell/menu.mjs';
import { pageIdentity as homeIdentity } from '../../reconstruction/homepage/recipe.mjs';
import { pageIdentity as overviewIdentity } from '../../reconstruction/product-overview/recipe.mjs';
import { pageIdentity as demoIdentity } from '../../reconstruction/demo/recipe.mjs';
import { pageIdentity as appointmentIdentity } from '../../reconstruction/appointment-reception-queue/recipe.mjs';
import { pageIdentity as recordIdentity } from '../../reconstruction/patient-record-continuity/recipe.mjs';
import { pageIdentity as workspaceIdentity } from '../../reconstruction/doctor-workspace/recipe.mjs';
import { pageIdentity as portalIdentity } from '../../reconstruction/patient-portal/recipe.mjs';
import { pageIdentity as faqIdentity } from '../../reconstruction/faq/recipe.mjs';
import { pageIdentity as securityIdentity } from '../../reconstruction/security-data-access/recipe.mjs';
import { pageIdentity as privacyIdentity } from '../../reconstruction/privacy/recipe.mjs';
import { pageIdentity as termsIdentity } from '../../reconstruction/terms/recipe.mjs';
import { pageIdentity as contactIdentity } from '../../reconstruction/contact/recipe.mjs';

const read = rel => readFileSync(new URL('../../' + rel, import.meta.url), 'utf8');

// ---- 1. Menu structure: buyer journey, small top level, real pages only ----
const knownSlugs = new Set([
  homeIdentity.slug, overviewIdentity.slug, demoIdentity.slug,
  appointmentIdentity.slug, recordIdentity.slug, workspaceIdentity.slug, portalIdentity.slug,
  faqIdentity.slug, securityIdentity.slug, privacyIdentity.slug, termsIdentity.slug, contactIdentity.slug,
]);
for (const { slug } of slugReferences()) {
  assert(knownSlugs.has(slug), `Menu references a page that no recipe reconstructs: ${slug}`);
}
assert.deepEqual(
  primaryMenu.items.map(i => i.title),
  ['خانه', 'محصول', 'جریان‌های کاری', 'درخواست دمو / مشاوره'],
  'Primary top-level stays minimal and follows the buyer journey',
);
assert(primaryMenu.items.length <= 4, 'Top-level navigation stays small');
const workflows = primaryMenu.items.find(i => i.title === 'جریان‌های کاری');
assert(workflows && workflows.url === '#', 'Workflows parent is a disclosure item, not a fake page');
assert.deepEqual(
  workflows.children.map(c => [c.title, c.slug]),
  [
    ['نوبت، پذیرش و صف', 'appointment-reception-queue'],
    ['پرونده بیمار', 'patient-record-continuity'],
    ['فضای کاری پزشک', 'doctor-workspace'],
    ['پورتال بیمار', 'patient-portal'],
  ],
  'Workflow submenu covers exactly the four existing workflow pages with visitor-facing labels',
);
assert(workflows.children.every(c => !c.children), 'Navigation depth stays at 2 (no nested submenus)');
assert.deepEqual(
  footerMenu.items.map(i => i.slug),
  ['cpms-home', 'product-overview', 'appointment-reception-queue', 'patient-record-continuity', 'doctor-workspace', 'patient-portal', 'faq', 'security-data-access', 'demo', 'contact', 'privacy', 'terms'],
  'Footer menu links only to real current pages including /contact/, /privacy/ and /terms/',
);
assert.equal(footerMenu.items.find(i => i.slug === 'contact')?.title, 'تماس با ما', 'Footer menu contact label must be تماس با ما');
assert.equal(footerMenu.items.find(i => i.slug === 'privacy')?.title, 'حریم خصوصی', 'Footer menu privacy label must be حریم خصوصی');
assert.equal(footerMenu.items.find(i => i.slug === 'terms')?.title, 'شرایط استفاده', 'Footer menu terms label must be شرایط استفاده');
// FAQ, Security, Contact, Privacy, and Terms are footer destinations, not top-level header items.
assert(!primaryMenu.items.some(i => i.slug === faqIdentity.slug || i.title === 'پرسش‌های متداول'), 'FAQ must not become a top-level header item');
assert(!primaryMenu.items.some(i => i.slug === securityIdentity.slug || i.title === 'امنیت و دسترسی به داده'), 'Security page must not become a top-level header item');
assert(!primaryMenu.items.some(i => i.slug === contactIdentity.slug || i.title === 'تماس با ما'), 'Contact must not become a top-level header item (primary navigation unchanged)');
assert(!primaryMenu.items.some(i => i.slug === privacyIdentity.slug || i.title === 'حریم خصوصی'), 'Privacy page must not become a top-level header item');
assert(!primaryMenu.items.some(i => i.slug === termsIdentity.slug || i.title === 'شرایط استفاده'), 'Terms page must not become a top-level header item');
const allTitles = slugReferences().map(r => r.title).concat(primaryMenu.items.map(i => i.title), [primaryMenu.name, footerMenu.name]);
for (const title of allTitles) {
  assert(!/mailto:|tel:|https?:\/\//.test(title), `No contact/URL invention inside menu labels: ${title}`);
}
assert(!slugReferences().some(r => /about/.test(r.slug)), 'No unbuilt about destinations (Contact is a real reconstructed page)');

// ---- 2. Header shell markers ------------------------------------------------
const header = read('themes/koorosh/header.php');
for (const marker of [
  'elementor_theme_do_location( \'header\' )',
  "has_nav_menu( 'primary' )",
  "'theme_location'       => 'primary'",
  'site-primary-navigation',
  'class="nav-toggle"',
  'aria-expanded="false"',
  'aria-controls="site-primary-navigation"',
  "home_url( '/demo/' )",
  'درخواست دمو / مشاوره',
  'skip-link',
  'site-title',
]) {
  assert(header.includes(marker), `header.php missing sales-shell marker: ${marker}`);
}
assert(!/mailto:|tel:/.test(header), 'Header must not invent phone/email contact data');

// ---- 3. Footer shell markers -------------------------------------------------
const footer = read('themes/koorosh/footer.php');
for (const marker of [
  'elementor_theme_do_location( \'footer\' )',
  "has_nav_menu( 'footer' )",
  "'theme_location'       => 'footer'",
]) {
  assert(footer.includes(marker), `footer.php missing marker: ${marker}`);
}
assert(!/mailto:|tel:|telegram|instagram|whatsapp/i.test(footer), 'Footer must not invent contact/social data');

// ---- 4. Theme wiring ----------------------------------------------------------
const functionsPhp = read('themes/koorosh/functions.php');
assert(/register_nav_menus\([\s\S]*'primary'/.test(functionsPhp), 'Primary menu location stays registered');
assert(/register_nav_menus\([\s\S]*'footer'/.test(functionsPhp), 'Footer menu location stays registered');
assert(functionsPhp.includes("'koorosh-nav'"), 'nav.js is enqueued');
assert(functionsPhp.includes('nav_menu_link_attributes'), 'Current-page state is exposed via aria-current filter');
assert(functionsPhp.includes("'aria-current'"), 'aria-current attribute is set for the current page item');

const navJs = read('themes/koorosh/nav.js');
assert(!/jquery/i.test(navJs) && !navJs.includes('$('), 'nav.js must stay dependency-free vanilla JS');
assert(!navJs.includes('import ') && !navJs.includes('require('), 'nav.js stays a tiny classic script, not a JS system');
assert(navJs.length < 8000, 'nav.js stays tiny');
for (const marker of ['koorosh-js', 'aria-expanded', 'Escape', 'submenu-toggle', 'nav-open', "matchMedia('(min-width: 48em)')"]) {
  assert(navJs.includes(marker), `nav.js missing accessibility behavior marker: ${marker}`);
}

const css = read('themes/koorosh/foundation.css');
for (const marker of ['.nav-toggle', '.submenu-toggle', '.submenu-open', '.nav-open', 'koorosh-js', '.header-cta', '@media (min-width: 48em)', '@media (max-width: 47.99em)', ':focus-within']) {
  assert(css.includes(marker), `foundation.css missing navigation pattern: ${marker}`);
}
assert(!css.includes('@import'), 'No remote CSS import');
assert(!/url\(\s*['"]?https?:/i.test(css), 'No remote asset references in foundation.css');

// ---- 5. Manifest honesty ------------------------------------------------------
const manifest = JSON.parse(read('reconstruction/site-shell/manifest.json'));
assert.equal(manifest.publication, 'TARGET — NOT PUBLICATION-APPROVED');
assert(manifest.lead_delivery.includes('NOT CONFIGURED / NOT AUTHORIZED'), 'Lead-delivery blocker stays recorded');
assert.equal(manifest.canonical_definition, 'reconstruction/site-shell/menu.mjs');
for (const key of ['canonical_definition', 'browser_runner', 'static_validator']) {
  assert(existsSync(new URL('../../' + manifest[key], import.meta.url)), `Manifest path missing: ${manifest[key]}`);
}

console.log(`PASS: Site-shell navigation guardrails (${slugReferences().length} real page destinations; structure owned by WordPress menu APIs)`);
