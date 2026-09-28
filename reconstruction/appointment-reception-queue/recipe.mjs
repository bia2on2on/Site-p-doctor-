/**
 * Canonical authoring recipe for the CPMS appointment → reception → queue workflow page.
 * NOT Elementor database JSON and not a vendor export; passed one element at a time to
 * the documented editor Create / Settings commands. Native Free controls only; values
 * resolved from accepted tokens. TARGET — NOT PUBLICATION-APPROVED.
 * See claims.md and PRODUCT-TRUTH.md (ceiling: REVERIFY BEFORE PUBLIC LAUNCH).
 */
export function appointmentReceptionQueue(t) {
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
  const chip = (id, label, muted = false) => container(label, [
    heading(label, 'p', 'body-sm', { title_color: color(muted ? 'ink/secondary' : 'accent/primary') }),
  ], {
    _element_id: id, border_border: 'solid',
    border_width: { ...box(0), top: '2', isLinked: false },
    border_color: color(muted ? 'border/strong' : 'accent/primary'), padding: box(12, 0),
  });
  const reservedMedia = (wrapperId, surfaceId, disclosureId, frameEyebrow, frameTitle, frameContext) => column('MEDIA REQUIRED — reserved frame, NOT product UI', [
    container('Reserved screenshot surface — replace with verified image later', [
      eyebrow(frameEyebrow, { title_color: white }),
      heading(frameTitle, 'h2', 'h2', { title_color: white }),
      text('نمای واقعی محصول؛ پس از تأیید رسانه', 'lede', { text_color: white }),
      text(frameContext, 'caption', { text_color: white }),
    ], {
      _element_id: surfaceId, min_height: px(320), min_height_mobile: px(256), padding: box(32), padding_mobile: box(24, 16),
      flex_justify_content: 'center', background_background: 'classic', background_color: color('ink/primary'), border_radius: box(t.border.radius.md),
    }),
    container('Explicit media disclosure', [text('این قاب، تصویر محیط نرم‌افزار نیست. رسانهٔ واقعی پس از بررسی و تأیید در همین قاب قرار می‌گیرد.', 'caption')], {
      _element_id: disclosureId, padding: box(16),
    }),
  ], 100, {
    _element_id: wrapperId, html_tag: 'aside', flex_gap: gap(0),
    background_background: 'classic', background_color: color('surface/card'),
    border_border: 'solid', border_width: box(1), border_color: color('border/subtle'), border_radius: box(t.border.radius.md),
  });

  return [
    band('Internal design review notice', 'review-notice', [text('پیش‌نمایش طراحی · متن و رسانه‌ها پیش از انتشار عمومی نیازمند تأیید هستند.', 'caption')], {
      html_tag: 'aside', padding: box(8, 24), padding_mobile: box(8, 16), background_background: 'classic', background_color: color('background/subtle'),
    }),
    band('Hero', 'introduction', [
      container('Hero content container', [
        eyebrow('جریان کاری کلینیک · نوبت، پذیرش، صف'),
        heading('نوبت، پذیرش و صف؛<br>یک مسیر کاری متصل در کلینیک', 'h1'),
        text(`از برنامهٔ نوبت‌ها تا ورود مراجعان، صف انتظار و ادامهٔ مسیر در کلینیک؛ ${cpms} این مسیر کاری را برای مدیران کلینیک، پذیرش و پزشکان در کنار هم می‌بیند — نه به‌شکل ابزارهای جدا و نه به‌عنوان صفحهٔ نوبت‌گیری بیماران.`, 'lede'),
        row('Clinic-side progression strip', [
          chip('flow-appointment', 'نوبت'),
          chip('flow-reception', 'پذیرش'),
          chip('flow-queue', 'صف'),
          chip('flow-continuity', 'ادامهٔ مسیر در کلینیک', true),
        ], { _element_id: 'flow-strip', flex_direction_tablet: 'row', flex_direction_mobile: 'row', flex_wrap: 'wrap', flex_gap: gap(24), flex_gap_mobile: gap(16) }),
        row('Hero actions', [button('درخواست دمو / مشاوره', '/demo/'), button('دیدن جریان کاری', '#workflow', false)], { flex_gap: gap(12), flex_gap_mobile: gap(12), flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_wrap: 'wrap' }),
        text('مخاطب این صفحه مدیران و کارکنان کلینیک هستند؛ اگر برای گرفتن نوبت مراجعه کرده‌اید، این صفحه برای شما نیست.', 'caption'),
      ], { flex_gap: gap(16) }),
    ], { padding: box(32, 24), padding_mobile: box(24, 16) }),
    band('Recognizable operational problem', 'problem', [
      eyebrow('مسئلهٔ آشنا در کلینیک'),
      heading('هماهنگی پذیرش و پزشک، بدون دید کافی از وضعیت‌ها'),
      text('چند وضعیت آشنا در کلینیک‌هایی که پذیرش و پزشکان در آن‌ها هم‌زمان کار می‌کنند:'),
      container('Operational realities', [
        item('دید پذیرش از مراجعه‌های برنامه‌ریزی‌شده', 'پذیرش برای پاسخ‌گویی و هماهنگی باید بداند امروز چه نوبت‌هایی ثبت شده و هر مراجعه در چه وضعیتی است.'),
        item('وضعیت ورود و انتظار', 'از لحظهٔ ورود مراجع تا نوبتِ ویزیت، وضعیت باید برای پذیرش و پزشک روشن بماند؛ نه فقط روی کاغذ یا در گفت‌وگوهای شفاهی.'),
        item('صف در کلینیک چندپزشکی', 'صف انتظار در مراکز چندپزشکی بین چند پزشک و چند نقش هماهنگ می‌شود؛ هماهنگی‌ای که فراتر از یک فهرست اسامی است.'),
      ], { flex_gap: gap(0) }),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Connected workflow', 'workflow', [
      row('Workflow introduction', [
        column('Workflow title', [eyebrow('جریان کاری مرتبط'), heading('نوبت، پذیرش و صف؛<br>سه مرحلهٔ یک مسیر')], 45),
        column('Workflow context', [text('این سه مرحله را به‌شکل یک مسیر دنبال کنید، نه سه ابزار جدا؛ دامنهٔ هر مرحله در نسخهٔ ارائه بررسی می‌شود.')], 55),
      ], { flex_align_items: 'center' }),
      row('Connected numbered progression, RTL then vertical mobile', [
        step('stage-appointment', '۰۱', 'نوبت و برنامهٔ مراجعه', 'نوبت نقطهٔ شروع مسیر است؛ ثبت و پیگیری نوبت‌ها مبنای برنامه‌ریزی روز و کار پذیرش می‌شود.'),
        step('stage-reception', '۰۲', 'پذیرش و ثبت ورود', 'ورود مراجع و مراجعهٔ بدون نوبت در سمت پذیرش ثبت می‌شود؛ دامنهٔ کامل این مرحله در نسخهٔ ارائه تأیید می‌شود.'),
        step('stage-queue', '۰۳', 'صف انتظار و هماهنگی', 'از ورود تا ویزیت، صف انتظار وضعیت مراجعان را برای پذیرش و پزشک قابل پیگیری نگه می‌دارد.'),
      ], {
        _element_id: 'workflow-stages', flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_gap: gap(0), flex_gap_mobile: gap(0),
        background_background: 'classic', background_color: color('surface/card'),
      }),
      container('Continuity pointer', [
        text('پس از صف، مسیر تمام نمی‌شود؛ ادامهٔ آن در فضای کاری پزشک است.', 'caption'),
        button('ادامهٔ مسیر در فضای کاری پزشک', '#doctor-continuity', false),
      ], { flex_gap: gap(8) }),
      reservedMedia('product-media-appointment', 'media-appointment-surface', 'media-appointment-disclosure',
        'CPMS / نمای نوبت‌ها', 'برنامهٔ نوبت‌های روز', 'این فضا برای تصویر تأییدشدهٔ برنامهٔ نوبت‌ها با داده‌های نمایشی در نظر گرفته شده است.'),
    ]),
    band('Reception perspective', 'reception', [
      eyebrow('از نگاه پذیرش'),
      heading('پذیرش چه چیزی را سامان می‌دهد؟'),
      text('سازوکارهای سمت پذیرش در سه موضوع خلاصه می‌شوند. هر مورد در محدوده‌ای معرفی می‌شود که در اسناد محصول ثبت شده است، نه به‌عنوان یک چرخهٔ کامل و بسته.'),
      row('Reception topics and reserved arrival-board media', [
        column('Reception mechanisms', [
          container('Reception topics', [
            item('ثبت ورود و مراجعهٔ بدون نوبت', 'حضور مراجع در کلینیک ثبت می‌شود؛ چه نوبت قبلی داشته باشد و چه بدون نوبت مراجعه کرده باشد.'),
            item('وضعیت روشن هر مراجعه', 'وضعیت هر مراجعه از ورود تا انتظار برای پذیرش قابل پیگیری نگه داشته می‌شود.'),
            item('صف برای چند نقش', 'صف انتظار تنها یک فهرست اسامی نیست؛ نقطهٔ هماهنگی بین پذیرش و پزشکان است.'),
          ], { flex_gap: gap(0) }),
          container('Honest reception boundary', [
            text('مرز صادقانه: فاز کامل پذیرش در سند فعلی محصول بسته نشده است. این بخش سازوکارهای ثبت‌شده را معرفی می‌کند و وعدهٔ چرخهٔ کامل و بستهٔ پذیرش را نمی‌دهد.', 'caption'),
          ], {
            _element_id: 'reception-boundary', padding: box(16), background_background: 'classic', background_color: color('background/subtle'),
            border_border: 'solid', border_width: { ...box(0), right: '2', isLinked: false }, border_color: color('accent/primary'), border_radius: box(t.border.radius.sm),
          }),
        ], 55, { flex_gap: gap(24) }),
        column('Reserved reception media slot', [
          reservedMedia('product-media-reception', 'media-reception-surface', 'media-reception-disclosure',
            'CPMS / نمای پذیرش', 'تابلوی ورود و صف انتظار', 'این فضا برای تصویر تأییدشدهٔ سمت پذیرش و صف با داده‌های نمایشی در نظر گرفته شده است.'),
        ], 45),
      ]),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Doctor handoff and continuity', 'doctor-continuity', [
      eyebrow('پس از صف'),
      heading('ادامهٔ مسیر در فضای کاری پزشک'),
      text('با رسیدن نوبتِ ویزیت، مسیر وارد فضای کاری پزشک می‌شود؛ پرونده و مستندات ویزیت در همین امتداد قرار دارند. این ادامهٔ مسیر در جلسهٔ دمو با سناریوی مرکز شما مرور می‌شود.'),
      row('Continuity actions', [
        button('دیدن معرفی محصول', '/product-overview/', false),
        text('برای تصویر کامل‌ترِ نوبت، پذیرش، ویزیت و پرونده، صفحهٔ معرفی محصول را ببینید.', 'caption'),
      ], { flex_gap: gap(16), flex_align_items: 'center' }),
    ]),
    band('Audience and operational fit', 'fit', [
      eyebrow('برای چه مجموعه‌ای؟'),
      heading('کجا این جریان کاری بیشترین معنا را دارد؟'),
      row('Primary and secondary audiences', [
        item('کلینیک چندپزشکی با پذیرش فعال', 'جایی که چند پزشک و پذیرش هم‌زمان کار می‌کنند، هماهنگی نوبت، ورود و صف اصلی‌ترین ارزش این مسیر کاری است.'),
        item('مطب مستقل یا مجموعهٔ کوچک‌تر', 'در مطب تک‌پزشک هم نوبت و پیگیری مراجعه معنا دارد؛ اما عمق نیاز به صف و هماهنگی به شیوهٔ واقعی کار مرکز بستگی دارد.'),
      ]),
      text('ادعای تناسب عمومی برای همهٔ مراکز مطرح نیست؛ تناسب در جلسهٔ دمو با سناریوی مرکز شما سنجیده می‌شود.', 'caption'),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Bounded questions and objections', 'faq', [
      row('FAQ title and question list', [
        column('FAQ title', [eyebrow('پیش از ارزیابی'), heading('چهار پرسش برای<br>روشن‌شدن محدوده')], 35),
        column('Bounded questions', [
          item('این صفحه برای نوبت‌گیری آنلاین بیماران است؟', 'خیر. این صفحه جریان کاری سمت کلینیک را معرفی می‌کند: نوبت، پذیرش و صف. وعدهٔ نوبت‌گیری آنلاین توسط بیماران هم داده نمی‌شود. اگر بیمار هستید و به‌دنبال گرفتن نوبت، این صفحه مقصد شما نیست.'),
          item('پذیرش فضای کاری مخصوص خود را دارد؟', 'سازوکارهای سمت پذیرش — ثبت ورود، مراجعهٔ بدون نوبت و وضعیت انتظار و صف — در محصول ثبت شده‌اند؛ اما فاز کامل پذیرش هنوز بسته نشده و دامنهٔ آن باید در نسخهٔ ارائه بررسی شود.'),
          item('جریان پس از پذیرش چگونه ادامه پیدا می‌کند؟', 'مسیر به فضای کاری پزشک، پرونده و مستندات ویزیت متصل می‌شود. تصویر کامل‌تر در صفحهٔ معرفی محصول آمده و جزئیات در دمو بررسی می‌شود.'),
          item('می‌توانیم محصول واقعی را ببینیم؟', 'بله؛ مسیر دمو و مشاوره در صفحهٔ درخواست دمو آمده است. توجه داشته باشید که فرم آن صفحه فعلاً در حالت فنی و غیرزنده است و ثبت درخواست به‌صورت زنده تحویل داده نمی‌شود.'),
        ], 65, { flex_gap: gap(0) }),
      ]),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Demo consultation destination — real page, non-live form', 'next-step', [
      container('Consultation panel', [
        eyebrow('دمو / مشاوره'), heading('جریان کاری مرکز خود را مبنا قرار دهید'),
        text('نوبت، پذیرش و صف را با نقش‌های واقعی کلینیک خود مرور کنید؛ جلسهٔ دمو و مشاوره برای همین تنظیم می‌شود.', 'lede'),
        row('Next-step actions', [
          button('رفتن به صفحهٔ دمو و مشاوره', '/demo/'),
          button('معرفی کامل‌تر محصول', '/product-overview/', false),
        ], { flex_gap: gap(12), flex_gap_mobile: gap(12), flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_wrap: 'wrap' }),
        text('فرم صفحهٔ دمو فعلاً در حالت فنی و غیرزنده است؛ ثبت آن درخواستی را به‌صورت زنده تحویل نمی‌دهد.', 'caption'),
      ], {
        padding: box(32), padding_mobile: box(24, 16), background_background: 'classic', background_color: color('surface/card'),
        border_border: 'solid', border_width: { ...box(0), top: '2', isLinked: false }, border_color: color('accent/primary'),
      }),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
  ];
}

export const pageIdentity = {
  title: 'نرم افزار نوبت دهی مطب و کلینیک؛ پذیرش و صف انتظار | برای مدیران کلینیک | CPMS',
  slug: 'appointment-reception-queue',
  description: 'برای مدیران کلینیک: آشنایی با جریان کاری مرتبط نوبت دهی، پذیرش و صف انتظار در نرم افزار کلینیک و ارزیابی تناسب آن با مرکز شما در جلسه دمو و مشاوره.',
};
