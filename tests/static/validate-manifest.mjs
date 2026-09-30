#!/usr/bin/env node
//
// Static validation of reconstruction/manifest.json host evidence, honesty
// sentinels, and version alignment with .wp-env.json. No WordPress runtime
// and no third-party dependencies required.
//
// Meaningful checks (not prose greps):
//   1. manifest has an exact, closed top-level schema (schema_revision 4);
//      unknown/missing top-level sections are rejected.
//   2. host_environment records the exact owner-reported host versions with
//      source / evidence_date / verification_status that distinguishes
//      OWNER_REPORTED from AGENT_VERIFIED (and keeps AGENT_VERIFIED = NOT RUN).
//   3. Owner evidence never overwrites agent-verification sentinels: the
//      canonical top-level `versions` remain NOT YET VERIFIED, and
//      clean_import_pilot / authorized_pro_host_acceptance remain NOT RUN.
//   4. CI parity is proved by computation: .wp-env.json core / Elementor /
//      Hello pins must equal the owner-reported host versions exactly; the
//      PHP pin must equal the host PHP major.minor family ONLY (two segments,
//      no patch-level claim); no Pro package may appear anywhere in
//      .wp-env.json.
//   5. ci_alignment claims must be consistent with the pins actually
//      computed in (4) (EXACT claims require equality; PHP must be declared
//      FAMILY ONLY; Pro / database / web server must declare exclusion or
//      NO PARITY CLAIM).
//   6. historical_log_evidence keeps the ZIP import failure as a NOT RUN
//      retest item for the clean pilot, never as a current defect.
//   7. The new evidence blocks must not store emails, absolute filesystem
//      paths, or credential/license/token style keys.

import { readFileSync } from "node:fs";
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

// ---- 1. closed top-level schema --------------------------------------------
const manifest = readJson("reconstruction/manifest.json");
const wpEnv = readJson(".wp-env.json");
if (!manifest || !wpEnv) process.exit(1);

const requiredTop = [
  "schema_revision", "status", "verified_at_utc", "version_source",
  "host_environment", "elementor_feature_state", "historical_log_evidence",
  "ci_alignment", "reference_host_compatibility_ci", "versions", "kit_export", "design_system", "artifacts",
  "expected_inventory", "clean_import_pilot", "authorized_pro_host_acceptance",
  "theme_layer",
];
const topKeys = Object.keys(manifest).sort();
if (JSON.stringify(topKeys) === JSON.stringify([...requiredTop].sort())) {
  ok("manifest has the exact expected top-level sections (schema_revision 4 shape)");
} else {
  ko(`manifest top-level keys differ: ${topKeys.join(", ")}`);
}
if (manifest.schema_revision === 4 && typeof manifest.status === "string" && manifest.status.startsWith("TEMPLATE")) {
  ok("manifest identity: schema_revision 4 with TEMPLATE status");
} else {
  ko("manifest identity malformed (schema_revision must be 4, status must stay TEMPLATE)");
}

// ---- 2. owner-reported host evidence ---------------------------------------
const he = manifest.host_environment ?? {};
if (he.source === "owner-reported Elementor/host system information" &&
    he.evidence_date === "2026-09-28" &&
    he.verification_status === "OWNER_REPORTED — NOT INDEPENDENTLY VERIFIED BY AGENT; AGENT_VERIFIED = NOT RUN") {
  ok("host_environment source / evidence_date / verification_status are exact (OWNER_REPORTED, AGENT_VERIFIED = NOT RUN)");
} else {
  ko("host_environment source/evidence_date/verification_status deviate from the required OWNER_REPORTED wording");
}

const hostExpected = {
  wordpress: "7.1.2",
  php: "8.1.34",
  database_engine: "MariaDB",
  database_version: "11.4.13-MariaDB-cll-lve-log",
  hello_elementor: "3.5.1",
  elementor: "4.3.2",
  elementor_pro: "4.3.0",
};
const hv = he.versions ?? {};
for (const [k, want] of Object.entries(hostExpected)) {
  if (hv[k] === want) ok(`host version recorded exactly: ${k} = ${want}`);
  else ko(`host version ${k} expected ${want}, got ${hv[k]}`);
}

