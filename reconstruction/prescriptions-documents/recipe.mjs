/**
 * Canonical authoring recipe for the CPMS prescriptions-and-documents page
 * («نسخه‌ها و اسناد در CPMS»). NOT Elementor database JSON and not a vendor export;
 * passed one element at a time to the documented editor Create / Settings commands.
 * Native Free controls only; values resolved from accepted tokens.
 * TARGET — NOT PUBLICATION-APPROVED. See claims.md and PRODUCT-TRUTH.md
 * (ceiling: REVERIFY BEFORE PUBLIC LAUNCH; #11 prescriptions/documents bounded to
 * recording and management INSIDE CPMS. Recording here is not a connection to the
 * national e-prescription system, insurance, pharmacies or any other external
 * service, and nothing on this page implies automatic external submission).
 */
export function prescriptionsDocuments(t) {
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
  const item = (title, copy) => container(title, [heading(title, 'h3', 'h3'), text(copy)], {
    flex_gap: gap(8), padding: box(16, 0), border_border: 'solid', border_width: { ...box(0), bottom: '1', isLinked: false }, border_color: color('border/subtle'),
  });

  // One boundary language for the whole page: subtle tint + accent inline-start rule
  // (border-right in RTL). Every scope clarification uses it, at reading size
  // (body-sm on desktop, 18px on mobile through cpms-reading) — a clarification is
  // never fine print, and it never relies on colour alone: the label and the words carry it.
  const boundaryBox = (children, extra = {}) => ({
    flex_gap: gap(4), padding: box(16), background_background: 'classic', background_color: color('background/subtle'),
    border_border: 'solid', border_width: { ...box(0), right: '2', isLinked: false }, border_color: color('accent/primary'),
    border_radius: box(t.border.radius.sm), ...extra,
  });
  const scopeNote = (id, label, copy) => container('Explicit scope boundary', [
    ...(label ? [eyebrow(label)] : []),
    text(copy, 'body-sm'),
  ], boundaryBox([], { _element_id: id }));
  const nonClaim = (id, title, copy) => column(title, [heading(title, 'h3', 'h3'), text(copy, 'body-sm')], 33.3, boundaryBox([], { _element_id: id, flex_gap: gap(8) }));

  // Context ledger: a relationship sheet, not a rail. Each row is «layer | what it
  // means here»; rows read top to bottom in DOM order at every width and only the
  // label/meaning pair reflows (side by side above tablet, stacked below). There are
  // no numbers, arrows or stations, so nothing implies a hand-off or transmission.
  const ledgerRow = (id, label, copy, children = [], extra = {}) => row(label, [
    column(`${label} — layer`, [heading(label, 'h3', 'h3')], 28),
    column(`${label} — meaning`, [text(copy), ...children], 72, { flex_gap: gap(12) }),
  ], {
    _element_id: id, flex_gap: gap(24), flex_gap_mobile: gap(8), padding: box(20, 24), padding_mobile: box(16),
    background_background: 'classic', background_color: color('surface/card'),
    border_border: 'solid', border_width: { ...box(0), bottom: '1', isLinked: false }, border_color: color('border/subtle'),
    ...extra,
  });
  const lastRadius = { unit: 'px', top: '0', right: '0', bottom: String(t.border.radius.md - 1), left: String(t.border.radius.md - 1), isLinked: false };

  const reservedMedia = (wrapperId, surfaceId, disclosureId, frameEyebrow, frameTitle, frameContext, size = 100) => column('MEDIA REQUIRED — reserved frame, NOT product UI', [
    container('Reserved screenshot surface — replace with verified image later', [
      eyebrow(frameEyebrow, { title_color: white }),
      // A reserved frame is not content: its title stays out of the document outline.
      heading(frameTitle, 'p', 'h2', { title_color: white }),
      text('نمای واقعی محصول؛ پس از تأیید رسانه', 'lede', { text_color: white }),
      text(frameContext, 'caption', { text_color: white }),
    ], {
      _element_id: surfaceId, min_height: px(320), min_height_mobile: px(256), padding: box(32), padding_mobile: box(24, 16),
      flex_justify_content: 'center', background_background: 'classic', background_color: color('ink/primary'), border_radius: box(t.border.radius.md),
    }),
    container('Explicit media disclosure', [text('این قاب، تصویر محیط نرم‌افزار نیست. رسانهٔ واقعی پس از بررسی و تأیید در همین قاب قرار می‌گیرد.', 'caption')], {
      _element_id: disclosureId, padding: box(16),
    }),
  ], size, {
    _element_id: wrapperId, html_tag: 'aside', flex_gap: gap(0),
    background_background: 'classic', background_color: color('surface/card'),
    border_border: 'solid', border_width: box(1), border_color: color('border/subtle'), border_radius: box(t.border.radius.md),
  });

  return [
    band('Internal design review notice', 'review-notice', [text('پیش‌نمایش طراحی · متن و رسانه‌ها پیش از انتشار عمومی نیازمند تأیید هستند.', 'caption')], {
      html_tag: 'aside', padding: box(8, 24), padding_mobile: box(8, 16), background_background: 'classic', background_color: color('background/subtle'),
    }),
    // Hero: the H1 spans the band (not the 46% copy column) so the token policy of at
    // most two desktop lines holds; the copy and the reserved media share the row below.
    band('Hero — prescriptions and documents continue the record and the clinic workflow', 'introduction', [
      eyebrow('نسخه‌ها و اسناد · ثبت و مدیریت در محیط CPMS'),
      heading('نسخه‌ها و اسناد<br>در ادامهٔ پرونده و جریان کار کلینیک', 'h1'),
      row('Hero: bounded prescriptions-and-documents context beside reserved product media', [
        column('Hero copy', [
          // Bounded identity: recording and management inside CPMS, stated as intended
          // scope within recorded product evidence — never as an external connection.
          text(`در ${cpms} ثبت و مدیریت نسخه‌ها و اسناد مراجعه، در ادامهٔ پروندهٔ بیمار و کار پزشک معرفی می‌شود: در همان محیط و در محدودهٔ همان کلینیک — در چارچوب شواهد ثبت‌شدهٔ محصول.`, 'lede'),
          // Mobile-first: actions precede the reserved media so the primary CTA stays
          // inside the first viewport in this single-column hero.
          row('Hero actions', [button('درخواست دمو / مشاوره', '/demo/'), button('دیدن صفحهٔ پروندهٔ بیمار', '/patient-record-continuity/', false)], { flex_gap: gap(12), flex_gap_mobile: gap(12), flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_wrap: 'wrap' }),
          scopeNote('hero-scope', '', 'دامنهٔ این صفحه: ثبت و مدیریت در محیط CPMS. اتصال به سامانهٔ ملی نسخهٔ الکترونیک، بیمه یا داروخانه ادعای این صفحه نیست.'),
          text('مخاطب این صفحه تصمیم‌گیران کلینیک‌اند؛ این صفحه راهنمای بیماران برای دریافت یا پیگیری نسخه نیست.', 'body-sm'),
        ], 46, { _element_id: 'hero-copy' }),
        reservedMedia('product-media-prescription', 'media-prescription-surface', 'media-prescription-disclosure',
          'CPMS / نمای نسخه و سند', 'نسخه و سند در زمینهٔ کار پزشک', 'این فضا برای تصویر تأییدشدهٔ نسخه یا سند در زمینهٔ کار پزشک با داده‌های نمایشی در نظر گرفته شده است.', 54),
      ], { flex_align_items: 'center' }),
    ], { padding: box(32, 24), padding_mobile: box(24, 16) }),
    band('Context ledger — where a prescription or document sits, and where the model stops', 'context', [
      eyebrow('زمینهٔ نسخه و سند'),
      heading('نسخه و سند در چه زمینه‌ای ثبت می‌شود؟'),
      text('سه لایه و یک مرز را کنار هم بخوانید: کار پزشک، زمینهٔ بیمار، و ثبت نسخه یا سند. این نقشه جایگاه نسخه و سند را در ادامهٔ کار کلینیک نشان می‌دهد؛ دامنهٔ هر لایه در نسخهٔ ارائه بررسی می‌شود.'),
      container('Context ledger — conceptual relationship sheet', [
        ledgerRow('ledger-doctor', 'کار پزشک', 'ثبت نسخه‌ها و اسناد ویزیت در امتداد کار پزشک معرفی می‌شود؛ پزشک زمینهٔ همان مراجعه را در فضای کاری خود مرور می‌کند و عمق این نمایش در نسخهٔ ارائه بررسی می‌شود. توضیح کامل‌تر این لایه در صفحهٔ فضای کاری پزشک است.',
          [button('دیدن صفحهٔ فضای کاری پزشک', '/doctor-workspace/', false)]),
        ledgerRow('ledger-patient', 'زمینهٔ بیمار', 'نسخه‌ها و اسناد در پروندهٔ همان بیمار و در محدودهٔ همان کلینیک/سازمان ثبت می‌شوند، نه جدا از سابقهٔ مراجعه. رابطهٔ پرونده با این ثبت‌ها در صفحهٔ پروندهٔ بیمار توضیح داده شده است.',
          [button('دیدن صفحهٔ پروندهٔ بیمار', '/patient-record-continuity/', false)]),
        // The focus row of the page: recording and management inside CPMS.
        ledgerRow('ledger-record', 'نسخه و سند', 'ثبت و مدیریت در محیط CPMS؛ این تمام چیزی است که این صفحه دربارهٔ نسخه و سند معرفی می‌کند.', [], {
          border_width: { ...box(0), right: '4', isLinked: false }, border_color: color('accent/primary'),
        }),
        // The model's stated edge, in the same boundary language as every other clarification.
        ledgerRow('ledger-boundary', 'خارج از محیط CPMS', 'ارسال یا اتصال به سامانه‌های بیرونی در این نقشه جایی ندارد؛ چنین ادعایی در این صفحه مطرح نمی‌شود.', [], {
          background_color: color('background/subtle'), border_width: { ...box(0), right: '2', isLinked: false }, border_color: color('accent/primary'), border_radius: lastRadius,
        }),
      ], {
        _element_id: 'context-ledger', flex_gap: gap(0),
        background_background: 'classic', background_color: color('surface/card'),
        border_border: 'solid', border_width: box(1), border_color: color('border/subtle'), border_radius: box(t.border.radius.md),
      }),
      text('این نقشه توضیحی مفهومی است؛ ساختار فنی داده‌ها یا نمای رابط کاربری CPMS را نشان نمی‌دهد.', 'body-sm'),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Prescriptions inside CPMS, explicitly bounded', 'prescriptions', [
      eyebrow('نسخه‌ها در CPMS'),
      heading('نسخه‌ها؛ ثبت و مدیریت در محیط CPMS'),
      text('نسخه‌ها در همان محیطی ثبت و مدیریت می‌شوند که پرونده و کار پزشک در آن قرار دارد؛ شواهد ثبت‌شدهٔ محصول در همین محدوده است. جزئیات کار با نسخه را در دمو بررسی کنید.'),
      row('Prescription topics and the explicit distinction from national e-prescription', [
        column('Prescription topics', [
          container('Prescription topics list', [
            item('ثبت در ادامهٔ ویزیت', 'نسخه به‌عنوان بخشی از کار ویزیت، در همان پرونده و مسیر کاری کلینیک ثبت می‌شود؛ محدودهٔ ادعای این صفحه همین است.'),
            item('مدیریت در همان محیط', 'نسخهٔ ثبت‌شده هم در همین محیط و کنار زمینهٔ همان بیمار و مراجعه مدیریت می‌شود؛ نحوهٔ دقیق آن در نسخهٔ ارائه بررسی می‌شود.'),
            item('پرسش‌هایی برای جلسهٔ دمو', 'نسخه از کجای کار پزشک ثبت می‌شود؟ پس از ثبت، در کدام زمینهٔ بیمار دیده می‌شود؟ کدام نقش‌ها به آن دسترسی دارند؟'),
          ], { flex_gap: gap(0) }),
        ], 58),
        column('Explicit distinction from national e-prescription', [
          scopeNote('prescriptions-distinction', 'تمایز صریح', 'ثبت و مدیریت نسخه در CPMS با اتصال به سامانهٔ ملی نسخهٔ الکترونیک یکی نیست. چنین اتصالی و ارسال خودکار نسخه به بیرون از CPMS ادعای این صفحه نیست.'),
        ], 42),
      ]),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Documents and files beside patient context, with reserved media', 'documents', [
      eyebrow('اسناد و فایل‌ها'),
      heading('اسناد و فایل‌ها، در کنار زمینهٔ بیمار'),
      row('Document relation and reserved patient-context media', [
        column('Bounded document relation', [
          text('در چارچوب شواهد ثبت‌شدهٔ محصول، اسناد و فایل‌های مراجعه هم در همین محیط و در امتداد پروندهٔ بیمار ثبت و مدیریت می‌شوند؛ محدودهٔ ادعای این صفحه همین است.'),
          container('Document topics', [
            item('در زمینهٔ همان بیمار و کلینیک', 'سند در پروندهٔ همان بیمار و در محدودهٔ همان کلینیک/سازمان معنا پیدا می‌کند، نه در مسیری جدا از اطلاعات بیمار.'),
            // Portal: only at the recorded bounded scope; exposure of every item is never assumed.
            item('رابطهٔ محدود با بخش رو به بیمار', 'در شواهد ثبت‌شدهٔ محصول، محدودهٔ بخش رو به بیمار شامل نسخه‌ها و فایل‌ها هم هست؛ اما اینکه کدام مورد و با چه شرایطی برای بیمار نمایان شود، در دمو بررسی می‌شود و نمایان‌بودن همهٔ نسخه‌ها و اسناد فرض نمی‌شود.'),
          ], { flex_gap: gap(0) }),
          text('قالب و حجم فایل، امضا و مهر یا اشتراک‌گذاری بیرونی: این صفحه دربارهٔ آن‌ها ادعایی ندارد. اگر برای مرکز شما مهم‌اند، در دمو صریحاً بپرسید.', 'body-sm'),
        ], 55, { flex_gap: gap(16) }),
        reservedMedia('product-media-document-context', 'media-document-context-surface', 'media-document-context-disclosure',
          'CPMS / نمای سند و زمینهٔ بیمار', 'سند در کنار زمینهٔ بیمار', 'این فضا برای تصویر تأییدشدهٔ سند یا فایل در کنار زمینهٔ بیمار با داده‌های نمایشی در نظر گرفته شده است.', 45),
      ]),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Role and access context, mechanism level only', 'access', [
      eyebrow('دسترسی و تفکیک اطلاعات'),
      heading('چه کسی نسخه‌ها و اسناد را می‌بیند؟'),
      text('این بخش سازوکارها را در سطح «چگونه» توضیح می‌دهد و پیش از انتشار عمومی بازتأیید می‌شود.'),
      container('Access mechanism topics', [
        item('نقش‌ها و دامنهٔ دسترسی', 'CPMS سازوکارهایی برای نقش‌ها و دامنهٔ دسترسی دارد؛ اینکه هر نقش چه بخشی از نسخه‌ها و اسناد را ببیند، باید در دمو و با نقش‌های مرکز شما سنجیده شود.'),
        item('تفکیک اطلاعات کلینیک/سازمان', 'سازوکارهای محدوده‌دار (scoped) برای تفکیک اطلاعات بین کلینیک‌ها و سازمان‌ها در سند محصول ثبت شده است.'),
        item('سطح این توصیف', 'این توضیح در سطح سازوکار است؛ وضعیت نهایی با نسخهٔ ارائه بررسی می‌شود.'),
      ], { flex_gap: gap(0) }),
    ]),
    band('What this page does not mean — compact clarification', 'not-this', [
      eyebrow('مرزهای روشن'),
      heading('این صفحه چه معنایی ندارد؟'),
      row('Explicit non-claims', [
        nonClaim('not-national', 'ثبت در CPMS، اتصال ملی نیست', 'اتصال به سامانهٔ ملی و ارسال خودکار نسخه به بیرون از CPMS جزو ادعاهای این صفحه نیست؛ آنچه معرفی می‌شود، ثبت و مدیریت در محیط CPMS است.'),
        nonClaim('not-insurance-pharmacy', 'بیمه و داروخانه، جزو ادعاهای این صفحه نیستند', 'هیچ ادعایی دربارهٔ اتصال به بیمه یا داروخانه مطرح نمی‌شود؛ اگر برای مرکز شما مهم است، پیش از تصمیم صریحاً در دمو بپرسید.'),
        nonClaim('not-clinical-support', 'پشتیبانی تصمیم بالینی ادعا نمی‌شود', 'بررسی تداخل دارویی، پیشنهاد خودکار نسخه یا تشخیص، ادعای این صفحه نیست.'),
      ], { flex_gap: gap(24) }),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Bounded questions and objections', 'faq', [
      row('FAQ title and question list', [
        column('FAQ title', [eyebrow('پیش از ارزیابی'), heading('چهار پرسش برای<br>روشن‌شدن محدوده')], 35),
        column('Bounded questions', [
          item('آیا این یعنی اتصال به سامانهٔ ملی نسخهٔ الکترونیک؟', 'خیر. چنین اتصالی ادعای این صفحه نیست؛ آنچه معرفی می‌شود ثبت و مدیریت نسخه و سند در محیط CPMS است.'),
          item('آیا نسخه‌ها و اسناد در ارتباط با زمینهٔ بیمار ثبت می‌شوند؟', 'در محدودهٔ شواهد ثبت‌شدهٔ محصول، بله: نسخه‌ها و اسناد در همان پرونده و مسیر کاری کلینیک ثبت و مدیریت می‌شوند، نه در ابزاری جدا از اطلاعات بیمار. عمق این پیوستگی در نسخهٔ ارائه بررسی می‌شود.'),
          item('آیا جایگزین سامانه‌های ملی می‌شود؟', 'این صفحه چنین ادعایی ندارد؛ نه جایگزینی برای سامانه‌های بیرونی و نه اتصال به آن‌ها. آنچه معرفی می‌شود، ثبت و مدیریت در محیط CPMS است. دربارهٔ آن سامانه‌ها این صفحه پاسخی نمی‌دهد؛ اگر برای مرکز شما مهم‌اند، پیش از تصمیم صریحاً در دمو بپرسید.'),
          item('می‌توانیم رابط واقعی را پیش از تصمیم ببینیم؟', 'مسیر دمو و مشاوره این امکان را فراهم می‌کند. تصاویر واقعی محصول هنوز در این پیش‌نمایش قرار نگرفته‌اند و فرم صفحهٔ دمو فعلاً در حالت فنی و غیرزنده است.'),
        ], 65, { flex_gap: gap(0) }),
      ]),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Demo consultation destination — real page, non-live form', 'next-step', [
      container('Consultation panel', [
        eyebrow('دمو / مشاوره'), heading('نسخه‌ها و اسناد را با سناریوی مرکز خود ببینید'),
        text('ثبت و مدیریت نسخه و سند را در مسیر واقعی کار کلینیک خود مرور کنید؛ جلسهٔ دمو و مشاوره برای همین تنظیم می‌شود.', 'lede'),
        row('Next-step actions', [button('رفتن به صفحهٔ دمو و مشاوره', '/demo/')], { flex_gap: gap(12), flex_gap_mobile: gap(12), flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_wrap: 'wrap' }),
        text('فرم صفحهٔ دمو فعلاً در حالت فنی و غیرزنده است؛ ثبت آن درخواستی را به‌صورت زنده تحویل نمی‌دهد.', 'body-sm'),
      ], {
        padding: box(32), padding_mobile: box(24, 16), background_background: 'classic', background_color: color('surface/card'),
        border_border: 'solid', border_width: { ...box(0), top: '2', isLinked: false }, border_color: color('accent/primary'),
      }),
    ]),
  ];
}

export const pageIdentity = {
  // Supporting capability page. The bounded verb pair «ثبت و مدیریت» sits in the title so a
  // searcher expecting a national e-prescription connection is not invited by mistake; the
  // Cluster-1 commercial heads stay with Product Overview and the Cluster-4 record head with
  // the patient-record page. No SEO plugin: title and excerpt remain WordPress-owned fields.
  title: 'ثبت و مدیریت نسخه‌ها و اسناد در جریان کار کلینیک | برای مدیران کلینیک | CPMS',
  slug: 'prescriptions-documents',
  description: 'برای مدیران کلینیک: ثبت و مدیریت نسخه‌ها و اسناد در ادامهٔ پرونده و کار پزشک، در محیط CPMS و با مرزهای روشن؛ بررسی تناسب در دمو و مشاوره.',
};
