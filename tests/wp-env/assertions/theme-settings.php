<?php
/**
 * Runtime assertions for Koorosh Theme Settings v1 (تنظیمات کوروش).
 *
 * NOT a plugin and NOT loaded by WordPress: tests/browser/theme-settings.mjs
 * reads this file and runs it with `wp eval` inside the ephemeral wp-env
 * container (the opening tag is stripped by the runner). It prints exactly one
 * JSON line: { "checks": [ { "name", "pass", "detail" } ... ] }.
 *
 * Everything is synthetic (.test/.example domains); the option and the
 * temporary subscriber user are removed at the end.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$koorosh_results = array();
$check           = function ( $name, $condition, $detail = '' ) use ( &$koorosh_results ) {
	$koorosh_results[] = array(
		'name'   => $name,
		'pass'   => true === $condition,
		'detail' => true === $condition ? '' : ( is_scalar( $detail ) ? (string) $detail : wp_json_encode( $detail ) ),
	);
};

$opt      = KOOROSH_SETTINGS_OPTION;
$admin_id = (int) get_users( array( 'role' => 'administrator', 'number' => 1, 'fields' => 'ID' ) )[0];
$env_on   = defined( 'CPMS_LEAD_DELIVERY_ENABLED' ) && true === CPMS_LEAD_DELIVERY_ENABLED;
$default_recipient = 'biatoweb@gmail.com';

/* ---- 1. Safe defaults ---------------------------------------------------- */
delete_option( $opt );
$d = koorosh_get_settings();
$check( 'defaults: site-level lead switch is OFF', false === $d['lead_site_enabled'], $d );
$check( 'defaults: recipient falls back to the authorized default', $default_recipient === $d['lead_recipient'], $d['lead_recipient'] );
$check( 'defaults: effective recipient equals the authorized default', $default_recipient === cpms_lead_delivery_recipient() );
$check( 'defaults: contact and social values are empty', '' === $d['contact_email'] && '' === $d['contact_phone'] && '' === $d['contact_address'] && '' === $d['social_instagram'] && '' === $d['social_linkedin'] && '' === $d['social_telegram'], $d );
$check( 'defaults: fallback header switches preserve the current shell', true === $d['header_show_site_title'] && true === $d['header_show_cta'] && '' === $d['header_cta_label'], $d );
$check( 'defaults: settings are versioned', 1 === $d['version'] );
$check( 'defaults: reading settings creates no database row', false === get_option( $opt, false ) );
$check( 'defaults: effective lead delivery is OFF', false === cpms_lead_delivery_enabled() );

/* ---- 2. Schema: bounded, no secrets -------------------------------------- */
$schema = koorosh_settings_schema();
$keys   = array_keys( $schema );
sort( $keys );
$expected_keys = array(
	'contact_address', 'contact_email', 'contact_phone', 'header_cta_label', 'header_show_cta', 'header_show_site_title',
	'lead_recipient', 'lead_site_enabled', 'social_instagram', 'social_linkedin', 'social_telegram',
);
sort( $expected_keys );
$check( 'schema: exactly the documented bounded key set', $keys === $expected_keys, $keys );
$secretish = array_filter( $keys, function ( $k ) {
	return (bool) preg_match( '/pass|secret|token|api|smtp|credential|oauth|private|licen[cs]e|auth/i', $k );
} );
$check( 'schema: no secret-like field exists (no passwords, API keys, tokens, SMTP/hosting credentials)', 0 === count( $secretish ), array_values( $secretish ) );
$types = array_unique( wp_list_pluck( $schema, 'type' ) );
sort( $types );
$check( 'schema: only bounded scalar field types (no html/css/js/code type)', array( 'bool', 'email', 'phone', 'recipient', 'social_url', 'text' ) === $types, $types );
$check( 'defaults array contains only schema keys plus version', array_diff( array_keys( koorosh_settings_defaults() ), array_merge( $keys, array( 'version' ) ) ) === array() );

