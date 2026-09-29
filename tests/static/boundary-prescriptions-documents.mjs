/**
 * Claim-boundary guardrails for the prescriptions-and-documents page.
 *
 * Shared by the static validator (authored recipe strings) and the browser runner
 * (strings rendered by WordPress/Elementor), so the two cannot drift apart.
 *
 * These are TEXT guardrails only. They prove wording boundaries in authored/rendered
 * copy; they do NOT verify product capability, and they do not replace human claim
 * review against docs/PRODUCT-TRUTH.md. Every statement on the page remains
 * REVERIFY BEFORE PUBLIC LAUNCH.
 */
import assert from 'node:assert/strict';

const AR = '\\u0600-\\u06FF';
const start = source => new RegExp(`(?<![${AR}])(?:${source})`, 'u');
const whole = source => new RegExp(`(?<![${AR}])(?:${source})(?![${AR}])`, 'u');

export const stripTags = value => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// Clause-level segments: sentence terminators plus the Persian semicolon, so a negation
// must sit in the same clause as the external-system term it governs.
export const clauses = value => (stripTags(value).match(/[^.؟!؛]+[.؟!؛]?/gu) ?? []).map(c => c.trim()).filter(Boolean);

export const isQuestion = clause => /؟$/u.test(clause);

/** Never allowed, even inside a negation: the page never names these or makes these claims. */
export const hardForbidden = [
  [/درگاه پرداخت/, 'payment gateway'], [/حسابداری/, 'accounting'], [/تومان|ریال/, 'price'],
  [/mailto:|tel:|https?:\/\//, 'contact or URL'], [/۲۴\s*[/×]\s*۷|24\s*[/×]\s*7/, '24/7'], [/پیامک|پیام کوتاه|اس‌ام‌اس/, 'SMS'],
  [/گواهی/, 'certification'], [/انطباق/, 'compliance'], [/کاملاً امن|امن‌ترین|محفوظ|تضمین/, 'absolute security or guarantee'],
  [/۱۰۰٪|۱۰۰ درصد|100%/, '100%'], [/درجهٔ پزشکی|medical-grade/i, 'medical-grade'],
  [/بهترین|کامل‌ترین|بدون رقیب|رایگان/, 'superlative or offer'],
  [/هوش مصنوعی|دستیار هوشمند/, 'AI'], [/اپلیکیشن|اپ موبایل|iOS|Android/i, 'mobile app'],
  [/تله‌مدیسین|طب از راه دور|ویدیوکال|تماس تصویری/, 'telemedicine'],
  [/یکپارچگی کامل|interoperability|قابلیت تعامل/i, 'interoperability'], [/پوش‌نوتیفیکیشن/, 'push notifications'],
  // National and insurer systems are never named; only generic, negated wording is allowed.
  [/تأمین اجتماعی|تامین اجتماعی|بیمه سلامت|سلامت‌ایران|سپاس|ایران‌کد|نظام پزشکی/, 'named national or insurer system'],
  [/نسخه‌نویسی الکترونیک|نسخه نویسی الکترونیک|نسخهٔ دیجیتال|نسخه دیجیتال/, 'e-prescribing or digital-prescription keyword'],
  // Document and prescription features that Product Truth does not support.
  [/امضای دیجیتال|امضای الکترونیک|گواهی دیجیتال|OCR|ذخیره‌سازی ابری|فضای ابری|چاپ/, 'unsupported document feature'],
  [/کتابخانهٔ دارو|بانک دارو|فهرست دارو|نام دارو|قالب‌های نسخه|الگوی نسخه/, 'drug database or prescription templates'],
];

/** May appear ONLY inside a negated clause or a question. */
export const externalTerms = [
  start('سامانه'), whole('ملی'), /بیمه/u, /داروخانه/u, start('دارو'), /ارسال/u, /انتقال/u, start('اتصال|متصل'),
  /امضا/u, whole('مهر'), /اشتراک‌گذاری/u, /تشخیص/u, /تصمیم بالینی/u, /پیشنهاد خودکار/u, whole('قالب'), whole('حجم'), /بیرون/u,
];
export const negation = new RegExp(`نیست|نمی‌|ندارد|ندارند|خیر|بدون|(?<![${AR}])نه(?![${AR}])`, 'u');
// A clause naming an external system must not also assert an offered behaviour (a bare
// «می‌شود» not preceded by «ن»); «نمی‌شود» and friends are the negated forms.
export const positiveVerb = /(?<!ن)می‌(?:شود|شوند|کند|کنند|دهد|دهند|توان|توانیم|گیرد|گیرند|باشد)/u;

/** The internal-versus-national distinction must be readable in the page, verbatim. */
export const distinctionPhrases = [
  'ثبت و مدیریت در محیط CPMS',
  'با اتصال به سامانهٔ ملی نسخهٔ الکترونیک یکی نیست',
  'ارسال خودکار نسخه به بیرون از CPMS',
  'اتصال به بیمه یا داروخانه',
  'ادعای این صفحه نیست',
];

export function assertNoHardForbidden(strings, label = 'copy') {
  const text = strings.map(stripTags).join('\n');
  for (const [pattern, reason] of hardForbidden) assert(!pattern.test(text), `${label}: forbidden ${reason} (${pattern})`);
}

/** Every external-system term sits in a negated clause or a question, and never beside an offered verb. */
export function assertExternalTermsNegated(strings, label = 'copy') {
  let checked = 0;
  for (const value of strings) {
    for (const clause of clauses(value)) {
      if (!externalTerms.some(term => term.test(clause))) continue;
      checked += 1;
      if (isQuestion(clause)) continue;
      assert(negation.test(clause), `${label}: external-system wording must stay negated or asked: ${clause.slice(0, 100)}`);
      assert(!positiveVerb.test(clause), `${label}: a clause naming an external system must not assert an offered behaviour: ${clause.slice(0, 100)}`);
    }
  }
  return checked;
}

/** «نسخهٔ الکترونیک» never reads as a CPMS product name and stays rare (not an SEO target). */
export function assertElectronicPrescriptionBoundary(strings, label = 'copy', maxMentions = 4) {
  const text = strings.map(stripTags).join('\n');
  assert(!/(?:CPMS|سی‌پی‌ام‌اس)\s*نسخهٔ?\s*الکترونیک|نسخهٔ?\s*الکترونیک\s*(?:CPMS|سی‌پی‌ام‌اس)/u.test(text), `${label}: ambiguous «نسخهٔ الکترونیک CPMS» reading`);
  const mentions = (text.match(/نسخهٔ?\s*الکترونیک/gu) ?? []).length;
  assert(mentions <= maxMentions, `${label}: «نسخهٔ الکترونیک» must not become a target term (${mentions} mentions > ${maxMentions})`);
  return mentions;
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
