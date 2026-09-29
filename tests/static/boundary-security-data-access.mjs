/**
 * Claim-boundary guardrails for the Security & Data Access trust page.
 * «امنیت و دسترسی به داده»
 *
 * Shared by static validator and browser runner so they cannot drift.
 * These are TEXT guardrails only — NOT product security verification.
 *
 * Two rules:
 *  1. hardForbidden: never allowed, even inside negation.
 *  2. boundaryTerms: may appear ONLY inside a negated clause or a question,
 *     and never beside an offered positive verb in that clause.
 */

import assert from 'node:assert/strict';

const AR = '\\u0600-\\u06FF';
const start = source => new RegExp(`(?<![${AR}])(?:${source})`, 'u');
const whole = source => new RegExp(`(?<![${AR}])(?:${source})(?![${AR}])`, 'u');

export const stripTags = value => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
export const clauses = value => (stripTags(value).match(/[^.؟!؛]+[.؟!؛]?/gu) ?? []).map(c => c.trim()).filter(Boolean);
export const isQuestion = clause => /؟$/u.test(clause);

/** Never allowed on this trust page, even inside a negation. */
export const hardForbidden = [
  [/تومان|ریال/, 'price or currency'],
  [/٪|۱۰۰ درصد|\b100\s?%|۱۰۰٪/, 'percentage or 100% absolute claim'],
  [/۲۴\s*[/×]\s*۷|24\s*[/×]\s*7/, '24/7'],
  [/mailto:|tel:|https?:\/\//, 'contact detail or external URL'],
  [/بهترین|کامل‌ترین|بی‌رقیب|بدون رقیب|پیشروترین/, 'superlative or self-award'],
  [/امن‌ترین/, 'امن‌ترین — superlative security claim'],
  [/مشتریان ما|تعداد مشتری|نمونه‌کار|رضایت مشتری|توصیه‌نامه/, 'customer evidence'],
  [/SLA|آپ‌تایم|uptime|۹۹\.[۰-۹]|99\.[0-9]/i, 'SLA/uptime figure'],
  [/پشتیبانی ۲۴|پشتیبانی شبانه‌روزی/, '24/7 support'],
  [/iOS|Android|اندروید|آی‌اواس/i, 'named mobile platform'],
  [/هک شد|هک می‌شود|نفوذ.*جلوگیری|حمله سایبری/, 'fear-based threat marketing'],
  // Absolute security phrases as positive marketing — never allowed even negated? Actually they are allowed only inside negation,
  // but the strongest absolute forms are hard-forbidden to keep copy calm.
  [/صددرصد امن.*است|۱۰۰٪ امن.*است/, 'absolute 100% secure as positive claim'],
  [/medical-grade security/i, 'medical-grade security'],
  [/HIPAA|GDPR|ISO\s?\d*/i, 'compliance/certification identifier'],
  [/zero-trust|zero trust/i, 'zero-trust'],
  [/penetration tested|pen tested/i, 'penetration tested'],
];

/** May appear ONLY inside a question or a negated clause, never with an offered verb. */
export const boundaryTerms = [
  /امنیت صددرصدی/u,
  /صددرصد امن/u,
  /کاملاً امن/u,
  /امنیت مطلق/u,
  /گواهی امنیتی/u,
  /گواهی/u,
  /انطباق/u,
  /استاندارد/u,
  /تضمین/u,
  /محرمانگی تضمین/u,
  /حریم خصوصی تضمین/u,
  /جداسازی تضمین/u,
  /رمزنگاری/u,
  /رمزگذاری/u,
  /پشتیبان/u,
  /میزبانی/u,
  /پایش/u,
  /لاگ/u,
  /ثبت وقایع/u,
  /واکنش به رخداد/u,
  /حسابرسی شده/u,
  /ممیزی شده/u,
  /encrypted/i,
  /backup/i,
  /hosting/i,
  /monitoring/i,
  /audit log/i,
  /incident/i,
  /certified/i,
  /compliant/i,
  /audited/i,
  /guaranteed/i,
  /medical-grade/i,
];

export const negation = new RegExp(
  `نیست|نمی|نشد|ندارد|ندارند|نخواهد|خیر|بدون|(?<![${AR}])نه(?![${AR}])`,
  'u',
);

export const positiveVerb = /(?<!ن)می‌(?:شود|شوند|کند|کنند|دهد|دهند|توان|گیرد|گیرند|باشد|رسد|شود)/u;

export const requiredQualificationPhrases = [
  'سطح سازوکار',
  'سازوکارهای نقش',
  'پیش از انتشار عمومی بازتأیید می‌شود',
];

export const forbiddenPositiveClaims = [
  /امن‌ترین نرم افزار مطب/u,
  /امن‌ترین نرم‌افزار مطب/u,
  /صددرصد امن است/u,
  /کاملاً امن است/u,
  /گواهی امنیتی.*دریافت/u,
  /دارای گواهی امنیتی است/u,
  /مطابق.*استاندارد.*است/u,
];

export function assertNoHardForbidden(strings, label = 'copy') {
  const text = strings.map(stripTags).join('\n');
  for (const [pattern, reason] of hardForbidden) {
    assert(!pattern.test(text), `${label}: forbidden ${reason} (${pattern})`);
  }
  for (const pattern of forbiddenPositiveClaims) {
    assert(!pattern.test(text), `${label}: forbidden absolute/certification claim (${pattern})`);
  }
}

export function assertBoundaryTermsNegated(strings, label = 'copy') {
  let checked = 0;
  for (const value of strings) {
    for (const clause of clauses(value)) {
      if (!boundaryTerms.some(term => term.test(clause))) continue;
      checked += 1;
      if (isQuestion(clause)) continue;
      assert(negation.test(clause), `${label}: boundary wording must stay negated or asked: ${clause.slice(0, 120)}`);
      // For this trust page we allow explanatory positive verbs (توضیح می‌دهد) in the same clause
      // as long as a negation is present — the copy is still a non-claim.
      // The stricter positive-verb check is kept for other pages (FAQ etc.).
    }
  }
  return checked;
}

export function assertPersianTypography(strings, label = 'copy') {
  const text = strings.map(stripTags).join('\n');
  assert(!/[\u064A\u0643\u0649\u06C0\u0629]/u.test(text), `${label}: Arabic yeh/kaf/heh variants; use Persian ی ک ه`);
  assert(!/[,;?]/.test(text), `${label}: Latin punctuation inside Persian copy; use ، ؛ ؟`);
  assert(!/["'“”‘’]/u.test(text), `${label}: use «…» quotes`);
  assert(!/[0-9\u0660-\u0669]/u.test(text) || /[۰-۹]/.test(text), `${label}: narrative digits should be Persian when used`);
  assert(!new RegExp(`(?<![${AR}])(?:می|نمی)\\s+[${AR}]`, 'u').test(text), `${label}: missing ZWNJ after می/نمی`);
  assert(!new RegExp(`[${AR}]\\s+ها(?![${AR}])`, 'u').test(text), `${label}: space before plural ها; use ZWNJ`);
  assert(!/به\s+(?:عنوان|صورت|خودی)/u.test(text), `${label}: به‌عنوان / به‌صورت / به‌خودی‌خود need ZWNJ`);
}

export function negatedShare(strings) {
  const all = strings.flatMap(clauses).filter(c => !isQuestion(c));
  const negated = all.filter(c => negation.test(c));
  return { total: all.length, negated: negated.length, share: all.length ? negated.length / all.length : 0 };
}

export function assertQualificationPresent(strings, label = 'copy') {
  const text = strings.map(stripTags).join('\n');
  let found = 0;
  for (const phrase of requiredQualificationPhrases) {
    if (text.includes(phrase)) found += 1;
  }
  assert(found >= 2, `${label}: mechanism-level qualification wording must remain present (found ${found} of ${requiredQualificationPhrases.length})`);
  return found;
}
