<?php
/**
 * CPMS Demo / Consultation Qualification Form Handler.
 *
 * Implements the minimal Koorosh-owned form behavior for the DEMO / CONSULTATION page.
 * Keeps qualification useful but short, enforces strict data privacy (no patient/medical data),
 * and provides an explicit SAFE NON-LIVE MODE because production lead delivery is not yet authorized.
 *
 * COMMERCIAL BOUNDARY & LAUNCH BLOCKER:
 * LIVE LEAD DELIVERY = NOT CONFIGURED / NOT AUTHORIZED.
 * No email destination, CRM, webhook, or external SaaS is connected.
 * Submitted test payloads are validated but NEVER persisted, logged, or relayed.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
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
 * Validates submitted qualification form fields.
 *
 * @param array $raw_data Unslashed post data.
 * @return array Result containing 'valid' (bool), 'errors' (array), and 'values' (array).
 */
function cpms_validate_demo_form_submission( $raw_data ) {
	$schema = cpms_get_demo_form_schema();
	$errors = array();
	$values = array();

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
		$digits_only = preg_replace( '/\D/', '', $contact );
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

	// Strict Privacy Enforcement: heuristic check against Iranian National IDs (10 consecutive digits)
	if ( preg_match( '/\b\d{10}\b/', $topic ) || preg_match( '/\b\d{10}\b/', $name ) ) {
		$errors['discussion_topic'] = 'لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید. درج کدهای ملی یا داده‌های هویتی مجاز نیست.';
	}

	return array(
		'valid'  => empty( $errors ),
		'errors' => $errors,
		'values' => $values,
	);
}

/**
 * Global form state for rendering in normal non-AJAX POST requests.
 */
global $cpms_demo_form_state;
$cpms_demo_form_state = array(
	'submitted'  => false,
	'is_success' => false,
	'errors'     => array(),
	'values'     => array(),
);

/**
 * Handle form submission on template_redirect / init.
 */
