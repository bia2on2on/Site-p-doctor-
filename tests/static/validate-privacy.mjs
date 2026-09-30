#!/usr/bin/env node
/**
 * Static validation of the Privacy utility page reconstruction recipe (/privacy/):
 *   - every element is one of container, heading, text-editor, button
 *   - no media placeholder, no badge/icon, no custom CSS, no raw HTML widget, no structured data
 *   - colors and font sizes trace to design-system/tokens.json
 *   - exactly one H1; sequential heading hierarchy (no skipped level)
 *   - all 6 Demo form fields, purpose, PHI prohibition, no WordPress DB storage,
 *     mail-layer handoff toward authorized recipient (biatoweb@gmail.com),
 *     infrastructure/inbox caveat, no analytics/advertising tracking, and
 *     unapproved retention disclosure are present
 *   - manifest and claims register carry LEGAL REVIEW REQUIRED BEFORE PUBLIC LAUNCH
 *     and BUSINESS/LEGAL INPUT REQUIRED
 *   - Persian typography and legal honesty boundaries pass on every text node
 */
import fs from 'node:fs';
import { privacyPage, privacyFormFieldItems, pageIdentity } from '../../reconstruction/privacy/recipe.mjs';
import {
  assertPersianTypography,
  assertLegalBoundary,
  assertPrivacyTruthfulness,
} from './boundary-legal.mjs';

const fail = msg => {
  console.error(`STATIC VALIDATION FAILED: ${msg}`);
  process.exit(1);
};
const assert = (cond, msg) => { if (!cond) fail(msg); };

