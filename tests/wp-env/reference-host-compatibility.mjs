#!/usr/bin/env node
/**
 * Bounded REFERENCE-HOST COMPATIBILITY CI / HOST-PARITY SIMULATION.
 *
 * Runs in the existing fresh @wordpress/env Docker stack. It does not contact
 * the owner host, install Pro, send email, or import an Elementor kit. Exact
 * parity is reported only for values this runtime can measure and compare.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const outputDir = resolve(import.meta.dirname, '../browser/artifacts/reference-host-compatibility');
const wpEnv = resolve(import.meta.dirname, '../browser/node_modules/.bin/wp-env');
const base = process.env.WP_ENV_BASE_URL || 'http://localhost:8888';
const referencePermalink = '/index.php/%year%/%monthnum%/%day%/%postname%/';
const committedParity = JSON.parse(readFileSync(resolve(root, 'reconstruction/manifest.json'), 'utf8')).reference_host_compatibility_ci;
const pageSlugs = [
  'cpms-home', 'product-overview', 'demo', 'appointment-reception-queue',
  'patient-record-continuity', 'doctor-workspace', 'patient-portal',
  'prescriptions-documents', 'faq', 'security-data-access', 'privacy', 'terms',
];
mkdirSync(outputDir, { recursive: true });

const report = {
  schema_version: 1,
  report_type: 'REFERENCE-HOST COMPATIBILITY CI / HOST-PARITY SIMULATION',
  evidence_boundary: 'Ephemeral GitHub-hosted wp-env runtime only; not real-host acceptance.',
  source_sha: process.env.REFERENCE_REPORT_HEAD_SHA || process.env.GITHUB_SHA || 'local-run',
  reference_evidence: 'OWNER-REPORTED; not independently agent-verified.',
  test_result: 'RUNNING',
  runtime_observations: {},
  parity_dimensions: committedParity.dimensions,
  checks: [],
  parity_gaps: [
    'ELEMENTOR PRO RUNTIME PARITY = NOT TESTED IN PUBLIC CI',
    'LITESPEED PARITY = NOT TESTED',
    'NO EXACT DB PARITY (wp-env uses its default floating mariadb:lts image)',
    'PHP 8.1.34 exact patch parity is not provided by the selected official wp-env / WordPress image path; PHP family 8.1 only',
    'Owner-reported WP_MEMORY_LIMIT=40M is below Elementor documentation\u2019s 256 MB requirement; CI does not cap the effective PHP/container memory, so behavior under a true 40 MB limit is NOT TESTED',
    'Actual host/network behavior, SMTP/inbox delivery, Elementor Library connectivity, clean Elementor Pro kit import, and the historical Elementor ZipArchive import error remain NOT TESTED',
  ],
};
let failures = 0;
let syntheticPostId = 0;

function check(name, pass, detail = '') {
  const item = { name, test_result: pass === true ? 'PASS' : 'FAIL' };
  if (detail) item.detail = String(detail).slice(0, 300);
  report.checks.push(item);
  if (pass === true) console.log(`PASS: ${name}`);
  else {
    failures += 1;
    const message = `FAIL: ${name}${detail ? ` — ${detail}` : ''}`;
    console.error(message);
    console.error(`::error title=Reference-host compatibility check::${message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
  }
}

function wp(...args) {
  try {
    return execFileSync(wpEnv, ['run', 'cli', 'wp', ...args], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 180_000,
    }).trim();
  } catch {
    throw new Error('wp-env WP-CLI command failed (stderr intentionally omitted from the public report)');
  }
}

function wpEval(code) {
  return wp('eval', code);
}

function parseJsonLine(raw) {
  const line = raw.split(/\r?\n/).reverse().find(value => value.trim().startsWith('{') || value.trim().startsWith('['));
  if (!line) throw new Error('WP-CLI did not return JSON evidence');
  return JSON.parse(line);
}

async function get(pathname) {
  return fetch(new URL(pathname, base), { redirect: 'follow' });
}

function markdown() {
  const rows = Object.entries(report.parity_dimensions || {}).map(([name, value]) =>
    `| ${name} | ${value.status} | ${value.ci_value || '—'} | ${value.limitation || '—'} |`
  ).join('\n');
  const passed = report.checks.filter(item => item.test_result === 'PASS').length;
  const failed = report.checks.filter(item => item.test_result === 'FAIL').length;
  return [
    '# Reference-host compatibility CI',
    '',
    `**Result:** ${report.test_result} — ${passed} checks passed; ${failed} failed.`,
    '',
    `**Scope:** ${report.report_type}. Evidence is bound to ${report.source_sha}. Owner-provided host facts remain OWNER-REPORTED, not independently verified.`,
    '',
    'This report is not real-host acceptance, production verification, Elementor Pro acceptance, or LiteSpeed verification.',
    '',
    '| Dimension | Parity status | Observed CI value | Limitation |',
    '|---|---|---|---|',
    rows,
    '',
    '## Explicitly untested',
    ...report.parity_gaps.map(gap => `- ${gap}`),
    '',
    'See `report.json` in this artifact for runtime observations and individual checks. Successful checks are CI observations only; they do not convert an untested parity dimension into a pass.',
    '',
  ].join('\n');
}

async function run() {
  // Configure only values that wp-env / WordPress can represent safely.
  try {
    wp('language', 'core', 'install', 'fa_IR', '--activate');
    check('fa_IR language pack is installed and active', true);
  } catch (error) {
    check('fa_IR language pack is installed and active', false, error.message);
  }
  try {
    wp('option', 'update', 'timezone_string', 'Asia/Tehran');
    check('timezone configured to Tehran-equivalent behavior', true);
  } catch (error) {
    check('timezone configured to Tehran-equivalent behavior', false, error.message);
  }
  try {
    wp('option', 'update', 'blog_public', '0');
    check('compatibility run leaves the development site non-indexed', wp('option', 'get', 'blog_public') === '0');
  } catch (error) {
    check('compatibility run leaves the development site non-indexed', false, error.message);
  }
  try {
    wp('rewrite', 'structure', referencePermalink, '--hard');
    check('reference index.php date permalink structure is configured', wp('option', 'get', 'permalink_structure') === referencePermalink);
  } catch (error) {
    check('reference index.php date permalink structure is configured', false, error.message);
  }

  const initial = parseJsonLine(wpEval(`
if ( ! isset( $GLOBALS['wp_registered_settings']['koorosh_settings'] ) ) { do_action( 'admin_init' ); }
$theme = wp_get_theme();
$active_plugins = (array) get_option( 'active_plugins', array() );
$names = array_map( function ( $path ) { return explode( '/', $path )[0]; }, $active_plugins );
echo wp_json_encode( array(
  'wordpress' => get_bloginfo( 'version' ),
  'php_version' => PHP_VERSION,
  'php_family' => PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION,
  'database_version' => $GLOBALS['wpdb']->get_var( 'SELECT VERSION()' ),
  'is_multisite' => is_multisite(),
  'locale' => get_locale(),
  'is_rtl' => is_rtl(),
  'timezone_string' => get_option( 'timezone_string' ),
  'timezone_offset' => wp_date( 'P' ),
  'permalink_structure' => get_option( 'permalink_structure' ),
  'wp_memory_limit' => defined( 'WP_MEMORY_LIMIT' ) ? WP_MEMORY_LIMIT : null,
  'wp_max_memory_limit' => defined( 'WP_MAX_MEMORY_LIMIT' ) ? WP_MAX_MEMORY_LIMIT : null,
  'php_memory_limit' => ini_get( 'memory_limit' ),
  'wp_debug' => defined( 'WP_DEBUG' ) ? WP_DEBUG : null,
  'wp_debug_display' => defined( 'WP_DEBUG_DISPLAY' ) ? WP_DEBUG_DISPLAY : null,
  'wp_debug_log' => defined( 'WP_DEBUG_LOG' ) ? WP_DEBUG_LOG : null,
  'theme' => array(
    'stylesheet' => get_stylesheet(), 'name' => $theme->get( 'Name' ),
    'version' => $theme->get( 'Version' ), 'template' => $theme->get_template(),
    'requires_php' => $theme->get( 'RequiresPHP' ), 'parent' => $theme->parent() ? $theme->parent()->get_stylesheet() : null,
  ),
  'elementor_active' => in_array( 'elementor', $names, true ),
  'elementor_version' => defined( 'ELEMENTOR_VERSION' ) ? ELEMENTOR_VERSION : null,
  'theme_settings_option_registered' => isset( $GLOBALS['wp_registered_settings']['koorosh_settings'] ),
  'theme_settings_default' => function_exists( 'koorosh_get_settings' ) ? koorosh_get_settings() : null,
  'environment_gate_enabled' => function_exists( 'cpms_lead_delivery_environment_authorized' ) ? cpms_lead_delivery_environment_authorized() : null,
  'fallback_menu_locations' => array_keys( get_registered_nav_menus() ),
) );
`));
  report.runtime_observations.runner = { platform: process.platform, github_runner_os: process.env.RUNNER_OS || null };
  report.runtime_observations.wordpress = initial.wordpress;
  report.runtime_observations.php = { version: initial.php_version, family: initial.php_family };
  report.runtime_observations.database = initial.database_version;
  report.runtime_observations.wordpress_memory = {
    wp_memory_limit: initial.wp_memory_limit,
    wp_max_memory_limit: initial.wp_max_memory_limit,
    actual_php_ini_memory_limit: initial.php_memory_limit,
  };
  report.runtime_observations.debug = {
    wp_debug: initial.wp_debug,
    wp_debug_display: initial.wp_debug_display,
    wp_debug_log: initial.wp_debug_log,
  };
  report.runtime_observations.locale = { locale: initial.locale, is_rtl: initial.is_rtl };
  report.runtime_observations.timezone = {
    configured: initial.timezone_string,
    observed_offset: initial.timezone_offset,
  };

  check('GitHub CI runtime is Linux-family (not host-distribution parity)', process.platform === 'linux', `${process.env.RUNNER_OS || 'local'} / ${process.platform}`);
  check('WordPress runtime is exactly 7.1.2', initial.wordpress === '7.1.2', initial.wordpress);
  check('PHP family is 8.1 (patch version recorded, not compared as parity)', initial.php_family === '8.1', `${initial.php_version} / family ${initial.php_family}`);
  check('wp-env database version is queryable (informational; exact reference version is not asserted)', typeof initial.database_version === 'string' && initial.database_version.length > 0, initial.database_version);
  check('WordPress runtime is single-site', initial.is_multisite === false, String(initial.is_multisite));
  check('WordPress site locale is fa_IR and RTL-aware', initial.locale === 'fa_IR' && initial.is_rtl === true, `${initial.locale}; is_rtl=${initial.is_rtl}`);
  check('Tehran timezone behavior is UTC+03:30 in the current runtime', initial.timezone_string === 'Asia/Tehran' && initial.timezone_offset === '+03:30', `${initial.timezone_string}; ${initial.timezone_offset}`);
  check('reference permalink option is exact', initial.permalink_structure === referencePermalink, initial.permalink_structure);
  check('CI models WP_MEMORY_LIMIT=40M without forcing a 4048M WP/PHP maximum', initial.wp_memory_limit === '40M' && initial.wp_max_memory_limit !== '4048M' && initial.php_memory_limit !== '4048M', `${initial.wp_memory_limit}; max=${initial.wp_max_memory_limit}; PHP ini=${initial.php_memory_limit}`);
  check('diagnostic CI has WordPress debug, display, and log enabled', initial.wp_debug === true && initial.wp_debug_display === true && initial.wp_debug_log === true, JSON.stringify(report.runtime_observations.debug));
  check('Koorosh is active, has expected metadata, and has no parent', initial.theme.stylesheet === 'koorosh' && initial.theme.name === 'کوروش' && initial.theme.template === 'koorosh' && (initial.theme.parent === null || initial.theme.parent === ''), JSON.stringify(initial.theme));
  check('standalone theme metadata declares PHP 8.1', initial.theme.requires_php === '8.1', String(initial.theme.requires_php));
  check('Elementor Free is active at exact 4.3.2', initial.elementor_active === true && initial.elementor_version === '4.3.2', `${initial.elementor_active}; ${initial.elementor_version}`);
  check('Theme Settings option is registered and has safe, non-persisting defaults', initial.theme_settings_option_registered === true && initial.theme_settings_default?.lead_site_enabled === false && initial.theme_settings_default?.version === 1 && initial.environment_gate_enabled === false);
  check('Koorosh primary/footer fallback menu locations are registered', ['primary', 'footer'].every(location => initial.fallback_menu_locations.includes(location)), JSON.stringify(initial.fallback_menu_locations));

  // Ensure a readable diagnostic target exists, then take a byte-offset baseline
  // so only selected requests below are evaluated.
  const diagnosticBaseline = parseJsonLine(wpEval(`
$path = WP_CONTENT_DIR . '/debug.log';
if ( ! file_exists( $path ) ) { file_put_contents( $path, '' ); }
echo wp_json_encode( array( 'readable' => is_readable( $path ), 'offset' => is_readable( $path ) ? filesize( $path ) : 0 ) );
`));
  report.runtime_observations.debug_log_baseline = diagnosticBaseline;
  check('WP_DEBUG_LOG diagnostic target is readable before selected requests', diagnosticBaseline.readable === true);

  // The only created content is a synthetic post with an ephemeral slug.
  const syntheticSlug = `cpms-host-parity-${randomBytes(6).toString('hex')}`;
  const date = new Date().toISOString().slice(0, 10);
  const postEvidence = parseJsonLine(wpEval(`
$id = wp_insert_post( array(
  'post_type' => 'post', 'post_status' => 'publish', 'post_title' => 'Synthetic Reference Permalink Fixture',
  'post_name' => '${syntheticSlug}', 'post_content' => 'Synthetic CI fixture; no real user data.',
  'post_date' => '${date} 12:00:00',
) );
echo wp_json_encode( array( 'id' => is_wp_error( $id ) ? 0 : (int) $id, 'permalink' => is_wp_error( $id ) ? '' : get_permalink( $id ) ) );
`));
  syntheticPostId = Number(postEvidence.id || 0);
  report.runtime_observations.synthetic_post_path = new URL(postEvidence.permalink).pathname;
  const postResponse = await get(new URL(postEvidence.permalink).pathname);
  const postHtml = await postResponse.text();
  check('dedicated /index.php/YYYY/MM/DD/post/ synthetic post route serves the expected content', postResponse.status === 200 && report.runtime_observations.synthetic_post_path.startsWith('/index.php/') && postHtml.includes('Synthetic Reference Permalink Fixture'), `${postResponse.status}; ${report.runtime_observations.synthetic_post_path}`);

  const home = await get('/');
  const homeHtml = await home.text();
  const htmlTag = homeHtml.match(/<html\b[^>]*>/i)?.[0] || '';
  check('front end emits fa-IR and dir=rtl under the installed language pack', /lang=["']fa-IR["']/i.test(htmlTag) && /dir=["']rtl["']/i.test(htmlTag), htmlTag);
  check('Koorosh fallback shell renders in the public homepage', home.status === 200 && homeHtml.includes('class="site-header"') && homeHtml.includes('class="site-footer"') && homeHtml.includes('<main id="content"'), `HTTP ${home.status}`);
  check('development frontend retains noindex response header and markup', (home.headers.get('x-robots-tag') || '').includes('noindex') && /<meta name=["']robots["'][^>]*noindex/i.test(homeHtml));
  const shellCss = await get('/wp-content/themes/koorosh/foundation.css');
  check('Koorosh foundation CSS is served', shellCss.status === 200);
  for (const asset of ['Vazirmatn-Regular.woff2', 'Vazirmatn-Bold.woff2']) {
    const response = await get(`/wp-content/themes/koorosh/fonts/${asset}`);
    check(`Koorosh font asset ${asset} is served`, response.status === 200 && /font|octet-stream/i.test(response.headers.get('content-type') || ''), `${response.status}; ${response.headers.get('content-type')}`);
  }

  // Canonical page slugs remain root-relative when only post permalinks use index.php.
  const pageEvidence = parseJsonLine(wpEval(`
$slugs = ${JSON.stringify(pageSlugs).replace(/"/g, "'")};
$out = array();
foreach ( $slugs as $slug ) {
  $page = get_page_by_path( $slug, OBJECT, 'page' );
  $document = $page ? \\Elementor\\Plugin::$instance->documents->get( $page->ID ) : null;
  $out[ $slug ] = array( 'exists' => (bool) $page, 'published' => $page && 'publish' === $page->post_status, 'elementor_authored' => $document && $document->is_built_with_elementor() );
}
echo wp_json_encode( $out );
`));
  report.runtime_observations.reconstructed_pages = pageEvidence;
  for (const slug of pageSlugs) {
    const response = await get(`/${slug === 'cpms-home' ? '' : `${slug}/`}`);
    const html = await response.text();
    const expected = pageEvidence[slug];
    check(`canonical page /${slug === 'cpms-home' ? '' : `${slug}/`} remains published, Elementor-authored, and HTTP 200`, expected?.exists === true && expected?.published === true && expected?.elementor_authored === true && response.status === 200 && /elementor/i.test(html), `HTTP ${response.status}; ${JSON.stringify(expected)}`);
  }
  const demo = await get('/demo/');
  check('canonical Demo sales slug stays /demo/ (no index.php prefix)', demo.status === 200 && new URL(demo.url).pathname === '/demo/');

  // ZIP_RUNTIME_SMOKE: synthetic archive only; this is not an Elementor kit import.
  const extensionEvidence = parseJsonLine(wpEval(`
$zipLoaded = extension_loaded( 'zip' ) && class_exists( 'ZipArchive' );
$zipVersion = phpversion( 'zip' ) ?: null;
$zipSmoke = false;
$gdLoaded = extension_loaded( 'gd' ) && function_exists( 'imagecreatetruecolor' ) && function_exists( 'imagepng' );
$gdInfo = $gdLoaded ? gd_info() : array();
$gdVersion = isset( $gdInfo['GD Version'] ) ? $gdInfo['GD Version'] : ( phpversion( 'gd' ) ?: null );
$gdSmoke = false;
$dir = trailingslashit( get_temp_dir() ) . 'cpms-compat-' . wp_generate_password( 10, false, false );
wp_mkdir_p( $dir );
if ( $zipLoaded ) {
  $archive = $dir . '/synthetic.zip';
  $zip = new ZipArchive();
  $created = true === $zip->open( $archive, ZipArchive::CREATE | ZipArchive::OVERWRITE ) && $zip->addFromString( 'fixture.txt', 'ZIP RUNTIME SMOKE synthetic fixture' ) && $zip->close();
  $out = $dir . '/extracted';
  wp_mkdir_p( $out );
  $read = false;
  if ( $created ) {
    $zip = new ZipArchive();
    $opened = true === $zip->open( $archive );
    $extracted = $opened && $zip->extractTo( $out );
    if ( $opened ) { $zip->close(); }
    $read = $extracted && 'ZIP RUNTIME SMOKE synthetic fixture' === file_get_contents( $out . '/fixture.txt' );
  }
  $zipSmoke = $read;
  if ( file_exists( $out . '/fixture.txt' ) ) { unlink( $out . '/fixture.txt' ); }
  if ( is_dir( $out ) ) { rmdir( $out ); }
  if ( file_exists( $archive ) ) { unlink( $archive ); }
}
if ( $gdLoaded ) {
  $image = imagecreatetruecolor( 3, 2 );
  $path = $dir . '/synthetic.png';
  $saved = $image && imagepng( $image, $path );
  if ( $image ) { imagedestroy( $image ); }
  $dimensions = $saved ? getimagesize( $path ) : false;
  $gdSmoke = $saved && is_array( $dimensions ) && 3 === $dimensions[0] && 2 === $dimensions[1];
  if ( file_exists( $path ) ) { unlink( $path ); }
}
if ( is_dir( $dir ) ) { rmdir( $dir ); }
echo wp_json_encode( array( 'zip_loaded' => $zipLoaded, 'zip_version' => $zipVersion, 'zip_runtime_smoke' => $zipSmoke, 'gd_loaded' => $gdLoaded, 'gd_version' => $gdVersion, 'gd_runtime_smoke' => $gdSmoke ) );
`));
  report.runtime_observations.php_extensions = extensionEvidence;
  check('ZIP extension and ZipArchive are loaded; ZIP RUNTIME SMOKE creates, opens, and extracts a synthetic archive', extensionEvidence.zip_loaded === true && extensionEvidence.zip_runtime_smoke === true, JSON.stringify(extensionEvidence));
  check('GD extension creates a synthetic PNG and reads its dimensions', extensionEvidence.gd_loaded === true && extensionEvidence.gd_runtime_smoke === true, JSON.stringify(extensionEvidence));

  // Keep debug observability narrowly scoped to errors attributed to Koorosh in
  // the selected frontend requests; do not claim there are no runtime issues.
  const diagnosticPhpErrors = /\b(?:PHP )?(?:Warning|Notice|Deprecated|Fatal error|Parse error)\s*:/i;
  const rendered = [homeHtml, postHtml, await demo.text()];
  check('selected frontend responses expose no visible PHP warning/notice/deprecation/fatal markers', rendered.every(html => !diagnosticPhpErrors.test(html)));
  const logDelta = parseJsonLine(wpEval(`
$path = WP_CONTENT_DIR . '/debug.log';
$offset = ${Number(diagnosticBaseline.offset || 0)};
$delta = is_readable( $path ) ? substr( (string) file_get_contents( $path ), $offset ) : '';
$lines = preg_split( '/\\r?\\n/', $delta );
$matched = array_values( array_filter( $lines, function ( $line ) { return false !== stripos( $line, '/themes/koorosh/' ) && preg_match( '/(?:Warning|Notice|Deprecated|Fatal error|Parse error)\\s*:/i', $line ); } ) );
echo wp_json_encode( array( 'readable' => is_readable( $path ), 'koorosh_php_diagnostic_count' => count( $matched ) ) );
`));
  report.runtime_observations.debug_log_scan = logDelta.readable === true
    ? { status: 'SIMULATED', koorosh_php_diagnostic_count: logDelta.koorosh_php_diagnostic_count }
    : { status: 'NOT_TESTED', reason: 'debug.log was not readable in this runtime' };
  if (logDelta.readable === true) {
    check('WP_DEBUG_LOG exposes no Koorosh-attributed PHP warning/notice/deprecation/fatal in this selected flow', logDelta.koorosh_php_diagnostic_count === 0, JSON.stringify(logDelta));
  } else {
    check('WP_DEBUG_LOG unreadable: diagnostic gap is reported; visible response-marker checks remain active', true);
  }

  // Verify existing native editor save/reload and Theme Settings browser evidence
  // from the steps that precede this phase in the same workflow job.
  const settingsResultPath = resolve(root, 'tests/browser/artifacts/theme-settings/results.json');
  const themeSettings = JSON.parse(readFileSync(settingsResultPath, 'utf8'));
  const requiredEvidence = [
    'runtime: defaults: site-level lead switch is OFF',
    'runtime: defaults: recipient falls back to the authorized default',
    'runtime: schema: no secret-like field exists (no passwords, API keys, tokens, SMTP/hosting credentials)',
    'runtime: unknown keys (including secret-looking ones) are discarded, never stored',
    'runtime: dual gate: site switch ON alone never authorizes delivery (effective == environment gate)',
    'Persian admin locale renders RTL document semantics (fa-IR, dir=rtl)',
    'Persian labels render for all six planned sections, in order',
  ];
  const settingsChecks = themeSettings.checks || [];
  const savedEvidence = requiredEvidence.every(name => settingsChecks.some(item => item.name === name && item.pass === true));
  report.runtime_observations.theme_settings_browser_result = themeSettings.result || 'UNKNOWN';
  check('existing Theme Settings runtime/browser evidence covers safe defaults, environment gate, no-secret model, and Persian RTL admin', savedEvidence && themeSettings.failed === 0 && themeSettings.result === 'PASS', themeSettings.result || 'missing result');

  // Theme metadata/assets/fallback/admin are probed above and by existing smoke;
  // exact Pro APIs are static-compatibility only, never invoked as acceptance.
  report.parity_dimensions = {
    operating_system: { status: 'SIMULATED', reference_value: 'Linux', ci_value: `${process.env.RUNNER_OS || process.platform} (${process.platform})`, limitation: 'Linux family only; not the owner host distribution, kernel, filesystem, or service stack.' },
    wordpress: { status: 'EXACT', reference_value: '7.1.2', ci_value: initial.wordpress, limitation: 'Exact CI core version only; owner host remains unverified.' },
    elementor_free: { status: 'EXACT', reference_value: '4.3.2', ci_value: initial.elementor_version, limitation: 'Free plugin only; Pro is not implied.' },
    php: { status: 'FAMILY_ONLY', reference_value: '8.1.34', ci_value: `${initial.php_family} (runtime ${initial.php_version})`, limitation: 'No exact 8.1.34 patch image is provided by this wp-env / official WordPress Docker tag path.' },
    database: { status: 'SIMULATED', exact_reference_version_status: 'NOT_TESTED', reference_value: 'MariaDB 11.4.13-MariaDB-cll-lve-log', ci_value: initial.database_version, limitation: 'NO EXACT DB PARITY: wp-env 11.16.0 defaults to floating mariadb:lts and exposes no database image/version field.' },
    web_server: { status: 'NOT_TESTED', reference_value: 'LiteSpeed', ci_value: 'WordPress Docker development image (Apache)', limitation: 'No LiteSpeed-compatible test is run; checks are web-server-neutral where possible.' },
    elementor_pro: { status: 'NOT_TESTED', reference_value: '4.3.0', ci_value: 'not installed in public CI', limitation: 'No Pro ZIP/license/private package; Pro runtime and acceptance stay a host/private gate.' },
    single_site: { status: 'EXACT', reference_value: 'single-site', ci_value: initial.is_multisite ? 'multisite' : 'single-site', limitation: 'wp-env explicitly sets multisite=false.' },
    locale_rtl: { status: 'EXACT', reference_value: 'fa_IR', ci_value: `${initial.locale}; RTL=${initial.is_rtl}`, limitation: 'Language pack availability is exercised in GitHub CI, not on the owner host.' },
    timezone: { status: 'SIMULATED', reference_value: 'UTC+03:30 / Tehran-equivalent as configured', ci_value: `${initial.timezone_string} (${initial.timezone_offset})`, limitation: 'CI sets Asia/Tehran and observes +03:30; owner host timezone configuration is not agent-verified.' },
    permalink: { status: 'SIMULATED', reference_value: referencePermalink, ci_value: `${initial.permalink_structure}; synthetic post route requested`, limitation: 'WordPress option exact; routing tested under wp-env/Apache, not LiteSpeed; canonical sales-page slugs remain root-relative.' },
    wordpress_memory: { status: 'SIMULATED', reference_value: 'WP_MEMORY_LIMIT 40M; reported max 4048M', ci_value: `WP_MEMORY_LIMIT=${initial.wp_memory_limit}; WP_MAX_MEMORY_LIMIT=${initial.wp_max_memory_limit}; PHP ini=${initial.php_memory_limit}`, application_requirement: 'Elementor documents a 256 MB WordPress memory limit (512 MB recommended); the reported 40M is below that requirement.', limitation: 'CI applies only WP_MEMORY_LIMIT=40M; does not cap effective PHP memory or force 4048M. Compatibility under an actual 40 MB process limit is NOT_TESTED.' },
    php_zip: { status: 'SIMULATED', reference_value: 'ZIP available; historical import error reported', ci_value: `ZipArchive=${extensionEvidence.zip_loaded}; PHP zip=${extensionEvidence.zip_version}`, limitation: 'ZIP RUNTIME SMOKE uses a synthetic archive only; it is not an Elementor kit import and does not disprove the historical error.' },
    php_gd: { status: 'SIMULATED', reference_value: 'GD available', ci_value: `GD=${extensionEvidence.gd_loaded}; ${extensionEvidence.gd_version}`, limitation: 'Synthetic PNG behavior only; no host image-processing configuration is compared.' },
    koorosh: { status: 'SIMULATED', reference_value: 'Standalone Koorosh intended theme', ci_value: `${initial.theme.name} ${initial.theme.version}; active; parent=${initial.theme.parent || 'none'}`, limitation: 'Koorosh installation, metadata, local fonts, fallback shell and normal frontend execution are CI evidence only.' },
    theme_settings: { status: 'SIMULATED', reference_value: 'Safe settings model and Persian RTL admin', ci_value: themeSettings.result, limitation: 'Synthetic CI state only; no host database/settings are read.' },
    elementor_pages: { status: 'SIMULATED', reference_value: 'Owner-host-authored content/runtime', ci_value: `${Object.values(pageEvidence).filter(page => page.elementor_authored).length}/${pageSlugs.length} CI pages built with Elementor Free`, limitation: 'Reconstructed native Free pages and editor save/reload suites; not the owner host DB, Pro pages, or kit import.' },
    elementor_library: { status: 'NOT_TESTED', reference_value: 'Connected (owner-reported)', ci_value: 'No authenticated Library connection in public CI', limitation: 'No credential or account connection is attempted.' },
    debug_mode: { status: 'SIMULATED', reference_value: 'ACTIVE (owner-reported test host)', ci_value: 'WP_DEBUG, WP_DEBUG_DISPLAY and WP_DEBUG_LOG enabled', limitation: 'Only selected CI flows are checked for visible/theme-attributed diagnostics; not proof of no runtime issues.' },
    host_network_smtp: { status: 'NOT_TESTED', reference_value: 'Owner host/network and SMTP', ci_value: 'No host requests; synthetic intercepted lead tests only', limitation: 'No real email, inbox delivery, DNS, firewall, LiteSpeed, host cache, or network parity.' },
    clean_elementor_pro_kit_import: { status: 'NOT_TESTED', reference_value: 'Clean Pro kit import; historical ZipArchive failure', ci_value: 'No kit fixture imported', limitation: 'Requires authorized private Pro environment; synthetic ZIP smoke is not import proof.' },
  };

  // Report exact runtime-observed gaps and host-parity limitations.
  const reportPath = resolve(outputDir, 'report.json');
  report.test_result = failures === 0 ? 'PASS' : 'FAIL';
  report.passed_checks = report.checks.filter(item => item.test_result === 'PASS').length;
  report.failed_checks = failures;
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  writeFileSync(resolve(outputDir, 'README.md'), markdown());
  console.log(`== REFERENCE-HOST COMPATIBILITY CI: ${report.passed_checks} checks passed, ${failures} failed ==`);
  console.log(`Report: ${reportPath}`);

  // Remove only the synthetic post created above; the disposable CI site remains
  // non-indexed and is discarded with the job.
  if (syntheticPostId > 0) {
    wp('post', 'delete', String(syntheticPostId), '--force');
    syntheticPostId = 0;
  }
}

run().catch(error => {
  failures += 1;
  if (syntheticPostId > 0) {
    try { wp('post', 'delete', String(syntheticPostId), '--force'); } catch { /* ephemeral environment is discarded */ }
    syntheticPostId = 0;
  }
  report.test_result = 'FAIL';
  report.failed_checks = failures;
  report.error = String(error.message || 'Compatibility phase failed').slice(0, 300);
  try {
    writeFileSync(resolve(outputDir, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    writeFileSync(resolve(outputDir, 'README.md'), markdown());
  } catch {
    // Preserve the original CI failure if artifact writing is unavailable.
  }
  console.error(`::error title=Reference-host compatibility phase::${report.error}`);
  process.exitCode = 1;
});
