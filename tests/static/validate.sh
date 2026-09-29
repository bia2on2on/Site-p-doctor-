#!/usr/bin/env bash
#
# Static validation of repository-controlled configuration/metadata.
# No WordPress runtime required; safe to run anywhere with node and python3.
#
# Checks:
#   1. .wp-env.json parses as strict JSON.
#   2. .wp-env.json pins are well-formed (core ref, Elementor plugin ZIP URL,
#      phpVersion) so the smoke test can always derive expected versions.
#      phpVersion must be major.minor (wp-env documents the "0.0" format;
#      host patch levels such as 8.1.34 are not configurable, so only family
#      parity is representable and patch-level parity is never claimed).
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
if (!/^\d+\.\d+$/.test(c.phpVersion || "")) err("phpVersion pin must be major.minor (wp-env format 0.0): " + c.phpVersion);
if (!Array.isArray(c.plugins) || c.plugins.length !== 1) err("plugins must be the single Elementor ZIP pin");
else if (!/^https:\/\/downloads\.wordpress\.org\/plugin\/elementor\.\d+(\.\d+)+\.zip$/.test(c.plugins[0])) err("plugins[0] must be a pinned elementor ZIP URL: " + c.plugins[0]);
if (!Array.isArray(c.themes) || c.themes.length !== 1 || c.themes[0] !== "./themes/koorosh") err("themes must map only the standalone Koorosh theme");
if (JSON.stringify(Object.keys(c).sort()) !== JSON.stringify(["$schema", "core", "phpVersion", "plugins", "themes"].sort())) err("unexpected/missing top-level keys: " + Object.keys(c).join(","));
process.exit(bad);
' "$root/.wp-env.json" \
	&& ok ".wp-env.json pins are well-formed (core ref, phpVersion, single Elementor ZIP, Koorosh theme)" \
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
if ! python3 -c 'import yaml' 2>/dev/null; then
	echo "PyYAML not present; installing pyyaml (host-local, not committed)"
	python3 -m pip install --quiet --user pyyaml >/dev/null 2>&1 || {
		echo "SKIP: could not make PyYAML available; workflow YAML not parsed here (GitHub still parses workflows at push time)"
	}
fi
if python3 -c 'import yaml' 2>/dev/null; then
	yaml_bad=0
	yaml_files=0
	while IFS= read -r -d '' f; do
		yaml_files=$((yaml_files + 1))
		if python3 -c 'import sys, yaml; yaml.safe_load(open(sys.argv[1], encoding="utf-8"))' "$f" 2>/dev/null; then
			echo "PASS: YAML parses: ${f#"$root"/}"
		else
			echo "FAIL: YAML does not parse: ${f#"$root"/}"
			yaml_bad=1
		fi
	done < <(find "$root/.github/workflows" \( -name '*.yml' -o -name '*.yaml' \) -print0 2>/dev/null)
	if [ "$yaml_files" -eq 0 ]; then
		ko "no workflow YAML files found under .github/workflows (nothing validated)"
	else
		[ "$yaml_bad" -eq 0 ] && ok "all $yaml_files workflow YAML file(s) parse" || ko "workflow YAML failed to parse"
	fi
else
	ko "workflow YAML check NOT RUN (no YAML parser available)"
fi

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

if node "$root/tests/static/validate-site-shell.mjs"; then
	ok "Site-shell navigation, menu-structure and honesty guardrails"
else
	ko "Site-shell navigation guardrails failed"
fi

if node --check "$root/themes/koorosh/nav.js"; then
	ok "nav.js classic-script syntax (node --check)"
else
	ko "nav.js syntax check failed"
fi

printf '== Static validation result: %s passed, %s failed ==\n' "$pass" "$fail"
[ "$fail" -eq 0 ] || exit 1
exit 0
