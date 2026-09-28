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
# the PHP runtime family matches the .wp-env.json pin (family/minor only —
# patch-level parity with the host is neither configured nor claimed), the
# database version is retrievable (recorded informationally, NOT
# parity-asserted), and the site responds over HTTP. This is a FREE-Elementor
# CI smoke test only; it is NOT Elementor Pro acceptance and NOT a real-host
# compatibility proof.

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

# phpVersion must be major.minor (wp-env documents the "0.0" format; exact
# host patches like 8.1.34 are not configurable, so only family parity is
# representable here).
expected_php_family="$(node -e '
const c = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const m = String(c.phpVersion || "").match(/^(\d+\.\d+)$/);
if (!m) { process.exit(1); }
console.log(m[1]);
' "$WP_ENV_CONFIG")" || { note "FAIL: .wp-env.json phpVersion pin missing/malformed (expected major.minor)"; exit 2; }

note "== Smoke: WordPress $expected_wp + free Elementor $expected_elementor (PHP family $expected_php_family) ($BASE_URL) =="

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
# Match from a temp file: pipefail + `grep -q` on a pipe can fail via SIGPIPE.
active_plugins_file="$(mktemp)"
printf '%s\n' "${active_plugins:-}" > "$active_plugins_file"
if grep -qx 'elementor' "$active_plugins_file"; then
	ok "Elementor is installed and active (wp plugin list --status=active)"
else
	ko "Elementor not found among active plugins"
fi
rm -f "$active_plugins_file"

# ---- 4. Elementor runtime-loaded version retrievable ------------------------
elementor_version="$(run_wp wp eval 'echo defined("ELEMENTOR_VERSION") ? ELEMENTOR_VERSION : "";')" \
	&& expect_eq "Elementor runtime-loaded version (ELEMENTOR_VERSION)" "$expected_elementor" "$elementor_version" \
	|| ko "ELEMENTOR_VERSION not defined at runtime (plugin not loaded)"

# ---- 4b. PHP runtime family matches the pin (NO patch-level parity claim) ---
php_runtime_version="$(run_wp wp eval 'echo PHP_VERSION;')" || ko "Could not retrieve PHP_VERSION at runtime"
php_family="$(printf '%s' "${php_runtime_version:-}" | cut -d. -f1,2)"
expect_eq "PHP runtime family matches .wp-env.json pin (family only; patch parity NOT claimed)" "$expected_php_family" "$php_family"
[ -n "${php_runtime_version:-}" ] && note "CI runtime PHP_VERSION=$php_runtime_version (informational evidence; owner-reported host exact = 8.1.34)"

# ---- 4c. Database version retrievable (informational, NOT parity-asserted) --
# NOTE: WP-CLI has no `wp db version` subcommand; query through WordPress
# instead (SELECT VERSION() via wpdb), recorded as evidence only.
db_version="$(run_wp wp eval 'global $wpdb; echo $wpdb->get_var("SELECT VERSION()");')" \
	&& ok "Database version retrievable (recorded, NOT parity-asserted): $db_version" \
	|| ko "Could not retrieve database version (wpdb SELECT VERSION())"

# ---- 5. Site responds over HTTP ---------------------------------------------
http_code="$(curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}' "$BASE_URL/")" \
	&& expect_eq "HTTP status for site home" "200" "$http_code" \
	|| ko "Site home did not respond over HTTP at $BASE_URL/"

home_body=""
curl_body_exit=0
home_body="$(curl --fail --silent --show-error "$BASE_URL/")" || curl_body_exit=$?
# Grep a temp file, not a pipe: with pipefail, `grep -q` on a pipe exits at
# the first match while printf can still receive SIGPIPE (bodies larger than
# the pipe buffer), making a successful match report failure (observed in CI).
home_body_file="$(mktemp)"
printf '%s' "${home_body:-}" > "$home_body_file"
if grep -iaq '<html' "$home_body_file"; then
	ok "Site home returns an HTML document"
else
	# Emit retrievable runtime evidence before failing: body size, curl exit
	# code, and the first bytes of the response actually received.
	body_len="${#home_body}"
	body_head="$(head -c 200 "$home_body_file" | tr '\n\r' '  ')"
	printf '::error title=Smoke evidence::home body length=%s curl_exit=%s head200=[%s]\n' "$body_len" "$curl_body_exit" "$body_head"
	ko "Site home did not return HTML"
