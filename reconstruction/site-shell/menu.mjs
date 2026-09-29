/**
 * Canonical navigation definition for the CPMS sales-site shell.
 * NOT menu HTML and not a WordPress export: the browser runner builds real
 * WordPress menus from this structure through documented WP-CLI menu commands
 * and assigns them to the Koorosh-registered "primary"/"footer" locations.
 *
 * Buyer journey this encodes: خانه → محصول → جریان‌های کاری → درخواست دمو.
 * Only real reconstructed pages are referenced — no fake pages, no invented
 * contact/legal/social destinations. Labels are visitor-facing navigation
 * labels; internal page titles/slugs are never exposed as menu copy.
 */
export const primaryMenu = {
  name: 'ناوبری اصلی',
  location: 'primary',
  items: [
    { title: 'خانه', slug: 'cpms-home' },
    { title: 'محصول', slug: 'product-overview' },
    {
      title: 'جریان‌های کاری',
      url: '#', // Disclosure parent only; the explicit submenu toggle opens it.
      children: [
        { title: 'نوبت، پذیرش و صف', slug: 'appointment-reception-queue' },
        { title: 'پرونده بیمار', slug: 'patient-record-continuity' },
        { title: 'فضای کاری پزشک', slug: 'doctor-workspace' },
        { title: 'پورتال بیمار', slug: 'patient-portal' },
      ],
    },
    { title: 'درخواست دمو / مشاوره', slug: 'demo' },
  ],
};

export const footerMenu = {
  name: 'ناوبری فوتر',
  location: 'footer',
  items: [
    { title: 'خانه', slug: 'cpms-home' },
    { title: 'محصول', slug: 'product-overview' },
    { title: 'نوبت، پذیرش و صف', slug: 'appointment-reception-queue' },
    { title: 'پرونده بیمار', slug: 'patient-record-continuity' },
    { title: 'فضای کاری پزشک', slug: 'doctor-workspace' },
    { title: 'پورتال بیمار', slug: 'patient-portal' },
    // Trust group (SITE-ARCHITECTURE §6.4): objection handling sits with the
    // conversion item, not in the primary navigation.
    { title: 'پرسش‌های متداول', slug: 'faq' },
    { title: 'امنیت و دسترسی به داده', slug: 'security-data-access' },
    { title: 'درخواست دمو / مشاوره', slug: 'demo' },
  ],
};

/** Flat list of { title, slug } for every slug-referenced item in both menus. */
export function slugReferences() {
  const seen = new Map();
  for (const menu of [primaryMenu, footerMenu]) {
    for (const item of menu.items) {
      for (const node of [item, ...(item.children || [])]) {
        if (node.slug && !seen.has(node.slug)) seen.set(node.slug, node.title);
      }
    }
  }
  return [...seen.entries()].map(([slug, title]) => ({ slug, title }));
}
