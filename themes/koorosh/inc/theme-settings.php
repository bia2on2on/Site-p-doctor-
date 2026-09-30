<?php
/**
 * Koorosh Theme Settings v1 (تنظیمات کوروش).
 *
 * A small, WordPress-native settings area for GLOBAL OPERATIONAL values only.
 *
 * OWNERSHIP BOUNDARY
 *  - Elementor / Elementor Pro own page layouts, marketing copy, visual
 *    sections, colors, typography, spacing and (later) Theme Builder
 *    header/footer. Nothing here duplicates that.
 *  - This file owns: business contact values, the lead-recipient setting and
 *    the site-level lead switch, a few fallback-shell switches, optional
 *    social URLs, and a READ-ONLY site-status view.
 *  - The ENVIRONMENT (wp-config.php / host) still owns CPMS_LEAD_DELIVERY_ENABLED,
 *    SMTP/transport and every credential. No secret is ever stored here.
 *
 * DATA MODEL
 *  ONE bounded option array `koorosh_settings` (versioned, registered through
 *  the Settings API, unknown keys discarded, every value re-normalized on
 *  read). It is tiny and read on most front-end renders (fallback header), so
 *  it keeps WordPress's default autoload behavior. See koorosh_settings_schema()
 *  for the authoritative list of keys and defaults.
 *
 * SECURITY
 *  - Admin page + saving: capability `manage_options`, Settings API nonce and
 *    capability enforcement through wp-admin/options.php.
 *  - The sanitize callback ALSO refuses any write by a user lacking
 *    `manage_options` (defense in depth for programmatic update_option()).
 *  - Every field is sanitized/validated per type and bounded; invalid input
 *    keeps the previous value and reports an error.
 *  - No request parameter outside that authenticated admin save path can alter
 *    any value. Nothing here renders HTML from stored values without escaping.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'KOOROSH_SETTINGS_OPTION' ) ) {
	define( 'KOOROSH_SETTINGS_OPTION', 'koorosh_settings' );
}
if ( ! defined( 'KOOROSH_SETTINGS_VERSION' ) ) {
	define( 'KOOROSH_SETTINGS_VERSION', 1 );
}
if ( ! defined( 'KOOROSH_SETTINGS_PAGE' ) ) {
	define( 'KOOROSH_SETTINGS_PAGE', 'koorosh-settings' );
}
if ( ! defined( 'KOOROSH_SETTINGS_GROUP' ) ) {
	define( 'KOOROSH_SETTINGS_GROUP', 'koorosh_settings_group' );
}

/**
 * Admin tabs (slug => label). `general` and `status` have no stored fields.
 *
 * @return array
 */
function koorosh_settings_tabs() {
	return array(
		'general'  => 'عمومی',
		'contact'  => 'اطلاعات تماس',
		'sales'    => 'فروش و درخواست دمو',
		'shell'    => 'هدر و فوتر',
		'social'   => 'شبکه‌های اجتماعی',
		'status'   => 'وضعیت سایت',
	);
}

/**
 * Authoritative settings schema.
 *
 * type: bool | email | phone | text | social_url | recipient
 * max : maximum length in characters (mb_strlen) for string types.
 *
 * There is deliberately NO field of any kind for passwords, API keys, tokens,
 * SMTP credentials or hosting credentials, and none for CSS/JS/HTML.
 *
 * @return array
 */
