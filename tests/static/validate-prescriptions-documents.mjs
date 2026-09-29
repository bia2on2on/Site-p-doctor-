/**
 * Prescriptions-and-documents page authoring and message guardrails.
 * These checks prove composition/claim boundaries in the authored source, NOT product
 * capability truth and NOT runtime behavior (the browser runner covers runtime).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prescriptionsDocuments, pageIdentity } from '../../reconstruction/prescriptions-documents/recipe.mjs';
import { pageIdentity as overviewIdentity } from '../../reconstruction/product-overview/recipe.mjs';
import { pageIdentity as appointmentIdentity } from '../../reconstruction/appointment-reception-queue/recipe.mjs';
import { pageIdentity as patientIdentity } from '../../reconstruction/patient-record-continuity/recipe.mjs';
import { pageIdentity as doctorIdentity } from '../../reconstruction/doctor-workspace/recipe.mjs';
import { pageIdentity as portalIdentity } from '../../reconstruction/patient-portal/recipe.mjs';
import * as boundary from './boundary-prescriptions-documents.mjs';
const tokens = JSON.parse(readFileSync(new URL('../../design-system/tokens.json', import.meta.url)));
const nodes = prescriptionsDocuments(tokens).flatMap(function walk(n) { return [n, ...n.children.flatMap(walk)]; });
const strings = nodes.map(n => n.settings.title || n.settings.editor || n.settings.text || '').filter(Boolean);
const copy = strings.join('\n');
const byId = id => nodes.find(n => n.settings._element_id === id);
const descendants = n => n.children.flatMap(c => [c, ...descendants(c)]);

// ---- Identity, SEO boundary and anti-cannibalization -------------------------
assert.equal(pageIdentity.slug, 'prescriptions-documents');
assert(!/e-?prescri/i.test(pageIdentity.slug), 'The slug never suggests an e-prescription system');
assert.match(pageIdentity.title, /CPMS/);
assert(pageIdentity.title.length <= 100, 'Title stays within a sane meta length');
assert(pageIdentity.description.length > 50 && pageIdentity.description.length <= 200, 'Description within meta limits');
assert(pageIdentity.description.includes('مدیران'), 'Description carries the buyer marker');
for (const other of [overviewIdentity, appointmentIdentity, patientIdentity, doctorIdentity, portalIdentity]) {
  assert(pageIdentity.slug !== other.slug && pageIdentity.title !== other.title && pageIdentity.description !== other.description, 'Identity must not duplicate another page');
}
const clusterOneHead = /نرم\s*افزار\s*مدیریت\s*(مطب|کلینیک)/;
for (const [label, value] of [['title', pageIdentity.title], ['description', pageIdentity.description], ['copy', copy]]) {
  assert(!clusterOneHead.test(value), `Cluster-1 head terms belong to Product Overview, not this page ${label}`);
  assert(!/پرونده الکترونیک بیمار/.test(value), `The Cluster-4 head belongs to the patient-record page, not this page ${label}`);
}
const h1Nodes = nodes.filter(n => n.kind === 'heading' && n.settings.header_size === 'h1');
assert.equal(h1Nodes.length, 1);
const h1 = h1Nodes[0].settings.title;
assert(h1.replace(/<br>/g, ' ').length <= tokens.typography.h1_policy.max_characters, 'H1 respects the token h1_policy character cap');
assert(h1.replace(/<br>/g, ' ') === 'نسخه‌ها و اسناد در ادامهٔ پرونده و جریان کار کلینیک', 'H1 carries the requested framing');
assert(/نسخه‌ها و اسناد/.test(pageIdentity.title) && /برای مدیران کلینیک/.test(pageIdentity.title), 'Title carries the page identity phrase and the buyer marker');
assert(/ثبت و مدیریت/.test(pageIdentity.title), 'Title carries the bounded verb pair (recording and management), not a bare prescription keyword');
assert(/مدیران کلینیک|تصمیم‌گیران کلینیک/.test(copy), 'Buyer audience stated on-page');
assert(copy.includes('راهنمای بیماران برای دریافت یا پیگیری نسخه نیست'), 'Patient-intent disambiguation present');
// «نسخهٔ الکترونیک» is never a target: absent from title/H1/description/eyebrows/H2s, rare in copy.
for (const value of [pageIdentity.title, pageIdentity.description, h1, ...nodes.filter(n => n.kind === 'heading' && ['p', 'h1', 'h2'].includes(n.settings.header_size)).map(n => n.settings.title)]) {
  assert(!/نسخهٔ?\s*الکترونیک/.test(value), `«نسخهٔ الکترونیک» must not appear in titles/H1/H2/eyebrows/description: ${value}`);
}
const electronicMentions = boundary.assertElectronicPrescriptionBoundary(strings, 'authored copy', 4);
assert(electronicMentions >= 2, 'The distinction needs the national term at least where it is negated (hero note and prescriptions panel)');

// ---- Native Free elements, hierarchy, ids, links ----------------------------
assert(nodes.every(n => ['container', 'heading', 'text-editor', 'button'].includes(n.kind)), 'Native Free elements only');
const headings = nodes.filter(n => n.kind === 'heading');
const levels = headings.map(h => h.settings.header_size).filter(s => /^h\d$/.test(s)).map(s => Number(s.slice(1)));
assert.equal(levels[0], 1, 'H1 precedes subsection headings');
assert(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1), 'No skipped heading levels');
const ids = nodes.map(n => n.settings._element_id).filter(Boolean);
assert.equal(ids.length, new Set(ids).size, 'Element IDs are unique');
for (const sectionId of ['introduction', 'context', 'prescriptions', 'documents', 'access', 'not-this', 'faq', 'next-step']) {
  assert(ids.includes(sectionId), `Required section ID missing: ${sectionId}`);
}
for (const boundaryId of ['hero-scope', 'prescriptions-distinction', 'ledger-boundary', 'not-national', 'not-insurance-pharmacy', 'not-clinical-support']) {
  assert(ids.includes(boundaryId), `Required explicit boundary element missing: ${boundaryId}`);
}

// ---- Distinct composition: hero H1 band + context ledger, not a rail/strip/two-sides model
const hero = byId('introduction');
assert.deepEqual(hero.children.map(c => `${c.kind}${c.settings.header_size ? `:${c.settings.header_size}` : ''}`), ['heading:p', 'heading:h1', 'container'],
  'Hero: eyebrow and full-band H1 precede the copy/media row (so the two-line desktop policy is attainable)');
assert(!/←|→|➜|›|‹/.test(copy), 'No arrow language: nothing on this page implies transmission or a hand-off');
assert(!/گام\s*[۰-۹0-9]|مرحلهٔ\s*[۰-۹0-9]/.test(copy), 'No numbered step rail');
assert(!ids.some(id => /^(stage|step|side|bridge|station)-|handoff|connection-model/.test(id)), 'None of the earlier pages\' compositions (stage rail, handoff strip, two-sided model) is reused');
const ledger = byId('context-ledger');
assert(ledger, 'Context ledger present');
assert.deepEqual(ledger.children.map(c => c.settings._element_id), ['ledger-doctor', 'ledger-patient', 'ledger-record', 'ledger-boundary'],
  'Ledger rows in reading order: doctor work, patient context, prescription/document record, outside-CPMS boundary');
for (const rowNode of ledger.children) {
  assert.equal(rowNode.settings.flex_direction, 'row', `Ledger row is side-by-side on desktop: ${rowNode.settings._element_id}`);
  assert.equal(rowNode.settings.flex_direction_tablet, 'column', `Ledger row stacks on tablet/mobile: ${rowNode.settings._element_id}`);
  assert.equal(rowNode.children.length, 2, `Ledger row is exactly layer + meaning: ${rowNode.settings._element_id}`);
  assert.equal(rowNode.children[0].children.filter(c => c.kind === 'heading' && c.settings.header_size === 'h3').length, 1, 'Each layer is labelled by one H3');
}
const [ledgerDoctor, ledgerPatient, ledgerRecord, ledgerBoundary] = ledger.children;
assert(Number(ledgerRecord.settings.border_width.right) >= 3 && ledgerRecord.settings.border_color === tokens.color.roles['accent/primary'].value, 'The record row is the emphasised focus row (accent inline-start rule)');
assert.equal(ledgerBoundary.settings.background_color, tokens.color.roles['background/subtle'].value, 'The outside-CPMS row carries the boundary tint');
assert(ledgerBoundary.settings.background_color !== ledgerRecord.settings.background_color, 'Boundary row is visually distinct from the record row');
assert(/جایی ندارد/.test(JSON.stringify(ledgerBoundary)) && /نمی‌شود/.test(JSON.stringify(ledgerBoundary)), 'The boundary row states the model edge in the negative');
assert(descendants(ledgerDoctor).some(n => n.kind === 'button' && n.settings.link.url === '/doctor-workspace/'), 'Ledger doctor row links to the doctor-workspace page');
assert(descendants(ledgerPatient).some(n => n.kind === 'button' && n.settings.link.url === '/patient-record-continuity/'), 'Ledger patient row links to the patient-record page');
assert(/در صفحهٔ فضای کاری پزشک است/.test(JSON.stringify(ledgerDoctor)) && /در صفحهٔ پروندهٔ بیمار توضیح داده شده است/.test(JSON.stringify(ledgerPatient)), 'Linked rows point onward instead of duplicating the destination content');
assert(/مفهومی/.test(copy) && copy.includes('ساختار فنی داده‌ها یا نمای رابط کاربری CPMS را نشان نمی‌دهد'), 'The ledger is labelled conceptual, not a data model or UI');
const nonClaims = byId('not-this').children.find(c => c.settings.flex_direction === 'row');
assert.deepEqual(nonClaims.children.map(c => c.settings._element_id), ['not-national', 'not-insurance-pharmacy', 'not-clinical-support'], 'Compact non-claim row: three short clarifications');
assert.equal(nonClaims.settings.flex_direction_tablet, 'column', 'Non-claims stack on tablet/mobile');
for (const c of nonClaims.children) assert(descendants(c).filter(n => n.kind === 'text-editor').every(n => n.settings.editor.replace(/<[^>]*>/g, '').length <= 200), 'Each non-claim stays short');

// One boundary language; clarification text is reading-size, never fine print.
for (const id of ['hero-scope', 'prescriptions-distinction', 'not-national', 'not-insurance-pharmacy', 'not-clinical-support']) {
  const box = byId(id);
  assert.equal(box.settings.background_color, tokens.color.roles['background/subtle'].value, `Boundary tint: ${id}`);
  assert(Number(box.settings.border_width.right) >= 2 && box.settings.border_color === tokens.color.roles['accent/primary'].value, `Boundary accent rule: ${id}`);
  const texts = descendants(box).filter(n => n.kind === 'text-editor');
  assert(texts.length >= 1, `Boundary carries text: ${id}`);
  for (const n of texts) {
    assert.equal(n.settings._css_classes, 'cpms-reading', `Clarification is reading text, not the supporting caption role: ${id}`);
    assert(n.settings.typography_font_size.size >= 15 && n.settings.typography_font_size_mobile.size >= 18, `Clarification is not tiny: ${id}`);
  }
}
assert(descendants(byId('prescriptions-distinction')).some(n => n.kind === 'heading' && n.settings.title === 'تمایز صریح'), 'The prescriptions clarification carries a text label (not colour alone)');

// Buttons: only real existing pages. Outbound set is exactly demo, doctor workspace, patient record.
const existingPages = ['/demo/', '/doctor-workspace/', '/patient-record-continuity/'];
const buttons = nodes.filter(n => n.kind === 'button');
for (const n of buttons) assert(existingPages.includes(n.settings.link.url), `Link must be an existing reconstructed page: ${n.settings.link.url}`);
assert.deepEqual([...new Set(buttons.map(n => n.settings.link.url))].sort(), [...existingPages].sort(), 'Outbound links cover exactly Demo, Doctor Workspace and Patient Record');
assert.equal(buttons[0].settings.link.url, '/demo/', 'The first link in reading order is the primary demo CTA (keyboard order)');
assert.equal(buttons[0].settings.text, 'درخواست دمو / مشاوره');
assert(!/<a\s/.test(copy), 'This page keeps navigation in buttons: no inline link network');
assert(!copy.includes('/product-overview/'), 'No link back to Product Overview from this page (bounded link set)');
assert.equal(buttons.filter(n => n.settings.link.url === '/demo/').length, 2, 'One conversion: the demo CTA appears in the hero and the final panel only');

// ---- Claim boundaries -----------------------------------------------------------
boundary.assertNoHardForbidden([pageIdentity.title, pageIdentity.description, ...strings], 'authored copy');
const checkedClauses = boundary.assertExternalTermsNegated(strings, 'authored copy');
assert(checkedClauses >= 10, `The negation check must not be vacuous (${checkedClauses} clauses checked)`);
boundary.assertPersianTypography([pageIdentity.title, pageIdentity.description, ...strings], 'authored copy');
for (const phrase of boundary.distinctionPhrases) assert(copy.includes(phrase), `Internal-versus-national distinction must stay verbatim: ${phrase}`);
// The distinction is present at the top (hero), in the prescriptions section, in the compact block and in the FAQ.
for (const id of ['hero-scope', 'prescriptions-distinction', 'not-national']) assert(/سامانهٔ ملی/.test(JSON.stringify(byId(id))), `National-system distinction present in ${id}`);
assert(strings.some(s => /^آیا این یعنی اتصال به سامانهٔ ملی نسخهٔ الکترونیک؟$/.test(s)), 'FAQ asks the national e-prescription question in the reader\'s words');
for (const required of [
  'ثبت و مدیریت در محیط CPMS',
  'در چارچوب شواهد ثبت‌شدهٔ محصول',
  'ادعایی ندارد',
  'محدودهٔ بخش رو به بیمار شامل نسخه‌ها و فایل‌ها هم هست',
  'نمایان‌بودن همهٔ نسخه‌ها و اسناد فرض نمی‌شود',
  'نقش‌ها و دامنهٔ دسترسی',
  'تفکیک اطلاعات کلینیک/سازمان',
  'محدوده‌دار (scoped)',
  'سطح سازوکار است',
  'پیش از انتشار عمومی بازتأیید می‌شود',
  'غیرزنده',
  'داده‌های نمایشی',
  'این قاب، تصویر محیط نرم‌افزار نیست',
]) assert(copy.includes(required), `Bounded wording must stay present: ${required}`);
// Do not turn the page into all disclaimers: explanatory clauses dominate negated ones.
const share = boundary.negatedShare(strings);
assert(share.total >= 60, `Enough substantive clauses to measure balance (${share.total})`);
assert(share.share <= 0.3, `Negated clauses must stay a minority of the page (${share.negated}/${share.total} = ${share.share.toFixed(2)})`);

// ---- Reserved media: exactly two editable frames, no fabricated imagery -----
assert(!nodes.some(n => n.kind === 'image'), 'Reserved media must not fabricate product imagery');
assert(!/phone|mobile-frame|mockup|screenshot-approved|verified/i.test(JSON.stringify(ids)), 'No phone-frame, mockup or verified-looking reservation ids');
for (const id of ['product-media-prescription', 'media-prescription-surface', 'media-prescription-disclosure', 'product-media-document-context', 'media-document-context-surface', 'media-document-context-disclosure']) {
  assert(ids.includes(id), `Reserved media position missing: ${id}`);
}
const mediaWrappers = nodes.filter(n => n.settings._element_id && /^product-media-/.test(n.settings._element_id));
assert.equal(mediaWrappers.length, 2, 'At most two media reservations on this page');
for (const wrapper of mediaWrappers) {
  assert(/^MEDIA REQUIRED/.test(wrapper.name) && /NOT product UI/.test(wrapper.name), 'Reservation is searchable and never reads as product reality');
  assert(descendants(wrapper).some(n => n.kind === 'text-editor' && n.settings.editor.includes('این قاب، تصویر محیط نرم‌افزار نیست')), 'Reservation carries a visible disclosure');
  assert(!descendants(wrapper).some(n => n.kind === 'heading' && /^h\d$/.test(n.settings.header_size)), 'A reserved frame adds no heading to the document outline');
}

// ---- Product Overview inbound link (architecture, not duplication) ----------
const overviewRecipe = readFileSync(new URL('../../reconstruction/product-overview/recipe.mjs', import.meta.url), 'utf8');
assert(overviewRecipe.includes('href="/prescriptions-documents/"'), 'Product Overview carries the contextual inbound link to this page');
assert(overviewRecipe.includes('>نسخه‌ها و اسناد در CPMS</a>'), 'The inbound link text names the capability inside CPMS, without the national term');
for (const href of ['/appointment-reception-queue/', '/patient-record-continuity/', '/doctor-workspace/', '/patient-portal/']) {
  assert(overviewRecipe.includes(`href="${href}"`), `Product Overview keeps its existing link: ${href}`);
}

// ---- Manifest / claims register integrity -----------------------------------
const manifest = JSON.parse(readFileSync(new URL('../../reconstruction/prescriptions-documents/manifest.json', import.meta.url)));
assert.equal(manifest.publication, 'TARGET — NOT PUBLICATION-APPROVED');
assert(manifest.launch_blockers.some(b => /media/i.test(b)), 'Media launch blocker recorded');
assert(manifest.launch_blockers.some(b => /lead delivery/i.test(b)), 'Live lead delivery launch blocker recorded');
assert(/supporting (product\/capability|capability|workflow) page/i.test(manifest.seo.intent) && /Product Overview/.test(manifest.seo.intent), 'Manifest records the supporting-page SEO boundary');
assert(/NOT claimed/.test(manifest.product_truth_boundary) && /e-prescription/.test(manifest.product_truth_boundary), 'Manifest records the non-claim set including national e-prescription');
assert.equal(manifest.seo.title, pageIdentity.title, 'Manifest title mirrors the recipe identity');
for (const key of ['canonical_recipe', 'claim_register', 'browser_runner']) assert(readFileSync(new URL('../../' + manifest[key], import.meta.url)).length > 0);
const claimsText = readFileSync(new URL('../../reconstruction/prescriptions-documents/claims.md', import.meta.url), 'utf8');
assert(claimsText.includes('NOT CONFIGURED / NOT AUTHORIZED'), 'Claims register records the lead delivery blocker');
assert(claimsText.includes('must replace BOTH reserved frames before public launch'), 'Claims register records the media blocker');
assert(/does not own the primary clinic-software/.test(claimsText), 'Claims register records the non-ownership cluster boundary');
assert(/Text tests are not product capability verification/i.test(claimsText), 'Claims register keeps text tests distinct from capability verification');
const runner = readFileSync(new URL('../../tests/browser/prescriptions-documents.mjs', import.meta.url), 'utf8');
assert(!runner.includes('_elementor_data'), 'No private database payload authoring');

// ---- Cross-file consistency: the runner, CI and registry cannot silently drift ------------
// Every link name the browser runner looks up must be an exact string the authored pages render
// (a half-space or hamza typo here would otherwise only surface in CI).
const authoredSources = [
  readFileSync(new URL('../../reconstruction/prescriptions-documents/recipe.mjs', import.meta.url), 'utf8'),
  overviewRecipe,
];
const runnerLinkNames = [...runner.matchAll(/(?:getByRole\('link', \{ name: '([^']+)'|followFromPage\('[^']+', '([^']+)')/g)].map(m => m[1] ?? m[2]);
assert(runnerLinkNames.length >= 7, `The runner looks up its links by name (${runnerLinkNames.length} found)`);
for (const linkName of new Set(runnerLinkNames)) {
  assert(authoredSources.some(source => source.includes(`'${linkName}'`) || source.includes(`>${linkName}</a>`)), `Runner link name must match authored text exactly: ${linkName}`);
}
for (const earlier of ['homepage', 'productOverview', 'demoPage', 'appointmentReceptionQueue', 'patientRecordContinuity', 'doctorWorkspace', 'patientPortal']) {
  assert(new RegExp(`\\b${earlier}\\b`).test(runner) && runner.includes(`, ${earlier}]`), `Runner sweeps the earlier page: ${earlier}`);
}
assert(runner.includes("'patient-portal'") && runner.includes("precedingPages"), 'Runner requires the previous seven pages before authoring');
assert(runner.includes("from '../static/boundary-prescriptions-documents.mjs'"), 'Runner shares the wording guard with this validator');
assert(runner.includes("assertExternalTermsNegated(measures.renderedStrings") && runner.includes('assertNoHardForbidden(measures.renderedStrings'), 'Runner applies the claim boundary to rendered text');
for (const [width, height] of [[390, 844], [768, 1024], [1366, 768], [1920, 1080]]) {
  assert(runner.includes(`${width}, ${height}]`), `Runner covers viewport ${width}x${height}`);
}
const workflow = readFileSync(new URL('../../.github/workflows/wordpress-elementor-smoke.yml', import.meta.url), 'utf8');
assert(workflow.includes('node tests/browser/prescriptions-documents.mjs'), 'CI runs the new runner');
assert(workflow.indexOf('node tests/browser/patient-portal.mjs') < workflow.indexOf('node tests/browser/prescriptions-documents.mjs'), 'CI runs the new runner after every earlier page runner');
assert(workflow.indexOf('node tests/browser/prescriptions-documents.mjs') < workflow.indexOf('actions/upload-artifact'), 'CI uploads evidence after the new runner');
const runAll = readFileSync(new URL('./validate.sh', import.meta.url), 'utf8');
assert(runAll.includes('validate-prescriptions-documents.mjs'), 'The static suite runs this validator');
const overviewRunner = readFileSync(new URL('../browser/product-overview.mjs', import.meta.url), 'utf8');
assert(overviewRunner.includes('${base}/prescriptions-documents/'), 'The Product Overview runner expects the new inbound link');

console.log(`PASS: Prescriptions-and-documents page guardrails (${nodes.length} native Elementor Free elements; ${checkedClauses} external-term clauses all negated/asked; negated share ${share.negated}/${share.total}; claims still require human/launch review)`);
