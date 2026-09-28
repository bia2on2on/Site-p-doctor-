/**
 * Canonical authoring recipe for the CPMS patient-record / information-continuity page
 * («پرونده بیمار و تداوم اطلاعات»). NOT Elementor database JSON and not a vendor export;
 * passed one element at a time to the documented editor Create / Settings commands.
 * Native Free controls only; values resolved from accepted tokens.
 * TARGET — NOT PUBLICATION-APPROVED. See claims.md and PRODUCT-TRUTH.md
 * (ceiling: REVERIFY BEFORE PUBLIC LAUNCH; clinic-scoped record only — no national
 * e-prescription / national health-record integration claim).
 */
export function patientRecordContinuity(t) {
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
  // Continuity stage: a shared top rail at tablet/desktop and an inline-start rail on mobile
  // express "information carries forward" without decorative imagery, arrow widgets or custom CSS.
  const stage = (id, step, title, copy, handoff) => container(title, [
    eyebrow(step),
    heading(title, 'h3'),
    text(copy),
    text(handoff, 'caption'),
  ], {
    html_tag: 'article', _element_id: id, border_border: 'solid',
    border_width: { ...box(0), top: '2', isLinked: false }, border_width_mobile: { ...box(0), right: '2', isLinked: false },
    border_color: color('accent/primary'), padding: box(24),
    padding_mobile: { ...box(24), top: '8', left: '0', isLinked: false },
  });
  const item = (title, copy) => container(title, [heading(title, 'h3', 'h3'), text(copy)], {
    flex_gap: gap(8), padding: box(16, 0), border_border: 'solid', border_width: { ...box(0), bottom: '1', isLinked: false }, border_color: color('border/subtle'),
  });
  const boundaryNote = (id, copy) => container('Explicit scope boundary', [text(copy, 'caption')], {
    _element_id: id, padding: box(16), background_background: 'classic', background_color: color('background/subtle'),
    border_border: 'solid', border_width: { ...box(0), right: '2', isLinked: false }, border_color: color('accent/primary'), border_radius: box(t.border.radius.sm),
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
    band('Hero — continuity of patient information inside clinic workflow', 'introduction', [
      container('Hero content container', [
        eyebrow('پروندهٔ بیمار · تداوم اطلاعات در کلینیک'),
        heading('پروندهٔ بیمار و تداوم اطلاعات<br>در محدودهٔ کلینیک', 'h1'),
        // Bounded identity: clinic-scoped record and continuity, expressed as intended scope
        // within recorded product evidence — never as national record sharing.
        text(`در ${cpms} اطلاعات بیمار در محدودهٔ همان کلینیک/سازمان ثبت می‌شود و مسیر آن تا فضای کاری پزشک، مستندات مراجعه و پیگیری عملیاتی ادامه پیدا می‌کند. این پیوستگی در محدودهٔ شواهد ثبت‌شدهٔ محصول معرفی می‌شود.`, 'lede'),
        // Mobile-first: actions precede the scope panels so the primary CTA stays
        // inside the first viewport in this single-column hero.
        row('Hero actions', [button('درخواست دمو / مشاوره', '/demo/'), button('دیدن مسیر اطلاعات', '#information-flow', false)], { flex_gap: gap(12), flex_gap_mobile: gap(12), flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_wrap: 'wrap' }),
        boundaryNote('scope-boundary', 'دامنه: پرونده در محدودهٔ همان کلینیک/سازمان معنا می‌شود. اتصال به سامانهٔ ملی پروندهٔ الکترونیک سلامت یا نسخهٔ الکترونیک ملی، ادعای این صفحه نیست.'),
        text('مخاطب این صفحه تصمیم‌گیران کلینیک هستند؛ این صفحه مسیر دسترسی خود بیمار به اطلاعاتش نیست.', 'caption'),
      ], { flex_gap: gap(16) }),
    ], { padding: box(32, 24), padding_mobile: box(24, 16) }),
    band('Recognizable operational problem', 'problem', [
      eyebrow('مسئلهٔ عملیاتی'),
      heading('وقتی اطلاعات بیمار در چند جای جدا می‌ماند'),
      text('این توصیف، واقعیت‌های رایج کار کلینیک است؛ نه ادعای ایمنی بالینی و نه نتیجهٔ سنجیده‌شدهٔ محصول.'),
      container('Operational realities', [
        item('زمینهٔ بیمار در لحظهٔ ویزیت', 'اگر سابقهٔ مراجعه‌های قبلی هم‌زمان در دسترس نباشد، پزشک و تیم وقت بیشتری صرف بازسازی تصویر کامل مراجعه می‌کنند.'),
        item('سوابق و مستندات پراکنده', 'نگه‌داشتن سوابق در کاغذ، فایل و ابزارهای جدا، دنبال‌کردن تصمیم‌های قبلی را سخت‌تر می‌کند.'),
        item('پیگیری بین پذیرش، پزشک و مراجعهٔ بعدی', 'وقتی اطلاعات هر مرحله جدا بماند، ادامهٔ کار در کلینیک به پرس‌وجوی دستی وابسته می‌شود.'),
      ], { flex_gap: gap(0) }),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Connected information flow', 'information-flow', [
      row('Flow introduction', [
        column('Flow title', [eyebrow('مسیر اطلاعات در کلینیک'), heading('از زمینهٔ بیمار<br>تا ادامهٔ پیگیری')], 45),
        column('Flow context', [text('این چهار مرحله را به‌شکل یک مسیر پیوسته بخوانید، نه چهار ابزار جدا؛ دامنهٔ هر مرحله در نسخهٔ ارائه بررسی می‌شود.')], 55),
      ], { flex_align_items: 'center' }),
      row('Four connected continuity stages, RTL then vertical mobile', [
        stage('stage-context', 'گام ۰۱ · زمینهٔ بیمار', 'زمینهٔ بیمار', 'اطلاعات پایه و سابقهٔ مراجعهٔ بیمار در پروندهٔ همان کلینیک ثبت می‌شود.', 'به مرحلهٔ بعد می‌رسد: زمینهٔ همین مراجعه.'),
        stage('stage-workspace', 'گام ۰۲ · فضای کاری پزشک', 'فضای کاری پزشک', 'پزشک کار جاری ویزیت را در امتداد همان زمینهٔ بیمار مرور می‌کند؛ عمق این نمایش در نسخهٔ ارائه بررسی می‌شود.', 'به مرحلهٔ بعد می‌رسد: مستندات ثبت‌شدهٔ ویزیت.'),
        stage('stage-document', 'گام ۰۳ · پرونده و مستندات', 'پرونده و مستندات مراجعه', 'مستندات و نسخه‌های ویزیت در همان مسیر پرونده ثبت و مدیریت می‌شوند.', 'به مرحلهٔ بعد می‌رسد: سابقهٔ قابل مرور برای مراجعهٔ بعدی.'),
        stage('stage-follow-up', 'گام ۰۴ · پیگیری عملیاتی', 'ادامهٔ پیگیری در کلینیک', 'مراجعهٔ بعدی و پیگیری‌های عملیاتی روی همان زمینه ادامه پیدا می‌کند.', 'همین پیوستگی، نقطهٔ تمرکز این صفحه است؛ نه اشتراک‌گذاری بیرون از سازمان شما.'),
      ], {
        _element_id: 'continuity-stages', flex_direction_tablet: 'row', flex_direction_mobile: 'column', flex_gap: gap(0), flex_gap_mobile: gap(0),
        background_background: 'classic', background_color: color('surface/card'),
      }),
      text('تداوم اطلاعات به‌معنای اشتراک‌گذاری بیرون از سازمان شما نیست؛ محدودهٔ دسترسی در <a href="#access">دسترسی و تفکیک داده</a> توضیح داده می‌شود.', 'caption'),
    ]),
    band('Patient record context inside CPMS', 'record-context', [
      eyebrow('پرونده در محدودهٔ کلینیک'),
      heading('پروندهٔ الکترونیک بیمار در همین کلینیک چه معنایی دارد؟'),
      row('Record meaning and reserved patient-record media', [
        column('Bounded record meaning', [
          container('Record meaning topics', [
            item('ثبت در محدودهٔ همان کلینیک/سازمان', 'پرونده به همان کلینیک یا سازمانی تعلق دارد که مراجعه در آن ثبت شده است.'),
            item('اطلاعات بیمار و سابقهٔ مراجعه', 'اطلاعات پایه و سابقهٔ مراجعه در پرونده نگه‌داری می‌شود تا در مراجعهٔ بعدی قابل مرور باشد؛ دامنهٔ این نمایش در نسخهٔ ارائه بررسی می‌شود.'),
            item('بدون ادعای سامانهٔ ملی', 'هیچ ادعایی دربارهٔ اتصال به سامانهٔ ملی پروندهٔ الکترونیک سلامت یا اشتراک‌گذاری کشوری اطلاعات بیمار در این سایت مطرح نمی‌شود.'),
          ], { flex_gap: gap(0) }),
          boundaryNote('record-boundary', 'مرز صریح: این صفحه پرونده را در محدودهٔ همان کلینیک/سازمان معرفی می‌کند و ادعای سامانهٔ ملی یا نهادی ندارد.'),
        ], 55, { flex_gap: gap(24) }),
        column('Reserved patient-record media slot', [
          reservedMedia('product-media-record', 'media-record-surface', 'media-record-disclosure',
            'CPMS / نمای پرونده', 'پروندهٔ بیمار در فضای کاری پزشک', 'این فضا برای تصویر تأییدشدهٔ پروندهٔ بیمار و زمینهٔ مرور پزشک با داده‌های نمایشی در نظر گرفته شده است.'),
        ], 45),
      ]),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Doctor workspace relationship', 'doctor-workspace', [
      eyebrow('فضای کاری پزشک'),
      heading('اطلاعات بیمار در مسیر کار روز پزشک'),
      text('فضای کاری پزشک در محدودهٔ شواهد ثبت‌شدهٔ محصول معرفی می‌شود: کار جاری ویزیت در امتداد اطلاعات همان بیمار قرار می‌گیرد.'),
      container('Doctor workspace topics', [
        item('مرور زمینهٔ مراجعه', 'پزشک اطلاعات و سابقهٔ همان بیمار را در جریان ویزیت مرور می‌کند؛ عمق این نمایش در نسخهٔ ارائه بررسی می‌شود.'),
        item('ثبت مستندات ویزیت', 'مستندات ویزیت در همان مسیر پرونده ثبت می‌شود، نه در مسیری جدا از اطلاعات بیمار.'),
        item('آنچه ادعا نمی‌شود', 'در این معرفی، CPMS ابزار پشتیبانی تصمیم بالینی، هشدار خودکار یا پیشنهاد تشخیص معرفی نمی‌شود.'),
      ], { flex_gap: gap(0) }),
      text('جریان نوبت، پذیرش و صف پیش از این مرحله در <a href="/appointment-reception-queue/">جریان کاری نوبت، پذیرش و صف</a> توضیح داده شده است.', 'caption'),
    ]),
    band('Documents and prescriptions, carefully bounded', 'documents', [
      eyebrow('مستندات و نسخه‌ها'),
      heading('ثبت و مدیریت نسخه و مستندات در محیط CPMS'),
      row('Reserved document media and the explicit integration distinction', [
        column('Reserved document media slot', [
          reservedMedia('product-media-document', 'media-document-surface', 'media-document-disclosure',
            'CPMS / نمای مستندات', 'مستندات و نسخه‌های مراجعه', 'این فضا برای تصویر تأییدشدهٔ مستندات و نسخه‌های ویزیت با داده‌های نمایشی در نظر گرفته شده است.'),
        ], 45),
        column('Recorded-in-CPMS versus national-system distinction', [
          container('Documents and prescriptions topics', [
            item('ثبت و مدیریت در محیط CPMS', 'نسخه‌ها و مستندات ویزیت در همان پرونده و مسیر کاری کلینیک ثبت و مدیریت می‌شوند؛ شواهد محصول در این محدوده ثبت شده است.'),
            item('سامانهٔ ملی نسخهٔ الکترونیک: ادعای فعلی سایت نیست', 'این اتصال در این صفحه مطرح نمی‌شود. ثبت نسخه در محیط CPMS با اتصال به سامانهٔ ملی نسخهٔ الکترونیک یکی نیست.'),
          ], { flex_gap: gap(0) }),
          boundaryNote('documents-distinction', 'تمایز صریح: «ثبت و مدیریت در محیط CPMS» تنها چیزی است که این صفحه معرفی می‌کند؛ «اتصال به سامانهٔ ملی نسخهٔ الکترونیک» در ادعاهای فعلی این سایت وجود ندارد.'),
        ], 55, { flex_gap: gap(24) }),
      ]),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Bounded patient portal context', 'patient-portal', [
      eyebrow('دسترسی خود بیمار'),
      heading('اطلاعات بیمار، در دسترس خودش'),
      text('در شواهد ثبت‌شدهٔ محصول، دسترسی بیمار به بخشی از اطلاعات خودش — پروفایل، مراجعه‌ها، نسخه‌ها و فایل‌ها — در محدودهٔ (bounded) ثبت شده است. این بخش در نسخهٔ ارائه بازبینی می‌شود.'),
      boundaryNote('patient-portal-boundary', 'مرز: دسترسی بیمار در همین محدودهٔ ثبت‌شده معرفی می‌شود؛ سرویس‌ها و رابط‌های بیرون از این محدوده ادعای این صفحه نیستند.'),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Access and data separation, mechanism level only', 'access', [
      eyebrow('دسترسی و تفکیک داده'),
      heading('چه کسی به چه اطلاعاتی دسترسی دارد؟'),
      text('این بخش سازوکارها را در سطح «چگونه» توضیح می‌دهد و پیش از انتشار عمومی بازتأیید می‌شود.'),
      container('Access and data-separation topics', [
        item('نقش‌ها و دامنهٔ دسترسی', 'CPMS سازوکارهایی برای نقش‌ها و دامنهٔ دسترسی دارد؛ تناسب آن را با نقش‌های مرکز خود در دمو بررسی کنید.'),
        item('تفکیک اطلاعات کلینیک/سازمان', 'سازوکارهای محدوده‌دار (scoped) برای تفکیک اطلاعات بین کلینیک‌ها و سازمان‌ها در سند محصول ثبت شده است.'),
        item('سطح این توصیف', 'این توضیح در سطح سازوکار است؛ وضعیت نهایی با نسخهٔ ارائه بررسی می‌شود.'),
      ], { flex_gap: gap(0) }),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Audience and operational fit', 'fit', [
      eyebrow('برای چه مجموعه‌ای؟'),
      heading('کجا این مسیر بیشترین معنا را دارد؟'),
      row('Primary and secondary audiences', [
        item('کلینیک چندپزشکی با مراجعه‌های پیوسته', 'جایی که اطلاعات بیمار بین چند پزشک، پذیرش و مراجعه‌های بعدی دنبال می‌شود، تداوم اطلاعات مسئلهٔ روزمرهٔ کار است.'),
        item('مطب مستقل یا مجموعهٔ کوچک‌تر', 'پروندهٔ بیمار در مطب کوچک‌تر هم معنا دارد؛ عمق نیاز به مستندات و تفکیک دسترسی به شیوهٔ واقعی کار مرکز بستگی دارد.'),
      ]),
      text('ادعای تناسب برای همهٔ مراکز مطرح نیست؛ تناسب در جلسهٔ دمو با سناریوی مرکز شما سنجیده می‌شود.', 'caption'),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
    band('Bounded questions and objections', 'faq', [
      row('FAQ title and question list', [
        column('FAQ title', [eyebrow('پیش از ارزیابی'), heading('چهار پرسش برای<br>روشن‌شدن محدوده')], 35),
        column('Bounded questions', [
          item('آیا این فقط یک فایل بیمار مستقل است؟', 'خیر. پرونده در CPMS بخشی از جریان کاری کلینیک معرفی می‌شود: زمینهٔ بیمار، فضای کاری پزشک، مستندات و پیگیری عملیاتی در یک مسیر دیده می‌شوند.'),
          item('به جریان کاری کلینیک متصل است؟', 'این صفحه پیوستگی مراحل کار در یک محیط را توضیح می‌دهد؛ نه اتصال به سامانه‌های بیرونی. عمق پیوستگی هر مرحله در نسخهٔ ارائه بررسی می‌شود.'),
          item('آیا معنایش اتصال به سامانهٔ ملی نسخهٔ الکترونیک یا پروندهٔ الکترونیک سلامت است؟', 'خیر. این اتصال ادعای فعلی این سایت نیست. آنچه معرفی می‌شود ثبت و مدیریت نسخه و مستندات در محیط CPMS است، نه سامانهٔ ملی.'),
          item('می‌توانیم رابط واقعی را پیش از خرید ببینیم؟', 'مسیر دمو و مشاوره در صفحهٔ درخواست دمو آمده است. تصاویر واقعی محصول هنوز در این پیش‌نمایش قرار نگرفته‌اند و فرم آن صفحه فعلاً در حالت فنی و غیرزنده است.'),
        ], 65, { flex_gap: gap(0) }),
      ]),
    ], { background_background: 'classic', background_color: color('surface/card') }),
    band('Demo consultation destination — real page, non-live form', 'next-step', [
      container('Consultation panel', [
        eyebrow('دمو / مشاوره'), heading('مسیر اطلاعات مرکز خود را مبنا قرار دهید'),
        text('تداوم اطلاعات بیمار را با نقش‌های واقعی کلینیک خود مرور کنید؛ جلسهٔ دمو و مشاوره برای همین تنظیم می‌شود.', 'lede'),
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
  // Bounded cluster-4 phrasing, clinic scope explicit in the same title, buyer marker retained.
  title: 'پرونده الکترونیک بیمار در محدودهٔ کلینیک | برای مدیران کلینیک | CPMS',
  slug: 'patient-record-continuity',
  description: 'برای مدیران کلینیک: پرونده بیمار در محدودهٔ همان کلینیک و تداوم اطلاعات آن از زمینهٔ مراجعه تا فضای کاری پزشک، مستندات و پیگیری عملیاتی؛ بررسی تناسب در دمو و مشاوره.',
};