function koorosh_settings_schema() {
	return array(
		'contact_email'          => array(
			'tab'     => 'contact',
			'type'    => 'email',
			'default' => '',
			'max'     => 100,
			'label'   => 'ایمیل عمومی / کسب‌وکار',
			'help'    => 'اختیاری. در صفحهٔ «تماس با ما» (/contact/) به‌صورت عمومی و از رندر پویای قالب نمایش داده می‌شود؛ خالی‌گذاشتن فیلد، نشانی عمومی مجاز پیش‌فرض را نشان می‌دهد. این نشانی هویت ثبتی شرکت نیست و در متن‌های حقوقی درج نمی‌شود.',
		),
		'contact_phone'          => array(
			'tab'     => 'contact',
			'type'    => 'phone',
			'default' => '',
			'max'     => 30,
			'label'   => 'تلفن کسب‌وکار',
			'help'    => 'اختیاری. فقط ارقام، فاصله و نویسه‌های + - ( ) ؛ حداکثر ۳۰ نویسه. فقط در صورت تنظیم‌بودن در صفحهٔ «تماس با ما» نمایش داده می‌شود.',
		),
		'contact_address'        => array(
			'tab'     => 'contact',
			'type'    => 'text',
			'default' => '',
			'max'     => 200,
			'label'   => 'نشانی / موقعیت (متن کوتاه)',
			'help'    => 'اختیاری. متن ساده، حداکثر ۲۰۰ نویسه. فقط در صورت تنظیم‌بودن در صفحهٔ «تماس با ما» نمایش داده می‌شود.',
		),
		'lead_recipient'         => array(
			'tab'     => 'sales',
			'type'    => 'recipient',
			'default' => '', // Resolved from cpms_lead_delivery_default_recipient() (single source of truth in demo-form.php).
			'max'     => 100,
			'label'   => 'ایمیل دریافت‌کنندهٔ درخواست‌های دمو',
			'help'    => 'گیرندهٔ مجاز فعلی مطابق تصمیم مالک محصول. هیچ پارامتر درخواستی کاربر نمی‌تواند این مقدار را تغییر دهد. خالی‌گذاشتن فیلد، مقدار مجاز پیش‌فرض را بازمی‌گرداند. این نشانی هویت ثبتی شرکت نیست. صفحهٔ حریم خصوصی، نشانی گیرندهٔ مجاز را نام برده است؛ پس از تغییر گیرنده آن متن را به‌صورت آگاهانه بازبینی کنید.',
		),
		'lead_site_enabled'      => array(
			'tab'     => 'sales',
			'type'    => 'bool',
			'default' => false,
			'label'   => 'ارسال درخواست‌های دمو در سطح سایت',
			'help'    => 'پیش‌فرض: خاموش. این کلید به‌تنهایی ارسال را فعال نمی‌کند؛ ارسال واقعی فقط زمانی ممکن است که «محیط» نیز اجازه داده باشد.',
		),
		'header_show_site_title' => array(
			'tab'     => 'shell',
			'type'    => 'bool',
			'default' => true,
			'label'   => 'نمایش عنوان سایت در هدر جایگزین',
			'help'    => 'اگر خاموش باشد و لوگو هم تنظیم نشده باشد، پیوند صفحهٔ اصلی در هدر جایگزین نمایش داده نمی‌شود.',
		),
		'header_show_cta'        => array(
			'tab'     => 'shell',
			'type'    => 'bool',
			'default' => true,
			'label'   => 'نمایش دکمهٔ درخواست دمو در هدر جایگزین',
			'help'    => 'پیش‌فرض: روشن (رفتار فعلی).',
		),
		'header_cta_label'       => array(
			'tab'     => 'shell',
			'type'    => 'text',
			'default' => '',
			'max'     => 40,
			'label'   => 'برچسب دکمهٔ هدر (اختیاری)',
			'help'    => 'خالی = برچسب پیش‌فرض «درخواست دمو / مشاوره». متن ساده، حداکثر ۴۰ نویسه؛ ادعای محصولی یا قیمتی ننویسید.',
		),
		'social_instagram'       => array(
			'tab'     => 'social',
			'type'    => 'social_url',
			'default' => '',
			'max'     => 200,
			'domains' => array( 'instagram.com' ),
			'label'   => 'اینستاگرام',
			'help'    => 'نشانی کامل پروفایل (https). فقط دامنهٔ instagram.com پذیرفته می‌شود.',
		),
		'social_linkedin'        => array(
			'tab'     => 'social',
			'type'    => 'social_url',
			'default' => '',
			'max'     => 200,
			'domains' => array( 'linkedin.com' ),
			'label'   => 'لینکدین',
			'help'    => 'نشانی کامل پروفایل یا صفحهٔ شرکت (https). فقط دامنهٔ linkedin.com پذیرفته می‌شود.',
		),
		'social_telegram'        => array(
			'tab'     => 'social',
			'type'    => 'social_url',
			'default' => '',
			'max'     => 200,
			'domains' => array( 't.me', 'telegram.me' ),
			'label'   => 'تلگرام',
			'help'    => 'نشانی کامل کانال یا حساب (https). فقط دامنه‌های t.me و telegram.me پذیرفته می‌شود.',
		),
	);
}

/**
 * Default values (plus schema version). Lead switch defaults to OFF.
 *
 * @return array
 */
function koorosh_settings_defaults() {
	$defaults = array( 'version' => KOOROSH_SETTINGS_VERSION );
	foreach ( koorosh_settings_schema() as $key => $def ) {
		$defaults[ $key ] = $def['default'];
	}
	// The authorized recipient has ONE source of truth in demo-form.php.
	if ( function_exists( 'cpms_lead_delivery_default_recipient' ) ) {
		$defaults['lead_recipient'] = cpms_lead_delivery_default_recipient();
	}
	return $defaults;
}

