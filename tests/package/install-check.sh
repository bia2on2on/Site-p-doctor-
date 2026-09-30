#!/usr/bin/env bash
#
# Install the generated Koorosh TEST-HOST TRANSFER PACKAGE ZIP into a CLEAN
# WordPress (pinned core + pinned free Elementor, NO source-directory theme
# mapping) and prove it installs, activates and serves.
#
# Preconditions (done by CI): package built into tests/package/pkg/, and
# `wp-env start` executed from tests/package/ (uses tests/package/.wp-env.json).
# Install path = WP-CLI `wp theme install <zip>` (WordPress Theme_Upgrader, the
# same installer class the Admin "Upload Theme" screen uses). The browser upload
# form itself is NOT exercised.
# No real mail is sent; nothing here touches Elementor Pro, LiteSpeed or a real host.
set -u -o pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
pkg_dir="$root/tests/package/pkg"
BASE_URL="${BASE_URL:-http://localhost:8888}"
WP_ENV_BIN="${WP_ENV_BIN:-wp-env}"
pass=0
fail=0

ok() { printf 'PASS: %s\n' "$*"; pass=$((pass + 1)); }
ko() { printf 'FAIL: %s\n' "$*"; printf '::error title=Package install FAIL::%s\n' "$*"; fail=$((fail + 1)); }
expect_eq() { if [ "$2" = "$3" ]; then ok "$1 (got: $3)"; else ko "$1 (expected: $2, got: $3)"; fi; }

wp() { (cd "$root/tests/package" && "$WP_ENV_BIN" run cli wp "$@"); }

manifest="$pkg_dir/koorosh-transfer-manifest.json"
[ -f "$manifest" ] || { ko "manifest missing in $pkg_dir"; exit 2; }
zip_name="$(node -p 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).zip_file' "$manifest")"
want_version="$(node -p 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).theme_version' "$manifest")"
[ -f "$pkg_dir/$zip_name" ] || { ko "ZIP missing: $zip_name"; exit 2; }
echo "== Installing $zip_name into a clean WordPress =="

# 0. The clean environment must be really clean and pinned like the main CI.
node -e '
const fs = require("fs");
const a = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const b = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const same = a.core === b.core && a.phpVersion === b.phpVersion && JSON.stringify(a.plugins) === JSON.stringify(b.plugins);
process.exit(same && a.themes.length === 0 ? 0 : 1);
' "$root/tests/package/.wp-env.json" "$root/.wp-env.json" \
	&& ok "clean-env config pins equal root .wp-env.json and map NO theme" \
	|| ko "tests/package/.wp-env.json drifted from root pins or maps a theme"

if wp theme is-installed koorosh >/dev/null 2>&1; then ko "koorosh already present before ZIP install (environment not clean)"; else ok "koorosh absent before install (clean WordPress)"; fi
wp plugin is-active elementor >/dev/null 2>&1 && ok "pinned free Elementor active in clean environment" || ko "free Elementor not active"
if wp plugin is-installed elementor-pro >/dev/null 2>&1; then ko "Elementor Pro unexpectedly present"; else ok "Elementor Pro absent (not bundled, not installed)"; fi

# 1. Install FROM ZIP
if wp theme install "/var/www/html/wp-content/transfer-package/$zip_name"; then ok "wp theme install <package ZIP> succeeded"; else ko "theme install from ZIP failed"; fi
wp theme is-installed koorosh >/dev/null 2>&1 && ok "koorosh is installed under themes/koorosh" || ko "koorosh not installed after ZIP install"
expect_eq "installed theme version equals manifest/style.css" "$want_version" "$(wp theme get koorosh --field=version 2>/dev/null)"
expect_eq "installed theme Name" "کوروش" "$(wp eval 'echo wp_get_theme("koorosh")->get("Name");')"
expect_eq "installed theme has no Template parent" "" "$(wp eval 'echo wp_get_theme("koorosh")->get("Template") === "koorosh" ? "" : wp_get_theme("koorosh")->get("Template");')"