const site = he.site ?? {};
if (site.operating_system === "Linux") ok("owner-reported host operating system recorded: Linux");
else ko(`host operating system expected Linux, got ${site.operating_system}`);
if (site.locale === "fa_IR") ok("host locale recorded: fa_IR");
else ko(`host locale expected fa_IR, got ${site.locale}`);
if (typeof site.installation === "string" && site.installation.includes("single-site")) ok("host installation recorded as single-site");
else ko("host installation must record single-site");
if (site.web_server === "LiteSpeed") ok("host web server recorded: LiteSpeed");
else ko(`host web server expected LiteSpeed, got ${site.web_server}`);
if (site.debug_mode === "ACTIVE") ok("host Debug Mode recorded: ACTIVE");
else ko(`host debug_mode expected ACTIVE, got ${site.debug_mode}`);
if (typeof site.child_theme === "string" && site.child_theme.startsWith("NONE")) ok("host child theme recorded: NONE active at report time");
else ko("host child_theme must record NONE active at report time (pre-deployment state)");
const hostRuntime = site.runtime_configuration ?? {};
if (hostRuntime.timezone === "UTC+03:30 / Tehran-equivalent behavior as actually configured" &&
    hostRuntime.permalink_structure === "/index.php/%year%/%monthnum%/%day%/%postname%/" &&
    hostRuntime.wp_memory_limit === "40M" && hostRuntime.wp_max_memory_limit === "4048M" &&
    hostRuntime.php_extensions?.gd === "available" && hostRuntime.php_extensions?.zip === "available" &&
    hostRuntime.elementor_library === "connected") {
  ok("additional owner-reported timezone/permalink/memory/GD/ZIP/Library facts recorded without agent-verification claims");
} else {
  ko("host runtime configuration evidence is incomplete or differs from the owner report");
}

// ---- 3. agent-verification and pilot sentinels stay intact -----------------
const canonVersions = manifest.versions ?? {};
const canonKeys = Object.keys(hostExpected).concat(["child_theme", "required_additional_plugins"]);
// map canonical keys (elementor_pro etc. are shared names)
let canonBad = 0;
for (const k of canonKeys) {
  if (canonVersions[k] !== "NOT YET VERIFIED") {
    ko(`canonical versions.${k} must remain "NOT YET VERIFIED" (owner report is not agent verification), got ${canonVersions[k]}`);
    canonBad += 1;
  }
}
if (canonBad === 0) ok("canonical top-level versions untouched by owner evidence (all NOT YET VERIFIED)");
if (manifest.clean_import_pilot === "NOT RUN" && manifest.authorized_pro_host_acceptance === "NOT RUN") {
  ok("pilot sentinels intact (clean_import_pilot / authorized_pro_host_acceptance = NOT RUN)");
} else {
  ko("clean_import_pilot and authorized_pro_host_acceptance must remain NOT RUN");
}

// ---- 4. computed CI parity against .wp-env.json ----------------------------
const hostWp = hv.wordpress;
const hostEl = hv.elementor;
const hostHello = hv.hello_elementor;
const hostPhpFamily = String(hv.php ?? "").split(".").slice(0, 2).join(".");

const coreRef = String(wpEnv.core ?? "");
const pluginUrl = String((wpEnv.plugins ?? [])[0] ?? "");
const themeMap = String((wpEnv.themes ?? [])[0] ?? "");
const phpPin = String(wpEnv.phpVersion ?? "");