/**
 * Sanitize/validate ONE value. Returns array( value, error_message|null ).
 * On error the value is null and the caller keeps its previous value.
 *
 * @param string $key Schema key.
 * @param mixed  $raw Raw value (already unslashed).
 * @return array
 */
function koorosh_sanitize_field( $key, $raw ) {
	$schema = koorosh_settings_schema();
	if ( ! isset( $schema[ $key ] ) ) {
		return array( null, null );
	}
	$def   = $schema[ $key ];
	$label = $def['label'];

	if ( 'bool' === $def['type'] ) {
		$on = ( true === $raw || 1 === $raw || '1' === $raw || 'on' === $raw );
		return array( $on, null );
	}

	if ( null === $raw ) {
		$raw = '';
	}
	if ( ! is_scalar( $raw ) ) {
		return array( null, sprintf( 'مقدار «%s» نامعتبر بود؛ مقدار قبلی حفظ شد.', $label ) );
	}
	$raw = trim( (string) $raw );
	$max = isset( $def['max'] ) ? (int) $def['max'] : 100;

	if ( '' === $raw ) {
		if ( 'recipient' === $def['type'] ) {
			$defaults = koorosh_settings_defaults();
			return array( $defaults['lead_recipient'], null );
		}
		return array( '', null );
	}
	if ( mb_strlen( $raw, 'UTF-8' ) > $max ) {
		return array( null, sprintf( 'مقدار «%1$s» بیش از %2$d نویسه است؛ مقدار قبلی حفظ شد.', $label, $max ) );
	}

	switch ( $def['type'] ) {
		case 'email':
		case 'recipient':
			// Reject anything that is not exactly one plain address: whitespace
			// (incl. CR/LF), quotes, angle brackets, separators. sanitize_email()
			// alone would silently mangle such input into a different address.
			$clean = sanitize_email( $raw );
			if ( preg_match( '/[\s<>,;"\'\\\\]/u', $raw ) || '' === $clean || $clean !== $raw || ! is_email( $clean ) ) {
				return array( null, sprintf( 'نشانی ایمیل «%s» معتبر نیست؛ مقدار قبلی حفظ شد.', $label ) );
			}
			return array( $clean, null );

		case 'phone':
			$clean = sanitize_text_field( $raw );
			if ( $clean !== $raw || ! preg_match( '/^[0-9\x{06F0}-\x{06F9}\x{0660}-\x{0669}+\-()\s]+$/u', $clean ) ) {
				return array( null, sprintf( 'شمارهٔ «%s» فقط می‌تواند شامل ارقام، فاصله و نویسه‌های + - ( ) باشد؛ مقدار قبلی حفظ شد.', $label ) );
			}
			return array( $clean, null );

		case 'social_url':
			$url = esc_url_raw( $raw, array( 'https', 'http' ) );
			if ( '' === $url ) {
				return array( null, sprintf( 'نشانی «%s» معتبر نیست؛ مقدار قبلی حفظ شد.', $label ) );
			}
			$url   = preg_replace( '/^http:/i', 'https:', $url );
			$parts = wp_parse_url( $url );
			$host  = isset( $parts['host'] ) ? strtolower( $parts['host'] ) : '';
			$ok    = false;
			foreach ( (array) $def['domains'] as $domain ) {
				if ( $host === $domain || ( strlen( $host ) > strlen( $domain ) && '.' . $domain === substr( $host, -( strlen( $domain ) + 1 ) ) ) ) {
					$ok = true;
				}
			}
			if ( ! $ok || ! empty( $parts['user'] ) || ! empty( $parts['pass'] ) || mb_strlen( $url, 'UTF-8' ) > $max ) {
				return array( null, sprintf( 'نشانی «%1$s» باید یک پیوند https از دامنهٔ %2$s باشد؛ مقدار قبلی حفظ شد.', $label, implode( ' / ', (array) $def['domains'] ) ) );
			}
			return array( $url, null );

		case 'text':
		default:
			$clean = sanitize_text_field( $raw );
			return array( $clean, null );
	}
}

/**
 * Normalize a stored/unknown array into the full, valid settings array.
 * Invalid stored values silently fall back to their defaults. Never reads
 * any request data.
 *
 * @param mixed $stored Stored option value.
 * @return array
 */
function koorosh_normalize_settings( $stored ) {
	$out    = koorosh_settings_defaults();
	$stored = is_array( $stored ) ? $stored : array();
	foreach ( koorosh_settings_schema() as $key => $def ) {
		if ( ! array_key_exists( $key, $stored ) ) {
			continue;
		}
		list( $value, $error ) = koorosh_sanitize_field( $key, $stored[ $key ] );
		if ( null !== $value && null === $error ) {
			$out[ $key ] = $value;
		}
	}
	return $out;
}