/* ---- 3. Sanitization matrix ---------------------------------------------- */
$rejected = function ( $key, $raw ) {
	list( $value, $error ) = koorosh_sanitize_field( $key, $raw );
	return null === $value && is_string( $error ) && '' !== $error;
};
$accepted = function ( $key, $raw, $expected ) {
	list( $value, $error ) = koorosh_sanitize_field( $key, $raw );
	return null === $error && $expected === $value;
};
$long = function ( $n ) {
	return str_repeat( 'ا', $n );
};

$check( 'email: valid address accepted', $accepted( 'contact_email', 'info@example.test', 'info@example.test' ) );
$check( 'email: empty optional email accepted as empty', $accepted( 'contact_email', '', '' ) );
foreach (
	array(
		'plain text'           => 'not-an-email',
		'CRLF header injection' => "a@example.test\r\nBcc: b@example.test",
		'two addresses'        => 'a@example.test, b@example.test',
		'angle brackets'       => '<a@example.test>',
		'inner whitespace'     => 'a b@example.test',
		'quoted display name'  => '"A" <a@example.test>',
		'over 100 chars'       => str_repeat( 'a', 95 ) . '@example.test',
	) as $label => $raw
) {
	$check( "email: rejected — $label", $rejected( 'contact_email', $raw ) && $rejected( 'lead_recipient', $raw ), $raw );
}
$check( 'email: non-scalar input rejected', $rejected( 'contact_email', array( 'a@example.test' ) ) );
$check( 'recipient: empty input restores the authorized default', $accepted( 'lead_recipient', '', $default_recipient ) );

$check( 'phone: Latin digits with separators accepted', $accepted( 'contact_phone', '+98 21 1234-5678', '+98 21 1234-5678' ) );
$check( 'phone: Persian digits accepted', $accepted( 'contact_phone', '۰۲۱-۱۲۳۴۵۶۷۸', '۰۲۱-۱۲۳۴۵۶۷۸' ) );
$check( 'phone: letters rejected', $rejected( 'contact_phone', 'call me' ) );
$check( 'phone: markup rejected', $rejected( 'contact_phone', '<script>1</script>' ) );
$check( 'phone: over 30 characters rejected', $rejected( 'contact_phone', str_repeat( '1', 31 ) ) );

list( $address_value, $address_error ) = koorosh_sanitize_field( 'contact_address', '<b>تهران</b> <script>alert(1)</script>خیابان نمونه' );
$check( 'text: markup and scripts are stripped from the address', null === $address_error && false === strpos( (string) $address_value, '<' ) && false === strpos( (string) $address_value, 'alert' ), $address_value );
$check( 'text: exactly 200 characters accepted for the address', null === koorosh_sanitize_field( 'contact_address', $long( 200 ) )[1] );
$check( 'text: 201 characters rejected for the address', $rejected( 'contact_address', $long( 201 ) ) );
$check( 'text: CTA label bounded to 40 characters', null === koorosh_sanitize_field( 'header_cta_label', $long( 40 ) )[1] && $rejected( 'header_cta_label', $long( 41 ) ) );
$check( 'text: non-scalar input rejected', $rejected( 'contact_address', array( 'x' ) ) );

