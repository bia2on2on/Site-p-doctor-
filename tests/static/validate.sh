#!/usr/bin/env bash
#
# Static validation of repository-controlled configuration/metadata.
# No WordPress runtime required; safe to run anywhere with node and python3.
#
# Checks:
#   1. .wp-env.json parses as strict JSON.
#   2. .wp-env.json pins and compatibility configuration are well-formed
#      (core ref, Elementor plugin ZIP URL, PHP family, single-site/debug/memory
#      settings). The selected official wp-env/WordPress image path supports
#      PHP family tags only for this setup; exact patch parity is not claimed.
#   3. reconstruction/manifest.json parses as strict JSON and passes
#      reconstruction/evidence validation (tests/static/validate-manifest.mjs):
#      owner-reported host evidence with OWNER_REPORTED status, honesty
#      sentinels, computed CI/host version parity, historical ZIP risk item,
#      no emails/paths/credential-style keys in evidence blocks.
#   4. Every GitHub Actions workflow file parses as YAML (PyYAML; installed
#      on demand if missing).
#   5. design-system tokens + manifest integrity (tests/static/validate-tokens.mjs:
#      schema shape, WCAG contrast math, font budget/files, breakpoint contract,
#      Elementor mapping coverage, manifest honesty sentinels and checksums).

set -u -o pipefail

pass=0
fail=0
root="$(cd "$(dirname "$0")/../.." && pwd)"

if [ ! -f "$root/.wp-env.json" ]; then
	echo "FAIL: repo root not resolved (no .wp-env.json at: $root)"
	exit 2
fi

ok() { printf 'PASS: %s\n' "$*"; pass=$((pass + 1)); }
ko() { printf 'FAIL: %s\n' "$*"; fail=$((fail + 1)); }

# ---- 1+2. wp-env config ------------------------------------------------------
if node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' \
	"$root/.wp-env.json" 2>/dev/null; then
	ok ".wp-env.json is valid JSON"
else
	ko ".wp-env.json is not valid JSON"
fi