# 2. Installed bytes == manifest inventory (no missing, extra or altered file)
installed_json="$(wp eval '
$base = get_theme_root() . "/koorosh";
$out = array();
$it = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $base, FilesystemIterator::SKIP_DOTS ) );
foreach ( $it as $f ) { if ( $f->isFile() ) { $out[ "koorosh/" . substr( $f->getPathname(), strlen( $base ) + 1 ) ] = hash_file( "sha256", $f->getPathname() ); } }
ksort( $out );
echo wp_json_encode( $out );
')"
if INSTALLED="$installed_json" node -e '
const m = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const inst = JSON.parse(process.env.INSTALLED);
const want = Object.fromEntries(m.files.map(f => [f.path, f.sha256]));
const a = JSON.stringify(Object.entries(want).sort()), b = JSON.stringify(Object.entries(inst).sort());
if (a !== b) { console.error("installed != manifest inventory"); console.error(Object.keys(want).filter(k => inst[k] !== want[k]).join(",") + " | extra: " + Object.keys(inst).filter(k => !(k in want)).join(",")); process.exit(1); }
' "$manifest"; then ok "installed theme files are byte-identical to the manifest inventory ($(printf '%s' "$installed_json" | node -p 'Object.keys(JSON.parse(require("fs").readFileSync(0,"utf8"))).length') files)"; else ko "installed theme files differ from manifest inventory"; fi

