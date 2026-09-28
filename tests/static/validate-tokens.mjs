#!/usr/bin/env node
//
// Static validation of the canonical design tokens and their integrity.
// No WordPress runtime and no third-party dependencies required.
//
// Meaningful checks (not prose greps):
//   1. design-system/tokens.json parses and has an exact, closed schema shape
//      (unknown/missing top-level sections are rejected).
//   2. Color roles: exact required role set, hex values, and WCAG 2.2 contrast
//      math (computed here) for every declared pair, plus required-pair coverage
//      so a check cannot be silently deleted to sneak an unverified color in.
//   3. Typography: exactly one self-hosted family, at most 3 weights, woff2
//      files present with valid magic bytes, scale consistency (weights exist,
//      Persian-safe line heights, mobile sizes not larger than desktop).
//   4. Spacing scale: contiguous, strictly increasing multiples of the base unit.
//   5. Containers/borders/shadows/focus/motion/breakpoints: internal consistency
//      and contract alignment (Elementor default breakpoints 767/1024, laptop
//      1365 => desktop 1366+).
//   6. Elementor mapping: every color role and type role covered exactly once
//      across system slots + custom entries; Site Settings values match tokens.
//   7. reconstruction/manifest.json: honesty sentinels intact (clean_import_pilot
//      and authorized_pro_host_acceptance must remain "NOT RUN") and recorded
//      artifact checksums match the files on disk.

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

let pass = 0;
let fail = 0;
const ok = (m) => { console.log(`PASS: ${m}`); pass += 1; };
const ko = (m) => { console.error(`FAIL: ${m}`); fail += 1; };

const readJson = (rel) => {
  try {
    return JSON.parse(readFileSync(join(root, rel), "utf8"));
  } catch (e) {
    ko(`${rel} does not parse as strict JSON: ${e.message}`);
    return null;
  }
};

// ---- WCAG 2.2 contrast math -------------------------------------------------
const channel = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const h = hex.slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const contrast = (fgHex, bgHex) => {
  const a = luminance(fgHex);
  const b = luminance(bgHex);
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
};

const HEX = /^#[0-9A-F]{6}$/i;

// ---- 1. tokens.json shape ---------------------------------------------------
const tokens = readJson("design-system/tokens.json");
if (!tokens) process.exit(1);

const requiredTop = [
  "schema_revision", "document", "status", "decided_at_utc", "canonical", "authority",
  "color", "typography", "spacing", "container", "border", "shadow", "focus",
  "motion", "breakpoints", "elementor",
];
const topKeys = Object.keys(tokens).sort();
if (JSON.stringify(topKeys) === JSON.stringify([...requiredTop].sort())) {
  ok("tokens.json has the exact expected top-level sections");
} else {
  ko(`tokens.json top-level keys differ: ${topKeys.join(", ")}`);
}
if (tokens.schema_revision === 1 && tokens.document === "cpms-design-tokens" && tokens.canonical === true) {
  ok("tokens.json identity fields are well-formed");
} else {
  ko("tokens.json identity fields (schema_revision/document/canonical) are malformed");
}

// ---- 2. color roles + contrast ----------------------------------------------
const REQUIRED_ROLES = [
  "accent/active", "accent/contrast-on-accent", "accent/hover", "accent/primary",
  "background/base", "background/subtle", "border/strong", "border/subtle",
  "danger", "info", "ink/muted", "ink/primary", "ink/secondary", "link",
  "success", "surface/card", "surface/raised", "warning",
];
const roles = tokens.color?.roles ?? {};
const roleNames = Object.keys(roles).sort();
if (JSON.stringify(roleNames) === JSON.stringify([...REQUIRED_ROLES].sort())) {
  ok(`color roles are exactly the ${REQUIRED_ROLES.length} contract roles (no token explosion)`);
} else {
  ko(`color roles differ from contract: ${roleNames.join(", ")}`);
}

let hexBad = 0;
for (const [name, spec] of Object.entries(roles)) {
  if (!spec || typeof spec.value !== "string" || !HEX.test(spec.value)) {
    ko(`color role ${name} has a non-hex value: ${spec?.value}`);
    hexBad += 1;
  } else if (typeof spec.usage !== "string" || spec.usage.length < 5) {
    ko(`color role ${name} is missing a usage note`);
    hexBad += 1;
  }
}
if (hexBad === 0) ok("all color values are #RRGGBB with usage notes");