node -e '
const c = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
let bad = 0;
const err = (m) => { console.error(m); bad = 1; };
if (!/^WordPress\/WordPress#\d+(\.\d+)+$/.test(c.core || "")) err("core pin malformed: " + c.core);
if (!/^\d+\.\d+$/.test(c.phpVersion || "")) err("phpVersion pin must be the supported major.minor family for this official WordPress image path: " + c.phpVersion);
if (!Array.isArray(c.plugins) || c.plugins.length !== 1) err("plugins must be the single Elementor ZIP pin");
else if (!/^https:\/\/downloads\.wordpress\.org\/plugin\/elementor\.\d+(\.\d+)+\.zip$/.test(c.plugins[0])) err("plugins[0] must be a pinned elementor ZIP URL: " + c.plugins[0]);
if (!Array.isArray(c.themes) || c.themes.length !== 1 || c.themes[0] !== "./themes/koorosh") err("themes must map only the standalone Koorosh theme");
const m = c.mappings || {};
const mKeys = Object.keys(m);
if (mKeys.length !== 1 || mKeys[0] !== "wp-content/mu-plugins" || m[mKeys[0]] !== "./tests/wp-env/mu-plugins") {
  err("mappings must be exactly the CI mu-plugins bind mount (wp-content/mu-plugins -> ./tests/wp-env/mu-plugins): " + JSON.stringify(m));
}
if (c.multisite !== false) err("multisite must be explicitly false for the single-site compatibility target");
const cfg = c.config || {};
if (cfg.WP_DEBUG !== true || cfg.WP_DEBUG_DISPLAY !== true || cfg.WP_DEBUG_LOG !== true || cfg.WP_MEMORY_LIMIT !== "40M") err("wp-env compatibility config must enable bounded diagnostics and set WP_MEMORY_LIMIT=40M");
if (Object.hasOwn(cfg, "WP_MAX_MEMORY_LIMIT")) err("do not force the reported 4048M host maximum in GitHub CI");
if (JSON.stringify(Object.keys(c).sort()) !== JSON.stringify(["$schema", "core", "phpVersion", "multisite", "config", "plugins", "themes", "mappings"].sort())) err("unexpected/missing top-level keys: " + Object.keys(c).join(","));
process.exit(bad);
' "$root/.wp-env.json" \
	&& ok ".wp-env.json pins are well-formed (core ref, phpVersion, single Elementor ZIP, Koorosh theme, mu-plugins mount)" \
	|| ko ".wp-env.json pins are malformed"

node -e '
const fs = require("fs");
const path = require("path");
const root = process.argv[1];
let bad = 0;
const err = (m) => { console.error(m); bad = 1; };
if (fs.existsSync(path.join(root, "themes/cpms-child"))) err("legacy themes/cpms-child must be gone");
const dir = path.join(root, "themes/koorosh");
if (!fs.existsSync(dir)) err("themes/koorosh missing");
const style = fs.readFileSync(path.join(dir, "style.css"), "utf8");
if (!/^Theme Name:\s*کوروش\s*$/m.test(style)) err("style.css Theme Name must be کوروش");
if (/^Template:/m.test(style)) err("style.css must not declare Template: parent");
for (const f of ["functions.php", "index.php", "header.php", "footer.php", "foundation.css"]) {
  if (!fs.existsSync(path.join(dir, f))) err("missing theme file: " + f);
}
const fontDir = path.join(dir, "fonts");
for (const f of ["Vazirmatn-Regular.woff2", "Vazirmatn-Bold.woff2", "OFL.txt"]) {
  if (!fs.existsSync(path.join(fontDir, f))) err("missing font artifact: " + f);
}
process.exit(bad);
' "$root" \
	&& ok "Koorosh standalone theme identity (Theme Name کوروش, no parent, no cpms-child)" \
	|| ko "Koorosh standalone theme identity failed"

# ---- 3. reconstruction manifest ----------------------------------------------
if node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' \
	"$root/reconstruction/manifest.json" 2>/dev/null; then
	ok "reconstruction/manifest.json is valid JSON"
else
	ko "reconstruction/manifest.json is not valid JSON"
fi

# ---- 4. Workflow YAML parses ---------------------------------------------------
yaml_parser="python"
if ! python3 -c 'import yaml' 2>/dev/null; then
	echo "PyYAML not present; installing pyyaml (host-local, not committed)"
	python3 -m pip install --quiet --user pyyaml >/dev/null 2>&1 || true
fi

yaml_tmp=""
if ! python3 -c 'import yaml' 2>/dev/null; then
	yaml_parser="js-yaml"
	yaml_tmp="$(mktemp -d)"
	if ! npm install --prefix "$yaml_tmp" --no-save --no-package-lock --ignore-scripts js-yaml@4.1.0 >/dev/null 2>&1; then
		rm -rf "$yaml_tmp"
		yaml_tmp=""
		yaml_parser=""
	fi
fi
if [ -n "$yaml_parser" ]; then
	yaml_bad=0
	yaml_files=0
	while IFS= read -r -d '' f; do
		yaml_files=$((yaml_files + 1))
		if [ "$yaml_parser" = "python" ]; then
			python3 -c 'import sys, yaml; yaml.safe_load(open(sys.argv[1], encoding="utf-8"))' "$f" 2>/dev/null
		else
			node -e 'const yaml=require(process.argv[1]); yaml.load(require("fs").readFileSync(process.argv[2], "utf8"));' "$yaml_tmp/node_modules/js-yaml" "$f" 2>/dev/null
		fi
		if [ "$?" -eq 0 ]; then
			echo "PASS: YAML parses: ${f#"$root"/}"
		else
			echo "FAIL: YAML does not parse: ${f#"$root"/}"
			yaml_bad=1
		fi
	done < <(find "$root/.github/workflows" \( -name '*.yml' -o -name '*.yaml' \) -print0 2>/dev/null)
	if [ "$yaml_files" -eq 0 ]; then
		ko "no workflow YAML files found under .github/workflows (nothing validated)"
	else
		[ "$yaml_bad" -eq 0 ] && ok "all $yaml_files workflow YAML file(s) parse with $yaml_parser" || ko "workflow YAML failed to parse"
	fi
else
	ko "workflow YAML check NOT RUN (PyYAML and pinned js-yaml parser unavailable)"
fi
[ -z "$yaml_tmp" ] || rm -rf "$yaml_tmp"

# ---- 5. Design tokens + artifact integrity ------------------------------------
if node "$root/tests/static/validate-tokens.mjs"; then
	ok "design tokens and manifest integrity validated (tests/static/validate-tokens.mjs)"
else
	ko "design token validation failed (tests/static/validate-tokens.mjs)"
fi

# ---- 6. Host evidence, honesty sentinels, CI/host version parity --------------
if node "$root/tests/static/validate-manifest.mjs"; then
	ok "host evidence, sentinels and CI/host version parity validated (tests/static/validate-manifest.mjs)"
else
	ko "manifest evidence/parity validation failed (tests/static/validate-manifest.mjs)"
fi

if node "$root/tests/static/validate-reference-host-compatibility.mjs"; then
	ok "reference-host compatibility CI boundaries, parity gaps and runtime checks are validated"
else
	ko "reference-host compatibility CI static validation failed"
fi

if node "$root/tests/static/validate-homepage.mjs"; then
	ok "homepage native-element, anchor and claim guardrails"
else
	ko "homepage guardrails failed"
fi

if node "$root/tests/static/validate-product-overview.mjs"; then
	ok "Product Overview native authoring and bounded message guardrails"
else
	ko "Product Overview guardrails failed"
fi

if node "$root/tests/static/validate-demo.mjs"; then
	ok "Demo consultation native authoring, qualification and safe non-live guardrails"
else
	ko "Demo consultation guardrails failed"
fi

if node "$root/tests/static/validate-appointment-reception-queue.mjs"; then
	ok "Appointment–Reception–Queue workflow native authoring and bounded message guardrails"
else
	ko "Appointment–Reception–Queue workflow guardrails failed"
fi

if node "$root/tests/static/validate-patient-record-continuity.mjs"; then
	ok "Patient-record / information-continuity page native authoring and bounded message guardrails"
else
	ko "Patient-record / information-continuity page guardrails failed"
fi

if node "$root/tests/static/validate-doctor-workspace.mjs"; then
	ok "Doctor-workspace page native authoring and bounded message guardrails"
else
	ko "Doctor-workspace page guardrails failed"
fi

if node "$root/tests/static/validate-patient-portal.mjs"; then
	ok "Patient-portal page native authoring and bounded message guardrails"
else
	ko "Patient-portal page guardrails failed"
fi

if node "$root/tests/static/validate-prescriptions-documents.mjs"; then
	ok "Prescriptions-and-documents page native authoring, composition and internal-versus-national claim guardrails"
else
	ko "Prescriptions-and-documents page guardrails failed"
fi

if node "$root/tests/static/validate-faq.mjs"; then
	ok "FAQ / buyer-objection page native authoring, objection boundaries and structured-data omission guardrails"
else
	ko "FAQ / buyer-objection page guardrails failed"
fi

if node "$root/tests/static/validate-security-data-access.mjs"; then
	ok "Security & Data Access trust page native authoring, trust boundaries and no-badge/media/schema guardrails"
else
	ko "Security & Data Access trust page guardrails failed"
fi

if node "$root/tests/static/validate-privacy.mjs"; then
	ok "Privacy utility page native authoring, Demo form field disclosures and legal honesty guardrails"
else
	ko "Privacy utility page guardrails failed"
fi

if node "$root/tests/static/validate-terms.mjs"; then
	ok "Website Terms utility page native authoring, conservative website boundaries and legal honesty guardrails"
else
	ko "Website Terms utility page guardrails failed"
fi

if node "$root/tests/static/validate-site-shell.mjs"; then
	ok "Site-shell navigation, menu-structure and honesty guardrails"
else
	ko "Site-shell navigation guardrails failed"
fi

if node "$root/tests/static/validate-theme-settings.mjs"; then
	ok "Koorosh Theme Settings guardrails (compact option, Settings API + manage_options, no secrets, dual-gate delivery, evidence-honest read-only status)"
else
	ko "Koorosh Theme Settings guardrails failed"
fi

if node "$root/tests/static/validate-seo-foundation.mjs"; then
	ok "Technical-SEO foundation guardrails (metadata audit, staging-leak scan, canonical/robots/sitemap ownership, utility 404, structured-data omission)"
else
	ko "Technical-SEO foundation guardrails failed"
fi

node -e '
const fs = require("fs");
const path = require("path");
const root = process.argv[1];
let bad = 0;
const err = (m) => { console.error(m); bad = 1; };
// The mapped mu-plugins directory must stay PHP-free in Git so every CI run
// starts with lead delivery in its safe default (disabled) mode.
const muDir = path.join(root, "tests/wp-env/mu-plugins");
if (!fs.existsSync(path.join(muDir, "README.md"))) err("tests/wp-env/mu-plugins/README.md missing (mapped bind-mount directory must exist in Git)");
const phpInMu = fs.existsSync(muDir) ? fs.readdirSync(muDir).filter((f) => f.toLowerCase().endsWith(".php")) : [];
if (phpInMu.length > 0) err("no .php file may be committed in tests/wp-env/mu-plugins (CI default must be delivery-OFF): " + phpInMu.join(", "));
// CI delivery fixtures must exist exactly once each and carry no credentials/recipient.
const fixtures = path.join(root, "tests/wp-env/fixtures");
for (const f of ["cpms-ci-mail-intercept.php", "cpms-ci-enable-delivery.php", "README.md"]) {
  if (!fs.existsSync(path.join(fixtures, f))) err("missing CI fixture: tests/wp-env/fixtures/" + f);
}
const intercept = fs.readFileSync(path.join(fixtures, "cpms-ci-mail-intercept.php"), "utf8");
if (!intercept.includes("pre_wp_mail")) err("interception fixture must hook pre_wp_mail");
if (intercept.includes("CPMS_LEAD_DELIVERY_ENABLED")) err("interception fixture must not activate delivery");
const enable = fs.readFileSync(path.join(fixtures, "cpms-ci-enable-delivery.php"), "utf8");
if (!enable.includes("define( \x27CPMS_LEAD_DELIVERY_ENABLED\x27, true )")) err("activation fixture must define the activation constant only");
if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(enable)) err("activation fixture must contain no email address");
for (const f of [intercept, enable]) {
  if (/(passw|secret|token|api.?key|licen[cs]e)/i.test(f)) err("CI fixtures must not contain credential-like content");
}
process.exit(bad);
' "$root" \
	&& ok "CI lead-delivery fixtures bounded (mu-plugins PHP-free in Git, interception/activation separated, no credentials)" \
	|| ko "CI lead-delivery fixture guardrails failed"