const parity = {
  wordpress: coreRef === `WordPress/WordPress#${hostWp}`,
  elementor_free: pluginUrl === `https://downloads.wordpress.org/plugin/elementor.${hostEl}.zip`,
  php: /^\d+\.\d+$/.test(phpPin) && phpPin === hostPhpFamily,
};
if (Array.isArray(wpEnv.themes) && wpEnv.themes.length === 1 && themeMap === "./themes/koorosh") {
  ok("CI maps only the standalone Koorosh theme (Hello is not a CI dependency)");
} else {
  ko(`CI themes must be [\"./themes/koorosh\"], got ${JSON.stringify(wpEnv.themes)}`);
}
if (hostHello === "3.5.1") {
  ok("host Hello Elementor 3.5.1 remains recorded as host evidence (not a Koorosh parent)");
} else {
  ko(`host hello_elementor evidence expected 3.5.1, got ${hostHello}`);
}
for (const [k, holds] of Object.entries(parity)) {
  if (holds) ok(`CI parity (computed): ${k} pin matches owner-reported host (family-only for php)`);
  else ko(`CI parity broken: ${k} pin (${k === "wordpress" ? coreRef : k === "elementor_free" ? pluginUrl : phpPin}) does not match owner-reported host value`);
}
if (phpPin.split(".").length === 2) {
  ok(`PHP image pin selects the 8.1 family (${phpPin}) — exact patch parity is not supported by this selected image path`);
} else {
  ko(`PHP pin must be major.minor (wp-env format), got ${phpPin}`);
}

const wpEnvRaw = readFileSync(join(root, ".wp-env.json"), "utf8");
if (!/(elementor[-_. ]?pro|activator|crack)/i.test(wpEnvRaw) && (wpEnv.plugins ?? []).length === 1) {
  ok(".wp-env.json contains no Elementor Pro / activator references (free CI only)");
} else {
  ko(".wp-env.json must contain only the single free Elementor pin — no Pro/activator content");
}

// ---- 5. ci_alignment claims must match the computed parity -----------------
const ca = manifest.ci_alignment ?? {};
const expectPrefix = (key, prefix, extra) => {
  const v = String(ca[key] ?? "");
  if (v.startsWith(prefix) && (!extra || v.includes(extra))) ok(`ci_alignment.${key} declared: ${prefix}`);
  else ko(`ci_alignment.${key} must start with "${prefix}"${extra ? ` and mention ${extra}` : ""}, got: ${v}`);
};
if (parity.wordpress) expectPrefix("wordpress", "EXACT");
else ko("ci_alignment.wordpress claims cannot be validated because the wordpress pin does not match");
if (parity.elementor_free) expectPrefix("elementor_free", "EXACT");
else ko("ci_alignment.elementor_free claims cannot be validated because the elementor pin does not match");
expectPrefix("hello_elementor", "HOST EVIDENCE ONLY");
expectPrefix("php", "FAMILY ONLY");
if (parity.php && String(ca.php).includes(hostPhpFamily)) ok("ci_alignment.php names the pinned family");
else ko("ci_alignment.php must name the pinned family");
expectPrefix("elementor_pro", "EXCLUDED FROM PUBLIC CI");
expectPrefix("database", "NO PARITY CLAIM");
expectPrefix("web_server", "NO PARITY CLAIM");
if (typeof ca.basis === "string" && ca.basis.includes("host_environment")) {
  ok("ci_alignment.basis points at the owner-reported host evidence");
} else {
  ko("ci_alignment.basis must reference the owner-reported host evidence (host_environment)");
}

