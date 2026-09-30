/**
 * Canonical authoring recipe for the CPMS Website Terms utility page.
 * «شرایط استفاده» (/terms/)
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
 * This page states conservative, website-focused usage boundaries for the CPMS
 * marketing and sales website: informational/marketing purpose, demo requests
 * not constituting an instant purchase or commercial contract, absence of
 * public fixed pricing, product descriptions subject to final verification and
 * current offering, absence of medical advice, prohibition on submitting
 * patient/medical data through the demo form, no guarantee of uninterrupted
 * website availability, and generic non-fabricated intellectual property and
 * link boundaries.
 */

export const termsBoundaryItems = [
  {
    id: 'informational-purpose',
    title: 'ماهیت معرفی و اطلاع‌رسانی وب‌سایت',
    description: 'این وب‌سایت صرفاً برای معرفی عمومی سامانهٔ نرم‌افزاری مدیریت کلینیک و مطب (<bdi>CPMS</bdi>)، تشریح ماژول‌های کلی و دریافت درخواست جلسات دمو و مشاوره طراحی شده است و محیط کاربری خود نرم‌افزار درمانی محسوب نمی‌شود.',
  },
  {
    id: 'no-instant-contract',
    title: 'عدم ایجاد خرید آنی یا قرارداد تجاری با ثبت فرم دمو',
    description: 'ارسال فرم درخواست دمو و مشاوره صرفاً به معنای ابراز تمایل برای گفت‌وگوی مقدماتی و بررسی تناسب عملیاتی است و به‌خودی‌خود تعهد فروش، اشتراک فعال، حساب کاربری یا قرارداد تجاری میان بازدیدکننده و ارائه‌دهنده ایجاد نمی‌کند.',
  },
  {
    id: 'no-public-fixed-pricing',
    title: 'عدم انتشار جدول قیمت ثابت عمومی',
    description: 'در حال حاضر هیچ جدول قیمت ثابت، پلن خرید آنلاین یا درگاه پرداختی در این وب‌سایت منتشر نشده است. برآورد دامنهٔ پیاده‌سازی و شرایط همکاری پس از شناخت ساختار کلینیک، تعداد پزشکان و ماژول‌های مورد نیاز در جلسهٔ معرفی بررسی می‌شود.',
  },
  {
    id: 'product-descriptions-verification',
    title: 'مبنای نهایی قابلیت‌ها و دامنهٔ فعلی محصول',
    description: 'توضیحات، تصاویر مفهومی و فهرست قابلیت‌های مطرح‌شده در صفحات وب‌سایت جنبهٔ معرفی کلی دارند و پیوسته متناسب با وضعیت فعلی محصول بازنگری می‌شوند؛ معیار نهایی قابلیت‌های قابل تحویل، بررسی مستقیم در جلسهٔ دمو و توافق مکتوب نهایی خواهد بود.',
  },
];

