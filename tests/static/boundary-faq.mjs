/**
 * Claim-boundary guardrails for the global FAQ / buyer-objection page.
 *
 * Shared by the static validator (authored recipe strings) and the browser runner
 * (strings rendered by WordPress/Elementor), so the two cannot drift apart.
 *
 * These are TEXT guardrails only. They prove wording boundaries in authored/rendered
 * copy; they do NOT verify product capability, and they do not replace human claim
 * review against docs/PRODUCT-TRUTH.md. Every statement on the page remains
 * REVERIFY BEFORE PUBLIC LAUNCH.
 *
 * Two structural rules beyond plain forbidden-phrase matching:
 *  1. A `boundaryTerm` (accounting, gateway, insurance, national e-prescription,
 *     mobile app, AI, certification, guarantee, …) may only appear inside a question
 *     or inside a negated clause — and never beside an offered verb in that clause.
 *  2. A negatedShare ceiling plus a per-answer redirect requirement keep the page a
 *     buyer conversation instead of a disclaimer wall (see §OBJECTION PAGE RULES).
 */
import assert from 'node:assert/strict';

const AR = '\\u0600-\\u06FF';
const start = source => new RegExp(`(?<![${AR}])(?:${source})`, 'u');
const whole = source => new RegExp(`(?<![${AR}])(?:${source})(?![${AR}])`, 'u');

export const stripTags = value => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// Clause-level segments: sentence terminators plus the Persian semicolon, so a
// negation must sit in the same clause as the boundary term it governs.
export const clauses = value => (stripTags(value).match(/[^.؟!؛]+[.؟!؛]?/gu) ?? []).map(c => c.trim()).filter(Boolean);

export const isQuestion = clause => /؟$/u.test(clause);

