<?php
/**
 * CI TEST FIXTURE — SIMULATED ENVIRONMENT ACTIVATION. NEVER INSTALL ON A
 * REAL HOST.
 *
 * Copied into the mapped wp-content/mu-plugins directory of the ephemeral
 * wp-env container by tests/browser/demo-delivery.mjs to simulate, for that
 * disposable environment only, the environment-owned activation control for
 * lead delivery. On the authorized live host the environment owner sets the
 * SAME constant in wp-config.php; this fixture carries no recipient address,
 * no mail transport, and no credentials of any kind. This fixture simulates
 * ONLY the environment gate; effective delivery additionally requires the
 * site-level switch in تنظیمات کوروش (default OFF), which tests set separately.
 *
 * Must-use plugins load before the theme, so the constant is defined before
 * themes/koorosh/demo-form.php reads it, exactly as a wp-config constant
 * would be.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'CPMS_LEAD_DELIVERY_ENABLED' ) ) {
	define( 'CPMS_LEAD_DELIVERY_ENABLED', true );
}
