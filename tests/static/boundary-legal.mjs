/**
 * Shared legal, privacy, and honesty boundary checks for the Privacy (/privacy/)
 * and Website Terms (/terms/) utility pages. Used by both static recipe
 * validation and live browser validation.
 */
import assert from 'node:assert/strict';

const AR = '\\u0600-\\u06FF';

export const stripTags = value => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const toText = input => (Array.isArray(input) ? input.map(stripTags).join('\n') : stripTags(input));

export const FORBIDDEN_LEGAL_PATTERNS = [
  // Never claim data is never stored anywhere (email infrastructure/inboxes can retain it)
  [/در هیچ\s*جا ذخیره نمی\u200cشود|هرگز در هیچ\s*جا ذخیره نمی\u200cشود|در هیچ سامانه\u200cای ذخیره نمی\u200cشود/u, 'false claim that data is never stored anywhere'],
  // Never promise fabricated retention timelines or automatic deletion schedules
  [/(?:پس از|ظرف)\s*[۰-۹0-9]+\s*(?:روز|ماه|سال|ساعت)\s*(?:حذف|پاک)\s*می\u200cشود/u, 'fabricated retention or deletion timeline'],
  // Never claim "legally approved" or statutory/regulatory compliance
  [/مورد تأیید حقوقی قرار گرفته است|تأییدشده از نظر حقوقی|کاملاً منطبق با قوانین|دارای تأییدیه\u200cی? قانونی/u, 'unverified legal approval or statutory compliance claim'],
  [/\b(?:GDPR|HIPAA|ISO\s*27001|SOC\s*2|FHIR|HL7)\b/iu, 'unverified international standard or regulatory compliance token'],
  // Never claim absolute security or guaranteed confidentiality
  [/امنیت مطلق تضمین|محرمانگی کامل تضمین|۱۰۰٪\s*امن|غیرقابل\s*نفوذ/u, 'absolute security or guaranteed confidentiality claim'],
  // Never invent corporate registration numbers, tax IDs, courts, DPOs, or phone numbers
  [/شماره\s*ثبت\s*شرکت\s*[:：]\s*[۰-۹0-9]+/u, 'fabricated company registration number'],
  [/شناسه\s*ملی\s*[:：]\s*[۰-۹0-9]+/u, 'fabricated national corporate/tax ID'],
  [/دادگاه\s*صالح\s*(?:تهران|ایران|شهرستان)/u, 'fabricated court or jurisdiction clause'],
  [/مسئول حفاظت از داده\u200cها\s*[:：]/u, 'fabricated DPO appointment'],
  [/\bSLA\b|پشتیبانی\s*۲۴\/۷|پاسخ\u200cگویی\s*فوری\s*تضمین/u, 'unverified SLA or 24/7 support promise'],
  // Never expose ugly raw internal English placeholders in public Persian copy
  [/BUSINESS\/LEGAL INPUT REQUIRED|LEGAL REVIEW REQUIRED BEFORE PUBLIC LAUNCH/u, 'raw internal status placeholder leaked into public copy'],
  // Never stuff commercial head terms or forbidden product claims into legal pages
  [/بهترین نرم\u200cافزار|نرم\u200cافزار رایگان|درگاه پرداخت آنلاین فعال|اتصال به نسخه\u200cی? الکترونیک ملی|اتصال مستقیم به بیمه/u, 'forbidden commercial or unverified product claim'],
  [/lorem ipsum|placeholder|todo|tbd/iu, 'placeholder text'],
];

