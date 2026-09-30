<?php
/**
 * CI TEST FIXTURE — INTERCEPTION ONLY. NEVER INSTALL ON A REAL HOST.
 *
 * Copied into the mapped wp-content/mu-plugins directory of the ephemeral
 * wp-env container by tests/browser/demo-delivery.mjs so automated tests can
 * observe every wp_mail() call WITHOUT any real network delivery.
 *
 * WordPress (the pinned CI core 7.1.2) applies the `pre_wp_mail` filter as
 * `apply_filters( 'pre_wp_mail', null, $atts )`, where $atts is the array of
 * wp_mail() arguments (to, subject, message, headers, attachments, embeds —
 * see wp-includes/pluggable.php). Returning a non-null value short-circuits
 * wp_mail(), so no mail transport is ever reached in CI.
 *
 * Behavior:
 *  - Each call is appended as one JSON line to
 *    wp-content/cpms-ci-mail-log.jsonl (synthetic CI data only; the test
 *    deletes the file when it finishes).
 *  - The call reports ACCEPTANCE unless the marker file
 *    wp-content/mu-plugins/.cpms-ci-force-fail exists, in which case it
 *    reports FAILURE — proving the form surfaces HANDOFF_FAILED instead of
 *    faking success.
 *
 * This fixture deliberately defines NO delivery activation. Activation is
 * simulated only by the separate cpms-ci-enable-delivery.php fixture, which
 * plays the role the environment owner's wp-config.php plays in production.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter(
	'pre_wp_mail',
	function ( $preempt, $atts = array() ) {
		$atts  = is_array( $atts ) ? $atts : array();
		$entry = array(
			'to'          => isset( $atts['to'] ) ? $atts['to'] : null,
			'subject'     => isset( $atts['subject'] ) ? $atts['subject'] : null,
			'message'     => isset( $atts['message'] ) ? $atts['message'] : null,
			'headers'     => isset( $atts['headers'] ) ? $atts['headers'] : null,
			'attachments' => isset( $atts['attachments'] ) ? $atts['attachments'] : null,
			'time'        => microtime( true ),
		);

		$log = WP_CONTENT_DIR . '/cpms-ci-mail-log.jsonl';
		file_put_contents( $log, wp_json_encode( $entry ) . "\n", FILE_APPEND | LOCK_EX );

		$force_fail = file_exists( WP_CONTENT_DIR . '/mu-plugins/.cpms-ci-force-fail' );

		return $force_fail ? false : true;
	},
	10,
	2
);
