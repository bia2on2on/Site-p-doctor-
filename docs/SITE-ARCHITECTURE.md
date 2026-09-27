# Site Architecture + Messaging + Design Direction — قرارداد اجرایی سایت CPMS

**وضعیت سند:** Baseline برنامه‌ریزی برای بازبینی مالک محصول / بازبینی بصری Milestone A — سند **پیشنهادی** است و هیچ Gate را Passed نمی‌کند.

**تاریخ این نسخه:** 2026-09-27 (UTC) — بازنگری ۲ در PR #3: افزودن §19 (قرارداد سلامت جست‌وجو/ایندکس‌پذیری/عملکرد و پذیرش Search Console) و رفع P-01/P-02

**نقش این سند:** ترجمۀ تصمیم‌های پذیرفته‌شدۀ استراتژیک به یک **قرارداد اجرایی (concrete) برای صفحات، پیام‌ها و جهت طراحی**؛ به‌گونه‌ای که Slice بعدی (Design System / Foundation و سپس Homepage) بدون کشف مجدد intent تجاری قابل اجرا باشد.

**این سند عمداً نیست:**

- پیاده‌سازی یا مشخصات اجرایی نهایی UI؛
- فهرست کامل قابلیت‌های تأییدشدۀ CPMS (مرجع ادعا: `docs/PRODUCT-TRUTH.md`)؛
- کپی نهایی فروش (Final Sales Copy) یا کلمات کلیدی تأییدشده SEO؛
- انتخاب برند تجاری نهایی، رنگ نهایی برند، یا ابزار Analytics/CRM؛
- هر نوع نصب/پیکربندی WordPress، Elementor، Theme، Plugin یا ابزار؛
- هیچ پیکربندی Google/Search Console، حساب، property، verification token یا analytics (§19.7).

**ارجاعات و تقسیم مسئولیت سند:**

| سند | نقش | این سند با آن چه می‌کند |
|---|---|---|
| `AGENTS.md` | قواعد عملیاتی، گیت‌ها، بازنشستگی Writer | رعایت می‌کند؛ جایگزین آن نمی‌شود |
| `docs/ROADMAP.md` | مرجع برنامه، فازها، گیت‌ها، سؤالات باز | **تکرار نمی‌کند**؛ تصمیم‌های DECIDED را به قرارداد تبدیل می‌کند و شماره بخش مرجع را می‌آورد |
| `docs/PRODUCT-TRUTH.md` | مرجع زنده کنترل ادعا (Claim Control) | هر ادعای قابلیت را به آن ارجاع می‌دهد؛ مجوز ادعای جدید **نمی‌دهد** |
| `docs/AGENT-TOOLING.md` | حاکمیت ابزار Agentها | ارجاع می‌دهد؛ چیزی نصب/تأیید نمی‌کند |

**وضعیت گیت‌ها (ثبت صریح):** نه Implementation Gate و نه Publication Gate در این سند Passed **نشده‌اند**. این سند الزامات آن‌ها را قابل‌اجرا می‌کند و جایگزین بررسی آن‌ها نمی‌شود.

---

## 0. واژگان وضعیت در این سند

برچسب‌های موجود، بدون تغییر معنا، از اسناد مرجع وام گرفته شده‌اند:

- `DECIDED` / `REQUIRES PRODUCT VERIFICATION` / `OPEN BUSINESS DECISION` / `DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT` — از `docs/ROADMAP.md` بخش ۱؛
- `PUBLISHABLE NOW` / `REVERIFY BEFORE PUBLIC LAUNCH` / `NOT ALLOWED` و `TARGET — NOT PUBLICATION-APPROVED` — از `docs/PRODUCT-TRUTH.md`.

برچسب‌های جدید این سند:

**۰.۱ وضعیت محتوا/کپی (Content Status — بخش ۱۵):**

| برچسب | معنا |
|---|---|
| **VERIFIED COPY** | متنی که شواهد ثبت‌شدۀ `docs/PRODUCT-TRUTH.md` آن را با مجوز انتشار فعلی پشتیبانی می‌کند. در Snapshot حاضر **هیچ موردی این وضعیت را ندارد**، زیرا هیچ ادعایی `PUBLISHABLE NOW` نیست |
| **TARGET — NOT PUBLICATION-APPROVED** | متن/بلوک جهت نهایی را مشخص می‌کند ولی برای انتشار عمومی **غیرمجاز** است؛ پیش از انتشار باید بازنویسی/تأیید شود |
| **BUSINESS INPUT REQUIRED** | بدون تصمیم/داده مالک کسب‌وکار (مقصد Lead، اطلاعات تماس، مدل Support، قیمت) تکمیل‌ناپذیر |
| **MEDIA REQUIRED** | به Screenshot/Video واقعی محصول نیاز دارد؛ بدون آن بلوک کامل نیست |
| **LEGAL REVIEW REQUIRED** | نیازمند تأیید حقوقی (Privacy، Terms، Consent، Retention) |

**۰.۲ وضعیت صفحات در Sitemap:**

| برچسب | معنا |
|---|---|
| **CORE AT LAUNCH** | بدون آن سایت از نظر تجاری کامل نیست؛ در Staging از همان ابتدا معماری‌اش ساخته می‌شود |
| **CONDITIONAL ON PRODUCT TRUTH** | جایگاه معماری رزرو می‌شود؛ انتشار/ساخت محتوا مشروط به تأیید شواهد طبق `docs/PRODUCT-TRUTH.md` |
| **DEFERRED / ONLY WHEN BUSINESS INPUT EXISTS** | تا وجود ورودی واقعی کسب‌وکار ساخته **نمی‌شود**؛ صفحه خالی برای تکمیل Sitemap ممنوع است |

**قاعده طلایی:** هر بلوک از یک وضعیت Sitemap و هر کامپوننت متن از یک وضعیت محتوا جداگانه پیروی می‌کند؛ وجود صفحه ≠ مجوز انتشار متن آن صفحه.

---

## 1. مدل تجاری اصلی (Primary Commercial Model)

**۱.۱ مخاطب اصلی انتشار (Primary launch audience) — DECIDED**

- **کلینیک‌های چندپزشکی و مراکز درمانی** با جریان‌های کاری عملیاتی چندگانه؛
- **تصمیم‌گیرنده کلینیک** (مدیر/صاحب کلینیک و نقش‌های نزدیک به تصمیم خرید) مخاطب اول پیام است؛
- واحد تحلیل برای طراحی سایت: سازمانی که در آن **پزشک**، **منشی/پذیرش** و چند جریان کاری عملیاتی به‌صورت هم‌زمان هماهنگ می‌شوند (نه فرد تنها).

**مخاطب ثانویه — DECIDED:** پزشکان مستقل و مطب‌های کوچک. سایت برای این بخش هم پیام دارد، اما معماری و اولویت صفحات حول کلینیک چندپزشکی چیده می‌شود.

**۱.۲ Conversion اصلی — DECIDED**

- تبدیل اصلی سایت: **درخواست دمو / مشاوره (Demo / Consultation)**؛
- مدل فروش اولیه: **Assisted Sale** — سایت فروشگاه آنلاین نیست؛
- **Ecommerce فرض نمی‌شود**: Checkout، پرداخت آنلاین، خرید مستقیم و قیمت عمومی ثابت نه فرض‌اند نه مجاز (ROADMAP بخش ۸ و ۹؛ `PRODUCT-TRUTH` بخش ۱ «جهت تجاری»).

**۱.۳ طبیعت محصولِ هدف — DECIDED**

این وب‌سایت رابطِ نهاییِ بازاریابی/فروش برای **محصول CPMS کامل و آماده ارائه (Ready-to-Offer)** است و بر همین اساس معماری، طراحی و (در زمان خودش) پیاده‌سازی می‌شود.

سایت **نیست**:

- سایت Early-Access یا Beta؛
- بازاریابی انتخاب‌مشتری (Selected-Customer)؛
- Landing Page موقت «به‌زودی» / Coming-Soon.

**تفکیک الزامی (از `docs/PRODUCT-TRUTH.md` بخش ۱):** «Target Presentation State» (سایت طوری طراحی/ساخته می‌شود که محصول کامل را ارائه دهد) از «Current Product Truth» (آن‌چه امروز قابل ادعا است) جداست. این سند معماری را برای حالت هدف می‌چیند و **هیچ** ادعای «در دسترس بودن» از آن نتیجه نمی‌شود.

**۱.۴ گیت انتشار عمومی — بدون تغییر، ارجاع**

Public launch صرفاً از طریق Publication Gate و Launch Truth Gate در `docs/PRODUCT-TRUTH.md` (بخش ۶) ممکن است؛ تا آن زمان فقط محیط Development/Staging (سیاست ROADMAP بخش ۳). این سند آن را بازتعریف یا شل نمی‌کند.

**۱.۵ موفقیت — DECIDED (ارجاع)**

معیار موفقیت، Lead واجد شرایط و پیشرفت آن در مسیر فروش است، نه ترافیک خام (ROADMAP بخش ۱۵). سنجه‌سازی پیام‌رسانی، CTAها و اولویت‌بندی صفحات بر همین معیار انجام می‌شود؛ هیچ بلوک یا صفحۀ «ترافیک‌ساز» بدون نقش در مسیر Lead پذیرفته نیست.

---

## 2. قرارداد Positioning

**۲.۱ فهم هدف (Target understanding) — DECIDED، مشروط**

CPMS باید چنین فهمیده شود:

> **محصول یکپارچه و حرفه‌ای مدیریت کلینیک** — نه صرفاً «نرم‌افزار نوبت‌دهی».

- **یکپارچگی (Integration) محور اصلی تمایز درک‌شونده است:** نوبت ← پذیرش/صف ← ویزیت ← درمان/نسخه ← مالی/رکورد به‌عنوان یک سیستم واحد فهمیده شوند، نه ابزارهای جدا.
- این جهت‌گیری **فراتر از Product Truth نمی‌رود**: هیچ گامِ این زنجیره پیش از تأیید، در متن عمومی به‌عنوان قابلیت موجود بیان نمی‌شود (ROADMAP بخش ۳ «تم‌های مالک» + Product Truth Gate؛ `PRODUCT-TRUTH` بخش ۳).
- **عبارت نمونۀ جهت (INTERNAL؛ TARGET — NOT PUBLICATION-APPROVED؛ مجوز انتشار ندارد):** «مدیریت حرفه‌ای کلینیک، ساده و یکپارچه» (متن ثبت‌شده در ROADMAP بخش ۱؛ کپی نهایی در مرحله محتوا ساخته می‌شود، اینجا اختراع نمی‌شود).

**۲.۲ بازشناسی‌پذیری در برابر ادعا**

هدف این است که مخاطب **ساختار محصول** را یکپارچه بفهمد، نه اینکه ادعای کمی/مطلق بشنود. «یکپارچه» در این سند یک **اصل معماری پیام** است؛ تبدیل آن به ادعهای قابل‌انتشار («CPMS همهٔ این کارها را می‌کند») نیازمند بازنویسی بر پایه `PRODUCT-TRUTH` در لحظهٔ تأیید متن است.

**۲.۳ کلمات/الگوهای ممنوع در هر متن آینده — DECIDED (منفی‌نما)**

| الگو | وضعیت |
|---|---|
| شعارهای مبهم مثل «آیندهٔ پزشکی» و معادل‌های شعاری بدون ارجاع به کارکرد مشخص | **Avoid** |
| بازاریابی مبتنی بر ترس، اغراق، یا «کلینیک شما خراب است» | **ممنوع (DECIDED — ROADMAP §7)** |
| صفت‌های مطلق/بدون سند: «کامل‌ترین»، «بهترین»، «بدون رقیب»، «امن‌ترین»، «۱۰۰٪ امن» | **NOT ALLOWED بدون سند (ROADMAP §16)** |
| زبان عمومی و کلیشه‌ای AI/SaaS (هایپ هوش مصنوعی، «automated intelligence» و مانند آن) | **Avoid** — و ادعای AI-Powered برای محصول در فهرست DO-NOT-CLAIM (`PRODUCT-TRUTH §4`) است |
| اعداد/آمار/مشتری/گواهی بدون شواهد | **NOT ALLOWED** (قاعده Social Proof — ROADMAP §16) |

**۲.۴ قاعدهٔ بازتأیید**