const checks = tokens.color?.contrast_checks ?? [];
const declared = new Set();
for (const c of checks) {
  const key = `${c.fg}|${c.bg}|${c.min}`;
  if (declared.has(key)) { ko(`duplicate contrast check: ${key}`); continue; }
  declared.add(key);
  const fg = roles[c.fg]?.value;
  const bg = roles[c.bg]?.value;
  if (!fg || !bg) { ko(`contrast check references unknown role: ${c.fg} on ${c.bg}`); continue; }
  const ratio = contrast(fg, bg);
  if (ratio >= c.min) {
    ok(`contrast ${c.fg} on ${c.bg} = ${ratio.toFixed(2)}:1 (>= ${c.min})`);
  } else {
    ko(`contrast ${c.fg} on ${c.bg} = ${ratio.toFixed(2)}:1 BELOW ${c.min}`);
  }
}

// Required-pair coverage: text roles on the three light surfaces at 4.5:1.
const textRoles = ["ink/primary", "ink/secondary", "ink/muted", "link", "accent/primary", "success", "warning", "danger", "info"];
const lightSurfaces = ["background/base", "surface/card", "background/subtle"];
const need45 = [];
for (const f of textRoles) for (const b of lightSurfaces) need45.push(`${f}|${b}|4.5`);
need45.push("accent/contrast-on-accent|accent/primary|4.5");
need45.push("accent/contrast-on-accent|accent/hover|4.5");
need45.push("accent/contrast-on-accent|accent/active|4.5");
need45.push("border/strong|surface/card|3");
need45.push("border/strong|background/base|3");
need45.push("accent/primary|surface/card|3");
need45.push("accent/primary|background/base|3");
// min may be written as 3 or 3.0 — normalise for coverage comparison
const declaredNorm = new Set([...declared].map((k) => {
  const [f, b, m] = k.split("|");
  return `${f}|${b}|${Number(m)}`;
}));
const missing = need45.filter((k) => {
  const [f, b, m] = k.split("|");
  return !declaredNorm.has(`${f}|${b}|${Number(m)}`);
});
if (missing.length === 0) {
  ok("all required contrast pairs are declared (coverage complete)");
} else {
  ko(`missing required contrast pairs: ${missing.join(", ")}`);
}

// ---- 3. typography ----------------------------------------------------------
const typo = tokens.typography ?? {};
const fam = typo.families ?? {};
const persian = fam["persian"];
if (persian && typeof persian.name === "string" && persian.name.length > 0 && typeof fam["fallback_stack"] === "string") {
  ok(`single self-hosted Persian family (${persian.name}) + fallback stack`);
} else {
  ko("typography.families must define exactly one 'persian' family and a fallback_stack");
}

const files = persian?.files ?? [];
if (files.length >= 1 && files.length <= 3) {
  ok(`font file count within budget (${files.length} <= 3)`);
} else {
  ko(`font file count outside budget: ${files.length}`);
}
const weights = new Set();
for (const f of files) {
  weights.add(f.weight);
  const p = join(root, f.path);
  if (!existsSync(p)) { ko(`font file missing: ${f.path}`); continue; }
  const buf = readFileSync(p);
  if (buf.length < 1024) { ko(`font file suspiciously small: ${f.path}`); continue; }
  if (buf.subarray(0, 4).toString("latin1") !== "wOF2") {
    ko(`font file is not woff2 (bad magic): ${f.path}`);
  } else {
    ok(`font file present and woff2: ${f.path} (${buf.length} bytes, weight ${f.weight})`);
  }
}
if (weights.size === files.length) ok("font weights are unique");
else ko("duplicate font weights declared");
if ((typo.weights?.regular === 400 && typo.weights?.bold === 700 && [...weights].sort().join(",") === "400,700") || files.length === 0) {
  ok("declared weight policy matches committed font files (400/700)");
} else {
  ko("typography.weights does not match the committed font files");
}
if (persian?.loading?.includes("font-display: swap") && persian?.loading?.includes("self-hosted")) {
  ok("font loading policy is self-hosted + font-display: swap");
} else {
  ko("font loading policy must be self-hosted with font-display: swap");
}
if (persian?.license === "OFL-1.1" && typeof persian?.license_file === "string" && existsSync(join(root, persian.license_file))) {
  ok("font license OFL-1.1 recorded and license file present");
} else {
  ko("font license/license_file missing or not OFL-1.1");
}

const scale = typo.scale ?? {};
const scaleRoles = ["caption", "body-sm", "body", "lede", "h3", "h2", "h1"];
if (JSON.stringify(Object.keys(scale).sort()) === JSON.stringify([...scaleRoles].sort())) {
  ok("typography scale has exactly the 7 contract roles");
} else {
  ko(`typography scale roles differ: ${Object.keys(scale).join(", ")}`);
}
let scaleBad = 0;
for (const [name, s] of Object.entries(scale)) {
  if (!weights.has(s.weight)) { ko(`scale role ${name} uses weight ${s.weight} with no font file`); scaleBad += 1; }
  if (!(s.line_height >= 1.3)) { ko(`scale role ${name} line-height ${s.line_height} below Persian-safe minimum 1.3`); scaleBad += 1; }
  if (!(s.size_px > 0)) { ko(`scale role ${name} has invalid size`); scaleBad += 1; }
  if (s.size_mobile_px !== undefined && s.size_mobile_px > s.size_px) {
    ko(`scale role ${name} mobile size larger than desktop`);
    scaleBad += 1;
  }
}
if (scaleBad === 0) ok("scale weights/line-heights/sizes are internally consistent");
if ((typo.letter_spacing ?? "").startsWith("0")) ok("letter-spacing policy is 0 (Persian joined script)");
else ko("typography.letter_spacing must start with '0'");

