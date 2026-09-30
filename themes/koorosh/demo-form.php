<?php
/**
 * CPMS Demo / Consultation Qualification Form Handler.
 *
 * Implements the Koorosh-owned form behavior for the DEMO / CONSULTATION page:
 * short qualification fields, strict data privacy (no patient/medical data),
 * server-side validation, CSRF protection, and a two-mode lead-delivery model.
 *
 * DELIVERY ARCHITECTURE (two explicit modes):
 *
 * A. DEVELOPMENT / CI (default in every context):
 *    - delivery DISABLED unless the environment explicitly enables it;
 *    - wp_mail() is never called (zero outbound mail);
 *    - no payload persistence (no DB writes) and no payload logging;
 *    - honest non-live notice + DELIVERY_DISABLED state for valid submissions.
 *
 * B. AUTHORIZED LIVE ENVIRONMENT (explicit environment-owned activation):
 *    - the environment owner defines CPMS_LEAD_DELIVERY_ENABLED as (boolean)
 *      true in wp-config.php (or an equivalent environment-owned bootstrap);
 *    - deploying this code alone NEVER enables delivery — the theme only
 *      reads the constant and never defines it;
 *    - delivery goes through the WordPress-native mail layer (wp_mail());
 *      SMTP/transport/deliverability configuration remains environment-owned
 *      and outside this repository (no credentials exist in Git);
 *    - the recipient is the single authorized value bounded by code and can
 *      never be overridden by any request parameter.
 *
 * HONESTY CONTRACT FOR THE LIVE MODE:
 * wp_mail() returning true proves only that the configured WordPress mail
 * layer ACCEPTED the handoff. It does NOT prove inbox delivery, that the
 * recipient read the message, or that any human saw it. User-facing wording
 * is deliberately bounded to that fact and makes no response-time promise.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* Delivery/result states (single vocabulary shared by PHP, JSON and tests). */
if ( ! defined( 'CPMS_FORM_STATE_VALIDATION_FAILURE' ) ) {
	define( 'CPMS_FORM_STATE_VALIDATION_FAILURE', 'validation_failure' );
}
if ( ! defined( 'CPMS_FORM_STATE_DELIVERY_DISABLED' ) ) {
	define( 'CPMS_FORM_STATE_DELIVERY_DISABLED', 'delivery_disabled' );
}
if ( ! defined( 'CPMS_FORM_STATE_HANDOFF_ACCEPTED' ) ) {
	define( 'CPMS_FORM_STATE_HANDOFF_ACCEPTED', 'handoff_accepted' );
}
if ( ! defined( 'CPMS_FORM_STATE_HANDOFF_FAILED' ) ) {
	define( 'CPMS_FORM_STATE_HANDOFF_FAILED', 'handoff_failed' );
}

/**
 * Environment-owned activation control for live lead delivery.
 *
 * Default OFF. The only way to enable delivery is an explicit
 * `define( 'CPMS_LEAD_DELIVERY_ENABLED', true );` (boolean true, exactly) in
 * the environment's wp-config.php or an equivalent environment-owned
 * bootstrap (e.g. a must-use plugin placed by the host operator). This theme
 * never defines the constant, so neither deploying nor updating this code can
 * enable delivery by itself. A non-boolean truthy value (e.g. the string
 * 'false') intentionally does NOT activate delivery.
 *
 * @return bool True only when the environment has explicitly activated delivery.
 */
function cpms_lead_delivery_enabled() {
	return defined( 'CPMS_LEAD_DELIVERY_ENABLED' ) && true === CPMS_LEAD_DELIVERY_ENABLED;
}

/**
 * The single authorized lead recipient (product-owner commercial decision,
 * recorded 2026-09-30). Bounded by code on purpose: the value is not read
 * from any request parameter, database option, or filter, and therefore
 * cannot be overridden per request. Changing the recipient is a source-code
 * review, not a form input.
 *
 * @return string Authorized recipient email address.
 */
function cpms_lead_delivery_recipient() {
	return 'biatoweb@gmail.com';
}

/**
 * The strict allowlist of POST field names this handler accepts. Any other
 * field in a submission makes the whole request malformed (rejected with
 * HTTP 400). This keeps requests predictable and makes "the recipient cannot
 * be overridden by the request" structurally true: there is no field that
 * could carry a recipient, and extra fields are refused outright.
 *
 * `_wp_http_referer` is expected because wp_nonce_field() emits it by default
 * in the rendered form; its value is never read or reflected.
 *
 * @return array List of accepted POST keys.
 */
