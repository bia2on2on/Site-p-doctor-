/**
 * Static validation of the Contact utility page slice (/contact/):
 *   - recipe: native Elementor Free elements only; exactly one H1; sequential
 *     headings; unique section IDs matching the manifest; token-only colors/sizes
 *   - compact mission structure: hero → demo/consultation route (/demo/ CTA) →
 *     settings-driven general contact → short no-PHI clarification + /privacy/
 *   - dynamic-contact integration: the recipe NEVER hardcodes an email/phone/
 *     address; exactly one narrowly scoped [cpms_contact_details] shortcode
 *     exists; the theme renderer is escaped, attribute-free, request-free and
 *     keeps the public-contact role separate from the lead-recipient role
 *   - the authorized public email resolves to the Product-Owner-decided value
 *   - no support/SLA claims; no Organization/LocalBusiness schema; no form
 *   - footer gets تماس با ما → /contact/ while primary navigation is unchanged
 *   - the Demo page keeps its small alternative-contact route; the Demo
 *     lead-delivery dual gate is untouched
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { contactPage, pageIdentity } from '../../reconstruction/contact/recipe.mjs';
import {
  assertPersianTypography,
  assertLegalBoundary,
} from './boundary-legal.mjs';

const read = rel => readFileSync(new URL('../../' + rel, import.meta.url), 'utf8');
const tokens = JSON.parse(read('design-system/tokens.json'));
const manifest = JSON.parse(read('reconstruction/contact/manifest.json'));
const claims = read('reconstruction/contact/claims.md');
const rendererPhp = read('themes/koorosh/contact-details.php');
const demoFormPhp = read('themes/koorosh/demo-form.php');
const demoRecipeText = read('reconstruction/demo/recipe.mjs');
const menuText = read('reconstruction/site-shell/menu.mjs');

// ---- 1. Identity & SEO bounds ---------------------------------------------
assert.equal(pageIdentity.slug, 'contact', 'pageIdentity.slug must be contact');
assert.equal(pageIdentity.title, 'تماس با ما | CPMS', 'Contact page title must be unique and truthful');
assert(pageIdentity.description.length > 50 && pageIdentity.description.length <= 220, 'Meta description is substantive and bounded');
assert(!/biatoweb@gmail\.com/.test(pageIdentity.description + pageIdentity.title), 'No frozen contact email in SEO copy');
assert.equal(manifest.page.slug, 'contact');
assert.equal(manifest.page.route, '/contact/');
assert.equal(manifest.page.status, 'target-not-publication-approved', 'Page stays TARGET — NOT PUBLICATION-APPROVED');
assert.equal(manifest.authoring.seo?.pageRole, 'utility-trust', 'SEO role is utility/trust');
assert.equal(manifest.authoring.seo?.commercialKeywordOptimization, 'none', 'No commercial keyword stuffing');
assert.equal(manifest.authoring.seo?.schema, 'none — no Organization, no LocalBusiness, no invented address/phone', 'No structured data planned');
assert.equal(manifest.authoring.structuredData, 'none', 'No structured data in the authoring model');
assert.equal(manifest.authoring.forms, 'none — the Demo form on /demo/ remains the only lead form', 'Contact page is not a second lead form');
assert.equal(manifest.authoring.mapIntegration, 'none', 'No map integration');
assert.equal(manifest.authoring.mediaPlaceholders, 'none');
assert.equal(manifest.authoring.iconBadges, 'none');

// ---- 2. Recipe structure ----------------------------------------------------
const tree = contactPage(tokens);
const flatten = nodes => nodes.flatMap(n => [n, ...flatten(n.children || [])]);
const all = flatten(tree);
const allowedKinds = new Set(manifest.authoring.allowedElementTypes);
const allowedColors = new Set(Object.values(tokens.color.roles).map(r => r.value.toUpperCase()));
const allowedSizes = new Set(Object.values(tokens.typography.scale).flatMap(s => [s.size_px, s.size_mobile_px].filter(Boolean)));

assert.deepEqual(tree.map(s => s.settings._element_id), manifest.sections.map(s => s.id), 'Section order matches the manifest');

let h1Count = 0;
let prevHeadingLevel = 0;
const links = [];
const copyParts = [];
for (const node of all) {
  assert(allowedKinds.has(node.kind), `Disallowed element kind: ${node.kind}`);
  const s = node.settings || {};
  assert(!('custom_css' in s) && !('_custom_css' in s), 'Custom CSS is not allowed');
  assert(!(s._css_classes && !['cpms-reading', 'cpms-support'].includes(s._css_classes)), `Unexpected _css_classes: ${s._css_classes}`);
  for (const key of ['title_color', 'text_color', 'background_color', 'border_color', 'button_text_color', 'hover_color', 'button_background_hover_color']) {
    if (s[key]) assert(allowedColors.has(String(s[key]).toUpperCase()), `${key}=${s[key]} is not a design-system color token`);
  }
  for (const key of ['typography_font_size', 'typography_font_size_mobile']) {
    if (s[key]?.size) assert(allowedSizes.has(s[key].size), `${key}=${s[key].size}px is not a design-system type scale size`);
  }
  if (node.kind === 'heading') {
    const match = /^h([1-6])$/.exec(s.header_size || 'h2');
    if (match) {
      const level = Number(match[1]);
      if (level === 1) h1Count += 1;
      assert(prevHeadingLevel === 0 || level <= prevHeadingLevel + 1, `Heading level jumped from H${prevHeadingLevel} to H${level}`);
      prevHeadingLevel = level;
    }
    assertPersianTypography(s.title, `heading:${s.title}`, fail => assert.fail(fail));
    assertLegalBoundary(s.title, `heading:${s.title}`, fail => assert.fail(fail));
    copyParts.push(s.title);
  }
  if (node.kind === 'text-editor') {
    const isShortcodeWidget = typeof s.editor === 'string' && /^\[[^\]]+\]$/.test(s.editor.trim());
    assert(isShortcodeWidget || (typeof s.editor === 'string' && s.editor.startsWith('<p>') && s.editor.endsWith('</p>')), 'text-editor must wrap prose copy in <p> (the bare shortcode widget is the one exception)');
    assert(!/<script|<style|style=|onclick=/i.test(s.editor), 'Disallowed inline script/style in text-editor');
    for (const m of s.editor.matchAll(/href="([^"]+)"/g)) links.push(m[1]);
    assertPersianTypography(s.editor, `text:${s.editor.slice(0, 30)}`, fail => assert.fail(fail));
    assertLegalBoundary(s.editor, `text:${s.editor.slice(0, 30)}`, fail => assert.fail(fail));
    copyParts.push(s.editor);
  }
  if (node.kind === 'button') {
    assert(s.link?.url, 'button requires link.url');
    links.push(s.link.url);
    assertPersianTypography(s.text, `button:${s.text}`, fail => assert.fail(fail));
    assertLegalBoundary(s.text, `button:${s.text}`, fail => assert.fail(fail));
    copyParts.push(s.text);
  }
}

// Exactly one H1; compact section set
assert.equal(h1Count, 1, `Expected exactly 1 H1, found ${h1Count}`);
assert(all.length <= 24, `Contact page must stay compact (got ${all.length} elements)`);
assert(!all.some(n => n.kind === 'image'), 'No fabricated media');
const copy = copyParts.join('\n');

// ---- 3. Mission routes ------------------------------------------------------
assert(links.includes('/demo/'), 'Demo CTA must resolve to /demo/');
assert(links.includes('/privacy/'), 'Privacy link must resolve to /privacy/');
assert(copy.includes('تماس با ما'), 'H1 wording present');
assert(!links.some(l => /^https?:/i.test(l)), 'No external destinations');
assert(!links.some(l => /^mailto:/i.test(l) || /^tel:/i.test(l)), 'Contact destinations are rendered at runtime, never authored in page copy');

// ---- 4. Dynamic contact integration (settings-driven, not frozen copy) ------
const emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
assert.deepEqual((copy.match(emailPattern) || []), [], 'The recipe must NEVER hardcode an email address');
assert(!/biatoweb@gmail\.com/.test(JSON.stringify(tree)), 'The authorized email must not be frozen in Elementor page copy');

const shortcodes = all.filter(n => n.kind === 'text-editor' && /\[[^\]]+\]/.test(n.settings.editor || ''));
assert.equal(shortcodes.length, 1, 'Exactly one shortcode widget on the Contact page');
assert.equal(shortcodes[0].settings.editor, '[cpms_contact_details]', 'The only shortcode is the narrowly scoped contact-details renderer');
assert.equal(shortcodes[0].settings._element_id, 'contact-details-widget', 'Renderer widget carries its stable element id');
assert(!/\[cpms_demo_form\]/.test(copy), 'Contact page must not embed the Demo lead form');

// Theme renderer guardrails
assert(rendererPhp.includes("add_shortcode( 'cpms_contact_details', 'cpms_contact_details_shortcode' )"), 'Renderer registers exactly the contact-details shortcode');
assert(rendererPhp.includes('function cpms_contact_public_default_email()'), 'Authorized public default lives in its own function');
assert.equal((rendererPhp.match(/biatoweb@gmail\.com/g) || []).length, 1, 'The authorized public email appears exactly once in the renderer (its own default role)');
assert(rendererPhp.includes("koorosh_get_setting( 'contact_email' )"), 'Public email comes from Koorosh Settings at runtime');
assert(rendererPhp.includes('return cpms_contact_public_default_email();'), 'Empty/invalid public email falls back to the authorized PUBLIC default');
const rendererCode = rendererPhp.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
assert(!/cpms_lead_delivery_default_recipient\(/.test(rendererCode), 'Public contact role must NOT fall back to the lead-recipient default (roles stay separate)');
assert(!/lead_recipient/.test(rendererCode), 'The public renderer never reads the lead-recipient setting');
assert(!/cpms_lead_delivery_recipient\(/.test(rendererCode), 'The public renderer never calls the lead-recipient resolver');
assert(!/\$_(GET|POST|REQUEST|COOKIE|SERVER)/.test(rendererCode), 'Renderer never reads request data');
assert(!/\beval\s*\(|\bextract\s*\(|\$\$|assert\s*\(|create_function|unserialize\s*\(/.test(rendererCode), 'No dynamic code execution in the renderer');
assert(!/apply_filters|do_action/.test(rendererCode), 'No filter/action surface on the contact renderer');
assert(rendererCode.includes('esc_html(') && rendererCode.includes('esc_attr(') && rendererCode.includes('esc_url('), 'Every output fragment is escaped');
assert(rendererCode.includes("esc_url( 'mailto:' . $email )"), 'Email renders as a normal mailto: link');
assert(rendererCode.includes("esc_url( 'tel:' . $tel )"), 'Phone renders through a tel: destination');
assert(rendererCode.includes('function cpms_contact_phone_tel('), 'tel: normalization is a dedicated function');
assert(/preg_match\( '\/\^\\\+\/', \$digits \)/.test(rendererCode) && /preg_replace\( '\/\[\^0-9\]\/', '', \$digits \)/.test(rendererCode), 'tel: normalization keeps only digits with one leading +');
assert(rendererCode.includes("'' !== $phone && '' !== $tel"), 'Phone row renders ONLY when configured');
assert(rendererCode.includes("'' !== $address"), 'Address row renders ONLY when configured');
assert(rendererCode.includes('if ( array() === $rows )'), 'No empty rows/placeholders when nothing is configured');
assert(!/social_(instagram|linkedin|telegram)/.test(rendererPhp), 'Social settings are not auto-rendered');
assert(!/google\.com\/maps|maps\.google|iframe/i.test(rendererPhp), 'No map integration');
assert(!/پشتیبانی|پاسخ\u200c?گویی ۲۴|تیم پشتیبانی|SLA/iu.test(rendererCode), 'Renderer output strings carry no support/SLA wording');
assert(!/wp_mail|\bmail\s*\(/.test(rendererCode), 'The contact renderer sends no mail');

// ---- 5. Truth boundaries on page copy --------------------------------------
assert(!/پشتیبانی|پاسخ\u200c?گویی\s*۲۴|تیم پشتیبانی|۲۴\s*ساعتته|پشتیبانی ۲۴/u.test(copy), 'No support-channel claims on the Contact page');
assert(!/تماس در کمتر از|ظرف \d|تا \d+ ساعت/u.test(copy), 'No response-time promise');
assert(copy.includes('اطلاعات بیماران یا هرگونه دادهٔ پزشکی'), 'Short no-PHI clarification present');
assert(copy.includes('به‌معنی تضمین تحویل پیام یا تعهد زمان پاسخ نیست'), 'Demo route copy disclaims delivery/response guarantees');
assert(!/type=["']checkbox["']|type="hidden" name="cpms_/.test(copy), 'No form or consent checkbox content');
assert(!/Organization|LocalBusiness|schema\.org|ld\+json|itemtype/i.test(JSON.stringify(tree)), 'No Organization/LocalBusiness schema anywhere in the recipe');

// ---- 6. Claims register + manifest honesty ---------------------------------
assert(claims.includes('TARGET — NOT PUBLICATION-APPROVED'), 'Claims register keeps the pre-publication status');
assert(claims.includes('biatoweb@gmail.com'), 'Claims register records the authorized public email as configuration evidence');
assert(claims.includes('UNVERIFIED / UNDEFINED'), 'Claims register records that the support model is unverified');
assert(claims.includes('separate') || claims.includes('independent'), 'Claims register records the lead-recipient vs public-contact separation');
assert(manifest.dynamicContactIntegration.publicContactRole.authorizedDefault === 'biatoweb@gmail.com', 'Manifest records the authorized public default');
assert(manifest.dynamicContactIntegration.leadRecipientRole.relationship.startsWith('SEPARATE'), 'Manifest keeps the roles separate');
assert(manifest.unprovenOrUnverified.supportModel.startsWith('UNVERIFIED'), 'Manifest records the unverified support model');
assert(manifest.unprovenOrUnverified.demoFormDelivery.startsWith('NOT GUARANTEED'), 'Manifest makes no delivery guarantee');

// ---- 7. Footer route + unchanged primary navigation ------------------------
const { primaryMenu, footerMenu } = await import('../../reconstruction/site-shell/menu.mjs');
assert.deepEqual(primaryMenu.items.map(i => i.title), ['خانه', 'محصول', 'جریان‌های کاری', 'درخواست دمو / مشاوره'], 'Primary header navigation stays unchanged');
const contactItem = footerMenu.items.find(i => i.slug === 'contact');
assert.equal(contactItem?.title, 'تماس با ما', 'Footer gains تماس با ما → contact page');

// ---- 8. Demo page keeps its alternative-contact route; delivery unchanged --
assert(demoRecipeText.includes('href="/contact/"'), 'Demo recipe links to the Contact page as the form alternative');
assert(demoRecipeText.includes('اگر مسیر فرم برای شما مناسب نیست'), 'Demo alternative-contact wording is the truthful concise sentence');
assert(/function cpms_lead_delivery_enabled\(\) \{\s*return cpms_lead_delivery_environment_authorized\(\) && cpms_lead_delivery_site_switch_enabled\(\);\s*\}/.test(demoFormPhp.replace(/\/\*[\s\S]*?\*\//g, '')), 'Demo lead-delivery dual gate remains unchanged (environment AND site switch)');
assert.equal((demoFormPhp.match(/biatoweb@gmail\.com/g) || []).length, 1, 'Lead-recipient default stays single-sourced in demo-form.php');

// ---- 9. File/manifest wiring -----------------------------------------------
for (const key of ['recipe', 'claims']) {
  assert(existsSync(new URL('../../' + manifest.authoring[key], import.meta.url)), `Manifest path missing: ${manifest.authoring[key]}`);
}
assert(existsSync(new URL('../../' + manifest.dynamicContactIntegration.renderer, import.meta.url)), `Renderer missing: ${manifest.dynamicContactIntegration.renderer}`);
assert.equal(manifest.dynamicContactIntegration.shortcode, '[cpms_contact_details]');
assert(manifest.dynamicContactIntegration.shortcodeAttributes.startsWith('none'), 'Shortcode accepts no attributes');

console.log(`PASS: Contact page native authoring, settings-driven contact rendering and honesty guardrails (${all.length} native Elementor Free elements)`);