$check( 'url: https Instagram profile accepted', $accepted( 'social_instagram', 'https://instagram.com/cpms_test', 'https://instagram.com/cpms_test' ) );
$check( 'url: http is upgraded to https and sub-domains of the platform are accepted', $accepted( 'social_instagram', 'http://www.instagram.com/cpms_test', 'https://www.instagram.com/cpms_test' ) );
$check( 'url: Telegram t.me accepted', $accepted( 'social_telegram', 'https://t.me/cpms_test', 'https://t.me/cpms_test' ) );
$check( 'url: LinkedIn accepted', $accepted( 'social_linkedin', 'https://www.linkedin.com/company/cpms-test', 'https://www.linkedin.com/company/cpms-test' ) );
foreach (
	array(
		'javascript: scheme'        => array( 'social_instagram', 'javascript:alert(1)' ),
		'data: scheme'              => array( 'social_instagram', 'data:text/html,x' ),
		'ftp scheme'                => array( 'social_instagram', 'ftp://instagram.com/x' ),
		'foreign host'              => array( 'social_instagram', 'https://evil.test/instagram.com' ),
		'look-alike prefix host'    => array( 'social_instagram', 'https://notinstagram.com/x' ),
		'look-alike suffix host'    => array( 'social_instagram', 'https://instagram.com.evil.test/x' ),
		'embedded credentials'      => array( 'social_instagram', 'https://user:pw@instagram.com/x' ),
		'wrong platform (telegram)' => array( 'social_linkedin', 'https://t.me/x' ),
		'over 200 chars'            => array( 'social_instagram', 'https://instagram.com/' . str_repeat( 'a', 200 ) ),
	) as $label => $pair
) {
	$check( "url: rejected — $label", $rejected( $pair[0], $pair[1] ), $pair[1] );
}
$check( 'url: empty social URL accepted as empty', $accepted( 'social_instagram', '', '' ) );

$check( 'bool: only explicit on values enable a switch', true === koorosh_sanitize_field( 'lead_site_enabled', '1' )[0] && true === koorosh_sanitize_field( 'lead_site_enabled', 'on' )[0] && false === koorosh_sanitize_field( 'lead_site_enabled', 'yes' )[0] && false === koorosh_sanitize_field( 'lead_site_enabled', '0' )[0] && false === koorosh_sanitize_field( 'lead_site_enabled', '' )[0] );

$n = koorosh_normalize_settings( array( 'lead_recipient' => 'bad', 'lead_site_enabled' => 'true', 'social_instagram' => 'javascript:x', 'contact_email' => 'bad' ) );
$check( 'read path re-validates stored data: tampered values fall back to safe defaults', $default_recipient === $n['lead_recipient'] && false === $n['lead_site_enabled'] && '' === $n['social_instagram'] && '' === $n['contact_email'], $n );

/* ---- 4. Capability enforcement on writes --------------------------------- */
wp_set_current_user( $admin_id );
update_option( $opt, array( 'lead_recipient' => 'good@example.test' ) );
$check( 'administrator (manage_options) can change the recipient', 'good@example.test' === koorosh_get_setting( 'lead_recipient' ) );

require_once ABSPATH . 'wp-admin/includes/user.php';
$sub_id = wp_insert_user(
	array(
		'user_login' => 'koorosh_sub_test_' . wp_rand( 1000, 9999 ),
		'user_pass'  => wp_generate_password( 24 ),
		'user_email' => 'koorosh-sub-' . wp_rand( 1000, 9999 ) . '@example.test',
		'role'       => 'subscriber',
	)
);
$check( 'temporary subscriber created', ! is_wp_error( $sub_id ) && $sub_id > 0 );
if ( ! is_wp_error( $sub_id ) ) {
	wp_set_current_user( $sub_id );
	$check( 'subscriber does not hold manage_options', false === current_user_can( 'manage_options' ) );
	update_option( $opt, array( 'lead_recipient' => 'attacker@example.test', 'lead_site_enabled' => true ) );
	$check( 'subscriber cannot change the lead recipient (sanitizer refuses the write)', 'good@example.test' === koorosh_get_setting( 'lead_recipient' ), koorosh_get_setting( 'lead_recipient' ) );
	$check( 'subscriber cannot turn on the site-level lead switch', false === koorosh_get_setting( 'lead_site_enabled' ) );
	wp_set_current_user( 0 );
	update_option( $opt, array( 'lead_recipient' => 'attacker@example.test', 'lead_site_enabled' => true ) );
	$check( 'anonymous context cannot change the recipient or the switch', 'good@example.test' === koorosh_get_setting( 'lead_recipient' ) && false === koorosh_get_setting( 'lead_site_enabled' ) );
	wp_delete_user( $sub_id );
}
wp_set_current_user( $admin_id );
$check( 'Settings API capability filter requires manage_options', 'manage_options' === apply_filters( 'option_page_capability_' . KOOROSH_SETTINGS_GROUP, 'manage_options' ) );
global $wp_registered_settings;
$check( 'the option is registered with the Settings API sanitize callback', isset( $wp_registered_settings[ $opt ] ) && 'koorosh_sanitize_settings' === $wp_registered_settings[ $opt ]['sanitize_callback'] );

