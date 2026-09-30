<?php
/**
 * Public contact details — theme-owned dynamic renderer for «تماس با ما» (/contact/).
 *
 * WHY THIS FILE EXISTS (narrowly scoped by design):
 *  The Contact page layout stays Elementor-authored/editable, but the actual
 *  contact VALUES are global operational settings (Koorosh Theme Settings →
 *  اطلاعات تماس) that administrators must be able to change without touching
 *  page content. The smallest clean integration is one dedicated shortcode,
 *  `[cpms_contact_details]`, placed once in the page's Elementor content:
 *  it reads the settings at RENDER time and prints sanitized, escaped rows.
 *  This is NOT a general shortcode framework: no attributes are accepted or
 *  interpreted, no arbitrary content executes, and the output is a fixed
 *  template of at most three rows (email / phone / address).
 *
 * ROLE SEPARATION (important):
 *  - PUBLIC CONTACT EMAIL (`contact_email` + `cpms_contact_public_email()`)
 *    is the general, visitor-visible business contact role. Its authorized
 *    default lives in `cpms_contact_public_default_email()` (Product Owner
 *    decision, 2026-09-30; the literal appears only in that function).
 *  - LEAD RECIPIENT (`lead_recipient` + `cpms_lead_delivery_recipient()`
 *    in demo-form.php) is the sales/demo mail-delivery role with its OWN
 *    authorized default (`cpms_lead_delivery_default_recipient()`).
 *  The two roles currently resolve to the same address but are independent
 *  settings with independent defaults: changing one never silently changes
 *  the other. This file reads ONLY the public-contact role.
 *
 * TRUTH BOUNDARIES:
 *  - This is a general contact channel, NOT a support channel: no support,
 *    response-time or SLA wording exists anywhere in this renderer.
 *  - Phone renders ONLY when configured; address renders ONLY when configured;
 *    an empty optional field produces NO row, placeholder or empty card.
 *  - Values are read through `koorosh_get_setting()` (which re-sanitizes on
 *    every read) and escaped again at output; request data is never read.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The authorized PUBLIC/GENERAL contact email (Product Owner decision,
 * 2026-09-30). Project configuration evidence only — NOT a registered-company
 * identity and NOT a support channel. This is the default/fallback of the
 * public-contact role ONLY; the lead recipient has its own separate default in
 * demo-form.php (`cpms_lead_delivery_default_recipient()`).
 *
 * @return string Authorized default public contact email address.
 */
function cpms_contact_public_default_email() {
	return 'biatoweb@gmail.com';
}

/**
 * Effective public contact email: the validated administrator setting
 * (تنظیمات کوروش → اطلاعات تماس, `manage_options` only) or the authorized
 * public default when the setting is empty/invalid. Never request-derived and
 * not filterable, so no page payload, query string or cookie can change it.
 * Independent of `cpms_lead_delivery_recipient()`.
 *
 * @return string Public contact email address.
 */
function cpms_contact_public_email() {
	$email = function_exists( 'koorosh_get_setting' ) ? koorosh_get_setting( 'contact_email' ) : '';
	if ( is_string( $email ) && '' !== $email && is_email( $email ) ) {
		return $email;
	}
	return cpms_contact_public_default_email();
}

/**
 * Stored public phone, or '' when not configured. '' means: render nothing.
 *
 * @return string Phone exactly as configured (already sanitized on read).
 */
function cpms_contact_public_phone() {
	$phone = function_exists( 'koorosh_get_setting' ) ? koorosh_get_setting( 'contact_phone' ) : '';
	return is_string( $phone ) ? trim( $phone ) : '';
}

/**
 * Stored public address, or '' when not configured. '' means: render nothing.
 *
 * @return string Address exactly as configured (already sanitized on read).
 */
function cpms_contact_public_address() {
	$address = function_exists( 'koorosh_get_setting' ) ? koorosh_get_setting( 'contact_address' ) : '';
	return is_string( $address ) ? trim( $address ) : '';
}

/**
 * Safe normalization of a configured phone into a `tel:` destination:
 * Persian/Arabic-Indic digits become ASCII, visual separators (space, dash,
 * parentheses, dot) are dropped, and a single leading + is preserved. The
 * result contains only [0-9+] by construction; '' if nothing usable remains.
 *
 * @param string $phone Sanitized stored phone value.
 * @return string tel: destination (no scheme prefix).
 */
function cpms_contact_phone_tel( $phone ) {
	$digits = strtr(
		(string) $phone,
		array(
			'۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
			'۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
			'٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
			'٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
		)
	);
	$plus   = preg_match( '/^\+/', $digits ) ? '+' : '';
	$digits = preg_replace( '/[^0-9]/', '', $digits );
	return $plus . (string) $digits;
}

/**
 * Render the contact details block. Fixed template, at most three rows.
 * Every output fragment is escaped here; empty optional fields produce no
 * row at all (no empty visual rows/placeholders). Social settings are
 * deliberately NOT rendered (no icon/library, no unverified profiles).
 *
 * @return string Safe HTML ('' when nothing can be shown).
 */
function cpms_render_contact_details() {
	$email   = cpms_contact_public_email();
	$phone   = cpms_contact_public_phone();
	$address = cpms_contact_public_address();
	$rows    = array();

	if ( '' !== $email && is_email( $email ) ) {
		$rows[] = sprintf(
			'<li class="cpms-contact-row cpms-contact-email"><span class="cpms-contact-label">%1$s</span><a class="cpms-contact-value" href="%2$s" aria-label="%3$s"><bdi>%4$s</bdi></a></li>',
			esc_html( 'ایمیل عمومی' ),
			esc_url( 'mailto:' . $email ),
			esc_attr( 'ایمیل عمومی: ' . $email ),
			esc_html( $email )
		);
	}

	$tel = cpms_contact_phone_tel( $phone );
	if ( '' !== $phone && '' !== $tel ) {
		$rows[] = sprintf(
			'<li class="cpms-contact-row cpms-contact-phone"><span class="cpms-contact-label">%1$s</span><a class="cpms-contact-value" href="%2$s" aria-label="%3$s"><bdi>%4$s</bdi></a></li>',
			esc_html( 'تلفن' ),
			esc_url( 'tel:' . $tel ),
			esc_attr( 'تلفن: ' . $phone ),
			esc_html( $phone )
		);
	}

	if ( '' !== $address ) {
		$rows[] = sprintf(
			'<li class="cpms-contact-row cpms-contact-address"><span class="cpms-contact-label">%1$s</span><span class="cpms-contact-value">%2$s</span></li>',
			esc_html( 'نشانی' ),
			esc_html( $address )
		);
	}

	if ( array() === $rows ) {
		return '';
	}

	return '<ul class="cpms-contact-details" id="cpms-contact-details">' . implode( '', $rows ) . '</ul>';
}

/**
 * `[cpms_contact_details]` shortcode. Attributes are deliberately ignored:
 * the renderer is a fixed template with no configurable parameters, so no
 * attribute can introduce markup, links or alternate values.
 *
 * @param mixed $atts Ignored; accepted only to match the shortcode API.
 * @return string
 */
function cpms_contact_details_shortcode( $atts ) {
	unset( $atts );
	return cpms_render_contact_details();
}
add_shortcode( 'cpms_contact_details', 'cpms_contact_details_shortcode' );
