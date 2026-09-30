/**
 * Canonical authoring recipe for the CPMS Privacy utility page.
 * «حریم خصوصی» (/privacy/)
 *
 * NOT Elementor database JSON and NOT a vendor export: the structure below is
 * passed one element at a time to the documented editor Create / Settings commands.
 * All visual settings are native Elementor Free controls; values come from accepted
 * design-system tokens. No Pro widget, no add-on pack, no custom CSS, no media
 * reservation, no badge/icon, no structured data.
 *
 * TARGET — NOT PUBLICATION-APPROVED.
 * LEGAL REVIEW REQUIRED BEFORE PUBLIC LAUNCH.
 * See claims.md and docs/PRODUCT-TRUTH.md.
 *
 * This page describes ONLY the current actual behavior of the CPMS marketing
 * and sales website: the six qualification fields on the Demo / Consultation
 * form, why they are requested, the strict prohibition on patient/medical
 * data, the absence of WordPress database persistence, the two-mode lead
 * delivery architecture (default OFF; when explicitly enabled by the
 * environment, plain-text mail-layer handoff toward the single authorized
 * recipient), the honest infrastructure/email-inbox caveat, the absence of
 * authorized analytics/advertising tracking or third-party CAPTCHA, and the
 * fact that no retention period has yet been approved.
 */

export const privacyFormFieldItems = [
  {
    field: 'cpms_contact_name',
    title: 'نام و نام خانوادگی پاسخ‌گو',
    description: 'نام پزشک، مدیر یا مسئول هماهنگی در کلینیک برای خطاب قرار دادن متقاضی در گفت‌وگوی معرفی.',
  },
  {
    field: 'cpms_org_name',
    title: 'نام مرکز درمانی یا مطب',
    description: 'نام کلینیک، درمانگاه، مرکز جراحی محدود یا مطب جهت شناخت زمینهٔ سازمانی درخواست.',
  },
  {
    field: 'cpms_contact_value',
    title: 'روش و شماره تماس یا ایمیل کاری',
    description: 'شماره تماس یا نشانی ایمیل کاری برای هماهنگی زمان جلسهٔ دمو و پاسخ‌گویی به همین درخواست.',
  },
  {
    field: 'cpms_org_type',
    title: 'نوع مرکز درمانی',
    description: 'ساختار کلی مرکز (کلینیک چندتخصصی، درمانگاه، مرکز جراحی محدود، مطب مستقل یا سایر مراکز درمانی).',
  },
  {
    field: 'cpms_doctor_count',
    title: 'تعداد تقریبی پزشکان همکار',
    description: 'بازهٔ تقریبی تعداد پزشکان فعال در مرکز برای شناخت مقیاس عملیاتی پیش از جلسه.',
  },
  {
    field: 'cpms_discussion_topic',
    title: 'موضوع یا اولویت گفت‌وگو (اختیاری)',
    description: 'توضیح کوتاه دربارهٔ جریان کار فعلی یا اولویت‌های مورد نظر در کلینیک، بدون درج هرگونه اطلاعات بیمار.',
  },
];