هر جملهٔ نهاییِ Positioning که در صفحات عمومی منتشر می‌شود، **در لحظهٔ انتشار** باید مقابل Launch Truth Gate بازتأیید شود. متن‌های این سند (و نمونه‌هایشان) هم مشمول همین قاعده‌اند.

---

## 3. توالی پیام در Homepage (Homepage Message Sequence)

قرارداد: Homepage **روایت متوالی A–I** است، نه دانش‌نامۀ کامل محصول. ترتیب روایتی `DECIDED` در ROADMAP بخش ۷ است؛ این بخش همان را به **بلوک‌های قابل‌اجرا** با وضعیت محتوا/رسانه تبدیل می‌کند.

| # | Block ID | بلوک | قرارداد محتوا (چه چیزی باید منتقل شود) | CTA این بلوک | وضعیت پیش‌فرض | رسانه |
|---|---|---|---|---|---|---|
| A | `home/hero` | Hero | در نگاه اول پاسخ‌دادن به: CPMS **چه هست**، **برای کیست**، **ارزش اصلی**، و اولین **Demo CTA**. بدون شعار مبهم؛ ساختار جمله: محصول + مخاطب + مزیت ملموس (مزیت = درک‌شده، ادعای کمی نه). CTA ثانویهٔ «مشاهده محصول» (دمو/تور کوتاه) در جای خود مجاز است | اصلی: Demo — ثانویه: Product View | TARGET — NOT PUBLICATION-APPROVED (کپی نهایی ممنوع تا مرحله محتوا) | MEDIA REQUIRED (نمای واقعی محصول — بلوک C را ببین) |
| B | `home/problem` | مسئلهٔ کوتاه و قابل تشخیص | حداکثر ۳–۴ مورد، هرکدام واقعی و بدون اغراق: (۱) پراکندگی جریان‌های کاری کلینیک؛ (۲) هماهنگی پزشک ↔ منشی/پذیرش؛ (۳) پیچیدگی نوبت و پیگیری/فولوآپ؛ (۴) تکه‌تکه‌بودن عملیات روزانه. **قاعده:** هر مسئله‌ای که منتشر می‌شود باید به یک راه‌حل محصولیِ launch-verified نگاشت شود؛ مسئلهٔ بی‌راه‌حل = حذف مسئله | ندارد | مسئله‌ها به‌عنوان «درد صنعتی» قابل‌بحث‌اند، نه ادعای محصول؛ انتشار نهایی: TARGET — NOT PUBLICATION-APPROVED تا بازبینی | ندارد |
| C | `home/evidence` | شواهد محصول، زودهنگام | اولین Screenshot/Video واقعی **باید زودتر از بلوک‌های قابلیت** بیاید. ادراک هدف: **یکپارچه / منظم / قابل‌فهم** — تأکید اصلی روی یکپارچگی. قاب، Caption و context الزامی است (چه دیده می‌شود، کدام نقش/نمای کاری است) | مشاهدهٔ بزرگ‌نمایی / ویدیو | وضعیت متن: بلوک رسانه‌محور (کپی → captionها با همان سقف) | MEDIA REQUIRED + قاعده `PRODUCT-TRUTH §3/#1..12` و بخش ۱۱ این سند؛ UI ساختگی ممنوع |
| D | `home/workflow` | روایت جریان کار | نمایش **اتصال** جریان‌های تأییدشده (مدل تحقیق ROADMAP §3: Patient → Appointment → Reception → Waiting → Visit → Prescription → Payment → Record) **فقط تا حد شواهد Launch**؛ نه فهرست‌کردن Featureها. هر گام = یک جملهٔ اتصال + ارجاع به صفحه/بخش مرتبط. گام‌های تأییدنشده: حذف یا placeholder داخلی | هدایت به Product Overview / Featureها | ساختار: رزرو؛ متن هر گام: REQUIRES PRODUCT VERIFICATION (`PRODUCT-TRUTH §3 #1`) | MEDIA REQUIRED (در حد گام‌های تأییدشده) |
| E | `home/roles` | ارزش برای نقش‌ها | سه نقش الزامی + یک نقش مشروط، هرکدام **کرانه‌دار (bounded)**: مدیر کلینیک (دید عملیاتی/گزارش/دسترسی‌ها)، پزشک (برنامه ویزیت/پرونده/نسخه در محدوده تأییدشده)، منشی/پذیرش (نوبت، چک‌این، صف — توجه: `PRODUCT-TRUTH §3 #9` فاز Reception در Snapshot بسته‌نشده بود)، بیمار/پورتال **فقط در صورت تأیید** (#7) | تماس با فروش / دمو per-role (آینده) | TARGET + per-role: REQUIRES PRODUCT VERIFICATION | در حد نیاز (thumbnail همان نقش) — MEDIA REQUIRED |
| F | `home/growth` | چندکلینیکی / رشد | **رزرو معماری** برای positioning چندکلینیکی/چندموقعیتی. شواهد فنی در Snapshot قوی است (`PRODUCT-TRUTH §3 #3`) اما: (۱) مجوز انتشار عمومی ندارد — هر جمله‌اش `REVERIFY BEFORE PUBLIC LAUNCH` است؛ (۲) positioning «مراکز بزرگ‌تر» تنها در صورتی بیان می‌شود که شواهد Launch واقعاً پشتیبانی کند؛ تا آن زمان این بلوک فقط ساختار معماری را رزرو می‌کند. ساختار: یک بلوک روایتی + placeholder لینک به Solution متناظر | — | رزرو ساختار: مجاز؛ هر ادعا: REVERIFY BEFORE PUBLIC LAUNCH | MEDIA REQUIRED در صورت نمایش |
| G | `home/trust` | اعتماد | **ترتیب سلسله‌مراتبی الزامی (ROADMAP §16):** (۱) تناسب با جریان کار واقعی کلینیک؛ (۲) مکانیزم‌های داده/دسترسی — توضیح صادقانهٔ «چگونه»، بدون ادعای گواهی/Compliance/SLA؛ (۳) Setup/Training/Support **فقط در حد واقع verified** | مطالعهٔ صفحهٔ Security & Data Access | بخش ۲ و ۳: REVERIFY BEFORE PUBLIC LAUNCH؛ بخش ۳: BUSINESS INPUT REQUIRED | ندارد |
| H | `home/faq` | پرسش‌های متداول | فقط **اعتراض‌های واقعی خرید** (نه سؤالات پرکننده): تناسب با اندازه کلینیک، مهاجرت داده/شروع، نقش‌ها/دسترسی، پشتیبانی و استقرار، محرمانگی داده. پاسخ هر سؤال با همان سطح ادعای صفحات مقصد؛ **بدون وعدهٔ قیمت، SLA، یا Integration** | دمو برای سؤالات باز | TARGET — NOT PUBLICATION-APPROVED | ندارد |
| I | `home/final-cta` | CTA نهایی | تکرار **همان** تبدیل اصلی (Demo/Consultation) با متن کوتاه و مقصد قابل‌اندازه‌گیری؛ بدون فرم کامل طولانی در همین‌جا (هدایت به `/demo/`) | Demo | ساختار: DECIDED (ارجاع به ROADMAP §7/§8)؛ کپی نهایی: TARGET — NOT PUBLICATION-APPROVED | ندارد |

**۳.۱ قواعد سطح‌کلِ Homepage**

- **پرهیز از دانش‌نامه‌ای‌شدن (anti-encyclopedia):** Homepage روایت است نه فهرست کامل محصول؛ اگر بلوکی به «Feature Grid بلند» تبدیل شد، ادغام در D/E یا حذف.
- **Pricing:** مطابق ROADMAP §7 بلوک «Pricing Preview» پیش‌بینی شده بود؛ در این قرارداد **تعلیق** است تا تصمیم تجاری Pricing (بخش ۴، CONDITIONAL)؛ روایت «دریافت پیشنهاد از طریق گفت‌وگوی فروش» در همان بلوک‌های H/I و بدون بسته/عدد/مقایسه ادامه می‌یابد. **این یک هم‌راستاسازی آگاهانه با دستورالعمل Pricing است، نه حذف تصمیم مالک.** در همین PR، بند ۱۰ ROADMAP §7 نیز به‌عنوان **بلوک مشروط/معلق** علامت‌گذاری شد تا دو سند یک‌سان خوانده شوند (بدون تصمیم Pricing؛ بدون تغییر ترتیب روایت).
- **تکرار CTA:** هر CTA باید به مرحلۀ Journey مرتبط باشد؛ تکرار بی‌هدف یک CTA در همهٔ بلوک‌ها ممنوع (ROADMAP §7).
- **ویدیو:** فقط Product-focused، بدون Autoplay سنگین (بخش ۱۱ این سند).
- کپی نهایی فروش (final sales copy) در این سند **نوشته نمی‌شود**؛ ستون «قرارداد محتوا» مشخص می‌کند بلوک باید چه منتقل کند، نه جملۀ آن را.

---

## 4. قرارداد نهایی Sitemap (انتشار-محور)

**۴.۱ اصل: کوچک‌ترین Sitemap کامل از نظر تجاری**

Core = کمیتۀ صفحاتی که بدون آن‌ها یک سایت فروشِ Assisted-Sale برای کلینیک‌ها قابل‌دفاع نیست. هر صفحه‌ای که هست، یا **مسیر تبدیل** است، یا **رفع مانع خرید**، یا **اجبار قانونی/عملیاتی**. صفحه خالی برای «کامل‌به‌نظر‌رسیدنِ» Sitemap **ممنوع** است (همیشه: اگر محتوا نیست، صفحه نیست — حتی در Core، محتوا در Staging با placeholderهای مشخص ساخته می‌شود و منتشر نمی‌شود).

**۴.۲ CORE AT LAUNCH**

| صفحه | نقش در سایت | Note |
|---|---|---|
| Home | روایت A–I (بخش ۳) | صفحهٔ تبدیل اول |
| CPMS / Product Overview | تصویر کلان محصول: یکپارچگی، نقش‌ها، جریان‌ها (بدون تکرار صفحه‌به‌صفحهٔ Features) | هر بند ادعا → ارجاع به رکورد متناظر در `docs/PRODUCT-TRUTH.md`؛ بدون ادعای مستقل |
| Features (Hub) | فهرست/معرفی دسته‌های قابلیت **قابل‌تأیید**؛ درِ ورود به صفحات Feature | تا تشکیل شدن صفحات Feature مستقل، خودِ Hub کامل‌کنندۀ مسیر است |
| Solutions (Hub) | نگاشت سناریو ← قابلیت‌های تأییدشده؛ درِ ورود Segment Pages | بخش ۴.۴ |
| Demo / Consultation | صفحهٔ تبدیل اصلی (بخش ۱۳) | Form + states |
| About | هویت واقعی شرکت/محصول، اطلاعات تأییدشده | بدون Company/Legal facts → BUSINESS INPUT REQUIRED |
| Contact | مسیر عمومی تماس | هر شماره/ایمیل فقط از داده تأییدشده — ساختگی ممنوع |
| FAQ | رفع اعتراض‌های خرید در سطح کل سایت؛ منبع بلوک H | پاسخ‌ها با همان سقف ادعای صفحات |
| Security & Data Access | توضیح مکانیزم‌های واقعی (scope/نقش/تفکیک داده) — بدون ادعای Certification/SLA | هر بند: `REVERIFY BEFORE PUBLIC LAUNCH` (مطابق `PRODUCT-TRUTH §3 #4/#5/#6`) |
| Support | مسیر پشتیبانی/تماس + (آینده) مستندات | مدل Support: REQUIRES PRODUCT VERIFICATION؛ **حداقلِ قابل‌انتشار در launch:** صفحۀ ساختارمند با مسیر تماس واقعی، بدون ادعای «۲۴/۷»، SLA یا جزئیات تأییدنشده |
| Blog / Resources | آموزش/کشف ارگانیک (ROADMAP §10) | **شرط انتشار عمومی:** وجود حداقل یک مقالۀ آمادهٔ انتشار + مالک محتوا؛ در نبود آن، ساختار در Staging رزرو می‌ماند و در launch عمومی **منتشر نمی‌شود** (تعلیق، نه صفحۀ خالی) |
| Privacy | سیاست واقعی و تأییدشده | LEGAL REVIEW REQUIRED |
| Terms | شرایط واقعی و تأییدشده | LEGAL REVIEW REQUIRED |
| 404 | بازیابی مسیر: Home + مسیرهای اصلی + Search (اگر فعال بود) | سیستمی |

**۴.۳ CONDITIONAL ON PRODUCT TRUTH** (جایگاه معماری رزرو؛ انتشار با تأیید):

| کاندیدا | شرط تبدیل به صفحه |
|---|---|
| Appointment Management | تأیید Scope نوبت‌دهی + Public Booking مستقل (`PRODUCT-TRUTH §3` تکمیلی) |
| Reception & Queue | **بسته‌شدن و تأیید فاز کامل Reception** (#9) — در Snapshot صریحاً باز بود |
| Doctor Workspace | #8 (شواهد Bounded) |
| Patient Portal | #7 (Bounded: Profile/Visits/Prescriptions/Files) |
| Patient Records | #10 |
| Prescriptions & Documents | #11 — **ادعای اتصال نسخه الکترونیک ملی از این Snapshot ممنوع** |
| Multi-Clinic / Multi-Location | #3 — فقط در حدی که Launch هنوز پشتیبانی می‌کند |
| Finance / Reporting | #2 + Reporting تکمیلی — «معادل حسابداری نیست»؛ بدون Online Payment |
| Pricing (`/pricing/` یا معادل) | **عمداً Core نیست.** فعال‌سازی فقط با تصمیم تجاری Pricing (OPEN BUSINESS DECISION؛ ROADMAP §9/§21). تا آن زمان: هیچ بسته/عدد/مقایسه‌ای؛ مسیر فعلی = توضیح «پیشنهاد از طریق گفت‌وگو» در I/H |
| Customer Stories | فقط با شواهد واقعی + **اجازهٔ انتشار** (قاعده Social Proof؛ ROADMAP §16) |
| Search | فقط اگر حجم محتوا (Blog+Feature+Solution) آن را مفید کند — معمولاً **نه در launch اولیه** (ROADMAP §21 سؤال ۱۱)؛ الگوی Empty State از ابتدا طراحی می‌شود، رابط جست‌وجو به زمان لازم‌شدن موکول است |
| Refund/Cancellation, Legal Notice, Cookie Policy | در IA رزرو (ROADMAP §16)؛ انتشار فقط با متن واقعی تأییدشده |

**۴.۴ SEGMENTها (زیر Solutions)**

| Segment | وضعیت |
|---|---|
| Clinics / Multi-doctor Clinics | **در لحظۀ launch: صفحۀ مستقل نه** — ابتدا به‌عنوان بخش اصلی Solutions Hub (مخاطب اصلی همان‌جا پیام می‌گیرد)؛ با تثبیت محتوای تأییدشده → صفحۀ مستقل (CONDITIONAL) |
| Independent Doctors (مطب مستقل) | CONDITIONAL — برای مخاطب ثانویه؛ با محتوای کرانه‌دار (نه «سبک و ساده برای تک‌پزشک» بدون شواهد ساده‌بودن) |
| Larger Medical Centers / مراکز بزرگ‌تر | **DEFERRED — فقط در صورتی که شواهد Launch واقعاً پشتیبانی کند** (`PRODUCT-TRUTH §3 #3/#5`)؛ عنوان صفحه مجوز ادعا نیست (ROADMAP §6) |

**۴.۵ DEFERRED / ONLY WHEN BUSINESS INPUT EXISTS**

- صفحهٔ پورتال ورود (Login/Portal) برای بیمار/پزشک — خارج از Scope سایت بازاریابی؛
- Customer Stories، Pricing، Search، Refund/Cancellation — (بالا، با قفلشان)؛
- هر صفحهٔ Industry/Integration/Marketplace/Changelog/Job Postings/وبلاگ چندزبانه — بدون ورودی تجاری واقعی ساخته نمی‌شود؛
- **Multilingual/English site — خارج از Scope (ROADMAP §20).** زیرساخت زبان در این قرارداد پیش‌بینی نمی‌شود (بخش ۹).

---

## 5. معماری URL / SEO Intent

**۵.۱ اصول URL (سقف تصمیم این Slice):**

1. **Persian-first در محتوا؛ Slug پیشنهادی لاتین/انگلیسی lowercase** با hyphen — مدیریت‌پذیر در WordPress و بدون دردسر encoding. **تصمیم نهایی الگوی Slug (فارسی/انگلیسی/ترکیبی) = OPEN — REQUIRES KEYWORD/SEO RESEARCH + تصمیم Phase 2 (ROADMAP §11، سؤال ۱۴).**
2. **Stability الزامی است:** هر تغییر slug پس از راه‌اندازی = تغییر بزرگ + Redirect 301 مستند؛ الگوی permalink ساده و ثابت (`/%postname%/` معادل، جزئیات فنی به فاز محیط واگذار).
3. **عمق کم:** حداکثر ۲ سطح منطقی (`/features/appointment-management/` مجاز؛ `/features/clinic-management/appointments/…` فقط اگر taxonomy واقعی شکل گرفت و تصمیم Phase 2 باشد).
4. **Hubها کوتاه و معنایی** باشند: `/features/`, `/solutions/`, `/demo/` (نمونه‌های ساختاری ROADMAP §4.1، نه تصمیم نهایی).
5. بدون تاریخ در URL محتوای evergreen؛ بدون کلمۀ کلیدی انباشته در slug؛ بدون پسوندهای تبلیغاتی (`-best`, `-cheap` ممنوع).
6. **هر تصمیم slug/ساختار که در این سند با «REQUIRES KEYWORD RESEARCH» علامت خورده، با داده و تحقیق واقعی در فاز SEO Foundation بسته می‌شود** (ROADMAP §11.1) — نه در این Slice و نه از حافظۀ مدل.

**۵.۲ جدول Intent صفحات Core** (هرچه در ستون‌ها عدد/اولویت/حجم جست‌وجو نیست، عمداً است):

| صفحه | User Intent | نقش تجاری | تبدیل اصلی | Internal-link targets (الزامی) | SEO Intent Category |
|---|---|---|---|---|---|
| Home | «این محصول برای کلینیک من مناسب است؟» | ورودی + Framing کل داستان | Demo | Product Overview, Features hub, Solutions hub, Security, Demo, FAQ | Mixed — **REQUIRES KEYWORD RESEARCH** |
| Product Overview | «کلاً CPMS چه می‌کند و چطور به هم وصل است؟» | فهم یکپارچگی؛ تراز کردن ادراک | Demo (ثانویه: Feature Pages) | Feature Pages (تأییدشده), Workflow narrative, Roles, Security | **REQUIRES KEYWORD RESEARCH** (نمونه hypothesis: «نرم‌افزار مدیریت کلینیک») |
| Features (Hub) | «آیا این قابلیت را دارید؟» | غربالگری تناسب اولیه | Feature Page / Demo | تأییدشده Feature Pages, FAQ, Demo | **REQUIRES KEYWORD RESEARCH** |
| Solutions (Hub) | «برای کلینیک با مشخصات من؟» | تطبیق Persona/سناریو | Demo (per-segment anchor) | Segment Pages, Feature Pages, FAQ, Trust blocks | **REQUIRES KEYWORD RESEARCH** (نمونه hypothesis: «نرم‌افزار مدیریت مطب») |
| Demo / Consultation | «چطور ببینم/بپرسیم؟» | تبدیل نهایی | Submit Form | Contact، FAQ، Security (رفع مانع) | Transactional — حجم/کلمهٔ کلیدی نیازمند تحقیق؛ صفحۀ CTA در ارگانیک معمولاً brand-facing و کم‌حجم است؛ اولویت آن نهایی‌سازی حجم/کلمه با تحقیق می‌خواهد |
| About | «با چه کسی طرفم؟» | اعتبار/هویت | Contact / Demo (secondary) | Contact، Trust blocks | Navigational/Brand — **REQUIRES KEYWORD RESEARCH** |
| Contact | «راه ارتباطی مستقیم» | پشتیبانِ تبدیل | Submit/Call (facts تأییدشده فقط) | Demo, Support | Navigational |
| FAQ | «مانع تصمیمم را بردار» | Objection-handling | Demo | Security، Support، Feature Pages، Demo | Informational — **REQUIRES KEYWORD RESEARCH** |
| Security & Data Access | «دادهٔ بیمارانم چه می‌شود؟» | حذف مانع ریسک | Demo / Consultation | Product Overview (roles/scoping), Support, Demo | Informational/Trust — **REQUIRES KEYWORD RESEARCH** |
| Support | «اگر گیر کردم چه؟» | اعتماد پس/پیش از خرید | تماس واقعی | Contact، FAQ، Docs (آینده) | Navigational |
| Blog / Resources | «یاد بگیر / حل مسئلهٔ عملیاتی» | TOFU → Discovery | Demo (contextual) | Feature/Solution Pages، Cornerstone | Informational — **REQUIRES KEYWORD RESEARCH + Topic Validation** (خوشه‌های ROADMAP §10 فقط Topic Proposal‌اند) |
| Privacy / Terms | الزام قانونی | — | — | Footer، فرم Demo | Legal — بدون Keyword Priority |
| 404 | بازیابی مسیر | کاهش ریزش | مسیرهای اصلی | Home, Demo, Search (در صورت فعال‌بودن) | Non-indexable |

**۵.۳ قواعد**

- هر صفحه Core دقیقاً **یک H1** و **یک تبدیل اصلی** دارد (تبدیل ثانویه فقط در صورت ارجاع‌پذیری).
- Title/Meta/Canonical/Indexability: **فقط الزام ساختاری** در این سند (ROADMAP §11.1)؛ انتخاب عبارت‌ها از حافظه/تخمین **ممنوع** — **REQUIRES KEYWORD RESEARCH** با ابزار/دادهٔ واقعی در فاز SEO Foundation. هیچ حجم جست‌وجویی در این سند ذکر نشده و نباید ذکر شود.
- Internal-link floor: هر Feature Page (ساخته‌شده) ← Workflow مرتبط + Demo + FAQ؛ هر Solution ← Featureهای تأییدشده + Demo؛ Blog ← Cornerstoneها (الگوی ROADMAP §4.3). Orphan Page در QA شناسایی می‌شود.
- Structured Data: فقط در انطباق با محتوای قابل‌مشاهده و در فاز Hardening؛ **هیچ Schema جعلی (Testimonial/Review/Price)** — و در زمان Staging/غیرایندکس، هیچ تنظیم Indexing انجام نمی‌شود (سیاست ROADMAP §3).
- هیچ حجم جست‌وجو، امتیاز اولویت یا «کلمۀ کلیدی برنده‌ای» در این سند ذکر نشده و **از حافظه حدس زده نمی‌شود**؛ ستون SEO Intent Category فقط *نوع* intent را می‌گوید — **REQUIRES KEYWORD RESEARCH**.
- **Keyword-stuffing ممنوع** (ROADMAP §11).

---

## 6. قرارداد Navigation

**۶.۱ Primary Desktop (سطح اول — حداکثر ۵ آیتم):**

1. **محصول / CPMS** (→ Product Overview؛ آیتم‌های Feature داخل پنل ساده — تنها اگر صفحات Feature ساخته شده باشند)
2. **امکانات** (→ Features hub)
3. **راهکارها** (→ Solutions hub)
4. **پشتیبانی / اعتماد** — ترکیب: Support + Security & Data Access (ترجیحاً دو آیتم جدا فقط وقتی حجم محتوا توجیه کرد؛ در launch: Support + Security)
5. **وبلاگ / منابع** — **فقط پس از فعال‌شدن Blog** (بخش ۴.۲ شرط). اگر Blog فعال نبود: آیتم وجود ندارد.

**Utility (سطح مکمل، کوچک):** Contact بیرون از Primary Nav و در Footer (صفحهٔ Contact مستقل هم دارد)؛ About در Footer نه در Primary. شماره/ایمیل در Header **فقط با دادهٔ تأییدشده** — در نبود آن، هیچ شماره‌ای در هدر نیست (BUSINESS INPUT REQUIRED).

**CTA دکمه‌ای همیشه‌دیدنی در Desktop header:** برچسب ساختاری `nav/cta-demo` با مقصد `/demo/`؛ متن نهایی در مرحلهٔ کپی تثبیت می‌شود (کاندیدای ثبت‌شده در ROADMAP §4.2: «درخواست دموی CPMS» — بدون ابداع متن موازی).

**۶.۲ ممنوعیات/قواعد**

- **Mega-menu ممنوع است تا وقتی حجم محتوا آن را لازم کند.** آستانۀ بازبینی: ≥۴ صفحۀ Feature فعال **و** ≥۲ segment صفحه → بازطراحی پنل (تصمیم عادی Website Director).
- Max depth nav = ۲؛ ناوبری عمقی از طریق Breadcrumb/لینک‌های درون‌صفحه‌ای، نه منوی تو در تو.
- ترتیب آیتم‌ها بر اساس اولویت تجاری است (Product قبل از Resources)، نه الفبا.

**۶.۳ Mobile (قرارداد اولویت، نه پیاده‌سازی):**

منوی همبرگری با این ترتیب ثابت:

1. **درخواست دمو** (دکمهٔ اول، بالاتر از لینک‌ها — تکرار CTA نه پنهان‌کردن آن)
2. محصول/امکانات
3. راهکارها
4. اعتماد: Security & Data Access → Support
5. FAQ → وبلاگ (در صورت فعال‌بودن)
6. Contact + About (پایین لیست)

- تب/زبان/جست‌وجو در Mobile در launch **حذف** (جست‌وجو: بخش ۴.۳؛ چندزبانه: خارج از Scope).
- **رفتار Persistent CTA (فقط مفهومی، بدون پیاده‌سازی):** در صفحه‌های بلند (Home، Product Overview، Feature) یک نوار CTA پایینِ موبایل، فعال پس از گذر از Hero و خاموش روی CTA نهایی همان صفحه؛ **غیرمزاحم**: روی فرم‌ها و فیلدهای فعال قرار نگیرد، دکمۀ Submit را نپوشاند، و با safe-area سازگار باشد. مکانیزم فنی → فاز محیط (DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT).

**۶.۴ Footer:** چهار گروه مجزا و قابل‌اسکن (نه مخزن لینک — ROADMAP §4.2): محصول (Overview/Features/Solutions) · اعتماد (Security/Support/FAQ) · شرکت (About/Contact/Blog) · حقوقی (Privacy/Terms) + CTA دمو تکرار شونده در بالای فوتر. شبکهٔ اجتماعی **فقط در صورت وجود واقعی**.

---

## 7. جهت طراحی (Design Direction) — محدودیت‌ها

شخصیت بصری `DECIDED` است (ROADMAP §13: Premium Medical Technology + Professional SaaS + Trust؛ مدرن، حرفه‌ای، قابل‌اعتماد، پرمیوم اما آرام، متناسب حوزه سلامت، Persian/RTL native).

**۷.۱ پرهیزهای الزامی (هرکدام یک بازبینی‌پذیرِ طراحی است، نه سلیقه):**

- Gradient‌های عمومی/کلیشه‌ای SaaS-AI؛ شیشه‌ای‌زدگی (glassmorphism) افراطی؛
- ظاهر قالب‌های ارزان مارکت‌پلیس وردپرس؛ ظاهر «پورتال بیمارستانی» استریل و اداریِ بی‌روح؛
- استتیک استارتاپی بازیگوش (ایموجی‌محوری، کاریکاتوری، شلوغی بصری)؛
- انیمیشن‌زدگی و Sliderهای غیرضروری؛
- **Hero دکوراتیو غول‌پیکر که محصول را می‌پوشاند** — اولین عنصر بزرگ، ترجیحاً خودِ محصول است؛
- تقلید بصری از رقیب مشخص (ROADMAP §13).

**۷.۲ اولویت‌های الزامی:**

- **Real product UI** به‌عنوان ستون بصری (قاب‌های تمیز، سایه/حاشیۀ آرام، بدون mockup-سازی فانتزی)؛
- وضوح محتوا و سلسله‌مراتب روشن (typography-driven، نه ornament-driven)؛
- Whitespace سخاوتمند اما کارآمد؛ ریتم منظم بلوک‌ها؛
- تایپوگرافی فارسی قوی (وزن‌های محدود، اندازه‌های خوانا، line-height فارسی‌پسند)؛
- اکسنت‌های بصری محدود و با معنی (حالت/تأکید، نه تزئین)؛
- ارائۀ باورپذیرِ «نرم‌افزار»: سایتِ یک محصولِ قابل‌تهیه، نه صفحهٔ کمپین موقتی.

**۷.۳ آنچه این سند عمداً تعیین نمی‌کند:**

- **رنگ نهایی برند / پالت** — تصمیم Design System (نه حدس این سند)؛
- **نام برند تجاری نهایی/مادر** — OPEN BUSINESS DECISION، تصمیمش با مالک محصول (ROADMAP §13، §21)؛ تا آن زمان نام فعلی محصول **CPMS** در ساختارها حفظ می‌شود و معماری هویت **گره نمی‌خورد** (قابل‌جابه‌جایی logo/name در Header/Footer/Legal با کمترین هزینه)؛
- فونت نهایی، لوگو، تصویرسازی برند — با evidence/تصمیم؛ این سند فقط **الزامات** آن‌ها را ثبت می‌کند (بخش ۸–۹).

---

## 8. قرارداد Design System (آنچه Slice بعدی باید مصوب کند)

خروجی این بخش، «چک‌لیست تصمیم» برای Slice طراحی/سیستم است؛ هر مورد باید با مقدار + مستندات RTL + مثال کاربرد تحویل شود. Design tokens بعداً در Elementor Globals بازنمایش می‌شوند (نام‌گذاری سطح token؛ **هیچ setup Elementor در این سند مجاز نیست**).

| حوزه | تصمیم‌های الزامی Slice بعدی |
|---|---|
| **Color roles** | فقط نقش‌-محور: `background/base`, `background/subtle`, `surface/card`, `surface/raised`، `ink/primary`, `ink/secondary`, `ink/muted`, `accent/primary (+hover/active/contrast-on-accent)`, `border/subtle`, `border/strong`, `link`، و statusها: `success`, `warning`, `danger`, `info` — هر role با نسبت کنتراست تأییدشده برای متن (آستانۀ عددی در Design System بر اساس استاندارد پذیرفته‌شدۀ پروژه تعیین می‌شود)؛ **ممنوع:** رنگ دلخواه در هر صفحه؛ **هیچ value هگز در این سند** |
| **Typography (fa)** | فونت فارسی وب (self-host، `font-display: swap`)؛ حداکثر **۲–۳ وزن**؛ scale ماژولار برای heading/body؛ line-height فارسی (بالاتر از default انگلیسی)؛ حداکثر عرض خطِ خوانا (measure) و سقف طول H1؛ فارسی‌سازی عدد در body بر اساس context (بخش ۹) |
| **Spacing scale** | پلۀ پایه (یک واحد پایه و مضاربش) با نام‌های `space-1..n`؛ ریتم عمودی بلوک‌های Home از همین مقیاس؛ فاصله‌های ad-hoc ممنوع |
| **Container widths** | ۲–۳ عرض کانتینر معنایی (content-wide / content-default / content-narrow برای متن طولانی و فرم)؛ رفتار edge-to-edge media؛ **مقادیر px در Slice طراحی** |
| **Heading hierarchy** | H1 یک‌بار در صفحه؛ H2=شروع هر بلوک A–I؛ H3 درون‌بلوکی؛ سلسله‌مراتب بصری = سلسله‌مراتب DOM (بدون heading ساختگی برای size) |
| **Body typography** | پاراگراف کوتاه، lede مجزا، لیست‌ها برای workflow؛ bold فقط برای اصطلاح/نه جملهٔ بلند؛ link درون‌متنی فقط در contexts معنادار |
| **Buttons** | Variantها: primary (CTA تجاری) / secondary (مشاهده محصول) / tertiary-text؛ هر کدام × states؛ ارتفاع و padding لمسی؛ محدود به variantهای تعریف‌شده |
| **Links** | رنگ/حالت از tokens؛ hover/focus/visited؛ بدون زیرخط‌زدگی سلیقه‌ای؛ link card → الگوی مشخص |
| **Cards** | یک کارتِ پایه (feature/role/faq-item)؛ variant محتوایی (media-top / content-only)؛ ممنوع: کارت با سایه‌های تصادفی/عابر از scale |
| **Badges** | حداکثر ۲ کاربرد: وضعیت‌برچسب (مثل «Beta» **فقط اگر مجاز**) و گروه‌بندی؛ **هرگز badge برای کمپین ترس/تخفیف/شمارنده ساختگی** |
| **Forms** | فیلد، label روی field، helper/error text از tokens؛ خطا + aria؛ الگوی RTL input (بخش ۹)؛ submit با states |
| **Accordions / FAQ** | الگوی تک‌منبع برای Home H و صفحهٔ FAQ؛ accordion = disclosure در دسترس‌پذیر (کلیک کیبورد، aria)؛ نه «انیمیشن بازکن» |
| **Tabs** | **فقط در صورت توجیه محتوایی واقعی** (مثلاً مقایسۀ نقش‌ها در یک بلوک)؛ به‌عنوان پیش‌فرض صفحه‌بندی ممنوع |
| **Media frames** | قاب استاندارد Screenshot (نوار/حاشیهٔ قاب، caption، نسبت‌های مجاز — بخش ۱۱)؛ ویدیو پوستر+کلیک |
| **Trust/evidence blocks** | الگوی «ادعا → مکانیزم → شواهد/ارجاع»؛ بدون آرم/عدد ساختگی؛ جای Testimonial رزرو می‌شود ولی با دادهٔ واقعی فعال (بخش ۱۲) |
| **CTA blocks** | بلوک CTA استاندارد (I + انتهای صفحات)؛ چیدمان: جملهٔ تناسب + CTA + یک ارجاع اعتماد (مثل Security)؛ نه بنر پرنده/popup مهاجم |
| **Alert/status semantics** | success/error/info/warning برای فرم/سیستم؛ رنگ همیشه با آیکون+متن (نه color-only) |
| **States** | focus-visible واضح (ring از token)، hover، disabled، error، success — برای هر کامپوننت تعاملی؛ بدون حذف outline جایگزین‌نشده |
| **Icon policy** | یک خانوادهٔ آیکون (stroke/weight یکنواخت)؛ فقط معنایی/جهت‌دار (نه تزئینی پُرکردن)؛ جهت‌دارها RTL-aware (بخش ۹)؛ حجم/رنگ از tokens |
| **Border/radius/shadow** | فلسفه: radius کوچک و ثابت؛ borders آرام‌تر از surfaces؛ حداکثر ۲ سطح shadow؛ بدون glassmorphism/blur تزئینی (بخش ۷) |
| **Breakpoints** | هم‌راستا با ROADMAP §14: Mobile `320–767` / Tablet `768–1024` / Laptop `1025–1365` / Desktop `1366+`؛ نام‌گذاری token؛ رفتار در هر breakpoint مستقل تعریف (بخش ۱۰) |
| **Reduced motion** | احترام به `prefers-reduced-motion`؛ حرکت = انتقال‌های کوتاه معنادار؛ بدون Parallax/Autoplay؛ حذف انیمیشن ≠ حذف affordance |

**قاعده Elementor (آینده):** tokenها → Global Colors / Global Typography / global spacing + templateهای reusable (ROADMAP §12)؛ هر spec کامپوننت باید از نظر «قابل‌Global‌شدن» قابل‌دفاع باشد؛ style inline صفحه‌ای ممنوع. این فقط الزامِ نام‌گذاری/ساختار است — **هیچ setup Elementor در این Slice مجاز نیست**.

**تحویل‌پذیری Slice طراحی:** جدول tokenها + spec کامپوننت‌های فهرست بالا (با states) + کاربرد آن‌ها روی بلوک‌های Home (بخش ۱۶، Milestone A)؛ **نه** کد، **نه** تنظیم محیط، **نه** انتخاب رنگ/فونت نهایی پیش از evidence/تصمیم.

---

## 9. قرارداد RTL / Persian UX

1. **RTL واقعی از بنیاد:** چیدمان از flow منطقی RTL ساخته می‌شود؛ در specها و tokenها فقط **logical directions** (start/end، margin-inline…)؛ `dir=rtl` + `lang=fa` در سطح سند الزامی است (جزئیات فنی → فاز محیط).
2. **سلسله‌مراتب خوانش:** ترتیب بصری A–I (بخش ۳) با پیمایش راست‌به‌چپ راستی‌آزمایی می‌شود؛ کنتراست/سایز heading از الگوی چپ‌به‌راستِ قالب‌های انگلیسی کپی نمی‌شود.
3. **کیفیت تایپوگرافی فارسی:** نیم‌فاصله الزامی (می‌شود، کلینیک‌ها، می‌دهیم)؛ ویرگول/نقطه چسبان؛ گیومهٔ فارسی «…» به‌جای "…"؛ «؟» فارسی؛ حذف فاصلۀ اضافی پیش از علائم بند؛ هم‌نشینی ارقام/Latin/فارسی در یک خط (shaping) جزو checklist بازبینی بصری است.
4. **اعداد:** در متن روایی **اعداد فارسی** (۱۲۳)؛ در tokenهای فنی/ارتباطی **لاتین**؛ قاعده: «خواندنیِ فارسی = فارسی، قابل‌کپی/فنی/بین‌المللی = لاتین».
5. **توکن‌های ارتباطی/فنی:** شمارهٔ تلفن، ایمیل، URL، شمارۀ نسخۀ محصول و شناسه‌های فنی → داخل `direction: ltr` + `unicode-bidi: isolate` در کانتینر RTL؛ تلفن با جداکنندۀ خوانا؛ هرگز برعکس‌شدن ترتیب ارقام مجاز نیست.
6. **اصطلاحات ترکیبی fa/en/نام‌محصول:** نام‌های لاتین محصول/قابلیت (CPMS, Patient Portal, Elementor) در متن فارسی به‌همان شکل لاتین حفظ می‌شوند؛ برای هر اصطلاح، **معادل فارسی تثبیت‌شده** در Glossary محتوا (مثلاً پذیرش، صف انتظار، پروندهٔ بیمار، نسخه، نوبت)؛ واژگان متناسب با تصمیم‌گیر کلینیک ایرانی — از واژگان بازاریابی تحمیلی/ترجمه‌زدده پرهیز. (Glossary: artifact فاز محتوا.)
7. **جهت آیکون‌ها:** فلش‌های «بعدی/قبلی»، chevronها و هر آیکون پیکانی → آینه‌ای در RTL؛ آیکون‌های غیرجهت‌دار بدون تغییر؛ **چرخش/فلیپ تصویر محصول یا نمودار ممنوع** (تصاویر UI لاتین‌محور همان‌طور هستند؛ caption توضیح می‌دهد؛ screenshotهای محصولِ فارسیِ خود CPMS ذاتاً RTL هستند و دستکاری نمی‌شوند).
8. **فرم‌ها:** label بالای فیلد، راست‌چین؛ error پیام زیر فیلد با آیکون+متن؛ inputهای LTR (تلفن/ایمیل) با تراز داخلی سازگار؛ submit چیدمان در پایان جریان.
9. **Breadcrumb/pager/step indicator:** ترتیب عناصر از راست؛ جداکننده‌ها `/` یا `‹` در جهت منطقی RTL؛ stepper workflow (بخش D) با گام‌های راست←چپ.
10. **بدون hack دستی:** هیچ `margin-left/right` ثابت، `transform: scaleX(-1)` سراسری، یا override فیزیکی که semantics/RTL-native flow را بشکند؛ هر استثنا در مستندات design-system ثبت و توجیه می‌شود (anti-pattern registry).
11. **مستقل‌سازی تست:** RTL در موبایل جدا از دسکتاپ بازبینی می‌شود (ROADMAP §13).
12. **ممنوع:** هرگونه معماری چندزبانه/lang-switcher در این قرارداد — **Do not introduce multilingual infrastructure.** سایت Persian-only طراحی/ساخته می‌شود؛ هر تصمیم آینده جداگانه نیازمند ارجاع به مالک است.

---

## 10. قرارداد Responsive

**۱۰.۱ الزام شواهدی (آینده، هر Slice قابل‌مشاهده):** بازبینی در viewportهای هدف — ~**390×844** (موبایل)، ~**768** (تبلت عمودی)، **1366×768** (لپ‌تاپ/دسکتاپ مرجع) + یک sanity-check دسکتاپ بزرگ؛ ابزار/رویه طبق `docs/AGENT-TOOLING.md` §4.5 (Playwright MANDATORY WHEN APPLICABLE؛ در این Slice مستنداتی: **NOT RUN** — هیچ محیط مرورگر-محور و تغییر قابل‌مشاهده‌ای وجود ندارد؛ این ثبت، نه رد‌شدن یا پذیرش است). **الزام release-quality بودن عملکرد و صفحۀ‌های نمایندۀ اندازه‌گیری: §19.4**.

**۱۰.۲ اصول الزامی:**

- **Mobile-first اولویت‌بندی محتوا** در هر بلوک: چه چیزی در ۳۹۰px باقی می‌ماند و به‌ترتیب چه می‌آید؛ حذف = حذف محتوا، نه جمع‌شدن بی‌نظم.
- **هیچ سرریز افقی** در هیچ viewport/صفحه‌ای (آزمون: scrollWidth ≤ clientWidth در viewportهای مرجع؛ جدول/کارت‌های بزرگ‌نما باید fallback داشته باشند).
- **اهداف لمسی** کافی برای nav/CTA/toggle؛ فاصلهٔ کلیکی مناسب در نوار فرم‌ها.
- **خط خوانا:** measure محدود در موبایل/تبلت؛ headingها با clamp متناسب (مقادیر → design system).
- **ترتیب محتوا در موبایل:** A → B → C (رسانه زود، پس از hero) — چیدمان دوبلوک‌ای در موبایل مجاز است **به شرط حفظ سلسله‌مراتب روایی A–I**؛ «فقط کوچک‌کردن Desktop» ممنوع (ROADMAP §13).
- **Mobile nav:** الگوی بخش ۶.۳ (drawer + CTA اول؛ بدون mega-menu؛ بدون tabs/زبان/جست‌وجو).
- **Media scaling:** Screenshotها fluid با max-width قاب؛ نسبت‌های مجاز در قاب (بخش ۱۱)؛ crop موبایل معنا را خراب نکند (نسخۀ crop اختصاصی فقط در صورت نیاز واقعی، نه همیشه).
- **جدول/مقایسه fallback:** card-stacking یا scroll-سازگار با affordance واضح؛ بدون table ریز و بدون overflow.
- **CTA دیدنی:** در موبایل، CTA اصلی پس از hero قابل‌دسترس (persistent مفهومی ۶.۳) **بدون** چسبندگی مزاحم روی فرم/فوتر CTA خودِ صفحهٔ دمو؛ در صفحهٔ `Demo` هیچ sticky اضافه‌ای (فرم، خودش CTA است).
- **RTL × Responsive:** چیدمان‌های RTL در هر breakpoint بازبینی مستقل (flow، فرم‌ها، stepper، breadcrumb).

---

## 11. قرارداد رسانه (Media Contract)

1. **اولویت مطلق: Screenshot/Video واقعی محصول CPMS** (انتظار مالک در آینده — ROADMAP §16)؛ تا تأمین، هیچ جایگزین گرافیکیِ «شبیه‌سازِ محصولِ واقعی» قابل انتشار نیست.
2. **داده:** فقط **سنتتیک/Demo**؛ **هیچ PHI/اطلاعات بیمار واقعی** در هیچ Screenshot/Video/تصویر پس‌زمینه‌ای (AGENTS §6 + ROADMAP §16). بازنمایی‌های نام/شماره پرونده/تاریخ در تصاویر باید آشکارا demo-like باشند.
3. **نگاشت ادعا:** هر تصویر باید به **قابلیت verified** نگاشت شود (Product Truth Inventory ↔ media registry). تصویرِ یک جریان تأییدنشده = تصویر قابل‌انتشار نیست.
4. **فرمت/کارایی:** WebP/AVIF (در صورت سازگاری) + fallback؛ ابعاد واقعی؛ `loading="lazy"` خارج از first-view؛ بدون Hero video با Autoplay سنگین؛ ویدیو فقط click-to-load با poster (ROADMAP §14/§16).
5. **Poster/thumbnail:** poster اختصاصیِ هر ویدیو (تمیز، بدون متن ریز)؛ thumbnailهای قابل‌اسکن برای Tour/بخش‌های ویدیو-محور.
6. **Alt text:** مسئولیت نویسندهٔ محتوا؛ فارسی، توصیفیِ «چه نمای کاری‌ای است»؛ alt تکرارِ caption یا «screenshot» خالی ممنوع؛ تصاویر دکوراتیوِ واقعاً تزئینی alt تهی.
7. **Caption:** هر Screenshot باید Caption/زمینه داشته باشد (نقش/نما/مرحلۀ workflow).
8. **Naming/aspect-ratio:** الگوی فایل (internal): `cpms-<area>-<view>-<target>-v<n>.<ext>` (مثال ساختاری، نه asset واقعی)؛ نسبت‌های مجاز تصاویر محصول در قاب: **16:10** (desktop workspace پیش‌فرض)، **4:3** (فرم/پرونده)، **9:16 یا 390-scale crop** (نمای موبایل، فقط اگر واقعاً در محصول وجود دارد — `PRODUCT-TRUTH` mobile-app claim در فهرست ممنوعه: پس **اسکرین‌شات «اپ موبایل» جعلی ممنوع**)؛ مقادیر برش/نسخه در asset registry.
9. **Placeholderهای هدف (TARGET placeholders):** هر جای رزرو رسانه‌ای باید با مارکر داخلی `[TARGET — NOT PUBLICATION-APPROVED]` (کلاس/کامنت قابل‌جست‌وجو مثل `cpms-target-placeholder`) علامت بخورد؛ **هرگز** نباید در نام فایل، alt، caption، preview یا DOM عمومی «واقعیت محصول» را وانمود کند (قاعده Placeholder `PRODUCT-TRUTH §5`). یک asset ساختگیِ UI که با قابلیت تحویل‌شده اشتباه شود **ممنوع است** (ROADMAP §16).
10. **Asset registry (artifact آینده):** هر فایل media ↔ capability id ↔ وضعیت Product Truth ↔ مجوز انتشار ↔ مسیر؛ بدون registry، media وارد staging نمی‌شود.

---

## 12. معماری اعتماد (Trust Architecture)

**اصل: اعتماد از شاهد می‌آید، نه از شعار.** سلسله‌مراتب `DECIDED` (ROADMAP §16): تناسب جریان‌کاری ← شفافیت داده/دسترسی ← Setup/Training/Support.

**۱۲.۱ منابع اعتماد مجاز در آینده (ترتیب = ترتیب Home-G):**

| منبع | مبنای انتشار |
|---|---|
| Real product (screenshots/workflow walkthrough) | MEDIA REQUIRED + نگاشت به capability verified |
| توضیح شفاف مکانیزم‌های داده/دسترسی (scoped access، نقش‌ها، تفکیک اطلاعات کلینیک) | فقط توصیف «چگونه» در حد `PRODUCT-TRUTH §3 #4/#5/#6` — **بدون** زبان مطلق امنیت، **بدون** Compliance/Certification |
| حقایق Setup/Training/Support | BUSINESS INPUT REQUIRED + REQUIRES PRODUCT VERIFICATION؛ «۲۴/۷» و SLA **ممنوع بدون سند** (`PRODUCT-TRUTH §4`) |
| Customer evidence (stories/testimonials/logos) | فقط با شواهد واقعی و اجازهٔ انتشار — CONDITIONAL (بخش ۴.۳) |

**۱۲.۲ ممنوعیات مطلق (بازتأیید قواعد موجود، نه قانون جدید):** لوگوی ساختگی؛ testimonial ساختگی؛ آمار/شمارنده‌های ساختگی (نصب، مشتری، رزرواسیون)؛ گواهی/استاندارد ساختگی؛ «trusted by N clinics»؛ هرگونه counter — **NOT ALLOWED** (AGENTS §6، ROADMAP §16، `PRODUCT-TRUTH §4`).

**۱۲.۳ جای‌گذاری در IA:** trust در هر صفحه Core به‌شکل بلوک‌های کوچک متنی + صفحهٔ Security & Data Access + FAQ، نه به‌شکل «دیوار گواهی‌ها». هر claim در این بلوک‌ها با همان Content Status برچسب می‌خورد.

---

## 13. مسیر CTA / Lead Journey

**۱۳.۱ تبدیل اصلی — DECIDED:** درخواست دمو/مشاوره. Journey خطی و ساده:

`Landing/Content → Understand Fit → Product Evidence → Objection Resolution → Demo Form → Confirmation / Next-step state`

| مرحله | صفحات/بلوک‌ها | قرارداد |
|---|---|---|
| ۱ Landing/Content | Home، Feature/Solution، Blog | هر صفحه یک CTA اصلی با مقصد ثابت `/demo/` (متن → مرحلهٔ کپی) |
| ۲ Understand Fit | Product Overview، Solutions، roles (Home E)، FAQ | تناسب بدون اغراق؛ حذف اصطکاک زبانی |
| ۳ Product Evidence | Home C/D، media frames، (آینده) tour | media طبق بخش ۱۱؛ بدون «دموی ساختگی» |
| ۴ Objection Resolution | Home H، FAQ page، Security page، Support | پاسخ‌ها از سقف ادعای صفحات مقصد عبور نمی‌کنند |
| ۵ Demo Form | `/demo/` | فقط فرم کوتاه + مسیر جایگزین تماس (Contact) |
| ۶ Confirmation | success state | «چه اتفاقی بعد می‌افتد + بازۀ زمانی تماس» **فقط با تصمیم واقعی Sales** — BUSINESS INPUT REQUIRED (SLA/وعدۀ ساختگی ممنوع) |

**۱۳.۲ اصل فرم: حداقل فیلدهای ضروری**

- مجموعهٔ پیشنهادیِ ROADMAP §8 (نام، موبایل، نام کلینیک، نوع مرکز، تعداد پزشکان، تعداد موقعیت‌ها، شهر، توضیحات، زمان تماس) به‌عنوان **superset کاندیدا** حفظ می‌شود؛ **فیلدهای الزامی نهایی = BUSINESS INPUT REQUIRED** (Sales owner + triage نیازها) — پیشنهاد معماری این سند: حداکثر «نام، موبایل/ایمیل، نام کلینیک، تعداد پزشکان (تخمینی)، توضیح» و بقیه optional/پنهان در مرحلهٔ تماس.
- **هرگز اطلاعات پزشکی/بیمار/PHI در فرم درخواست نشود** (فیلد توضیح باید با راهنمای متنی این را محدود کند).

**۱۳.۳ حالات/الزامات آینده (همه باید spec شوند، هیچ‌کدام در این Slice پیاده‌سازی نمی‌شوند):**

validation (server-side + پیام‌های دسترس‌پذیر)، spam protection (متناسب با privacy؛ انتخاب ابزار = فاز محیط)، privacy disclosure + رضایت (LEGAL REVIEW REQUIRED؛ Consent مبنای صریح می‌خواهد)، success state، failure state + مسیر جایگزین، مقصد Lead/مالک پیگیری/retention (BUSINESS INPUT REQUIRED). الزامات فنی فرم ROADMAP §8 بدون تغییر حاکم است.

**۱۳.۴ صریحاً تعلیق‌شده:** انتخاب CRM، ابزار Analytics/event schema، اتوماسیون — **Do NOT choose CRM/analytics now** (ROADMAP §15: DECIDED برای عدم انتخاب در این مرحله).

---

## 14. اولویت صفحات برای پیاده‌سازی (آینده — پس از پذیرش Foundation)

ترتیب sliceها؛ هر مورد **یک PR/Slice محدود**، نه بستهٔ بزرگ:

1. **Global Design System** (tokenها + کامپوننت‌ها + states — بخش ۸؛ خروجی: spec مصوب + Milestone A visual)
2. **Shell:** header/footer/navigation + RTL/responsive foundation (الگوهای بخش ۶/۹/۱۰)
3. **Homepage** (بلوک‌های A–I؛ Gate A در ROADMAP §18)
4. **Product Overview**
5. **Demo / Consultation** (page states طبق ۱۳.۳ بدون tooling)
6. **Feature/Workflow pages با بالاترین ارزشِ verified** (به‌ترتیب تأیید `PRODUCT-TRUTH`، نه به‌ترتیب تمایل بازاریابی؛ الگوی صفحه ROADMAP §5.2)
7. **Solutions** (hub → segmentها در حد مجاز)
8. **Trust / Security & Data Access / Support / FAQ**
9. **Resources/Blog** (فقط پس از شرط بخش ۴.۲)
10. **Legal/Utility** (Privacy/Terms پس از legal review؛ 404؛ sitemap/robots در فاز محیط)

قواعد: عدم ساخت همهٔ صفحات در یک PR؛ هر slice DoD متناسب با نوعش (ROADMAP §19)؛ تغییر ترتیب = تصمیم Website Director با ثبت در مستندات، نه silent drift.

---

## 15. مدل وضعیت محتوا (Content Status Model) — مکمل Product Truth

**قاعده:** هر بلوک محتواییِ برنامه‌ریزی‌شده **باید** یکی از پنج برچسب بخش ۰.۱ را داشته باشد؛ بلوک بدون برچسب = بازبینی‌نشده = قابل‌انتشار نیست. این مدل **مکمل** `docs/PRODUCT-TRUTH.md` است و جایگزین آن نمی‌شود:

- وضعیت محتوا **سقف ادعا را تغییر نمی‌دهد** — حتی `VERIFIED COPY` باید از Claim-Control عبور کند؛
- `TARGET — NOT PUBLICATION-APPROVED` معادل دقیقِ قاعدهٔ Placeholder در `PRODUCT-TRUTH §5` است (با همان ممنوعیت‌ها: نه در نام، نه Draft، نه Preview به‌عنوان «تأییدشده» جلوه کند)؛
- `MEDIA REQUIRED` / `BUSINESS INPUT REQUIRED` / `LEGAL REVIEW REQUIRED` **blockerهای انتشار** همان بلوک‌اند، نه کل صفحه؛
- در QA محتوای هر PR پیاده‌سازی، فهرست برچسب‌ها به‌عنوان جدول تحویل ارائه می‌شود؛ «تبديلِ» هر برچسبِ غیر VERIFIED به copy واقعی، نیازمند مدرک/تصمیم ثبت‌شده است — نه ادعای نویسنده.

**کاربرد نمونه در این قرارداد (همان برچسب‌ها):** Home A = TARGET + MEDIA REQUIRED؛ B = TARGET (انتشار مشروط به نگاشت راه‌حل)؛ C/D/E/F = ساختار رزور، متن/رسانه مشروط به Product Truth؛ G = ترکیبی (REVERIFY برای بخش مکانیزم، BUSINESS INPUT برای بخش Support)؛ H = TARGET؛ I = ساختار DECIDED + کپی TARGET. هر ردیف Sitemap در ۴.۲/۴.۳/۴.۴/۴.۵ با همین برچسب‌ها وارد backlog محتوا می‌شود.

---

## 16. مایلستون‌های تأیید طراحی (Design Acceptance Milestones)

| مایلستون | دامنه | نقش |
|---|---|---|
| **Milestone A** | Design System (tokenها، کامپوننت‌ها، states) **+** جهت بصری Homepage (بلوک‌های A–I روی mock/prototype؛ ابزار/محیط مطابق فاز مربوطه) | **اولین بازبینی بصری معنادار مالک محصول**؛ تصمیم‌های کلان جهتِ طراحی در همین نقطه تثبیت می‌شوند |
| **Milestone B** | بازبینی نهایی بصری سایتِ کامل (major-site) **پیش از Public Launch**؛ منطبق بر Gate D ROADMAP §18 پس از QA/محتوا/SEO/Performance/Accessibility، با پیوست شواهد §19.6 (SEO/عملکرد) | تأیید انتشار-نزدیک؛ **جایگزین Publication Gate/Launch Truth Gate نیست** (هر دو مستقل باید عبور کنند) |

**قاعده عدم‌اذلال:** از مالک خواسته نمی‌شود هر component/هر PR را تأیید کند؛ بازبینی‌های روتین = DoD متناسب Slice + QA تیم (ROADMAP §18: «برای تغییر کوچک، تأیید دستی لازم نیست»). Gateها A–D در ROADMAP §18 به‌عنوان سازوکار بازبینی بصری حاکم‌اند؛ Milestone A در این جدول همان Gate A را با Design System یکی می‌کند و Milestone B معادل Gate D (پیش از launch) است. مایلستون‌ها لایۀ «تأیید مالک» هستند و Gates لایۀ «شواهد QA».

**مرز روشن حاکمیت (P-01):** پذیرش **این سند برنامه‌ریزی** یک gate مدیریت پروژه/حاکمیت است و **به معنای بازبینی بندبه‌بند آن توسط مالک محصول نیست**؛ تصمیم‌های روتین IA/UX/SEO/design/technical با **Website Director** است (`AGENTS §8`، ROADMAP §22). **اولین بازبینی معنادار بصری مالک محصول، ادغام‌شده در Milestone A است** (design system + جهت Homepage). پیش از آن، ارجاع به مالک فقط برای **fork واقعی کسب‌وکاری/محصولی** که با شواهد حل نمی‌شود (`AGENTS §8`). این مرز **از ارزش تأیید بصری معنادار مالک نمی‌کاهد** — Milestone A همچنان الزامی و پیش‌نیاد «پذیرفته‌شدن جهت بصری» است.

---

## 17. مسیریابی ابزار برای کارهای آینده (ارجاع، بدون تکرار)

مرجع حاکم: **`docs/AGENT-TOOLING.md`** — این بخش فقط routing است:

| نوع کار آینده | مسیر ابزار |
|---|---|
| APIهای حساس‌به‌نسخه (WP/Elementor/vendor) | **مستندات authoritative معتبر** (Context7 فقط کمکی؛ §4.1) — حدس از حافظه ممنوع |
| راهنمای UI/طراحی | UI Skills **زیرمجمعه**؛ veto به design direction این سند (§4.2) |
| کار قابل‌مشاهده (صفحه/جریان) | Playwright browser evidence **MANDATORY WHEN APPLICABLE** (§4.5)؛ این Slice: NOT RUN |
| سطح security-حساس | Review متناسب؛ Strix **فقط با اجازهٔ جداگانه صریح** (§4.3) |
| داده/architecture جایگزین | Supabase **REFERENCE ONLY**؛ معماری WP+Elementor تغییر نمی‌کند (§4.4) |
| تعریف/آستانۀ Core Web Vitals و هر metric رسمی Google | **مستندات جاری authoritative Google/web.dev مرجع است**؛ Context7 فقط retrieval-aid (§4.1)؛ عدد از حافظه ثبت نمی‌شود (§19.4) |
| Search Console / tooling Google | **عملیات فاز انتشار** (§19.7)؛ در این Slice و تا پذیرش دامنهٔ production، نصب/ساخت/پیکربندی **مجاز نیست**؛ Search Console ≠ مجوز analytics/advertising |

**در این PR هیچ ابزاری نصب/پیکربندی نشده و نصب ابزار مجاز نیست.**

---

## 18. چک‌لیست آمادگی پیاده‌سازی (Implementation-Readiness Check)

**وضعیت کلی این Slice: `IMPLEMENTATION READINESS — NOT PASSED` (صریحاً در این PR Passed نمی‌شود؛ عبور گیت‌ها تابع بررسی‌های جداگانه است).**

**۱۸.۱ آنچه این سند برای شروع طراحی/زیرساخت کافی می‌کند (Ready-by-document — یعنی «پوشش داده شد در این قرارداد»، نه «مجاز به اجرا»):**

- [x] مدل تجاری/مخاطب/تبدیل اصلی (§1) — DECIDED
- [x] قرارداد Positioning + ممنوعیت‌های زبانی (§2)
- [x] توالی پیام Home با بلوک‌های مشخص (§3)
- [x] Sitemap سه‌وضعیتی + قاعدهٔ ضدصفحه‌خالی (§4)
- [x] اصول URL/SEO-intent mapping + برچسب‌گذاری تحقیق-باز (§5)
- [x] قرارداد navigation desktop/mobile (§6)
- [x] محدودیت‌های design direction + چک‌لیست تصمیم design-system (§7–8)
- [x] قرارداد RTL/Persian و responsive/media/trust/journey (§9–13)
- [x] ترتیب اولویت صفحات و مدل وضعیت محتوا (§14–15)
- [x] مایلستون‌های تأیید (§16) و routing ابزار (§17)
- [x] قرارداد سلامت جست‌وجو / ایندکس‌پذیری / عملکرد و قواعد پذیرش Search Console (§19)

**۱۸.۲ الزامات شروع هر slice (بدون این‌ها آن slice شروع نشود) — تفکیک blocker واقعی vs launch-only:**

| # | مورد | وضعیت | نوع |
|---|---|---|---|
| R1 | پذیرش حاکمیتی این Baseline (جهت‌ها، نه جزئیات) — **gate مدیریت پروژه، نه بازبینی تک‌تک بندها توسط مالک محصول** | **OPEN** | **Blocker تا قفل شدن Milestone A**؛ تصمیم‌های روتین IA/UX/SEO/design/technical با **Website Director** است (`AGENTS §8`، ROADMAP §22) و مالک محصول فقط در fork های واقعی کسب‌وکاری/محصولی درگیر می‌شود (بخش ۱۶) |
| R2 | Phase 0 — Discovery & Repository Audit واقعی (وضعیت محیط، WordPress/Elementor availability، hosting/staging، Theme architecture decision — ROADMAP §17/§21) | **NOT DONE** | **Blocker برای «WordPress/Elementor architecture decision» و شروع محیطی؛ blocker نیست برای spec-نوشتن design-system** |
| R3 | استراتژی محیط Staging/غیرعمومی (محل نصب، access، noindex-policy implementation در فاز deployment) | **DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT** (الزام روشن، ابزار نامشخص) | **Blocker فقط برای شروع پیاده‌سازی روی محیط** — با یک تصمیم کوچک قابل بسته‌شدن |
| R4 | قواعد placeholder/media internal (این سند §0.1/§11.9 تعریف‌شده؛ asset registry + نحوهٔ مارک‌گذاری در staging) | **READY (قاعده)** / registry = خروجی slice بعدی | — |
| R5 | Sitemap/hierarchy مصوب (این سند §4 = پیشنهاد؛ تأیید نهایی با R1) | **OPEN تا R1** | Blocker کوچک |
| R6 | Conversion flow ساختاری (§13) | **READY در حد قرارداد** | — |
| R7 | الزامات launch-time سلامت جست‌وجو / SEO / عملکرد (§19): اجرای checklist روی production، شواهد CWV، عملیات Search Console | **DEFERRED — launch-time** (هیچ‌کدام الان اجرا نمی‌شود) | **Blocker برای *انتشار*، نه blocker برای شروع طراحی/زیرساخت** — اما باید از همان Slice طراحی لحاظ شوند (§19.5) |

**۱۸.۳ الزامات launch-only (عمداً Blocker شروع پیاده‌سازی نیستند):**

- تکمیل/آمادگی محصول CPMS؛ (Parallel Development — AGENTS §5)
- Product Truth نهاییِ launch + Launch Truth Gate (`PRODUCT-TRUTH §6`)
- Testimonials/Customer evidence واقعی
- تصمیم Pricing و هر صفحهٔ مبتنی‌بر آن
- Analytics production، Consent، و **هر عملیات واقعی Search Console** (verification، submission، monitoring) — فازهای ۹/۱۴ ROADMAP؛ تا Publication Gate ممنوع و در staging اجرا نمی‌شود (§19.1/§19.7)
- اجرای checklist SEO/عملکرد روی production و شواهد Core Web Vitals field — **الزام انتشار، نه آغاز طراحی** (§19.2/§19.4/§19.6)
- محتوای حقوقی تأییدشده (Privacy/Terms قبل از انتشار)
- Media واقعی محصول (قبل از انتشار صفحات evidence-محور)

**۱۸.۴ نتیجه‌گیری خوان (بدون اغراق):**

برای شروع **Design System / Foundation slice (spec-level)**: این سند + چک‌لیست §8 + §18.۱ کافی است و **منتظر امضای مالک محصول روی تک‌تک بندها نمی‌ماند** — تصمیم روتین IA/UX/SEO/design/technical با Website Director است (`AGENTS §8`). آنچه واقعاً باز است: **R2 (خروجی Phase 0 audit: وضعیت محیط + تصمیم معماری Theme)** که پیش از «تصمیم معماری WordPress/Elementor» و هر کار محیطی لازم است. **R1 یک gate حاکمیتی/مدیریت پروژه است**، نه درخواست بازبینی جزئیات سند توسط مالک؛ و در قالب **همان بازبینی بصری Milestone A** (design system + جهت Homepage، §16) جمع می‌شود. این **کاهش ارزش تأیید بصری مالک نیست**: تا تأیید Milestone A، جهت بصری «پذیرفته‌شده» علامت نمی‌خورد. **R3** فقط در لحظۀ «سایت را روی محیط بنشانیم» لازم است. **R7/§19 الزامات انتشارند و شروع کار طراحی را متوقف نمی‌کنند**، ولی اصول §19.5 باید از همان Slice طراحی لحاظ شوند. **در این PR هیچ‌یک از R1–R7 Passed نشده است** و هیچ گیتی باز نشده است. (Failure classification در صورت بلوکیدن: class **C** برای موارد محیطی یا روال بازبینی مستندات — نه regression کار جدید.)

---

## 19. قرارداد کیفیت جست‌وجو، ایندکس‌پذیری و عملکرد (Search Health / Indexability / Performance)

**الزام جدید مالک محصول (ثبت در این بازنگری):** وب‌سایت عمومی CPMS باید با **سلامت فنی جست‌وجو، عملکرد، کاربردپذیری موبایل و آمادگی Google Search Console در سطح release-quality** مهندسی و منتشر شود.

**قرارداد قابل‌اجرا (همین عبارت، مرجع است):**

- در **لحظۀ انتشار عمومی**، هیچ نقص فنیِ قابل‌اقدامِ **ناشی از خودِ وب‌سایت** در حوزه SEO/سلامت جست‌وجو نباید بدون **استثنای صریح، پذیرفته‌شده و مستند** باقی بماند؛
- سایت باید از نظر فنی **آمادۀ خزش و ایندکس** باشد؛
- عملکرد و Core Web Vitals **الزام release-quality** هستند، نه بهینۀ پس‌از‌انتشار؛
- پس از انتشار، **شواهد واقعی Search Console / field data** پایش می‌شود و یافته‌های معتبرِ قابل‌اقدام triage و رفع می‌شوند.

**مرز صریح — آنچه وعده داده نمی‌شود:** این قرارداد هیچ تضمینی برای **رتبه**، حجم ترافیک یا ایندکس‌شدن همۀ صفحات نمی‌دهد و **وعده «صفر خطا/هشدار Google برای همیشه» نمی‌دهد**. Google ممکن است warning / informational / behavioural status گزارش کند که نقص سایت نیست. تعهدِ قابل‌اجرا، **فرآیند + شواهد + triage** است، نه نتیجهٔ تضمینی در پنل Google.

**واژگان وضعیت ویژهٔ این قرارداد:**

| برچسب | معنا |
|---|---|
| `ACTIONABLE SITE DEFECT` | نقص قابل‌اقدام ناشی از سایت → باید رفع شود (launch blocker تا رفع یا استثناء) |
| `EXCEPTION — ACCEPTED & DOCUMENTED` | استثنای صریح با دلیل + پذیرنده + تاریخ + زمان بازبینی؛ بدون record، استثناء وجود ندارد |
| `GOOGLE BEHAVIOR — NOT A SITE DEFECT` | رفتاری که توسط Google تعیین می‌شود و نقص فنی سایت نیست؛ تفسیر می‌شود، رفع اجباری ندارد |
| `NOT YET AVAILABLE` | شواهد هنوز تولید نشده‌اند (مثلاً data قبل از crawl/processing) — **هرگز برابر PASS نیست** |
| `NOT RUN` | بررسی انجام نشده — **هرگز برابر PASS نیست** |

طبقات شکست A/B/C/D و قواعد شواهد بدون تغییر حاکم‌اند (`AGENTS.md §12/§13`).

---

**۱۹.۱ تفکیک Development/Staging از Public Launch (حفظ کامل سیاست موجود)**

| محیط | قرارداد |
|---|---|
| **DEVELOPMENT / STAGING** | عمداً غیرعمومی و عمداً **non-indexed** باقی می‌ماند (ROADMAP §3 و `PRODUCT-TRUTH §1` — بدون تغییر). **از پنهان‌بودن staging هیچ نتیجه‌ای دربارهٔ آمادگی SEO تولید استخراج نمی‌شود** (نه «چون staging دیده نمی‌شود پس مشکلی نیست»، نه «چون staging non-index است پس SEO خراب است»). هیچ checklist آمادگی SEO تولید روی staging به‌عنوان **شواهد launch** پذیرفته نیست؛ در staging فقط **ساختار آماده** می‌شود. |
| **PUBLIC LAUNCH** | indexability عمدیِ production **فقط پس از عبور Publication Gate** فعال می‌شود؛ همۀ checklist های SEO/عملکرد **روی دامنه و محیط واقعی production** اجرا و مستند می‌شوند. |

**روش فنی محافظت staging (noindex / احراز هویت / robots / هوست) در این سند تجویز نمی‌شود** — `DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT`، دقیقاً مطابق ROADMAP §3 و `PRODUCT-TRUTH §1` که جزئیات را به فاز Environment/Deployment واگذار کرده‌اند. **این الزام جدید هرگز مجوز public یا indexable شدن staging را نمی‌دهد.**

---

**۱۹.۲ checklist الزامات فنی جست‌وجو در Public Launch** (الزام‌های آینده؛ در این Slice هیچ‌یک اجرا/پیکربندی نمی‌شود)

| خوشه | الزامات پوشش‌داده‌شده | قرارداد |
|---|---|---|
| **۱. Indexability / Robots / Sitemap** | indexability عمدی production؛ robots policy؛ XML sitemap؛ نبود noindex تصادفی باقی‌مانده از staging؛ Search Console ownership/verification؛ sitemap submission | تصمیم **«ایندکس شو» در launch باید عمدی و مستند** باشد، نه پیش‌فرض فراموش‌شده. robots.txt تولید درست و متناظر با sitemap؛ sitemap فقط شامل URLهای **canonical، 200 و indexable** (بدون noindex/redirect/404/ staging host). هر noindex باقی‌مانده = `ACTIONABLE SITE DEFECT` مگر مستند به‌عنوان تصمیم عمدی. **مالکیت property و ارسال sitemap عملیاتِ launch هستند** (§19.7) — در زمان staging انجام نمی‌شوند. |
| **۲. Canonical / Duplicate / URL integrity** | canonical URLs؛ clean & stable URLs؛ duplicate & thin archive control؛ pagination/indexing rules؛ launch-domain consistency؛ نشتی host | یک canonical self-consistent در هر صفحه، هم‌جهت با دامنهٔ launch. الگوی URL طبق §5.1 و **پایدار**. کنترل archiveهای کم‌محتوا/duplicate (taxonomy/tag/`?orderby`/pagination) — تصمیم index/noindex + canonical هر نوع archive **در فاز محیط و بر پایهٔ مستندات جاری Google** گرفته می‌شود، نه از حافظه. یک host نهایی (protocol / www-non-www / trailing slash) تصمیم‌گرفته و یکسان در canonical، sitemap، internal link و OG. **Audit نشتی محیط:** هیچ URL مربوط به staging/dev نباید در canonical، sitemap، لینک داخلی یا متادیتای social ظاهر شود. |
| **۳. Metadata / Semantic content / Structured data** | title & meta handling؛ semantic headings & content؛ Open Graph/social metadata؛ truthful structured data؛ structured-data validation؛ alt-text process | عنوان/توضیح اختصاصی بدون duplicate (copy نهایی ← فاز SEO Foundation، `REQUIRES KEYWORD RESEARCH`). یک H1 + سلسله‌مراتب H2/H3 مطابق §5.3/§8. OG/social برای صفحات اصلی با تصویرِ واقعیِ مجاز (**placeholder در متادیتا ممنوع**). Structured data **فقط مطابق محتوای قابل‌مشاهده**؛ بدون Review/AggregateRating/Price/JobPosting یا هر نوع ساختگی. اعتبارسنجی structured data در فاز انتشار انجام و نتیجه **ثبت** می‌شود (`NOT RUN ≠ PASS`). فرآیند alt-text فارسی طبق §11.6 (توصیفی، بدون alt تهی انبوه). |
| **۴. Links / Redirects / Error states** | internal linking؛ redirects؛ 404 behavior؛ no accidental soft-404؛ crawlable navigation & content | بدون orphan page؛ هدف لینک‌ها canonical و 200 (ROADMAP §4.3). هر تغییر عمدی URL → **301** بدون chain بیش از یک hop و بدون loop؛ 302 به‌عنوان حالت دائمی ممنوع. صفحۀ ناموجود → **status 404 واقعی** + مسیر بازیابی (§4.2). **Soft-404 تصادفی ممنوع:** صفحه/فیلتر/تگِ بی‌محتوا نباید 200 ایندکس‌پذیر بدهد (ترکیب noindex عمدی + consolidate، تصمیم فاز محیط). ناوبری و محتوا باید **با لینک‌های واقعی و قابل‌خزش** باشند؛ محتوای حیاتی نه با click-to-reveal تنها، نه با JS-only render که بدون خزش JS ناپدید شود (Elementor-native-friendly). |
| **۵. Mobile usability / Transport** | mobile usability؛ HTTPS | viewport صحیح، tap targets، اندازهٔ خوانا، **هیچ سرریز افقی** (§10.2)، RTL در موبایل مستقل (§9.11). HTTPS معتبر، بدون mixed content، بدون redirect loop بین http/https. |

---

**۱۹.۳ قاعدۀ پذیرش Search Console (عملیاتی)**

**در لحظۀ انتشار:**

1. هیچ `ACTIONABLE SITE DEFECT` سطح **ERROR** ناشی از سایت نباید unresolved بماند، مگر با `EXCEPTION — ACCEPTED & DOCUMENTED` (دلیل + پذیرنده + تاریخ + زمان بازبینی)؛
2. warning / informational **تفسیر** می‌شوند، نه اینکه کورکورانه نقص تلقی یا کورکورانه نادیده گرفته شوند؛ نتیجهٔ تفسیر ثبت می‌شود؛
3. URLهای excluded/not-indexed باید **عمدی یا فهمیده** باشند؛ «نامشخص» = یک finding باز، نه وضعیت نرمال؛
4. باید **سه‌سو هم‌خوان** باشند: sitemap ↔ canonical ↔ indexability status؛
5. **دسترسی‌پذیری شواهد:** شواهد واقعی Search Console تنها پس از مالکیت + انتشار عمومی + crawl + processing وجود پیدا می‌کند؛ در فاصلهٔ «منتشر شد ولی data نیامده»، وضعیت صحیح **`NOT YET AVAILABLE`** است و تبدیل آن به PASS ممنوع است.

**پس از انتشار (چرخۀ پایش — سازوکار و دوره در فاز محیط تعیین می‌شود):**

coverage/indexing · پردازش sitemap · enhancement/structured-data findings در صورت کاربرد · گزارش‌های HTTPS/security-related search در دسترس · **Core Web Vitals field data وقتی داده آمد** · هر anomaly معنادار در crawl/index.

در هر یافته: تشخیص اینکه **نقص سایت** است یا **رفتار مورد انتظار Google** (`GOOGLE BEHAVIOR — NOT A SITE DEFECT`)؛ فقط اولی triage و رفع می‌شود.

---

**۱۹.۴ قرارداد عملکرد / Core Web Vitals (release requirement)**

- **هدف:** دستیابی به طبقه‌بندی **«Good» Core Web Vitals طبق تعریف جاری Google** روی صفحات critical نماینده، **هرگاه قابل‌اندازه‌گیری باشد**.
- **ممنوعیت hard-code:** آستانه‌ها و تعریف metricها **از حافظهٔ مدل در این سند ثبت نمی‌شوند**. پیش از شروع پیاده‌سازی/پذیرش عملکرد، **مستندات جاری authoritative گوگل/web.dev** باید consulted شوند؛ **Context7 فقط برای retrieval کمک می‌کند و مرجع نهایی خودِ مستندات رسمی Google/web.dev است** (`AGENT-TOOLING §4.1`). اگر مستندات قابل‌دستیابی نبود: `NOT RETRIEVED` ثبت شود، نه پرکردن با عدد.
- **مجموعۀ اندازه‌گیری (نماینده، الزامی):** ۱) Home ۲) Product Overview ۳) یک صفحۀ Feature نماینده ۴) Demo/Consultation ۵) یک صفحۀ media-heavy محصول/دمو.
- **سنجه‌ها:** LCP · INP · CLS · TTFB (به‌عنوان زمینه/context) · transfer size · request count · حجم CSS/JS · font loading · responsive image loading · هزینهٔ third-party script · DOM complexity.
- **روش:** **lab measurement روی محیط production-like نماینده پیش از launch** + **field / Search Console / CrUX evidence پس از launch، هنگامی که داده موجود شد**.
- **قواعد:** localhost/Lighthouse عدد را به‌عنوان **شاهد production** جا نزنید (`AGENTS §12`)؛ **دنبال‌کردن synthetic score به بهای usability ممنوع**؛ بودجۀ عددی Performance همچنان تا وجود محیط نماینده + baseline **Unknown** و موکول (ROADMAP §14/§21 بدون تغییر).