/* ---- 5. Tab-scoped saves, unknown keys, invalid input -------------------- */
update_option( $opt, array( 'lead_site_enabled' => true, 'lead_recipient' => 'good@example.test', 'header_show_cta' => false ) );
update_option( $opt, array( '_tab' => 'contact', 'contact_email' => 'info@example.test', 'contact_phone' => '021 1234', 'contact_address' => 'نمونه' ) );
$s = koorosh_get_settings();
$check( 'saving the contact tab stores its fields', 'info@example.test' === $s['contact_email'] && '021 1234' === $s['contact_phone'] && 'نمونه' === $s['contact_address'], $s );
$check( 'saving the contact tab does not wipe other tabs', true === $s['lead_site_enabled'] && 'good@example.test' === $s['lead_recipient'] && false === $s['header_show_cta'], $s );
update_option( $opt, array( '_tab' => 'shell', 'header_cta_label' => '' ) );
$s = koorosh_get_settings();
$check( 'a tab-scoped save turns absent checkboxes OFF for that tab only', false === $s['header_show_site_title'] && false === $s['header_show_cta'] && true === $s['lead_site_enabled'], $s );
update_option( $opt, array( 'contact_email' => 'bad-address' ) );
$check( 'invalid email keeps the previous value', 'info@example.test' === koorosh_get_setting( 'contact_email' ) );
update_option( $opt, array( 'smtp_password' => 'x', 'api_key' => 'y', 'evil' => '<script>1</script>' ) );
$stored = get_option( $opt );
$check( 'unknown keys (including secret-looking ones) are discarded, never stored', is_array( $stored ) && array() === array_diff( array_keys( $stored ), array_keys( koorosh_settings_defaults() ) ), $stored );
$check( 'stored option stays one compact array', strlen( maybe_serialize( $stored ) ) < 2048 );

/* ---- 6. Recipient never comes from the request --------------------------- */
$saved_request = array( $_GET, $_POST, $_REQUEST );
$_GET = $_POST = $_REQUEST = array(
	'lead_recipient'    => 'attacker@example.test',
	'cpms_recipient'    => 'attacker@example.test',
	'to'                => 'attacker@example.test',
	'koorosh_settings'  => array( 'lead_recipient' => 'attacker@example.test', 'lead_site_enabled' => '1' ),
);
$check( 'effective recipient ignores GET/POST/REQUEST parameters', 'good@example.test' === cpms_lead_delivery_recipient(), cpms_lead_delivery_recipient() );
$check( 'settings reader ignores GET/POST/REQUEST parameters', 'good@example.test' === koorosh_get_setting( 'lead_recipient' ) );
list( $_GET, $_POST, $_REQUEST ) = $saved_request;