/**
 * All settings, normalized and complete.
 *
 * @return array
 */
function koorosh_get_settings() {
	static $last_raw = null;
	static $last_out = null;

	$raw = get_option( KOOROSH_SETTINGS_OPTION, array() );
	if ( null === $last_out || $raw !== $last_raw ) {
		$last_raw = $raw;
		$last_out = koorosh_normalize_settings( $raw ); // Cheap; cache only avoids re-normalizing within one request.
	}
	return $last_out;
}

/**
 * One setting (null if the key does not exist).
 *
 * @param string $key Schema key.
 * @return mixed
 */
function koorosh_get_setting( $key ) {
	$settings = koorosh_get_settings();
	return array_key_exists( $key, $settings ) ? $settings[ $key ] : null;
}

/**
 * Settings API sanitize callback.
 *
 * Tab-scoped saves post `_tab`; only that tab's keys are touched (absent
 * checkboxes become OFF for that tab only) so saving one tab can never wipe
 * another. Programmatic full-array writes (no `_tab`) update only the keys
 * present. Unknown keys are discarded. Writers lacking `manage_options` change
 * nothing.
 *
 * @param mixed $input Raw posted array.
 * @return array
 */
function koorosh_sanitize_settings( $input ) {
	$current = koorosh_get_settings();

	if ( ! current_user_can( 'manage_options' ) || ! is_array( $input ) ) {
		return $current;
	}

	$schema = koorosh_settings_schema();
	$tabs   = koorosh_settings_tabs();
	$tab    = ( isset( $input['_tab'] ) && is_string( $input['_tab'] ) ) ? sanitize_key( $input['_tab'] ) : '';

	if ( '' !== $tab && isset( $tabs[ $tab ] ) ) {
		$keys = array();
		foreach ( $schema as $key => $def ) {
			if ( $def['tab'] === $tab ) {
				$keys[] = $key;
			}
		}
		$tab_scoped = true;
	} else {
		$keys       = array_values( array_intersect( array_keys( $input ), array_keys( $schema ) ) );
		$tab_scoped = false;
	}

	static $reported = array();
	$out             = $current;
	foreach ( $keys as $key ) {
		if ( 'bool' === $schema[ $key ]['type'] && ! array_key_exists( $key, $input ) ) {
			if ( $tab_scoped ) {
				$out[ $key ] = false;
			}
			continue;
		}
		$raw                   = array_key_exists( $key, $input ) ? $input[ $key ] : '';
		list( $value, $error ) = koorosh_sanitize_field( $key, $raw );
		if ( null !== $error ) {
			// Settings API may run this callback twice on first save; report once.
			$fingerprint = $key . '|' . md5( is_scalar( $raw ) ? (string) $raw : '' );
			if ( ! isset( $reported[ $fingerprint ] ) ) {
				$reported[ $fingerprint ] = true;
				if ( ! function_exists( 'add_settings_error' ) ) {
					// Admin-only helper; absent on front-end/CLI requests.
					require_once ABSPATH . 'wp-admin/includes/template.php';
				}
				add_settings_error( KOOROSH_SETTINGS_OPTION, 'koorosh_invalid_' . $key, $error, 'error' );
			}
			continue;
		}
		if ( null !== $value ) {
			$out[ $key ] = $value;
		}
	}

	$out['version'] = KOOROSH_SETTINGS_VERSION;
	return $out;
}

/* ------------------------------------------------------------------------- *
 * Lead-delivery status (read-only derivation; the gates live in demo-form.php)
 * ------------------------------------------------------------------------- */

/**
 * Combined lead-delivery state across BOTH gates.
 *
 * @return string environment_off | site_off | both_on
 */
function koorosh_lead_delivery_state() {
	$env  = function_exists( 'cpms_lead_delivery_environment_authorized' ) && cpms_lead_delivery_environment_authorized();
	$site = function_exists( 'cpms_lead_delivery_site_switch_enabled' ) && cpms_lead_delivery_site_switch_enabled();
	if ( ! $env ) {
		return 'environment_off';
	}
	return $site ? 'both_on' : 'site_off';
}

/**
 * Persian status sentence for the lead-delivery state. Never claims inbox
 * delivery.
 *
 * @return string
 */
function koorosh_lead_delivery_state_label() {
	$labels = array(
		'environment_off' => 'محیط اجازه ارسال نداده است',
		'site_off'        => 'محیط اجازه داده، اما ارسال سایت خاموش است',
		'both_on'         => 'ارسال سایت و محیط هر دو فعال‌اند',
	);
	return $labels[ koorosh_lead_delivery_state() ];
}