---

**۱۹.۵ اصول مهندسی عملکرد (بارِ این اصول: Design System، Foundation، Elementor، صفحات)**

بار اولیۀ کم · محدود بودن خانوادۀ فونت و تعداد وزن‌ها · **فونت فارسی بهینه** (subset، self-host، وزن‌های لازم، `font-display` هوشمند — §8) · تصاویر responsive · WebP/AVIF در جای مناسب · **lazy loading زیر fold** · بدون hero video با autoplay سنگین · ویدیو با poster/thumbnail-first (§11) · حداقل third-party script · **بدون icon-font پرهزینه** (SVG/inline بر اساس icon policy §8) · CSS/JS/asset مشروط · **DOM محدود و منظم در Elementor** · **پرهیز از add-on pack های غیرضروری Elementor** · پرهیز از کتابخانۀ انیمیشن بدون ارزش روشن (§7/§8) · **سازگاری با cache/CDN** (انتخاب provider **نمی‌شود** — `DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT`) · **ممنوعیت «سوپ اسکریپت بازاریابی»**: هر اسکریپت شخص ثالث باید دلیل، مالک و سنجهٔ هزینه داشته باشد.

**هم‌راستایی:** این اصول با الزامات کیفی ROADMAP §14 یکسان‌اند و در §8 (design system) / §10 (responsive) / §11 (media) همین سند به‌عنوان قید طراحی اعمال می‌شوند؛ یعنی **عملکرد از تصمیم‌های طراحی شروع می‌شود، نه از clean-up آخر**.