export const REQUIRED_PRIVACY_SIGNALS = [
  ['نام و نام خانوادگی پاسخ‌گو', 'Demo form field: contact person name'],
  ['نام مرکز درمانی یا مطب', 'Demo form field: clinic/organization name'],
  ['روش و شماره تماس یا ایمیل کاری', 'Demo form field: work phone or email'],
  ['نوع مرکز درمانی', 'Demo form field: organization type'],
  ['تعداد تقریبی پزشکان همکار', 'Demo form field: approximate doctor count'],
  ['موضوع یا اولویت گفت‌وگو', 'Demo form field: optional discussion topic'],
  ['لطفاً از وارد کردن اطلاعات بیماران یا داده‌های پزشکی خودداری کنید', 'explicit prohibition on patient/medical data'],
  ['در پایگاه‌دادهٔ وردپرس', 'explicit disclosure that submissions are not stored in WordPress DB'],
  ['biatoweb@gmail.com', 'authorized demo-request recipient disclosure'],
  ['زیرساخت میزبانی وب‌سایت', 'honest disclosure that hosting/mail infrastructure may process data'],
  ['صندوق پستی', 'honest disclosure that the recipient mailbox may retain messages'],
  ['هیچ ابزار تحلیل رفتار بازدیدکنندگان، تگ‌منیجر یا پیکسل تبلیغاتی', 'disclosure that no analytics or advertising tracking is currently installed'],
  ['دورهٔ زمانی مشخص برای نگهداری یا حذف پیام‌های دریافتی در صندوق ایمیل هنوز به‌صورت سیاست مصوب تعیین نشده است', 'honest disclosure that no retention period has yet been approved'],
  ['نیازمند بازبینی و تأیید حقوقی', 'restrained legal review notice'],
];

export const REQUIRED_TERMS_SIGNALS = [
  ['ماهیت معرفی و اطلاع‌رسانی وب‌سایت', 'informational/marketing purpose of the website'],
  ['عدم ایجاد خرید آنی یا قرارداد تجاری با ثبت فرم دمو', 'demo request does not create an instant purchase or commercial contract'],
  ['عدم انتشار جدول قیمت ثابت عمومی', 'no public fixed pricing is currently published'],
  ['مبنای نهایی قابلیت‌ها و دامنهٔ فعلی محصول', 'product descriptions are informational and subject to final verification'],
  ['عدم ارائهٔ مشاورهٔ پزشکی', 'no medical advice is provided by the marketing website'],
  ['ممنوعیت ارسال اطلاعات بیماران', 'users must not submit patient/medical information through the demo form'],
  ['تضمینی برای دسترس‌پذیری بدون وقفه', 'no guarantee of uninterrupted website availability'],
  ['حقوق مالکیت محتوا', 'generic non-fabricated intellectual property notice'],
  ['نیازمند بازبینی و تأیید حقوقی', 'restrained legal review notice'],
];

export function assertPersianTypography(input, label = 'copy', fail = msg => assert.fail(msg)) {
  const text = toText(input);
  if (/[\u064A\u0643\u0649\u06C0\u0629]/u.test(text)) fail(`${label}: Arabic yeh/kaf/heh variants; use Persian ی ک ه`);
  if (/[,;?]/.test(text)) fail(`${label}: Latin punctuation inside Persian copy; use ، ؛ ؟`);
  if (/["'“”‘’]/u.test(text)) fail(`${label}: use «…» quotes`);
  if (/[0-9\u0660-\u0669]/u.test(text)) fail(`${label}: digits in narrative must be Persian (۰–۹)`);
  if (new RegExp(`(?<![${AR}])(?:می|نمی)\\s+[${AR}]`, 'u').test(text)) fail(`${label}: missing ZWNJ after می/نمی`);
  if (new RegExp(`[${AR}]\\s+ها(?![${AR}])`, 'u').test(text)) fail(`${label}: space before plural ها; use ZWNJ`);
  if (/به\s+(?:عنوان|صورت|خودی)/u.test(text)) fail(`${label}: به‌عنوان / به‌صورت / به‌خودی‌خود need ZWNJ`);
}

export function assertLegalBoundary(input, label = 'copy', fail = msg => assert.fail(msg)) {
  const text = toText(input);
  for (const [pattern, reason] of FORBIDDEN_LEGAL_PATTERNS) {
    if (pattern.test(text)) fail(`${label}: contains forbidden pattern (${reason}): ${pattern}`);
  }
}

export function assertPrivacyTruthfulness(input, fail = msg => assert.fail(msg)) {
  const fullText = toText(input);
  for (const [needle, reason] of REQUIRED_PRIVACY_SIGNALS) {
    if (!fullText.includes(needle)) {
      fail(`Privacy page copy is missing required truthful disclosure (${reason}): "${needle}"`);
    }
  }
}

export function assertTermsTruthfulness(input, fail = msg => assert.fail(msg)) {
  const fullText = toText(input);
  for (const [needle, reason] of REQUIRED_TERMS_SIGNALS) {
    if (!fullText.includes(needle)) {
      fail(`Terms page copy is missing required truthful disclosure (${reason}): "${needle}"`);
    }
  }
}