export function termsPage(t) {
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
        eyebrow('شرایط استفاده از وب‌سایت'),
        heading('شرایط استفاده از وب‌سایت معرفی و فروش CPMS', 'h1'),
        text('این صفحه چارچوب عمومی بازدید از وب‌سایت معرفی <bdi>CPMS</bdi> و ثبت فرم درخواست دمو و مشاوره را بیان می‌کند. مفاد زیر صرفاً مربوط به استفاده از همین وب‌سایت است و جایگزین توافق‌نامهٔ تجاری یا شرایط بهره‌برداری از خود نرم‌افزار در مراکز درمانی نمی‌شود.', 'lede'),
        text('متن حاضر به‌صورت محافظه‌کارانه و بر پایهٔ رفتار فعلی وب‌سایت تنظیم شده و پیش از انتشار عمومی نیازمند بازبینی حقوقی و تکمیل مشخصات ثبتی کسب‌وکار است.', 'body'),
        row('Hero actions', [
          button('درخواست دمو / مشاوره', '/demo/'),
          button('حریم خصوصی وب‌سایت', '/privacy/', false),
        ], { flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_gap: gap(12), flex_gap_mobile: gap(12), flex_wrap: 'wrap' }),
      ], { flex_gap: gap(20) }),
    ], { padding: box(40, 24), padding_mobile: box(28, 16) }),

    // 2. PURPOSE, DEMO REQUESTS, PRICING & PRODUCT DESCRIPTIONS
    band('Website purpose and commercial boundaries', 'website-scope', [
      readingColumn('Website scope copy', [
        eyebrow('دامنهٔ وب‌سایت و درخواست دمو'),
        heading('ماهیت اطلاع‌رسانی وب‌سایت، درخواست دمو و توضیحات محصول', 'h2'),
        text('بازدید از صفحات این وب‌سایت و استفاده از فرم <a href="/demo/">درخواست دمو و مشاوره</a> تابع مرزهای زیر است:'),
        container('Terms boundary list', termsBoundaryItems.map(b => item(b.title, b.description)), { flex_gap: gap(0) }),
      ], { flex_gap: gap(20) }),
    ], { background_background: 'classic', background_color: color('surface/card') }),

    // 3. NO MEDICAL ADVICE & NO PATIENT DATA IN DEMO FORM
    band('Medical disclaimer and form use rules', 'medical-and-data-boundary', [
      readingColumn('Medical and data boundary copy', [
        eyebrow('مرز درمانی و اطلاعاتی'),
        heading('عدم ارائهٔ مشاورهٔ پزشکی و ممنوعیت ارسال اطلاعات بیماران', 'h2'),
        text('محتوای این وب‌سایت صرفاً به معرفی ابزارهای نرم‌افزاری مدیریت نوبت، پذیرش، پروندهٔ کلینیکی و تسویهٔ مالی می‌پردازد و به هیچ عنوان توصیهٔ پزشکی، تشخیص درمانی یا راهنمای بالینی برای بیماران یا کادر درمان محسوب نمی‌شود.'),
        text('بازدیدکنندگان متعهدند در زمان تکمیل فرم درخواست دمو و مشاوره، تنها اطلاعات هماهنگی سازمانی کلینیک یا مطب را وارد کنند و از درج هرگونه اطلاعات هویتی، پرونده‌ای، کد ملی یا داده‌های پزشکی بیماران خودداری نمایند. جزئیات نحوهٔ برخورد با داده‌های فرم در صفحهٔ <a href="/privacy/">حریم خصوصی</a> درج شده است.'),
        boundaryNote('form-misuse-boundary', 'استفادهٔ خودکار، ارسال درخواست‌های انبوه یا آزمایش نفوذ بدون هماهنگی قبلی در فرم‌ها و مسیرهای این وب‌سایت مجاز نیست.'),
      ], { flex_gap: gap(16) }),
    ]),

    // 4. WEBSITE AVAILABILITY, IP & LINKS
    band('Availability and intellectual property', 'availability-and-ip', [
      readingColumn('Availability and IP copy', [
        eyebrow('دسترس‌پذیری و حقوق محتوا'),
        heading('دسترس‌پذیری وب‌سایت، حقوق مالکیت محتوا و پیوندها', 'h2'),
        text('این وب‌سایت بر پایهٔ وضعیت فعلی در دسترس قرار می‌گیرد و تضمینی برای دسترس‌پذیری بدون وقفه، نبود خطاهای فنی موقت یا سازگاری با تمامی مرورگرها و شبکه‌ها داده نمی‌شود. ساختار صفحات، متون معرفی و مسیرهای ارتباطی سایت ممکن است در جریان توسعه تغییر کنند یا متوقف شوند.'),
        text('ساختار متون، چیدمان صفحات و نشان‌های معرفی‌شده در این وب‌سایت متعلق به پروژهٔ <bdi>CPMS</bdi> و پدیدآورندگان آن است؛ بازنشر کامل صفحات یا استفادهٔ تجاری از محتوای سایت برای معرفی محصولات دیگر بدون کسب اجازه مجاز نیست، اما ارجاع متعارف برای بررسی داخلی در مرکز درمانی بلامانع است.'),
        text('این وب‌سایت در حالت عادی بازدیدکننده را به سرویس‌های تبلیغاتی یا درگاه‌های بیرونی هدایت نمی‌کند؛ در صورت وجود هرگونه پیوند به منابع بیرونی، مسئولیت محتوا و سیاست‌های آن منابع بر عهدهٔ گردانندگان خود آن‌هاست.', 'caption'),
      ], { flex_gap: gap(16) }),
    ], { background_background: 'classic', background_color: color('background/subtle') }),

    // 5. NEXT STEP / RELATED ROUTES
    band('Related routes', 'next-step', [
      readingColumn('Next-step panel', [
        eyebrow('مسیرهای مرتبط'),
        heading('مرور حریم خصوصی یا ثبت درخواست دمو', 'h2'),
        text('برای آگاهی از نحوهٔ برخورد با اطلاعات فرم دمو، صفحهٔ حریم خصوصی را مطالعه کنید یا برای هماهنگی جلسهٔ معرفی، به صفحهٔ دمو و مشاوره بروید.', 'lede'),
        row('Next-step actions', [
          button('درخواست دمو / مشاوره', '/demo/'),
          button('حریم خصوصی وب‌سایت', '/privacy/', false),
        ], { flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_gap: gap(12), flex_gap_mobile: gap(12), flex_wrap: 'wrap' }),
        text('برای آشنایی کلی با ماژول‌های سامانه، صفحهٔ <a href="/product-overview/">معرفی محصول</a> و برای پاسخ به پرسش‌های رایج، صفحهٔ <a href="/faq/">پرسش‌های متداول</a> در دسترس است.', 'caption'),
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
    ], { background_background: 'classic', background_color: color('surface/card') }),
  ];
}

export const pageIdentity = {
  title: 'شرایط استفاده از وب‌سایت | CPMS',
  slug: 'terms',
  description: 'چارچوب عمومی استفاده از وب‌سایت معرفی CPMS، ماهیت غیرقراردادی فرم درخواست دمو، عدم انتشار جدول قیمت ثابت، عدم ارائهٔ مشاورهٔ پزشکی و ممنوعیت درج اطلاعات بیماران.',
};