/**
 * Read-only launch-visibility rows. Evidence-based: an item is only ever
 * `active` / `yes` when the code can actually observe it. Everything that has
 * no reliable marker is `unverified`, never a green/pass state.
 *
 * Row: key, label, state (active|inactive|yes|no|review|unverified), note.
 *
 * @return array
 */
function koorosh_get_site_status_rows() {
	$rows = array();

	$public = (bool) get_option( 'blog_public' );
	$rows[] = array(
		'key'   => 'indexing',
		'label' => 'ایندکس شدن توسط موتورهای جستجو (blog_public)',
		'state' => $public ? 'review' : 'inactive',
		'note'  => $public
			? 'در وردپرس «قابل نمایش برای موتورهای جستجو» است. پیش از هر انتشار، دروازهٔ رسمی انتشار باید جداگانه تأیید شده باشد.'
			: 'موتورهای جستجو مسدودند (وضعیت توسعه/پیش‌نمایش).',
	);

	$env_ok = function_exists( 'cpms_lead_delivery_environment_authorized' ) && cpms_lead_delivery_environment_authorized();
	$rows[] = array(
		'key'   => 'lead_environment',
		'label' => 'اجازهٔ محیط برای ارسال درخواست‌ها',
		'state' => $env_ok ? 'active' : 'inactive',
		'note'  => 'توسط مالک محیط (wp-config.php) تعیین می‌شود، نه از این صفحه.',
	);

	$site_on = function_exists( 'cpms_lead_delivery_site_switch_enabled' ) && cpms_lead_delivery_site_switch_enabled();
	$rows[]  = array(
		'key'   => 'lead_site_switch',
		'label' => 'کلید ارسال در سطح سایت',
		'state' => $site_on ? 'active' : 'inactive',
		'note'  => 'ارسال واقعی فقط با فعال‌بودن هر دو شرط (محیط و سایت) ممکن است.',
	);

	$recipient = function_exists( 'cpms_lead_delivery_recipient' ) ? cpms_lead_delivery_recipient() : '';
	$rows[]    = array(
		'key'   => 'lead_recipient',
		'label' => 'دریافت‌کنندهٔ درخواست‌ها تنظیم شده است',
		'state' => ( '' !== $recipient && is_email( $recipient ) ) ? 'yes' : 'no',
		'note'  => 'فقط تنظیم‌بودن نشانی را نشان می‌دهد؛ رسیدن ایمیل به صندوق ورودی بررسی یا تضمین نمی‌شود.',
	);

	foreach (
		array(
			'privacy' => 'صفحهٔ حریم خصوصی (/privacy/) وجود دارد',
			'terms'   => 'صفحهٔ شرایط استفاده (/terms/) وجود دارد',
		) as $slug => $label
	) {
		$page   = get_page_by_path( $slug, OBJECT, 'page' );
		$rows[] = array(
			'key'   => 'page_' . $slug,
			'label' => $label,
			'state' => ( $page && 'publish' === $page->post_status ) ? 'yes' : 'no',
			'note'  => 'فقط وجود صفحهٔ منتشرشده را نشان می‌دهد؛ تأیید حقوقی محسوب نمی‌شود.',
		);
	}

	$rows[] = array(
		'key'   => 'product_media',
		'label' => 'رسانهٔ واقعی محصول',
		'state' => 'unverified',
		'note'  => 'نشانگر قابل‌اتکایی برای کامل‌بودن رسانه وجود ندارد.',
	);
	$rows[] = array(
		'key'   => 'elementor_pro_acceptance',
		'label' => 'پذیرش Elementor Pro روی میزبان',
		'state' => 'unverified',
		'note'  => ( defined( 'ELEMENTOR_PRO_VERSION' ) ? 'افزونهٔ Pro در این محیط بارگذاری شده است' : 'افزونهٔ Pro در این محیط بارگذاری نشده است' ) . '؛ نصب‌بودن به معنای تأیید پذیرش نیست.',
	);
	$rows[] = array(
		'key'   => 'search_console',
		'label' => 'Search Console',
		'state' => 'unverified',
		'note'  => 'هیچ شواهدی از تأیید مالکیت یا ارسال نقشهٔ سایت در این پنل وجود ندارد.',
	);

	return $rows;
}

/**
 * Persian label per row state. No state is a generic "pass".
 *
 * @return array
 */
function koorosh_status_state_labels() {
	return array(
		'active'     => 'فعال',
		'inactive'   => 'غیرفعال',
		'yes'        => 'بله',
		'no'         => 'خیر',
		'review'     => 'نیازمند بررسی',
		'unverified' => 'تأیید نشده',
	);
}