export function privacyPage(t) {
  const color = role => t.color.roles[role].value;
  const px = size => ({ unit: 'px', size, sizes: [] });
  const box = (vertical, horizontal = vertical) => ({
    unit: 'px',
    top: String(vertical),
    right: String(horizontal),
    bottom: String(vertical),
    left: String(horizontal),
    isLinked: vertical === horizontal,
  });
  const gap = size => ({ unit: 'px', row: String(size), column: String(size), isLinked: true });
  const type = (role, prefix = 'typography') => {
    const s = t.typography.scale[role];
    return {
      [`${prefix}_typography`]: 'custom',
      [`${prefix}_font_family`]: 'Vazirmatn',
      [`${prefix}_font_size`]: px(s.size_px),
      [`${prefix}_font_weight`]: String(s.weight),
      [`${prefix}_line_height`]: { unit: 'em', size: s.line_height, sizes: [] },
      ...(s.size_mobile_px ? { [`${prefix}_font_size_mobile`]: px(s.size_mobile_px) } : {}),
    };
  };
  const node = (kind, name, settings, children = []) => ({ kind, name, settings, children });
  const heading = (text, tag = 'h2', role = tag, extra = {}) => node('heading', text, {
    title: text,
    header_size: tag,
    title_color: color('ink/primary'),
    ...type(role),
    ...extra,
  });
  const text = (copy, role = 'body', extra = {}) => node('text-editor', copy.replace(/<[^>]*>/g, '').slice(0, 40), {
    editor: `<p>${copy}</p>`,
    text_color: color('ink/secondary'),
    ...type(role),
    _css_classes: role === 'caption' ? 'cpms-support' : 'cpms-reading',
    typography_font_size_mobile: px(role === 'caption' ? t.typography.scale['body-sm'].size_px : t.typography.scale.lede.size_mobile_px),
    typography_line_height_mobile: { unit: 'em', size: role === 'caption' ? 1.7 : t.typography.scale.body.line_height, sizes: [] },
    ...extra,
  });
  const container = (name, children, extra = {}) => node('container', name, {
    content_width: 'full',
    flex_direction: 'column',
    flex_gap: gap(16),
    padding: box(0),
    ...extra,
  }, children);
  const band = (name, id, children, extra = {}) => container(name, children, {
    html_tag: 'section',
    _element_id: id,
    content_width: 'boxed',
    boxed_width: px(t.container['content-default'].value_px),
    padding: box(48, 24),
    padding_mobile: box(32, 16),
    flex_gap: gap(24),
    ...extra,
  });
  const readingColumn = (name, children, extra = {}) => container(name, children, {
    content_width: 'boxed',
    boxed_width: px(t.container['content-narrow'].value_px),
    flex_gap: gap(24),
    ...extra,
  }, children);
  const row = (name, children, extra = {}) => container(name, children, {
    flex_direction: 'row',
    flex_direction_tablet: 'column',
    flex_gap: gap(24),
    flex_gap_mobile: gap(20),
    ...extra,
  });
  const button = (label, href, primary = true) => node('button', label, {
    text: label,
    link: { url: href, is_external: '', nofollow: '', custom_attributes: '' },
    align: 'right',
    ...type('body-sm'),
    button_text_color: color(primary ? 'accent/contrast-on-accent' : 'ink/primary'),
    background_color: color(primary ? 'accent/primary' : 'surface/card'),
    hover_color: color(primary ? 'accent/contrast-on-accent' : 'ink/primary'),
    button_background_hover_color: color(primary ? 'accent/hover' : 'background/subtle'),
    border_border: 'solid',
    border_width: box(1),
    border_color: color(primary ? 'accent/primary' : 'border/strong'),
    border_radius: box(t.border.radius.sm),
    text_padding: box(12, 24),
  });
  const eyebrow = (label, extra = {}) => heading(label, 'p', 'body-sm', { title_color: color('accent/primary'), ...extra });
  const item = (title, copy) => container(title, [heading(title, 'h3', 'h3'), text(copy)], {
    flex_gap: gap(8),
    padding: box(16, 0),
    border_border: 'solid',
    border_width: { ...box(0), bottom: '1', isLinked: false },
    border_color: color('border/subtle'),
  });
  const boundaryNote = (id, copy) => container('Explicit boundary note', [text(copy, 'caption')], {
    _element_id: id,
    padding: box(16),
    background_background: 'classic',
    background_color: color('background/subtle'),
    border_border: 'solid',
    border_width: { ...box(0), right: '2', isLinked: false },
    border_color: color('accent/primary'),
    border_radius: box(t.border.radius.sm),
  });

  return [
    band('Internal design and legal review notice', 'review-notice', [
      text('پیش‌نمایش طراحی · متن این صفحه پیش از انتشار عمومی نیازمند بازبینی و تأیید حقوقی است.', 'caption'),
    ], {
      html_tag: 'aside',
      padding: box(8, 24),
      padding_mobile: box(8, 16),
      background_background: 'classic',
      background_color: color('background/subtle'),
    }),

    // 1. HERO / INTRODUCTION
    band('Hero', 'introduction', [
      readingColumn('Hero copy', [
        eyebrow('حریم خصوصی وب‌سایت'),
        heading('حریم خصوصی و نحوهٔ برخورد با اطلاعات در وب‌سایت CPMS', 'h1'),
        text('این صفحه توضیح می‌دهد وب‌سایت معرفی و فروش <bdi>CPMS</bdi> در وضعیت فعلی چه اطلاعاتی را در فرم درخواست دمو و مشاوره دریافت می‌کند، چرا این اطلاعات درخواست می‌شود و مرزهای فنی پردازش آن چیست.', 'lede'),
        text('دامنهٔ این صفحه صرفاً رفتار فعلی همین وب‌سایت معرفی است و جایگزین ضوابط بهره‌برداری از خود نرم‌افزار در محیط مراکز درمانی نمی‌شود. متن حاضر پیش از راه‌اندازی عمومی نیازمند بازبینی نهایی حقوقی و تکمیل مشخصات ثبتی کسب‌وکار است.', 'body'),
        row('Hero actions', [
          button('درخواست دمو / مشاوره', '/demo/'),
          button('شرایط استفاده از وب‌سایت', '/terms/', false),
        ], { flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_gap: gap(12), flex_gap_mobile: gap(12), flex_wrap: 'wrap' }),
      ], { flex_gap: gap(20) }),
    ], { padding: box(40, 24), padding_mobile: box(28, 16) }),

    // 2. REQUESTED INFORMATION & PURPOSE
    band('Requested information and purpose', 'collected-data', [
      readingColumn('Collected data copy', [
        eyebrow('اطلاعات فرم دمو'),
        heading('چه اطلاعاتی در فرم درخواست دمو دریافت می‌شود و چرا؟', 'h2'),
        text('این وب‌سایت فاقد حساب کاربری عمومی، بخش خرید آنلاین یا درگاه پرداخت است. تنها مسیر دریافت اطلاعات از بازدیدکننده، فرم صفحهٔ <a href="/demo/">درخواست دمو و مشاوره</a> است که صرفاً برای ارزیابی اولیهٔ تناسب عملیاتی و پاسخ‌گویی به درخواست دمو یا مشاوره (در زمان فعال‌بودن تحویل زنده در محیط عملیاتی) طراحی شده است.'),
        container('Form field list', privacyFormFieldItems.map(f => item(f.title, f.description)), { flex_gap: gap(0) }),
        boundaryNote('purpose-boundary', 'درخواست‌های حاوی فیلدهای خارج از فهرست مجاز بالا توسط سرور رد می‌شوند. اطلاعات واردشده تنها برای بررسی و پاسخ‌گویی به همان درخواست مشاوره و دمو به کار می‌رود.'),
      ], { flex_gap: gap(20) }),
    ], { background_background: 'classic', background_color: color('surface/card') }),

    // 3. STRICT PROHIBITION ON PATIENT / MEDICAL DATA
    band('Prohibition on patient and medical data', 'no-patient-data', [
      readingColumn('No patient data copy', [
        eyebrow('ممنوعیت داده‌های درمانی'),
        heading('ممنوعیت وارد کردن اطلاعات بیماران و داده‌های پزشکی', 'h2'),
        text('لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید. فرم درخواست دمو برای دریافت نام بیماران، کد ملی، شماره پرونده، شرح حال، تشخیص پزشکی، نسخه‌ها، اسکن مدارک بالینی یا اطلاعات بیمه در نظر گرفته نشده است.'),
        text('در سمت سرور یک بررسی کمکی برای جلوگیری از ثبت رشته‌های دهگانهٔ عددی مشابه کد ملی اجرا می‌شود؛ اما این بررسی صرفاً یک لایهٔ احتیاطی است و مسئولیت خودداری از ارسال هرگونه دادهٔ هویتی یا درمانی بیماران بر عهدهٔ تکمیل‌کنندهٔ فرم است.', 'caption'),
      ], { flex_gap: gap(16) }),
    ]),

    // 4. NO WORDPRESS DB PERSISTENCE & MAIL-LAYER HANDOFF ARCHITECTURE
    band('Storage and delivery architecture', 'delivery-and-storage', [
      readingColumn('Delivery and storage copy', [
        eyebrow('نگهداری و مسیر فنی تحویل'),
        heading('عدم ذخیره‌سازی در پایگاه‌دادهٔ وردپرس و نحوهٔ تحویل ایمیلی', 'h2'),
        text('در پیاده‌سازی فعلی وب‌سایت، اطلاعات ارسالی فرم درخواست دمو در پایگاه‌دادهٔ وردپرس (از جمله جداول نوشته‌ها، متا یا تنظیمات) و در فایل‌های لاگ برنامه ذخیره نمی‌شود. در حالت پیش‌فرض توسعه و پیش‌نمایش فنی نیز تحویل زندهٔ درخواست‌ها غیرفعال است و هیچ داده‌ای به بیرون ارسال نمی‌گردد.'),
        text('تنها زمانی که تحویل زنده در محیط عملیاتی به‌صورت صریح فعال شده باشد، اطلاعات بررسی‌شدهٔ فرم در قالب یک پیام متنی ساده به لایهٔ ارسال ایمیل پیکربندی‌شدهٔ وردپرس تحویل داده می‌شود تا به نشانی دریافت‌کنندهٔ مجاز درخواست‌های دمو (<bdi>biatoweb@gmail.com</bdi>) ارسال گردد. اگر متقاضی در فیلد تماس یک نشانی ایمیل معتبر وارد کرده باشد، همان نشانی صرفاً به‌عنوان سرخط پاسخ در پیام قرار می‌گیرد.'),
        boundaryNote('infrastructure-boundary', 'توجه مهم دربارهٔ زیرساخت و صندوق ایمیل: عدم ذخیره‌سازی در پایگاه‌دادهٔ وردپرس به این معنا نیست که داده‌ها در هیچ نقطه‌ای از مسیر فنی پردازش یا نگهداری نمی‌شوند. زیرساخت میزبانی وب‌سایت، سرویس انتقال ایمیل محیط عملیاتی و صندوق پستی دریافت‌کننده ممکن است در جریان عادی ارائهٔ خدمات وب و انتقال یا دریافت پیام، داده‌های ارتباطی و محتوای درخواست را پردازش یا در صندوق پستی نگهداری کنند. همچنین پذیرش پیام در لایهٔ ارسال ایمیل سایت به‌منزلهٔ تضمین تحویل نهایی به صندوق ورودی یا تضمین زمان پاسخ‌گویی نیست.'),
      ], { flex_gap: gap(16) }),
    ], { background_background: 'classic', background_color: color('background/subtle') }),

    // 5. ANALYTICS, ADVERTISING PIXELS & ANTI-SPAM BOUNDARY
    band('Analytics and tracking status', 'tracking-and-scripts', [
      readingColumn('Tracking status copy', [
        eyebrow('ردیابی و سرویس‌های بیرونی'),
        heading('وضعیت ابزارهای تحلیل، پیکسل‌های تبلیغاتی و سرویس‌های ضداسپم', 'h2'),
        text('در وضعیت فعلی وب‌سایت، هیچ ابزار تحلیل رفتار بازدیدکنندگان، تگ‌منیجر یا پیکسل تبلیغاتی و بازاریابی مجوز نصب نگرفته و در سایت فعال نیست. فونت فارسی سایت نیز به‌صورت محلی از همین سرور بارگذاری می‌شود تا درخواست فونتی به سرویس‌های بیرونی ارسال نشود.'),
        text('برای محافظت پایهٔ فرم در برابر ارسال‌های خودکار، تنها از یک فیلد مخفی داخلی در خود فرم استفاده شده و هیچ سرویس کپچای خارجی یا ضداسپم شخص ثالث در سایت فعال نیست. هرگونه تغییر احتمالی در آینده منوط به تصمیم جداگانه و به‌روزرسانی همین صفحه خواهد بود.'),
      ], { flex_gap: gap(16) }),
    ], { background_background: 'classic', background_color: color('surface/card') }),

    // 6. RETENTION, SECURITY DISCLAIMER & CONTACT BOUNDARY
    band('Retention and contact boundary', 'retention-and-contact', [
      readingColumn('Retention and contact copy', [
        eyebrow('مدت نگهداری و ارتباط'),
        heading('مدت نگهداری اطلاعات، مرزهای امنیتی و پرسش‌های حریم خصوصی', 'h2'),
        text('دورهٔ زمانی مشخص برای نگهداری یا حذف پیام‌های دریافتی در صندوق ایمیل هنوز به‌صورت سیاست مصوب تعیین نشده است؛ از این رو در این صفحه هیچ بازهٔ زمانی ساختگی یا وعدهٔ حذف خودکار در مهلت معین اعلام نمی‌شود و تعیین تکلیف آن پیش از انتشار عمومی انجام خواهد شد.'),
        text('با وجود به‌کارگیری اعتبارسنجی سمت سرور، بررسی امنیتی درخواست و محدودسازی فیلدهای فرم، در این وب‌سایت هیچ ادعایی دربارهٔ امنیت مطلق، محرمانگی تضمین‌شده یا انطباق با قوانین و استانداردهای خاص مطرح نمی‌شود.'),
        text('نشانی <bdi>biatoweb@gmail.com</bdi> به‌عنوان دریافت‌کنندهٔ مجاز درخواست‌های دمو و مشاوره تعیین شده است و در صورت فعال‌بودن کانال ارتباطی، پرسش‌های مرتبط با اطلاعات ارسال‌شده در فرم دمو نیز از همین طریق قابل طرح است. نام ثبتی شخصیت حقوقی، نشانی پستی و جزئیات تماس رسمی پیش از انتشار عمومی تکمیل و جایگزین خواهند شد.', 'caption'),
      ], { flex_gap: gap(16) }),
    ]),

    // 7. NEXT STEP / RELATED ROUTES
    band('Related routes', 'next-step', [
      readingColumn('Next-step panel', [
        eyebrow('مسیرهای مرتبط'),
        heading('مرور شرایط استفاده یا بازگشت به صفحهٔ دمو', 'h2'),
        text('برای آشنایی با چارچوب عمومی استفاده از سایت، صفحهٔ شرایط استفاده را ببینید یا برای ثبت درخواست معرفی، به صفحهٔ دمو و مشاوره بازگردید.', 'lede'),
        row('Next-step actions', [
          button('درخواست دمو / مشاوره', '/demo/'),
          button('شرایط استفاده از وب‌سایت', '/terms/', false),
        ], { flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_gap: gap(12), flex_gap_mobile: gap(12), flex_wrap: 'wrap' }),
        text('برای آگاهی از سازوکارهای تفکیک دسترسی درون محصول، صفحهٔ <a href="/security-data-access/">امنیت و دسترسی به داده</a> و برای پرسش‌های پیش از جلسه، صفحهٔ <a href="/faq/">پرسش‌های متداول</a> در دسترس است.', 'caption'),
      ], {
        flex_gap: gap(20),
        padding: box(32),
        padding_mobile: box(24, 16),
        background_background: 'classic',
        background_color: color('surface/card'),
        border_border: 'solid',
        border_width: { ...box(0), top: '2', isLinked: false },
        border_color: color('accent/primary'),
      }),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
  ];
}

export const pageIdentity = {
  title: 'حریم خصوصی وب‌سایت | CPMS',
  slug: 'privacy',
  description: 'توضیح شفاف نحوهٔ برخورد وب‌سایت معرفی CPMS با اطلاعات فرم درخواست دمو و مشاوره، ممنوعیت درج داده‌های پزشکی بیماران و وضعیت فعلی تحویل پیام و ابزارهای ردیابی.',
};