// ---- 5b. machine-readable reference-host compatibility record ---------------
const hostParity = manifest.reference_host_compatibility_ci ?? {};
const allowedParityStatuses = new Set(["EXACT", "FAMILY_ONLY", "SIMULATED", "NOT_TESTED", "NOT_APPLICABLE"]);
const dimensions = hostParity.dimensions ?? {};
const expectedDimensionStatus = {
  operating_system: "SIMULATED", wordpress: "EXACT", elementor_free: "EXACT", php: "FAMILY_ONLY", database: "SIMULATED",
  web_server: "NOT_TESTED", elementor_pro: "NOT_TESTED", single_site: "EXACT",
  locale_and_rtl: "EXACT", timezone: "SIMULATED", permalink: "SIMULATED",
  wordpress_memory_limit: "SIMULATED", host_max_memory: "NOT_TESTED",
  zip_extension: "SIMULATED", gd_extension: "SIMULATED", koorosh_theme: "SIMULATED",
  theme_settings: "SIMULATED", elementor_pages_and_persistence: "SIMULATED",
  elementor_library: "NOT_TESTED", debug_mode: "SIMULATED", host_network_and_email: "NOT_TESTED",
  clean_elementor_pro_kit_import: "NOT_TESTED",
};
if (hostParity.schema_version === 1 && hostParity.name === "REFERENCE-HOST COMPATIBILITY CI / HOST-PARITY SIMULATION" &&
    hostParity.reference_evidence_status === "OWNER-REPORTED — NOT INDEPENDENTLY VERIFIED BY AGENT" &&
    JSON.stringify(hostParity.status_vocabulary) === JSON.stringify(["EXACT", "FAMILY_ONLY", "SIMULATED", "NOT_TESTED", "NOT_APPLICABLE"])) {
  ok("reference-host CI record has the expected version, label, owner-evidence boundary, and status vocabulary");
} else {
  ko("reference-host CI record identity, evidence boundary, or status vocabulary is malformed");
}
for (const [name, expectedStatus] of Object.entries(expectedDimensionStatus)) {
  const item = dimensions[name];
  if (item && allowedParityStatuses.has(item.status) && item.status === expectedStatus &&
      typeof item.reference_value === "string" && typeof item.ci_value === "string" && typeof item.evidence_method === "string" && typeof item.limitation === "string") {
    ok(`reference-host parity dimension is honest and complete: ${name} = ${expectedStatus}`);
  } else {
    ko(`reference-host parity dimension ${name} must be ${expectedStatus} with reference/CI values, method, and limitation`);
  }
}
if (dimensions.database?.exact_reference_version_status === "NOT_TESTED" &&
    dimensions.php?.reference_value === "8.1.34" && dimensions.php?.status === "FAMILY_ONLY" &&
    dimensions.web_server?.reference_value === "LiteSpeed" && dimensions.elementor_pro?.status === "NOT_TESTED" &&
    (hostParity.explicit_non_claims || []).some(value => value.includes("Not Elementor Pro acceptance or LiteSpeed verification"))) {
  ok("exact PHP/DB gaps and Pro/LiteSpeed exclusions remain explicit");
} else {
  ko("reference-host record must explicitly preserve PHP/DB/Pro/LiteSpeed gaps");
}
const debugMode = dimensions.debug_mode ?? {};
if (debugMode.status === "SIMULATED" &&
    debugMode.ci_value.includes("WP_DEBUG_DISPLAY/WP_DEBUG_LOG runtime values recorded") &&
    debugMode.evidence_method.includes("when enabled/readable") &&
    debugMode.limitation.includes("disabled or unreadable") && debugMode.limitation.includes("NOT_TESTED")) {
  ok("debug-log settings are observed without forcing behavior; disabled/unreadable scans stay NOT_TESTED");
} else {
  ko("debug-mode parity must record actual log/display settings and preserve disabled/unreadable NOT_TESTED semantics");
}
const featureFlags = Array.isArray(hostParity.elementor_feature_flags) ? hostParity.elementor_feature_flags : [];
const requiredFlagNames = ["Containers", "Atomic widgets", "Editor V4", "additional custom breakpoints", "optimized markup", "Theme Builder", "nested elements", "custom import/export", "Atomic Form", "Loop", "Menu"];
if (requiredFlagNames.every(name => featureFlags.some(item => item.name === name && allowedParityStatuses.has(item.status) && typeof item.relevance === "string"))) {
  ok("all owner-reported Elementor feature flags have a relevance/status assessment");
} else {
  ko("reference-host feature inventory must assess every reported feature flag");
}
if (featureFlags.some(item => item.name === "Theme Builder" && item.status === "NOT_TESTED") &&
    featureFlags.some(item => item.name === "custom import/export" && item.status === "NOT_TESTED")) {
  ok("Pro-dependent Theme Builder and clean import/export are not smuggled in as CI acceptance");
} else {
  ko("Pro-dependent Theme Builder and custom import/export must remain untested");
}