add_action(
	'init',
	function () {
		if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
			return;
		}

		if ( ! isset( $_POST['cpms_demo_submit'] ) ) {
			return;
		}

		global $cpms_demo_form_state;

		$is_ajax = (
			( defined( 'DOING_AJAX' ) && DOING_AJAX ) ||
			isset( $_POST['cpms_ajax'] ) ||
			( isset( $_SERVER['HTTP_X_REQUESTED_WITH'] ) && 'xmlhttprequest' === strtolower( sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_REQUESTED_WITH'] ) ) ) )
		);

		// CSRF nonce verification
		$nonce = isset( $_POST['cpms_demo_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['cpms_demo_nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'cpms_demo_form_action' ) ) {
			if ( $is_ajax ) {
				wp_send_json_error(
					array(
						'code'    => 'invalid_nonce',
						'message' => 'اعتبارسنجی امنیتی نامعتبر بود. لطفاً صفحه را تازه‌سازی فرمایید.',
					),
					403
				);
			}

			$cpms_demo_form_state = array(
				'submitted'  => true,
				'is_success' => false,
				'errors'     => array( 'global' => 'اعتبارسنجی امنیتی نامعتبر بود. لطفاً صفحه را تازه‌سازی فرمایید.' ),
				'values'     => array(),
			);
			return;
		}

		// Validate submission
		$raw_data = wp_unslash( $_POST );
		$result   = cpms_validate_demo_form_submission( $raw_data );

		if ( ! $result['valid'] ) {
			if ( $is_ajax ) {
				wp_send_json_error(
					array(
						'errors'  => $result['errors'],
						'message' => 'لطفاً خطاهای مشخص‌شده در فرم را بررسی و برطرف فرمایید.',
					),
					400
				);
			}

			$cpms_demo_form_state = array(
				'submitted'  => true,
				'is_success' => false,
				'errors'     => $result['errors'],
				'values'     => $result['values'],
			);
			return;
		}

		// SAFE NON-LIVE MODE:
		// Product owner has not authorized live email delivery, CRM, or external endpoints.
		// DO NOT send email (wp_mail is NOT called).
		// DO NOT insert payload into database (wp_posts / wp_options / wpdb are NOT touched).
		// DO NOT log payload (error_log is NOT called).
		$safe_non_live_message = 'درخواست آزمایشی شما با موفقیت بررسی شد. با توجه به وضعیت پیش‌نمایش فنی سایت، تحویل زندهٔ لیدها به ایمیل یا CRM هنوز فعال نشده و هیچ داده‌ای ذخیره یا ارسال نگردید. پس از اتصال نهایی کانال رسمی ارتباطی، درخواست‌های واقعی دریافت خواهند شد.';

		if ( $is_ajax ) {
			wp_send_json_success(
				array(
					'message'  => $safe_non_live_message,
					'non_live' => true,
					'stored'   => false,
				)
			);
		}

		$cpms_demo_form_state = array(
			'submitted'  => true,
			'is_success' => true,
			'errors'     => array(),
			'values'     => array(), // Reset values on success
		);
	}
);

/**
 * Render the qualification form shortcode [cpms_demo_form].
 *
 * Accessible, semantic HTML with explicit labels, aria attributes,
 * non-live notice, and privacy guidance.
 *
 * @return string HTML output.
 */
function cpms_render_demo_form() {
	global $cpms_demo_form_state;

	$schema     = cpms_get_demo_form_schema();
	$errors     = $cpms_demo_form_state['errors'] ?? array();
	$values     = $cpms_demo_form_state['values'] ?? array();
	$is_success = ! empty( $cpms_demo_form_state['is_success'] );

	ob_start();
	?>
	<div class="cpms-demo-form-wrapper" id="cpms-demo-form-wrapper">

		<!-- Technical Preview Notice: Safe Non-Live Mode -->
		<div class="cpms-demo-banner cpms-demo-banner--info" id="cpms-non-live-banner" role="note" aria-label="وضعیت ارسال فرم">
			<p class="cpms-demo-banner__title"><strong>حالت پیش‌نمایش فنی (غیرعملیاتی)</strong></p>
			<p class="cpms-demo-banner__desc">تحویل زندهٔ لیدها به ایمیل، CRM یا مقصد بیرونی هنوز فعال نشده است. این فرم برای ارزیابی تجربهٔ کاربری و واجدالشرایط‌سازی طراحی شده و در این نسخه هیچ داده‌ای ذخیره یا ارسال نمی‌شود.</p>
		</div>

		<!-- Data Privacy Notice: Strictly No Patient Data -->
		<div class="cpms-demo-banner cpms-demo-banner--privacy" id="cpms-privacy-banner" role="note" aria-label="راهنمای حریم خصوصی">
			<p class="cpms-demo-banner__title"><strong>عدم ثبت اطلاعات بیماران و پرونده‌های درمانی</strong></p>
			<p class="cpms-demo-banner__desc">لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید. این جلسه صرفاً برای ارزیابی تناسب عملیاتی، هماهنگی پذیرش و گردش کار مرکز است.</p>
		</div>

		<?php if ( ! empty( $errors ) ) : ?>
			<div class="cpms-form-notice cpms-form-notice--error" id="cpms-form-error-summary" role="alert" tabindex="-1">
				<p class="cpms-form-notice__title"><strong>لطفاً خطاهای مشخص‌شده در فرم را اصلاح فرمایید:</strong></p>
				<ul class="cpms-form-notice__list">
					<?php foreach ( $errors as $field => $err ) : ?>
						<li><a href="#cpms-field-<?php echo esc_attr( $field ); ?>"><?php echo esc_html( $err ); ?></a></li>
					<?php endforeach; ?>
				</ul>
			</div>
		<?php endif; ?>

		<?php if ( $is_success ) : ?>
			<div class="cpms-form-notice cpms-form-notice--success" id="cpms-form-success-notice" role="status" aria-live="polite" tabindex="-1">
				<p class="cpms-form-notice__title"><strong>درخواست آزمایشی شما با موفقیت بررسی شد</strong></p>
				<p class="cpms-form-notice__desc">با توجه به وضعیت پیش‌نمایش فنی سایت، تحویل زندهٔ لیدها به ایمیل یا CRM هنوز فعال نشده و هیچ داده‌ای ذخیره یا ارسال نگردید. پس از اتصال نهایی کانال رسمی ارتباطی، درخواست‌های واقعی دریافت خواهند شد.</p>
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

			<!-- Submit Button & Calm Disclaimer -->
			<div class="cpms-form-actions">
				<button type="submit" id="cpms-submit-btn" name="cpms_submit_btn" class="cpms-form-submit-button">
					ثبت درخواست مشاوره / دمو
				</button>
				<p class="cpms-form-disclaimer">ارسال این فرم تعهد مالی یا خرید ایجاد نمی‌کند.</p>
			</div>
		</form>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'cpms_demo_form', 'cpms_render_demo_form' );
