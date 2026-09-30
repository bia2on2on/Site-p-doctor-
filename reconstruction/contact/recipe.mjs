/**
 * Canonical authoring recipe for the CPMS Contact utility page.
 * «تماس با ما» (/contact/)
 *
 * NOT Elementor database JSON and NOT a vendor export: the structure below is
 * passed one element at a time to the documented editor Create / Settings
 * commands. All visual settings are native Elementor Free controls; values
 * come from accepted design-system tokens. No Pro widget, no add-on pack, no
 * custom CSS, no media reservation, no badge/icon, no structured data.
 *
 * TARGET — NOT PUBLICATION-APPROVED.
 * See claims.md and docs/PRODUCT-TRUTH.md.
 *
 * DYNAMIC VALUES: the actual contact VALUES are never authored here. The page
 * embeds the narrowly scoped theme shortcode `[cpms_contact_details]` once;
 * it renders the current Koorosh Theme Settings values (email always via the
 * authorized public default; phone/address only when configured) at runtime.
 * This keeps the Elementor layout editable while contact details stay
 * administrator-editable in تنظیمات کوروش with no page rebuild.
 *
 * PAGE PURPOSE: two clear routes — (1) demo/consultation evaluation via the
 * dedicated /demo/ page; (2) general communication via the public contact
 * details. This is NOT a second lead form. No support channel, response-time
 * promise or SLA is claimed anywhere; the support model remains unverified.
 */

export function contactPage(t) {
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

  return [
    // Pre-release technical notice (established reconstruction pattern)
    band('Internal design review notice', 'review-notice', [
      text('پیش‌نمایش طراحی · این صفحه پیش از انتشار عمومی بازبینی می‌شود.', 'caption'),
    ], {
      html_tag: 'aside',
      padding: box(8, 24),
      padding_mobile: box(8, 16),
      background_background: 'classic',
      background_color: color('background/subtle'),
    }),

    // Section 1: Hero — the two routes in one sentence each
    band('Hero', 'hero', [
      container('Hero content container', [
        eyebrow('تماس و ارتباط با CPMS'),
        heading('تماس با ما', 'h1'),
        text('برای ارزیابی تناسب CPMS با مرکز درمانی خود و درخواست جلسهٔ دمو و مشاوره، از مسیر اختصاصی درخواست دمو استفاده کنید. برای ارتباط عمومی، اطلاعات تماس در ادامهٔ همین صفحه آمده است.', 'lede'),
      ], { flex_gap: gap(16) }),
    ]),

    // Section 2: Demo / consultation route (CTA; no delivery or response-time promise)
    band('Demo and consultation route', 'demo-route', [
      eyebrow('درخواست دمو و مشاوره'),
      heading('برای ارزیابی محصول، از مسیر درخواست دمو اقدام کنید', 'h2'),
      text('اگر می‌خواهید CPMS را برای کلینیک یا مرکز درمانی خود ارزیابی کنید یا جلسهٔ معرفی و مشاوره هماهنگ کنید، فرم درخواست دمو مسیر اصلی است. جزئیات این مسیر در صفحهٔ دمو توضیح داده شده است.'),
      button('درخواست دمو / مشاوره', '/demo/'),
      text('تکمیل فرم درخواست دمو به‌معنی تضمین تحویل پیام یا تعهد زمان پاسخ نیست.', 'caption'),
    ], { background_background: 'classic', background_color: color('surface/card') }),

    // Section 3: General contact (values rendered at runtime from Koorosh Settings)
    band('General contact', 'general-contact', [
      eyebrow('ارتباط عمومی'),
      heading('اطلاعات تماس عمومی', 'h2'),
      text('برای ارتباط عمومی با پروژهٔ CPMS می‌توانید از اطلاعات زیر استفاده کنید. این اطلاعات از تنظیمات سایت خوانده می‌شوند و همیشه آخرین مقدار ثبت‌شده را نشان می‌دهند.'),
      node('text-editor', 'Contact Details Renderer', {
        editor: '[cpms_contact_details]',
        _element_id: 'contact-details-widget',
      }),
      text('برای درخواست دمو و مشاوره از فرم اختصاصی همان مسیر استفاده کنید؛ این صفحه فرم جداگانه‌ای ندارد.', 'caption'),
    ]),

    // Section 4: Short clarification + privacy link
    band('Contact guidance and privacy', 'privacy-note', [
      eyebrow('پیش از برقراری تماس'),
      heading('ملاحظات مهم در برقراری تماس', 'h2'),
      text('لطفاً از ارسال اطلاعات بیماران یا هرگونه دادهٔ پزشکی از طریق راه‌های ارتباطی عمومی خودداری کنید. این راه‌ها برای هماهنگی‌های عمومی و غیرپزشکی در نظر گرفته شده‌اند.'),
      text('جزئیات نحوهٔ برخورد با اطلاعات در <a href="/privacy/">حریم خصوصی وب‌سایت</a> آمده است.', 'caption'),
    ], { background_background: 'classic', background_color: color('background/subtle') }),
  ];
}

export const pageIdentity = {
  title: 'تماس با ما | CPMS',
  slug: 'contact',
  description: 'راه‌های ارتباط عمومی با CPMS در کنار مسیر اختصاصی درخواست دمو و مشاوره؛ اطلاعات تماس از تنظیمات سایت نمایش داده می‌شود و این صفحه فرم جداگانه‌ای ندارد.',
};
