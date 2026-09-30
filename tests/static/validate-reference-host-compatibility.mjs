#!/usr/bin/env node
// Static guardrails for the GitHub-hosted reference-host compatibility phase.
// Runtime compatibility and the generated parity report are tested separately
// inside the ephemeral wp-env Docker environment.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const config = JSON.parse(read('.wp-env.json'));
const workflow = read('.github/workflows/wordpress-elementor-smoke.yml');
const runtime = read('tests/wp-env/reference-host-compatibility.mjs');
const theme = read('themes/koorosh/functions.php');
const header = read('themes/koorosh/header.php');
const footer = read('themes/koorosh/footer.php');
const settingsBrowser = read('tests/browser/theme-settings.mjs');
const parity = JSON.parse(read('reconstruction/manifest.json')).reference_host_compatibility_ci;

assert.equal(config.core, 'WordPress/WordPress#7.1.2');
assert.equal(config.phpVersion, '8.1');
assert.equal(config.multisite, false);
assert.equal(config.config.WP_MEMORY_LIMIT, '40M');
assert.equal(config.config.WP_DEBUG, true, 'WP_DEBUG remains active for the diagnostic simulation');
assert.equal(Object.hasOwn(config.config, 'WP_DEBUG_DISPLAY'), false, 'do not force response display behavior for diagnostics');
assert.equal(Object.hasOwn(config.config, 'WP_DEBUG_LOG'), false, 'do not force debug.log behavior for diagnostics');
assert.equal(Object.hasOwn(config.config, 'WP_MAX_MEMORY_LIMIT'), false, 'do not fake GitHub host memory with 4048M');
assert.deepEqual(config.plugins, ['https://downloads.wordpress.org/plugin/elementor.4.3.2.zip']);
assert.deepEqual(config.themes, ['./themes/koorosh'], 'Koorosh is the only mapped theme; Hello is historical evidence only');
assert(!JSON.stringify(config).match(/elementor.?pro|activator|crack/i), 'public wp-env contains no Pro package or activator');

assert(workflow.includes('REFERENCE-HOST COMPATIBILITY CI (host-parity simulation; no Pro/LiteSpeed/real mail)'));
assert(workflow.includes('node tests/wp-env/reference-host-compatibility.mjs'));
assert(workflow.includes('name: reference-host-compatibility-${{ github.event.pull_request.head.sha || github.sha }}'));
assert(workflow.indexOf('node tests/browser/theme-settings.mjs') < workflow.indexOf('node tests/wp-env/reference-host-compatibility.mjs'));
assert(workflow.indexOf('node tests/browser/homepage.mjs') < workflow.indexOf('node tests/wp-env/reference-host-compatibility.mjs'));
assert(workflow.includes('if: always()') && workflow.includes('retention-days: 14'));

for (const marker of [
  "'/index.php/%year%/%monthnum%/%day%/%postname%/'",
  "'Asia/Tehran'",
  "'fa_IR'",
  "'WP_MEMORY_LIMIT'",
  "ZipArchive",
  "ZIP RUNTIME SMOKE",
  'imagecreatetruecolor',
  'is_multisite()',
  'ELEMENTOR PRO RUNTIME PARITY = NOT TESTED IN PUBLIC CI',
  'LITESPEED PARITY = NOT TESTED',
  'NO EXACT DB PARITY',
  "'NOT_TESTED'",
]) assert(runtime.includes(marker), `Compatibility runtime must retain ${marker}`);
assert(!/wp_mail\s*\(|\bmail\s*\(/.test(runtime), 'compatibility phase never sends mail');
assert(!/elementor\.pro\.[\w.-]+\.zip|downloads\.wordpress\.org\/plugin\/elementor-pro/i.test(runtime), 'compatibility phase never fetches Elementor Pro');
assert(runtime.includes('not an Elementor kit import') && runtime.includes('historical Elementor ZipArchive import error'), 'synthetic ZIP smoke must remain explicitly distinct from Elementor import proof');
assert(runtime.includes("reason: logDelta.enabled ? 'debug.log was not readable in this runtime' : 'WP_DEBUG_LOG is disabled in this runtime'"), 'debug-log gaps must distinguish disabled logging from an unreadable log');
assert(runtime.includes('log scan=${report.runtime_observations.debug_log_scan.status}'), 'runtime parity report must preserve NOT_TESTED log-scan status');

assert(theme.includes("'elementor/theme/register_locations'"));
assert(theme.includes("method_exists( $elementor_theme_manager, 'register_location' )"));
assert(header.includes("! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'header' )"));
assert(footer.includes("! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'footer' )"));
assert(settingsBrowser.includes('Persian admin locale renders RTL document semantics'));
assert(settingsBrowser.includes('Persian labels render for all six planned sections'));
assert(settingsBrowser.includes('PHP warning/notice/deprecation/fatal marker'));

assert.equal(parity.name, 'REFERENCE-HOST COMPATIBILITY CI / HOST-PARITY SIMULATION');
assert.equal(parity.dimensions.elementor_pro.status, 'NOT_TESTED');
assert.equal(parity.dimensions.web_server.status, 'NOT_TESTED');
assert.equal(parity.dimensions.php.status, 'FAMILY_ONLY');
assert.equal(parity.dimensions.database.exact_reference_version_status, 'NOT_TESTED');
assert.equal(parity.dimensions.clean_elementor_pro_kit_import.status, 'NOT_TESTED');
assert(parity.explicit_non_claims.some(line => line.includes('Not real host acceptance')));

console.log('PASS: reference-host compatibility CI boundary, config, parity gaps, public-API guards, ZIP/GD diagnostics, and no-real-email/Pro constraints');
