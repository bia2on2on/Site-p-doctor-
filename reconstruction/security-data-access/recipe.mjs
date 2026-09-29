/**
 * Canonical authoring recipe for the CPMS Security & Data Access trust page.
 * «امنیت و دسترسی به داده»
 *
 * NOT Elementor database JSON and NOT a vendor export: the structure below is
 * passed one element at a time to the documented editor Create / Settings commands.
 * All visual settings are native Elementor Free controls; values come from accepted
 * design-system tokens. No Pro widget, no add-on pack, no custom CSS, no media
 * reservation, no badge/icon, no structured data.
 *
 * TARGET — NOT PUBLICATION-APPROVED. See claims.md and docs/PRODUCT-TRUTH.md.
 * This is a trust page, not a capability/workflow page. It explains bounded
 * role/access/data-separation mechanisms at mechanism level only, subject to
 * launch verification. No certification, compliance, absolute security or
 * encryption/backup/hosting/monitoring/audit-logging claims.
 */

export function securityDataAccess(t) {
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
  const checklistItem = (title, copy) => container(title, [heading(title, 'h3', 'h3'), text(copy)], {
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
    band('Internal design review notice', 'review-notice', [
      text('پیش‌نمایش طراحی · متن‌های این صفحه پیش از انتشار عمومی نیازمند تأیید هستند.', 'caption'),
    ], {
      html_tag: 'aside',
      padding: box(8, 24),
      padding_mobile: box(8, 16),
      background_background: 'classic',
      background_color: color('background/subtle'),
    }),

    // 1. COMPACT HERO
    band('Hero', 'introduction', [
      readingColumn('Hero copy', [
        eyebrow('امنیت و دسترسی به داده'),
        heading('دسترسی متناسب با نقش، در چارچوب کار کلینیک', 'h1'),
        text('در <bdi>CPMS</bdi> سازوکارهایی برای نقش‌ها، دامنهٔ دسترسی و تفکیک اطلاعات میان کلینیک‌ها معرفی می‌شود؛ این توضیح در سطح سازوکار است و پیش از انتشار عمومی بازتأیید می‌شود.', 'lede'),
        text('چه کسی به چه بخشی از اطلاعات دسترسی دارد و چگونه نقش‌ها و محدوده‌های کاری از هم تفکیک می‌شوند، موضوع این صفحه است. برای دیدن رابط واقعی محصول، نسخهٔ ارائه را در دمو بررسی کنید.', 'body'),
        row('Hero actions', [
          button('درخواست دمو / مشاوره', '/demo/'),
          button('مرور معرفی محصول', '/product-overview/', false),
        ], { flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_gap: gap(12), flex_gap_mobile: gap(12), flex_wrap: 'wrap' }),
        text('این صفحه یک صفحهٔ اعتماد است، نه یک قابلیت جدید؛ مرزهای آن در همین صفحه توضیح داده شده است.', 'caption'),
      ], { flex_gap: gap(20) }),
    ], { padding: box(40, 24), padding_mobile: box(28, 16) }),

    // 2. WHY ACCESS MODEL MATTERS
    band('Why access model matters', 'why-matters', [
      readingColumn('Why matters copy', [
        eyebrow('چرا مدل دسترسی اهمیت دارد'),
        heading('نقش‌های مختلف، نیاز به دید عملیاتی یکسان ندارند', 'h2'),
        text('در یک کلینیک، پزشک، پذیرش و مدیریت کلینیک هرکدام بخش متفاوتی از جریان کار را دنبال می‌کنند. مدل دسترسی در <bdi>CPMS</bdi> تلاش می‌کند همین تفاوت کاری را منعکس کند؛ هر نقش، زمینهٔ کاری خود را می‌بیند، نه همه‌چیز را.'),
        text('این تفکیک، بیشتر یک تصمیم عملیاتی است تا یک ادعای امنیتی مطلق؛ کمک می‌کند هر فرد به اطلاعاتی دسترسی داشته باشد که برای انجام کار خود به آن نیاز دارد.'),
      ], { flex_gap: gap(16) }),
    ], { background_background: 'classic', background_color: color('surface/card') }),

    // 3. ROLE-BASED CONTEXT
    band('Role-based context', 'role-context', [
      readingColumn('Role context copy', [
        eyebrow('نقش‌ها و محدودهٔ کاری'),
        heading('نقش‌ها چگونه توضیح داده می‌شوند؟', 'h2'),
        text('دسترسی در <bdi>CPMS</bdi> بر پایهٔ نقش‌ها توصیف می‌شود؛ برای هر نقش محدودهٔ مشخصی در نظر گرفته شده است. این توضیح در سطح سازوکار است و وضعیت نهایی آن با نسخهٔ ارائه بررسی می‌شود. جزئیات دقیق دسترسی هر نقش، در رابط واقعی محصول و در جلسهٔ دمو دیده می‌شود.'),
        container('Role contexts', [
          item('زمینهٔ پزشک', 'مرور برنامهٔ ویزیت و اطلاعات و مستندات مرتبط با همان مراجعه، در محدودهٔ همان کلینیک؛ این زمینه بخشی از جریان کاری پزشک در کلینیک است.'),
          item('زمینهٔ پذیرش', 'پیگیری نوبت‌ها، ورود و وضعیت مراجعه در محدودهٔ کاری همان کلینیک؛ تمرکز این زمینه بر هماهنگی روزانهٔ پذیرش است.'),
          item('زمینهٔ مدیریت کلینیک', 'دیدن جریان کار در چارچوب عملیاتی کلینیک؛ این زمینه برای تصمیم‌گیر کلینیک معنا پیدا می‌کند و دامنهٔ آن با نیاز کاری مرکز سنجیده می‌شود.'),
        ], { flex_gap: gap(0) }),
        boundaryNote('role-boundary', 'این توصیف، فهرست دقیق مجوزها نیست؛ برای جلوگیری از برداشت نادرست، از ارائهٔ ماتریس دسترسی تفضیلی در این صفحه خودداری شده است. آنچه هر نقش دقیقاً می‌بیند را در دمو بررسی کنید.'),
      ], { flex_gap: gap(20) }),
    ]),

    // 4. DATA-SEPARATION CONTEXT
    band('Data-separation context', 'data-separation', [
      readingColumn('Data separation copy', [
        eyebrow('تفکیک اطلاعات'),
        heading('اطلاعات هر کلینیک در محدودهٔ همان کلینیک', 'h2'),
        text('سازوکارهای محدوده‌دار (scoped) برای تفکیک اطلاعات میان کلینیک‌ها و سازمان‌ها در شواهد محصول ثبت شده است. این سازوکارها در سطح مدل و مکانیسم توصیف می‌شوند؛ ادعای جداسازی بی‌نقص یا دریافت گواهی خاص مطرح نمی‌شود و وضعیت نهایی با نسخهٔ ارائه بررسی می‌شود.'),
        text('مدل چندکلینیکی در سطح معماری سازمان/کلینیک/موقعیت معرفی می‌شود؛ یعنی یک سازمان می‌تواند چند کلینیک یا موقعیت کاری داشته باشد و هر کلینیک زمینهٔ کاری خود را داشته باشد. دامنهٔ دقیق این مدل و شکل تفکیک زمینه‌ها موضوع بررسی در دمو است.'),
        boundaryNote('separation-boundary', 'این توضیح به‌معنای ادعای جداسازی بی‌نقص یا دریافت گواهی خاص نیست؛ صرفاً سازوکارهای محدوده‌دار ثبت‌شده در سطح مکانیسم را توصیف می‌کند.'),
      ], { flex_gap: gap(16) }),
    ], { background_background: 'classic', background_color: color('background/subtle') }),

    // 5. WHAT THIS DOES NOT CLAIM
    band('What this does not claim', 'not-claim', [
      readingColumn('Not-claim copy', [
        eyebrow('مرز روشن'),
        heading('این صفحه چه ادعایی ندارد؟', 'h2'),
        text('وجود سازوکارهای نقش و دسترسی به‌معنای ادعای «امنیت صددرصدی»، دریافت گواهی امنیتی یا انطباق با استانداردی خاص نیست. این صفحه سازوکارها را در سطح مکانیسم توضیح می‌دهد، نه به‌عنوان گواهی، تضمین یا تأییدیهٔ بیرونی.'),
        text('برای همین، در این صفحه ادعایی دربارهٔ رمزنگاری، پشتیبان‌گیری، میزبانی، پایش، ثبت وقایع یا واکنش به رخداد مطرح نمی‌شود؛ چنین موضوعاتی نیازمند شواهد جداگانه و بررسی فنی در نسخهٔ ارائه هستند.', 'caption'),
      ], { flex_gap: gap(16) }),
    ]),

    // 6. WHAT TO VERIFY IN A DEMO
    band('What to verify in a demo', 'verify-in-demo', [
      readingColumn('Verify in demo copy', [
        eyebrow('ارزیابی در دمو'),
        heading('در جلسهٔ دمو چه چیزی را بررسی کنید؟', 'h2'),
        text('برای اینکه مدل دسترسی با نیاز مرکز شما سنجیده شود، این موارد را در جلسه مرور کنید؛ هر مورد را با رابط واقعی محصول تطبیق دهید:'),
        container('Evaluation checklist', [
          checklistItem('کدام نقش‌ها برای جریان کار شما وجود دارد؟', 'نقش‌های موجود در نسخهٔ ارائه را با نقش‌های واقعی کلینیک خود مقایسه کنید؛ مثلاً پزشک، پذیرش و مدیریت کلینیک.'),
          checklistItem('هر نقش در جریان کاری مرتبط چه می‌بیند؟', 'در یک سناریوی واقعی مراجعه، ببینید هر نقش کدام بخش‌ها را می‌بیند و کدام بخش‌ها در محدودهٔ کاری او نیست.'),
          checklistItem('زمینه‌های کلینیک چگونه از هم تفکیک می‌شوند؟', 'اگر سازمان شما چند کلینیک یا موقعیت دارد، نحوهٔ تفکیک زمینه‌ها را در همان سناریو بررسی کنید.'),
          checklistItem('رابط واقعی محصول چه چیزی را نشان می‌دهد؟', 'صفحه‌ها، فهرست‌ها و جزئیات قابل مشاهده برای هر نقش را در محیط واقعی محصول مرور کنید.'),
          checklistItem('الزامات استقرار و امنیتی سازمان شما چیست؟', 'هر الزام خاص سازمان خود را در جلسه مطرح کنید تا وضعیت واقعی و بدون اغراق روشن شود.'),
        ], { flex_gap: gap(0) }),
        text('این فهرست، گزینه‌های پیکربندی خاصی را وعده نمی‌دهد؛ صرفاً کمک می‌کند ارزیابی شما دقیق‌تر باشد. جزئیات بیشتر را در <a href=\"/product-overview/\">معرفی محصول</a> و <a href=\"/faq/\">پرسش‌های متداول</a> ببینید.', 'caption'),
      ], { flex_gap: gap(20) }),
    ], { background_background: 'classic', background_color: color('surface/card') }),

    // 7. FAQ / OBJECTIONS
    band('FAQ / Objections', 'faq', [
      readingColumn('FAQ copy', [
        eyebrow('پرسش‌های متداول'),
        heading('چهار پرسش دربارهٔ دسترسی و امنیت', 'h2'),
        container('Security FAQ', [
          item('آیا همهٔ کاربران یک سطح دسترسی دارند؟', 'خیر. دسترسی بر پایهٔ نقش‌ها توصیف می‌شود؛ هر نقش محدودهٔ کاری خود را دارد. اینکه هر نقش دقیقاً چه می‌بیند، در رابط واقعی محصول و در جلسهٔ دمو بررسی می‌شود. این توضیح در سطح سازوکار است و پیش از انتشار عمومی بازتأیید می‌شود.'),
          item('آیا می‌توان دربارهٔ نقش‌ها در دمو بررسی کرد؟', 'بله. یکی از محورهای پیشنهادی جلسهٔ دمو، همین موضوع است: کدام نقش‌ها وجود دارند و هر نقش در جریان کاری مرتبط چه می‌بیند. سناریوی مرکز خود را آماده کنید تا بررسی دقیق‌تر شود.'),
          item('آیا این صفحه به‌معنی دریافت گواهی امنیتی است؟', 'خیر. این صفحه هیچ گواهی امنیتی، تأییدیهٔ انطباق یا استاندارد خاصی را ادعا نمی‌کند. آنچه توضیح داده می‌شود، سازوکارهای نقش و دسترسی و تفکیک محدوده‌دار اطلاعات است، نه گواهی بیرونی.'),
          item('آیا <bdi>CPMS</bdi> را می‌توان «صددرصد امن» دانست؟', 'خیر؛ چنین ادعای مطلقی در این سایت مطرح نمی‌شود. وجود سازوکارهای نقش و تفکیک اطلاعات به‌معنای ادعای امنیت صددرصدی نیست. اگر الزام امنیتی مشخصی دارید، آن را در جلسه مطرح کنید تا وضعیت واقعی روشن شود.'),
        ], { flex_gap: gap(0) }),
      ], { flex_gap: gap(20) }),
    ]),

    // 8. CTA
    band('Final conversion panel', 'next-step', [
      readingColumn('Next-step panel', [
        eyebrow('قدم بعدی'),
        heading('مدل دسترسی را با سناریوی مرکز خود ببینید', 'h2'),
        text('جایگاه نقش‌ها و تفکیک اطلاعات را با نقش‌های واقعی مرکز خود مرور کنید؛ جلسهٔ دمو و مشاوره برای همین تنظیم می‌شود.', 'lede'),
        row('Next-step actions', [
          button('درخواست دمو / مشاوره', '/demo/'),
          button('مرور پرسش‌های متداول', '/faq/', false),
        ], { flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_gap: gap(12), flex_gap_mobile: gap(12), flex_wrap: 'wrap' }),
        text('در این پیش‌نمایش، مسیر ثبت درخواست به فروش متصل نشده است؛ بنابراین اطلاعاتی ارسال یا ثبت نمی‌شود. مسیر کامل ارزیابی را در <a href=\"/product-overview/\">معرفی محصول</a> ببینید.', 'caption'),
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
  title: 'امنیت و دسترسی به داده در CPMS | برای مدیران کلینیک',
  slug: 'security-data-access',
  description: 'برای مدیران کلینیک: چه کسی به چه بخشی از اطلاعات دسترسی دارد و CPMS چگونه نقش‌ها و محدوده‌های کاری را از هم تفکیک می‌کند؛ با مرزهای روشن و بدون ادعای گواهی امنیتی.',
};