// ---- 4. spacing -------------------------------------------------------------
const sp = tokens.spacing ?? {};
const unit = sp.unit_px;
const spKeys = Object.keys(sp.scale ?? {});
const contiguous = spKeys.every((k, i) => k === `space-${i + 1}`);
const vals = spKeys.map((k) => sp.scale[k]);
const increasing = vals.every((v, i) => (i === 0 ? v > 0 : v > vals[i - 1]));
const multiples = vals.every((v) => Number.isInteger(v) && v % unit === 0);
if (unit === 4 && contiguous && increasing && multiples && vals.length >= 6) {
  ok(`spacing scale is contiguous space-1..${vals.length}, strictly increasing multiples of ${unit}px`);
} else {
  ko("spacing scale violates the base-unit contract");
}

// ---- 5. container / border / shadow / focus / motion / breakpoints ----------
const cont = tokens.container ?? {};
const narrow = cont["content-narrow"]?.value_px;
const def = cont["content-default"]?.value_px;
const wide = cont["content-wide"]?.value_px;
if ([narrow, def, wide].every(Number.isInteger) && narrow < def && def <= wide && wide <= 1600) {
  ok(`container widths ordered (narrow ${narrow} < default ${def} <= wide ${wide})`);
} else {
  ko("container widths are missing or unordered");
}

const radius = tokens.border?.radius ?? {};
const radiusKeysOk = Object.keys(radius).every((k) => k === "sm" || k === "md");
const radiusValsOk = Object.values(radius).every((v) => Number.isInteger(v) && v >= 2 && v <= 16);
if (radiusKeysOk && radiusValsOk && tokens.border?.width_default_px === 1) {
  ok("border policy: 1px default width, radius limited to sm/md within 2-16px");
} else {
  ko("border/radius policy violated");
}

const sh = tokens.shadow ?? {};
if (JSON.stringify(Object.keys(sh).filter((k) => k !== "policy").sort()) === JSON.stringify(["raised", "subtle"])) {
  ok("shadow policy: exactly two levels (subtle, raised)");
} else {
  ko("shadow levels differ from the two-level policy");
}

const focus = tokens.focus ?? {};
if (focus.ring_width_px >= 2 && focus.ring_offset_px >= 0 &&
    roles[focus.ring_color] && roles[focus.ring_color_on_accent] &&
    typeof focus.policy === "string" && focus.policy.includes(":focus-visible")) {
  ok("focus treatment: visible ring defined against existing roles, :focus-visible policy present");
} else {
  ko("focus treatment incomplete (ring width >= 2px, role-backed colors, :focus-visible policy required)");
}

const motion = tokens.motion ?? {};
if (motion.duration_fast_ms <= motion.duration_base_ms &&
    motion.duration_base_ms <= motion.max_duration_ms &&
    motion.max_duration_ms <= 500 &&
    typeof motion.reduced_motion === "string" && motion.reduced_motion.includes("prefers-reduced-motion")) {
  ok("motion policy: bounded durations and prefers-reduced-motion handling declared");
} else {
  ko("motion policy inconsistent (durations must be bounded and reduced-motion declared)");
}

const bp = tokens.breakpoints ?? {};
if (bp.mobile_max_px === 767 && bp.tablet_max_px === 1024 &&
    bp.laptop_max_px === 1365 && bp.desktop_min_px === bp.laptop_max_px + 1 &&
    bp.min_support_width_px === 320 && bp.min_support_width_px <= bp.mobile_max_px &&
    bp.large_desktop_sanity_px >= bp.desktop_min_px) {
  ok("breakpoints match the contract and Elementor defaults (767/1024 + Laptop 1365 => desktop 1366+)");
} else {
  ko("breakpoint values deviate from the documented contract");
}

// ---- 6. Elementor mapping ---------------------------------------------------
const el = tokens.elementor ?? {};
const sys = el.global_colors?.system_slots ?? {};
const custom = el.global_colors?.custom_colors ?? [];
const mapped = [...Object.values(sys), ...custom];
const unique = new Set(mapped);
if (JSON.stringify(Object.keys(sys).sort()) === JSON.stringify(["Accent", "Primary", "Secondary", "Text"]) &&
    unique.size === mapped.length && mapped.length === REQUIRED_ROLES.length &&
    REQUIRED_ROLES.every((r) => unique.has(r))) {
  ok("Elementor global-color mapping covers every role exactly once (4 system slots + custom)");
} else {
  ko("Elementor global-color mapping is incomplete or duplicated");
}