function cpms_get_demo_form_allowed_fields() {
	return array(
		'cpms_demo_submit',
		'cpms_demo_nonce',
		'_wp_http_referer',
		'cpms_ajax',
		'cpms_submit_btn',
		'cpms_contact_name',
		'cpms_org_name',
		'cpms_contact_value',
		'cpms_org_type',
		'cpms_doctor_count',
		'cpms_discussion_topic',
		'cpms_website_url',
	);
}

/**
 * Returns allowed option definitions for the qualification form.
 *
 * @return array
 */
function cpms_get_demo_form_schema() {
	return array(
		'org_types'     => array(
			'multi_specialty' => 'کلینیک چندتخصصی / پلی‌کلینیک',
			'clinic'          => 'درمانگاه عمومی یا تخصصی',
			'surgery_center'  => 'مرکز جراحی محدود / دی‌کلینیک',
			'solo_practice'   => 'مطب مستقل یا مرکز تک‌پزشک',
			'other'           => 'سایر مراکز درمانی',
		),
		'doctor_counts' => array(
			'1-2'  => '۱ تا ۲ پزشک',
			'3-5'  => '۳ تا ۵ پزشک',
			'6-10' => '۶ تا ۱۰ پزشک',
			'11+'  => 'بیش از ۱۰ پزشک',
		),
	);
}

/**
 * Persian user-facing wording for the terminal delivery states.
 * Wording is intentionally bounded to what is actually proven:
 * - DELIVERY_DISABLED keeps the honest non-live notice;
 * - HANDOFF_ACCEPTED states only that the site's mail layer accepted the
 *   handoff and explicitly avoids any receipt/read/response-time promise;
 * - HANDOFF_FAILED reports failure honestly and never masquerades as success.
 *
 * @return array Map of state => array( 'title' => ..., 'message' => ... ).
 */
function cpms_get_demo_form_state_messages() {
	return array(
		CPMS_FORM_STATE_DELIVERY_DISABLED => array(
			'title'   => 'درخواست آزمایشی شما با موفقیت بررسی شد',
			'message' => 'با توجه به وضعیت پیش‌نمایش فنی سایت، تحویل زندهٔ لیدها به ایمیل یا CRM هنوز فعال نشده و هیچ داده‌ای ذخیره یا ارسال نگردید. پس از اتصال نهایی کانال رسمی ارتباطی، درخواست‌های واقعی دریافت خواهند شد.',
		),
		CPMS_FORM_STATE_HANDOFF_ACCEPTED => array(
			'title'   => 'درخواست شما ثبت شد',
			'message' => 'اطلاعات واردشده بررسی شد و درخواست شما برای پیگیری، به لایهٔ ارسال ایمیل سایت تحویل داده شد. دریافت و مطالعهٔ پیام از سمت گیرنده در این مرحله تضمین نمی‌شود.',
		),
		CPMS_FORM_STATE_HANDOFF_FAILED   => array(
			'title'   => 'ارسال درخواست در حال حاضر انجام نشد',
			'message' => 'تحویل درخواست به لایهٔ ارسال ایمیل سایت با خطا مواجه شد و اطلاعات شما ارسال نگردید. لطفاً کمی بعد دوباره تلاش فرمایید.',
		),
	);
}

/**
 * Validates submitted qualification form fields.
 *
 * @param array $raw_data Unslashed post data (already allowlist-checked).
 * @return array Result containing 'valid' (bool), 'errors' (array), and 'values' (array).
 */