---

**۱۹.۶ شواهد لازم برای پذیرش SEO/عملکرد (آینده — الگوی ثبت)**

**پیش از انتشار:** محیط production-like نماینده · audit crawl/indexability · اعتبارسنجی sitemap/robots/canonical · اعتبارسنجی structured data در صورت استفاده · real-browser responsive checks (الزام viewport §10.1؛ ابزار: `AGENT-TOOLING §4.5`) · اندازه‌گیری عملکرد روی صفحات §19.4 · نبود خطای critical console/network · بررسی broken link/redirect · **placeholder audit** (مارک‌های `TARGET — NOT PUBLICATION-APPROVED` طبق §11.9 باید صفر یا مستند باشند).

**پس از انتشار:** تأیید دامنهٔ production · **تأیید مالکیت property در Search Console** · شواهد ارسال sitemap · پایش indexing/crawl · پایش **Core Web Vitals field data** هنگامی که داده در دسترس شد.

**قاعدۀ ثبت:** هر مورد یا شواهد (با SHA/تاریخ/ابزار) دارد یا **`NOT RUN` / `NOT AVAILABLE`**؛ هیچ‌کدام PASS نمی‌شود. گزارش‌ها در قالب پیوست B ROADMAP ارائه می‌شوند.

---

**۱۹.۷ مرز ابزار و حریم خصوصی دربارهٔ Search Console**