const gf = el.global_fonts?.system_slots ?? {};
const gc = el.global_fonts?.custom_styles ?? [];
const fontMapped = [...Object.values(gf), ...gc.map((c) => c.role)];
const fontUnique = new Set(fontMapped);
if (JSON.stringify(Object.keys(gf).sort()) === JSON.stringify(["Accent Text", "Body Text", "Primary", "Secondary"]) &&
    fontUnique.size === fontMapped.length && fontMapped.length === scaleRoles.length &&
    scaleRoles.every((r) => fontUnique.has(r))) {
  ok("Elementor global-font mapping covers every type role exactly once");
} else {
  ko("Elementor global-font mapping is incomplete or duplicated");
}

const layout = el.site_settings?.layout ?? {};
if (layout.content_width_px === def &&
    layout.breakpoints_active?.Mobile === bp.mobile_max_px &&
    layout.breakpoints_active?.Tablet === bp.tablet_max_px &&
    layout.breakpoints_active?.Laptop === bp.laptop_max_px &&
    typeof el.site_settings?.theme_style === "string") {
  ok("Elementor Site Settings values match the token containers/breakpoints");
} else {
  ko("Elementor Site Settings mapping deviates from tokens");
}
if (Array.isArray(el.css_support_required) && el.css_support_required.length >= 1 &&
    el.css_support_required.every((c) => typeof c.feature === "string" && typeof c.reason === "string" && c.reason.length > 10)) {
  ok("justified minimal-CSS needs are recorded (feature + reason each)");
} else {
  ko("elementor.css_support_required must record each minimal-CSS need with a justification");
}

// CSS values and font paths must stay bound to the canonical token roles.
const css = readFileSync(join(root, "themes/cpms-child/foundation.css"), "utf8");
for (const f of files) {
  if (f?.path && !css.includes(`fonts/${f.path.split("/").at(-1)}`)) ko(`CSS missing token font: ${f.path}`);
}
if (css.includes(`outline: ${focus.ring_width_px}px solid ${roles[focus.ring_color]?.value}`) &&
    css.includes(`outline-offset: ${focus.ring_offset_px}px`) &&
    [...new Set(files.map((f) => f.weight))].every((w) => css.includes(`font-weight: ${w};`)) &&
    css.includes("font-display: swap") && css.includes("prefers-reduced-motion: reduce")) {
  ok("theme foundation CSS matches focus/font tokens and motion policy");
} else ko("theme foundation CSS drift from focus/font/motion tokens");

// ---- 7. reconstruction manifest honesty + integrity -------------------------
const manifest = readJson("reconstruction/manifest.json");
if (manifest) {
  if (manifest.clean_import_pilot === "NOT RUN" && manifest.authorized_pro_host_acceptance === "NOT RUN") {
    ok("manifest honesty sentinels intact (clean_import_pilot / authorized_pro_host_acceptance = NOT RUN)");
  } else {
    ko("manifest must keep clean_import_pilot and authorized_pro_host_acceptance as NOT RUN");
  }
  if (manifest.design_system?.canonical_tokens === "design-system/tokens.json") {
    ok("manifest points at the canonical design tokens");
  } else {
    ko("manifest.design_system.canonical_tokens must be design-system/tokens.json");
  }

  const artifacts = Array.isArray(manifest.artifacts) ? manifest.artifacts : [];
  for (const a of artifacts) {
    const p = join(root, a.path);
    if (!existsSync(p)) { ko(`manifest artifact missing on disk: ${a.path}`); continue; }
    const digest = createHash("sha256").update(readFileSync(p)).digest("hex");
    if (digest === a.sha256) ok(`manifest checksum matches: ${a.path}`);
    else ko(`manifest checksum DRIFT for ${a.path}: recorded ${a.sha256}, actual ${digest}`);
  }
  // every committed font file must be covered by a manifest artifact entry
  for (const f of [...files, { path: persian?.license_file }]) {
    if (!f?.path) continue;
    const entry = artifacts.find((a) => a.path === f.path && /^[0-9a-f]{64}$/.test(a.sha256 ?? ""));
    if (entry) ok(`font artifact recorded in manifest: ${f.path}`);
    else ko(`font artifact NOT recorded in manifest with sha256: ${f.path}`);
  }
}

console.log(`== Design-token validation result: ${pass} passed, ${fail} failed ==`);
process.exit(fail === 0 ? 0 : 1);
