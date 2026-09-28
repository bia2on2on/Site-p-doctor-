#!/usr/bin/env node
// Static contract checks for Koorosh's standalone semantic shell.
// Runtime markup and free-Elementor/no-Pro behavior are covered by smoke.sh.

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const theme = join(root, "themes/koorosh");
const read = (file) => readFileSync(join(theme, file), "utf8");
let pass = 0;
let fail = 0;
const ok = (message) => { console.log(`PASS: ${message}`); pass += 1; };
const ko = (message) => { console.error(`FAIL: ${message}`); fail += 1; };
const assert = (condition, message) => condition ? ok(message) : ko(message);

const functions = read("functions.php");
const header = read("header.php");
const footer = read("footer.php");
const index = read("index.php");
const css = read("foundation.css");

assert(
  /register_nav_menus\s*\([\s\S]*?'primary'\s*=>[\s\S]*?'footer'\s*=>/.test(functions),
  "primary and footer WordPress menu locations are registered",
);
assert(
  /add_action\(\s*'elementor\/theme\/register_locations'/.test(functions)
    && /is_callable\(\s*array\(\s*\$elementor_theme_manager\s*,\s*'register_location'\s*\)\s*\)/.test(functions)
    && /register_location\(\s*'header'\s*\)/.test(functions)
    && /register_location\(\s*'footer'\s*\)/.test(functions),
  "documented Elementor Theme Builder header/footer locations are registered safely",
);
for (const [file, source, location, tag, menuLocation] of [
  ["header.php", header, "header", "header", "primary"],
  ["footer.php", footer, "footer", "footer", "footer"],
]) {
  assert(
    new RegExp(`!\\s*function_exists\\(\\s*'elementor_theme_do_location'\\s*\\)\\s*\\|\\|\\s*!\\s*elementor_theme_do_location\\(\\s*'${location}'\\s*\\)`).test(source),
    `${file} falls back if Elementor is absent or the ${location} location does not render`,
  );
  assert(
    new RegExp(`<${tag}\\b`).test(source)
      && new RegExp(`'theme_location'\\s*=>\\s*'${menuLocation}'`).test(source)
      && /'fallback_cb'\s*=>\s*false/.test(source)
      && /aria-label/.test(source),
    `${file} has a semantic fallback and only the assigned, accessibly labelled ${menuLocation} menu`,
  );
}
assert(
  /get_bloginfo\(\s*'name'\s*\)/.test(header)
    && /home_url\(\s*'\/'\s*\)/.test(header)
    && /get_bloginfo\(\s*'name'\s*\)/.test(footer)
    && /wp_date\(\s*'Y'\s*\)/.test(footer),
  "fallback identity and copyright use WordPress site data only",
);
assert(
  /<a\s+class="koorosh-skip-link"\s+href="#main-content"/.test(header)
    && /<main\s+id="main-content"\s+tabindex="-1">/.test(index),
  "skip link targets a focusable main landmark",
);
assert(
  /the_content\(\)/.test(index) && /get_header\(\)/.test(index) && /get_footer\(\)/.test(index),
  "normal page content remains in the WordPress loop/the_content with theme shell templates",
);
assert(
  /:focus-visible\s*\{/.test(css)
    && /\.koorosh-skip-link:focus\s*\{/.test(css)
    && /flex-wrap:\s*wrap/.test(css)
    && /overflow-wrap:\s*anywhere/.test(css),
  "fallback shell has visible keyboard focus and wrapping, RTL-safe responsive rules",
);

console.log(`== Koorosh shell static checks: ${pass} passed, ${fail} failed ==`);
process.exit(fail ? 1 : 0);