function cpms_validate_demo_form_submission( $raw_data ) {
	$schema = cpms_get_demo_form_schema();
	$errors = array();
	$values = array();

	// 0. First-party honeypot (lightweight spam decoy, hidden from humans and
	// assistive technology). A non-empty value fails validation with a generic
	// message that does not reveal the trap. Bounded: the value is never
	// reflected, stored, or logged.
	$honeypot = isset( $raw_data['cpms_website_url'] ) ? sanitize_text_field( $raw_data['cpms_website_url'] ) : '';
	if ( '' !== $honeypot ) {
		$errors['global'] = 'در حال حاضر امکان ثبت این درخواست وجود ندارد. لطفاً صفحه را تازه‌سازی کرده و دوباره تلاش فرمایید.';
	}

	// 1. Contact Person Name (Required)
	$name = isset( $raw_data['cpms_contact_name'] ) ? sanitize_text_field( $raw_data['cpms_contact_name'] ) : '';
	$values['contact_name'] = $name;
	if ( empty( $name ) || mb_strlen( $name, 'UTF-8' ) < 2 ) {
		$errors['contact_name'] = 'لطفاً نام و نام خانوادگی پاسخ‌گو را وارد فرمایید.';
	} elseif ( mb_strlen( $name, 'UTF-8' ) > 100 ) {
		$errors['contact_name'] = 'نام واردشده طولانی‌تر از حد مجاز است.';
	}

	// 2. Organization / Clinic Name (Required)
	$org = isset( $raw_data['cpms_org_name'] ) ? sanitize_text_field( $raw_data['cpms_org_name'] ) : '';
	$values['org_name'] = $org;
	if ( empty( $org ) || mb_strlen( $org, 'UTF-8' ) < 2 ) {
		$errors['org_name'] = 'لطفاً نام مرکز درمانی یا مطب را وارد فرمایید.';
	} elseif ( mb_strlen( $org, 'UTF-8' ) > 150 ) {
		$errors['org_name'] = 'نام مرکز درمانی طولانی‌تر از حد مجاز است.';
	}

	// 3. Contact Method / Value (Required, neutral phone or email)
	$contact = isset( $raw_data['cpms_contact_value'] ) ? sanitize_text_field( $raw_data['cpms_contact_value'] ) : '';
	$values['contact_value'] = $contact;
	if ( empty( $contact ) ) {
		$errors['contact_value'] = 'لطفاً شماره تماس یا ایمیل کاری معتبر را وارد فرمایید.';
	} else {
		$is_email = is_email( $contact );
		// Basic neutral phone validation: digits, spaces, plus, dashes, at least 8 digits.
		$digits_only = preg_replace( '/\\D/', '', $contact );
		$is_phone    = ( strlen( $digits_only ) >= 8 && strlen( $digits_only ) <= 15 );
		if ( ! $is_email && ! $is_phone ) {
			$errors['contact_value'] = 'فرمت شماره تماس یا ایمیل واردشده معتبر نیست.';
		}
	}

	// 4. Organization Type (Required, whitelist selection)
	$org_type = isset( $raw_data['cpms_org_type'] ) ? sanitize_key( $raw_data['cpms_org_type'] ) : '';
	$values['org_type'] = $org_type;
	if ( empty( $org_type ) || ! array_key_exists( $org_type, $schema['org_types'] ) ) {
		$errors['org_type'] = 'لطفاً نوع مرکز درمانی را انتخاب فرمایید.';
	}

	// 5. Doctor Count (Required, whitelist selection)
	$doctor_count = isset( $raw_data['cpms_doctor_count'] ) ? sanitize_key( $raw_data['cpms_doctor_count'] ) : '';
	$values['doctor_count'] = $doctor_count;
	if ( empty( $doctor_count ) || ! array_key_exists( $doctor_count, $schema['doctor_counts'] ) ) {
		$errors['doctor_count'] = 'لطفاً تعداد تقریبی پزشکان همکار را انتخاب فرمایید.';
	}

	// 6. Discussion Topic (Optional, short note)
	$topic = isset( $raw_data['cpms_discussion_topic'] ) ? sanitize_textarea_field( $raw_data['cpms_discussion_topic'] ) : '';
	$values['discussion_topic'] = $topic;
	if ( mb_strlen( $topic, 'UTF-8' ) > 500 ) {
		$errors['discussion_topic'] = 'متن توضیحات نباید بیش از ۵۰۰ کاراکتر باشد.';
	}

	// Strict Privacy Enforcement: heuristic check against Iranian National IDs (10 consecutive digits).
	// Defense-in-depth only — a heuristic can never guarantee PHI prevention.
	if ( preg_match( '/\\b\\d{10}\\b/', $topic ) || preg_match( '/\\b\\d{10}\\b/', $name ) ) {
		$errors['discussion_topic'] = 'لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید. درج کدهای ملی یا داده‌های هویتی مجاز نیست.';
	}

	return array(
		'valid'  => empty( $errors ),
		'errors' => $errors,
		'values' => $values,
	);
}

/**
 * Delivers a validated lead according to the active delivery mode.
 *
 * Disabled mode (default): wp_mail() is never called; nothing leaves the
 * environment; nothing is persisted or logged. Enabled mode (environment-owned
 * activation only): one plain-text, minimal email to the single authorized
 * recipient through the WordPress-native mail layer. The email carries only
 * the submitted qualification fields, uses no executable HTML, sets no
 * user-controlled recipient or subject, and adds a Reply-To header only when
 * the submitted contact value is a validated email address.
 *
 * NOTE: a true return proves mail-layer acceptance ONLY — never inbox delivery.
 *
 * @param array $values Validated, sanitized qualification values.
 * @return string One of the CPMS_FORM_STATE_* delivery states.
 */