/* ------------------------------------------------------------------------- *
 * Registration + admin UI
 * ------------------------------------------------------------------------- */

add_action(
	'init',
	function () {
		register_setting(
			KOOROSH_SETTINGS_GROUP,
			KOOROSH_SETTINGS_OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => 'koorosh_sanitize_settings',
				'default'           => array(),
				'show_in_rest'      => false,
			)
		);
	}
);

// Settings API: options.php enforces this capability (and the group nonce).
add_filter(
	'option_page_capability_' . KOOROSH_SETTINGS_GROUP,
	function () {
		return 'manage_options';
	}
);

add_action(
	'admin_menu',
	function () {
		add_menu_page(
			'تنظیمات کوروش',
			'تنظیمات کوروش',
			'manage_options',
			KOOROSH_SETTINGS_PAGE,
			'koorosh_render_settings_page',
			'dashicons-admin-generic',
			61
		);
	}
);

add_action(
	'admin_init',
	function () {
		foreach ( array_keys( koorosh_settings_tabs() ) as $tab ) {
			add_settings_section( 'koorosh_section_' . $tab, '', '__return_false', KOOROSH_SETTINGS_PAGE . '-' . $tab );
		}
		foreach ( koorosh_settings_schema() as $key => $def ) {
			add_settings_field(
				'koorosh_field_' . $key,
				$def['label'],
				'koorosh_render_field',
				KOOROSH_SETTINGS_PAGE . '-' . $def['tab'],
				'koorosh_section_' . $def['tab'],
				array(
					'key'       => $key,
					'label_for' => 'koorosh-' . $key,
				)
			);
		}
	}
);

/**
 * Settings field renderer (every output escaped).
 *
 * @param array $args Field args (key).
 * @return void
 */
function koorosh_render_field( $args ) {
	$schema = koorosh_settings_schema();
	$key    = isset( $args['key'] ) ? $args['key'] : '';
	if ( ! isset( $schema[ $key ] ) ) {
		return;
	}
	$def   = $schema[ $key ];
	$value = koorosh_get_setting( $key );
	$name  = KOOROSH_SETTINGS_OPTION . '[' . $key . ']';
	$id    = 'koorosh-' . $key;

	if ( 'bool' === $def['type'] ) {
		printf(
			'<label for="%1$s"><input type="checkbox" id="%1$s" name="%2$s" value="1" %3$s /> %4$s</label>',
			esc_attr( $id ),
			esc_attr( $name ),
			checked( true === $value, true, false ),
			esc_html( 'فعال' )
		);
	} else {
		$input_type = ( 'email' === $def['type'] || 'recipient' === $def['type'] ) ? 'email' : ( 'social_url' === $def['type'] ? 'url' : ( 'phone' === $def['type'] ? 'tel' : 'text' ) );
		printf(
			'<input type="%1$s" id="%2$s" name="%3$s" value="%4$s" class="regular-text" maxlength="%5$d" dir="ltr" autocomplete="off" />',
			esc_attr( $input_type ),
			esc_attr( $id ),
			esc_attr( $name ),
			esc_attr( (string) $value ),
			(int) $def['max']
		);
	}
	if ( ! empty( $def['help'] ) ) {
		printf( '<p class="description">%s</p>', esc_html( $def['help'] ) );
	}
}

/**
 * Small link helper for read-only rows.
 *
 * @param string $url   Admin URL.
 * @param string $label Link text.
 * @return string Escaped HTML.
 */
function koorosh_admin_link( $url, $label ) {
	return sprintf( '<a href="%s">%s</a>', esc_url( $url ), esc_html( $label ) );
}

/**
 * Tab: عمومی — WordPress-native identity is linked, never duplicated.
 *
 * @return void
 */