/** Never allowed on this page, even inside a negation. */
export const hardForbidden = [
  [/تومان|ریال/, 'price or currency'],
  [/رایگان|تخفیف|تخفیفی|جشنواره/, 'free or discount offer'],
  [/٪|۱۰۰ درصد|\b100\s?%|۱۰۰٪/, 'percentage or 100% claim'],
  [/۲۴\s*[/×]\s*۷|24\s*[/×]\s*7/, '24/7'],
  [/mailto:|tel:|https?:\/\//, 'contact detail or external URL'],
  [/بهترین|کامل‌ترین|بی‌رقیب|بدون رقیب|پیشروترین/, 'superlative or self-award'],
  [/رقیب|مقایسهٔ برندها|جدول مقایسه/, 'competitor comparison'],
  [/مشتریان ما|تعداد مشتری|نمونه‌کار|رضایت مشتری|توصیه‌نامه|شهادت مشتری/, 'customer evidence'],
  [/ISO\s?\d|استاندارد بین‌المللی|گواهینامهٔ/, 'invented certification identifier'],
  [/SLA|آپ‌تایم|uptime|۹۹\.[۰-۹]|99\.[0-9]/i, 'SLA, uptime or availability figure'],
  [/پشتیبانی ۲۴|پشتیبانی شبانه‌روزی|پشتیبانی همه‌روزه/, '24/7 or all-hours support'],
  [/مهاجرت|انتقال اطلاعات فعلی|ورود اطلاعات قدیمی|بارگذاری داده‌های فعلی/, 'data-migration promise'],
  [/دورهٔ آموزشی|آموزش تیم|آموزش کاربران|آموزش گام‌به‌گام/, 'training commitment'],
  [/زمان‌بندی پیاده‌سازی|راه‌اندازی در \d|در \d روز|ظرف \d/, 'implementation timeline'],
  [/پیامک|پیام کوتاه/, 'SMS'],
  [/تله‌مدیسین|تله‌مدیسن|ویدیوکال|تماس تصویری|ویزیت آنلاین/, 'telemedicine'],
  [/iOS|Android|اندروید|آی‌اواس/i, 'named mobile platform'],
  [/پوش‌نوتیفیکیشن|اعلان فوری/, 'push notifications'],
  [/کاربر همزمان|لایسنس|لایسنسینگ/, 'licensing or concurrency promise'],
];

/** May appear ONLY inside a question or a negated clause. */
export const boundaryTerms = [
  /حسابداری/u, /دفتر کل/u, /درگاه پرداخت/u, /بیمه/u,
  /نسخهٔ?\s*الکترونیک/u, start('سامانه'), whole('ملی'), /داروخانه/u,
  /هوش مصنوعی/u, /دستیار هوشمند/u, /اپلیکیشن/u,
  /گواهی/u, /انطباق/u, /تضمین/u, /کاملاً امن|امنیت مطلق|محفوظ/u,
  /تشخیص/u, /پیشنهاد خودکار/u, /پشتیبانی تصمیم/u,
  /اشتراک‌گذاری|به اشتراک/u, /بیرونی/u, /ارسال/u, /انتقال/u,
];

export const negation = new RegExp(
  `نیست|نمی|نشد|ندارد|ندارند|خواهد بود(?![${AR}]ها)|خیر|بدون|(?<![${AR}])نه(?![${AR}])`,
  'u',
);

// A clause naming a boundary term must not also assert an offered behaviour
// (a bare «می‌شود» not preceded by «ن»); «نمی‌شود» and friends are negated forms.
export const positiveVerb = /(?<!ن)می‌(?:شود|شوند|کند|کنند|دهد|دهند|توان|توانیم|گیرد|گیرند|باشد|رسد)/u;

/** The eight high-risk buyer misunderstandings must be answered on the page, in these words. */
export const requiredQuestions = [
  'CPMS چیست و چه تفاوتی با یک سیستم نوبت‌دهی ساده دارد؟',
  'CPMS برای چه نوع کلینیک‌هایی مناسب‌تر است؟',
  'آیا CPMS برای کلینیک چندپزشکه مناسب است؟',
  'آیا پذیرش و پزشک در یک جریان متصل دیده می‌شوند؟',
  'پروندهٔ بیمار در CPMS چه جایگاهی دارد؟',
  'پورتال بیمار یعنی اپلیکیشن موبایل؟',
  'آیا CPMS نرم‌افزار حسابداری کامل است یا درگاه پرداخت آنلاین دارد؟',
  'آیا CPMS به بیمه یا نسخهٔ الکترونیک ملی متصل است؟',
  'آیا CPMS از هوش مصنوعی استفاده می‌کند؟',
  'چگونه می‌توان پیش از تصمیم، محیط واقعی محصول را دید؟',
  'قیمت CPMS چگونه مشخص می‌شود؟',
  'درخواست دمو یا مشاوره چگونه انجام می‌شود؟',
];

/** Answers that name a boundary must also send the buyer to something evaluable. */
export const redirectTerms = [
  /قابل بررسی/u, /در دمو/u, /در جلسه/u, /نسخهٔ ارائه/u, /صفحهٔ دمو/u, /دمو و مشاوره/u,
];

/** Pricing stays inside the current boundary: no figure, no package, no term model. */
export const pricingPhrase = 'قیمت عمومی ثابتی در سایت اعلام نشده است';

/**
 * Live lead delivery is NOT CONFIGURED / NOT AUTHORIZED. The page must say the
 * current request path does not reach Sales.
 */
export const nonLiveTerms = [/به فروش متصل نشده|به فروش متصل نیست|ارسال یا ثبت نمی‌شود|دریافت یا ارسال نمی‌شود/u];

export function assertNoHardForbidden(strings, label = 'copy') {
  const text = strings.map(stripTags).join('\n');
  for (const [pattern, reason] of hardForbidden) assert(!pattern.test(text), `${label}: forbidden ${reason} (${pattern})`);
}

/** Every boundary term sits in a negated clause or a question, and never beside an offered verb. */
export function assertBoundaryTermsNegated(strings, label = 'copy') {
  let checked = 0;
  for (const value of strings) {
    for (const clause of clauses(value)) {
      if (!boundaryTerms.some(term => term.test(clause))) continue;
      checked += 1;
      if (isQuestion(clause)) continue;
      assert(negation.test(clause), `${label}: boundary wording must stay negated or asked: ${clause.slice(0, 100)}`);
      assert(!positiveVerb.test(clause), `${label}: a clause naming a boundary must not assert an offered behaviour: ${clause.slice(0, 100)}`);
    }
  }
  return checked;
}

/** Persian typography contract (docs/SITE-ARCHITECTURE.md §9): the errors that generated Persian most often carries. */
export function assertPersianTypography(strings, label = 'copy') {
  const text = strings.map(stripTags).join('\n');
  assert(!/[\u064A\u0643\u0649\u06C0\u0629]/u.test(text), `${label}: Arabic yeh/kaf/heh variants; use Persian ی ک ه`);
  assert(!/[,;?]/.test(text), `${label}: Latin punctuation inside Persian copy; use ، ؛ ؟`);
  assert(!/["'“”‘’]/u.test(text), `${label}: use «…» quotes`);
  assert(!/[0-9\u0660-\u0669]/u.test(text), `${label}: digits in narrative must be Persian (۰–۹)`);
  assert(!new RegExp(`(?<![${AR}])(?:می|نمی)\\s+[${AR}]`, 'u').test(text), `${label}: missing ZWNJ after می/نمی`);
  assert(!new RegExp(`[${AR}]\\s+ها(?![${AR}])`, 'u').test(text), `${label}: space before plural ها; use ZWNJ`);
  assert(!/به\s+(?:عنوان|صورت|خودی)/u.test(text), `${label}: به‌عنوان / به‌صورت / به‌خودی‌خود need ZWNJ`);
  assert(!/سی\s*پی\s*ام\s*اس/u.test(text), `${label}: the Latin product name stays Latin`);
}

/** Share of clauses that carry a negation: a guard against the page turning into all disclaimers. */
export function negatedShare(strings) {
  const all = strings.flatMap(clauses).filter(c => !isQuestion(c));
  const negated = all.filter(c => negation.test(c));
  return { total: all.length, negated: negated.length, share: all.length ? negated.length / all.length : 0 };
}

/**
 * OBJECTION PAGE RULES — a boundary answer must carry a redirect, the page must not
 * become a disclaimer wall, and the question set must stay bounded and grouped.
 */
export function assertObjectionPageShape(answerCopy, label = 'copy') {
  const answers = answerCopy.map(stripTags);
  const redirects = answers.filter(a => redirectTerms.some(term => term.test(a)));
  assert(
    redirects.length >= 8,
    `${label}: for each high-risk boundary the answer must point at something evaluable (found ${redirects.length})`,
  );
  const { share, total } = negatedShare(answerCopy);
  assert(total > 0, `${label}: negation measurement must not be vacuous`);
  assert(share <= 0.5, `${label}: the page must stay a buyer conversation, not a disclaimer wall (negated share ${share.toFixed(2)})`);
  const derived = { redirects: redirects.length, negatedShare: Number(share.toFixed(2)), clauses: total };
  return derived;
}
