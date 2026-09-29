/**
 * Canonical authoring recipe for the CPMS global FAQ / buyer-objection page.
 * NOT Elementor database JSON and NOT a vendor export: the structure below is
 * passed one element at a time to the documented editor Create / Settings commands.
 * All visual settings are native Elementor Free controls; values come from accepted
 * design-system tokens. No Pro widget, no add-on pack, no custom CSS, no media
 * reservation (accepted product-media reservations already exist elsewhere).
 *
 * Deliberate composition choice: an OPEN question/answer layout, not an accordion.
 * The content stays crawlable and keyboard-reachable with zero interaction script,
 * and every answer is readable without a click.
 *
 * TARGET — NOT PUBLICATION-APPROVED. See claims.md and docs/PRODUCT-TRUTH.md.
 */

const cpms = '<bdi>CPMS</bdi>';

/**
 * The buyer conversation, in four scannable themes (14 questions).
 * Every answer stays inside the same claim ceiling as the destination pages;
 * boundary answers end by pointing at what can actually be evaluated in a demo.
 */
export const faqGroups = [
  {
    id: 'group-understanding',
    eyebrow: 'پیش از هر چیز',
    title: 'شناخت CPMS و تناسب با کلینیک',
    questions: [
      {
        q: 'CPMS چیست و چه تفاوتی با یک سیستم نوبت‌دهی ساده دارد؟',
        a: `${cpms} یک نرم‌افزار برای مدیریت جریان‌های کاری کلینیک است؛ از نوبت و پذیرش تا فضای کاری پزشک، پروندهٔ بیمار و مستندات ویزیت. تفاوت اصلی در همین اتصال است: نوبت‌دهی یک بخش از مسیر مراجعه است، نه تمام محصول. تصویر کامل را در <a href="/product-overview/">معرفی محصول</a> ببینید.`,
      },
      {
        q: 'CPMS برای چه نوع کلینیک‌هایی مناسب‌تر است؟',
        a: 'بیشترین تناسب با کلینیک‌ها و مراکز درمانی چندپزشکی است که پذیرش و چند پزشک در یک جریان کاری مشترک دارند. برای مطب مستقل یا مجموعهٔ کوچک‌تر، تناسب به شیوهٔ کار و نیاز واقعی بستگی دارد و اندازهٔ مجموعه به‌تنهایی معیار کافی نیست. همین تناسب را در دمو با سناریوی مرکز خودتان بسنجید.',
      },
      {
        q: 'آیا CPMS برای کلینیک چندپزشکه مناسب است؟',
        a: 'این گروه مخاطب اصلی ارزیابی است و محصول برای هماهنگی چند پزشک و نقش پذیرش در یک کلینیک معرفی می‌شود. مرزهای دسترسی هر نقش و شکل کار تیم چندپزشکه، موضوع بررسی در دمو است. اگر مجموعهٔ شما چند شعبه یا چند مرکز دارد، آن را جداگانه در جلسه مطرح کنید؛ برای این حالت ادعای آماده‌ای در سایت مطرح نشده است.',
      },
      {
        q: 'آیا پذیرش و پزشک در یک جریان متصل دیده می‌شوند؟',
        a: 'هدف محصول، دیدن همین اتصال است: مسیر یک مراجعه از نوبت و پذیرش تا ویزیت و مستندات به‌صورت یک جریان دنبال می‌شود. دامنهٔ کامل بخش پذیرش، از ورود و مراجعهٔ بدون نوبت تا صف انتظار، از موضوعاتی است که باید با نسخهٔ ارائه بررسی شود. جزئیات این مسیر را در <a href="/appointment-reception-queue/">نوبت، پذیرش و صف</a> ببینید.',
      },
    ],
  },
  {
    id: 'group-capabilities',
    eyebrow: 'قابلیت‌ها و مرزها',
    title: 'جریان‌های کاری و محدودهٔ قابلیت‌ها',
    questions: [
      {
        q: 'پروندهٔ بیمار در CPMS چه جایگاهی دارد؟',
        a: 'پروندهٔ بیمار در محدودهٔ همان کلینیک و در ادامهٔ جریان مراجعه دیده می‌شود؛ اطلاعات و مستندات ویزیت در همین مسیر ثبت و مرور می‌شوند. این پرونده، اشتراک‌گذاری اطلاعات با سامانه‌های بیرونی یا شبکهٔ ملی نیست. توضیح محدودهٔ آن در <a href="/patient-record-continuity/">پروندهٔ بیمار و تداوم اطلاعات</a> آمده است.',
      },
      {
        q: 'پورتال بیمار یعنی اپلیکیشن موبایل؟',
        a: 'خیر. بخش رو به بیمار یک محدودهٔ مشخص در همین محصول است و دربارهٔ اپلیکیشن موبایل یا اعلان‌های موبایل ادعایی در سایت مطرح نشده است. محدوده و شکل عرضهٔ این بخش را در نسخهٔ ارائه بررسی کنید؛ توضیح آن در <a href="/patient-portal/">پورتال بیمار</a> آمده است.',
      },
      {
        q: 'آیا CPMS نرم‌افزار حسابداری کامل است یا درگاه پرداخت آنلاین دارد؟',
        a: 'خیر. آنچه در محدودهٔ فعلی قابل بررسی است، ثبت دستی پرداخت‌ها و خلاصه‌های مالی در جریان کار کلینیک است؛ این کار معادل حسابداری کامل یا دفتر کل نیست. درگاه پرداخت آنلاین هم از ادعاهای فعلی سایت نیست. دامنهٔ مالی را در دمو با نیاز مرکز خود بسنجید.',
      },
      {
        q: 'آیا CPMS به بیمه یا نسخهٔ الکترونیک ملی متصل است؟',
        a: 'خیر؛ هیچ‌کدام از این دو اتصال، ادعای فعلی CPMS نیست. آنچه امروز قابل بررسی است، ثبت و مدیریت نسخه‌ها و اسناد در محیط CPMS و در ادامهٔ پروندهٔ بیمار است. این ثبت و مدیریت، اتصال به سامانه‌های بیرونی، بیمه یا داروخانه نیست. تمایز کامل را در <a href="/prescriptions-documents/">نسخه‌ها و اسناد در CPMS</a> ببینید.',
      },
      {
        q: 'آیا CPMS از هوش مصنوعی استفاده می‌کند؟',
        a: 'خیر؛ هوش مصنوعی بخشی از ادعاهای فعلی CPMS نیست. این محصول، ابزار پشتیبانی تصمیم بالینی یا پیشنهاد خودکار تشخیص هم نیست. تمرکز فعلی روی ثبت و پیگیری جریان‌های کاری کلینیک است و همین را می‌توانید در دمو ببینید.',
      },
    ],
  },
  {
    id: 'group-data-access',
    eyebrow: 'داده و دسترسی',
    title: 'داده، دسترسی و ادعاهای امنیتی',
    questions: [
      {
        q: 'دسترسی نقش‌ها در CPMS چگونه توصیف می‌شود؟',
        a: 'دسترسی در CPMS بر پایهٔ نقش‌ها توصیف می‌شود: برای هر نقش محدودهٔ مشخصی تعریف می‌شود و اطلاعات هر کلینیک از کلینیک دیگر جدا نگه داشته می‌شود. این توضیح، سازوکار دسترسی در محصول است؛ نه گواهی است و نه تضمین مطلق. اینکه هر نقش دقیقاً چه می‌بیند، در دمو و با نسخهٔ ارائه بررسی می‌شود.',
      },
      {
        q: 'آیا CPMS گواهی امنیتی یا تأییدیهٔ انطباق دارد؟',
        a: 'در سایت هیچ گواهی امنیتی، انطباق قانونی یا تضمین مطلقی ادعا نمی‌شود. آنچه قابل بررسی است، همان سازوکار نقش‌ها، دسترسی و تفکیک اطلاعات میان کلینیک‌هاست. اگر برای مرکز شما الزام امنیتی مشخصی وجود دارد، آن را در جلسه مطرح کنید تا وضعیت واقعی و بدون اغراق روشن شود.',
      },
    ],
  },
  {
    id: 'group-evaluation',
    eyebrow: 'تصمیم خرید',
    title: 'ارزیابی، دمو و مسیر تصمیم',
    questions: [
      {
        q: 'چگونه می‌توان پیش از تصمیم، محیط واقعی محصول را دید؟',
        a: 'مسیر ارزیابی همین است: مشاهدهٔ محیط CPMS و مرور یک سناریوی واقعی مراجعه با داده‌های نمایشی. برای اینکه جلسه مفید باشد، تعداد پزشکان، نقش‌های پذیرش و اولویت‌های کاری مرکز را از قبل آماده کنید.',
      },
      {
        q: 'قیمت CPMS چگونه مشخص می‌شود؟',
        a: 'قیمت عمومی ثابتی در سایت اعلام نشده است. مسیر فعلی فروش بر پایهٔ بررسی نیاز و مشاوره است؛ ابتدا نیاز مرکز بررسی می‌شود و ادامهٔ گفت‌وگو بر همین پایه پیش می‌رود.',
      },
      {
        q: 'درخواست دمو یا مشاوره چگونه انجام می‌شود؟',
        a: 'مسیر درخواست، فرم همان <a href="/demo/">صفحهٔ دمو و مشاوره</a> است. توجه کنید که در این پیش‌نمایش، مسیر ثبت درخواست به فروش متصل نشده است؛ بنابراین اطلاعاتی ارسال یا ثبت نمی‌شود.',
      },
    ],
  },
];

