/**
 * Canonical authoring recipe for the CPMS doctor-workspace page
 * («فضای کاری پزشک»). NOT Elementor database JSON and not a vendor export;
 * passed one element at a time to the documented editor Create / Settings commands.
 * Native Free controls only; values resolved from accepted tokens.
 * TARGET — NOT PUBLICATION-APPROVED. See claims.md and PRODUCT-TRUTH.md
 * (ceiling: REVERIFY BEFORE PUBLIC LAUNCH; bounded doctor workspace #8 in the
 * continuation of the clinic flow — no clinical decision support / AI / diagnosis
 * recommendation claims, and no national e-prescription integration claim).
 */
export function doctorWorkspace(t) {
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
  // Compact handoff strip: four labelled positions joined by native RTL arrows.
  // Deliberately not the numbered step rail of the earlier workflow pages — this
  // page's compositional idea is "workspace inside continuing context".
  const station = (id, label, note) => container(label, [
    heading(label, 'p', 'body-sm', { title_color: color('accent/primary') }),
    text(note, 'caption'),
  ], {
    html_tag: 'article', _element_id: id, flex_gap: gap(4), padding: box(12, 0),
    border_border: 'solid', border_width: { ...box(0), bottom: '1', isLinked: false }, border_color: color('border/subtle'),
  });
  const arrow = () => container('Handoff arrow (RTL: onward)', [
    heading('←', 'p', 'h3', { title_color: color('accent/primary') }),
  ], { padding: box(12, 0), flex_gap: gap(0) });
  const panelItem = (label, note) => container(label, [
    heading(label, 'p', 'body-sm', { title_color: color('ink/primary') }),
    text(note, 'caption'),
  ], {
    flex_gap: gap(4), padding: box(12, 0),
    border_border: 'solid', border_width: { ...box(0), bottom: '1', isLinked: false }, border_color: color('border/subtle'),
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
    band('Hero — the doctor workspace continues the real clinic flow', 'introduction', [
      row('Hero: bounded workspace context beside reserved product media', [
        column('Hero copy', [
          eyebrow('فضای کاری پزشک · ادامهٔ جریان کار کلینیک'),
          heading('فضای کاری پزشک<br>در ادامهٔ جریان واقعی کلینیک', 'h1'),
          // Bounded identity: the doctor's work continues the clinic flow, stated as
          // intended scope inside recorded product evidence — never as an isolated screen claim.
          text(`در ${cpms} کار روز پزشک ادامهٔ همان جریان کلینیک معرفی می‌شود: از زمینهٔ نوبت و پذیرش تا کار جاری ویزیت، زمینهٔ بیمار و ادامهٔ پرونده و مستندات — در محدودهٔ شواهد ثبت‌شدهٔ محصول.`, 'lede'),
          // Mobile-first: actions precede the reserved media so the primary CTA stays
          // inside the first viewport in this single-column hero.
          row('Hero actions', [button('درخواست دمو / مشاوره', '/demo/'), button('دیدن مسیر پروندهٔ بیمار', '/patient-record-continuity/', false)], { flex_gap: gap(12), flex_gap_mobile: gap(12), flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_wrap: 'wrap' }),
          text('مخاطب این صفحه تصمیم‌گیران کلینیک و پزشکانی است که تناسب این فضا را ارزیابی می‌کنند؛ این صفحه مسیر نوبت‌گیری بیماران نیست.', 'caption'),
        ], 46, { _element_id: 'hero-copy' }),
        reservedMedia('product-media-workspace', 'media-workspace-surface', 'media-workspace-disclosure',
          'CPMS / نمای فضای کاری پزشک', 'فضای کاری پزشک در CPMS', 'این فضا برای تصویر تأییدشدهٔ فضای کاری پزشک با داده‌های نمایشی در نظر گرفته شده است.', 54),
      ], { flex_align_items: 'center' }),
    ], { padding: box(32, 24), padding_mobile: box(24, 16) }),
    band('Compact handoff from reception context to the doctor workspace', 'handoff', [
      row('Handoff introduction', [
        column('Handoff title', [eyebrow('از پذیرش تا میز کار پزشک'), heading('ادامهٔ جریان<br>در یک نگاه')], 45),
        column('Handoff context', [text('این چهار جایگاه را یک پیوستگی بخوانید، نه چهار ابزار جدا؛ دامنهٔ هر جایگاه در نسخهٔ ارائه بررسی می‌شود.')], 55),
      ], { flex_align_items: 'center' }),
      row('Compact handoff strip, RTL arrows, wrapping on small screens', [
        station('station-reception', 'زمینهٔ پذیرش', 'نوبت و ورود مراجع'),
        arrow(),
        station('station-workspace', 'فضای کاری پزشک', 'کار جاری ویزیت'),
        arrow(),
        station('station-patient', 'زمینهٔ بیمار', 'سابقهٔ همان مراجعه'),
        arrow(),
        station('station-records', 'پرونده و مستندات', 'ثبت و ادامهٔ پیگیری'),
      ], {
        _element_id: 'handoff-strip', flex_direction_tablet: 'row', flex_direction_mobile: 'row',
        flex_wrap: 'wrap', flex_gap: gap(12), flex_gap_mobile: gap(8),
        padding: box(8, 16), padding_mobile: box(8, 12),
        background_background: 'classic', background_color: color('surface/card'),
        border_border: 'solid', border_width: box(1), border_color: color('border/subtle'), border_radius: box(t.border.radius.md),
      }),
      text('زمینهٔ پذیرش و صف پیش از این ادامه، در <a href="/appointment-reception-queue/">جریان کاری نوبت، پذیرش و صف</a> توضیح داده شده است.', 'caption'),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Larger doctor-context explanation with a workspace composition panel', 'workspace-context', [
      row('Workspace explanation and context panel', [
        column('Bounded workspace explanation', [
          eyebrow('مدیریت جریان کار پزشک در کلینیک'),
          heading('فضای کاری پزشک؛<br>زمینهٔ سازمان‌یافتهٔ کار جاری'),
          text('این فضا به پزشک یک زمینهٔ عملیاتی منظم برای کارهای مرتبط با کلینیک و بیمار ارائه می‌دهد — به‌عنوان ادامهٔ جریانی که از پذیرش شروع شده است، نه به‌عنوان یک صفحهٔ جدا افتاده.'),
          container('Bounded workspace topics', [
            item('ادامهٔ کار جاری ویزیت', 'پزشک کار ویزیت روز را در امتداد زمینهٔ همان مراجعه مرور می‌کند؛ عمق این نمایش در نسخهٔ ارائه بررسی می‌شود.'),
            item('زمینه‌های مرتبط در یک مسیر', 'نوبت، زمینهٔ بیمار، پرونده و مستندات مراجعه به‌عنوان ادامهٔ همان جریان کاری کنار هم معنا پیدا می‌کنند، نه در مسیرهای جدا.'),
            item('آنچه ادعا نمی‌شود', 'در این معرفی، فضای کاری پزشک ابزار پشتیبانی تصمیم بالینی، هشدار خودکار یا پیشنهاد تشخیص معرفی نمی‌شود.'),
          ], { flex_gap: gap(0) }),
          boundaryNote('workspace-boundary', 'این صفحه فضای کاری پزشک را در سطح زمینهٔ عملیاتی معرفی می‌کند؛ جزئیات دقیق کنترل‌ها و اقدامات در نسخهٔ ارائه بررسی می‌شود و ادعایی فراتر از شواهد ثبت‌شدهٔ محصول ندارد.'),
        ], 55, { flex_gap: gap(24) }),
        column('Workspace context panel', [
          container('What the workspace context is composed of', [
            heading('این فضا به چه چیزهایی متکی است؟', 'h3'),
            text('ترکیب زمینهٔ کاری این صفحه در یک نگاه؛ نه فهرستی از کنترل‌های دقیق رابط.', 'caption'),
            panelItem('زمینهٔ نوبت و پذیرش', 'وضعیت مراجعه از سمت کلینیک'),
            panelItem('زمینهٔ بیمار', 'اطلاعات و سابقهٔ همان مراجعه'),
            panelItem('پرونده و مستندات', 'ثبت‌های ادامهٔ مسیر'),
          ], {
            _element_id: 'workspace-context-panel', flex_gap: gap(8), padding: box(24), padding_mobile: box(20, 16),
            background_background: 'classic', background_color: color('surface/card'),
            border_border: 'solid', border_width: box(1), border_color: color('border/subtle'), border_radius: box(t.border.radius.md),
          }),
        ], 45),
      ]),
    ]),
    band('Linked patient-context panel with reserved media', 'patient-context', [
      row('Patient context and reserved doctor-plus-detail media', [
        column('Linked patient-context explanation', [
          eyebrow('زمینهٔ بیمار'),
          heading('پیوند کار پزشک با پروندهٔ بیمار'),
          text('ارتباط فضای کاری پزشک با پروندهٔ بیمار صفحهٔ جداگانهٔ خود را دارد؛ اینجا فقط جایگاه آن در مسیر کار پزشک مرور می‌شود: اطلاعات و سابقهٔ مراجعه در محدودهٔ همان کلینیک، در امتداد کار جاری ویزیت.'),
          container('Patient-context topics', [
            item('ادامه در همان محدوده', 'پرونده و سابقهٔ مراجعه در محدودهٔ همان کلینیک/سازمان معنا می‌شود.'),
            item('عمق نمایش در نسخهٔ ارائه', 'میزان دسترسی و جزئیات نمایش زمینهٔ بیمار در جلسهٔ دمو بررسی می‌شود.'),
          ], { flex_gap: gap(0) }),
          row('Patient-context actions', [
            button('دیدن صفحهٔ پروندهٔ بیمار', '/patient-record-continuity/', false),
            text('این بخش جای صفحهٔ پروندهٔ بیمار را نمی‌گیرد؛ توضیح کامل‌تر همان مسیر در همان صفحه است.', 'caption'),
          ], { flex_gap: gap(16), flex_align_items: 'center', flex_direction_tablet: 'row', flex_direction_mobile: 'column' }),
        ], 55, { flex_gap: gap(24) }),
        reservedMedia('product-media-context', 'media-context-surface', 'media-context-disclosure',
          'CPMS / نمای زمینهٔ بیمار', 'فضای کاری پزشک کنار زمینهٔ بیمار', 'این فضا برای تصویر تأییدشدهٔ نمای پزشک در کنار جزئیات بیمار با داده‌های نمایشی در نظر گرفته شده است.', 45),
      ]),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Prescriptions and documents, explicitly bounded', 'documents', [
      eyebrow('نسخه و مستندات'),
      heading('ثبت مستندات ویزیت — با مرز روشن'),
      text('نسخه‌ها و مستندات ویزیت در همان پرونده و مسیر کاری کلینیک ثبت و مدیریت می‌شوند؛ شواهد محصول در همین محدوده ثبت شده است.'),
      container('Documents and prescriptions topics', [
        item('ثبت و مدیریت در محیط CPMS', 'ثبت و پیگیری نسخه و مستندات مراجعه در محیط CPMS انجام می‌شود؛ این تمام چیزی است که این صفحه دربارهٔ مستندات معرفی می‌کند.'),
        item('مرز با سامانه‌های بیرونی', 'پشتیبانی از ثبت سوابق و مستندات در CPMS به‌خودی‌خود به معنای اتصال به سامانهٔ ملی نسخهٔ الکترونیک یا هر سامانهٔ بیرونی دیگر نیست.'),
      ], { flex_gap: gap(0) }),
      boundaryNote('documents-distinction', 'تمایز صریح: ثبت و مدیریت مستندات در CPMS با اتصال به سامانهٔ ملی نسخهٔ الکترونیک یکی نیست؛ چنین اتصالی ادعای این صفحه نیست.'),
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
    band('Why this matters to a multi-doctor clinic', 'multi-doctor', [
      eyebrow('چندپزشکی'),
      heading('چرا این اتصال برای کلینیک چندپزشکی اهمیت دارد؟'),
      row('Multi-doctor operational fit', [
        item('پذیرش و پزشکان در یک زمینهٔ مشترک', 'وقتی چند پزشک و پذیرش هم‌زمان کار می‌کنند، ادامهٔ مسیر هر مراجعه از زمینهٔ پذیرش تا فضای کاری پزشک در یک جریان کاری دنبال می‌شود، نه در هماهنگی شفاهی جدا.'),
        item('مطب مستقل یا مجموعهٔ کوچک‌تر', 'این اتصال در مطب کوچک‌تر هم معنا دارد؛ اما عمق نیاز به هماهنگی به شیوهٔ واقعی کار مرکز بستگی دارد.'),
      ]),
      text('ادعای تناسب عمومی برای همهٔ مراکز یا بهبود اندازه‌گیری‌شدهٔ بهره‌وری مطرح نیست؛ تناسب در جلسهٔ دمو با سناریوی مرکز شما سنجیده می‌شود.', 'caption'),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Bounded questions and objections', 'faq', [
      row('FAQ title and question list', [
        column('FAQ title', [eyebrow('پیش از ارزیابی'), heading('چهار پرسش برای<br>روشن‌شدن محدوده')], 35),
        column('Bounded questions', [
          item('آیا این یک سیستم جدا از پذیرش است؟', 'خیر. فضای کاری پزشک بخشی از همان جریان کار کلینیک معرفی می‌شود: زمینهٔ نوبت و پذیرش ادامه‌ای است که تا کار پزشک و پرونده دنبال می‌شود. عمق این پیوستگی در نسخهٔ ارائه بررسی می‌شود.'),
          item('آیا پزشک به زمینهٔ بیمار دسترسی دارد؟', 'زمینهٔ بیمار و سابقهٔ مراجعه در محدودهٔ پروندهٔ همان کلینیک، در مسیر کار پزشک قرار می‌گیرد؛ جزئیات این مسیر در صفحهٔ پروندهٔ بیمار توضیح داده شده است.'),
          item('آیا معنایش اتصال به نسخهٔ الکترونیک ملی است؟', 'خیر. چنین اتصالی ادعای این صفحه نیست؛ آنچه معرفی می‌شود ثبت و مدیریت نسخه و مستندات در محیط CPMS است.'),
          item('می‌توانیم رابط واقعی پزشک را پیش از تصمیم ببینیم؟', 'مسیر دمو و مشاوره این امکان را فراهم می‌کند. تصاویر واقعی محصول هنوز در این پیش‌نمایش قرار نگرفته‌اند و فرم صفحهٔ دمو فعلاً در حالت فنی و غیرزنده است.'),
        ], 65, { flex_gap: gap(0) }),
      ]),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Demo consultation destination — real page, non-live form', 'next-step', [
      container('Consultation panel', [
        eyebrow('دمو / مشاوره'), heading('فضای کاری پزشک را با نقش‌های واقعی مرکز خود ببینید'),
        text('جریان پذیرش تا کار پزشک را با سناریوی کلینیک خود مرور کنید؛ جلسهٔ دمو و مشاوره برای همین تنظیم می‌شود.', 'lede'),
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
  // Supporting workflow page: natural supporting phrasing around the doctor workspace,
  // never the Cluster-1 commercial head (that stays with Product Overview).
  title: 'فضای کاری پزشک و جریان کار کلینیک | برای مدیران کلینیک | CPMS',
  slug: 'doctor-workspace',
  description: 'برای مدیران کلینیک: فضای کاری پزشک در ادامهٔ جریان پذیرش، با زمینهٔ بیمار و ادامهٔ پرونده و مستندات در یک مسیر کاری؛ بررسی تناسب در دمو و مشاوره.',
};
