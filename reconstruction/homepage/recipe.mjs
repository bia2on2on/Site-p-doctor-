/**
 * Canonical authoring recipe, NOT Elementor database JSON or a vendor export.
 * Passed one element at a time to the documented editor Create / Settings commands.
 * All visual settings are native Free controls; values come from accepted tokens.
 * TARGET — NOT PUBLICATION-APPROVED. See claims.md and PRODUCT-TRUTH.md.
 */
export function homepage(t) {
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
    editor: `<p>${copy}</p>`, text_color: color('ink/secondary'), ...type(role), ...extra,
  });
  const container = (name, children, extra = {}) => node('container', name, {
    content_width: 'full', flex_direction: 'column', flex_gap: gap(16), padding: box(0), ...extra,
  }, children);
  const band = (name, id, children, extra = {}) => container(name, children, {
    html_tag: 'section', _element_id: id, content_width: 'boxed', boxed_width: px(t.container['content-default'].value_px),
    padding: box(64, 24), padding_mobile: box(32, 24), flex_gap: gap(24), ...extra,
  });
  const row = (name, children, extra = {}) => container(name, children, {
    flex_direction: 'row', flex_direction_tablet: 'column', flex_gap: gap(32), ...extra,
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
  const eyebrow = label => heading(label, 'p', 'body-sm', { title_color: color('accent/primary') });
  const cpms = '<bdi>CPMS</bdi>';
  const step = (n, title, copy) => container(title, [
    eyebrow(n), heading(title, 'h3'), text(copy, 'body-sm'),
  ], { border_border: 'solid', border_width: { ...box(0), top: '1' }, border_color: color('border/strong'), padding: box(24, 0) });

  return [
    band('Internal design review notice', 'review-notice', [text('پیش‌نمایش طراحی · متن و رسانه‌ها پیش از انتشار عمومی نیازمند تأیید هستند.', 'caption')], {
      html_tag: 'aside', padding: box(8, 24), padding_mobile: box(8, 24), background_background: 'classic', background_color: color('background/subtle'),
    }),
    band('Hero', 'introduction', [row('Hero: context then product media', [
      container('Hero copy', [
        eyebrow('CPMS / مدیریت حرفه‌ای کلینیک'),
        heading('مدیریت کلینیک،<br>با نگاهی یکپارچه', 'h1'),
        text(`${cpms} با محوریت ارتباط نوبت، پذیرش و ویزیت طراحی شده است؛ برای بررسی هماهنگی کار پزشک و پذیرش در کلینیک‌های چندپزشکی.`, 'lede'),
        row('Hero actions', [button('درخواست دمو / مشاوره', '#demo-consultation'), button('آشنایی با جریان کار', '#workflow', false)], { flex_gap: gap(12), flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_wrap: 'wrap' }),
        text('گفت‌وگو را از جریان کار کلینیک خود شروع کنید.', 'caption'),
      ], { width: { unit: '%', size: 52 }, width_tablet: { unit: '%', size: 100 } }),
      container('MEDIA REQUIRED — not a product screenshot', [
        eyebrow('رسانهٔ محصول'),
        heading('جای تصویر واقعی CPMS', 'h2', 'h3'),
        text('این قاب، تصویر محیط نرم‌افزار نیست.<br>تصویر تأییدشدهٔ محصول با داده‌های نمایشی در این محل قرار می‌گیرد.', 'body-sm'),
        text('در انتظار رسانهٔ تأییدشده', 'caption'),
      ], {
        _element_id: 'product-media', html_tag: 'aside', width: { unit: '%', size: 48 }, width_tablet: { unit: '%', size: 100 },
        min_height: px(320), min_height_mobile: px(224), flex_justify_content: 'center', padding: box(32), padding_mobile: box(24),
        background_background: 'classic', background_color: color('background/subtle'),
        border_border: 'dashed', border_width: box(1), border_color: color('border/strong'), border_radius: box(t.border.radius.md),
      }),
    ], { flex_align_items: 'center' })], { padding: box(32, 24), padding_mobile: box(24) }),
    band('Recognizable coordination problem', 'clinic-context', [row('Problem and context', [
      container('Problem title', [eyebrow('از یک مسئلهٔ آشنا شروع کنیم'), heading('کارهای مرتبط،<br>مسیرهای پراکنده')]),
      container('Problem context', [text('وقتی برنامهٔ نوبت‌ها، وضعیت پذیرش و اطلاعات ویزیت جدا از هم پیگیری می‌شوند، هماهنگی روزانه به رفت‌وبرگشت بیشتری بین اعضای کلینیک نیاز دارد.'), text('نقطهٔ شروع: دیدن ارتباط این مراحل، نه صرفاً اضافه‌کردن یک ابزار دیگر.', 'body-sm')]),
    ])], { background_background: 'classic', background_color: color('surface/card') }),
    band('Connected workflow', 'workflow', [
      eyebrow('منطق محصول'), heading('از نوبت تا ویزیت؛ یک مسیر مرتبط'),
      text('برای شناخت CPMS، جریان کار را از نگاه پذیرش و پزشک دنبال کنید. دامنهٔ هر مرحله باید در دمو با نیاز مرکز شما بررسی شود.'),
      row('Three connected stages in RTL reading order', [
        step('۰۱ / نوبت', 'برنامهٔ مراجعه', 'نوبت، نقطهٔ شروع مسیر مراجعه است؛ مبنایی برای دنبال‌کردن مراحل پذیرش و ویزیت.'),
        step('۰۲ / پذیرش', 'ورود و انتظار', 'ثبت ورود و پیگیری صف، بخش‌های مرتبط با پذیرش‌اند. دامنهٔ کامل این مرحله نیازمند تأیید در نسخهٔ ارائه است.'),
        step('۰۳ / پزشک', 'ویزیت و پرونده', 'فضای کاری پزشک، پروندهٔ بیمار و مستندات ویزیت؛ در محدودهٔ قابلیت‌هایی که در دمو بررسی می‌شوند.'),
      ]),
      text('ثبت دستی پرداخت و خلاصه‌های مالی، موضوعی جدا برای بررسی دامنهٔ کار مالی مرکز است؛ نه جایگزین حسابداری.', 'body-sm'),
    ]),
    band('Real product evidence context', 'product-review', [
      eyebrow('محصول در زمینهٔ کار واقعی'), heading('در دمو، مسیر یک مراجعه را ببینید'),
      text('از برنامهٔ نوبت تا پذیرش و فضای کاری پزشک، یک سناریوی مشخص را دنبال کنید. برای بررسی تناسب، دیدن ارتباط مراحل از یک فهرست بلند امکانات مفیدتر است.'),
      text('رسانهٔ این بخش هنوز آماده نیست. فقط تصاویر واقعی و تأییدشدهٔ CPMS، با داده‌های نمایشی و توضیح نقش کاربر، جایگزین قاب بالا خواهند شد.', 'body-sm'),
      button('مشاهدهٔ جایگاه رسانهٔ محصول', '#product-media', false),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Audience and operational fit', 'fit', [
      eyebrow('برای چه مجموعه‌ای؟'), heading('نقطهٔ تمرکز: کلینیک چندپزشکی'),
      row('Primary and secondary audiences', [
        container('Primary audience', [heading('مدیر، پذیرش و پزشک', 'h3'), text('اگر در یک کلینیک چندپزشکی یا مرکز درمانی، هماهنگی نوبت و پذیرش و ویزیت بخشی از کار روزانهٔ شماست، بررسی را از همین جریان‌ها شروع کنید.')]),
        container('Bounded secondary audience', [heading('مطب مستقل یا مجموعهٔ کوچک‌تر', 'h3'), text('تناسب CPMS با مطب شما به شیوهٔ کار و نیازهای واقعی آن بستگی دارد. اندازهٔ مجموعه به‌تنهایی معیار انتخاب نیست.')]),
      ]),
    ]),
    band('Evidence-led evaluation and objections', 'evaluation', [
      eyebrow('پیش از تصمیم‌گیری'), heading('سه موضوع برای بررسی دقیق‌تر'),
      row('Operational fit questions', [
        container('Operational scope', [heading('آیا با کار روزانهٔ ما هماهنگ است؟', 'h3'), text('سناریوی نوبت، مراجعهٔ بدون نوبت، انتظار و ویزیت را با نقش‌های واقعی کلینیک در دمو مرور کنید.', 'body-sm')]),
        container('Access mechanisms', [heading('دسترسی نقش‌ها چگونه بررسی می‌شود؟', 'h3'), text('نقش‌ها و دسترسی‌های مرتبط با اطلاعات بیمار از موضوعات بررسی‌اند. دامنهٔ دسترسی هر نقش را در سناریوی مرکز خود ارزیابی کنید.', 'body-sm')]),
        container('No unverified migration or support promises', [heading('برای شروع چه چیزهایی باید روشن شود؟', 'h3'), text('نیاز به انتقال داده، شیوهٔ استقرار، آموزش و دامنهٔ پشتیبانی را پیش از تصمیم نهایی مشخص کنید؛ این صفحه تعهدی دربارهٔ آن‌ها ایجاد نمی‌کند.', 'body-sm')]),
      ]),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Demo consultation destination — no endpoint', 'demo-consultation', [
      eyebrow('درخواست دمو / مشاوره'), heading('گفت‌وگو دربارهٔ جریان کار کلینیک شما'),
      text('برای درخواست دمو / مشاوره، تعداد پزشکان، نقش‌های پذیرش و اولویت‌های کاری مرکز را آماده کنید. هدف، بررسی تناسب CPMS با نیاز شماست.', 'lede'),
      text('مسیر ثبت درخواست هنوز متصل نشده است. در این پیش‌نمایش اطلاعاتی دریافت یا ارسال نمی‌شود.', 'body-sm'),
      button('مرور موضوعات گفت‌وگو', '#evaluation', false),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
  ];
}

export const pageIdentity = {
  title: 'CPMS | نگاهی یکپارچه به کار کلینیک',
  slug: 'cpms-home',
  description: 'آشنایی با CPMS، منطق ارتباط نوبت، پذیرش و ویزیت و موضوعاتی که برای بررسی تناسب با جریان کار کلینیک در دمو و مشاوره مطرح می‌شوند.',
};