- **در این PR هیچ ابزار Google نصب/پیکربندی نمی‌شود**؛ هیچ حساب، property، verification token یا tag ساخته و افزوده نمی‌شود.
- استفادۀ نهایی از Search Console مستلزم: **دامنۀ production تأییدشده توسط مالک محصول** · مالکیت/دسترسی مناسب و مشخص‌صاحب · **مدیریت امن credential/secret (privacy/security-safe، خارج از Repository)** · **هیچ credential یا verification secret در Git commit نمی‌شود** (قاعده `AGENT-TOOLING §9`).
- **Search Console مجوز analytics یا advertising نیست.** این الزام هیچ‌یک از Google Analytics، Tag Manager، ads، pixel یا cookie را authorize نمی‌کند و هیچ مجوز ضمنی برای آن‌ها ایجاد نمی‌کند؛ انتخاب/فعال‌سازی آن‌ها تصمیم جداگانه و همچنان `DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT` (ROADMAP §15 — DECIDED: در این مرحله هیچ ابزاری انتخاب نمی‌شود) و در صورت پذیرش، مستلزم consent/privacy review مستقل + `LEGAL REVIEW REQUIRED` است.

---

**۱۹.۸ آنچه این بخش مجاز نمی‌کند**

هیچ پیاده‌سازی، پیکربندی، نصب ابزار، ساخت property، یا تنظیم indexability در این Slice انجام نمی‌شود؛ **نه Implementation Gate و نه Publication Gate Passed نشده‌اند**؛ هیچ عدد CWV/عملکرد/حجم جست‌وجو در این سند ابداع نشده است؛ staging همچنان عمداً non-index است و این بخش آن را public نمی‌کند.