# 3. PHP lint of installed PHP files
lint_bad=0
for f in $(node -p 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).files.map(f=>f.path).filter(p=>p.endsWith(".php")).map(p=>p.replace(/^koorosh\//,"")).join(" ")' "$manifest"); do
	(cd "$root/tests/package" && "$WP_ENV_BIN" run cli php -l "/var/www/html/wp-content/themes/koorosh/$f" >/dev/null 2>&1) || { ko "PHP lint failed on installed $f"; lint_bad=1; }
done
[ "$lint_bad" -eq 0 ] && ok "PHP lint passes for every installed PHP file"

# 4. Activate + identity
if wp theme activate koorosh; then ok "theme activated"; else ko "theme activation failed"; fi
expect_eq "active theme" "koorosh" "$(wp theme list --status=active --field=name 2>/dev/null)"
expect_eq "no parent theme" "" "$(wp eval 'echo wp_get_theme()->parent() ? wp_get_theme()->parent()->get_stylesheet() : "";')"
wp plugin is-active elementor >/dev/null 2>&1 && ok "free Elementor still active with ZIP-installed Koorosh" || ko "Elementor inactive after Koorosh activation"

# 5. Frontend responds, no PHP diagnostics, theme assets served from the installed package
body_file="$(mktemp)"; hdr_file="$(mktemp)"
code="$(curl --silent --show-error --output "$body_file" --dump-header "$hdr_file" --write-out '%{http_code}' "$BASE_URL/")"
expect_eq "frontend HTTP status after activation" "200" "$code"
grep -iaq '<html' "$body_file" && ok "frontend returns an HTML document" || ko "frontend did not return HTML"
if grep -Eaq '(Fatal error|Parse error|Warning|Notice|Deprecated)(</b>)?:|Uncaught ' "$body_file"; then ko "PHP diagnostics visible in frontend HTML"; else ok "no PHP fatal/warning/notice text in frontend HTML (WP_DEBUG on)"; fi
for a in 'koorosh/style.css' 'koorosh/foundation.css' 'koorosh/nav.js'; do
	grep -aq "/themes/$a" "$body_file" && ok "frontend references $a" || ko "frontend missing $a"
done
for font in Vazirmatn-Regular.woff2 Vazirmatn-Bold.woff2; do
	r="$(curl --silent --output /dev/null --write-out '%{http_code} %{content_type}' "$BASE_URL/wp-content/themes/koorosh/fonts/$font")"
	[[ "$r" == 200\ *font* ]] && ok "font served from installed package: $font ($r)" || ko "font not served: $font ($r)"
done

# 6. Settings registration survives installation from ZIP
expect_eq "Koorosh settings constants/functions loaded from ZIP-installed theme" "yes" "$(wp eval 'echo ( defined("KOOROSH_SETTINGS_PAGE") && function_exists("koorosh_settings_schema") && function_exists("koorosh_render_settings_page") ) ? "yes" : "no";')"
expect_eq "settings page slug" "koorosh-settings" "$(wp eval 'echo defined("KOOROSH_SETTINGS_PAGE") ? KOOROSH_SETTINGS_PAGE : "";')"
expect_eq "settings option registered via register_setting" "yes" "$(wp eval '$r = get_registered_settings(); echo isset($r[KOOROSH_SETTINGS_OPTION]) ? "yes" : "no";')"

jar="$(mktemp)"
# Disposable wp-env admin defaults (public, ephemeral container; never a real host credential).
curl --silent --output /dev/null -c "$jar" -b 'wordpress_test_cookie=WP%20Cookie%20check' \
	--data-urlencode 'log=admin' --data-urlencode 'pwd=password' --data-urlencode 'wp-submit=Log In' \
	--data-urlencode "redirect_to=$BASE_URL/wp-admin/" --data-urlencode 'testcookie=1' "$BASE_URL/wp-login.php"
# Warm-up: Elementor redirects the FIRST admin load (onboarding); follow it once so the settings request is direct.
warm="$(mktemp)"
curl --silent --location -b "$jar" -c "$jar" "$BASE_URL/wp-admin/" > "$warm"
# (No assertion here: the landing page may be Elementor's onboarding. Authentication is proven by the settings screen returning 200 below; an anonymous request would redirect.)
rm -f "$warm"
page="$(mktemp)"
pcode="$(curl --silent --output "$page" --write-out '%{http_code}' -b "$jar" "$BASE_URL/wp-admin/admin.php?page=koorosh-settings")"
expect_eq "settings screen HTTP status" "200" "$pcode"
grep -aq 'تنظیمات کوروش' "$page" && ok "settings screen renders 'تنظیمات کوروش'" || ko "settings screen title missing"
grep -Eaq "href=['\"]admin\.php\?page=koorosh-settings['\"]" "$page" && ok "admin menu exposes the Koorosh settings page link" || ko "admin menu lacks page=koorosh-settings"
# The default tab is a read-only hub; a form tab carries the Settings API group field.
form="$(mktemp)"
curl --silent -b "$jar" "$BASE_URL/wp-admin/admin.php?page=koorosh-settings&tab=sales" > "$form"
grep -aq 'koorosh_settings_group' "$form" && ok "settings form tab carries the Settings API option group" || ko "settings form group missing on tab=sales"
rm -f "$form"
if grep -Eaq '(Fatal error|Parse error)(</b>)?:|Uncaught ' "$page"; then ko "PHP fatal visible on settings screen"; else ok "no PHP fatal on settings screen"; fi

# 7. Lead delivery stays OFF by default; nothing persisted; no mail path exercised
expect_eq "lead delivery effective state after install" "off" "$(wp eval 'echo cpms_lead_delivery_enabled() ? "on" : "off";')"
expect_eq "CPMS_LEAD_DELIVERY_ENABLED not defined by the package" "no" "$(wp eval 'echo defined("CPMS_LEAD_DELIVERY_ENABLED") ? "yes" : "no";')"
expect_eq "site-level lead switch default" "off" "$(wp eval '$s = koorosh_get_settings(); echo $s["lead_site_enabled"] ? "on" : "off";')"
expect_eq "no settings row created by install/activation/reading" "none" "$(wp eval 'echo false === get_option( KOOROSH_SETTINGS_OPTION, false ) ? "none" : "row";')"

# 8. Non-indexed test-host model: with blog_public=0 the ZIP-installed theme still adds X-Robots-Tag
wp option update blog_public 0 >/dev/null 2>&1
curl --silent --output /dev/null --dump-header "$hdr_file" "$BASE_URL/"
grep -iaq '^x-robots-tag:.*noindex' "$hdr_file" && ok "blog_public=0 -> X-Robots-Tag noindex served by ZIP-installed theme" || ko "X-Robots-Tag noindex missing with blog_public=0"

rm -f "$body_file" "$hdr_file" "$jar" "$page"
echo "== Package install result: $pass passed, $fail failed =="
printf '::notice title=Package install result::%s passed, %s failed (ZIP install into clean WordPress; NOT host, Pro or LiteSpeed acceptance)\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
