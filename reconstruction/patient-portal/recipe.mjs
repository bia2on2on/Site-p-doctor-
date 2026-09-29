/**
 * Canonical authoring recipe for the CPMS patient-portal page
 * («پورتال بیمار»). NOT Elementor database JSON and not a vendor export;
 * passed one element at a time to the documented editor Create / Settings commands.
 * Native Free controls only; values resolved from accepted tokens.
 * TARGET — NOT PUBLICATION-APPROVED. See claims.md and PRODUCT-TRUTH.md
 * (ceiling: REVERIFY BEFORE PUBLIC LAUNCH; bounded patient-facing portal #7
 * beside the clinic workflow — no mobile-app claim, no national e-prescription
 * integration claim, no public patient-directory framing).
 */
export function patientPortal(t) {
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
  const boundaryNote = (id, copy) => container('Explicit scope boundary', [text(copy, 'caption')], {
    _element_id: id, padding: box(16), background_background: 'classic', background_color: color('background/subtle'),
    border_border: 'solid', border_width: { ...box(0), right: '2', isLinked: false }, border_color: color('accent/primary'),
    border_radius: box(t.border.radius.sm),
  });
  // Two-sides-of-the-experience panel: patient-facing side, clinic-side context,
  // and a neutral middle bridge for the clinic workflow itself. Deliberately not
  // the doctor-workspace handoff strip — no arrows, no stations, no implied
  // synchronization; the relationship is a neutral side-by-side composition that
  // stacks vertically on tablet/mobile (browser-tested at all viewports).
  const side = (id, label, title, note, bridge = false) => container(label, [
    eyebrow(label),
    heading(title, 'h3'),
    text(note, 'caption'),
  ], {
    _element_id: id, ...(bridge ? {} : { html_tag: 'article' }),
    flex_gap: gap(8), padding: box(24), padding_mobile: box(20, 16),
    background_background: 'classic', background_color: color(bridge ? 'background/subtle' : 'surface/card'),
    border_border: 'solid', border_width: box(1), border_color: color('border/subtle'), border_radius: box(t.border.radius.md),
  });
  const reservedMedia = (wrapperId, surfaceId, disclosureId, frameEyebrow, frameTitle, frameContext, size = 100) => column('MEDIA REQUIRED — reserved frame, NOT product UI', [
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
  ], size, {
    _element_id: wrapperId, html_tag: 'aside', flex_gap: gap(0),
    background_background: 'classic', background_color: color('surface/card'),
    border_border: 'solid', border_width: box(1), border_color: color('border/subtle'), border_radius: box(t.border.radius.md),
  });

  return [
    band('Internal design review notice', 'review-notice', [text('پیش‌نمایش طراحی · متن و رسانه‌ها پیش از انتشار عمومی نیازمند تأیید هستند.', 'caption')], {
      html_tag: 'aside', padding: box(8, 24), padding_mobile: box(8, 16), background_background: 'classic', background_color: color('background/subtle'),
    }),
    band('Hero — the patient side in relation to the clinic workflow', 'introduction', [
      row('Hero: bounded portal context beside reserved product media', [
        column('Hero copy', [
          eyebrow('پورتال بیمار · بخش بیمار در کنار جریان کار کلینیک'),
          heading('پورتال بیمار<br>در ارتباط با جریان کار کلینیک', 'h1'),
          // Bounded identity: a patient-facing area exists as part of the CPMS model,
          // stated as intended scope inside recorded product evidence — never as a
          // consumer app, a patient-acquisition route, or a directory.
          text(`در ${cpms} یک بخش رو به بیمار در کنار جریان کار کلینیک معرفی می‌شود: زمینه‌ای محدود که به اطلاعات و مستندات همان مراجعه پیوند می‌خورد — در محدودهٔ شواهد ثبت‌شدهٔ محصول.`, 'lede'),
          // Mobile-first: actions precede the reserved media so the primary CTA stays
          // inside the first viewport in this single-column hero.
          row('Hero actions', [button('درخواست دمو / مشاوره', '/demo/'), button('دیدن صفحهٔ پروندهٔ بیمار', '/patient-record-continuity/', false)], { flex_gap: gap(12), flex_gap_mobile: gap(12), flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_wrap: 'wrap' }),
          text('مخاطب این صفحه تصمیم‌گیران کلینیک است؛ نه مسیر جذب بیمار، نه جست‌وجوی پزشک و نه نوبت‌گیری بیماران.', 'caption'),
        ], 46, { _element_id: 'hero-copy' }),
        reservedMedia('product-media-portal', 'media-portal-surface', 'media-portal-disclosure',
          'CPMS / نمای بخش بیمار', 'پورتال بیمار در CPMS', 'این فضا برای تصویر تأییدشدهٔ بخش رو به بیمار با داده‌های نمایشی در نظر گرفته شده است.', 54),
      ], { flex_align_items: 'center' }),
    ], { padding: box(32, 24), padding_mobile: box(24, 16) }),
    band('Bounded patient-side context', 'patient-side', [
      eyebrow('بخش رو به بیمار'),
      heading('یک بخش رو به بیمار، در محدوده‌ای مشخص'),
      text('در مدل CPMS، بیمار هم یک جایگاه مشخص دارد: بخشی رو به بیمار که در کنار کار داخلی کلینیک معنا پیدا می‌کند. این بخش در سطح زمینهٔ عملیاتی معرفی می‌شود و عمق نمایش آن در نسخهٔ ارائه بررسی می‌شود.'),
      container('Patient-side topics', [
        item('محدودهٔ ثبت‌شده', 'در شواهد ثبت‌شدهٔ محصول، این محدوده پروفایل، مراجعه‌ها، نسخه‌ها و فایل‌ها را در بر می‌گیرد؛ همین چهارچوب، سقف معرفی این صفحه است.'),
        item('آنچه ادعا نمی‌شود', 'در این معرفی، برای بخش بیمار اقدام یا خدمت آنلاینی فراتر از همین محدودهٔ ثبت‌شده معرفی نمی‌شود؛ دامنهٔ دقیق در نسخهٔ ارائه بررسی می‌شود.'),
      ], { flex_gap: gap(0) }),
      boundaryNote('patient-side-boundary', 'این صفحه بخش بیمار را در سطح زمینهٔ عملیاتی معرفی می‌کند؛ جزئیات دقیق نمایش و اقدامات در نسخهٔ ارائه بررسی می‌شود و ادعایی فراتر از شواهد ثبت‌شدهٔ محصول ندارد.'),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Two sides of the experience — neutral connection model', 'connection', [
      eyebrow('دو سوی یک تجربه'),
      heading('بخش بیمار در کنار جریان کار کلینیک'),
      text('این سه جایگاه را یک هم‌نشینی در یک مسیر کاری بخوانید، نه سه ابزار جدا و نه ادعای همگام‌سازی خودکار؛ دامنهٔ هر جایگاه در نسخهٔ ارائه بررسی می‌شود.'),
      row('Two sides with a neutral middle bridge, stacked on tablet/mobile', [
        side('side-patient', 'سمت بیمار', 'زمینهٔ محدود بیمار', 'پروفایل، مراجعه‌ها، نسخه‌ها و فایل‌ها — در همین محدودهٔ ثبت‌شده'),
        side('bridge-workflow', 'میان مسیر', 'جریان کار کلینیک', 'نوبت، پذیرش، فضای کاری پزشک و پرونده در یک مسیر کاری', true),
        side('side-clinic', 'سمت کلینیک', 'اطلاعات و مستندات بیمار', 'ثبت‌های همان مراجعه در محدودهٔ همان کلینیک'),
      ], {
        _element_id: 'connection-model', flex_direction: 'row', flex_direction_tablet: 'column',
        flex_gap: gap(32), flex_gap_mobile: gap(24),
        padding: box(8, 16), padding_mobile: box(8, 12),
        background_background: 'classic', background_color: color('surface/card'),
        border_border: 'solid', border_width: box(1), border_color: color('border/subtle'), border_radius: box(t.border.radius.md),
      }),
      text('این مدل، یک مدل ارتباط خنثی است: سه جایگاه در یک مسیر کاری کنار هم دیده می‌شوند، بدون ادعای تبادل خودکار اطلاعات بین آن‌ها.', 'caption'),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Linked patient-record continuity', 'record-continuity', [
      eyebrow('تداوم پرونده'),
      heading('پیوند بخش بیمار با پروندهٔ بیمار'),
      text('ارتباط بخش بیمار با پرونده صفحهٔ جداگانهٔ خود را دارد؛ اینجا فقط جایگاه آن در مسیر بخش بیمار مرور می‌شود: اطلاعات و سابقهٔ مراجعه در محدودهٔ همان کلینیک، در امتداد زمینهٔ بیمار.'),
      container('Record-continuity topics', [
        item('ادامه در همان محدوده', 'پرونده و سابقهٔ مراجعه در محدودهٔ همان کلینیک/سازمان معنا می‌شود.'),
        item('عمق نمایش در نسخهٔ ارائه', 'میزان نمایش اطلاعات بیمار در بخش رو به بیمار، در جلسهٔ دمو بررسی می‌شود.'),
      ], { flex_gap: gap(0) }),
      row('Record-continuity actions', [
        button('دیدن صفحهٔ پروندهٔ بیمار', '/patient-record-continuity/', false),
        text('این بخش جای صفحهٔ پروندهٔ بیمار را نمی‌گیرد؛ توضیح کامل‌تر همان مسیر در همان صفحه است.', 'caption'),
      ], { flex_gap: gap(16), flex_align_items: 'center', flex_direction_tablet: 'row', flex_direction_mobile: 'column' }),
    ]),
    band('Prescriptions and documents, explicitly bounded', 'documents', [
      eyebrow('نسخه و مستندات'),
      heading('مستندات ویزیت — با مرز روشن'),
      row('Reserved information media and the explicit integration distinction', [
        reservedMedia('product-media-documents', 'media-documents-surface', 'media-documents-disclosure',
          'CPMS / نمای اطلاعات و مستندات', 'اطلاعات و مستندات بیمار در مسیر کلینیک', 'این فضا برای تصویر تأییدشدهٔ اطلاعات و مستندات مراجعه با داده‌های نمایشی در نظر گرفته شده است.', 45),
        column('Recorded-in-CPMS versus national-system distinction', [
          container('Documents and prescriptions topics', [
            item('ثبت و مدیریت در محیط CPMS', 'نسخه‌ها و مستندات مراجعه در همان پرونده و مسیر کاری کلینیک ثبت و مدیریت می‌شوند؛ شواهد محصول در همین محدوده ثبت شده است.'),
            item('مرز با سامانه‌های بیرونی', 'پشتیبانی از ثبت سوابق و مستندات در CPMS به‌خودی‌خود به معنای اتصال به سامانهٔ ملی نسخهٔ الکترونیک یا هر سامانهٔ بیرونی دیگر نیست.'),
          ], { flex_gap: gap(0) }),
          boundaryNote('documents-distinction', 'تمایز صریح: ثبت و مدیریت مستندات در CPMS با اتصال به سامانهٔ ملی نسخهٔ الکترونیک یکی نیست؛ چنین اتصالی ادعای این صفحه نیست.'),
        ], 55, { flex_gap: gap(24) }),
      ]),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Role and access context, mechanism level only', 'access', [
      eyebrow('نقش‌ها و دسترسی'),
      heading('نقش‌ها و دامنهٔ دسترسی، در سطح سازوکار'),
      text('این بخش سازوکارها را در سطح «چگونه» توضیح می‌دهد و پیش از انتشار عمومی بازتأیید می‌شود.'),
      container('Access mechanism topics', [
        item('نقش‌ها و دامنهٔ دسترسی', 'CPMS سازوکارهایی برای نقش‌ها و دامنهٔ دسترسی دارد؛ تناسب آن را با نقش‌های مرکز خود در دمو بررسی کنید.'),
        item('تفکیک اطلاعات کلینیک/سازمان', 'سازوکارهای محدوده‌دار (scoped) برای تفکیک اطلاعات بین کلینیک‌ها و سازمان‌ها در سند محصول ثبت شده است.'),
        item('سطح این توصیف', 'این توضیح در سطح سازوکار است؛ وضعیت نهایی با نسخهٔ ارائه بررسی می‌شود.'),
      ], { flex_gap: gap(0) }),
    ]),
    band('What this page is not — concise objection prevention', 'not-this', [
      eyebrow('مرزهای روشن'),
      heading('این صفحه چه چیزی نیست؟'),
      text('سه مرز روشن، برای جلوگیری از سوءتفاهم — با همان لحن مثبت ارزیابی:'),
      container('Explicit non-claims', [
        item('پورتال، به‌معنای ادعای اپلیکیشن موبایل نیست', 'بخش رو به بیمار در این معرفی یک بخش از مدل CPMS است؛ ادعای اپلیکیشن موبایل در این صفحه مطرح نمی‌شود.'),
        item('ثبت مستندات، به‌معنای اتصال ملی نیست', 'ثبت و مدیریت نسخه و مستندات در محیط CPMS با اتصال به سامانهٔ ملی نسخهٔ الکترونیک یکی نیست.'),
        item('پورتال، فهرست عمومی بیماران نیست', 'این بخش برای جست‌وجوی پزشک یا مرور عمومی بیماران ساخته نشده است؛ مخاطب آن بیمارِ همان مراجعه در محدودهٔ همان کلینیک است.'),
      ], { flex_gap: gap(0) }),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Why this matters to the evaluating clinic', 'fit', [
      eyebrow('ارزش برای ارزیاب'),
      heading('چرا این بخش برای کلینیک اهمیت دارد؟'),
      row('Buyer-value topics', [
        item('تصویر کامل‌تر از CPMS', 'وجود بخش رو به بیمار نشان می‌دهد CPMS فقط ابزار داخلی پذیرش نیست؛ تصمیم‌گیر می‌تواند جایگاه بیمار را هم در همان مدل ارزیابی کند.'),
        item('ارزیابی تناسب با سناریوی مرکز', 'دامنهٔ بخش بیمار را با نقش‌ها و مسیر واقعی مرکز خود در جلسهٔ دمو بسنجید؛ همین گفت‌وگو مبنای تصمیم است.'),
      ]),
      text('ادعای بهبود اندازه‌گیری‌شدهٔ رضایت یا کارایی مطرح نیست؛ تناسب در جلسهٔ دمو با سناریوی مرکز شما سنجیده می‌شود.', 'caption'),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Bounded questions and objections', 'faq', [
      row('FAQ title and question list', [
        column('FAQ title', [eyebrow('پیش از ارزیابی'), heading('چهار پرسش برای<br>روشن‌شدن محدوده')], 35),
        column('Bounded questions', [
          item('آیا پورتال بیمار یک اپلیکیشن موبایل است؟', 'خیر. بخش رو به بیمار در این معرفی یک بخش از مدل CPMS است و ادعای اپلیکیشن موبایل در این صفحه مطرح نمی‌شود.'),
          item('آیا این بخش از جریان کار کلینیک جداست؟', 'خیر. بخش رو به بیمار در کنار جریان کار کلینیک معرفی می‌شود: زمینهٔ محدود بیمار، جریان کار کلینیک و اطلاعات پرونده در یک مسیر کاری دیده می‌شوند.'),
          item('آیا معنایش اتصال به سامانهٔ ملی نسخهٔ الکترونیک است؟', 'خیر. چنین اتصالی ادعای این صفحه نیست؛ آنچه معرفی می‌شود ثبت و مدیریت نسخه و مستندات در محیط CPMS است.'),
          item('می‌توانیم رابط واقعی بخش بیمار را پیش از تصمیم ببینیم؟', 'مسیر دمو و مشاوره این امکان را فراهم می‌کند. تصاویر واقعی محصول هنوز در این پیش‌نمایش قرار نگرفته‌اند و فرم صفحهٔ دمو فعلاً در حالت فنی و غیرزنده است.'),
        ], 65, { flex_gap: gap(0) }),
      ]),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Demo consultation destination — real page, non-live form', 'next-step', [
      container('Consultation panel', [
        eyebrow('دمو / مشاوره'), heading('بخش بیمار را با سناریوی مرکز خود ببینید'),
        text('جایگاه بیمار در کنار جریان کار کلینیک را با نقش‌های واقعی مرکز خود مرور کنید؛ جلسهٔ دمو و مشاوره برای همین تنظیم می‌شود.', 'lede'),
        row('Next-step actions', [
          button('رفتن به صفحهٔ دمو و مشاوره', '/demo/'),
          button('دیدن صفحهٔ پروندهٔ بیمار', '/patient-record-continuity/', false),
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
  // Supporting capability page: natural supporting phrasing around the patient portal,
  // never the Cluster-1 commercial head (that stays with Product Overview) and never
  // the Cluster-4 electronic-record head (that stays with the patient-record page).
  title: 'پورتال بیمار و جریان کار کلینیک | برای مدیران کلینیک | CPMS',
  slug: 'patient-portal',
  description: 'برای مدیران کلینیک: جایگاه بخش رو به بیمار در کنار جریان کار کلینیک و اطلاعات پرونده، با مرزهای روشن؛ بررسی تناسب در دمو و مشاوره.',
};