/* ---- 7. Dual-gate logic --------------------------------------------------- */
$labels = array(
	'environment_off' => 'محیط اجازه ارسال نداده است',
	'site_off'        => 'محیط اجازه داده، اما ارسال سایت خاموش است',
	'both_on'         => 'ارسال سایت و محیط هر دو فعال‌اند',
);
update_option( $opt, array( 'lead_site_enabled' => false ) );
$check( 'dual gate: site switch OFF -> effective delivery OFF regardless of the environment', false === cpms_lead_delivery_enabled() );
$check( 'dual gate: status label for site switch OFF', koorosh_lead_delivery_state_label() === ( $env_on ? $labels['site_off'] : $labels['environment_off'] ), koorosh_lead_delivery_state_label() );
update_option( $opt, array( 'lead_site_enabled' => true ) );
$check( 'dual gate: site switch ON alone never authorizes delivery (effective == environment gate)', cpms_lead_delivery_enabled() === $env_on, array( $env_on, cpms_lead_delivery_enabled() ) );
$check( 'dual gate: status label for site switch ON', koorosh_lead_delivery_state_label() === ( $env_on ? $labels['both_on'] : $labels['environment_off'] ), koorosh_lead_delivery_state_label() );
$check( 'dual gate: the theme never defines the environment constant', $env_on === ( defined( 'CPMS_LEAD_DELIVERY_ENABLED' ) && true === CPMS_LEAD_DELIVERY_ENABLED ) );

/* ---- 8. Read-only status: unknowns are never green ----------------------- */
$rows = array();
foreach ( koorosh_get_site_status_rows() as $row ) {
	$rows[ $row['key'] ] = $row;
}
$state_labels = koorosh_status_state_labels();
$check( 'status vocabulary is the evidence-honest set (no pass/ok/ready state)', array( 'active', 'inactive', 'yes', 'no', 'review', 'unverified' ) === array_keys( $state_labels ) && array( 'فعال', 'غیرفعال', 'بله', 'خیر', 'نیازمند بررسی', 'تأیید نشده' ) === array_values( $state_labels ) );
$bad_state = array_filter( $rows, function ( $r ) use ( $state_labels ) {
	return ! isset( $state_labels[ $r['state'] ] );
} );
$check( 'status: every row uses a known state', 0 === count( $bad_state ) );
foreach ( array( 'product_media', 'elementor_pro_acceptance', 'search_console' ) as $unknown ) {
	$check( "status: $unknown is unverified (no evidence, never a pass)", isset( $rows[ $unknown ] ) && 'unverified' === $rows[ $unknown ]['state'] );
}
$blog_public = get_option( 'blog_public' );
update_option( 'blog_public', '0' );
$r = koorosh_get_site_status_rows();
$by = array();
foreach ( $r as $row ) {
	$by[ $row['key'] ] = $row;
}
$check( 'status: blog_public=0 reads as indexing inactive', 'inactive' === $by['indexing']['state'] );
update_option( 'blog_public', '1' );
$r  = koorosh_get_site_status_rows();
$by = array();
foreach ( $r as $row ) {
	$by[ $row['key'] ] = $row;
}
$check( 'status: blog_public=1 is "needs review", never an active/green state', 'review' === $by['indexing']['state'] );
update_option( 'blog_public', $blog_public );
$check( 'status: the panel never changes blog_public (indexing gate untouched)', (string) $blog_public === (string) get_option( 'blog_public' ) );
foreach ( array( 'privacy', 'terms' ) as $slug ) {
	$page = get_page_by_path( $slug, OBJECT, 'page' );
	$has  = $page && 'publish' === $page->post_status;
	$check( "status: $slug page row reflects real page existence", $rows[ 'page_' . $slug ]['state'] === ( $has ? 'yes' : 'no' ) );
}
$check( 'status: environment and site rows reflect the real gates', $rows['lead_environment']['state'] === ( $env_on ? 'active' : 'inactive' ) && 'active' === $rows['lead_site_switch']['state'] );
$check( 'status: no row claims launch readiness', 0 === count( array_filter( $rows, function ( $r ) {
	return (bool) preg_match( '/آماده انتشار|launch[- ]ready/iu', $r['label'] . ' ' . $r['note'] );
} ) ) );

/* ---- cleanup -------------------------------------------------------------- */
delete_option( $opt );
wp_set_current_user( 0 );

echo wp_json_encode( array( 'checks' => $koorosh_results ) );