function koorosh_render_tab_general() {
	$customize = add_query_arg( 'autofocus[section]', 'title_tagline', admin_url( 'customize.php' ) );
	$name      = get_bloginfo( 'name' );
	$tagline   = get_bloginfo( 'description' );
	?>
	<p>هویت سایت با امکانات استاندارد خود وردپرس مدیریت می‌شود؛ در اینجا گزینهٔ تکراری ساخته نشده است. چیدمان صفحات، متن‌های بازاریابی، رنگ و تایپوگرافی در Elementor ویرایش می‌شود.</p>
	<table class="widefat striped" style="max-width:52rem">
		<tbody>
			<tr>
				<th scope="row">عنوان سایت</th>
				<td><?php echo '' !== $name ? esc_html( $name ) : esc_html( 'تنظیم نشده' ); ?></td>
				<td><?php echo koorosh_admin_link( admin_url( 'options-general.php' ), 'ویرایش در تنظیمات وردپرس' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in helper. ?></td>
			</tr>
			<tr>
				<th scope="row">توضیح کوتاه</th>
				<td><?php echo '' !== $tagline ? esc_html( $tagline ) : esc_html( 'تنظیم نشده' ); ?></td>
				<td><?php echo koorosh_admin_link( admin_url( 'options-general.php' ), 'ویرایش در تنظیمات وردپرس' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></td>
			</tr>
			<tr>
				<th scope="row">لوگوی سایت</th>
				<td><?php echo has_custom_logo() ? esc_html( 'تنظیم شده' ) : esc_html( 'تنظیم نشده' ); ?></td>
				<td><?php echo koorosh_admin_link( $customize, 'مدیریت در سفارشی‌ساز وردپرس' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></td>
			</tr>
			<tr>
				<th scope="row">نمادک (Site Icon / favicon)</th>
				<td><?php echo has_site_icon() ? esc_html( 'تنظیم شده' ) : esc_html( 'تنظیم نشده' ); ?></td>
				<td><?php echo koorosh_admin_link( $customize, 'مدیریت در سفارشی‌ساز وردپرس' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></td>
			</tr>
		</tbody>
	</table>
	<p class="description">لوگو فقط در هدر جایگزین کوروش نمایش داده می‌شود؛ اگر Elementor Pro هدر را رندر کند، آن هدر اولویت دارد.</p>
	<?php
}

/**
 * Sales tab header: dual-gate status.
 *
 * @return void
 */
function koorosh_render_sales_intro() {
	?>
	<div class="notice notice-info inline">
		<p><strong>وضعیت ارسال:</strong> <?php echo esc_html( koorosh_lead_delivery_state_label() ); ?></p>
		<p>ارسال درخواست‌ها فقط وقتی انجام می‌شود که <strong>هر دو شرط</strong> برقرار باشد: (۱) اجازهٔ محیط توسط مالک میزبان در wp-config.php، و (۲) روشن‌بودن کلید ارسال سایت در همین صفحه. خاموش‌بودن هر یک، ارسال را متوقف می‌کند. همین وضعیت نشان‌دهندهٔ رسیدن پیام به صندوق ورودی نیست؛ تحویل به لایهٔ ایمیل وردپرس تنها چیزی است که سایت می‌تواند گزارش دهد. هیچ رمز، کلید یا اطلاعات SMTP در این صفحه ذخیره نمی‌شود، و محتوای درخواست‌ها در پایگاه‌داده ذخیره نمی‌شود.</p>
	</div>
	<?php
}

/**
 * Tab: هدر و فوتر — menu assignment is linked to the core Menus screen.
 *
 * @return void
 */
function koorosh_render_shell_intro() {
	$locations = admin_url( 'nav-menus.php?action=locations' );
	?>
	<p>Elementor Pro Theme Builder در صورت رندر هدر/فوتر اولویت دارد و گزینه‌های این برگه فقط بر هدر/فوتر جایگزین کوروش اثر می‌گذارند. طراحی بصری هدر و فوتر در این‌جا مدیریت نمی‌شود.</p>
	<table class="widefat striped" style="max-width:52rem">
		<tbody>
			<tr>
				<th scope="row">منوی اصلی (primary)</th>
				<td><?php echo has_nav_menu( 'primary' ) ? esc_html( 'اختصاص داده شده' ) : esc_html( 'اختصاص داده نشده' ); ?></td>
				<td><?php echo koorosh_admin_link( $locations, 'مدیریت جایگاه‌های منو' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></td>
			</tr>
			<tr>
				<th scope="row">منوی فوتر (footer)</th>
				<td><?php echo has_nav_menu( 'footer' ) ? esc_html( 'اختصاص داده شده' ) : esc_html( 'اختصاص داده نشده' ); ?></td>
				<td><?php echo koorosh_admin_link( $locations, 'مدیریت جایگاه‌های منو' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></td>
			</tr>
		</tbody>
	</table>
	<?php
}

/**
 * Tab: وضعیت سایت — strictly read-only.
 *
 * @return void
 */
function koorosh_render_tab_status() {
	$labels = koorosh_status_state_labels();
	?>
	<div class="notice notice-warning inline"><p>این برگه فقط وضعیت‌های قابل مشاهده را نشان می‌دهد و <strong>آمادگی انتشار را تأیید نمی‌کند</strong>. موارد «تأیید نشده» هنوز شواهدی ندارند و سبز یا موفق محسوب نمی‌شوند.</p></div>
	<p><strong>وضعیت ارسال درخواست‌ها:</strong> <?php echo esc_html( koorosh_lead_delivery_state_label() ); ?></p>
	<table class="widefat striped" id="koorosh-status-table">
		<thead>
			<tr><th scope="col">مورد</th><th scope="col">وضعیت</th><th scope="col">توضیح</th></tr>
		</thead>
		<tbody>
		<?php foreach ( koorosh_get_site_status_rows() as $row ) : ?>
			<tr data-status-key="<?php echo esc_attr( $row['key'] ); ?>" data-status-state="<?php echo esc_attr( $row['state'] ); ?>">
				<th scope="row"><?php echo esc_html( $row['label'] ); ?></th>
				<td><strong><?php echo esc_html( $labels[ $row['state'] ] ); ?></strong></td>
				<td><?php echo esc_html( $row['note'] ); ?></td>
			</tr>
		<?php endforeach; ?>
		</tbody>
	</table>
	<p>
		<?php echo koorosh_admin_link( admin_url( 'options-reading.php' ), 'تنظیمات خواندن وردپرس (دید موتورهای جستجو)' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		— ایندکس‌شدن فقط از همین کنترل استاندارد وردپرس تغییر می‌کند؛ کوروش کلید جداگانه‌ای ندارد.
	</p>
	<?php
}

/**
 * Settings page.
 *
 * @return void
 */
function koorosh_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html( 'شما اجازهٔ دسترسی به این صفحه را ندارید.' ), '', array( 'response' => 403 ) );
	}

	$tabs = koorosh_settings_tabs();
	$tab  = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'general'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only tab selector.
	if ( ! isset( $tabs[ $tab ] ) ) {
		$tab = 'general';
	}
	?>
	<div class="wrap" id="koorosh-settings">
		<h1>تنظیمات کوروش</h1>
		<?php settings_errors(); ?>
		<nav class="nav-tab-wrapper" aria-label="بخش‌های تنظیمات">
			<?php foreach ( $tabs as $slug => $label ) : ?>
				<a class="nav-tab<?php echo $slug === $tab ? ' nav-tab-active' : ''; ?>" href="<?php echo esc_url( add_query_arg( array( 'page' => KOOROSH_SETTINGS_PAGE, 'tab' => $slug ), admin_url( 'admin.php' ) ) ); ?>"<?php echo $slug === $tab ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $label ); ?></a>
			<?php endforeach; ?>
		</nav>
		<?php
		if ( 'general' === $tab ) {
			koorosh_render_tab_general();
		} elseif ( 'status' === $tab ) {
			koorosh_render_tab_status();
		} else {
			if ( 'sales' === $tab ) {
				koorosh_render_sales_intro();
			} elseif ( 'shell' === $tab ) {
				koorosh_render_shell_intro();
			} elseif ( 'social' === $tab ) {
				echo '<p>' . esc_html( 'فقط ذخیره می‌شود؛ تا زمانی که قالب بخش شبکه‌های اجتماعی نداشته باشد چیزی در سایت نمایش داده نمی‌شود و هیچ آیکون یا کتابخانه‌ای بارگذاری نمی‌شود. فقط پروفایل‌های واقعی را وارد کنید.' ) . '</p>';
			} elseif ( 'contact' === $tab ) {
				echo '<p>' . esc_html( 'این مقادیر فقط در صفحهٔ «تماس با ما» (/contact/) و از رندر پویای قالب نمایش داده می‌شوند و در متن‌های حقوقی یا محتوای صفحات Elementor درج نمی‌شوند. تلفن و نشانی فقط در صورت تنظیم‌بودن نمایش داده می‌شوند.' ) . '</p>';
			}
			?>
			<form method="post" action="options.php">
				<?php settings_fields( KOOROSH_SETTINGS_GROUP ); ?>
				<input type="hidden" name="<?php echo esc_attr( KOOROSH_SETTINGS_OPTION . '[_tab]' ); ?>" value="<?php echo esc_attr( $tab ); ?>" />
				<?php
				do_settings_sections( KOOROSH_SETTINGS_PAGE . '-' . $tab );
				submit_button( 'ذخیرهٔ تغییرات' );
				?>
			</form>
			<?php
		}
		?>
	</div>
	<?php
}

/* ------------------------------------------------------------------------- *
 * Custom Logo (core mechanism; no binary storage of our own)
 * ------------------------------------------------------------------------- */

add_action(
	'after_setup_theme',
	function () {
		add_theme_support(
			'custom-logo',
			array(
				'height'      => 80,
				'width'       => 240,
				'flex-height' => true,
				'flex-width'  => true,
			)
		);
	}
);