const tokens = JSON.parse(fs.readFileSync('design-system/tokens.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('reconstruction/privacy/manifest.json', 'utf8'));
const claims = fs.readFileSync('reconstruction/privacy/claims.md', 'utf8');
const demoFormPhp = fs.readFileSync('themes/koorosh/demo-form.php', 'utf8');

assert(pageIdentity.slug === 'privacy', 'pageIdentity.slug must be privacy');
assert(manifest.page.slug === 'privacy' && manifest.page.route === '/privacy/', 'manifest slug/route mismatch');
assert(manifest.page.status === 'target-not-publication-approved', 'manifest must remain target-not-publication-approved');
assert(
  manifest.page.legalReviewStatus === 'LEGAL REVIEW REQUIRED BEFORE PUBLIC LAUNCH',
  'manifest.page.legalReviewStatus must be LEGAL REVIEW REQUIRED BEFORE PUBLIC LAUNCH',
);
assert(
  manifest.page.businessLegalInputStatus === 'BUSINESS/LEGAL INPUT REQUIRED',
  'manifest.page.businessLegalInputStatus must be BUSINESS/LEGAL INPUT REQUIRED',
);
assert(manifest.authoring.structuredData === 'none', 'Privacy page must not emit structured data');
assert(manifest.authoring.mediaPlaceholders === 'none', 'Privacy page must not reserve media placeholders');
assert(manifest.authoring.iconBadges === 'none', 'Privacy page must not use icon badges');
assert(manifest.authoring.seo?.pageRole === 'utility-legal', 'Privacy page SEO role must be utility-legal');
assert(manifest.authoring.seo?.commercialKeywordOptimization === 'none', 'Privacy page must not optimize for commercial keywords');
assert(
  Array.isArray(manifest.unresolvedBusinessLegalInputs) &&
    manifest.unresolvedBusinessLegalInputs.length >= 8 &&
    manifest.unresolvedBusinessLegalInputs.every(item => item.status === 'BUSINESS/LEGAL INPUT REQUIRED'),
  'manifest.unresolvedBusinessLegalInputs must mark all unprovided corporate/legal facts as BUSINESS/LEGAL INPUT REQUIRED',
);

assert(claims.includes('LEGAL REVIEW REQUIRED BEFORE PUBLIC LAUNCH'), 'claims.md must record LEGAL REVIEW REQUIRED BEFORE PUBLIC LAUNCH');
assert(claims.includes('BUSINESS/LEGAL INPUT REQUIRED'), 'claims.md must record BUSINESS/LEGAL INPUT REQUIRED');

assert(privacyFormFieldItems.length === 6, `expected 6 Demo form field disclosures, got ${privacyFormFieldItems.length}`);
for (const item of privacyFormFieldItems) {
  assert(demoFormPhp.includes(`'${item.field}'`), `privacyFormFieldItems field ${item.field} must exist in themes/koorosh/demo-form.php`);
}

const allowedColors = new Set(Object.values(tokens.color.roles).map(r => r.value.toUpperCase()));
const allowedSizes = new Set(Object.values(tokens.typography.scale).flatMap(s => [s.size_px, s.size_mobile_px].filter(Boolean)));
const allowedKinds = new Set(manifest.authoring.allowedElementTypes);

const tree = privacyPage(tokens);
const expectedSectionIds = manifest.sections.map(s => s.id);
const actualSectionIds = tree.map(s => s.settings._element_id);
assert(
  JSON.stringify(actualSectionIds) === JSON.stringify(expectedSectionIds),
  `section order mismatch: expected ${expectedSectionIds.join(', ')}, got ${actualSectionIds.join(', ')}`,
);

let h1Count = 0;
let prevHeadingLevel = 0;
let nodeCount = 0;
const links = [];
const allTexts = [];

function walk(node, path = 'root') {
  nodeCount += 1;
  const here = `${path}/${node.kind}:${node.name}`;
  assert(allowedKinds.has(node.kind), `${here}: disallowed element kind ${node.kind}`);
  const s = node.settings || {};

  assert(!('custom_css' in s) && !('_custom_css' in s), `${here}: custom CSS is not allowed`);
  assert(
    !(s._css_classes && !['cpms-reading', 'cpms-support'].includes(s._css_classes)),
    `${here}: unexpected _css_classes "${s._css_classes}"`,
  );

  for (const key of ['title_color', 'text_color', 'background_color', 'border_color', 'button_text_color', 'hover_color', 'button_background_hover_color']) {
    if (s[key]) assert(allowedColors.has(String(s[key]).toUpperCase()), `${here}: ${key}=${s[key]} is not a design-system color token`);
  }
  for (const key of ['typography_font_size', 'typography_font_size_mobile']) {
    if (s[key]?.size) assert(allowedSizes.has(s[key].size), `${here}: ${key}=${s[key].size}px is not a design-system type scale size`);
  }

  if (node.kind === 'heading') {
    const tag = s.header_size || 'h2';
    const match = /^h([1-6])$/.exec(tag);
    if (match) {
      const level = Number(match[1]);
      if (level === 1) h1Count += 1;
      assert(prevHeadingLevel === 0 || level <= prevHeadingLevel + 1, `${here}: heading level jumped from H${prevHeadingLevel} to H${level}`);
      prevHeadingLevel = level;
    }
    assertPersianTypography(s.title, here, fail);
    assertLegalBoundary(s.title, here, fail);
    allTexts.push(s.title);
  }

  if (node.kind === 'text-editor') {
    assert(typeof s.editor === 'string' && s.editor.startsWith('<p>') && s.editor.endsWith('</p>'), `${here}: text-editor must wrap copy in <p>`);
    assert(!/<script|<style|style=|onclick=/i.test(s.editor), `${here}: disallowed inline script/style in text-editor`);
    for (const m of s.editor.matchAll(/href="([^"]+)"/g)) links.push(m[1]);
    assertPersianTypography(s.editor, here, fail);
    assertLegalBoundary(s.editor, here, fail);
    allTexts.push(s.editor);
  }

  if (node.kind === 'button') {
    assert(s.link?.url, `${here}: button requires link.url`);
    links.push(s.link.url);
    assertPersianTypography(s.text, here, fail);
    assertLegalBoundary(s.text, here, fail);
    allTexts.push(s.text);
  }

  for (const child of node.children || []) walk(child, here);
}

for (const section of tree) walk(section);

assert(h1Count === 1, `expected exactly 1 H1, found ${h1Count}`);
assert(links.includes('/demo/'), 'Privacy page must include primary CTA link to /demo/');
assert(links.includes('/terms/'), 'Privacy page must link to /terms/');
assert(links.includes('/security-data-access/'), 'Privacy page must link to /security-data-access/');
assert(links.includes('/faq/'), 'Privacy page must link to /faq/');

for (const field of privacyFormFieldItems) {
  assert(claims.includes(field.field), `claims.md must reference Demo form field ${field.field}`);
}

const fullCopy = allTexts.join('\n');
assertPrivacyTruthfulness(fullCopy, fail);

console.log(`validate-privacy: OK (${tree.length} sections, ${nodeCount} Elementor nodes, ${privacyFormFieldItems.length} form fields disclosed, 1 H1, ${links.length} links)`);
