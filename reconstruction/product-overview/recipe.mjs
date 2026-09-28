/**
 * Canonical authoring recipe, NOT Elementor database JSON or a vendor export.
 * Passed one element at a time to the documented editor Create / Settings commands.
 * All visual settings are native Free controls; values come from accepted tokens.
 * TARGET — NOT PUBLICATION-APPROVED. See claims.md and PRODUCT-TRUTH.md.
 */
export function productOverview(t) {
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
    // Owner's mobile readability revision: reading copy never falls to the 15px supporting role.
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
    flex_direction: 'row', flex_direction_tablet: 'column', flex_gap: gap(32), flex_gap_mobile: gap(24), ...extra,
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
  const cpms = '<bdi>CPMS</bdi>';
  const white = color('accent/contrast-on-accent');
  const width = size => ({ unit: '%', size });
  const column = (name, children, size, extra = {}) => container(name, children, { width: width(size), width_tablet: width(100), ...extra });
  const step = (id, n, title, copy) => container(title, [
    container(`Stage ${n} marker`, [heading(n, 'p', 'h3', { title_color: white, align: 'center' })], {
      width: px(48), min_height: px(48), flex_justify_content: 'center', background_background: 'classic',
      background_color: color('accent/primary'), border_radius: box(t.border.radius.sm),
    }),
    heading(title, 'h3'), text(copy),
  ], {
    html_tag: 'article', _element_id: id, border_border: 'solid',
    // Connected RTL horizontal rail becomes an inline-start vertical rail on mobile.
    // Native responsive border controls: no decorative image, arrow widget or custom CSS.
    border_width: { ...box(0), top: '2', isLinked: false }, border_width_mobile: { ...box(0), right: '2', isLinked: false },
    border_color: color('accent/primary'), padding: box(24),
    padding_mobile: { ...box(24), top: '8', left: '0', isLinked: false },
  });
  const item = (title, copy) => container(title, [heading(title, 'h3', 'h3'), text(copy)], {
    flex_gap: gap(8), padding: box(16, 0), border_border: 'solid', border_width: { ...box(0), bottom: '1', isLinked: false }, border_color: color('border/subtle'),
  });

  return [
    band('Internal design review notice', 'review-notice', [text('پیش‌نمایش طراحی · متن و رسانه‌ها پیش از انتشار عمومی نیازمند تأیید هستند.', 'caption')], {
      html_tag: 'aside', padding: box(8, 24), padding_mobile: box(8, 16), background_background: 'classic', background_color: color('background/subtle'),
    }),
    band('Hero', 'introduction', [row('Hero: context then reserved product media', [
      column('Hero copy', [
        eyebrow('نرم‌افزار مدیریت مطب و کلینیک'),
        heading('نرم‌افزار مدیریت مطب و کلینیک، فراتر از نوبت‌دهی', 'h1'),
        text(`${cpms} یک نرم‌افزار مدیریت کلینیک برای دنبال‌کردن جریان‌های کاری مرتبط است؛ از نوبت و پذیرش تا فضای کاری پزشک، پرونده و مستندات مراجعه.`, 'lede'),
        row('Hero actions', [button('درخواست دمو / مشاوره', '#demo-consultation'), button('دیدن بخش‌های محصول', '#workflow', false)], { flex_gap: gap(12), flex_gap_mobile: gap(12), flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_wrap: 'wrap' }),
        text('گفت‌وگو را از جریان کار کلینیک خود شروع کنید.', 'caption'),
      ], 46, { _element_id: 'hero-copy' }),
      column('MEDIA REQUIRED — reserved frame, NOT product UI', [
        container('Reserved screenshot surface — replace with verified image later', [
          eyebrow('CPMS / نمای محصول', { title_color: white }),
          heading('نمای واقعی نرم‌افزار CPMS', 'h2', 'h2', { title_color: white }),
          text('نمای واقعی محصول؛ پس از تأیید رسانه', 'lede', { text_color: white }),
          text('این فضا برای نمایش تصویر تأییدشدهٔ CPMS با داده‌های نمایشی در نظر گرفته شده است.', 'caption', { text_color: white }),
        ], {
          _element_id: 'media-reserved-surface', min_height: px(320), min_height_mobile: px(256), padding: box(32), padding_mobile: box(24, 16),
          flex_justify_content: 'center', background_background: 'classic', background_color: color('ink/primary'), border_radius: box(t.border.radius.md),
        }),
        container('Explicit media disclosure', [text('این قاب، تصویر محیط نرم‌افزار نیست. رسانهٔ واقعی پس از بررسی و تأیید در همین قاب قرار می‌گیرد.', 'caption')], {
          _element_id: 'media-reserved-disclosure', padding: box(16),
        }),
      ], 54, {
        _element_id: 'product-media', html_tag: 'aside', flex_gap: gap(0),
        background_background: 'classic', background_color: color('surface/card'),
        border_border: 'solid', border_width: box(1), border_color: color('border/subtle'), border_radius: box(t.border.radius.md),
      }),
    ], { flex_align_items: 'center' })], { padding: box(32, 24), padding_mobile: box(24, 16) }),
    band('Recognizable problem and solution direction', 'clinic-context', [row('Problem paired with solution direction', [
      column('Problem title', [eyebrow('از یک مسئلهٔ آشنا شروع کنیم'), heading('کارهای مرتبط،<br>مسیرهای پراکنده')], 40),
      column('Problem and product approach', [
        text('وقتی نوبت‌ها، وضعیت پذیرش و اطلاعات ویزیت جدا پیگیری می‌شوند، هماهنگی روزانه به رفت‌وبرگشت بیشتری نیاز دارد.'),
        heading('نقطهٔ شروع: ارتباط بین مراحل', 'h3'),
        text('CPMS را از همین زاویه بررسی کنید: مسیر یک مراجعه و نقش پذیرش و پزشک در هر مرحله، نه فقط فهرستی از ابزارها.'),
      ], 60, { flex_gap: gap(12) }),
    ])], { background_background: 'classic', background_color: color('surface/card') }),
    band('Connected workflow', 'workflow', [
      row('Workflow introduction', [
        column('Workflow title', [eyebrow('منطق محصول'), heading('چه چیزهایی در یک مسیر کاری به هم متصل می‌شوند؟')], 45),
        column('Workflow context', [text('جریان کار را نرم‌افزار مدیریت مطب تنها با ثبت نوبت تعریف نمی‌شود؛ جریان مراجعه، اطلاعات ویزیت و پیگیری‌های عملیاتی نیز بخشی از ارزیابی‌اند.')], 55),
      ], { flex_align_items: 'center' }),
      row('Connected numbered progression, RTL then vertical mobile', [
        step('stage-appointment', '۰۱', 'نوبت و برنامه‌ریزی مراجعه', 'جریان نوبت را در کنار مراحل بعدی مراجعه بررسی کنید؛ نه به‌عنوان تمام کارکرد نرم‌افزار.'),
        step('stage-reception', '۰۲', 'پذیرش و صف انتظار', 'ورود، مراجعهٔ بدون نوبت و صف از موضوعاتی هستند که دامنهٔ آن‌ها باید در نسخهٔ ارائه بررسی شود.'),
        step('stage-visit', '۰۳', 'فضای کاری پزشک و پرونده', 'اطلاعات بیمار و مستندات ویزیت را در سناریوی واقعی مرکز خود مرور کنید.'),
      ], {
        _element_id: 'workflow-stages', flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_gap: gap(0), flex_gap_mobile: gap(0),
        background_background: 'classic', background_color: color('surface/card'),
      }),
      text('<a href="/appointment-reception-queue/">جزئیات جریان نوبت، پذیرش و صف</a> را از نگاه تیم کلینیک دنبال کنید.'),
    ]),
    band('Product evaluation with bounded capability grouping', 'product-review', [row('Product context and compact evaluation topics', [
      column('Product evidence context', [
        eyebrow('محصول در زمینهٔ کار واقعی'), heading('در دمو، یک مراجعه را دنبال کنید'),
        text('ارتباط مراحل را در یک سناریوی مشخص ببینید؛ سپس جزئیاتی را بررسی کنید که برای مرکز شما مهم است.'),
        button('جایگاه نمای واقعی محصول', '#product-media', false),
      ], 45),
      column('Bounded product review topics', [
        item('پرونده و مستندات ویزیت', 'اطلاعات بیمار و مستندات ویزیت را در فضای کاری پزشک بررسی کنید.'),
        item('پرتال بیمار، گزارش‌گیری و مدل چندکلینیکی', 'دامنه و دسترس‌پذیری هر بخش را با نسخهٔ ارائه و نیاز مجموعه در جلسه بررسی کنید.'),
        item('ثبت دستی پرداخت', 'دامنهٔ ثبت پرداخت و خلاصه‌های مالی را با نیاز مرکز بسنجید؛ نه به‌عنوان جایگزین حسابداری.'),
        // Contextual inbound link to the clinic-scoped patient-record / continuity page
        // (one link, inside the bounded topic it belongs to — no hub or nav duplication).
        text('محدودهٔ پرونده در کلینیک و تداوم اطلاعات آن را در <a href="/patient-record-continuity/">پرونده بیمار و تداوم اطلاعات</a> دنبال کنید.', 'caption'),
      ], 55, { flex_gap: gap(0) }),
    ])], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Audience and operational fit', 'fit', [
      eyebrow('برای چه مجموعه‌ای؟'), heading('برای چه نوع مجموعه‌ای؟'),
      row('Primary and secondary audiences', [
        item('کلینیک چندپزشکی و مرکز درمانی', 'در کلینیک چندپزشکی یا مرکز درمانی، بررسی را از هماهنگی نوبت، پذیرش و ویزیت و نقش اعضای تیم شروع کنید.'),
        item('مطب مستقل یا مجموعهٔ کوچک‌تر', 'تناسب CPMS به شیوهٔ کار و نیازهای واقعی مطب بستگی دارد؛ اندازهٔ مجموعه به‌تنهایی معیار انتخاب نیست.'),
      ]),
    ]),
    band('Evidence-led evaluation and objections', 'evaluation', [row('Trust heading and editorial question list', [
      column('Evaluation title', [eyebrow('پیش از تصمیم‌گیری'), heading('سه موضوع برای<br>بررسی دقیق‌تر')], 35),
      column('Operational fit questions', [
        item('CPMS فقط نرم‌افزار نوبت‌دهی است؟', 'خیر؛ CPMS به‌عنوان محصول مدیریت کلینیک با جریان‌های مرتبط نوبت، پذیرش، کار پزشک و پرونده معرفی می‌شود. دامنهٔ نسخهٔ ارائه را در دمو بسنجید.'),
        item('دسترسی نقش‌ها چگونه بررسی می‌شود؟', 'این گروه از مخاطبان در اولویت بررسی تناسب‌اند؛ ارزیابی را با نقش‌های پذیرش و پزشکان مجموعه انجام دهید.'),
        item('جایگزین حسابداری کامل است؟', 'خیر. ثبت دستی پرداخت و خلاصه‌های مالی، حسابداری کامل یا دفترکل نیست.'),
      ], 65, { flex_gap: gap(0) }),
    ])], { background_background: 'classic', background_color: color('surface/card') }),
    band('Demo consultation destination — no endpoint', 'demo-consultation', [
      container('Consultation panel', [
        eyebrow('درخواست دمو / مشاوره'), heading('پیش از تصمیم، محصول واقعی را ببینید'),
        row('Consultation preparation and honest route', [
          column('Prepare a relevant conversation', [text('تعداد پزشکان، نقش‌های پذیرش و اولویت‌های کاری مرکز را آماده کنید. هدف، بررسی تناسب CPMS با نیاز شماست.', 'lede')], 60),
          column('No live lead submission', [
            button('مرور موضوعات گفت‌وگو', '#evaluation'),
            text('مسیر ثبت درخواست هنوز متصل نشده است. در این پیش‌نمایش اطلاعاتی دریافت یا ارسال نمی‌شود.', 'caption'),
          ], 40),
        ]),
      ], { padding: box(32), padding_mobile: box(24, 16), background_background: 'classic', background_color: color('surface/card'),
        border_border: 'solid', border_width: { ...box(0), top: '2', isLinked: false }, border_color: color('accent/primary') }),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
  ];
}

export const pageIdentity = {
  title: 'نرم افزار مدیریت مطب و کلینیک | CPMS',
  slug: 'product-overview',
  description: 'با نرم افزار مدیریت مطب و کلینیک CPMS آشنا شوید؛ بررسی ارتباط نوبت، پذیرش، پرونده و ویزیت برای ارزیابی تناسب با جریان کار مرکز شما.',
};