function cpms_deliver_demo_lead( array $values ) {
	if ( ! cpms_lead_delivery_enabled() ) {
		// SAFE NON-LIVE MODE: no email, no DB write, no logging. Ever.
		return CPMS_FORM_STATE_DELIVERY_DISABLED;
	}

	$schema         = cpms_get_demo_form_schema();
	$org_type_label = isset( $schema['org_types'][ $values['org_type'] ] ) ? $schema['org_types'][ $values['org_type'] ] : '';
	$doctor_label   = isset( $schema['doctor_counts'][ $values['doctor_count'] ] ) ? $schema['doctor_counts'][ $values['doctor_count'] ] : '';
	$topic          = ( isset( $values['discussion_topic'] ) && '' !== trim( (string) $values['discussion_topic'] ) ) ? $values['discussion_topic'] : '—';

	$lines   = array(
		'CPMS website — demo/consultation lead',
		'',
		'نام و نام خانوادگی پاسخ‌گو: ' . $values['contact_name'],
		'نام مرکز درمانی یا مطب: ' . $values['org_name'],
		'روش تماس: ' . $values['contact_value'],
		'نوع مرکز درمانی: ' . $org_type_label,
		'تعداد تقریبی پزشکان همکار: ' . $doctor_label,
		'موضوع یا اولویت گفت‌وگو: ' . $topic,
		'',
		'این پیام از فرم درخواست دمو/مشاورهٔ وب‌سایت CPMS ارسال شده است.',
	);
	$message = implode( "\n", $lines );

	$headers = array();
	$reply_to = isset( $values['contact_value'] ) ? sanitize_email( $values['contact_value'] ) : '';
	if ( $reply_to && is_email( $reply_to ) ) {
		// WordPress-safe header value: only a sanitized, is_email()-validated
		// address reaches wp_mail(); anything else omits Reply-To entirely.
		$headers[] = 'Reply-To: ' . $reply_to;
	}

	$accepted = wp_mail(
		cpms_lead_delivery_recipient(),
		'درخواست دمو و مشاوره CPMS از وب‌سایت',
		$message,
		$headers
	);

	return $accepted ? CPMS_FORM_STATE_HANDOFF_ACCEPTED : CPMS_FORM_STATE_HANDOFF_FAILED;
}

/**
 * Global form state for rendering in normal non-AJAX POST requests.
 */
global $cpms_demo_form_state;
$cpms_demo_form_state = array(
	'submitted'  => false,
	'state'       => '',
	'is_success'  => false,
	'errors'      => array(),
	'values'      => array(),
);

/**
 * Emit one response for the current submission: JSON for AJAX requests
 * (wp_send_json_* exits), or the global render state for non-AJAX POSTs.
 *
 * @param bool   $is_ajax     AJAX request flag.
 * @param int    $http_status HTTP status for the JSON response.
 * @param array  $payload     JSON payload (state, title/message, errors, ...).
 * @param array  $errors      Field errors for server-rendered notice.
 * @param array  $values      Values to re-fill the form with (failures only).
 * @param string $state       Terminal CPMS_FORM_STATE_* value.
 * @param bool   $is_success  Whether the state is a success state.
 * @return void
 */
function cpms_demo_form_respond( $is_ajax, $http_status, array $payload, array $errors, array $values, $state, $is_success ) {
	global $cpms_demo_form_state;

	if ( $is_ajax ) {
		if ( $is_success ) {
			wp_send_json_success( $payload, $http_status );
		}
		wp_send_json_error( $payload, $http_status );
	}

	$cpms_demo_form_state = array(
		'submitted'  => true,
		'state'       => $state,
		'is_success'  => $is_success,
		'errors'      => $errors,
		'values'      => $values,
	);
}

/**
 * Handle form submission on init.
 */