fi
rm -f "$home_body_file"

# Standalone Koorosh activation is explicit: wp-env maps themes but does not guarantee activation.
run_wp wp theme activate koorosh && ok "Koorosh theme activated" || ko "Could not activate Koorosh theme"
active_theme="$(run_wp wp theme list --status=active --field=name)" \
  && expect_eq "Active theme" "koorosh" "$active_theme" \
  || ko "Active theme not retrieved"
theme_name="$(run_wp wp eval 'echo wp_get_theme()->get("Name");')" \
  && expect_eq "Theme Name" "کوروش" "$theme_name" \
  || ko "Theme Name not retrieved"
template="$(run_wp wp eval 'echo wp_get_theme()->get("Template");')" \
  && expect_eq "Standalone Template (empty parent)" "" "$template" \
  || ko "Theme Template not retrieved"
parent="$(run_wp wp eval 'echo wp_get_theme()->parent() ? wp_get_theme()->parent()->get_stylesheet() : "";')" \
  && expect_eq "No parent theme" "" "$parent" \
  || ko "Parent theme check failed"
menu_locations="$(run_wp wp eval '$m = get_registered_nav_menus(); echo (isset($m["primary"]) && isset($m["footer"])) ? "yes" : "no";')" \
  && expect_eq "Fallback primary/footer menu locations registered" "yes" "$menu_locations" \
  || ko "Fallback menu locations could not be verified"
run_wp wp plugin is-active elementor >/dev/null 2>&1 \
  && ok "Free Elementor still active with Koorosh active" \
  || ko "Free Elementor no longer active after Koorosh activation"
for php_file in functions.php index.php header.php footer.php; do
  run_wp php -l "/var/www/html/wp-content/themes/koorosh/$php_file" \
    && ok "PHP lint: $php_file" || ko "PHP lint failed: $php_file"
done
home_body="$(curl --fail --silent --show-error "$BASE_URL/")" \
  && ok "Activated Koorosh homepage HTTP 200" || ko "Activated Koorosh homepage HTTP request failed"
for asset in 'koorosh/style.css' 'koorosh/foundation.css'; do
  if [[ "$home_body" == *"/themes/$asset"* ]]; then ok "Homepage references $asset"; else ko "Homepage missing $asset"; fi
done
for marker in 'skip-link' '<main id="content"' 'site-header' 'site-footer'; do
  if [[ "$home_body" == *"$marker"* ]]; then ok "Homepage contains shell marker: $marker"; else ko "Homepage missing shell marker: $marker"; fi
done
for font in Vazirmatn-Regular.woff2 Vazirmatn-Bold.woff2; do
  response="$(curl --silent --show-error --output /dev/null --write-out '%{http_code} %{content_type}' "$BASE_URL/wp-content/themes/koorosh/fonts/$font")"
  if [[ "$response" == 200\ *font* ]]; then
    ok "Font URL served: $font ($response)"
  else ko "Font URL invalid: $font ($response)"; fi
done
font_registered="$(run_wp wp eval '$f = class_exists("Elementor\\Fonts") ? \Elementor\Fonts::get_fonts() : array(); echo (isset($f["Vazirmatn"]) && $f["Vazirmatn"] === "koorosh-local") ? "yes" : "no";')" \
  && expect_eq "Elementor font list includes local Vazirmatn" "yes" "$font_registered" \
  || ko "Elementor font list evaluation failed"
if run_wp wp language core install fa_IR --activate; then
  ok "fa_IR language installed and activated"
  rtl_html="$(curl --fail --silent --show-error "$BASE_URL/")"
  html_tag="$(printf '%s' "$rtl_html" | grep -ioE '<html[^>]*>' | head -1)"
  if [[ "$html_tag" == *'lang="fa-IR"'* && "$html_tag" == *'dir="rtl"'* ]]; then
    ok "fa_IR homepage HTML lang and RTL direction"
  else ko "fa_IR homepage HTML missing lang=fa-IR or dir=rtl"; fi
else ko "fa_IR installation/activation failed"; fi

note "== Smoke result: $pass passed, $fail failed =="
printf '::notice title=Smoke result::%s passed, %s failed\n' "$pass" "$fail"
if [ "$fail" -gt 0 ]; then
	note "This smoke test covers free Elementor CI only; NOT Elementor Pro acceptance."
	exit 1
fi
exit 0