if node --check "$root/themes/koorosh/nav.js"; then
	ok "nav.js classic-script syntax (node --check)"
else
	ko "nav.js syntax check failed"
fi

if node --check "$root/themes/koorosh/demo-form.js"; then
	ok "demo-form.js classic-script syntax (node --check)"
else
	ko "demo-form.js syntax check failed"
fi

if node --check "$root/tests/browser/demo-delivery.mjs"; then
	ok "demo-delivery.mjs module syntax (node --check)"
else
	ko "demo-delivery.mjs syntax check failed"
fi

if node --check "$root/tests/browser/privacy.mjs"; then
	ok "privacy.mjs module syntax (node --check)"
else
	ko "privacy.mjs syntax check failed"
fi

if node --check "$root/tests/browser/terms.mjs"; then
	ok "terms.mjs module syntax (node --check)"
else
	ko "terms.mjs syntax check failed"
fi

if node --check "$root/tests/browser/theme-settings.mjs"; then
	ok "theme-settings.mjs module syntax (node --check)"
else
	ko "theme-settings.mjs syntax check failed"
fi

if node --check "$root/tests/wp-env/reference-host-compatibility.mjs"; then
	ok "reference-host-compatibility.mjs module syntax (node --check)"
else
	ko "reference-host-compatibility.mjs syntax check failed"
fi

printf '== Static validation result: %s passed, %s failed ==\n' "$pass" "$fail"
[ "$fail" -eq 0 ] || exit 1
exit 0