function cpms_handle_demo_form_submission() {
	if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
		return;
	}

	if ( ! isset( $_POST['cpms_demo_submit'] ) ) {
		return;
	}

	$is_ajax = (
		( defined( 'DOING_AJAX' ) && DOING_AJAX ) ||
		isset( $_POST['cpms_ajax'] ) ||
		( isset( $_SERVER['HTTP_X_REQUESTED_WITH'] ) && 'xmlhttprequest' === strtolower( sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_REQUESTED_WITH'] ) ) ) )
	);

	// 1. CSRF nonce verification.
	$nonce = isset( $_POST['cpms_demo_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['cpms_demo_nonce'] ) ) : '';
	if ( ! wp_verify_nonce( $nonce, 'cpms_demo_form_action' ) ) {
		$nonce_message = 'اعتبارسنجی امنیتی نامعتبر بود. لطفاً صفحه را تازه‌سازی فرمایید.';
		cpms_demo_form_respond(
			$is_ajax,
			403,
			array(
				'code'    => 'invalid_nonce',
				'state'   => CPMS_FORM_STATE_VALIDATION_FAILURE,
				'message' => $nonce_message,
			),
			array( 'global' => $nonce_message ),
			array(),
			CPMS_FORM_STATE_VALIDATION_FAILURE,
			false
		);
		return;
	}

	// 2. Strict expected fields: anything outside the allowlist makes the
	// request malformed. No part of the request is reflected back.
	$raw_data = wp_unslash( $_POST );
	$allowed  = cpms_get_demo_form_allowed_fields();
	foreach ( array_keys( $raw_data ) as $posted_key ) {
		if ( ! is_string( $posted_key ) || ! in_array( $posted_key, $allowed, true ) ) {
			$unexpected_message = 'درخواست شامل داده‌های غیرمجاز است. لطفاً فقط از فرم رسمی همین صفحه استفاده فرمایید.';
			cpms_demo_form_respond(
				$is_ajax,
				400,
				array(
					'code'    => 'unexpected_fields',
					'state'   => CPMS_FORM_STATE_VALIDATION_FAILURE,
					'message' => $unexpected_message,
				),
				array( 'global' => $unexpected_message ),
				array(),
				CPMS_FORM_STATE_VALIDATION_FAILURE,
				false
			);
			return;
		}
	}

	// 3. Server-side sanitization + validation.
	$result = cpms_validate_demo_form_submission( $raw_data );
	if ( ! $result['valid'] ) {
		cpms_demo_form_respond(
			$is_ajax,
			200,
			array(
				'state'   => CPMS_FORM_STATE_VALIDATION_FAILURE,
				'errors'  => $result['errors'],
				'message' => 'لطفاً خطاهای مشخص‌شده در فرم را بررسی و برطرف فرمایید.',
			),
			$result['errors'],
			$result['values'],
			CPMS_FORM_STATE_VALIDATION_FAILURE,
			false
		);
		return;
	}

	// 4. Lead delivery according to the active mode (disabled by default).
	// No DB persistence and no payload logging in ANY mode.
	$state    = cpms_deliver_demo_lead( $result['values'] );
	$messages = cpms_get_demo_form_state_messages();
	$wording  = isset( $messages[ $state ] ) ? $messages[ $state ] : $messages[ CPMS_FORM_STATE_DELIVERY_DISABLED ];

	$payload = array(
		'state'   => $state,
		'title'   => $wording['title'],
		'message' => $wording['message'],
		'stored'  => false,
	);
	if ( CPMS_FORM_STATE_DELIVERY_DISABLED === $state ) {
		$payload['non_live'] = true;
	}

	if ( CPMS_FORM_STATE_HANDOFF_FAILED === $state ) {
		// The server-side handoff failed. HTTP 500 keeps this from
		// masquerading as success, and the message states the failure.
		cpms_demo_form_respond(
			$is_ajax,
			500,
			array_merge( $payload, array( 'code' => 'handoff_failed' ) ),
			array( 'global' => $wording['message'] ),
			$result['values'],
			$state,
			false
		);
		return;
	}

	cpms_demo_form_respond( $is_ajax, 200, $payload, array(), array(), $state, true );
}
add_action( 'init', 'cpms_handle_demo_form_submission' );

/**
 * Render the qualification form shortcode [cpms_demo_form].
 *
 * Accessible, semantic HTML with explicit labels, aria attributes,
 * mode-aware notices (non-live banner only while delivery is disabled),
 * minimal data-use disclosure, and privacy guidance.
 *
 * @return string HTML output.
 */
function cpms_render_demo_form() {
	global $cpms_demo_form_state;

	$schema        = cpms_get_demo_form_schema();
	$errors        = $cpms_demo_form_state['errors'] ?? array();
	$values        = $cpms_demo_form_state['values'] ?? array();
	$is_success    = ! empty( $cpms_demo_form_state['is_success'] );
	$state         = isset( $cpms_demo_form_state['state'] ) ? $cpms_demo_form_state['state'] : '';
	$delivery_live = cpms_lead_delivery_enabled();

	$messages = cpms_get_demo_form_state_messages();
	$wording  = isset( $messages[ $state ] ) ? $messages[ $state ] : $messages[ CPMS_FORM_STATE_DELIVERY_DISABLED ];

	ob_start();
	?>
	<div class="cpms-demo-form-wrapper" id="cpms-demo-form-wrapper">

		<?php if ( ! $delivery_live ) : ?>
			<!-- Technical Preview Notice: Safe Non-Live Mode (default; delivery not activated by the environment) -->
			<div class="cpms-demo-banner cpms-demo-banner--info" id="cpms-non-live-banner" role="note" aria-label="وضعیت ارسال فرم">
				<p class="cpms-demo-banner__title"><strong>حالت پیش‌نمایش فنی (غیرعملیاتی)</strong></p>
				<p class="cpms-demo-banner__desc">تحویل زندهٔ لیدها به ایمیل، CRM یا مقصد بیرونی هنوز فعال نشده است. این فرم برای ارزیابی تجربهٔ کاربری و واجدالشرایط‌سازی طراحی شده و در این نسخه هیچ داده‌ای ذخیره یا ارسال نمی‌شود.</p>
			</div>
		<?php endif; ?>

		<!-- Data Privacy Notice: Strictly No Patient Data (always rendered, both modes) -->
		<div class="cpms-demo-banner cpms-demo-banner--privacy" id="cpms-privacy-banner" role="note" aria-label="راهنمای حریم خصوصی">
			<p class="cpms-demo-banner__title"><strong>عدم ثبت اطلاعات بیماران و پرونده‌های درمانی</strong></p>
			<p class="cpms-demo-banner__desc">لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید. این جلسه صرفاً برای ارزیابی تناسب عملیاتی، هماهنگی پذیرش و گردش کار مرکز است.</p>
		</div>

		<?php if ( ! empty( $errors ) ) : ?>
			<div class="cpms-form-notice cpms-form-notice--error" id="cpms-form-error-summary" role="alert" tabindex="-1">
				<p class="cpms-form-notice__title"><strong>لطفاً خطاهای مشخص‌شده در فرم را اصلاح فرمایید:</strong></p>
				<ul class="cpms-form-notice__list">
					<?php foreach ( $errors as $field => $err ) : ?>
						<li>
							<?php if ( 'global' === $field ) : ?>
								<?php echo esc_html( $err ); ?>
							<?php else : ?>
								<a href="#cpms-field-<?php echo esc_attr( $field ); ?>"><?php echo esc_html( $err ); ?></a>
							<?php endif; ?>
						</li>
					<?php endforeach; ?>
				</ul>
			</div>
		<?php endif; ?>

		<?php if ( $is_success ) : ?>
			<div class="cpms-form-notice cpms-form-notice--success" id="cpms-form-success-notice" role="status" aria-live="polite" tabindex="-1">
				<p class="cpms-form-notice__title"><strong><?php echo esc_html( $wording['title'] ); ?></strong></p>
				<p class="cpms-form-notice__desc"><?php echo esc_html( $wording['message'] ); ?></p>
			</div>
		<?php endif; ?>

		<form id="cpms-demo-form" method="post" action="#cpms-demo-form-wrapper" class="cpms-demo-form" novalidate>
			<?php wp_nonce_field( 'cpms_demo_form_action', 'cpms_demo_nonce' ); ?>
			<input type="hidden" name="cpms_demo_submit" value="1" />

			<!-- Field 1: Contact Person Name -->
			<div class="cpms-form-field cpms-form-field--name" id="cpms-field-contact_name">
				<label for="cpms-contact-name" class="cpms-form-label">
					نام و نام خانوادگی پاسخ‌گو
					<span class="cpms-form-required" aria-hidden="true">*</span>
					<span class="screen-reader-text">(الزامی)</span>
				</label>
				<input
					type="text"
					id="cpms-contact-name"
					name="cpms_contact_name"
					class="cpms-form-input<?php echo isset( $errors['contact_name'] ) ? ' cpms-form-input--error' : ''; ?>"
					required
					aria-required="true"
					autocomplete="name"
					aria-describedby="cpms-help-contact-name<?php echo isset( $errors['contact_name'] ) ? ' cpms-err-contact-name' : ''; ?>"
					<?php echo isset( $errors['contact_name'] ) ? 'aria-invalid="true"' : ''; ?>
					value="<?php echo esc_attr( $values['contact_name'] ?? '' ); ?>"
				/>
				<p id="cpms-help-contact-name" class="cpms-form-help">نام پزشک، مدیر یا مسئول هماهنگی در کلینیک</p>
				<?php if ( isset( $errors['contact_name'] ) ) : ?>
					<p id="cpms-err-contact-name" class="cpms-form-error" role="alert"><?php echo esc_html( $errors['contact_name'] ); ?></p>
				<?php endif; ?>
			</div>

			<!-- Field 2: Organization / Clinic Name -->
			<div class="cpms-form-field cpms-form-field--org" id="cpms-field-org_name">
				<label for="cpms-org-name" class="cpms-form-label">
					نام مرکز درمانی یا مطب
					<span class="cpms-form-required" aria-hidden="true">*</span>
					<span class="screen-reader-text">(الزامی)</span>
				</label>
				<input
					type="text"
					id="cpms-org-name"
					name="cpms_org_name"
					class="cpms-form-input<?php echo isset( $errors['org_name'] ) ? ' cpms-form-input--error' : ''; ?>"
					required
					aria-required="true"
					aria-describedby="cpms-help-org-name<?php echo isset( $errors['org_name'] ) ? ' cpms-err-org-name' : ''; ?>"
					<?php echo isset( $errors['org_name'] ) ? 'aria-invalid="true"' : ''; ?>
					value="<?php echo esc_attr( $values['org_name'] ?? '' ); ?>"
				/>
				<p id="cpms-help-org-name" class="cpms-form-help">نام کلینیک، درمانگاه، مجتمع تخصصی یا مطب</p>
				<?php if ( isset( $errors['org_name'] ) ) : ?>
					<p id="cpms-err-org-name" class="cpms-form-error" role="alert"><?php echo esc_html( $errors['org_name'] ); ?></p>
				<?php endif; ?>
			</div>

			<!-- Field 3: Contact Value (Neutral UX model) -->
			<div class="cpms-form-field cpms-form-field--contact" id="cpms-field-contact_value">
				<label for="cpms-contact-value" class="cpms-form-label">
					روش و شماره تماس یا ایمیل کاری
					<span class="cpms-form-required" aria-hidden="true">*</span>
					<span class="screen-reader-text">(الزامی)</span>
				</label>
				<input
					type="text"
					id="cpms-contact-value"
					name="cpms_contact_value"
					class="cpms-form-input<?php echo isset( $errors['contact_value'] ) ? ' cpms-form-input--error' : ''; ?>"
					required
					aria-required="true"
					autocomplete="email tel"
					aria-describedby="cpms-help-contact-value<?php echo isset( $errors['contact_value'] ) ? ' cpms-err-contact-value' : ''; ?>"
					<?php echo isset( $errors['contact_value'] ) ? 'aria-invalid="true"' : ''; ?>
					value="<?php echo esc_attr( $values['contact_value'] ?? '' ); ?>"
				/>
				<p id="cpms-help-contact-value" class="cpms-form-help">شماره موبایل یا ایمیل کاری جهت هماهنگی جلسهٔ مشاوره</p>
				<?php if ( isset( $errors['contact_value'] ) ) : ?>
					<p id="cpms-err-contact-value" class="cpms-form-error" role="alert"><?php echo esc_html( $errors['contact_value'] ); ?></p>
				<?php endif; ?>
			</div>

			<!-- Field 4: Organization Type -->
			<div class="cpms-form-field cpms-form-field--type" id="cpms-field-org_type">
				<label for="cpms-org-type" class="cpms-form-label">
					نوع مرکز درمانی
					<span class="cpms-form-required" aria-hidden="true">*</span>
					<span class="screen-reader-text">(الزامی)</span>
				</label>
				<select
					id="cpms-org-type"
					name="cpms_org_type"
					class="cpms-form-select<?php echo isset( $errors['org_type'] ) ? ' cpms-form-select--error' : ''; ?>"
					required
					aria-required="true"
					aria-describedby="cpms-help-org-type<?php echo isset( $errors['org_type'] ) ? ' cpms-err-org-type' : ''; ?>"
					<?php echo isset( $errors['org_type'] ) ? 'aria-invalid="true"' : ''; ?>
				>
					<option value="">انتخاب نوع مرکز...</option>
					<?php foreach ( $schema['org_types'] as $key => $label ) : ?>
						<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $values['org_type'] ?? '', $key ); ?>>
							<?php echo esc_html( $label ); ?>
						</option>
					<?php endforeach; ?>
				</select>
				<p id="cpms-help-org-type" class="cpms-form-help">ساختار کلی و نحوهٔ فعالیت مرکز درمانی</p>
				<?php if ( isset( $errors['org_type'] ) ) : ?>
					<p id="cpms-err-org-type" class="cpms-form-error" role="alert"><?php echo esc_html( $errors['org_type'] ); ?></p>
				<?php endif; ?>
			</div>

			<!-- Field 5: Doctor Count -->
			<div class="cpms-form-field cpms-form-field--count" id="cpms-field-doctor_count">
				<label for="cpms-doctor-count" class="cpms-form-label">
					تعداد تقریبی پزشکان همکار
					<span class="cpms-form-required" aria-hidden="true">*</span>
					<span class="screen-reader-text">(الزامی)</span>
				</label>
				<select
					id="cpms-doctor-count"
					name="cpms_doctor_count"
					class="cpms-form-select<?php echo isset( $errors['doctor_count'] ) ? ' cpms-form-select--error' : ''; ?>"
					required
					aria-required="true"
					aria-describedby="cpms-help-doctor-count<?php echo isset( $errors['doctor_count'] ) ? ' cpms-err-doctor-count' : ''; ?>"
					<?php echo isset( $errors['doctor_count'] ) ? 'aria-invalid="true"' : ''; ?>
				>
					<option value="">انتخاب تعداد پزشکان...</option>
					<?php foreach ( $schema['doctor_counts'] as $key => $label ) : ?>
						<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $values['doctor_count'] ?? '', $key ); ?>>
							<?php echo esc_html( $label ); ?>
						</option>
					<?php endforeach; ?>
				</select>
				<p id="cpms-help-doctor-count" class="cpms-form-help">تعداد پزشکانی که در مرکز فعالیت دارند یا نوبت‌دهی آن‌ها مدیریت می‌شود</p>
				<?php if ( isset( $errors['doctor_count'] ) ) : ?>
					<p id="cpms-err-doctor-count" class="cpms-form-error" role="alert"><?php echo esc_html( $errors['doctor_count'] ); ?></p>
				<?php endif; ?>
			</div>

			<!-- Field 6: Discussion Topic (Optional) -->
			<div class="cpms-form-field cpms-form-field--topic" id="cpms-field-discussion_topic">
				<label for="cpms-discussion-topic" class="cpms-form-label">
					موضوع یا اولویت گفت‌وگو
					<span class="cpms-form-optional">(اختیاری)</span>
				</label>
				<textarea
					id="cpms-discussion-topic"
					name="cpms_discussion_topic"
					class="cpms-form-textarea<?php echo isset( $errors['discussion_topic'] ) ? ' cpms-form-textarea--error' : ''; ?>"
					rows="3"
					aria-describedby="cpms-help-topic<?php echo isset( $errors['discussion_topic'] ) ? ' cpms-err-topic' : ''; ?>"
					<?php echo isset( $errors['discussion_topic'] ) ? 'aria-invalid="true"' : ''; ?>
				><?php echo esc_textarea( $values['discussion_topic'] ?? '' ); ?></textarea>
				<p id="cpms-help-topic" class="cpms-form-help">مختصری دربارهٔ جریان کار فعلی یا چالش‌های مورد نظر در کلینیک (بدون اطلاعات بیمار)</p>
				<?php if ( isset( $errors['discussion_topic'] ) ) : ?>
					<p id="cpms-err-topic" class="cpms-form-error" role="alert"><?php echo esc_html( $errors['discussion_topic'] ); ?></p>
				<?php endif; ?>
			</div>

			<!-- First-party honeypot: hidden spam decoy, never visible or focusable -->
			<div class="cpms-form-honeypot" hidden aria-hidden="true">
				<label for="cpms-website-url">وب‌سایت (این قسمت را خالی بگذارید)</label>
				<input
					type="text"
					id="cpms-website-url"
					name="cpms_website_url"
					value=""
					tabindex="-1"
					autocomplete="off"
				/>
			</div>

			<!-- Submit Button, Data-Use Disclosure & Calm Disclaimer -->
			<div class="cpms-form-actions">
				<button type="submit" id="cpms-submit-btn" name="cpms_submit_btn" class="cpms-form-submit-button">
					ثبت درخواست مشاوره / دمو
				</button>
				<p class="cpms-form-disclaimer" id="cpms-data-use-note">کاربرد داده‌ها: اطلاعات تماس و سازمانی که در این فرم وارد می‌کنید تنها برای هماهنگی و پاسخ‌گویی به همین درخواست دمو/مشاوره استفاده می‌شود — مشروط به فعال‌بودن تحویل زندهٔ درخواست‌ها در محیط عملیاتی سایت. لطفاً اطلاعات بیماران یا داده‌های پزشکی وارد نکنید.</p>
				<p class="cpms-form-disclaimer">ارسال این فرم تعهد مالی یا خرید ایجاد نمی‌کند.</p>
			</div>
		</form>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'cpms_demo_form', 'cpms_render_demo_form' );