// ---- 6. historical ZIP import risk stays a NOT RUN retest item -------------
const hl = manifest.historical_log_evidence ?? {};
if (hl.verification_status === "OWNER_REPORTED — HISTORICAL ONLY; NOT REPRODUCED; NOT CLASSIFIED AS A CURRENT DEFECT") {
  ok("historical log evidence marked historical-only (not a current defect)");
} else {
  ko("historical_log_evidence.verification_status must keep historical-only wording");
}
const zipItem = (Array.isArray(hl.items) ? hl.items : []).find((i) => i.id === "elementor_zip_import_error");
if (zipItem &&
    zipItem.message === "Invalid or uninitialized Zip object during Elementor template import" &&
    zipItem.retest_status === "NOT RUN" &&
    typeof zipItem.retest === "string" &&
    zipItem.retest.includes("clean_import_pilot")) {
  ok("ZIP import failure recorded as a NOT RUN retest item bound to clean_import_pilot");
} else {
  ko("historical ZIP import error must be recorded verbatim with retest_status NOT RUN and a clean_import_pilot retest obligation");
}
const histNotes = Array.isArray(hl.notes) ? hl.notes.join(" ") : "";
if (histNotes.includes("4.3.2") && histNotes.includes("4.3.0") && histNotes.includes("not current regressions without reproduction")) {
  ok("historical notes record the 2026-09-28 Elementor updates and the no-current-regression rule");
} else {
  ko("historical_log_evidence.notes must record the Elementor 4.3.2 / Pro 4.3.0 updates and the reproduction rule");
}

// ---- 7. no secrets/personal data in the evidence blocks --------------------
const forbiddenKey = /(email|passw|credential|secret|token|api.?key|licen[cs]e|private|salt|cookie|session)/i;
const emailLike = /[\w.+-]+@[\w-]+\.[A-Za-z]{2,}/;
const absPath = /^(\/(home|Users|var|etc|opt|root)\b|~\/)/;
let dataBad = 0;
const scan = (label, node) => {
  if (Array.isArray(node)) return node.forEach((v, i) => scan(`${label}[${i}]`, v));
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (forbiddenKey.test(k)) { ko(`forbidden key "${k}" present in ${label}`); dataBad += 1; }
      scan(`${label}.${k}`, v);
    }
    return;
  }
  if (typeof node === "string") {
    if (emailLike.test(node)) { ko(`email-like value in ${label}: ${node}`); dataBad += 1; }
    if (absPath.test(node)) { ko(`absolute filesystem path in ${label}: ${node}`); dataBad += 1; }
  }
};
scan("host_environment", he);
scan("elementor_feature_state", manifest.elementor_feature_state ?? {});
scan("historical_log_evidence", hl);
scan("ci_alignment", ca);
if (dataBad === 0) ok("evidence blocks contain no emails, absolute filesystem paths, or credential/license/token keys");

const feat = manifest.elementor_feature_state ?? {};
const activeList = Array.isArray(feat.active) ? feat.active : [];
const requiredFeatures = ["Containers", "Atomic widgets", "Editor V4", "Atomic Form", "Loop", "Menu"];
if (requiredFeatures.every((f) => activeList.some((a) => a === f || a.startsWith(`${f} (`))) &&
    typeof feat.verification_status === "string" && feat.verification_status.startsWith("OWNER_REPORTED")) {
  ok("Elementor feature state recorded with OWNER_REPORTED status");
} else {
  ko("elementor_feature_state must record the reported active features with OWNER_REPORTED status");
}

console.log(`== Manifest evidence/parity validation result: ${pass} passed, ${fail} failed ==`);
process.exit(fail === 0 ? 0 : 1);
