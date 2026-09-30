/**
 * Canonical authoring recipe for CPMS Demo / Consultation conversion page.
 * TARGET — NOT PUBLICATION-APPROVED. See claims.md and PRODUCT-TRUTH.md.
 * Native Elementor Free controls only, values resolved from canonical tokens.
 */
export function demoPage(t) {
  const color = role => t.color.roles[role].value;
  const px = size => ({ unit: 'px', size, sizes: [] });
  const box = (vertical, horizontal = vertical) => ({ unit: 'px', top: String(vertical), right: String(horizontal), bottom: String(vertical), left: String(horizontal), isLinked: vertical === horizontal });
  const gap = size => ({ unit: 'px', row: String(size), column: String(size), isLinked: true });
  const type = (role, prefix = 'typography') => {
    const s = t.typography.scale[role];
    return {
      [`${prefix}_typography`]: 'custom', [`${prefix}_font_family`]: 'Vazirmatn',
      [`${prefix}_font_size`]: px(s.size_px), [`${prefix}_font_weight`]: String(s.weight),
      [`${prefix}_line_height`]: { unit: 'em', size: s.line_height, sizes: [] },
      ...(s.size_mobile_px ? { [`${prefix}_font_size_mobile`]: px(s.size_mobile_px) } : {}),
    };
  };
  const node = (kind, name, settings, children = []) => ({ kind, name, settings, children });
  const heading = (text, tag = 'h2', role = tag, extra = {}) => node('heading', text, {
    title: text, header_size: tag, title_color: color('ink/primary'), ...type(role), ...extra,
  });
  const text = (copy, role = 'body', extra = {}) => node('text-editor', copy.replace(/<[^>]*>/g, '').slice(0, 40), {
    editor: `<p>${copy}</p>`, text_color: color('ink/secondary'), ...type(role),
    _css_classes: role === 'caption' ? 'cpms-support' : 'cpms-reading',
    typography_font_size_mobile: px(role === 'caption' ? t.typography.scale['body-sm'].size_px : t.typography.scale.lede.size_mobile_px),
    typography_line_height_mobile: { unit: 'em', size: role === 'caption' ? 1.7 : t.typography.scale.body.line_height, sizes: [] },
    ...extra,
  });
  const container = (name, children, extra = {}) => node('container', name, {
    content_width: 'full', flex_direction: 'column', flex_gap: gap(16), padding: box(0), ...extra,
  }, children);
  const band = (name, id, children, extra = {}) => container(name, children, {
    html_tag: 'section', _element_id: id, content_width: 'boxed', boxed_width: px(t.container['content-default'].value_px),
    padding: box(48, 24), padding_mobile: box(32, 16), flex_gap: gap(24), ...extra,
  });
  const row = (name, children, extra = {}) => container(name, children, {
    flex_direction: 'row', flex_direction_tablet: 'column', flex_gap: gap(24), flex_gap_mobile: gap(20), ...extra,
  });
  const button = (label, href, primary = true) => node('button', label, {
    text: label, link: { url: href, is_external: '', nofollow: '', custom_attributes: '' },
    align: 'right', ...type('body-sm'), button_text_color: color(primary ? 'accent/contrast-on-accent' : 'ink/primary'),
    background_color: color(primary ? 'accent/primary' : 'surface/card'),
    hover_color: color(primary ? 'accent/contrast-on-accent' : 'ink/primary'),
    button_background_hover_color: color(primary ? 'accent/hover' : 'background/subtle'),
    border_border: 'solid', border_width: box(1), border_color: color(primary ? 'accent/primary' : 'border/strong'),
    border_radius: box(t.border.radius.sm), text_padding: box(12, 24),
  });
  const eyebrow = (label, extra = {}) => heading(label, 'p', 'body-sm', { title_color: color('accent/primary'), ...extra });
  const width = size => ({ unit: '%', size });
  const column = (name, children, size, extra = {}) => container(name, children, { width: width(size), width_tablet: width(100), ...extra });
  const item = (title, copy) => container(title, [heading(title, 'h3', 'h3'), text(copy)], {
    flex_gap: gap(8), padding: box(16, 0), border_border: 'solid', border_width: { ...box(0), bottom: '1', isLinked: false }, border_color: color('border/subtle'),
  });
  const card = (id, title, copy, tagText = '') => container(title, [
    ...(tagText ? [eyebrow(tagText)] : []),
    heading(title, 'h3', 'h3'),
    text(copy),
  ], {
    html_tag: 'article', _element_id: id, flex_gap: gap(12), padding: box(24), padding_mobile: box(20, 16),
    background_background: 'classic', background_color: color('surface/card'),
    border_border: 'solid', border_width: box(1), border_color: color('border/subtle'),
    border_radius: box(t.border.radius.sm),
  });

  return [
    // Pre-release technical notice
    band('Internal design review notice', 'review-notice', [
      text('پیش‌نمایش طراحی · فرآیند تبدیل و فرم دمو در حالت آزمایشی غیرعملیاتی قرار دارد.', 'caption'),
    ], {
      html_tag: 'aside', padding: box(8, 24), padding_mobile: box(8, 16),
      background_background: 'classic', background_color: color('background/subtle'),
    }),

    // Section 1: Hero
    band('Hero', 'hero', [
      container('Hero content container', [
        eyebrow('درخواست دمو و مشاوره CPMS'),
        heading('بررسی تناسب CPMS با جریان کار کلینیک شما', 'h1'),
        text('یک گفت‌وگوی ساختاریافته برای مدیران و پزشکان کلینیک؛ بدون تعهد خرید آنی، برای بررسی جریان‌های پذیرش، پرونده، ویزیت و نیازهای هماهنگی مجموعه.', 'lede'),
        row('Hero actions', [
          button('تکمیل فرم درخواست دمو', '#qualification-form', true),
          button('شرایط و مخاطبان جلسه', '#who-is-this-for', false),
        ], { flex_gap: gap(12), flex_gap_mobile: gap(12), flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_wrap: 'wrap' }),
        text('جلسهٔ مشاوره برای بررسی دقیق نیازهای عملیاتی کلینیک برگزار می‌شود؛ نه صرفاً معرفی عمومی.', 'caption'),
      ], { flex_gap: gap(16) }),
    ]),

    // Section 2: Who this is for
    band('Who this is for', 'who-is-this-for', [
      eyebrow('مخاطبان هدف'),
      heading('این جلسه برای چه مراکزی بیشترین ارزش را دارد؟', 'h2'),
      text('جلسهٔ مشاوره و دمو زمانی مفیدتر است که کلینیک با چالش‌های واقعی هماهنگی میان نوبت، پذیرش و ویزیت مواجه باشد:'),
      row('Target segments', [
        column('Multi-doctor clinics', [
          card('fit-multi-doctor', 'کلینیک‌ها و درمانگاه‌های چندپزشکی', 'مراکزی که چندین پزشک و پرسنل پذیرش دارند و نیازمند هماهنگی نوبت‌ها، تفکیک دسترسی‌ها و مدیریت پرونده‌ها در چند شیفت هستند.', 'مخاطب اصلی'),
        ], 33.3),
        column('High-volume centers', [
          card('fit-high-volume', 'مراکز تخصصی با حجم مراجعان بالا', 'مراکزی که نیازمند کاهش زمان معطلی پذیرش، ثبت سریع اطلاعات ویزیت و گردش منظم مستندات درمانی مراجعان هستند.', 'نیاز عملیاتی'),
        ], 33.3),
        column('Clinic managers', [
          card('fit-managers', 'مدیران و تصمیم‌گیرندگان کلینیک', 'مسئولانی که می‌خواهند از انطباق نرم‌افزار با اختیارات کادر درمانی و جریان‌های واقعی مرکز مطمئن شوند.', 'ارزیابی ساختار'),
        ], 33.3),
      ]),
      text('مطب‌های مستقل تک‌پزشک نیز در صورت تمایل به ساماندهی نوبت و پرونده می‌توانند برای ارزیابی اولیه در جلسه شرکت کنند.', 'caption'),
    ], { background_background: 'classic', background_color: color('surface/card') }),

    // Section 3: What we will discuss
    band('What we will discuss', 'what-we-discuss', [
      eyebrow('محورهای گفت‌وگو'),
      heading('در جلسهٔ دمو و مشاوره چه مواردی بررسی می‌شود؟', 'h2'),
      text('جلسه حول چهار محور شفاف و عملیاتی بدون وعده‌های پشتیبانی یا راه‌اندازی زودهنگام شکل می‌گیرد:'),
      container('Discussion topics', [
        item('ارزیابی وضعیت و جریان کار فعلی کلینیک', 'بررسی نحوهٔ فعلی نوبت‌دهی، ورود بیمار، تشکیل پرونده و ثبت مراجعات در مرکز شما.'),
        item('بررسی انطباق قابلیت‌های CPMS با نیاز مرکز', 'نمایش زنجیرهٔ ارتباط میان پذیرش، پرونده، فضای کار پزشک و ثبت ویزیت بر اساس سناریوی کاری شما.'),
        item('تفکیک نقش‌ها، اختیارات و حریم داده‌ها', 'ارزیابی دامنهٔ دسترسی پرسنل پذیرش و پزشکان به اطلاعات پرونده‌ها جهت تفکیک حریم داده‌ها.'),
        item('بررسی الزامات فنی و گام‌های بعدی', 'بررسی نیازمندی‌های سخت‌افزاری، آموزش پرسنل و نحوهٔ استقرار بدون ایجاد تعهد یا فشار زودهنگام فروش.'),
      ], { flex_gap: gap(0) }),
      text('هدف این جلسه، ارزیابی دوطرفهٔ تناسب است؛ هیچ تعهد خرید فوری یا وعدهٔ استقرار خودکار داده نمی‌شود.', 'caption'),
    ]),

    // Section 4: Qualification Form
    band('Qualification Form', 'qualification-form', [
      container('Form intro', [
        eyebrow('فرم درخواست مشاوره'),
        heading('اطلاعات لازم برای هماهنگی جلسهٔ دمو', 'h2'),
        text('برای آن‌که جلسهٔ مشاوره متناسب با ساختار و اولویت‌های مرکز شما تنظیم شود، تکمیل اطلاعات پایهٔ زیر کافی است:'),
      ], { flex_gap: gap(8) }),
      node('text-editor', 'Qualification Form Widget', {
        editor: '[cpms_demo_form]',
        _element_id: 'qualification-form-widget',
      }),
      text('اگر مسیر فرم برای شما مناسب نیست، از صفحهٔ <a href="/contact/">تماس با ما</a> استفاده کنید.', 'caption'),
    ], { background_background: 'classic', background_color: color('background/subtle') }),

    // Section 5: Privacy / Data Guidance
    band('Privacy and Data Guidance', 'privacy-guidance', [
      eyebrow('حفظ حریم خصوصی'),
      heading('عدم دریافت اطلاعات بیماران و پرونده‌های درمانی', 'h2'),
      text('اصول زیر در تمام مراحل درخواست مشاوره و جلسهٔ دمو رعایت می‌شود:'),
      row('Privacy pillars', [
        column('No medical data', [
          card('privacy-no-phi', 'عدم ارسال داده‌های پزشکی', 'لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید. به هیچ وجه نیازی به نام بیماران، کدهای ملی یا مدارک بالینی نیست.', 'اصل عدم دریافت PHI'),
        ], 33.3),
        column('Synthetic data only', [
          card('privacy-synthetic', 'نمایش نرم‌افزار با داده‌های فرضی', 'تمامی جریان‌های کاری نرم‌افزار در جلسه با استفاده از اطلاعات نمایشی و سناریوهای ساختگی مرور خواهد شد.', 'محیط آزمایشی'),
        ], 33.3),
        column('Scope of form data', [
          card('privacy-security', 'محدودهٔ داده‌های این فرم', 'اطلاعات این فرم صرفاً برای هماهنگی زمان تماس و شناخت کلی از مقیاس مرکز درمانی مورد استفاده قرار می‌گیرد.', 'دامنهٔ ارتباطی'),
        ], 33.3),
      ]),
    ], { background_background: 'classic', background_color: color('surface/card') }),

    // Section 6: FAQ / Reassurance
    band('FAQ and Reassurance', 'faq', [
      eyebrow('پرسش‌های متداول'),
      heading('پاسخ به سؤالات متداول پیش از ثبت درخواست', 'h2'),
      container('FAQ list', [
        item('آیا ثبت این درخواست هزینه‌ای دارد یا خرید قطعی محسوب می‌شود؟', 'خیر. این درخواست صرفاً برای گفت‌وگوی مشاوره‌ای و ارزیابی تناسب است؛ هیچ هزینه، ثبت‌نام آنی، خرید یا تعهد مالی برای شما ایجاد نمی‌کند.'),
        item('آیا نیاز است اطلاعات پرونده یا بیماران را ارسال کنیم؟', 'خیر. لطفاً هیچ‌گونه اطلاعات بیمار، شماره پرونده یا سوابق پزشکی ارسال نفرمایید. جلسه تنها با داده‌های فرضی انجام می‌شود.'),
        item('آیا امکان مشاهدهٔ محیط واقعی نرم‌افزار وجود دارد؟', 'بله. در جلسهٔ آنلاین، محیط کاربری CPMS و چگونگی ارتباط نوبت‌دهی، پرونده و فضای کار پزشک به شکل عملی مرور خواهد شد.'),
        item('آیا قیمت قطعی نرم‌افزار در این صفحه مشخص می‌شود؟', 'خیر. برآورد شرایط مالی پس از بررسی ابعاد مرکز، تعداد پزشکان و نیازهای جریان کار در گفت‌وگوی مشاوره‌ای مطرح می‌گردد.'),
      ], { flex_gap: gap(0) }),
    ]),

    // Section 7: Final Supporting CTA / Return Path
    band('Final Supporting CTA and Return Path', 'return-path', [
      eyebrow('مسیرهای تکمیلی'),
      heading('بررسی بیشتر پیش از تصمیم‌گیری', 'h2'),
      text('اگر مایلید پیش از ثبت درخواست، ساختار محصول و منطق پیوند نوبت و پرونده را دقیق‌تر مطالعه کنید، بخش‌های معرفی محصول را ببینید:'),
      row('Return actions', [
        button('تکمیل فرم درخواست دمو', '#qualification-form', true),
        button('مرور شرایط و موضوعات جلسه', '#who-is-this-for', false),
      ], { flex_gap: gap(12), flex_gap_mobile: gap(12), flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_wrap: 'wrap' }),
      text('می‌توانید همچنین <a href="/product-overview/">معرفی محصول</a> را در سایت مطالعه کرده و با دیدی کامل‌تر وارد گفت‌وگوی مشاوره‌ای شوید.', 'caption'),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
  ];
}

export const pageIdentity = {
  title: 'درخواست دمو و مشاوره | CPMS',
  slug: 'demo',
  description: 'درخواست دمو و مشاوره پیرامون نرم‌افزار مدیریت کلینیک CPMS؛ ارزیابی تناسب عملیاتی، پذیرش، پرونده و ویزیت متناسب با مرکز شما بدون تعهد خرید.',
};
