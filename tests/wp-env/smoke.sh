#!/usr/bin/env bash
#
# Runtime smoke test: clean WordPress + FREE Elementor via wp-env.
#
# Prerequisites (host): Node >= 18.12, Docker, and @wordpress/env installed
# (npm install --global @wordpress/env@11.16.0) or WP_ENV_BIN overridden.
# The environment must have been started first: `wp-env start`.
#
# Pins are read from .wp-env.json (single source of truth); the script never
# hardcodes expected versions itself.
#
# Scope: proves WordPress boots, the pinned WordPress version is retrievable,
# Elementor is installed AND active AND runtime-loaded at the pinned version,
# and the site responds over HTTP. This is a FREE-Elementor CI smoke test only;
# it is NOT Elementor Pro acceptance and NOT a real-host compatibility proof.

set -u -o pipefail

WP_ENV_BIN="${WP_ENV_BIN:-wp-env}"
WP_ENV_CONFIG="$(pwd)/.wp-env.json"
BASE_URL="${WP_ENV_BASE_URL:-http://localhost:8888}"

pass=0
fail=0

note() { printf '%s\n' "$*"; }
ok()   { printf 'PASS: %s\n' "$*"; pass=$((pass + 1)); }
# Every FAIL is also emitted as a GitHub annotation (::error) so failure
# evidence stays retrievable via the check-runs API even where step-log
# download is not possible (e.g. restricted egress to log blob storage).
ko() {
	printf 'FAIL: %s\n' "$*"
	printf '::error title=Smoke FAIL::%s\n' "$*"
	fail=$((fail + 1))
}

# expect_eq <label> <expected> <actual>
expect_eq() {
	local label="$1" expected="$2" actual="$3"
	if [ "$expected" = "$actual" ]; then
		ok "$label (got: $actual)"
	else
		ko "$label (expected: $expected, got: $actual)"
	fi
}

# run_wp <args...> : run wp-cli inside the wp-env development container
run_wp() {
	"$WP_ENV_BIN" run cli "$@"
}

if [ ! -f "$WP_ENV_CONFIG" ]; then
	printf '::error title=Smoke FAIL::config not found: %s\n' "$WP_ENV_CONFIG"
	note "FAIL: config not found: $WP_ENV_CONFIG"
	exit 2
fi

# ---- Read pins from .wp-env.json (single source of truth) -------------------
expected_wp="$(node -e '
const c = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const m = String(c.core || "").match(/^WordPress\/WordPress#(\d+(?:\.\d+)+)$/);
if (!m) { process.exit(1); }
console.log(m[1]);
' "$WP_ENV_CONFIG")" || { note "FAIL: .wp-env.json core pin missing/malformed"; exit 2; }

expected_elementor="$(node -e '
const c = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const url = (c.plugins || [])[0] || "";
const m = url.match(/^https:\/\/downloads\.wordpress\.org\/plugin\/elementor\.(\d+(?:\.\d+)+)\.zip$/);
if (!m) { process.exit(1); }
console.log(m[1]);
' "$WP_ENV_CONFIG")" || { note "FAIL: .wp-env.json elementor pin missing/malformed"; exit 2; }

note "== Smoke: WordPress $expected_wp + free Elementor $expected_elementor ($BASE_URL) =="

# ---- 1. WordPress boots and reports its version via WP-CLI -----------------
wp_cli_version="$(run_wp wp core version)" || ko "WP-CLI reachable in wp-env container"
[ -n "${wp_cli_version:-}" ] && expect_eq "WordPress version (wp core version)" "$expected_wp" "$wp_cli_version"

run_wp wp core is-installed >/dev/null 2>&1 \
	&& ok "WordPress core is installed (wp core is-installed)" \
	|| ko "WordPress core is not installed"

# ---- 2. WordPress version retrievable at PHP runtime -----------------------
wp_runtime_version="$(run_wp wp eval 'echo get_bloginfo("version");')" \
	&& expect_eq "WordPress version (runtime get_bloginfo)" "$expected_wp" "$wp_runtime_version" \
	|| ko "Could not retrieve WordPress version at PHP runtime"

# ---- 3. Elementor installed and active --------------------------------------
active_plugins="$(run_wp wp plugin list --status=active --field=name)" || ko "Could not list active plugins"
if printf '%s\n' "$active_plugins" | grep -qx 'elementor'; then
	ok "Elementor is installed and active (wp plugin list --status=active)"
else
	ko "Elementor not found among active plugins"
fi

# ---- 4. Elementor runtime-loaded version retrievable ------------------------
elementor_version="$(run_wp wp eval 'echo defined("ELEMENTOR_VERSION") ? ELEMENTOR_VERSION : "";')" \
	&& expect_eq "Elementor runtime-loaded version (ELEMENTOR_VERSION)" "$expected_elementor" "$elementor_version" \
	|| ko "ELEMENTOR_VERSION not defined at runtime (plugin not loaded)"

# ---- 5. Site responds over HTTP ---------------------------------------------
http_code="$(curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}' "$BASE_URL/")" \
	&& expect_eq "HTTP status for site home" "200" "$http_code" \
	|| ko "Site home did not respond over HTTP at $BASE_URL/"

home_body="$(curl --fail --silent --show-error "$BASE_URL/")" || true
if printf '%s' "${home_body:-}" | grep -qi '<html'; then
	ok "Site home returns an HTML document"
else
	ko "Site home did not return HTML"
fi

note "== Smoke result: $pass passed, $fail failed =="
printf '::notice title=Smoke result::%s passed, %s failed\n' "$pass" "$fail"
if [ "$fail" -gt 0 ]; then
	note "This smoke test covers free Elementor CI only; NOT Elementor Pro acceptance."
	exit 1
fi
exit 0