/** Ordered question/answer copy, used by the static and browser guardrails. */
export const faqCopy = faqGroups.flatMap(group => group.questions);
export const faqAnswers = faqCopy.map(item => item.a);
export const faqQuestions = faqCopy.map(item => item.q);

export function faqPage(t) {
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
    // Reading copy never falls to the 15px supporting role on mobile (accepted revision).
    _css_classes: role === 'caption' ? 'cpms-support' : 'cpms-reading',
    typography_font_size_mobile: px(role === 'caption' ? t.typography.scale['body-sm'].size_px : t.typography.scale.lede.size_mobile_px),
    typography_line_height_mobile: { unit: 'em', size: role === 'caption' ? 1.7 : t.typography.scale.body.line_height, sizes: [] },
    ...extra,
  });
  const container = (name, children, extra = {}) => node('container', name, {
    content_width: 'full', flex_direction: 'column', flex_gap: gap(16), padding: box(0), ...extra,
  }, children);
  const band = (name, id, children, extra = {}) => container(name, children, {
    html_tag: 'section', _element_id: id, content_width: 'full',
    padding: box(48, 24), padding_mobile: box(32, 16), flex_gap: gap(24), ...extra,
  });
  /**
   * The reading column: one narrow acceptance width for question and answer alike, so
   * headings and answers share an edge and answers never run past a comfortable measure.
   */
  const readingColumn = (name, children, extra = {}) => container(name, children, {
    content_width: 'boxed', boxed_width: px(t.container['content-narrow'].value_px),
    flex_gap: gap(24), ...extra,
  }, children);
  const row = (name, children, extra = {}) => container(name, children, {
    flex_direction: 'row', flex_direction_tablet: 'column', flex_gap: gap(24), flex_gap_mobile: gap(20), flex_align_items: 'center', ...extra,
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
  const white = color('accent/contrast-on-accent');
  /** One open question/answer pair: H3 question, reading-size answer, restrained divider. */
  const question = item => container(item.q, [
    heading(item.q, 'h3', 'h3'),
    text(item.a),
  ], {
    flex_gap: gap(8), padding: box(20, 0),
    border_border: 'solid', border_width: { ...box(0), bottom: '1', isLinked: false }, border_color: color('border/subtle'),
  });

  return [
    band('Internal design review notice', 'review-notice', [
      text('پیش‌نمایش طراحی · متن‌های این صفحه پیش از انتشار عمومی نیازمند تأیید هستند.', 'caption'),
    ], {
      html_tag: 'aside', padding: box(8, 24), padding_mobile: box(8, 16),
      background_background: 'classic', background_color: color('background/subtle'),
    }),
    // Compact hero: identity, the reason the page exists, one conversion route.
    band('Hero', 'introduction', [
      readingColumn('Hero copy', [
        eyebrow('پرسش‌های پیش از تصمیم'),
        heading('پرسش‌های مدیران کلینیک پیش از تصمیم درباره CPMS', 'h1'),
        text('پاسخ کوتاه و روشن به پرسش‌هایی که پیش از دیدن محصول مطرح می‌شوند: چیستی CPMS، تناسب آن با کلینیک، محدودهٔ قابلیت‌ها و مسیر ارزیابی.', 'lede'),
        row('Hero actions', [
          button('درخواست دمو / مشاوره', '/demo/'),
          button('مرور معرفی محصول', '/product-overview/', false),
        ], { flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_gap: gap(12), flex_gap_mobile: gap(12), flex_wrap: 'wrap' }),
        text('هر پاسخ، همان چیزی است که امروز دربارهٔ CPMS قابل بررسی است؛ جزئیات نسخهٔ ارائه را در دمو ببینید.', 'caption'),
      ], { flex_gap: gap(20) }),
    ], { padding: box(40, 24), padding_mobile: box(28, 16) }),
    // Four answer groups. The rule above each group is the only section surface:
    // restrained dividers instead of decorative cards or media.
    ...faqGroups.map(group => band(group.title, group.id, [
      readingColumn(group.title, [
        eyebrow(group.eyebrow),
        heading(group.title, 'h2'),
        container(`${group.title} answers`, group.questions.map(question), { flex_gap: gap(0) }),
      ], {
        flex_gap: gap(20),
        border_border: 'solid', border_width: { ...box(0), top: '1', isLinked: false }, border_color: color('border/subtle'),
      }),
    ], {
      padding: box(40, 24), padding_mobile: box(28, 16),
      background_background: 'classic', background_color: color('background/base'),
    })),
    // Strong single final CTA: the same conversion route as every other sales page.
    band('Final conversion panel', 'next-step', [
      readingColumn('Next-step panel', [
        eyebrow('قدم بعدی'),
        heading('پرسش‌های خود را در جلسه مطرح کنید', 'h2'),
        text('هدف دمو و مشاوره، بررسی تناسب CPMS با جریان کار مرکز شماست؛ پرسش‌های باز این صفحه را همان‌جا ادامه دهید.', 'lede'),
        row('Next-step actions', [
          button('درخواست دمو / مشاوره', '/demo/'),
          button('مرور معرفی محصول', '/product-overview/', false),
        ], { flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_gap: gap(12), flex_gap_mobile: gap(12), flex_wrap: 'wrap' }),
        text('در این پیش‌نمایش، مسیر ثبت درخواست به فروش متصل نشده است.', 'caption'),
      ], {
        flex_gap: gap(20), padding: box(32), padding_mobile: box(24, 16),
        background_background: 'classic', background_color: color('surface/card'),
        border_border: 'solid', border_width: { ...box(0), top: '2', isLinked: false }, border_color: color('accent/primary'),
      }),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
  ];
}

export const pageIdentity = {
  title: 'پرسش‌های متداول درباره CPMS | برای مدیران کلینیک',
  slug: 'faq',
  description: 'پاسخ به پرسش‌های مدیران کلینیک پیش از تصمیم درباره CPMS؛ چیستی محصول، تناسب با کلینیک چندپزشکه، محدودهٔ پرونده و مالی، محدودهٔ اتصال‌ها و مسیر دمو و مشاوره.',
};