---

## 20. شواهد این Slice (Evidence)

| فیلد | مقدار |
|---|---|
| Repo root | `bia2on2on/Site-p-doctor-` (این checkout) |
| Base/live main در زمان نوشتن | `9ff996e22c777c67371b9d47f83bfbf1fce901dc` (merge PR #2) |
| Open PRs پیش از شروع | هیچ (#1, #2 MERGED) — بدون کار موازی تکراری |
| Working tree پیش از شروع | clean، بدون untracked |
| اسناد خوانده‌شده در revision زنده | `AGENTS.md`, `docs/ROADMAP.md`, `docs/PRODUCT-TRUTH.md`, `docs/AGENT-TOOLING.md` |
| تغییرات (بازنگری ۲) | `docs/SITE-ARCHITECTURE.md`: افزودن §19 و شفاف‌سازی §3.1/§10.1/§16/§17/§18 + شماره‌گذاری مجدد Evidence به §20 · `docs/ROADMAP.md`: علامت‌گذاری مشروط Pricing Preview در §7.10 (P-02) + یک ارجاع حداقلی پس از جدول فازها — **هیچ فاز/Gate/تصمیمی بازنویسی نشد** |
| ابزار Google | هیچ نصب/پیکربندی/حساب/property/verification token/analytics انجام **نشده**؛ فقط الزامات آینده در §19 ثبت شد |
| پیش از این بازنگری | PR #3 باز و MERGEABLE؛ head مرورشده `a0c4c1a4d0ea9277372959d60d4cab6ab24e01cc` — SHA gate PASS (تطابق با مقدار مورد انتظار)؛ amendment روی همان branch، بدون rebase/force/duplicate PR |
| NOT RUN | هر browser/Playwright/security/runtime بررسی، و هر اندازه‌گیری CWV/Lighthouse/SEO audit — به‌دلیل نوع Slice مستنداتی و نبود محیط؛ **هیچ عدد یا نتیجه‌ای ابداع نشد**؛ هیچ‌کدام به PASS تبدیل نشده |
| Product claims | هیچ ادعای قابلیت جدید در این سند بیان **نشده**؛ همهٔ ارجاعات capability به snapshot ثبت‌شدهٔ `PRODUCT-TRUTH §2/#3` با همان سقف `REVERIFY BEFORE PUBLIC LAUNCH` |

**Change log**

| تاریخ (UTC) | محرک | خلاصه |
|---|---|---|
| 2026-09-27 | الزام جدید مالک دربارهٔ کیفیت جست‌وجو/عملکرد + رفع findings مرور PR (P-01، P-02) | افزودن §19 (search health / indexability / CWV / Search Console acceptance + staging/launch تفکیک)، افزودن R7 به §18.۲، شفاف‌سازی حاکمیت R1/Milestone A (P-01)، هم‌راستاسازی تعلیق Pricing با ROADMAP §7.10 (P-02)؛ بدون پیاده‌سازی، بدون ابزار، بدون عدد ابداعی |
| 2026-09-27 | دستور «یک PR مستندات محدود: قرارداد IA + Messaging + Design Direction» | اولین نسخه: §0 واژگان، §1 مدل تجاری، §2 Positioning، §3 Home A–I، §4 Sitemap سه‌وضعیتی، §5 URL/SEO-intent، §6 Navigation، §7–8 Design، §9 RTL، §10 Responsive، §11 Media، §12 Trust، §13 Journey، §14–16 Priority/Status/Milestones، §17 Tooling routing، §18 Readiness (NOT PASSED)، §19 شواهد |
